interface University {
  name: string;
  country: string;
  alpha_two_code: string;
  'state-province': string | null;
  domains: string[];
  web_pages: string[];
}

// Custom Sri Lankan institutes not always in the API
const SRI_LANKAN_INSTITUTES: University[] = [
  {
    name: 'Sri Lanka Institute of Information Technology (SLIIT)',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['sliit.lk'],
    web_pages: ['https://www.sliit.lk'],
  },
  {
    name: 'Institute of Java and Software Engineering (IJSE)',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['ijse.lk'],
    web_pages: ['https://www.ijse.lk'],
  },
  {
    name: 'NSBM Green University',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['nsbm.ac.lk'],
    web_pages: ['https://www.nsbm.ac.lk'],
  },
  {
    name: 'IIT (Informatics Institute of Technology)',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['iit.ac.lk'],
    web_pages: ['https://www.iit.ac.lk'],
  },
  {
    name: 'NIBM (National Institute of Business Management)',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['nibm.lk'],
    web_pages: ['https://www.nibm.lk'],
  },
  {
    name: 'ANC Education',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['anc.edu.lk'],
    web_pages: ['https://www.anc.edu.lk'],
  },
  {
    name: 'Esoft Metro Campus',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['esoft.lk'],
    web_pages: ['https://www.esoft.lk'],
  },
  {
    name: 'ICBT Campus',
    country: 'Sri Lanka',
    alpha_two_code: 'LK',
    'state-province': 'Western Province',
    domains: ['icbtcampus.edu.lk'],
    web_pages: ['https://www.icbtcampus.edu.lk'],
  },
];

const API_BASE_URL = 'http://universities.hipolabs.com';

export const searchUniversities = async (
  query: string
): Promise<University[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase();

  try {
    // First, search our custom Sri Lankan institutes list
    const customSriLankanMatches = SRI_LANKAN_INSTITUTES.filter(institute =>
      institute.name.toLowerCase().includes(searchTerm)
    );

    // Then search API for Sri Lankan universities
    const sriLankaResponse = await fetch(
      `${API_BASE_URL}/search?name=${encodeURIComponent(
        query
      )}&country=Sri%20Lanka`
    );

    const sriLankaApiResults: University[] = sriLankaResponse.ok
      ? await sriLankaResponse.json()
      : [];

    // Combine custom institutes with API results (remove duplicates)
    const allSriLankanResults = [
      ...customSriLankanMatches,
      ...sriLankaApiResults.filter(
        apiResult =>
          !customSriLankanMatches.some(
            custom => custom.name.toLowerCase() === apiResult.name.toLowerCase()
          )
      ),
    ];

    // If we have enough Sri Lankan results, return them
    if (allSriLankanResults.length >= 10) {
      return allSriLankanResults.slice(0, 10);
    }

    // Otherwise, get global results and combine
    const globalResponse = await fetch(
      `${API_BASE_URL}/search?name=${encodeURIComponent(query)}`
    );

    if (!globalResponse.ok) {
      return allSriLankanResults.slice(0, 10);
    }

    const globalResults: University[] = await globalResponse.json();

    // Filter out duplicates and combine (Sri Lankan first)
    const combinedResults = [
      ...allSriLankanResults,
      ...globalResults.filter(
        global =>
          !allSriLankanResults.some(
            sl => sl.name.toLowerCase() === global.name.toLowerCase()
          )
      ),
    ];

    // Return top 10 with Sri Lankan universities/institutes prioritized
    return combinedResults.slice(0, 10);
  } catch (error) {
    console.error('Error fetching universities:', error);

    // On error, at least return matching custom institutes
    const customMatches = SRI_LANKAN_INSTITUTES.filter(institute =>
      institute.name.toLowerCase().includes(searchTerm)
    );
    return customMatches.slice(0, 10);
  }
};

export const searchUniversitiesByCountry = async (
  query: string,
  country: string
): Promise<University[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/search?name=${encodeURIComponent(
        query
      )}&country=${encodeURIComponent(country)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch universities');
    }

    const data: University[] = await response.json();

    return data.slice(0, 10);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return [];
  }
};

// Get university logo URL using Clearbit or Google favicon
export const getUniversityLogoUrl = (domain: string): string => {
  if (!domain) return '';

  // Use Clearbit Logo API (free tier)
  return `https://logo.clearbit.com/${domain}`;
};

// Fallback to Google favicon if Clearbit fails
export const getUniversityFaviconUrl = (domain: string): string => {
  if (!domain) return '';

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

export type { University };
