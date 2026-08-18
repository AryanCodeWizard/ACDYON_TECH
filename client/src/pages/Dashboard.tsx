import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchJobs, fetchRuns, fetchSources, triggerIngestion } from '../api/client';

export interface JobItem {
  _id: string;
  externalId: string;
  source: string;
  title: string;
  company: string;
  description: string;
  location: string;
  url: string;
  postedAt: string;
  fingerprint: string;
  createdAt: string;
}

export interface IngestionRunItem {
  _id: string;
  source: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  metrics: {
    fetched: number;
    inserted: number;
    duplicates: number;
    errors: number;
  };
  errorMessage?: string;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  // Dark Mode Theme State initialized with system/localStorage preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('acdyon-theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('acdyon-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('acdyon-theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch ingestion runs with polling
  const { data: runsData } = useQuery<IngestionRunItem[]>({
    queryKey: ['runs'],
    queryFn: fetchRuns,
    refetchInterval: (query) => {
      const runs = query.state.data;
      const isRunning = runs?.some((r) => r.status === 'running');
      return isRunning ? 2000 : 8000;
    },
  });

  // Fetch available sources
  const { data: sourcesData } = useQuery<string[]>({
    queryKey: ['sources'],
    queryFn: fetchSources,
  });

  // Fetch jobs
  const {
    data: jobsData,
    isLoading: jobsLoading,
    isFetching: jobsFetching,
  } = useQuery({
    queryKey: ['jobs', page, searchQuery, selectedSource],
    queryFn: () => fetchJobs(page, searchQuery, selectedSource),
  });

  // Trigger ingestion mutation
  const mutation = useMutation({
    mutationFn: triggerIngestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });

  const latestRun = runsData?.[0];
  const isRunning = latestRun?.status === 'running';

  useEffect(() => {
    if (latestRun && latestRun.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  }, [latestRun?.status, latestRun?._id, queryClient]);

  const totalJobs = jobsData?.pagination?.total || 0;
  const totalPages = jobsData?.pagination?.pages || 1;

  // Compute overall deduplication stats across runs
  const totalFetched = runsData?.reduce((acc, r) => acc + (r.metrics?.fetched || 0), 0) || 0;
  const totalDuplicates = runsData?.reduce((acc, r) => acc + (r.metrics?.duplicates || 0), 0) || 0;
  const dedupeRate = totalFetched > 0 ? Math.round((totalDuplicates / totalFetched) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-300 acdyon-glow-bg relative isolate">
      
      {/* Top Glassmorphic Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 acdyon-glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3.5">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" viewBox="0 0 100 100" fill="none">
                  <path d="M30 70 L50 28 L70 70 M38 54 H62" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M72 26 L74.5 32.5 L81 35 L74.5 37.5 L72 44 L69.5 37.5 L63 35 L69.5 32.5 Z" fill="#D4AF37"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans">
                    AcdyOn
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full acdyon-gold-badge">
                    <svg className="w-3 h-3 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4m0 0h4M5 7L10 2m-5 5v12a2 2 0 002 2h10a2 2 0 002-2V7m-4 0v4m0 0h4m-4 0L15 2" />
                    </svg>
                    JobFlow Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Automated Data Ingestion &amp; SHA-256 Deduplication Intelligence
                </p>
              </div>
            </a>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-3">
            {/* Live Pipeline Status Badge */}
            {latestRun && (
              <div className="text-xs text-slate-600 dark:text-slate-300 hidden lg:flex items-center gap-2.5 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span>Last Run: <strong className="text-slate-900 dark:text-slate-100">{new Date(latestRun.startedAt).toLocaleTimeString()}</strong></span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                {latestRun.status === 'running' && (
                  <span className="inline-flex items-center font-semibold text-[#1E40FF] gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E40FF]"></span>
                    </span>
                    Ingesting data...
                  </span>
                )}
                {latestRun.status === 'completed' && (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ✓ +{latestRun.metrics?.inserted || 0} inserted ({latestRun.metrics?.duplicates || 0} dupes)
                  </span>
                )}
                {latestRun.status === 'failed' && (
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    ✕ Ingestion Failed
                  </span>
                )}
              </div>
            )}

