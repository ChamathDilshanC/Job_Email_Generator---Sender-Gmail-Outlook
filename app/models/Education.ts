export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  country?: string;
  domain?: string; // For university logo
  startDate: string;
  endDate: string;
  currentlyStudying: boolean;
  gpa?: string;
  achievements: string[];
}

export const createEmptyEducation = (): Education => ({
  id: '',
  institution: '',
  degree: '',
  fieldOfStudy: '',
  location: '',
  startDate: '',
  endDate: '',
  currentlyStudying: false,
  gpa: '',
  achievements: [''],
});

export const formatEducationDuration = (
  startDate: string,
  endDate: string,
  currentlyStudying: boolean
): string => {
  return `${startDate} - ${currentlyStudying ? 'Present' : endDate}`;
};
