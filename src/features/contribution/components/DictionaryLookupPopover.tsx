import { X, Check, Book } from 'lucide-react';

interface DictionaryLookupPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  vocabulary: {
    id: string;
    text: string;
    normalizedText: string;
    type: string;
    level?: string;
    meaningVi: string;
    meaningEn?: string;
    forms: string[];
    topics: string[];
  } | null;
  onConfirm: () => void;
}

export function DictionaryLookupPopover({
  isOpen,
  onClose,
  vocabulary,
  onConfirm,
}: DictionaryLookupPopoverProps) {
  if (!isOpen || !vocabulary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-brand-pink" />
            <div>
              <h3 className="text-base font-black text-text-primary">Dictionary Lookup</h3>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Matched in dictionary</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:bg-slate-100 hover:text-text-primary rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-black text-brand-pink">{vocabulary.text}</h2>
              {vocabulary.level && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide">
                  {vocabulary.level}
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted capitalize">
              Type: {vocabulary.type.replace(/_/g, ' ')}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">Vietnamese Meaning</span>
              <p className="font-bold text-text-primary text-sm mt-0.5">{vocabulary.meaningVi}</p>
            </div>

            {vocabulary.meaningEn && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">English Definition</span>
                <p className="text-text-secondary text-xs font-medium mt-0.5">{vocabulary.meaningEn}</p>
              </div>
            )}
          </div>

          {vocabulary.forms.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">Other Forms</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {vocabulary.forms.map((f, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100/70 border border-slate-200/50 text-text-secondary text-[10px] px-2 py-0.5 rounded-md font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {vocabulary.topics.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block">Topics</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {vocabulary.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="bg-brand-pink/5 text-brand-pink text-[10px] px-2 py-0.5 rounded-md font-extrabold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-text-secondary font-bold text-xs rounded-full transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1 px-5 py-2 bg-brand-pink text-white font-extrabold text-xs rounded-full shadow-pastel hover:bg-brand-pink/90 active:scale-95 transition"
          >
            <Check className="w-4 h-4" />
            Use this vocabulary
          </button>
        </div>
      </div>
    </div>
  );
}
