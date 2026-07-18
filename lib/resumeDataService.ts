import { Education } from '@/app/models/Education';
import { Project } from '@/app/models/Project';
import { SocialLinks } from '@/app/models/SocialLinks';
import { WorkExperience } from '@/app/models/WorkExperience';

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

/**
 * Save resume data to MongoDB via API
 */
export async function saveResumeData(
  userId: string | undefined | null,
  resumeData: Omit<ResumeData, 'userId' | 'lastUpdated' | 'createdAt'>
): Promise<void> {
  if (!userId) {
    throw new Error('No user logged in');
  }

  try {
    const response = await fetch('/api/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        resumeData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save resume');
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received from /api/resume');
      throw new Error('Server returned non-JSON response');
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
export async function loadResumeData(
  userId: string | undefined | null
): Promise<ResumeData | null> {
  if (!userId) {
    console.log('No user logged in, cannot load resume data');
    return null;
  }

  try {
    const response = await fetch(`/api/resume?userId=${userId}`);

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
 * Auto-save resume data with debouncing
 */
let saveTimeout: NodeJS.Timeout | null = null;

export function autoSaveResumeData(
  userId: string | undefined | null,
  resumeData: Omit<ResumeData, 'userId' | 'lastUpdated' | 'createdAt'>,
  delay: number = 2000 // 2 seconds delay
): void {
  // Clear previous timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Set new timeout
  saveTimeout = setTimeout(() => {
    saveResumeData(userId, resumeData)
      .then(() => console.log('Auto-saved resume data'))
      .catch(err => console.error('Auto-save failed:', err));
  }, delay);
}
