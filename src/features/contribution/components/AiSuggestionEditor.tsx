import { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import type { AiCandidateItem } from '../api/contributionReadingApi';
import { DuplicateStatusBadge } from '../../admin-reading-ai/components/DuplicateStatusBadge';
import { AiSuggestionEditModal } from './AiSuggestionEditModal';

interface AiSuggestionEditorProps {
  items: AiCandidateItem[];
  onChange: (newItems: AiCandidateItem[]) => void;
}

export function AiSuggestionEditor({ items, onChange }: AiSuggestionEditorProps) {
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [tabFilter, setTabFilter] = useState<'all' | 'matched' | 'missing' | 'phrases' | 'words'>('all');

  const getDisplayFields = (item: any) => {
    if (item.status === 'matched') {
      return {
        text: item.vocabulary?.text || item.text,
        type: item.vocabulary?.type || item.type,
        level: item.vocabulary?.level || 'A1',
        meaningVi: item.vocabulary?.meaningVi || '',
        exampleEn: item.ai?.sourceText || '',
        exampleVi: '',
        duplicateStatus: 'exists_in_dictionary' as const,
      };
    } else {
      const sv = item.suggestedVocabulary || {};
      return {
        text: sv.text || item.text,
        type: sv.type || item.type,
        level: sv.level || 'A1',
        meaningVi: sv.meaningVi || '',
        exampleEn: sv.exampleEn || sv.sourceText || '',
        exampleVi: sv.exampleVi || '',
        duplicateStatus: 'new' as const,
      };
    }
  };

  const handleEdit = (item: AiCandidateItem) => {
    const fields = getDisplayFields(item);
    setEditingItem({
      text: fields.text,
      type: fields.type,
      level: fields.level,
      meaningVi: fields.meaningVi,
      exampleEn: fields.exampleEn,
      exampleVi: fields.exampleVi,
      originalItem: item, // reference to original
    });
  };

  const handleRemove = (item: AiCandidateItem) => {
    const next = items.filter((x) => x.text !== item.text);
    onChange(next);
  };

  const handleSaveEdit = (patch: Partial<any>) => {
    if (!editingItem) return;
    const orig = editingItem.originalItem;

    const next = items.map((x) => {
      if (x.text === orig.text) {
        if (x.status === 'matched') {
          return {
            ...x,
            text: patch.text || x.text,
            type: patch.type || x.type,
            vocabulary: {
              ...x.vocabulary,
              text: patch.text || x.vocabulary.text,
              type: patch.type || x.vocabulary.type,
              level: patch.level || x.vocabulary.level,
              meaningVi: patch.meaningVi || x.vocabulary.meaningVi,
            },
          };
        } else {
          return {
            ...x,
            text: patch.text || x.text,
            type: patch.type || x.type,
            suggestedVocabulary: {
              ...x.suggestedVocabulary,
              text: patch.text || x.suggestedVocabulary.text,
              type: patch.type || x.suggestedVocabulary.type,
              level: patch.level || x.suggestedVocabulary.level,
              meaningVi: patch.meaningVi || x.suggestedVocabulary.meaningVi,
              exampleEn: patch.exampleEn || x.suggestedVocabulary.exampleEn,
              exampleVi: patch.exampleVi || x.suggestedVocabulary.exampleVi,
            },
          };
        }
      }
      return x;
    });

    onChange(next);
    setEditingItem(null);
  };

  const handleAddCustom = () => {
    const newItem = {
      text: '',
      type: 'single_word',
      level: 'A2',
      meaningVi: '',
      exampleEn: '',
      exampleVi: '',
      originalItem: null,
    };
    setEditingItem(newItem);
    setIsAdding(true);
  };

  const handleSaveAdd = (patch: Partial<any>) => {
    if (isAdding) {
      const newItem: AiCandidateItem = {
        text: patch.text || '',
        normalizedText: (patch.text || '').trim().toLowerCase(),
        type: patch.type || 'single_word',
        status: 'missing',
        vocabularyId: null,
        suggestedVocabulary: {
          text: patch.text || '',
          normalizedText: (patch.text || '').trim().toLowerCase(),
          type: patch.type || 'single_word',
          level: patch.level || 'A2',
          meaningVi: patch.meaningVi || '',
          exampleEn: patch.exampleEn || null,
          exampleVi: patch.exampleVi || null,
          forms: patch.text ? [patch.text] : [],
          topics: [],
          confidence: 1.0,
        },
      };
      onChange([...items, newItem]);
      setIsAdding(false);
      setEditingItem(null);
    } else {
      handleSaveEdit(patch);
    }
  };

  const filteredItems = items.filter((item) => {
    if (tabFilter === 'all') return true;
    if (tabFilter === 'matched') return item.status === 'matched';
    if (tabFilter === 'missing') return item.status === 'missing';
    if (tabFilter === 'phrases') return item.type !== 'single_word';
    if (tabFilter === 'words') return item.type === 'single_word';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">Suggested Vocabulary Items ({items.length})</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">These items will be sent with your reading contribution for admin approval.</p>
        </div>
        <button
          type="button"
          onClick={handleAddCustom}
          className="flex items-center gap-1 px-4 py-2 bg-brand-pink/10 hover:bg-brand-pink/15 text-brand-pink font-bold text-xs rounded-full transition self-end sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Word Manually
        </button>
      </div>

      {/* Tabs */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-gray-100 pb-1.5 text-[11px] font-bold">
          {(['all', 'matched', 'missing', 'phrases', 'words'] as const).map((tab) => {
            const count = items.filter((x) => {
              if (tab === 'all') return true;
              if (tab === 'matched') return x.status === 'matched';
              if (tab === 'missing') return x.status === 'missing';
              if (tab === 'phrases') return x.type !== 'single_word';
              if (tab === 'words') return x.type === 'single_word';
              return true;
            }).length;

            const label = tab === 'all' ? 'All' 
              : tab === 'matched' ? 'Matched (In DB)' 
              : tab === 'missing' ? 'Missing (New)' 
              : tab === 'phrases' ? 'Phrases' 
              : 'Single Words';

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setTabFilter(tab)}
                className={`px-3 py-1.5 rounded-full transition ${
                  tabFilter === tab
                    ? 'bg-brand-pink text-white shadow-sm'
                    : 'bg-slate-50 text-text-secondary hover:bg-slate-100'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="py-8 text-center text-text-secondary text-xs italic bg-slate-50 border border-slate-100/50 rounded-2xl">
          {items.length === 0 
            ? 'No vocabulary suggestions yet. Enter some content above and click "Analyze with AI".'
            : 'No items match the selected filter.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-150 text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                  <th className="px-4 py-2.5">Vocabulary / Type</th>
                  <th className="px-4 py-2.5">Level</th>
                  <th className="px-4 py-2.5">Vietnamese Meaning</th>
                  <th className="px-4 py-2.5">Duplicate Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-text-primary">
                {filteredItems.map((item) => {
                  const fields = getDisplayFields(item);
                  return (
                    <tr key={fields.text} className="hover:bg-slate-50/20 transition duration-150">
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-brand-pink text-xs">{fields.text}</p>
                          <p className="text-[9px] text-text-muted capitalize">
                            {fields.type.replace('_', ' ')}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold">
                          {fields.level}
                        </span>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold">{fields.meaningVi || <span className="text-rose-500 italic">[No meaning]</span>}</p>
                          {fields.exampleEn && (
                            <p className="text-[9px] text-text-secondary italic">
                              "{fields.exampleEn}"
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <DuplicateStatusBadge status={fields.duplicateStatus} />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="p-1.5 hover:bg-slate-50 text-text-secondary hover:text-text-primary rounded-full transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-full transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AiSuggestionEditModal
        isOpen={Boolean(editingItem)}
        onClose={() => {
          setEditingItem(null);
          setIsAdding(false);
        }}
        onSave={handleSaveAdd}
        suggestion={editingItem}
      />
    </div>
  );
}
