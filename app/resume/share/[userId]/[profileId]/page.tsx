'use client';

import {
  AtsTheme,
  generateAtsResumeHtml,
} from '@/lib/atsPdfGenerator';
import { ResumeData } from '@/lib/resumeDataService';
import { Loader2, Sparkles } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function PublicShareableResumeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;
  const profileId = (params?.profileId as string) || 'default';
  const selectedTheme = (searchParams?.get('theme') as AtsTheme) || AtsTheme.MODERN;

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchResume = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/resume?userId=${encodeURIComponent(userId)}&profileId=${encodeURIComponent(
            profileId
          )}`
        );
        const data = await res.json();
        if (data?.resume) {
          setResumeData(data.resume);
        } else {
          setError('Resume not found or has been removed.');
        }
      } catch (err) {
        console.error('Error fetching shareable resume:', err);
        setError('Failed to load this resume.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [userId, profileId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-800 p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#3b3be3] mb-3" />
        <p className="text-sm font-medium text-gray-600">Loading Resume...</p>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-100">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Not Found</h1>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          {error || 'This resume link may be invalid or no longer exists.'}
        </p>
      </div>
    );
  }

  const previewHtml = generateAtsResumeHtml(resumeData, selectedTheme);

  return (
    <main className="w-full min-h-screen bg-white">
      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
    </main>
  );
}

export default function PublicShareableResumePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-800 p-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#3b3be3] mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading Resume...</p>
        </div>
      }
    >
      <PublicShareableResumeContent />
    </Suspense>
  );
}
