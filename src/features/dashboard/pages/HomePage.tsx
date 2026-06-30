import { Link } from 'react-router-dom';
import { useMe } from '../../auth/hooks/useMe';
import { getMyDecks } from '../../flashcard/api/flashcardApi';
import { useMyStats } from '../hooks/useMyStats';
import { StreakCard } from '../../streak/components/StreakCard';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Layers, 
  Award,
  Bookmark,
  Volume2,
  Clock,
  Star
} from 'lucide-react';

export function HomePage() {
  const { data: user } = useMe();
  const { data: stats } = useMyStats();

  // Fetch user decks for vocabulary stats fallback
  const { data: decksData } = useQuery({
    queryKey: ['my-decks'],
    queryFn: getMyDecks,
    enabled: Boolean(user),
  });

  const totalCards = decksData?.myDecks?.reduce((sum: number, deck: any) => sum + (deck.cardCount || 0), 0) || 0;

  // Streak details from real data
  const currentStreak = stats?.readingStreak ?? 0;

  // Daily goal: if today is active, simulate 15 mins. If not, 0.
  const todayActive = currentStreak > 0;
  const goalMin = todayActive ? 15 : 0;
  const goalPercent = Math.min((goalMin / 20) * 100, 100);

  // Audio helper simulation
  const playAudio = (text: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not supported');
    }
  };

  const recentWordsToRender = stats?.recentWords && stats.recentWords.length > 0
    ? stats.recentWords
    : [
        { text: 'curious', type: 'adjective' },
        { text: 'explore', type: 'verb' },
        { text: 'delicious', type: 'adjective' },
        { text: 'journey', type: 'noun' }
      ];

  return (
    <div className="py-4 space-y-8 max-w-5xl mx-auto">
      
      {/* 1. Streak Card (Image 8) - MOVED TO TOP */}
      {user && <StreakCard />}

      {/* 2. Hero Welcome banner (Image 3) */}
      <section className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-[#FDE7F0] border border-[#FE9EC7]/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-fade-in">
        <div className="flex items-center gap-5 md:gap-8 flex-col sm:flex-row text-center sm:text-left">
          {/* Bunny waving mascot */}
          <img 
            src="/bunny_reading.png" 
            className="w-28 h-28 md:w-36 md:h-36 object-contain shrink-0 hover:scale-105 transition duration-200" 
            alt="Waving rabbit" 
          />
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-brand-pink flex items-center gap-1 justify-center sm:justify-start">
              Good morning, {user ? (user.displayName || user.username) : 'Alex'}! ☀️
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight leading-tight max-w-md">
              Let's make today a great day to learn English!
            </h1>
            <p className="text-xs md:text-sm text-text-secondary font-semibold">
              Study a little every day, and you'll go far.
            </p>
            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
              <Link
                to="/readings"
                className="px-5 py-2.5 bg-brand-pink hover:bg-brand-pink/90 text-white font-extrabold rounded-full transition duration-150 shadow-md text-xs"
              >
                Continue Learning &gt;
              </Link>
              <Link
                to="/flashcards"
                className="px-5 py-2.5 bg-white text-text-secondary border border-gray-200 font-extrabold rounded-full transition duration-150 shadow-sm text-xs"
              >
                Study Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Today's Goal Mini Card match Image 3 */}
        <div className="w-full md:w-72 bg-white rounded-2xl p-5 border border-gray-100 shadow-soft flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-3 flex-grow">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Today's Goal</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-brand-pink">{goalMin}</span>
                <span className="text-xs font-bold text-text-secondary">/ 20 min</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-pink transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
          {/* Trophy element */}
          <div className="w-14 h-14 bg-[#FDE7F0] rounded-full flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Award className="w-7 h-7 fill-current" />
          </div>
        </div>
      </section>

      {/* 3. Progress Cards (Image 4) */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Vocabulary Learned */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-soft flex items-center justify-between gap-4 hover:scale-[1.02] transition duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
              <Bookmark className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-secondary">Vocabulary Learned</p>
              <h3 className="text-2xl font-black text-text-primary mt-0.5">{stats?.vocabularyLearned ?? totalCards}</h3>
              <p className="text-[10px] font-bold text-[#E59700]">+{stats?.vocabularyWeeklyIncrement ?? 0} new words this week</p>
            </div>
          </div>
          {/* Yellow sparkline */}
          <svg className="w-16 h-8 text-amber-400 shrink-0" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M0,20 Q15,5 30,20 T60,10 T90,22" strokeLinecap="round" />
          </svg>
        </div>

        {/* Reading Streak */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-soft flex items-center justify-between gap-4 hover:scale-[1.02] transition duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-secondary">Reading Streak</p>
              <h3 className="text-2xl font-black text-text-primary mt-0.5">{currentStreak} days</h3>
              <p className="text-[10px] font-bold text-[#44ACFF]">Keep it up! 🔥</p>
            </div>
          </div>
          {/* Blue sparkline */}
          <svg className="w-16 h-8 text-brand-blue shrink-0" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M0,20 Q20,10 40,25 T70,5 T90,15" strokeLinecap="round" />
          </svg>
        </div>

        {/* Flashcard Reviews */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-soft flex items-center justify-between gap-4 hover:scale-[1.02] transition duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-pink/10 text-brand-pink rounded-full flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-secondary">Flashcard Reviews</p>
              <h3 className="text-2xl font-black text-text-primary mt-0.5">{stats?.flashcardReviewsTotal ?? 0}</h3>
              <p className="text-[10px] font-bold text-brand-pink">+{stats?.flashcardReviewsToday ?? 0} cards reviewed today</p>
            </div>
          </div>
          {/* Pink sparkline */}
          <svg className="w-16 h-8 text-brand-pink shrink-0" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M0,15 Q15,25 35,10 T65,20 T90,5" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* Main Learning Grid (Image 5, 6, 7) */}
      <section className="grid gap-6 lg:grid-cols-3">
        
        {/* Vocabulary Card (Image 5) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-pastel hover:scale-[1.01] transition-all-180 duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-brand-pink/10 text-brand-pink rounded-full flex items-center justify-center">
                  <Bookmark className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-black text-text-primary">Vocabulary</h3>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="space-y-2">
              <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">Popular Topics</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold bg-[#FDE7F0] text-brand-pink px-2.5 py-1 rounded-full">Daily Life</span>
                <span className="text-[10px] font-bold bg-[#FEF9E6] text-amber-800 px-2.5 py-1 rounded-full">Travel</span>
                <span className="text-[10px] font-bold bg-[#E0F2FE] text-brand-blue px-2.5 py-1 rounded-full">Food</span>
                <span className="text-[10px] font-bold bg-[#EEF2F6] text-slate-600 px-2.5 py-1 rounded-full">Business</span>
                <span className="text-[10px] font-bold bg-[#FEF9E6] text-amber-800 px-2.5 py-1 rounded-full">Nature</span>
              </div>
            </div>

            {/* Your Level boxes */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">Your Level</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#ECFDF5] border border-[#A7F3D0]/30 p-2.5 rounded-xl text-emerald-800">
                  <span className="text-[10px] font-bold block">Beginner</span>
                  <span className="text-xs font-black bg-emerald-100/60 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                    {stats?.levels?.beginner ?? 0}
                  </span>
                </div>
                <div className="relative bg-[#FFF1F6] border-2 border-brand-pink p-2.5 rounded-xl text-brand-pink">
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-pink rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    ★
                  </div>
                  <span className="text-[10px] font-bold block">Elementary</span>
                  <span className="text-xs font-black bg-brand-pink/10 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                    {stats?.levels?.elementary ?? 0}
                  </span>
                </div>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE]/30 p-2.5 rounded-xl text-brand-blue">
                  <span className="text-[10px] font-bold block">Intermediate</span>
                  <span className="text-xs font-black bg-brand-blue/10 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                    {stats?.levels?.intermediate ?? 0}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-slate-500">
                  <span className="text-[10px] font-bold block">Advanced</span>
                  <span className="text-xs font-black bg-slate-200 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                    {stats?.levels?.advanced ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Words list */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">Recent Words</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recentWordsToRender.map((word) => (
                  <div key={word.text} className="bg-white border border-gray-150/70 p-2 rounded-xl flex items-center justify-between hover:border-brand-pink/30 transition">
                    <div>
                      <span className="text-xs font-extrabold text-text-primary block truncate max-w-[90px]">{word.text}</span>
                      <span className="text-[9px] text-text-muted italic">{word.type}</span>
                    </div>
                    <button 
                      onClick={() => playAudio(word.text)} 
                      className="p-1 text-slate-400 hover:text-brand-pink transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reading Card (Image 6) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-pastel hover:scale-[1.01] transition-all-180 duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-black text-text-primary">Reading</h3>
              </div>
              <Link to="/readings" className="text-[11px] font-bold bg-slate-50 border border-slate-100 hover:bg-slate-100 text-text-secondary px-3 py-1.5 rounded-full">
                View all
              </Link>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider block">Featured Reading</span>
              
              <div className="border border-gray-150/80 rounded-2xl p-4 space-y-3.5 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-text-primary">A Day in the Life of a Traveler</h4>
                  <span className="text-[9px] font-extrabold uppercase bg-brand-pink/15 text-brand-pink px-2.5 py-0.5 rounded-full">
                    Elementary
                  </span>
                </div>
                {/* Paragraph match image 6 */}
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  Every morning, I pack my bag and set off on a new{' '}
                  <span className="bg-[#E0F2FE] text-brand-blue px-1.5 py-0.5 rounded-md font-extrabold">adventure</span>
                  . I love to{' '}
                  <span className="bg-[#FEF3C7] text-amber-800 px-1.5 py-0.5 rounded-md font-extrabold">explore</span>
                  {' '}new places, try{' '}
                  <span className="bg-[#E0F2FE] text-brand-blue px-1.5 py-0.5 rounded-md font-extrabold">delicious</span>
                  {' '}food, and meet interesting people along the{' '}
                  <span className="bg-[#FEF3C7] text-amber-800 px-1.5 py-0.5 rounded-md font-extrabold">journey</span>
                  . Traveling teaches me to be{' '}
                  <span className="bg-[#E0F2FE] text-brand-blue px-1.5 py-0.5 rounded-md font-extrabold">curious</span>
                  {' '}and open-minded.
                </p>

                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <Link
                    to="/readings"
                    className="px-4 py-2 bg-[#44ACFF] hover:bg-[#44ACFF]/95 text-white font-extrabold rounded-full text-[11px] transition shadow-soft flex items-center gap-1"
                  >
                    Continue Reading
                    <span>&gt;</span>
                  </Link>
                  <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    5 min read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flashcard Card (Image 7) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-pastel hover:scale-[1.01] transition-all-180 duration-300 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-brand-pink/10 text-brand-pink rounded-full flex items-center justify-center">
                  <Layers className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-black text-text-primary">Flashcards</h3>
              </div>
              <Link to="/flashcards" className="text-[11px] font-extrabold bg-[#EFF6FF] text-[#44ACFF] hover:bg-[#EFF6FF]/80 px-3 py-1.5 rounded-full">
                Review Now
              </Link>
            </div>

            {/* Simulated flashcard body */}
            <div className="relative border border-slate-100 bg-[#EFF6FF]/20 rounded-2xl p-4 text-center min-h-[140px] flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center text-[10px] font-bold text-text-muted">
                <span>1 / 10</span>
                <Star className="w-4 h-4 text-slate-300 cursor-pointer" />
              </div>
              
              <div className="space-y-1 py-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-extrabold text-[#44ACFF]">curious</span>
                  <button onClick={() => playAudio('curious')} className="text-slate-400 hover:text-brand-pink transition">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-text-muted italic block">adjective</span>
                <p className="text-xs font-bold text-slate-700 leading-normal pt-1.5">
                  eager to know or learn something
                </p>
              </div>
              
              <div className="h-2" />
            </div>

            {/* Simulated actions buttons match Image 7 */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                to="/flashcards"
                className="py-2.5 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-text-primary font-bold text-xs rounded-full transition flex items-center justify-center gap-1.5"
              >
                ✕ Don't know
              </Link>
              <Link
                to="/flashcards"
                className="py-2.5 bg-[#44ACFF] hover:bg-[#44ACFF]/95 text-white font-bold text-xs rounded-full transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                ✓ Know it
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Quote Banner */}
      <section className="bg-[#FEF9E6] border border-amber-100 rounded-3xl p-6 text-center shadow-soft hover:scale-[1.01] transition duration-200">
        <p className="text-sm font-bold text-amber-800 leading-relaxed">
          "The limit of your language is the limit of your world." — Ludwig Wittgenstein
        </p>
      </section>
    </div>
  );
}
