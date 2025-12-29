// Work Experience Model
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  responsibilities: string[];
}

// Helper function to create an empty work experience
export const createEmptyWorkExperience = (): WorkExperience => ({
  id: '',
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
  responsibilities: [''],
});

// Helper function to format duration
export const formatDuration = (
  startDate: string,
  endDate: string,
  currentlyWorking: boolean
): string => {
  const end = currentlyWorking ? 'Present' : endDate;
  return `${startDate} - ${end}`;
};
