// Project Model
export interface Project {
  id: string;
  name: string;
  role: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  keyFeatures: string[];
  projectUrl?: string;
  githubUrl?: string;
}

// Helper function to create an empty project
export const createEmptyProject = (): Project => ({
  id: '',
  name: '',
  role: '',
  technologies: [],
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
  keyFeatures: [''],
  projectUrl: '',
  githubUrl: '',
});
