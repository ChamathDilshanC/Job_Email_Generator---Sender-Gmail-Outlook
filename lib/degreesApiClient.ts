// Degrees API Client
// Uses the same API infrastructure as the Skills API

interface DegreeApiResponse {
  degrees?: string[];
  results?: any[];
  data?: any[];
}

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_SKILLS_API_BASE_URL ||
  'https://your-project.vercel.app';
const getApiKey = () => process.env.NEXT_PUBLIC_SKILLS_API_KEY;

// Common degrees for fallback
const COMMON_DEGREES = [
  'Bachelor of Science (BSc)',
  'Bachelor of Arts (BA)',
  'Bachelor of Engineering (BEng)',
  'Bachelor of Technology (BTech)',
  'Bachelor of Computer Science (BCS)',
  'Bachelor of Business Administration (BBA)',
  'Bachelor of Commerce (BCom)',
  'Bachelor of Laws (LLB)',
  'Bachelor of Medicine, Bachelor of Surgery (MBBS)',
  'Master of Science (MSc)',
  'Master of Arts (MA)',
  'Master of Business Administration (MBA)',
  'Master of Engineering (MEng)',
  'Master of Technology (MTech)',
  'Doctor of Philosophy (PhD)',
  'Doctor of Medicine (MD)',
  'Diploma in Engineering',
  'Diploma in Computer Science',
  'Higher National Diploma (HND)',
  'Associate of Science (AS)',
];

// Fallback function for degree search
function getFallbackDegrees(query: string): string[] {
  if (!query || query.trim().length < 1) {
    return COMMON_DEGREES.slice(0, 10);
  }

  const lowerQuery = query.toLowerCase();
  const matches = COMMON_DEGREES.filter(degree =>
    degree.toLowerCase().includes(lowerQuery)
  );

  return matches.length > 0
    ? matches.slice(0, 10)
    : COMMON_DEGREES.slice(0, 10);
}

// Search degrees from API
export async function searchDegrees(query: string): Promise<string[]> {
  // If query is empty, return top common degrees
  if (!query || query.trim().length < 1) {
    return COMMON_DEGREES.slice(0, 10);
  }

  try {
    const apiKey = getApiKey();

    // If no API key or base URL is placeholder, use fallback immediately
    if (!apiKey || API_BASE_URL.includes('your-project.vercel.app')) {
      return getFallbackDegrees(query);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/degrees/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Degrees API request failed, using fallback');
      return getFallbackDegrees(query);
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Non-JSON response from degrees API, using fallback');
      return getFallbackDegrees(query);
    }

    const data: DegreeApiResponse = await response.json();
    console.log('Degrees API Response:', data);

    // Handle different response formats
    if (Array.isArray(data)) {
      // If it's a direct array of strings
      if (typeof data[0] === 'string') {
        return data.slice(0, 10);
      }
      // If it's an array of objects with 'name' or 'title' field
      if (data[0] && (data[0] as any).name) {
        return data.map((item: any) => item.name).slice(0, 10);
      }
      if (data[0] && (data[0] as any).title) {
        return data.map((item: any) => item.title).slice(0, 10);
      }
    } else if (data.degrees && Array.isArray(data.degrees)) {
      return data.degrees.slice(0, 10);
    } else if (data.results && Array.isArray(data.results)) {
      const results = data.results;
      if (typeof results[0] === 'string') {
        return results.slice(0, 10);
      }
      if (results[0] && (results[0] as any).name) {
        return results.map((item: any) => item.name).slice(0, 10);
      }
    } else if (data.data && Array.isArray(data.data)) {
      const results = data.data;
      if (typeof results[0] === 'string') {
        return results.slice(0, 10);
      }
      if (results[0] && (results[0] as any).name) {
        return results.map((item: any) => item.name).slice(0, 10);
      }
    }

    console.warn('Unknown degrees API response format:', data);
    return getFallbackDegrees(query);
  } catch (error) {
    console.warn('Error fetching degrees, using fallback:', error);
    return getFallbackDegrees(query);
  }
}

// Get all degrees (optional - for dropdown)
export async function getAllDegrees(): Promise<string[]> {
  try {
    const apiKey = getApiKey();

    if (!apiKey || API_BASE_URL.includes('your-project.vercel.app')) {
      return COMMON_DEGREES;
    }

    const response = await fetch(`${API_BASE_URL}/api/degrees`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch all degrees');
      return COMMON_DEGREES;
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Non-JSON response from degrees API');
      return COMMON_DEGREES;
    }

    const data = await response.json();

    // Handle response formats
    if (Array.isArray(data)) {
      if (typeof data[0] === 'string') {
        return data;
      }
      if (data[0] && (data[0] as any).name) {
        return data.map((item: any) => item.name);
      }
    } else if (data.degrees) {
      return data.degrees;
    }

    return COMMON_DEGREES;
  } catch (error) {
    console.error('Error fetching all degrees:', error);
    return COMMON_DEGREES;
  }
}

// Get degree categories (optional)
export async function getDegreeCategories(): Promise<string[]> {
  try {
    const apiKey = getApiKey();

    if (!apiKey || API_BASE_URL.includes('your-project.vercel.app')) {
      return ['Undergraduate', 'Graduate', 'Doctoral', 'Diploma', 'Associate'];
    }

    const response = await fetch(`${API_BASE_URL}/api/degrees/categories`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return ['Undergraduate', 'Graduate', 'Doctoral', 'Diploma', 'Associate'];
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Non-JSON response from degree categories API');
      return ['Undergraduate', 'Graduate', 'Doctoral', 'Diploma', 'Associate'];
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data.categories) {
      return data.categories;
    }

    return ['Undergraduate', 'Graduate', 'Doctoral', 'Diploma', 'Associate'];
  } catch (error) {
    console.error('Error fetching degree categories:', error);
    return ['Undergraduate', 'Graduate', 'Doctoral', 'Diploma', 'Associate'];
  }
}
