import { useState } from 'react';
import { Trash2, Tag, Layers, HelpCircle, CheckCircle, Sparkles } from 'lucide-react';

interface AnnotationListPanelProps {
  manualMatched: any[];
  manualMissing: any[];
  aiSuggestions: any[];
  onRemoveManualMatched: (index: number) => void;
  onRemoveManualMissing: (index: number) => void;
  onRemoveAiSuggestion?: (index: number) => void;
}

export function AnnotationListPanel({
  manualMatched,
  manualMissing,
  aiSuggestions,
  onRemoveManualMatched,
  onRemoveManualMissing,
  onRemoveAiSuggestion,
}: AnnotationListPanelProps) {
  const [tab, setTab] = useState<'all' | 'manual' | 'ai' | 'matched' | 'missing'>('all');

  // Convert and unify list for display
  const allItems = [
    ...manualMatched.map((item, idx) => ({
      ...item,
      source: 'manual' as const,
      status: 'matched' as const,
      displayIndex: idx,
      meaning: item.meaningVi || item.vocabulary?.meaningVi || '',
      typeDisplay: item.type || '',
    })),
    ...manualMissing.map((item, idx) => ({
      ...item,
      source: 'manual' as const,
      status: 'missing' as const,
      displayIndex: idx,
      meaning: item.suggestedVocabulary?.meaningVi || '',
      typeDisplay: item.suggestedVocabulary?.type || '',
    })),
    ...aiSuggestions.map((item, idx) => {
      const isMatched = item.status === 'matched';
      const sv = item.suggestedVocabulary || {};
      return {
        ...item,
        source: 'ai' as const,
        status: isMatched ? ('matched' as const) : ('missing' as const),
        displayIndex: idx,
        meaning: isMatched
          ? item.vocabulary?.meaningVi || ''
          : sv.meaningVi || '',
        typeDisplay: isMatched ? item.vocabulary?.type || item.type : sv.type || item.type,
      };
    }),
  ];

  // Manual overrides AI check: if an AI suggestion has same normalized text or overlaps with a manual one, filter it out from display
  const manualNormalizedSet = new Set(
    [...manualMatched, ...manualMissing].map((m) => m.normalizedText)
  );

  const displayItems = allItems.filter((item) => {
    // Override filter: if it's an AI suggestion and a manual item with the same normalized text exists, hide it.
    if (item.source === 'ai' && manualNormalizedSet.has(item.normalizedText)) {
      return false;
    }

    if (tab === 'all') return true;
    if (tab === 'manual') return item.source === 'manual';
    if (tab === 'ai') return item.source === 'ai';
    if (tab === 'matched') return item.status === 'matched';
    if (tab === 'missing') return item.status === 'missing';
    return true;
  });

  // Sort display items by start offset if available, otherwise by text
  displayItems.sort((a, b) => {
    if (a.start !== undefined && b.start !== undefined) {
      return a.start - b.start;
    }
    return a.text.localeCompare(b.text);
  });

  const handleDelete = (item: any) => {
    if (item.source === 'manual') {
      if (item.status === 'matched') {
        onRemoveManualMatched(item.displayIndex);
      } else {
        onRemoveManualMissing(item.displayIndex);
      }
    } else if (onRemoveAiSuggestion) {
      onRemoveAiSuggestion(item.displayIndex);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-100/80 p-4 md:p-5 rounded-3xl space-y-4">
      <div>
        <h3 className="text-sm font-black text-text-primary flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-brand-pink" />
          Annotation Workspace List
        </h3>
        <p className="text-[10px] text-text-secondary mt-0.5">
          Manage highlights here. Remove a manual highlight, or select it again in the preview to replace it.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200/50 pb-1.5">
        {(['all', 'manual', 'ai', 'matched', 'missing'] as const).map((t) => {
          const count = allItems.filter((item) => {
            if (item.source === 'ai' && manualNormalizedSet.has(item.normalizedText)) {
              return false;
            }
            if (t === 'all') return true;
            if (t === 'manual') return item.source === 'manual';
            if (t === 'ai') return item.source === 'ai';
            if (t === 'matched') return item.status === 'matched';
            if (t === 'missing') return item.status === 'missing';
            return true;
          }).length;

          const label =
            t === 'all'
              ? 'All'
              : t === 'manual'
              ? 'Manual'
              : t === 'ai'
              ? 'AI Suggestions'
              : t === 'matched'
              ? 'Matched'
              : 'Missing';

          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold transition ${
                tab === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-text-secondary border border-gray-100 hover:bg-slate-100'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {displayItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary italic bg-white border border-gray-100 rounded-2xl">
            No annotations found for this filter. Select text in the editor to add annotations.
          </div>
        ) : (
          displayItems.map((item, idx) => {
            const isManual = item.source === 'manual';
            const isMatched = item.status === 'matched';

            return (
              <div
                key={`${item.source}-${item.status}-${idx}`}
                className="bg-white border border-gray-100 rounded-2xl p-3 shadow-soft hover:shadow-pastel transition flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-extrabold text-brand-pink truncate max-w-[140px]" title={item.text}>
                      {item.text}
                    </span>
                    {item.start !== undefined && (
                      <span className="text-[9px] text-text-muted font-mono font-medium">
                        [{item.start}-{item.end}]
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-text-primary text-xs leading-relaxed truncate">
                    {item.meaning || <span className="text-rose-500 italic">[No meaning provided]</span>}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {/* Source badge */}
                    <span
                      className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5 uppercase tracking-wide border ${
                        isManual
                          ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
                          : 'bg-brand-pink/10 text-brand-pink border-brand-pink/20'
                      }`}
                    >
                      {isManual ? <Tag className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                      {item.source}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5 uppercase tracking-wide border ${
                        isMatched
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {isMatched ? <CheckCircle className="w-2.5 h-2.5" /> : <HelpCircle className="w-2.5 h-2.5" />}
                      {item.status}
                    </span>

                    {/* Type display */}
                    {item.typeDisplay && (
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[8px] font-extrabold capitalize">
                        {item.typeDisplay.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button (AI suggestions can only be deleted if handler is passed, manual annotations can always be deleted) */}
                {(isManual || onRemoveAiSuggestion) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-text-secondary hover:text-rose-600 hover:bg-rose-50 rounded-full transition shrink-0"
                    title="Remove highlight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
