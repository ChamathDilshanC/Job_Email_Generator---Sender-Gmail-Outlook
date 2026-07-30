'use client';

import { ParsedResumeContent } from '@/lib/resumeAiParser';
import { CvFileMeta, deleteResumeCvFile, saveResumeCvFile } from '@/lib/resumeDataService';
import { showToast } from '@/lib/toast';
import { FileText, Loader2, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';

interface ResumeUploadSectionProps {
  userId: string | undefined;
  profileId: string;
  existingCv: CvFileMeta | null;
  isLoadingCv: boolean;
  onParsed: (data: ParsedResumeContent) => void;
  onCvChange: (cv: CvFileMeta | null) => void;
}

const VALID_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}

export default function ResumeUploadSection({
  userId,
  profileId,
  existingCv,
  isLoadingCv,
  onParsed,
  onCvChange,
}: ResumeUploadSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    'reading' | 'parsing' | 'saving' | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || isProcessing) return;

    if (!userId) {
      showToast('warning', 'Sign In Required', 'Please sign in to upload a resume.');
      return;
    }

    if (file.size > MAX_SIZE) {
      showToast(
        'error',
        'File Too Large',
        `"${file.name}" is ${formatFileSize(file.size)}. Maximum size is 5MB.`
      );
      return;
    }

    if (!VALID_FILE_TYPES.includes(file.type)) {
      showToast('error', 'Invalid File Type', 'Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    setIsProcessing(true);
    try {
      setProcessingStage('reading');
      const base64 = await fileToBase64(file);

      setProcessingStage('parsing');
      const parseResponse = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          data: base64,
        }),
      });
      const parsePayload = await parseResponse.json();
      if (!parseResponse.ok || !parsePayload.success) {
        throw new Error(parsePayload.error || 'Failed to read this resume.');
      }

      setProcessingStage('saving');
      const cvMeta = await saveResumeCvFile(userId, profileId, {
        fileName: file.name,
        mimeType: file.type,
        data: base64,
      });
      onCvChange(cvMeta);
      onParsed(parsePayload.resumeData as ParsedResumeContent);

      showToast(
        'success',
        'Resume Parsed',
        'Your resume was read successfully — fields below have been auto-filled. Review each step and save.'
      );
    } catch (error) {
      console.error('Error uploading/parsing resume:', error);
      showToast(
        'error',
        'Could Not Read Resume',
        error instanceof Error ? error.message : 'Please try a different file.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingStage(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleRemove = async () => {
    if (!userId) return;
    const ok = await deleteResumeCvFile(userId, profileId);
    if (ok) {
      onCvChange(null);
      showToast('success', 'CV Removed', 'The tagged resume file has been removed from this profile.');
    } else {
      showToast('error', 'Error', 'Failed to remove the resume file. Please try again.');
    }
  };

  const stageLabel =
    processingStage === 'reading'
      ? 'Reading file…'
      : processingStage === 'parsing'
        ? 'AI is reading your resume…'
        : processingStage === 'saving'
          ? 'Saving…'
          : 'Processing…';

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
              Upload your resume and let AI fill in the details
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              We&apos;ll read the file with AI and auto-fill Personal, Experience,
              Education, Projects and Skills below. The file itself is also kept
              here, tagged to this profile, so Send Email can attach it
              automatically when this profile is selected.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          isProcessing
            ? 'cursor-not-allowed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40'
            : 'cursor-pointer border-gray-300 dark:border-gray-700 hover:border-[#3b3be3] dark:hover:border-[#818cf8] hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
        }`}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          disabled={isProcessing}
        />
        {isProcessing ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-[#3b3be3] dark:text-[#818cf8]" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {stageLabel}
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-[#3b3be3] dark:text-[#818cf8]">
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PDF, DOC or DOCX &middot; Max 5MB
            </p>
          </>
        )}
      </div>

      {isLoadingCv ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Checking for a saved resume file…
        </div>
      ) : existingCv ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white dark:bg-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                {existingCv.fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(existingCv.size)} &middot; Tagged to this profile
                {existingCv.uploadedAt
                  ? ` · Uploaded ${new Date(existingCv.uploadedAt).toLocaleDateString()}`
                  : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isProcessing}
            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
            title="Remove tagged resume file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No resume file is tagged to this profile yet.
        </p>
      )}
    </div>
  );
}
