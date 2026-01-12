// Social/Professional Links Model
export interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
  website?: string;
  other?: string;
}

// Helper function to create empty social links
export const createEmptySocialLinks = (): SocialLinks => ({
  github: '',
  linkedin: '',
  portfolio: '',
  twitter: '',
  website: '',
  other: '',
});
