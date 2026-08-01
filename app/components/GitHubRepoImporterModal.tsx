'use client';

import { Project } from '@/app/models/Project';
import {
  extractGitHubUsername,
  GitHubRepo,
  mapGitHubRepoToProject,
} from '@/lib/githubApiClient';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Code2,
  ExternalLink,
  GitFork,
  Github,
  Loader2,
  Pencil,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface GitHubRepoImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProjects: (projects: Project[]) => void;
  initialGithubUrl?: string;
}

export default function GitHubRepoImporterModal({
  isOpen,
  onClose,
  onImportProjects,
  initialGithubUrl = '',
}: GitHubRepoImporterModalProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [customProjectsMap, setCustomProjectsMap] = useState<Map<number, Project>>(
    new Map()
  );

  useEffect(() => {
    if (initialGithubUrl && !inputUrl) {
      setInputUrl(initialGithubUrl);
    }
  }, [initialGithubUrl, inputUrl]);

  if (!isOpen) return null;

  const handleFetchRepos = async () => {
    const cleanUser = extractGitHubUsername(inputUrl);
    if (!cleanUser) {
      setErrorMsg('Please enter a valid GitHub username or profile URL.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/github/repos?username=${encodeURIComponent(cleanUser)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch repositories.');
      }

      setRepos(data.repos || []);
      // Auto-select non-fork repos with stars or descriptions by default
      const defaultSelected = new Set<number>();
      (data.repos || []).forEach((repo: GitHubRepo) => {
        defaultSelected.add(repo.id);
      });
      setSelectedRepoIds(defaultSelected);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Error fetching GitHub repositories.'
      );
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectRepo = (id: number) => {
    const next = new Set(selectedRepoIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRepoIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedRepoIds.size === filteredRepos.length) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(filteredRepos.map(r => r.id)));
    }
  };

  const handleOpenEdit = (repo: GitHubRepo) => {
    const project = customProjectsMap.get(repo.id) || mapGitHubRepoToProject(repo);
    setEditingProject(project);
  };

  const handleSaveEdit = () => {
    if (editingProject) {
      // Find repo ID matching
      const repoId = Array.from(customProjectsMap.keys()).find(
        key => customProjectsMap.get(key)?.id === editingProject.id
      ) || parseInt(editingProject.id.split('-')[1]) || 0;

      const nextMap = new Map(customProjectsMap);
      nextMap.set(repoId, editingProject);
      setCustomProjectsMap(nextMap);
      setEditingProject(null);
    }
  };

  const handleImport = () => {
    const projectsToImport: Project[] = [];
    repos.forEach(repo => {
      if (selectedRepoIds.has(repo.id)) {
        const proj = customProjectsMap.get(repo.id) || mapGitHubRepoToProject(repo);
        projectsToImport.push(proj);
      }
    });

    if (projectsToImport.length > 0) {
      onImportProjects(projectsToImport);
      onClose();
    }
  };

  const filteredRepos = repos.filter(repo => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      repo.name.toLowerCase().includes(query) ||
      (repo.description && repo.description.toLowerCase().includes(query)) ||
      (repo.language && repo.language.toLowerCase().includes(query)) ||
      (repo.topics && repo.topics.some(t => t.toLowerCase().includes(query)))
    );
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-gray-800 text-white flex items-center justify-center font-semibold border border-gray-700 shadow-md">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  GitHub Repository Importer
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                    Auto-Fetch Repos
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter your GitHub username or profile link to pull your public repositories into your resume.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search / URL input bar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Github className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. https://github.com/ChamathDilshanC or ChamathDilshanC"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFetchRepos()}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8]"
                />
              </div>
              <button
                onClick={handleFetchRepos}
                disabled={isLoading || !inputUrl.trim()}
                className="px-5 py-2.5 bg-[#3b3be3] hover:bg-[#2929c9] dark:bg-[#818cf8] dark:hover:bg-[#6366f1] text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Fetch Repositories
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Repositories Grid Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-950 space-y-4">
            {repos.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Found {repos.length} public repositories ({selectedRepoIds.size} selected)
                  </span>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs text-[#3b3be3] dark:text-[#818cf8] hover:underline font-medium"
                  >
                    {selectedRepoIds.size === filteredRepos.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search repos by name or tech..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {repos.length === 0 && !isLoading && !errorMsg && (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                  <Code2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  No repositories fetched yet
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Enter your GitHub username or profile URL above and click <strong>Fetch Repositories</strong> to load your open-source projects.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRepos.map(repo => {
                const isSelected = selectedRepoIds.has(repo.id);
                const editedProject = customProjectsMap.get(repo.id);
                const displayTitle = editedProject ? editedProject.name : repo.name;
                const displayDesc = editedProject
                  ? editedProject.description
                  : repo.description || 'No description provided.';
                const techList = editedProject
                  ? editedProject.technologies
                  : [repo.language, ...(repo.topics || [])].filter(Boolean) as string[];

                return (
                  <div
                    key={repo.id}
                    className={`relative p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-gray-800 border-[#3b3be3] dark:border-[#818cf8] shadow-md ring-1 ring-[#3b3be3]/20'
                        : 'bg-white/80 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div>
                      {/* Checkbox Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRepo(repo.id)}
                            className="w-4 h-4 text-[#3b3be3] dark:text-[#818cf8] border-gray-300 dark:border-gray-700 rounded cursor-pointer"
                          />
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-[260px]">
                            {displayTitle}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(repo)}
                            title="Edit project details"
                            className="p-1.5 text-gray-400 hover:text-[#3b3be3] dark:hover:text-[#818cf8] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                        {displayDesc}
                      </p>

                      {/* Technologies & Topics Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {techList.slice(0, 5).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                      <div className="flex items-center gap-3">
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="w-3 h-3 fill-amber-500" />{' '}
                            {repo.stargazers_count}
                          </span>
                        )}
                        {repo.forks_count > 0 && (
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" /> {repo.forks_count}
                          </span>
                        )}
                      </div>
                      <span>
                        Updated {new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Drawer Modal */}
          {editingProject && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-2xl space-y-4">
                <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center justify-between">
                  Edit GitHub Project Details
                  <button
                    onClick={() => setEditingProject(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={editingProject.name}
                      onChange={e =>
                        setEditingProject({ ...editingProject, name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Your Role
                    </label>
                    <input
                      type="text"
                      value={editingProject.role}
                      onChange={e =>
                        setEditingProject({ ...editingProject, role: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.description}
                      onChange={e =>
                        setEditingProject({
                          ...editingProject,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingProject(null)}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#3b3be3] dark:bg-[#818cf8] rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedRepoIds.size} project{selectedRepoIds.size !== 1 ? 's' : ''} ready to import
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedRepoIds.size === 0}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#3b3be3] hover:bg-[#2929c9] dark:bg-[#818cf8] dark:hover:bg-[#6366f1] rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Import {selectedRepoIds.size} Selected Project{selectedRepoIds.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
