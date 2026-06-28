import { useState } from 'react';
import { Check, Edit2, X, AlertCircle } from 'lucide-react';
import type { AiVocabularySuggestion } from '../api/adminReadingAiApi';
import { AiSuggestionStatusBadge } from './AiSuggestionStatusBadge';
import { DuplicateStatusBadge } from './DuplicateStatusBadge';
import {
  useApproveAiSuggestion,
  useRejectAiSuggestion,
  useUpdateAiSuggestion,
} from '../hooks/useReadingAiSuggestions';
import { AiSuggestionEditModal } from './AiSuggestionEditModal';

interface AiSuggestionTableProps {
  readingId: string;
  items: AiVocabularySuggestion[];
}

export function AiSuggestionTable({ readingId, items }: AiSuggestionTableProps) {
  const approveMutation = useApproveAiSuggestion();
  const rejectMutation = useRejectAiSuggestion();
  const updateMutation = useUpdateAiSuggestion();

  const [editingItem, setEditingItem] = useState<AiVocabularySuggestion | null>(null);
  const [rejectingItem, setRejectingItem] = useState<AiVocabularySuggestion | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const handleApprove = async (item: AiVocabularySuggestion) => {
    if (confirm(`Approve suggestion "${item.text}"?`)) {
      try {
        await approveMutation.mutateAsync({
          suggestionId: item.id,
          readingId,
        });
      } catch (err) {
        console.error('Approval failed:', err);
      }
    }
  };

  const handleRejectClick = (item: AiVocabularySuggestion) => {
    setRejectingItem(item);
    setRejectNote('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    try {
      await rejectMutation.mutateAsync({
        suggestionId: rejectingItem.id,
        readingId,
        adminNote: rejectNote.trim() || undefined,
      });
      setRejectingItem(null);
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  const handleSaveEdit = async (patch: Partial<AiVocabularySuggestion>) => {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({
        suggestionId: editingItem.id,
        readingId,
        patch,
      });
      setEditingItem(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-text-secondary text-sm italic bg-slate-50 border border-slate-100/50 rounded-2xl">
        No vocabulary suggestions in this category.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-150/70 rounded-3xl overflow-hidden shadow-soft">
      {/* Table Container with scroll support */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-gray-150 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              <th className="px-5 py-3">Vocabulary / Type</th>
              <th className="px-5 py-3">Level</th>
              <th className="px-5 py-3">Vietnamese Meaning</th>
              <th className="px-5 py-3">Confidence</th>
              <th className="px-5 py-3">Duplicate Status</th>
              <th className="px-5 py-3">Reviewed Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs font-medium text-text-primary">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/30 transition duration-150">
                
                {/* Vocabulary & Type */}
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <p className="font-extrabold text-brand-pink text-sm">{item.text}</p>
                    <p className="text-[10px] text-text-muted capitalize">
                      {item.type.replace('_', ' ')} {item.partOfSpeech ? `(${item.partOfSpeech})` : ''}
                    </p>
                  </div>
                </td>

                {/* Level */}
                <td className="px-5 py-4 font-bold">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">
                    {item.level}
                  </span>
                </td>

                {/* Meaning & Examples */}
                <td className="px-5 py-4 max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-text-primary">{item.meaningVi}</p>
                    {item.exampleEn && (
                      <p className="text-[10px] text-text-secondary italic">
                        "{item.exampleEn}" → {item.exampleVi}
                      </p>
                    )}
                    {item.sourceText && (
                      <div className="text-[9px] text-text-muted mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-text-secondary">Context:</span> "{item.sourceText}"
                      </div>
                    )}
                  </div>
                </td>

                {/* Confidence */}
                <td className="px-5 py-4">
                  <span className={`font-bold ${item.confidence >= 0.8 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </td>

                {/* Duplicate Status */}
                <td className="px-5 py-4">
                  <DuplicateStatusBadge status={item.duplicateStatus} />
                </td>

                {/* Reviewed Status */}
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <AiSuggestionStatusBadge status={item.status} />
                    {item.adminNote && (
                      <p className="text-[9px] text-rose-500 italic max-w-[150px] truncate" title={item.adminNote}>
                        Note: "{item.adminNote}"
                      </p>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    {item.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={approveMutation.isPending}
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-full transition hover:scale-105 active:scale-95"
                        title="Approve & Import to Dictionary"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setEditingItem(item)}
                      disabled={updateMutation.isPending}
                      className="p-2 bg-slate-50 text-text-secondary hover:bg-slate-100 rounded-full transition hover:scale-105 active:scale-95"
                      title="Edit details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {item.status !== 'rejected' && (
                      <button
                        onClick={() => handleRejectClick(item)}
                        disabled={rejectMutation.isPending}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full transition hover:scale-105 active:scale-95"
                        title="Reject suggestion"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suggestion Edit Modal */}
      <AiSuggestionEditModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
        suggestion={editingItem}
        isSaving={updateMutation.isPending}
      />

      {/* Reject Reason Confirmation Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-100 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-full">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-text-primary text-base">Reject Vocabulary Suggestion</h4>
                <p className="text-xs text-text-secondary mt-0.5">Are you sure you want to reject "{rejectingItem.text}"?</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-secondary uppercase block">Rejection Feedback (Optional)</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Why is this suggestion rejected?"
                className="w-full h-20 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:border-brand-pink focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-text-secondary rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition active:scale-95"
              >
                Reject Suggestion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
