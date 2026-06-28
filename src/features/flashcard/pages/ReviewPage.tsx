import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDeckDetail } from '../hooks/useDeckDetail';
import { useReviewCard } from '../hooks/useReviewCard';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { 
  ArrowLeft, 
  RotateCw, 
  Award,
  CheckCircle2
} from 'lucide-react';

export function ReviewPage() {
  const { id } = useParams();
  const { data, isLoading } = useDeckDetail(id!);
  const reviewMutation = useReviewCard(id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  if (isLoading) return <Loading />;
  if (!data) return <EmptyState title="Deck not found" description="The flashcard deck does not exist." />;

  const { deck, cards } = data;

  if (cards.length === 0) {
    return (
      <div className="py-8 max-w-md mx-auto">
        <EmptyState 
          title="No cards to review" 
          description="This deck is empty. Add some vocabulary items to start studying!"
        />
        <div className="text-center mt-6">
          <Link to={`/flashcards/${id}`} className="px-6 py-2.5 bg-brand-pink text-white font-bold rounded-full shadow-pastel">
            Back to Deck Details
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    try {
      await reviewMutation.mutateAsync({
        deckId: id!,
        cardId: currentCard.id,
        vocabularyId: currentCard.vocabularyId,
        rating,
      });

      // Show flip back animation, then proceed
      setIsFlipped(false);
      setTimeout(() => {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setSessionCompleted(true);
        }
      }, 300);
    } catch (err) {
      console.error('Review submission error:', err);
    }
  };

  if (sessionCompleted) {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-6 animate-scale-up px-4">
        <div className="inline-flex w-20 h-20 bg-brand-pink/20 text-brand-pink rounded-full items-center justify-center mb-2 shadow-soft">
          <Award className="w-10 h-10 animate-bounce" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Congratulations! 🎉</h1>
          <p className="text-text-secondary text-sm font-medium leading-relaxed">
            You completed reviewing all <span className="font-bold text-brand-pink">{cards.length}</span> cards in <strong>{deck.name}</strong>.
          </p>
        </div>

        <div className="bg-brand-sky/10 border border-brand-sky/35 p-5 rounded-3xl text-left space-y-3">
          <h4 className="font-bold text-xs text-brand-blue uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            SRS Repetition Updated
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            The database scheduler has calculated the new review intervals. These cards will appear on your review list when they are next due.
          </p>
        </div>

        <div className="pt-4 flex gap-4">
          <Link
            to={`/flashcards/${id}`}
            className="flex-1 py-3.5 bg-brand-pink text-white hover:bg-brand-pink/90 font-bold rounded-full shadow-pastel text-sm transition"
          >
            Back to Deck
          </Link>
          <Link
            to="/flashcards"
            className="flex-grow py-3.5 border border-gray-150 text-text-secondary bg-white hover:bg-gray-50 font-bold rounded-full text-sm transition"
          >
            All Decks
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentIndex) / cards.length) * 100;

  return (
    <div className="py-6 max-w-xl mx-auto px-4 space-y-8">
      {/* Top action row */}
      <div className="flex justify-between items-center">
        <Link to={`/flashcards/${id}`} className="flex items-center gap-1 text-text-secondary hover:text-brand-pink font-bold text-sm transition">
          <ArrowLeft className="w-4 h-4" />
          Exit Review
        </Link>
        <span className="text-xs font-bold text-text-secondary">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-brand-pink to-brand-blue transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flip Card Container */}
      <div 
        className="w-full h-80 cursor-pointer relative"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="w-full h-full relative transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT Side */}
          <div
            className="absolute inset-0 bg-white rounded-3xl border border-gray-100 p-8 shadow-soft flex flex-col justify-between items-center select-none"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary bg-slate-50 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              Question
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-text-primary tracking-tight">{currentCard.front}</h2>
              <p className="text-xs text-text-muted font-bold tracking-widest uppercase mt-1.5">Click card to reveal meaning</p>
            </div>

            <button className="flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-pink transition mt-4">
              <RotateCw className="w-4 h-4 animate-spin-slow" />
              Flip Card
            </button>
          </div>

          {/* BACK Side */}
          <div
            className="absolute inset-0 bg-white rounded-3xl border border-brand-pink/30 p-8 shadow-pastel flex flex-col justify-between items-center select-none"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-pink bg-brand-pink/10 px-3 py-1 rounded-full">
              Answer
            </div>

            <div className="text-center space-y-4 max-w-sm">
              <div>
                <h3 className="text-3xl font-black text-text-primary tracking-tight">{currentCard.front}</h3>
                <p className="text-2xl font-black text-brand-pink mt-1">{currentCard.back}</p>
              </div>

              {currentCard.example && (
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs text-text-secondary italic">
                  "{currentCard.example}"
                </div>
              )}
            </div>

            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Tap to flip back</span>
          </div>
        </div>
      </div>

      {/* SRS Rating Actions (Only active if Flipped) */}
      <div className="space-y-4">
        {isFlipped ? (
          <div className="space-y-3 animate-fade-in">
            <p className="text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">Rate your recall difficulty</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Again */}
              <button
                onClick={(e) => { e.stopPropagation(); handleRating('again'); }}
                disabled={reviewMutation.isPending}
                className="py-3 px-2 bg-brand-pink/15 border border-brand-pink/25 hover:bg-brand-pink/25 text-brand-pink rounded-full font-extrabold text-xs transition duration-200 shadow-sm"
              >
                Again
              </button>

              {/* Hard */}
              <button
                onClick={(e) => { e.stopPropagation(); handleRating('hard'); }}
                disabled={reviewMutation.isPending}
                className="py-3 px-2 bg-[#F9F6C4] border border-amber-200 hover:bg-[#F9F6C4]/80 text-amber-800 rounded-full font-extrabold text-xs transition duration-200 shadow-sm"
              >
                Hard
              </button>

              {/* Good */}
              <button
                onClick={(e) => { e.stopPropagation(); handleRating('good'); }}
                disabled={reviewMutation.isPending}
                className="py-3 px-2 bg-[#89D4FF]/25 border border-[#89D4FF]/40 hover:bg-[#89D4FF]/40 text-brand-blue rounded-full font-extrabold text-xs transition duration-200 shadow-sm"
              >
                Good
              </button>

              {/* Easy */}
              <button
                onClick={(e) => { e.stopPropagation(); handleRating('easy'); }}
                disabled={reviewMutation.isPending}
                className="py-3 px-2 bg-[#44ACFF]/15 border border-[#44ACFF]/25 hover:bg-[#44ACFF]/25 text-[#44ACFF] rounded-full font-extrabold text-xs transition duration-200 shadow-sm"
              >
                Easy
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 bg-slate-50 border border-slate-100 border-dashed rounded-3xl text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">
            Flip card to rate and advance
          </div>
        )}
      </div>
    </div>
  );
}
