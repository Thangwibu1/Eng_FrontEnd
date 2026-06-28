import { useParams, Link } from 'react-router-dom';
import { useDeckDetail } from '../hooks/useDeckDetail';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { 
  ArrowLeft, 
  Play, 
  Globe, 
  Lock, 
  Layers
} from 'lucide-react';

export function DeckDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useDeckDetail(id!);

  if (isLoading) return <Loading />;
  if (!data) return <EmptyState title="Deck not found" description="The flashcard deck does not exist." />;

  const { deck, cards } = data;

  return (
    <div className="py-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link to="/flashcards" className="flex items-center gap-1.5 text-text-secondary hover:text-brand-pink font-bold text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to Decks
      </Link>

      {/* Deck Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:scale-[1.01] transition-all-180 duration-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
            <span className="bg-brand-pink/15 text-brand-pink px-2.5 py-1 rounded-full flex items-center gap-1">
              {deck.visibility === 'public' ? (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Private
                </>
              )}
            </span>
            <span>· {cards.length} cards</span>
          </div>

          <h1 className="text-3xl font-black text-text-primary tracking-tight">{deck.name}</h1>
          {deck.description && (
            <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-xl">{deck.description}</p>
          )}
        </div>

        {cards.length > 0 && (
          <Link
            to={`/flashcards/${deck.id || deck._id}/review`}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-extrabold rounded-full shadow-soft hover:scale-105 active:scale-95 transition-all-180 whitespace-nowrap text-sm"
          >
            <Play className="w-4.5 h-4.5 fill-white" />
            Start Review
          </Link>
        )}
      </div>

      {/* Cards List */}
      <div className="mt-10 space-y-6">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 pb-2 border-b border-gray-100">
          <Layers className="w-5 h-5 text-brand-pink" />
          Cards in Deck ({cards.length})
        </h2>

        {cards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card: any) => (
              <div 
                key={card.id}
                className="bg-white rounded-2xl border border-gray-50 p-5 shadow-sm space-y-3 hover:border-brand-pink/25 hover:scale-[1.01] transition-all-180 duration-300"
              >
                <div>
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-1">Front</span>
                  <p className="text-lg font-black text-text-primary">{card.front}</p>
                </div>
                
                <div className="pt-2.5 border-t border-gray-50">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-1">Back</span>
                  <p className="text-sm font-bold text-brand-pink">{card.back}</p>
                  {card.example && (
                    <p className="text-xs text-text-secondary italic mt-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                      "{card.example}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <Layers className="w-12 h-12 text-text-muted mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-text-primary">No cards in this deck yet</h3>
              <p className="text-text-secondary text-sm mt-1 max-w-sm mx-auto leading-relaxed">
                Start reading context articles or visit the Dictionary to lookup and save words into this deck.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/readings"
                className="px-5 py-2.5 bg-brand-pink text-white font-bold text-xs rounded-full hover:bg-brand-pink/90 hover:scale-105 active:scale-95 transition-all-180 shadow-soft"
              >
                Go to Readings
              </Link>
              <Link
                to="/vocabularies"
                className="px-5 py-2.5 border border-gray-150 text-text-secondary bg-white font-bold text-xs rounded-full hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all-180"
              >
                Dictionary Search
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
