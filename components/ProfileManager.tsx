
import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Plus, Heart, Lightbulb, Coffee, Book, Sparkles, Eye, ChevronRight, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { UserContextItem, ContextType, Language } from '../types';
import ReactMarkdown from 'react-markdown';
import { generateUserPersona, extractTextFromPdf } from '../services/geminiService';

interface ProfileManagerProps {
  items: UserContextItem[];
  onAddItem: (item: UserContextItem) => void;
  onRemoveItem: (id: string) => void;
  onToggleItem?: (id: string) => void; // New prop
  variant?: 'full' | 'compact';
  language: Language;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ 
  items, 
  onAddItem, 
  onRemoveItem,
  onToggleItem,
  variant = 'full',
  language
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Adding Items State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteType, setNoteType] = useState<ContextType>('note');
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);

  // View Details State
  const [selectedItem, setSelectedItem] = useState<UserContextItem | null>(null);

  // Persona Analysis State
  const [isAnalyzingPersona, setIsAnalyzingPersona] = useState(false);
  const [persona, setPersona] = useState<string | null>(null);

  // Translations
  const t = {
      myContext: language === 'ko' ? '나의 컨텍스트' : 'My Context',
      uploadPdf: language === 'ko' ? 'PDF 업로드' : 'Upload PDF',
      pasteText: language === 'ko' ? '텍스트 붙여넣기' : 'Paste Full Text',
      addNote: language === 'ko' ? '메모 추가' : 'Add Note',
      aiPersona: language === 'ko' ? 'AI 프로필 분석' : 'AI Profile Summary',
      analyzeMe: language === 'ko' ? '나를 분석해줘' : 'Analyze Me',
      analyzing: language === 'ko' ? '분석중...' : 'Analyzing...',
      reading: language === 'ko' ? '읽는중...' : 'Reading...',
      refresh: language === 'ko' ? '분석 새로고침' : 'Refresh Analysis',
      noContext: language === 'ko' ? '아직 추가된 내용이 없습니다.' : 'No context added yet.',
      active: language === 'ko' ? '사용중' : 'Active',
      inactive: language === 'ko' ? '비활성' : 'Inactive',
  };

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
        let content = "";
        
        if (file.type === 'application/pdf') {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            const base64Data = base64.split(',')[1];
            content = await extractTextFromPdf(base64Data, file.type);

        } else {
            content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }

        onAddItem({
            id: crypto.randomUUID(),
            type: 'resume',
            title: file.name,
            content: content,
            dateAdded: Date.now(),
            isActive: true
        });

    } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to process file. Please try again.");
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    onAddItem({
      id: crypto.randomUUID(),
      type: noteType,
      title: noteTitle || `${noteType.charAt(0).toUpperCase() + noteType.slice(1)}`,
      content: noteContent,
      dateAdded: Date.now(),
      isActive: true
    });
    setNoteContent('');
    setNoteTitle('');
    setIsAddingNote(false);
  };

  const handleGeneratePersona = async () => {
      const activeItems = items.filter(i => i.isActive);
      if (activeItems.length === 0) {
          alert(language === 'ko' ? '활성화된 항목이 없습니다.' : 'No active items selected.');
          return;
      }
      setIsAnalyzingPersona(true);
      try {
          const result = await generateUserPersona(activeItems, language);
          setPersona(result);
      } catch (error) {
          console.error(error);
      } finally {
          setIsAnalyzingPersona(false);
      }
  };

  const getIcon = (type: ContextType) => {
    switch (type) {
      case 'resume': return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'hobby': return <Coffee className="w-4 h-4 text-orange-500" />;
      case 'value': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'experience': return <Book className="w-4 h-4 text-blue-500" />;
      default: return <Lightbulb className="w-4 h-4 text-amber-500" />;
    }
  };

  // COMPACT MODE
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
         <div className="flex -space-x-2 overflow-hidden mr-2">
            {items.filter(i => i.isActive).slice(0, 3).map((item) => (
                <div key={item.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center" title={item.title}>
                    {getIcon(item.type)}
                </div>
            ))}
         </div>
         <button 
            onClick={() => setIsAddingNote(true)} 
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
         >
            {language === 'ko' ? '프로필 수정' : 'Edit Profile'}
         </button>
      </div>
    );
  }

  // FULL MODE
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-3xl mx-auto transition-all">
      {/* Header Section */}
      <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
         <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {t.myContext}
                <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
            </h3>
            <p className="text-sm text-slate-500">
                {language === 'ko' ? '이력서, 취미, 가치관을 업로드하세요.' : 'Upload resumes, hobbies, or values — we connect the dots.'}
            </p>
         </div>
         <div className="flex flex-wrap gap-2">
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 px-3 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-70"
             >
                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} 
                {isUploading ? t.reading : t.uploadPdf}
             </button>

             <button 
                onClick={() => { 
                    setIsAddingNote(true); 
                    setNoteType('resume'); 
                    setNoteTitle(language === 'ko' ? '텍스트 이력서' : 'Full Text Resume'); 
                    setNoteContent(''); 
                }}
                className="flex items-center gap-2 text-xs font-bold bg-indigo-600 text-white border border-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
             >
                <FileText className="w-3 h-3" /> {t.pasteText}
             </button>

             <button 
                onClick={() => { setIsAddingNote(true); setNoteType('hobby'); setNoteTitle(''); setNoteContent(''); }}
                className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
             >
                <Plus className="w-3 h-3" /> {t.addNote}
             </button>
         </div>
      </div>

      {/* Persona Analysis Section */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex items-center justify-between mb-4">
               <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                   <Sparkles className="w-4 h-4 text-amber-500" />
                   {t.aiPersona}
               </h4>
               {!persona && items.length > 0 && (
                   <button 
                    onClick={handleGeneratePersona}
                    disabled={isAnalyzingPersona}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
                   >
                       {isAnalyzingPersona ? t.analyzing : t.analyzeMe} <ChevronRight className="w-3 h-3" />
                   </button>
               )}
          </div>
          
          {persona ? (
              <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm text-sm text-slate-700 leading-relaxed animate-in fade-in">
                   <ReactMarkdown className="prose prose-sm prose-indigo max-w-none">
                       {persona}
                   </ReactMarkdown>
                   <div className="mt-2 text-right">
                       <button 
                        onClick={handleGeneratePersona} 
                        className="text-xs text-slate-400 hover:text-indigo-600 underline"
                       >
                           {t.refresh}
                       </button>
                   </div>
              </div>
          ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl text-center text-xs text-slate-400">
                  {items.length > 0 
                    ? (language === 'ko' ? "'나를 분석해줘'를 눌러 AI가 보는 나의 프로필을 확인하세요." : "Click 'Analyze Me' to see how the AI interprets your holistic profile.")
                    : (language === 'ko' ? "이력서나 취미를 추가하여 나만의 페르소나를 생성하세요." : "Add some items (Resume, Hobbies) to generate your unique persona.")
                  }
              </div>
          )}
      </div>

      {/* Items List Section */}
      <div className="p-6">
         {isAddingNote && (
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                    {(['resume', 'hobby', 'value', 'experience', 'note'] as ContextType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setNoteType(t)}
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors whitespace-nowrap ${noteType === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <input 
                    className="w-full mb-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Title"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                />
                <textarea 
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                    placeholder="Content..."
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsAddingNote(false)} className="text-xs font-bold text-slate-500 px-3 py-2 hover:bg-slate-200 rounded-lg">Cancel</button>
                    <button onClick={handleAddNote} className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Save Item</button>
                </div>
            </div>
         )}

         {items.length === 0 ? (
             <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                 <p>{t.noContext}</p>
             </div>
         ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {items.map(item => (
                     <div 
                        key={item.id} 
                        className={`group relative bg-white p-4 rounded-xl border transition-all cursor-pointer ${
                            item.isActive 
                            ? 'border-slate-200 hover:border-indigo-300 hover:shadow-md' 
                            : 'border-slate-100 opacity-60 bg-slate-50'
                        }`}
                        onClick={() => setSelectedItem(item)}
                     >
                         <div className="flex items-start gap-3">
                             <div className={`p-2.5 rounded-lg transition-colors ${item.isActive ? 'bg-slate-50 group-hover:bg-indigo-50' : 'bg-slate-100'}`}>
                                 {getIcon(item.type)}
                             </div>
                             <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start mb-1">
                                     <h4 className={`font-bold text-sm truncate pr-2 ${item.isActive ? 'text-slate-800' : 'text-slate-500 line-through'}`}>
                                         {item.title}
                                     </h4>
                                     
                                     <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                         {onToggleItem && (
                                            <button
                                                onClick={() => onToggleItem(item.id)}
                                                className={`p-1 rounded-md transition-colors ${item.isActive ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-200'}`}
                                                title={item.isActive ? "Deactivate (Exclude from analysis)" : "Activate"}
                                            >
                                                {item.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                            </button>
                                         )}
                                         <button 
                                            onClick={() => onRemoveItem(item.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            title="Delete"
                                         >
                                            <X className="w-3 h-3" />
                                         </button>
                                     </div>
                                 </div>
                                 <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.content.substring(0, 100)}</p>
                                 
                                 <div className="flex items-center justify-between mt-3">
                                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${item.isActive ? 'text-slate-400 bg-slate-50' : 'text-slate-400 bg-transparent'}`}>
                                        {item.type}
                                    </span>
                                    <span className={`text-[10px] font-medium flex items-center gap-1 ${item.isActive ? 'text-indigo-400 opacity-0 group-hover:opacity-100' : 'text-slate-400 opacity-50'}`}>
                                        {item.isActive ? t.active : t.inactive}
                                    </span>
                                 </div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {/* View Details Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
              <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                              {getIcon(selectedItem.type)}
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-slate-900">{selectedItem.title}</h3>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedItem.type}</span>
                          </div>
                      </div>
                      <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                          <X className="w-5 h-5 text-slate-500" />
                      </button>
                  </div>
                  <div className="p-8 overflow-y-auto prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">{selectedItem.content}</pre>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                      <button 
                        onClick={() => setSelectedItem(null)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".txt,.md,.pdf" 
      />
    </div>
  );
};
