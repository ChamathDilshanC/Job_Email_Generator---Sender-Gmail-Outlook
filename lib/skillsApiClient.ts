// Job Portal Skills API Client
// Custom API for fetching job positions and required skills

interface SkillsApiResponse {
  position: string;
  skills: string[];
}

interface PositionSuggestion {
  id: number;
  title: string;
  category: string;
}

const ROLE_SKILL_FALLBACKS: Record<string, string[]> = {
  'intern software engineer': [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'REST APIs',
    'Git',
  ],
  'associate software engineer': [
    'Java',
    'Spring Boot',
    'Python',
    'SQL',
    'REST APIs',
    'Git',
  ],
  'intern devops engineer': [
    'Linux',
    'Git',
    'Docker',
    'CI/CD',
    'AWS',
    'Bash',
  ],
  'associate devops engineer': [
    'Docker',
    'Kubernetes',
    'Terraform',
    'AWS',
    'CI/CD',
    'Linux',
  ],
  'it support specialist': [
    'Windows',
    'Linux',
    'Networking',
    'Troubleshooting',
    'Active Directory',
    'ITIL',
  ],
  'software developer': [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'SQL',
    'Git',
  ],
};

const GENERIC_ROLE_SKILLS: Array<{ keywords: string[]; skills: string[] }> = [
  {
    keywords: ['devops', 'sre', 'platform', 'site reliability', 'cloud'],
    skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
  },
  {
    keywords: ['support', 'helpdesk', 'help desk', 'technical support'],
    skills: ['Troubleshooting', 'Windows', 'Linux', 'Networking', 'Active Directory', 'ITIL'],
  },
  {
    keywords: ['frontend', 'front end', 'ui developer'],
    skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Git'],
  },
  {
    keywords: ['backend', 'back end', 'api developer'],
    skills: ['Java', 'Python', 'Node.js', 'SQL', 'REST APIs', 'Git'],
  },
];

function normalizePosition(position: string): string {
  return position.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getFallbackSkillsForPosition(position: string): string[] {
  const normalized = normalizePosition(position);
  const exactMatch = ROLE_SKILL_FALLBACKS[normalized];
  if (exactMatch) return exactMatch;

  const keywordMatch = GENERIC_ROLE_SKILLS.find(group =>
    group.keywords.some(keyword => normalized.includes(keyword))
  );
  return keywordMatch?.skills || ROLE_SKILL_FALLBACKS['software developer'];
}

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_SKILLS_API_BASE_URL ||
  'https://your-project.vercel.app';
const getApiKey = () => process.env.NEXT_PUBLIC_SKILLS_API_KEY;

// Common job positions for fallback autocomplete
const commonPositions = [
  'Software Developer',
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Data Analyst',
  'Data Engineer',
  'Machine Learning Engineer',
  'AI Engineer',
  'Product Manager',
  'Project Manager',
  'UI/UX Designer',
  'Graphic Designer',
  'Web Designer',
  'Business Analyst',
  'Quality Assurance Engineer',
  'QA Tester',
  'System Administrator',
  'Network Engineer',
  'Security Engineer',
  'Cloud Engineer',
  'Database Administrator',
  'Technical Writer',
  'Scrum Master',
  'Marketing Manager',
  'Sales Manager',
  'Customer Success Manager',
];

// Fallback function for position suggestions (when API is unavailable)
function getFallbackPositionSuggestions(query: string): string[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  return commonPositions
    .filter(position => position.toLowerCase().includes(lowerQuery))
    .slice(0, 10);
}

// Get position suggestions from API (with fallback)
export async function getPositionSuggestions(query: string): Promise<string[]> {
  if (!query.trim() || query.length < 1) return [];

  try {
    const apiKey = getApiKey();

    // If no API key or base URL is placeholder, use fallback immediately
    if (!apiKey || API_BASE_URL.includes('your-project.vercel.app')) {
      return getFallbackPositionSuggestions(query);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/suggestions?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Position suggestions API request failed, using fallback');
      return getFallbackPositionSuggestions(query);
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Non-JSON response from suggestions API, using fallback');
      return getFallbackPositionSuggestions(query);
    }

    const data = await response.json();
    console.log('API Response for suggestions:', data);

    // Extract position titles from the response
    // Handle different response formats
    if (Array.isArray(data)) {
      // If it's a direct array of strings
      if (typeof data[0] === 'string') {
        return data.slice(0, 10);
      }
      // If it's an array of objects with 'title' field
      if (data[0] && data[0].title) {
        return data.map((item: PositionSuggestion) => item.title).slice(0, 10);
      }
      // If it's an array of objects with 'name' field
      if (data[0] && (data[0] as any).name) {
        return data.map((item: any) => item.name).slice(0, 10);
      }
    } else if (data.suggestions && Array.isArray(data.suggestions)) {
      const suggestions = data.suggestions;
      // Handle array of strings
      if (typeof suggestions[0] === 'string') {
        return suggestions.slice(0, 10);
      }
      // Handle array of objects
      if (suggestions[0] && suggestions[0].title) {
        return suggestions
          .map((item: PositionSuggestion) => item.title)
          .slice(0, 10);
      }
      if (suggestions[0] && (suggestions[0] as any).name) {
        return suggestions.map((item: any) => item.name).slice(0, 10);
      }
    }

    console.warn('Unknown API response format:', data);
    // If no valid data, use fallback
    return getFallbackPositionSuggestions(query);
  } catch (error) {
    console.warn('Error fetching position suggestions, using fallback:', error);
    return getFallbackPositionSuggestions(query);
  }
}

// Fetch skills for a specific position from API
export async function fetchSkillsForPosition(
  position: string
): Promise<string[]> {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      console.warn('Skills API key not found; using role skill fallback');
      return getFallbackSkillsForPosition(position);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/skills/${encodeURIComponent(position)}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Skills API request failed; using role skill fallback:', response.statusText);
      return getFallbackSkillsForPosition(position);
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Non-JSON response from skills API; using role skill fallback');
      return getFallbackSkillsForPosition(position);
    }

    const data = await response.json();

    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.skills && Array.isArray(data.skills)) {
      return data.skills;
    } else if (data.position && data.skills) {
      return data.skills;
    }

    return getFallbackSkillsForPosition(position);
  } catch (error) {
    console.warn('Error fetching skills; using role skill fallback:', error);
    return getFallbackSkillsForPosition(position);
  }
}

/**
 * Return the six highest-priority skills for a target role. The upstream API
 * order is treated as its relevance ranking; duplicate/blank values are
 * removed before the profile is updated.
 */
export async function fetchBestMatchingSkillsForPosition(
  position: string,
  limit = 6
): Promise<string[]> {
  const skills = await fetchSkillsForPosition(position);
  return Array.from(
    new Map(
      skills
        .map(skill => skill.trim())
        .filter(Boolean)
        .map(skill => [skill.toLowerCase(), skill] as const)
    ).values()
  ).slice(0, limit);
}
