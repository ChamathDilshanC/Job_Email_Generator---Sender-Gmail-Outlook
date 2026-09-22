import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getGoogleUser } from "@/lib/jobmailAuth";

export const runtime = "nodejs";
let indexesEnsured = false;

async function collection() {
  const client = await clientPromise;
  const result = client.db("job_email_generator").collection("devresume_connections");
  if (!indexesEnsured) {
    indexesEnsured = true;
    await result.createIndex({ devresumeAccountId: 1 }, { unique: true, sparse: true });
    await result.createIndex({ jobmailUserId: 1 }, { unique: true });
  }
  return result;
}

export async function POST(request: NextRequest) {
  const user = await getGoogleUser(request);
  if (!user) return NextResponse.json({ error: "Sign in with Google first" }, { status: 401 });
  const { code } = await request.json().catch(() => ({}));
  if (typeof code !== "string" || (code.length < 20 && !/^\d{6}$/.test(code.trim()))) {
    return NextResponse.json({ error: "A valid DevResume code is required" }, { status: 400 });
  }
  const devResumeUrl = process.env.DEVRESUME_APP_URL;
  const secret = process.env.JOBMAIL_INTEGRATION_SECRET;
  if (!devResumeUrl || !secret) return NextResponse.json({ error: "Connection is not configured" }, { status: 503 });

  try {
    const verification = await fetch(`${devResumeUrl.replace(/\/$/, "")}/api/integrations/jobmail/connect`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });
    const payload = await verification.json().catch(() => ({}));
    if (!verification.ok || typeof payload.accountId !== "string") {
      return NextResponse.json({ error: payload.error || "Invalid or expired connection code" }, { status: 400 });
    }

    const connections = await collection();
    const existingForDevResume = await connections.findOne({ devresumeAccountId: payload.accountId });
    if (existingForDevResume && existingForDevResume.jobmailUserId !== user.id) {
      return NextResponse.json({ error: "This DevResume account is already linked to another JobMail account" }, { status: 409 });
    }
    const existingForJobMail = await connections.findOne({ jobmailUserId: user.id });
    if (existingForJobMail && existingForJobMail.devresumeAccountId !== payload.accountId) {
      return NextResponse.json({ error: "Your JobMail account is already linked to another DevResume account" }, { status: 409 });
    }
    await connections.updateOne(
      { jobmailUserId: user.id },
      { $set: { jobmailUserId: user.id, jobmailEmail: user.email, devresumeAccountId: payload.accountId, connectedAt: new Date() } },
      { upsert: true },
    );
    return NextResponse.json({ connected: true });
  } catch (error) {
    console.error("DevResume connection failed:", error);
    return NextResponse.json({ error: "Unable to connect accounts" }, { status: 502 });
  }
}
