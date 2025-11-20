
import React, { useState } from 'react';
import { Job, JobStatus, ApplicationStatus, Language } from '../types';
import { Trash2, ChevronDown, ChevronUp, Sparkles, AlertCircle, Check, BarChart3, Briefcase, BookOpen, FileText, Copy, Building2, Heart, FileEdit, Download, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Declare html2pdf for TypeScript since we load it via CDN
declare var html2pdf: any;

interface JobCardProps {
  job: Job;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onGenerateTailoredResume: (id: string) => void;
  onGenerateCoverLetter: (id: string) => void;
  language: Language;
}

export const JobCard: React.FC<JobCardProps> = ({ 
    job, 
    onAnalyze, 
    onDelete, 
    onStatusChange, 
    onGenerateTailoredResume, 
    onGenerateCoverLetter,
    language 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'resume' | 'cover_letter'>('analysis');
  const [copiedResume, setCopiedResume] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isAnalyzing = job.status === JobStatus.ANALYZING;
  const hasResult = job.status === JobStatus.COMPLETED && job.result;
  const isWishlisted = job.applicationStatus === ApplicationStatus.WISHLIST;

  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);

  const handleGenerateResumeClick = async () => {
      setIsGeneratingLocal(true);
      await onGenerateTailoredResume(job.id);
      setIsGeneratingLocal(false);
  };

  const handleGenerateCLClick = async () => {
      setIsGeneratingCL(true);
      await onGenerateCoverLetter(job.id);
      setIsGeneratingCL(false);
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
        onStatusChange(job.id, ApplicationStatus.NOT_APPLIED);
    } else {
        onStatusChange(job.id, ApplicationStatus.WISHLIST);
    }
  };

  const handleDownloadPDF = () => {
      const element = document.getElementById(`content-to-print-${job.id}-${activeTab}`);
      if (!element) {
          alert("Content not ready to download");
          return;
      }
      
      const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `${job.company}_${activeTab}_${language}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // @ts-ignore
      html2pdf().set(opt).from(element).save();
  };

  const getLogoUrl = (companyName: string) => {
      const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `https://logo.clearbit.com/${cleanName}.com`;
  };

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
        case ApplicationStatus.NOT_APPLIED: return "bg-slate-50 text-slate-600 hover:bg-slate-100";
        case ApplicationStatus.WISHLIST: return "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100";
        case ApplicationStatus.APPLIED: return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
        case ApplicationStatus.INTERVIEWING: return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
        case ApplicationStatus.OFFER: return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
        case ApplicationStatus.REJECTED: return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
        default: return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md w-full max-w-3xl mx-auto">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {job.company && !logoError ? (
                  <img 
                    src={getLogoUrl(job.company)} 
                    alt={`${job.company} logo`}
                    onError={() => setLogoError(true)}
                    className="w-8 h-8 rounded-md object-contain bg-white border border-slate-100 p-0.5 shadow-sm"
                  />
              ) : (
                  <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                      <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
              )}

              <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate leading-tight">{job.title}</h3>
                  {job.company && (
                    <p className="text-xs font-semibold text-slate-500 truncate">
                      {job.company}
                    </p>
                  )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <button 
                onClick={toggleWishlist}
                className={`p-2 rounded-lg transition-colors border ${isWishlisted ? 'bg-pink-50 border-pink-200 text-pink-500' : 'bg-white border-slate-200 text-slate-300 hover:text-pink-400 hover:border-pink-200'}`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {job.status === JobStatus.IDLE && (
                <button
                  onClick={() => onAnalyze(job.id)}
                  className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  {language === 'ko' ? '분석 시작' : 'Start Analysis'}
                </button>
              )}
              
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-indigo-600 text-sm bg-indigo-50 px-4 py-2 rounded-lg font-medium">
                   <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                   Analyzing fit...
                </div>
              )}

              {hasResult && job.result && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getScoreColor(job.result.overallScore)}`}>
                  <span className="text-xl font-bold leading-none">{job.result.overallScore}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Match</span>
                </div>
              )}

              <div className="relative">
                <select 
                    value={job.applicationStatus}
                    onChange={(e) => onStatusChange(job.id, e.target.value as ApplicationStatus)}
                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border border-transparent transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wide ${getStatusBadgeStyles(job.applicationStatus)}`}
                >
                    <option value={ApplicationStatus.NOT_APPLIED}>{language === 'ko' ? '수신함' : 'Inbox'}</option>
                    <option value={ApplicationStatus.WISHLIST}>{language === 'ko' ? '관심' : 'Wishlist'}</option>
                    <option value={ApplicationStatus.APPLIED}>{language === 'ko' ? '지원완료' : 'Applied'}</option>
                    <option value={ApplicationStatus.INTERVIEWING}>{language === 'ko' ? '면접중' : 'Interviewing'}</option>
                    <option value={ApplicationStatus.OFFER}>{language === 'ko' ? '합격/오퍼' : 'Offer Received'}</option>
                    <option value={ApplicationStatus.REJECTED}>{language === 'ko' ? '불합격' : 'Rejected'}</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
              </div>
            </div>
            
            {!isExpanded && (
                <p className="text-sm text-slate-500 line-clamp-1 mt-3 ml-1">{job.description}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
             {hasResult && (
               <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
             >
               {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
             </button>
            )}

            <button 
              onClick={() => onDelete(job.id)}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Job"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Result Content (Accordion) */}
      {hasResult && job.result && isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-2 duration-300">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-white px-6 pt-2">
              <div className="flex">
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    {language === 'ko' ? '분석 리포트' : 'Analysis'}
                </button>
                <button 
                    onClick={() => setActiveTab('resume')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'resume' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    {language === 'ko' ? '맞춤형 이력서' : 'Tailored Resume'}
                </button>
                <button 
                    onClick={() => setActiveTab('cover_letter')}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'cover_letter' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    {language === 'ko' ? '커버레터' : 'Cover Letter'}
                </button>
              </div>
              
              {/* PDF Export Button (Visible if content exists for active tab) */}
              <div className="pb-2">
                  {((activeTab === 'analysis') || 
                    (activeTab === 'resume' && job.tailoredResume) || 
                    (activeTab === 'cover_letter' && job.coverLetter)) && (
                      <button 
                        onClick={handleDownloadPDF}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                          <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                  )}
              </div>
          </div>

          {/* TAB: ANALYSIS */}
          {activeTab === 'analysis' && (
            <div id={`content-to-print-${job.id}-analysis`}>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-200 bg-white">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide border ${
                                job.result.fitLabel === 'High Fit' ? 'bg-green-100 text-green-700 border-green-200' :
                                job.result.fitLabel === 'Medium Fit' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                'bg-red-100 text-red-700 border-red-200'
                            }`}>
                                {job.result.fitLabel}
                            </span>
                            <span className="text-xs font-medium text-slate-400">AI Assessment</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Analysis Summary</h4>
                        <p className="text-slate-700 text-sm leading-relaxed">{job.result.summary}</p>
                        
                        {job.result.creativeConnections && job.result.creativeConnections.length > 0 && (
                          <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                             <h5 className="text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center gap-1.5">
                               <Sparkles className="w-3 h-3" /> Connecting the Dots
                             </h5>
                             <ul className="space-y-2">
                               {job.result.creativeConnections.map((conn, i) => (
                                 <li key={i} className="text-xs text-indigo-700 flex gap-2">
                                   <span className="select-none">•</span>
                                   {conn}
                                 </li>
                               ))}
                             </ul>
                          </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                         <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
                                <BarChart3 className="w-4 h-4 text-indigo-600" />
                                Level Fit
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs text-slate-500 uppercase font-semibold">Targeting</div>
                                <div className="font-bold text-slate-800">{job.result.levelFit.label}</div>
                                <div className="text-xs text-slate-600 leading-snug italic p-2 bg-white rounded border border-slate-100">
                                    "{job.result.levelFit.assessment}"
                                </div>
                            </div>
                        </div>

                        {/* Context Snapshot (History) */}
                        {job.usedContextSnapshot && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Paperclip className="w-3 h-3" />
                                    {language === 'ko' ? '사용된 컨텍스트' : 'Context Used'}
                                </h5>
                                <ul className="space-y-1">
                                    {job.usedContextSnapshot.map(item => (
                                        <li key={item.id} className="text-xs text-slate-600 truncate flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            {item.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 bg-white">
                    <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Detailed Breakdown
                            </h4>
                            <div className="space-y-5">
                                {job.result.categoryScores.map((cat, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm text-slate-700 mb-1.5">
                                            <span className="font-medium">{cat.category}</span>
                                            <span className="font-bold">{cat.score}/100</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(cat.score)}`} 
                                                style={{ width: `${cat.score}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500">{cat.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h5 className="text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-1.5">
                                    <Check className="w-3 h-3" /> Strong Matches
                                </h5>
                                <ul className="space-y-2">
                                    {job.result.strongMatches.map((m, i) => (
                                        <li key={i} className="text-xs font-medium text-slate-700 bg-green-50 px-2 py-1.5 rounded border border-green-100">{m}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-bold text-red-700 uppercase mb-3 flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" /> Missing Keywords
                                </h5>
                                <ul className="space-y-2">
                                    {job.result.missingKeywords.map((m, i) => (
                                        <li key={i} className="text-xs font-medium text-slate-700 bg-red-50 px-2 py-1.5 rounded border border-red-100">{m}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/50">
                        <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide mb-6 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-indigo-600" />
                            Tailoring Guide
                        </h4>
                        <div className="space-y-4">
                            {job.result.tailoringGuide.map((guide, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                            guide.type === 'rewrite' ? 'bg-blue-100 text-blue-700' :
                                            guide.type === 'add' ? 'bg-green-100 text-green-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                            {guide.type === 'rewrite' ? 'Rewrite' : guide.type === 'add' ? 'Add' : 'Keyword'}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">{guide.reason}</span>
                                    </div>
                                    <p className="text-sm text-slate-900 font-semibold mb-3">{guide.suggestion}</p>
                                    {guide.example && (
                                        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 font-mono border border-slate-100">
                                            <div className="flex gap-2">
                                                <span className="select-none text-slate-300">→</span>
                                                <ReactMarkdown components={{p: ({node, ...props}) => <span {...props} />}}>
                                                    {guide.example}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* TAB: TAILORED RESUME */}
          {activeTab === 'resume' && (
              <div className="p-8 bg-white">
                  {!job.tailoredResume ? (
                      <div className="text-center py-16">
                          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {language === 'ko' ? '맞춤형 이력서 생성' : 'Generate Tailored Resume'}
                          </h3>
                          <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                              {language === 'ko' 
                                ? 'AI가 현재 직무 설명(JD)에 맞춰 이력서 내용을 재구성하고 키워드를 최적화합니다.' 
                                : 'Create a new version of your resume specifically optimized for this JD. The AI will reorder bullets and insert relevant keywords.'}
                          </p>
                          <button 
                            onClick={handleGenerateResumeClick}
                            disabled={isGeneratingLocal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 mx-auto disabled:opacity-70 hover:-translate-y-0.5"
                          >
                              {isGeneratingLocal ? (
                                  <>{language === 'ko' ? '생성중...' : 'Generating...'}</>
                              ) : (
                                  <>
                                    <Sparkles className="w-5 h-5" /> {language === 'ko' ? '지금 생성하기' : 'Generate Now'}
                                  </>
                              )}
                          </button>
                      </div>
                  ) : (
                      <div className="animate-in fade-in duration-500">
                          <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-2">
                                  <div className="bg-green-100 p-2 rounded-lg">
                                      <Check className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-900">Tailored Resume Generated</h3>
                                      <p className="text-xs text-slate-500">Optimized for {job.company || 'this job'}</p>
                                  </div>
                              </div>
                              <button 
                                onClick={() => handleCopy(job.tailoredResume || "")}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                              >
                                  {copiedResume ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  {copiedResume ? 'Copied!' : 'Copy Markdown'}
                              </button>
                          </div>
                          <div id={`content-to-print-${job.id}-resume`} className="bg-white border border-slate-200 rounded-xl p-12 shadow-inner">
                                <ReactMarkdown className="prose prose-slate prose-sm max-w-none font-serif">
                                    {job.tailoredResume}
                                </ReactMarkdown>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* TAB: COVER LETTER */}
          {activeTab === 'cover_letter' && (
               <div className="p-8 bg-white">
               {!job.coverLetter ? (
                   <div className="text-center py-16">
                       <div className="bg-teal-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                             <FileEdit className="w-10 h-10 text-teal-600" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {language === 'ko' ? '커버레터 작성' : 'Write Cover Letter'}
                       </h3>
                       <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                           {language === 'ko'
                            ? '나의 경험과 가치관을 녹여낸 매력적인 커버레터를 자동으로 작성합니다.'
                            : 'Generate a compelling cover letter that weaves your holistic profile (hobbies, values) into the professional narrative.'}
                       </p>
                       <button 
                         onClick={handleGenerateCLClick}
                         disabled={isGeneratingCL}
                         className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-200 transition-all flex items-center gap-2 mx-auto disabled:opacity-70 hover:-translate-y-0.5"
                       >
                           {isGeneratingCL ? (
                               <>{language === 'ko' ? '작성중...' : 'Writing...'}</>
                           ) : (
                               <>
                                 <Sparkles className="w-5 h-5" /> {language === 'ko' ? '커버레터 작성하기' : 'Write Cover Letter'}
                               </>
                           )}
                       </button>
                   </div>
               ) : (
                   <div className="animate-in fade-in duration-500">
                       <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-2">
                               <div className="bg-green-100 p-2 rounded-lg">
                                   <Check className="w-5 h-5 text-green-600" />
                               </div>
                               <div>
                                   <h3 className="font-bold text-slate-900">Cover Letter Ready</h3>
                                   <p className="text-xs text-slate-500">Customized for {job.company}</p>
                               </div>
                           </div>
                           <button 
                             onClick={() => handleCopy(job.coverLetter || "")}
                             className="text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                           >
                               {copiedResume ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                               {copiedResume ? 'Copied!' : 'Copy Text'}
                           </button>
                       </div>
                       <div id={`content-to-print-${job.id}-cover_letter`} className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm">
                             <ReactMarkdown className="prose prose-slate max-w-none font-serif whitespace-pre-wrap leading-relaxed">
                                 {job.coverLetter}
                             </ReactMarkdown>
                       </div>
                   </div>
               )}
           </div>
          )}

        </div>
      )}
    </div>
  );
};
