import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddJobFormProps {
  onAdd: (title: string, company: string, description: string) => void;
}

export const AddJobForm: React.FC<AddJobFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    onAdd(title, company, description);
    
    // Reset
    setTitle('');
    setCompany('');
    setDescription('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2 group h-[120px]"
      >
        <div className="bg-slate-100 group-hover:bg-white p-2 rounded-full transition-colors">
            <Plus className="w-6 h-6" />
        </div>
        <span className="font-medium">Add New Job Description</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-indigo-200 shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">New Job Details</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Job Title *</label>
                <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company (Optional)</label>
                <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
            </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Job Description / Requirements *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[150px] text-sm"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Job
          </button>
        </div>
      </form>
    </div>
  );
};