            {/* Dark / Light Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
              className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-[#1E40FF] dark:hover:text-[#1E40FF] transition-all duration-200 active:scale-95 shadow-xs"
            >
              {isDarkMode ? (
                /* Sun Icon */
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                /* Moon Icon */
                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* AcdyOn Primary Trigger Button */}
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || isRunning}
              className="group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] bg-[#1E40FF] hover:bg-[#1937DD] text-white shadow-acdyon-blue disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {mutation.isPending || isRunning ? (
                <>
                  <svg className="animate-spin -ml-0.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Ingesting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Trigger Ingestion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-6 md:p-8 shadow-acdyon-card backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]">
                <svg className="w-4 h-4 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AcdyOn Global Job Intelligence
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Live Data Ingestion &amp; Fingerprint Pipeline
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Extracting structured job listings from external platforms with anti-bot resilience, zero-duplicate SHA-256 hashing, and automated source adapters.
              </p>
            </div>

            {/* Quick Stat Pill Highlights */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 text-center min-w-[110px]">
                <div className="text-2xl font-black text-[#1E40FF] dark:text-blue-400">{totalJobs}</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Total Jobs</div>
              </div>
              <div className="bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 text-center min-w-[110px]">
                <div className="text-2xl font-black text-[#D4AF37]">{dedupeRate}%</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Dedupe Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid Cards */}
        {latestRun && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Fetched */}
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Fetched Items</span>
                <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#1E40FF]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{latestRun.metrics?.fetched || 0}</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">raw items</span>
              </div>
            </div>

            {/* New Inserted */}
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>New Listings Saved</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">+{latestRun.metrics?.inserted || 0}</span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">unique</span>
              </div>
            </div>

            {/* Duplicates Caught */}
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Duplicates Filtered</span>
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-[#D4AF37]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-extrabold text-[#D4AF37]">{latestRun.metrics?.duplicates || 0}</span>
                <span className="text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">SHA-256 hashed</span>
              </div>
            </div>

            {/* System Errors */}
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Pipeline Errors</span>
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{latestRun.metrics?.errors || 0}</span>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">skipped</span>
              </div>
            </div>

          </div>
        )}

        {/* Filter and Search Bar Container */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 1 1 -14 0 7 7 0 0 1 14 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search job titles, required skills, companies, locations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/30 focus:border-[#1E40FF] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Source Filter Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1E40FF]/30 focus:border-[#1E40FF] transition-all cursor-pointer"
              >
                <option value="all">All Data Sources</option>
                {sourcesData?.map((src) => (
                  <option key={src} value={src}>
                    {src.charAt(0).toUpperCase() + src.slice(1)} Adapter
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Cards Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Job Listings</span>
              {jobsFetching && <span className="text-xs text-[#1E40FF] font-semibold animate-pulse">(Updating...)</span>}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing Page {page} of {totalPages} ({totalJobs} items)
            </span>
          </div>

          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/60 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 animate-pulse space-y-4 h-48">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2"></div>
                  <div className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : jobsData?.jobs?.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No job listings found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try adjusting your search criteria or click "Trigger Ingestion" to fetch fresh data.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobsData?.jobs.map((job: JobItem) => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className="group bg-white/90 dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 hover:border-[#1E40FF]/50 dark:hover:border-[#1E40FF]/50 shadow-xs hover:shadow-acdyon-card dark:hover:shadow-acdyon-dark-card transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1E40FF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                        {job.source}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#1E40FF] dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {job.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>🏢 {job.company || 'Unknown Company'}</span>
                      <span>•</span>
                      <span>📍 {job.location || 'Remote / Unspecified'}</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {job.description.replace(/<[^>]*>?/gm, '')}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-[#1E40FF] dark:text-blue-400 font-semibold">
                    <span>View details</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                ← Previous
              </button>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1E40FF] dark:text-blue-400">
                  {selectedJob.source}
                </span>
                <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mt-2">
                  {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  🏢 {selectedJob.company} • 📍 {selectedJob.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Fingerprint: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedJob.fingerprint.slice(0, 16)}...</strong></span>
                <span>Posted: {new Date(selectedJob.postedAt || selectedJob.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Job Description</h4>
                <div
                  className="prose dark:prose-invert max-w-none text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                Close Window
              </button>
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1E40FF] hover:bg-[#1937DD] text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-acdyon-blue transition flex items-center gap-1.5"
              >
                <span>Apply / View Original Listing</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AcdyOn Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 py-5 text-center text-xs text-slate-500 dark:text-slate-400 backdrop-blur-xl mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">AcdyOn JobFlow Engine</span>
            <span>·</span>
            <span>Automated Data Ingestion &amp; Job Intelligence Platform</span>
          </div>
          <div>
            Built for AcdyOn Technologies Engineering Challenge
          </div>
        </div>
      </footer>

    </div>
  );
}