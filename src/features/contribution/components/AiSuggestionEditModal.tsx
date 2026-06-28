import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { ContributionAiVocabularyItem } from '../api/contributionReadingApi';

interface AiSuggestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patch: Partial<ContributionAiVocabularyItem>) => void;
  suggestion: ContributionAiVocabularyItem | null;
}

export function AiSuggestionEditModal({
  isOpen,
  onClose,
  onSave,
  suggestion,
}: AiSuggestionEditModalProps) {
  const [text, setText] = useState('');
  const [type, setType] = useState<any>('single_word');
  const [level, setLevel] = useState<any>('A1');
  const [meaningVi, setMeaningVi] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');

  useEffect(() => {
    if (suggestion) {
      setText(suggestion.text || '');
      setType(suggestion.type || 'single_word');
      setLevel(suggestion.level || 'A1');
      setMeaningVi(suggestion.meaningVi || '');
      setExampleEn(suggestion.exampleEn || '');
      setExampleVi(suggestion.exampleVi || '');
    }
  }, [suggestion, isOpen]);

  if (!isOpen || !suggestion) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      text,
      type,
      level,
      meaningVi,
      exampleEn: exampleEn || null,
      exampleVi: exampleVi || null,
      userEdited: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-black text-text-primary">Edit Suggestion</h3>
            <p className="text-xs text-text-secondary mt-0.5">Refine the suggested vocabulary details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-text-secondary hover:bg-slate-50 hover:text-text-primary rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Word / Phrase</label>
              <input
                type="text"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-text-primary text-sm font-medium focus:bg-white focus:border-brand-pink"
              >
                <option value="single_word">Single Word</option>
                <option value="compound_word">Compound Word</option>
                <option value="collocation">Collocation</option>
                <option value="phrasal_verb">Phrasal Verb</option>
                <option value="idiom">Idiom</option>
                <option value="fixed_phrase">Fixed Phrase</option>
                <option value="sentence_pattern">Sentence Pattern</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">CEFR Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-text-primary text-sm font-medium focus:bg-white focus:border-brand-pink"
              >
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Vietnamese Meaning</label>
              <input
                type="text"
                required
                value={meaningVi}
                onChange={(e) => setMeaningVi(e.target.value)}
                className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
              />
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 space-y-4">
            <span className="text-xs font-extrabold text-brand-pink uppercase tracking-widest block">Usage Example</span>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Example (English)</label>
              <input
                type="text"
                value={exampleEn}
                onChange={(e) => setExampleEn(e.target.value)}
                placeholder="e.g. He is very friendly."
                className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary block">Example (Vietnamese)</label>
              <input
                type="text"
                value={exampleVi}
                onChange={(e) => setExampleVi(e.target.value)}
                placeholder="e.g. Anh ấy rất thân thiện."
                className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition"
              />
            </div>
          </div>

          {/* Footer inside Form */}
          <div className="pt-4 flex justify-end gap-2.5 border-t border-gray-50 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-text-secondary font-bold text-xs rounded-full transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-6 py-2.5 bg-brand-pink text-white font-extrabold text-xs rounded-full shadow-pastel hover:bg-brand-pink/90 active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
