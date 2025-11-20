import React, { useState, useMemo } from 'react';
import { ProfileManager } from './components/ProfileManager';
import { AddJobForm } from './components/AddJobForm';
import { JobCard } from './components/JobCard';
import { ExperienceHelper } from './components/ExperienceHelper';
import { Job, JobStatus, ApplicationStatus, UserContextItem } from './types';
import { analyzeJobFit, generateTailoredResume } from './services/geminiService';
import { Briefcase, Sparkles, PenTool, LayoutGrid, User, Filter, XCircle } from 'lucide-react';

export default function App() {
  const [userContext, setUserContext] = useState<UserContextItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showTools, setShowTools] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | null>(null);

  const handleAddItem = (item: UserContextItem) => {
    setUserContext(prev => [...prev, item]);
  };

  const handleRemoveItem = (id: string) => {
    setUserContext(prev => prev.filter(item => item.id !== id));
  };

  const handleAddJob = async (title: string, company: string, description: string, autoAnalyze: boolean) => {
    const newJobId = crypto.randomUUID();
    
    const newJob: Job = {
      id: newJobId,
      title,
      company,
      description,
      status: autoAnalyze ? JobStatus.ANALYZING : JobStatus.IDLE, // Set status immediately
      applicationStatus: ApplicationStatus.NOT_APPLIED,
      createdAt: Date.now(),
    };
    
    setJobs(prev => [newJob, ...prev]);

    if (autoAnalyze && userContext.length > 0) {
        await performAnalysis(newJobId, userContext, description);
    }
  };

  const performAnalysis = async (jobId: string, context: UserContextItem[], jobDescription: string) => {
    try {
        const result = await analyzeJobFit(context, jobDescription);
        setJobs(prev => prev.map(j => j.id === jobId ? { 
            ...j, 
            status: JobStatus.COMPLETED,
            result: result 
        } : j));
    } catch (error) {
        console.error(error);
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: JobStatus.ERROR } : j));
    }
  }

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, applicationStatus: status } : j));
  }

  const handleAnalyzeJob = async (id: string) => {
    if (userContext.length === 0) {
        alert("Please add at least one Resume or Context item to your profile first!");
        return;
    }

    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: JobStatus.ANALYZING } : j));
    
    const jobToAnalyze = jobs.find(j => j.id === id);
    if (jobToAnalyze) {
        await performAnalysis(id, userContext, jobToAnalyze.description);
    }
  };

  const handleGenerateTailoredResume = async (id: string) => {
    if (userContext.length === 0) return;
    const jobToAnalyze = jobs.find(j => j.id === id);
    if (!jobToAnalyze) return;

    try {
        const tailoredContent = await generateTailoredResume(userContext, jobToAnalyze.description);
        setJobs(prev => prev.map(j => j.id === id ? { ...j, tailoredResume: tailoredContent } : j));
    } catch (error) {
        console.error(error);
        alert("Failed to generate tailored resume.");
    }
  };

  // Calculate Statistics
  const stats = useMemo(() => {
      const counts = {
          [ApplicationStatus.NOT_APPLIED]: 0,
          [ApplicationStatus.WISHLIST]: 0,
          [ApplicationStatus.APPLIED]: 0,
          [ApplicationStatus.INTERVIEWING]: 0,
          [ApplicationStatus.OFFER]: 0,
          [ApplicationStatus.REJECTED]: 0,
      };
      jobs.forEach(j => counts[j.applicationStatus]++);
      return counts;
  }, [jobs]);

  const filteredJobs = filterStatus ? jobs.filter(j => j.applicationStatus === filterStatus) : jobs;

  // --- VIEW 1: LANDING (NO CONTEXT) ---
  if (userContext.length === 0) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in duration-700">
                <div className="space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">ResumeFit<span className="text-indigo-600">.ai</span></h1>
                    <p className="text-lg text-slate-600 max-w-md mx-auto">
                        We connect the dots. Upload your resume, hobbies, and values to find your perfect fit.
                    </p>
                </div>
                
                <div className="bg-white p-1 rounded-2xl shadow-xl">
                     <ProfileManager items={userContext} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} variant="full" />
                </div>

                <div className="flex items-center justify-center gap-8 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Holistic Analysis
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Personal Matches
                    </div>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" /> Pipeline Tracking
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // --- VIEW 2: DASHBOARD (HAS CONTEXT) ---
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-900 hidden sm:block">ResumeFit<span className="text-indigo-600">.ai</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowTools(!showTools)}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${showTools ? 'bg-amber-100 text-amber-800' : 'text-slate-600 hover:bg-slate-100'}`}
             >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Tools</span>
             </button>

             <div className="h-6 w-px bg-slate-200 mx-2"></div>

             <button 
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showProfile ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
             >
                <div className="bg-slate-100 p-1 rounded-full">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">{userContext.length} Dots</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Profile Drawer */}
        {showProfile && (
            <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
                <ProfileManager items={userContext} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} variant="full" />
            </div>
        )}

        {/* Tools Drawer */}
        {showTools && (
            <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
                <ExperienceHelper />
            </div>
        )}

        {/* HERO SECTION: ADD JOB */}
        <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
            <AddJobForm onAdd={handleAddJob} />
        </div>

        {/* PIPELINE DASHBOARD */}
        {jobs.length > 0 && (
            <div className="mt-12 mb-8">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pipeline Dashboard</span>
                    <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { status: ApplicationStatus.NOT_APPLIED, label: 'Inbox', color: 'bg-white border-slate-200 text-slate-500' },
                        { status: ApplicationStatus.WISHLIST, label: 'Wishlist', color: 'bg-pink-50 border-pink-200 text-pink-600' },
                        { status: ApplicationStatus.APPLIED, label: 'Applied', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                        { status: ApplicationStatus.INTERVIEWING, label: 'Interviewing', color: 'bg-purple-50 border-purple-200 text-purple-700' },
                        { status: ApplicationStatus.OFFER, label: 'Offer', color: 'bg-green-50 border-green-200 text-green-700' },
                        { status: ApplicationStatus.REJECTED, label: 'Rejected', color: 'bg-red-50 border-red-200 text-red-700' },
                    ].map((stat) => (
                        <button
                            key={stat.status}
                            onClick={() => setFilterStatus(filterStatus === stat.status ? null : stat.status)}
                            className={`p-4 rounded-xl border text-center transition-all ${
                                filterStatus === stat.status 
                                ? 'ring-2 ring-indigo-500 ring-offset-2 transform scale-105 shadow-md' 
                                : 'hover:bg-slate-50 hover:shadow-sm'
                            } ${stat.color}`}
                        >
                            <div className="text-2xl font-bold mb-1">{stats[stat.status]}</div>
                            <div className="text-xs font-bold uppercase tracking-wide opacity-80">{stat.label}</div>
                        </button>
                    ))}
                </div>

                 {filterStatus && (
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={() => setFilterStatus(null)}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            Clear Filter: {filterStatus.replace('_', ' ')}
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* JOB LIST SECTION */}
        {jobs.length > 0 && (
            <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                    <h2 className="text-lg font-bold text-slate-900">
                        {filterStatus ? `Jobs: ${filterStatus.toLowerCase().replace('_', ' ')}` : 'All Jobs'}
                    </h2>
                    <span className="text-sm text-slate-500 font-medium">{filteredJobs.length} jobs</span>
                </div>

                <div className="grid gap-6">
                    {filteredJobs.map(job => (
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            onAnalyze={handleAnalyzeJob}
                            onDelete={handleDeleteJob}
                            onStatusChange={handleStatusChange}
                            onGenerateTailoredResume={handleGenerateTailoredResume}
                        />
                    ))}
                </div>
            </div>
        )}

        {jobs.length === 0 && (
            <div className="mt-12 text-center text-slate-400">
                <p>Your analysis history will appear here.</p>
            </div>
        )}

      </main>
    </div>
  );
}