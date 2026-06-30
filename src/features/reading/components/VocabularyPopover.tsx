import { useState, useRef, useEffect } from 'react';
import { Bookmark, CheckCircle2, AlertTriangle, Plus, X } from 'lucide-react';
import { useSaveVocabulary } from '../../vocabulary/hooks/useSaveVocabulary';
import { useMarkVocabularyKnown } from '../../vocabulary/hooks/useMarkVocabularyKnown';
import { useMarkVocabularyDifficult } from '../../vocabulary/hooks/useMarkVocabularyDifficult';
import { useMe } from '../../auth/hooks/useMe';
import { getMyDecks, addCardToDeck } from '../../flashcard/api/flashcardApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface VocabularyPopoverProps {
  readingId: string;
  span: any;
  vocabulary: any;
  onClose: () => void;
}

export function VocabularyPopover({
  vocabulary,
  onClose,
}: VocabularyPopoverProps) {
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const saveMutation = useSaveVocabulary();
  const knownMutation = useMarkVocabularyKnown();
  const difficultMutation = useMarkVocabularyDifficult();
  
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [addingToDeck, setAddingToDeck] = useState(false);
  const [deckMessage, setDeckMessage] = useState('');

  const popoverRef = useRef<HTMLDivElement>(null);
  const [positionClass, setPositionClass] = useState('bottom-full mb-3.5 left-0');

  useEffect(() => {
    if (popoverRef.current) {
      const parentElement = popoverRef.current.parentElement;
      if (parentElement) {
        const parentRect = parentElement.getBoundingClientRect();
        let vertical = 'bottom-full mb-3.5';
        let horizontal = 'left-0';

        // Check if there is enough space above (popover height is around ~380px + header height ~64px)
        if (parentRect.top < 450) {
          vertical = 'top-full mt-3.5';
        }

        // Check if there is enough space to the right (popover width is 320px)
        if (parentRect.left + 320 > window.innerWidth) {
          horizontal = 'right-0 left-auto';
        }

        setPositionClass(`${vertical} ${horizontal}`);
      }
    }
  }, []);

  // Fetch user decks if logged in
  const { data: decksData } = useQuery({
    queryKey: ['my-decks'],
    queryFn: getMyDecks,
    enabled: Boolean(user),
  });

  const firstMeaning = vocabulary.meanings?.[0];

  const handleSave = () => {
    saveMutation.mutate(vocabulary.id || vocabulary._id);
  };

  const handleKnown = () => {
    knownMutation.mutate(vocabulary.id || vocabulary._id);
  };

  const handleDifficult = () => {
    difficultMutation.mutate(vocabulary.id || vocabulary._id);
  };

  const handleAddToDeck = async () => {
    if (!selectedDeckId) return;
    setAddingToDeck(true);
    setDeckMessage('');
    try {
      await addCardToDeck(selectedDeckId, vocabulary.id || vocabulary._id);
      queryClient.invalidateQueries({ queryKey: ['me', 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'stats'] });
      setDeckMessage('Added successfully!');
      setTimeout(() => setDeckMessage(''), 3000);
    } catch (err: any) {
      setDeckMessage(err.userMessage || 'Already in deck');
    } finally {
      setAddingToDeck(false);
    }
  };

  return (
    <div ref={popoverRef} className={`absolute z-50 w-80 bg-white rounded-3xl border border-gray-100 p-5 shadow-pastel text-left text-sm leading-relaxed animate-fade-in ${positionClass}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-black text-text-primary text-lg">{vocabulary.text}</h3>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
            {vocabulary.type?.replace('_', ' ')} {vocabulary.level ? `· ${vocabulary.level}` : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition-all-180"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 border-t border-b border-gray-50 my-2 space-y-1">
        <p className="font-bold text-text-primary text-base leading-snug">{firstMeaning?.meaningVi}</p>
        {firstMeaning?.meaningEn && (
          <p className="text-xs text-text-secondary italic">{firstMeaning.meaningEn}</p>
        )}
      </div>

      {firstMeaning?.examples?.[0] && (
        <div className="mt-2 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          <p className="font-semibold text-text-primary">"{firstMeaning.examples[0].exampleEn}"</p>
          {firstMeaning.examples[0].exampleVi && (
            <p className="text-text-muted mt-1 font-medium">{firstMeaning.examples[0].exampleVi}</p>
          )}
        </div>
      )}

      {/* User Actions */}
      {user ? (
        <div className="mt-4 pt-3 border-t border-gray-50 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-pink/15 hover:bg-brand-pink/25 text-brand-pink text-[11px] font-bold rounded-full transition-all-180"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              Save
            </button>
            <button
              onClick={handleKnown}
              disabled={knownMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-blue text-[11px] font-bold rounded-full transition-all-180"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Known
            </button>
            <button
              onClick={handleDifficult}
              disabled={difficultMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-[11px] font-bold rounded-full transition-all-180"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Hard
            </button>
          </div>

          {/* Add to Deck option */}
          {decksData && decksData.myDecks?.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Add to Flashcard Deck</label>
              <div className="flex gap-2">
                <select
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="bg-gray-50 text-text-primary text-xs rounded-xl px-3 py-2 border-0 outline-none flex-grow focus:bg-white focus:ring-2 focus:ring-brand-pink transition"
                >
                  <option value="">Select deck...</option>
                  {decksData.myDecks.map((deck: any) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddToDeck}
                  disabled={addingToDeck || !selectedDeckId}
                  className="p-2.5 bg-brand-pink text-white rounded-xl hover:bg-brand-pink/90 disabled:opacity-50 transition-all-180 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {deckMessage && (
                <p className="text-[10px] font-bold text-brand-pink italic animate-fade-in">{deckMessage}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-text-secondary mt-3 italic text-center">Login to save words or add to decks</p>
      )}
    </div>
  );
}
