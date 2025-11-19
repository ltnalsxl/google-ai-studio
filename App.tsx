import React, { useState } from 'react';
import { ResumeUploader } from './components/ResumeUploader';
import { AddJobForm } from './components/AddJobForm';
import { JobCard } from './components/JobCard';
import { Job, JobStatus, ApplicationStatus, ResumeData } from './types';
import { analyzeJobFit } from './services/geminiService';
import { Briefcase, FileText, Sparkles } from 'lucide-react';

export default function App() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleResumeLoaded = (data: ResumeData) => {
    setResume(data);
  };

  const handleAddJob = (title: string, company: string, description: string) => {
    const newJob: Job = {
      id: crypto.randomUUID(),
      title,
      company,
      description,
      status: JobStatus.IDLE,
      applicationStatus: ApplicationStatus.NOT_APPLIED,
      createdAt: Date.now(),
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, applicationStatus: status } : j));
  }

  const handleAnalyzeJob = async (id: string) => {
    if (!resume) {
        alert("Please upload a Master Resume first!");
        return;
    }

    // Update status to analyzing
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: JobStatus.ANALYZING } : j));

    const jobToAnalyze = jobs.find(j => j.id === id);
    if (!jobToAnalyze) return;

    try {
        const result = await analyzeJobFit(resume.content, jobToAnalyze.description);
        setJobs(prev => prev.map(j => j.id === id ? { 
            ...j, 
            status: JobStatus.COMPLETED,
            result: result 
        } : j));
    } catch (error) {
        console.error(error);
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status: JobStatus.ERROR } : j));
        alert("Failed to analyze job fit. Please check your API key or internet connection.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">ResumeFit<span className="text-indigo-600">.ai</span></h1>
          </div>
          <div className="flex items-center gap-4">
             {resume && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    <FileText className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{resume.fileName}</span>
                </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome / Resume Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Resume & Intro */}
            <div className="lg:col-span-4 space-y-6">
                <div className="prose prose-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Tailor your Master Resume.</h2>
                    <p className="text-slate-600">
                        Upload your master resume. We'll help you translate your experience to fit specific JDs and track your applications.
                    </p>
                </div>

                <ResumeUploader 
                    currentResume={resume} 
                    onResumeLoaded={handleResumeLoaded} 
                />

                {/* Stats or Info (Optional decorative) */}
                {resume && (
                    <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg overflow-hidden relative">
                        <Sparkles className="w-24 h-24 text-indigo-800 absolute -bottom-4 -right-4 opacity-50" />
                        <h3 className="font-semibold text-lg mb-2 relative z-10">Pipeline Stats</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs relative z-10">
                            <div className="bg-indigo-800/50 p-2 rounded">
                                <div className="opacity-70">Applied</div>
                                <div className="text-lg font-bold">{jobs.filter(j => j.applicationStatus === ApplicationStatus.APPLIED).length}</div>
                            </div>
                            <div className="bg-indigo-800/50 p-2 rounded">
                                <div className="opacity-70">Interviewing</div>
                                <div className="text-lg font-bold">{jobs.filter(j => j.applicationStatus === ApplicationStatus.INTERVIEWING).length}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Job Board */}
            <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Job Analysis Board</h2>
                    <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Added
                    </span>
                </div>

                <div className="space-y-6">
                    <AddJobForm onAdd={handleAddJob} />
                    
                    <div className="space-y-4">
                        {jobs.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                <p className="text-slate-400">No jobs added yet. Add one to get started!</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <JobCard 
                                    key={job.id} 
                                    job={job} 
                                    onAnalyze={handleAnalyzeJob}
                                    onDelete={handleDeleteJob}
                                    onStatusChange={handleStatusChange}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}