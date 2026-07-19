import { Education } from '@/app/models/Education';
import { Project } from '@/app/models/Project';
import { SocialLinks } from '@/app/models/SocialLinks';
import { WorkExperience } from '@/app/models/WorkExperience';

// Resume data interface
export interface ResumeData {
  userId: string;
  profileId: string;
  profileName: string;
  isDefault: boolean;
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  socialLinks?: SocialLinks;
  workExperiences: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: {
    position: string;
    selectedSkills: string[];
  };
  lastUpdated: any;
  createdAt: any;
}

export interface ResumeProfileSummary {
  profileId: string;
  profileName: string;
  isDefault: boolean;
  lastUpdated: any;
}

export type ResumeContent = Omit<
  ResumeData,
  'userId' | 'lastUpdated' | 'createdAt' | 'profileId' | 'profileName' | 'isDefault'
>;

export interface ResumeProfileOptions {
  profileId?: string;
  profileName?: string;
  isDefault?: boolean;
}

/**
 * Save resume data to MongoDB via API. When `profileOptions.profileId` is
 * omitted, the server creates a new profile (or the user's first/default
 * profile if they have none yet).
 */
export async function saveResumeData(
  userId: string | undefined | null,
  resumeData: ResumeContent,
  profileOptions: ResumeProfileOptions = {}
): Promise<ResumeProfileSummary> {
  if (!userId) {
    throw new Error('No user logged in');
  }

  const response = await fetch('/api/resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      ...profileOptions,
      resumeData,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save resume');
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }

  const data = await response.json();
  return data.profile;
}

/**
 * Rename a resume profile without touching its content.
 */
export async function renameResumeProfile(
  userId: string,
  profileId: string,
  profileName: string
): Promise<void> {
  const response = await fetch('/api/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, profileId, profileName }),
  });
  if (!response.ok) {
    throw new Error('Failed to rename profile');
  }
}

/**
 * Mark a resume profile as the user's default (used when no profileId is
 * specified elsewhere in the app, e.g. Send Email/Templates pages).
 */
export async function setDefaultResumeProfile(
  userId: string,
  profileId: string
): Promise<void> {
  const response = await fetch('/api/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, profileId, isDefault: true }),
  });
  if (!response.ok) {
    throw new Error('Failed to set default profile');
  }
}

/**
 * Load resume data from MongoDB via API. Without `profileId`, returns the
 * user's default profile.
 */
export async function loadResumeData(
  userId: string | undefined | null,
  profileId?: string
): Promise<ResumeData | null> {
  if (!userId) {
    console.log('No user logged in, cannot load resume data');
    return null;
  }

  try {
    const query = profileId
      ? `userId=${userId}&profileId=${encodeURIComponent(profileId)}`
      : `userId=${userId}`;
    const response = await fetch(`/api/resume?${query}`);

    if (!response.ok) {
      throw new Error('Failed to load resume');
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received from /api/resume');
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();

    if (data.resume) {
      console.log('Resume data loaded successfully');
      return data.resume;
    } else {
      console.log('No resume data found for user');
      return null;
    }
  } catch (error) {
    console.error('Error loading resume data:', error);
    throw error;
  }
}

/**
 * List all resume profiles for a user (for the profile switcher).
 */
export async function listResumeProfiles(
  userId: string | undefined | null
): Promise<ResumeProfileSummary[]> {
  if (!userId) return [];

  try {
    const response = await fetch(`/api/resume?userId=${userId}&list=true`);
    if (!response.ok) {
      throw new Error('Failed to list resume profiles');
    }
    const data = await response.json();
    return data.profiles || [];
  } catch (error) {
    console.error('Error listing resume profiles:', error);
    return [];
  }
}

/**
 * Delete a single resume profile.
 */
export async function deleteResumeProfile(
  userId: string,
  profileId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/resume?userId=${userId}&profileId=${encodeURIComponent(profileId)}`,
      { method: 'DELETE' }
    );
    return response.ok;
  } catch (error) {
    console.error('Error deleting resume profile:', error);
    return false;
  }
}

/**
 * Auto-save resume data with debouncing
 */
let saveTimeout: NodeJS.Timeout | null = null;

export function autoSaveResumeData(
  userId: string | undefined | null,
  resumeData: ResumeContent,
  profileOptions: ResumeProfileOptions = {},
  delay: number = 2000 // 2 seconds delay
): void {
  // Clear previous timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Set new timeout
  saveTimeout = setTimeout(() => {
    saveResumeData(userId, resumeData, profileOptions)
      .then(() => console.log('Auto-saved resume data'))
      .catch(err => console.error('Auto-save failed:', err));
  }, delay);
}
