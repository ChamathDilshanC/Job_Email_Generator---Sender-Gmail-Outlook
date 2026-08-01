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
  ChevronDown,
  Package,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/* ── language → dot-color map ── */
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  Lua: '#000080',
  R: '#198CE7',
  Scala: '#c22d40',
};

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
  const [langFilter, setLangFilter] = useState<string>('all');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    if (initialGithubUrl && !inputUrl) {
      setInputUrl(initialGithubUrl);
    }
  }, [initialGithubUrl, inputUrl]);

  /* ── Derived data (must be before early return to satisfy Rules of Hooks) ── */
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach(r => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

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

  const handleOpenEdit = (repo: GitHubRepo) => {
    const project = customProjectsMap.get(repo.id) || mapGitHubRepoToProject(repo);
    setEditingProject(project);
  };

  const handleSaveEdit = () => {
    if (editingProject) {
      const repoId =
        Array.from(customProjectsMap.keys()).find(
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
    if (langFilter !== 'all' && repo.language !== langFilter) return false;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      repo.name.toLowerCase().includes(query) ||
      (repo.description && repo.description.toLowerCase().includes(query)) ||
      (repo.language && repo.language.toLowerCase().includes(query)) ||
      (repo.topics && repo.topics.some(t => t.toLowerCase().includes(query)))
    );
  });

  const toggleSelectAll = () => {
    if (selectedRepoIds.size === filteredRepos.length && filteredRepos.length > 0) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(filteredRepos.map(r => r.id)));
    }
  };

  const selectedCount = selectedRepoIds.size;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-5xl flex flex-col max-h-[92vh] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]"
          style={{
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.95) 100%)',
          }}
        >
          {/* ── Dark mode background ── */}
          <div className="absolute inset-0 hidden dark:block rounded-2xl" style={{
            background: 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.99) 100%)',
          }} />

          {/* ═══════════════════════════════════════════════ */}
          {/* HEADER                                          */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="relative z-10 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-gray-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-3.5">
              {/* GitHub animated icon */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 dark:from-white/20 dark:via-white/10 dark:to-white/5 opacity-80 blur-sm group-hover:opacity-100 transition-opacity" />
                <div className="relative w-11 h-11 rounded-xl bg-gray-950 dark:bg-white/10 text-white flex items-center justify-center shadow-lg">
                  <Github className="w-5.5 h-5.5" />
                </div>
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  GitHub Importer
                  <span className="px-2 py-[3px] text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md shadow-sm">
                    Auto
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Fetch & import your public repositories into your resume
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* SEARCH BAR                                      */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="relative z-10 px-5 sm:px-7 py-4 border-b border-gray-200/60 dark:border-white/[0.06]">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3b3be3] dark:group-focus-within:text-[#818cf8] transition-colors">
                  <Github className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="https://github.com/ChamathDilshanC or ChamathDilshanC"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFetchRepos()}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b3be3]/20 dark:focus:ring-[#818cf8]/20 focus:border-[#3b3be3] dark:focus:border-[#818cf8] transition-all duration-200"
                />
              </div>
              <button
                onClick={handleFetchRepos}
                disabled={isLoading || !inputUrl.trim()}
                className="group relative px-6 py-3 bg-gradient-to-r from-[#3b3be3] to-[#5b5bf5] dark:from-[#818cf8] dark:to-[#6366f1] text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-[#3b3be3]/25 dark:shadow-[#818cf8]/25 hover:shadow-xl hover:shadow-[#3b3be3]/30 dark:hover:shadow-[#818cf8]/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Fetch Repos
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {errorMsg}
              </motion.div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* TOOLBAR (Filters / Search / Select All)         */}
          {/* ═══════════════════════════════════════════════ */}
          {repos.length > 0 && (
            <div className="relative z-10 px-5 sm:px-7 py-3 border-b border-gray-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Repo count badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-lg">
                  <Package className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {filteredRepos.length} repos
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    · {selectedCount} selected
                  </span>
                </div>

                {/* Select / Deselect All */}
                <button
                  onClick={toggleSelectAll}
                  className="text-[11px] font-bold text-[#3b3be3] dark:text-[#818cf8] hover:text-[#2929c9] dark:hover:text-[#a5b4fc] transition-colors px-2 py-1 rounded-md hover:bg-[#3b3be3]/5 dark:hover:bg-[#818cf8]/10"
                >
                  {selectedRepoIds.size === filteredRepos.length && filteredRepos.length > 0
                    ? '✕ Deselect All'
                    : '✓ Select All'}
                </button>

                {/* Language filter dropdown */}
                {availableLanguages.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.06] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
                    >
                      {langFilter !== 'all' && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: LANG_COLORS[langFilter] || '#6b7280' }}
                        />
                      )}
                      {langFilter === 'all' ? 'All Languages' : langFilter}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showLangDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
                        <div className="absolute top-full left-0 mt-1 z-50 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 max-h-48 overflow-y-auto">
                          <button
                            onClick={() => { setLangFilter('all'); setShowLangDropdown(false); }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors ${langFilter === 'all' ? 'font-bold text-[#3b3be3] dark:text-[#818cf8]' : 'text-gray-700 dark:text-gray-300'}`}
                          >
                            All Languages
                          </button>
                          {availableLanguages.map(lang => (
                            <button
                              key={lang}
                              onClick={() => { setLangFilter(lang); setShowLangDropdown(false); }}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors flex items-center gap-2 ${langFilter === lang ? 'font-bold text-[#3b3be3] dark:text-[#818cf8]' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: LANG_COLORS[lang] || '#6b7280' }}
                              />
                              {lang}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search repos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] transition-colors"
                  style={{ paddingLeft: '2.1rem' }}
                />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════ */}
          {/* REPOSITORY CARDS GRID                           */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-7 space-y-4" style={{
            background: 'linear-gradient(180deg, rgba(249,250,251,0.5) 0%, rgba(243,244,246,0.3) 100%)',
          }}>
            <div className="absolute inset-0 hidden dark:block" style={{
              background: 'linear-gradient(180deg, rgba(2,6,23,0.5) 0%, rgba(15,23,42,0.3) 100%)',
            }} />

            {/* Empty state */}
            {repos.length === 0 && !isLoading && !errorMsg && (
              <div className="relative z-10 text-center py-20 space-y-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <Code2 className="w-9 h-9 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  No repositories loaded
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Enter your GitHub username or profile URL and click <strong className="text-[#3b3be3] dark:text-[#818cf8]">Fetch Repos</strong> to get started.
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="h-4 w-40 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </div>
                    <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-2" />
                    <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-4" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="h-5 w-20 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="h-5 w-14 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cards grid */}
            {!isLoading && (
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRepos.map((repo, idx) => {
                  const isSelected = selectedRepoIds.has(repo.id);
                  const editedProject = customProjectsMap.get(repo.id);
                  const displayTitle = editedProject
                    ? editedProject.name
                    : repo.name.replace(/[-_]/g, ' ');
                  const displayDesc = editedProject
                    ? editedProject.description
                    : repo.description || 'No description provided.';
                  const techList = editedProject
                    ? editedProject.technologies
                    : ([repo.language, ...(repo.topics || [])].filter(Boolean) as string[]);
                  const langColor = LANG_COLORS[repo.language || ''] || '#6b7280';

                  return (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.25 }}
                      onClick={() => toggleSelectRepo(repo.id)}
                      className={`group relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'bg-white dark:bg-white/[0.04] border-[#3b3be3]/40 dark:border-[#818cf8]/40 shadow-lg shadow-[#3b3be3]/[0.06] dark:shadow-[#818cf8]/[0.06]'
                          : 'bg-white/70 dark:bg-white/[0.02] border-gray-200/70 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-md'
                      }`}
                    >
                      {/* Selection indicator top accent bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#3b3be3] via-[#5b5bf5] to-[#818cf8] opacity-100'
                            : 'bg-gray-200 dark:bg-gray-700 opacity-0 group-hover:opacity-40'
                        }`}
                      />

                      <div>
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Custom checkbox */}
                            <div
                              className={`w-[18px] h-[18px] rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-[#3b3be3] to-[#5b5bf5] dark:from-[#818cf8] dark:to-[#6366f1] border-transparent shadow-sm shadow-[#3b3be3]/30'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent group-hover:border-[#3b3be3]/50 dark:group-hover:border-[#818cf8]/50'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            <h4 className="font-bold text-[13px] text-gray-900 dark:text-white truncate leading-tight">
                              {displayTitle}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={e => { e.stopPropagation(); handleOpenEdit(repo); }}
                              title="Edit project details"
                              className="p-1.5 text-gray-400 hover:text-[#3b3be3] dark:hover:text-[#818cf8] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-[1.6] pl-[30px]">
                          {displayDesc}
                        </p>

                        {/* Tech badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3 pl-[30px]">
                          {techList.slice(0, 5).map((tech, tidx) => (
                            <span
                              key={tidx}
                              className="px-2 py-[3px] text-[10px] font-semibold rounded-md bg-gray-100/80 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-white/[0.08]"
                            >
                              {tech}
                            </span>
                          ))}
                          {techList.length > 5 && (
                            <span className="px-2 py-[3px] text-[10px] font-medium text-gray-400 dark:text-gray-500">
                              +{techList.length - 5}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats footer */}
                      <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-gray-100 dark:border-white/[0.05] pl-[30px]">
                        <div className="flex items-center gap-3">
                          {/* Language dot */}
                          {repo.language && (
                            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
                              <span
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ backgroundColor: langColor }}
                              />
                              {repo.language}
                            </span>
                          )}
                          {repo.stargazers_count > 0 && (
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {repo.stargazers_count}
                            </span>
                          )}
                          {repo.forks_count > 0 && (
                            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                              <GitFork className="w-3 h-3" />
                              {repo.forks_count}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 tabular-nums">
                          {new Date(repo.pushed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* EDIT DRAWER                                     */}
          {/* ═══════════════════════════════════════════════ */}
          <AnimatePresence>
            {editingProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setEditingProject(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-2xl space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#3b3be3]/10 dark:bg-[#818cf8]/10 text-[#3b3be3] dark:text-[#818cf8] flex items-center justify-center">
                        <Pencil className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        Edit Project Details
                      </h4>
                    </div>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 text-[11px] uppercase tracking-wider">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={editingProject.name}
                        onChange={e =>
                          setEditingProject({ ...editingProject, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3b3be3]/20 dark:focus:ring-[#818cf8]/20 focus:border-[#3b3be3] dark:focus:border-[#818cf8] transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 text-[11px] uppercase tracking-wider">
                        Your Role
                      </label>
                      <input
                        type="text"
                        value={editingProject.role}
                        onChange={e =>
                          setEditingProject({ ...editingProject, role: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3b3be3]/20 dark:focus:ring-[#818cf8]/20 focus:border-[#3b3be3] dark:focus:border-[#818cf8] transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 text-[11px] uppercase tracking-wider">
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
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#3b3be3]/20 dark:focus:ring-[#818cf8]/20 focus:border-[#3b3be3] dark:focus:border-[#818cf8] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#3b3be3] to-[#5b5bf5] dark:from-[#818cf8] dark:to-[#6366f1] rounded-xl shadow-md shadow-[#3b3be3]/20 dark:shadow-[#818cf8]/20 hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════════ */}
          {/* FOOTER                                          */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="relative z-10 flex items-center justify-between px-5 sm:px-7 py-4 border-t border-gray-200/60 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${selectedCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {selectedCount} project{selectedCount !== 1 ? 's' : ''} ready
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedCount === 0}
                className="group relative px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#3b3be3] to-[#5b5bf5] dark:from-[#818cf8] dark:to-[#6366f1] rounded-xl shadow-lg shadow-[#3b3be3]/25 dark:shadow-[#818cf8]/25 hover:shadow-xl hover:shadow-[#3b3be3]/30 dark:hover:shadow-[#818cf8]/30 hover:-translate-y-0.5 flex items-center gap-2.5 transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Sparkles className="w-4 h-4" />
                Import {selectedCount} Project{selectedCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
