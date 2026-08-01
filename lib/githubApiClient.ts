import { Project } from '@/app/models/Project';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  pushed_at: string;
  updated_at: string;
}

/**
 * Extracts a clean GitHub username from a full profile URL or raw username.
 * Examples:
 *  "https://github.com/ChamathDilshanC" => "ChamathDilshanC"
 *  "github.com/ChamathDilshanC/"      => "ChamathDilshanC"
 *  "ChamathDilshanC"                  => "ChamathDilshanC"
 */
export function extractGitHubUsername(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Match URL patterns like https://github.com/username or github.com/username
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // Remove leading @ or trailing slashes
  return trimmed.replace(/^@/, '').replace(/\/+$/, '');
}

/**
 * Converts a raw GitHub repository item into the application's Project model format.
 */
export function mapGitHubRepoToProject(repo: GitHubRepo): Project {
  // Combine primary language and topics into technologies array
  const techSet = new Set<string>();
  if (repo.language) {
    techSet.add(repo.language);
  }
  if (Array.isArray(repo.topics)) {
    repo.topics.forEach(t => {
      // Capitalize or clean topic names
      const cleanTopic = t.replace(/-/g, ' ');
      const formatted = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
      techSet.add(formatted);
    });
  }

  const startDate = repo.created_at ? repo.created_at.split('T')[0] : '';
  const endDate = repo.pushed_at ? repo.pushed_at.split('T')[0] : '';

  // Build bullet points from repo info
  const keyFeatures: string[] = [];
  if (repo.description) {
    keyFeatures.push(repo.description);
  }
  if (repo.stargazers_count > 0) {
    keyFeatures.push(`Starred by ${repo.stargazers_count} developer${repo.stargazers_count > 1 ? 's' : ''} on GitHub.`);
  }
  if (techSet.size > 0) {
    keyFeatures.push(`Built using ${Array.from(techSet).slice(0, 5).join(', ')}.`);
  }
  if (keyFeatures.length === 0) {
    keyFeatures.push('Open-source software repository hosted on GitHub.');
  }

  return {
    id: `gh-${repo.id}-${Date.now()}`,
    name: repo.name.replace(/[-_]/g, ' '),
    role: 'Creator / Developer',
    technologies: Array.from(techSet),
    startDate: startDate,
    endDate: endDate,
    currentlyWorking: false,
    description: repo.description || `Open source software project: ${repo.name}`,
    keyFeatures: keyFeatures,
    projectUrl: repo.homepage || '',
    githubUrl: repo.html_url || '',
  };
}
