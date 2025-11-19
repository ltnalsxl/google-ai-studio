import React from 'react';
import { Job, JobStatus, ApplicationStatus } from '../types';
import { Trash2, ChevronDown, ChevronUp, Sparkles, AlertCircle, Check, ArrowRight, BarChart3, Briefcase, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface JobCardProps {
  job: Job;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onAnalyze, onDelete, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const isAnalyzing = job.status === JobStatus.ANALYZING;
  const hasResult = job.status === JobStatus.COMPLETED && job.result;

  // Helper for Score Colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusBadgeStyles = (status: ApplicationStatus) => {
    switch (status) {
        case ApplicationStatus.NOT_APPLIED: return "bg-slate-100 text-slate-600";
        case ApplicationStatus.APPLIED: return "bg-blue-100 text-blue-700 border-blue-200";
        case ApplicationStatus.INTERVIEWING: return "bg-purple-100 text-purple-700 border-purple-200";
        case ApplicationStatus.OFFER: return "bg-green-100 text-green-700 border-green-200";
        case ApplicationStatus.REJECTED: return "bg-red-100 text-red-700 border-red-200";
        default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-900 truncate">{job.title}</h3>
              {job.company && (
                <span className="text-sm px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md truncate max-w-[150px]">
                  {job.company}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{job.description}</p>
            
            {/* Action Area */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Analyze Button */}
              {job.status === JobStatus.IDLE && (
                <button
                  onClick={() => onAnalyze(job.id)}
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Fit
                </button>
              )}
              
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-indigo-600 text-sm bg-indigo-50 px-3 py-1.5 rounded-md">
                   <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                   Analyzing...
                </div>
              )}

              {/* Overall Score Badge */}
              {hasResult && job.result && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${getScoreColor(job.result.overallScore)}`}>
                  <span className="text-lg font-bold">{job.result.overallScore}%</span>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Match</span>
                </div>
              )}

              {/* Status Dropdown */}
              <div className="relative">
                <select 
                    value={job.applicationStatus}
                    onChange={(e) => onStatusChange(job.id, e.target.value as ApplicationStatus)}
                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-md text-sm font-medium border transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeStyles(job.applicationStatus)}`}
                >
                    <option value={ApplicationStatus.NOT_APPLIED}>Not Applied</option>
                    <option value={ApplicationStatus.APPLIED}>Applied</option>
                    <option value={ApplicationStatus.INTERVIEWING}>Interviewing</option>
                    <option value={ApplicationStatus.OFFER}>Offer Received</option>
                    <option value={ApplicationStatus.REJECTED}>Rejected</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onDelete(job.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Job"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {hasResult && (
               <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
             >
               {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
             </button>
            )}
          </div>
        </div>
      </div>

      {/* Result Content (Accordion) */}
      {hasResult && job.result && isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
          
          {/* 1. Overview Section */}
          <div className="p-6 pb-4 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-200">
            <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Analysis Summary</h4>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium border ${
                        job.result.fitLabel === 'High Fit' ? 'bg-green-100 text-green-700 border-green-200' :
                        job.result.fitLabel === 'Medium Fit' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-red-100 text-red-700 border-red-200'
                    }`}>
                        {job.result.fitLabel}
                    </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{job.result.summary}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-900 font-medium text-sm">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    Level Assessment
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase">Target Level</div>
                    <div className="font-semibold">{job.result.levelFit.label}</div>
                    <div className="text-xs text-slate-600 mt-1 leading-snug italic">
                        "{job.result.levelFit.assessment}"
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* 2. Detailed Scores Column */}
            <div className="p-6 border-r border-slate-200 space-y-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        Category Breakdown
                    </h4>
                    <div className="space-y-4">
                        {job.result.categoryScores.map((cat, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm text-slate-700 mb-1">
                                    <span className="font-medium">{cat.category}</span>
                                    <span className="font-bold">{cat.score}/100</span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
                                    <div 
                                        className={`h-full rounded-full ${getProgressBarColor(cat.score)}`} 
                                        style={{ width: `${cat.score}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">{cat.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <h5 className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Strong Matches
                        </h5>
                        <ul className="space-y-1">
                            {job.result.strongMatches.map((m, i) => (
                                <li key={i} className="text-xs text-slate-700 bg-green-50 px-2 py-1 rounded border border-green-100">{m}</li>
                            ))}
                        </ul>
                     </div>
                     <div>
                        <h5 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Missing Keywords
                        </h5>
                        <ul className="space-y-1">
                            {job.result.missingKeywords.map((m, i) => (
                                <li key={i} className="text-xs text-slate-700 bg-red-50 px-2 py-1 rounded border border-red-100">{m}</li>
                            ))}
                        </ul>
                     </div>
                </div>
            </div>

            {/* 3. Tailoring Guide Column */}
            <div className="p-6 bg-indigo-50/30">
                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Tailoring Guide
                </h4>
                <div className="space-y-4">
                    {job.result.tailoringGuide.map((guide, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    guide.type === 'rewrite' ? 'bg-blue-100 text-blue-700' :
                                    guide.type === 'add' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                                }`}>
                                    {guide.type === 'rewrite' ? 'Rewrite' : guide.type === 'add' ? 'Add' : 'Keyword'}
                                </span>
                                <span className="text-xs font-medium text-slate-500">Why: {guide.reason}</span>
                            </div>
                            <p className="text-sm text-slate-800 font-medium mb-2">{guide.suggestion}</p>
                            {guide.example && (
                                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 font-mono border border-slate-100">
                                    <span className="select-none text-slate-400 mr-2">$</span>
                                    <ReactMarkdown components={{p: ({node, ...props}) => <span {...props} />}}>
                                        {guide.example}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};