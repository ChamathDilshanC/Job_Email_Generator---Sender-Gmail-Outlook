'use client';

import { File, FileText, X } from 'lucide-react';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FileUploadProps {
  onFilesChange: (files: { cv: File | null; coverLetter: File | null }) => void;
  onAlert?: (
    title: string,
    description: string,
    type: 'error' | 'warning' | 'info'
  ) => void;
}

export default function JobFileUpload({
  onFilesChange,
  onAlert,
}: FileUploadProps) {
  const [cvState, setCvState] = useState<{
    file: File | null;
  }>({
    file: null,
  });

  const [clState, setClState] = useState<{
    file: File | null;
  }>({
    file: null,
  });

  const cvInputRef = useRef<HTMLInputElement>(null);
  const clInputRef = useRef<HTMLInputElement>(null);

  const validFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const handleCvFile = (file: File | undefined) => {
    if (!file) return;

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      if (onAlert) {
        onAlert(
          'File Too Large',
          `"${file.name}" is ${formatFileSize(file.size)}. Maximum size is 5MB. Please compress or reduce the file size before uploading.`,
          'error'
        );
      }
      return;
    }

    if (validFileTypes.includes(file.type)) {
      setCvState({ file });
      onFilesChange({ cv: file, coverLetter: clState.file });
    } else {
      if (onAlert) {
        onAlert(
          'Invalid File Type',
          'Please upload a PDF, DOC, or DOCX file.',
          'error'
        );
      }
    }
  };

  const handleClFile = (file: File | undefined) => {
    if (!file) return;

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      if (onAlert) {
        onAlert(
          'File Too Large',
          `"${file.name}" is ${formatFileSize(file.size)}. Maximum size is 5MB. Please compress or reduce the file size before uploading.`,
          'error'
        );
      }
      return;
    }

    if (validFileTypes.includes(file.type)) {
      setClState({ file });
      onFilesChange({ cv: cvState.file, coverLetter: file });
    } else {
      if (onAlert) {
        onAlert(
          'Invalid File Type',
          'Please upload a PDF, DOC, or DOCX file.',
          'error'
        );
      }
    }
  };

  const handleCvChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleCvFile(event.target.files?.[0]);
  };

  const handleClChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleClFile(event.target.files?.[0]);
  };

  const handleCvDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleCvFile(event.dataTransfer.files?.[0]);
  };

  const handleClDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleClFile(event.dataTransfer.files?.[0]);
  };

  const resetCv = () => {
    setCvState({ file: null });
    onFilesChange({ cv: null, coverLetter: clState.file });
    if (cvInputRef.current) {
      cvInputRef.current.value = '';
    }
  };

  const resetCl = () => {
    setClState({ file: null });
    onFilesChange({ cv: cvState.file, coverLetter: null });
    if (clInputRef.current) {
      clInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const { file: cvFile } = cvState;
  const { file: clFile } = clState;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* CV Upload */}
      <form className="w-full" onSubmit={e => e.preventDefault()}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.75rem',
            background: 'var(--bg-input)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          CV / Resume
        </h3>

        <div
          className="flex justify-center rounded-md border mt-2 border-dashed border-input px-6 py-12 cursor-pointer hover:bg-muted/50 transition-colors"
          onDragOver={e => e.preventDefault()}
          onDrop={handleCvDrop}
          onClick={() => cvInputRef.current?.click()}
        >
          <div>
            <FileText
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden={true}
            />
            <div className="flex text-sm leading-6 text-muted-foreground">
              <p>Drag and drop or</p>
              <label
                htmlFor="cv-upload"
                className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
              >
                <span>choose file</span>
                <input
                  id="cv-upload"
                  name="cv-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvChange}
                  ref={cvInputRef}
                />
              </label>
              <p className="pl-1">to upload</p>
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <span>Accepted file types: PDF, DOC or DOCX files.</span>
          <span className="pl-1 sm:pl-0">Max. size: 5MB</span>
        </p>

        {cvFile && (
          <Card className="relative mt-8 bg-muted p-4 gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Remove"
              onClick={resetCv}
            >
              <X className="h-5 w-5 shrink-0" aria-hidden={true} />
            </Button>

            <div className="flex items-center space-x-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-border">
                <FileText
                  className="h-5 w-5 text-foreground"
                  aria-hidden={true}
                />
              </span>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {cvFile?.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cvFile && formatFileSize(cvFile.size)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </form>

      {/* Cover Letter Upload */}
      <form className="w-full" onSubmit={e => e.preventDefault()}>
        <h3
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.75rem',
            background: 'var(--bg-input)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          Cover Letter
        </h3>

        <div
          className="flex justify-center rounded-md border mt-2 border-dashed border-input px-6 py-12 cursor-pointer hover:bg-muted/50 transition-colors"
          onDragOver={e => e.preventDefault()}
          onDrop={handleClDrop}
          onClick={() => clInputRef.current?.click()}
        >
          <div>
            <File
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden={true}
            />
            <div className="flex text-sm leading-6 text-muted-foreground">
              <p>Drag and drop or</p>
              <label
                htmlFor="cl-upload"
                className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:underline hover:underline-offset-4"
              >
                <span>choose file</span>
                <input
                  id="cl-upload"
                  name="cl-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={handleClChange}
                  ref={clInputRef}
                />
              </label>
              <p className="pl-1">to upload</p>
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <span>Accepted file types: PDF, DOC or DOCX files.</span>
          <span className="pl-1 sm:pl-0">Max. size: 5MB</span>
        </p>

        {clFile && (
          <Card className="relative mt-8 bg-muted p-4 gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Remove"
              onClick={resetCl}
            >
              <X className="h-5 w-5 shrink-0" aria-hidden={true} />
            </Button>

            <div className="flex items-center space-x-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-background shadow-sm ring-1 ring-inset ring-border">
                <File className="h-5 w-5 text-foreground" aria-hidden={true} />
              </span>
              <div>
                <p className="text-xs font-medium text-foreground">
                  {clFile?.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {clFile && formatFileSize(clFile.size)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
