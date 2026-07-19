import clientPromise from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { Collection } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PROFILE_ID = 'default';

let indexesEnsured = false;
async function ensureIndexes(collection: Collection) {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    await collection.createIndex(
      { userId: 1, profileId: 1 },
      { unique: true }
    );
  } catch (error) {
    console.error('Error ensuring resumes index:', error);
  }
}

/**
 * Legacy resume documents (created before multi-profile support) have no
 * `profileId`. Lazily fold any such document into the new shape the first
 * time it's touched, so old single-profile users keep their data without a
 * manual migration script.
 *
 * Memoized per userId for the lifetime of this warm serverless instance —
 * once a user has been checked (migrated or never needed it), skip the
 * extra findOne on every subsequent request from them.
 */
const migrationChecked = new Set<string>();
async function migrateLegacyProfile(collection: Collection, userId: string) {
  if (migrationChecked.has(userId)) return;
  migrationChecked.add(userId);

  const legacyDoc = await collection.findOne({
    userId,
    profileId: { $exists: false },
  });

  if (legacyDoc) {
    await collection.updateOne(
      { _id: legacyDoc._id },
      {
        $set: {
          profileId: DEFAULT_PROFILE_ID,
          profileName: 'Default',
          isDefault: true,
        },
      }
    );
  }
}

function toResumeResponse(doc: any) {
  return {
    ...doc,
    _id: undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      profileId: requestedProfileId,
      profileName,
      isDefault,
      resumeData,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('resumes');

    await migrateLegacyProfile(collection, userId);

    const existingCount = await collection.countDocuments({ userId });
    const isFirstProfile = existingCount === 0;
    const profileId =
      requestedProfileId || (isFirstProfile ? DEFAULT_PROFILE_ID : randomUUID());

    const setFields: Record<string, unknown> = { userId, lastUpdated: new Date() };
    if (resumeData) Object.assign(setFields, resumeData);
    if (profileName) setFields.profileName = profileName;

    // First profile a user ever creates is always the default; otherwise
    // only flip the flag when the caller explicitly asks for it.
    const makeDefault = isFirstProfile || isDefault === true;
    if (makeDefault) setFields.isDefault = true;

    if (makeDefault && !isFirstProfile) {
      // Enforce "exactly one default per user" — not atomic across
      // documents, but acceptable given a user only ever edits their own
      // profiles one at a time.
      await collection.updateMany(
        { userId, profileId: { $ne: profileId } },
        { $set: { isDefault: false } }
      );
    }

    await collection.updateOne(
      { userId, profileId },
      {
        $set: setFields,
        // Mongo rejects an update that touches the same path in both $set
        // and $setOnInsert, so only fall back to a default name here when
        // $set isn't already writing one.
        $setOnInsert: {
          createdAt: new Date(),
          ...(setFields.profileName ? {} : { profileName: 'Default' }),
          ...(makeDefault ? {} : { isDefault: false }),
        },
      },
      { upsert: true }
    );

    await ensureIndexes(collection);

    const saved = await collection.findOne({ userId, profileId });

    return NextResponse.json({
      success: true,
      message: 'Resume saved successfully',
      profile: saved
        ? {
            profileId: saved.profileId,
            profileName: saved.profileName,
            isDefault: !!saved.isDefault,
            lastUpdated: saved.lastUpdated,
          }
        : null,
    });
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json(
      { error: 'Failed to save resume' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');
    const list = searchParams.get('list') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('resumes');

    await migrateLegacyProfile(collection, userId);
    await ensureIndexes(collection);

    if (list) {
      const profiles = await collection
        .find({ userId })
        .sort({ isDefault: -1, profileName: 1 })
        .toArray();

      return NextResponse.json({
        profiles: profiles.map(p => ({
          profileId: p.profileId,
          profileName: p.profileName,
          isDefault: !!p.isDefault,
          lastUpdated: p.lastUpdated,
        })),
      });
    }

    const filter = profileId ? { userId, profileId } : { userId, isDefault: true };
    let resume = await collection.findOne(filter);

    // Fall back to any profile if no default is flagged (defensive, should
    // not normally happen once migration/creation logic runs).
    if (!resume && !profileId) {
      resume = await collection.findOne({ userId });
    }

    if (!resume) {
      return NextResponse.json({ resume: null });
    }

    return NextResponse.json({ resume: toResumeResponse(resume) });
  } catch (error) {
    console.error('Error loading resume:', error);
    return NextResponse.json(
      { error: 'Failed to load resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('resumes');

    if (!profileId) {
      // No profileId: delete every profile this user owns.
      await collection.deleteMany({ userId });
      return NextResponse.json({ success: true, message: 'All resume profiles deleted' });
    }

    const target = await collection.findOne({ userId, profileId });
    const result = await collection.deleteOne({ userId, profileId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // If the deleted profile was the default, promote another remaining one.
    if (target?.isDefault) {
      const remaining = await collection.findOne({ userId });
      if (remaining) {
        await collection.updateOne(
          { _id: remaining._id },
          { $set: { isDefault: true } }
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Resume profile deleted' });
  } catch (error) {
    console.error('Error deleting resume profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume profile' },
      { status: 500 }
    );
  }
}
