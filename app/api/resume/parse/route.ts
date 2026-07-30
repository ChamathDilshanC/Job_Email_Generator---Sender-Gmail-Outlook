import { parseResumeFromPdf, parseResumeFromText } from '@/lib/resumeAiParser';
import mammoth from 'mammoth';
import { NextRequest, NextResponse } from 'next/server';

// 5MB raw -> ~6.99MB as base64. A little headroom over the client-side 5MB
// check since this is the actual enforcement point.
const MAX_BASE64_LENGTH = 7 * 1024 * 1024;

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const { fileName, mimeType, data } = await request.json();

    if (!fileName || !mimeType || !data || typeof data !== 'string') {
      return NextResponse.json(
        { error: 'A resume file (fileName, mimeType, data) is required.' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Please upload a PDF, DOC, or DOCX file.' },
        { status: 400 }
      );
    }

    if (data.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    if (mimeType === 'application/pdf') {
      const resumeData = await parseResumeFromPdf(data);
      return NextResponse.json({ success: true, resumeData });
    }

    // DOCX (and best-effort legacy .doc) — extract plain text first, since
    // Gemini's inline document input is only wired up for PDF here.
    const buffer = Buffer.from(data, 'base64');

    let text: string;
    try {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value.trim();
    } catch (error) {
      console.error('Error extracting text from DOC/DOCX:', error);
      return NextResponse.json(
        {
          error:
            "We couldn't read this .doc file. Please re-save it as PDF or DOCX and try again.",
        },
        { status: 422 }
      );
    }

    if (!text) {
      return NextResponse.json(
        {
          error:
            'No readable text was found in this file. Please upload a text-based PDF or DOCX (not a scanned image).',
        },
        { status: 422 }
      );
    }

    const resumeData = await parseResumeFromText(text);
    return NextResponse.json({ success: true, resumeData });
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to parse resume. Please try again.',
      },
      { status: 500 }
    );
  }
}
