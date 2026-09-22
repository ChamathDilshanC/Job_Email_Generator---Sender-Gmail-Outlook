import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import clientPromise from "@/lib/mongodb";
import { getGoogleUser } from "@/lib/jobmailAuth";

function validInternalSecret(request: NextRequest) {
  const configured = process.env.JOBMAIL_INTEGRATION_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configured || !supplied) return false;
  const a = Buffer.from(configured); const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const internal = validInternalSecret(request);
  let filter: Record<string, string>;
  if (internal) {
    const accountId = new URL(request.url).searchParams.get("devresumeAccountId");
    if (!accountId) return NextResponse.json({ error: "Account required" }, { status: 400 });
    filter = { devresumeAccountId: accountId };
  } else {
    const user = await getGoogleUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    filter = { jobmailUserId: user.id };
  }
  const client = await clientPromise;
  const connection = await client.db("job_email_generator").collection("devresume_connections").findOne(filter, { projection: { _id: 0, jobmailEmail: 1, connectedAt: 1 } });
  return NextResponse.json({ connected: !!connection, email: connection?.jobmailEmail || null, connectedAt: connection?.connectedAt || null });
}
