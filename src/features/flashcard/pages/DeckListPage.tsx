import { useState } from 'react';
import type { FormEvent } from 'react';
import { useFlashcardDecks } from '../hooks/useFlashcardDecks';
import { Link } from 'react-router-dom';
import { Loading } from '../../../shared/components/Loading';
import { 
  Layers, 
  Plus, 
  Globe, 
  Lock, 
  Play, 
  Info,
  Sparkles,
  X
} from 'lucide-react';

export function DeckListPage() {
  const { data, isLoading, createDeck } = useFlashcardDecks();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Deck name is required.');
      return;
    }
    try {
      await createDeck.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      });
      setName('');
      setDescription('');
      setVisibility('private');
      setShowModal(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create deck.');
    }
  };

  if (isLoading) return <Loading />;

  const myDecks = data?.myDecks || [];
  const publicDecks = data?.publicDecks || [];

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Flashcard Decks</h1>
          <p className="text-text-secondary mt-1 text-base">Study words using spacing repetition (SRS) card flipping.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-brand-pink text-white font-extrabold rounded-full shadow-pastel hover:bg-brand-pink/90 hover:scale-105 active:scale-95 transition-all-180 shrink-0 text-sm"
        >
          <Plus className="w-5 h-5" />
          Create Deck
        </button>
      </div>

      {/* Personal Decks Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Layers className="w-6 h-6 text-brand-pink" />
          <h2 className="text-2xl font-bold text-text-primary">My Decks</h2>
        </div>

        {myDecks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myDecks.map((deck: any) => (
              <div
                key={deck.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-pastel hover:scale-[1.02] active:scale-[0.99] transition-all-180 duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-brand-pink/15 text-brand-pink px-2.5 py-1 rounded-full flex items-center gap-1">
                      {deck.visibility === 'public' ? (
                        <>
                          <Globe className="w-3 h-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Private
                        </>
                      )}
                    </span>
                    <span className="text-xs font-bold text-text-secondary">
                      {deck.cardCount} cards
                    </span>
                  </div>

                  <Link to={`/flashcards/${deck.id}`}>
                    <h3 className="text-xl font-black text-text-primary hover:text-brand-pink transition line-clamp-1 mb-1.5">
                      {deck.name}
                    </h3>
                  </Link>

                  {deck.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{deck.description}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-3">
                  <Link
                    to={`/flashcards/${deck.id}/review`}
                    className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-extrabold rounded-full shadow-soft hover:scale-105 active:scale-95 transition-all-180"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Review
                  </Link>
                  <Link
                    to={`/flashcards/${deck.id}`}
                    className="p-2.5 border border-gray-150 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-full transition-all-180 hover:scale-105 active:scale-95"
                  >
                    <Info className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <Layers className="w-12 h-12 text-text-muted mx-auto" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-text-primary text-base">No Decks Yet</h4>
              <p className="text-text-secondary text-sm leading-relaxed">Create your first flashcard deck to start building vocabulary memory.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-pink/15 text-brand-pink text-xs font-bold rounded-full hover:bg-brand-pink/25 hover:scale-105 active:scale-95 transition-all-180"
            >
              <Plus className="w-4 h-4" />
              Create your first deck
            </button>
          </div>
        )}
      </section>

      {/* Public Decks Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Globe className="w-6 h-6 text-brand-blue" />
          <h2 className="text-2xl font-bold text-text-primary">Explore Public Decks</h2>
        </div>

        {publicDecks.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicDecks.map((deck: any) => (
              <div
                key={deck.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-pastel hover:scale-[1.02] active:scale-[0.99] transition-all-180 duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-brand-blue/10 text-brand-blue px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Public Study
                    </span>
                    <span className="text-xs font-bold text-text-secondary">
                      {deck.cardCount} cards
                    </span>
                  </div>

                  <Link to={`/flashcards/${deck.id}`}>
                    <h3 className="text-xl font-black text-text-primary hover:text-brand-pink transition mb-1.5">
                      {deck.name}
                    </h3>
                  </Link>

                  {deck.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{deck.description}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-muted">
                    Shared deck
                  </span>
                  
                  <Link
                    to={`/flashcards/${deck.id}`}
                    className="flex items-center gap-1 text-xs font-extrabold text-brand-blue hover:text-brand-pink transition uppercase tracking-wider"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm italic">No public decks shared by other users at the moment.</p>
        )}
      </section>

      {/* Create Deck Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-gray-100 shadow-xl space-y-6 relative animate-scale-up">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-text-secondary hover:text-text-primary p-1 hover:bg-gray-100 rounded-full transition-all-180"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex w-10 h-10 bg-brand-pink/20 rounded-xl items-center justify-center text-brand-pink">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight">Create New Deck</h3>
              <p className="text-xs text-text-secondary font-medium">Group cards together for custom spaced-reviews.</p>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-3">{errorMsg}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Deck Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TOEFL Essential Vocabulary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition duration-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Description</label>
                <textarea
                  placeholder="Write a brief overview of this vocabulary deck..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-pink focus:bg-white text-text-primary text-sm font-medium transition duration-200 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={`py-3 rounded-full font-bold text-xs transition-all-180 hover:scale-[1.02] active:scale-[0.98] ${
                      visibility === 'private'
                        ? 'bg-brand-pink text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-100 text-text-secondary hover:bg-slate-100'
                    }`}
                  >
                    Private (Just Me)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={`py-3 rounded-full font-bold text-xs transition-all-180 hover:scale-[1.02] active:scale-[0.98] ${
                      visibility === 'public'
                        ? 'bg-brand-pink text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-100 text-text-secondary hover:bg-slate-100'
                    }`}
                  >
                    Public (Everyone)
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-150 text-text-secondary bg-white hover:bg-gray-50 rounded-full font-bold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDeck.isPending}
                  className="flex-1 py-3 bg-brand-pink text-white hover:bg-brand-pink/90 rounded-full font-bold text-sm shadow-soft transition"
                >
                  {createDeck.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
