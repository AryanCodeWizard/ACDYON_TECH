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

  // Refetch jobs safely when run status transitions to completed
  const latestRun = runsData?.[0];
  const isRunning = latestRun?.status === 'running';

  useEffect(() => {
    if (latestRun && latestRun.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  }, [latestRun?.status, latestRun?._id, queryClient]);

  const totalJobs = jobsData?.pagination?.total || 0;
  const totalPages = jobsData?.pagination?.pages || 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">JobFlow</h1>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                  Pipeline v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Automated Data Ingestion & Deduplication System</p>
            </div>
          </div>

          {/* Action Header Items */}
          <div className="flex items-center gap-4">
            {latestRun && (
              <div className="text-xs text-slate-500 hidden md:flex items-center gap-2 bg-slate-100/70 px-3 py-1.5 rounded-lg border border-slate-200/60">
                <span>Last run: <strong className="text-slate-700">{new Date(latestRun.startedAt).toLocaleTimeString()}</strong></span>
                <span className="text-slate-300">|</span>
                {latestRun.status === 'running' && (
                  <span className="inline-flex items-center font-medium text-blue-600 gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Ingesting data...
                  </span>
                )}
                {latestRun.status === 'completed' && (
                  <span className="font-medium text-emerald-600">
                    ✓ +{latestRun.metrics?.inserted || 0} inserted ({latestRun.metrics?.duplicates || 0} dupes)
                  </span>
                )}
                {latestRun.status === 'failed' && (
                  <span className="font-medium text-rose-600">
                    ✕ Failed
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-98"
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
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Trigger Ingestion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full space-y-6">
        
        {/* Metric Summary Cards */}
        {latestRun && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fetched Raw</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-800">{latestRun.metrics?.fetched || 0}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">feed</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Newly Inserted</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-emerald-600">+{latestRun.metrics?.inserted || 0}</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">unique</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Deduplicated</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-amber-600">{latestRun.metrics?.duplicates || 0}</span>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">fingerprinted</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Parse Errors</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-slate-800">{latestRun.metrics?.errors || 0}</span>
                <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">skipped</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar Container */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search job titles, skills, companies, locations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Source Filter Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => {
                  setSelectedSource(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 capitalize"
              >
                <option value="all">All Sources</option>
                {sourcesData?.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings Panel */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-800 text-base">Job Listings</h2>
              {jobsFetching && (
                <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Updating...
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {totalJobs} total positions
            </span>
          </div>

          {/* Content Loading State / Empty State / List */}
          {jobsLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-medium">Loading jobs database...</p>
            </div>
          ) : !jobsData?.data || jobsData.data.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                🔍
              </div>
              <p className="text-base font-semibold text-slate-700">No matching jobs found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try adjusting your search criteria or click <strong className="text-slate-600">"Trigger Ingestion"</strong> above to fetch the latest postings from external job feeds.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobsData.data.map((job: JobItem) => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className="p-5 hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-base truncate">
                        {job.title}
                      </h3>
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                        {job.source}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                      <span className="text-slate-700 font-semibold">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        📍 {job.location || 'Remote'}
                      </span>
                      <span>•</span>
                      <span>
                        📅 {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>

              <span className="text-xs text-slate-500 font-medium">
                Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Run History Audit Log */}
        <details className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden group">
          <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between bg-slate-50/50 select-none">
            <span className="flex items-center gap-2">
              📜 Ingestion Execution History
              <span className="text-xs font-normal text-slate-400">({runsData?.length || 0} total runs recorded)</span>
            </span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span>
          </summary>

          <div className="px-6 py-4 border-t border-slate-100">
            {!runsData?.length ? (
              <p className="text-xs text-slate-400 text-center py-4">No run history yet. Click "Trigger Ingestion" to run your first pipeline execution.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-2">Run ID / Time</th>
                      <th className="pb-2">Source</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Metrics (Fetched / Inserted / Dupes / Errors)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {runsData.map((run) => (
                      <tr key={run._id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 font-sans font-medium text-slate-700">
                          {new Date(run.startedAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 capitalize text-slate-500">{run.source}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold capitalize ${
                              run.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : run.status === 'running'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60 animate-pulse'
                                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}
                          >
                            {run.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-sans text-slate-600 font-medium">
                          {run.metrics?.fetched || 0} fetched · <span className="text-emerald-600 font-semibold">+{run.metrics?.inserted || 0} inserted</span> · <span className="text-amber-600">{run.metrics?.duplicates || 0} dupes</span> · <span className="text-rose-600">{run.metrics?.errors || 0} err</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>
      </main>

      {/* Modal Drawer for Viewing Job Detail */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{selectedJob.company}</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedJob.title}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                  <span>📍 {selectedJob.location || 'Remote'}</span>
                  <span>•</span>
                  <span>📅 Posted {new Date(selectedJob.postedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full capitalize">Source: {selectedJob.source}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition font-bold text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed flex-grow">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job Description</h4>
                <p className="whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-sans">
                  {selectedJob.description}
                </p>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fingerprint Hashing Debug</h4>
                <p className="font-mono text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto select-all">
                  SHA256: {selectedJob.fingerprint}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Close Window
              </button>
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400">
        JobFlow Ingestion Pipeline Demo · Antigravity AI Codebase Optimization
      </footer>
    </div>
  );
}