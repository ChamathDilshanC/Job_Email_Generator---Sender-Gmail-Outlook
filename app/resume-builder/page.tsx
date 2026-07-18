'use client';

import { AuthGate } from '../components/AuthGate';
import ResumeBuilder from '../pages/ResumeBuilder';

export default function ResumeBuilderPage() {
  return (
    <AuthGate>
      <ResumeBuilder />
    </AuthGate>
  );
}
