import { Education } from '@/app/models/Education';
import { Project } from '@/app/models/Project';
import { WorkExperience } from '@/app/models/WorkExperience';
import { getAuth } from 'firebase/auth';

// Resume data interface
export interface ResumeData {
  userId: string;
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
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

/**
 * Save resume data to MongoDB via API
 */
export async function saveResumeData(
  resumeData: Omit<ResumeData, 'userId' | 'lastUpdated' | 'createdAt'>
): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    const response = await fetch('/api/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        resumeData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save resume');
    }

    const data = await response.json();
    console.log('Resume saved successfully:', data);
  } catch (error) {
    console.error('Error saving resume data:', error);
    throw error;
  }
}

/**
 * Load resume data from MongoDB via API
 */
export async function loadResumeData(): Promise<ResumeData | null> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('No user logged in, cannot load resume data');
    return null;
  }

  try {
    const response = await fetch(`/api/resume?userId=${user.uid}`);

    if (!response.ok) {
      throw new Error('Failed to load resume');
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
 * Auto-save resume data with debouncing
 */
let saveTimeout: NodeJS.Timeout | null = null;

export function autoSaveResumeData(
  resumeData: Omit<ResumeData, 'userId' | 'lastUpdated' | 'createdAt'>,
  delay: number = 2000 // 2 seconds delay
): void {
  // Clear previous timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Set new timeout
  saveTimeout = setTimeout(() => {
    saveResumeData(resumeData)
      .then(() => console.log('Auto-saved resume data'))
      .catch(err => console.error('Auto-save failed:', err));
  }, delay);
}
