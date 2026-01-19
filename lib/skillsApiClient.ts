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
      console.error('Skills API key not found in environment variables');
      return [];
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
      console.error('Skills API request failed:', response.statusText);
      return [];
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response from skills API');
      return [];
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

    return [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}
