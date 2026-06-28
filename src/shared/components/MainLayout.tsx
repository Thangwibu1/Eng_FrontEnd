import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMe } from '../../features/auth/hooks/useMe';
import { logout } from '../../features/auth/api/authApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StreakChip } from '../../features/streak/components/StreakChip';
import { httpClient } from '../api/httpClient';
import { useSaveVocabulary } from '../../features/vocabulary/hooks/useSaveVocabulary';
import { useMarkVocabularyKnown } from '../../features/vocabulary/hooks/useMarkVocabularyKnown';
import { useMarkVocabularyDifficult } from '../../features/vocabulary/hooks/useMarkVocabularyDifficult';
import { getMyDecks, addCardToDeck } from '../../features/flashcard/api/flashcardApi';
import { 
  Home, 
  Book, 
  BookOpen, 
  Layers, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Sparkles,
  Search,
  X,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: user } = useMe();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [similarResults, setSimilarResults] = useState<any[]>([]);
  const [aiDefineLoading, setAiDefineLoading] = useState(false);

  // Deck adding state
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [addingToDeck, setAddingToDeck] = useState(false);
  const [deckMessage, setDeckMessage] = useState('');

  const saveMutation = useSaveVocabulary();
  const knownMutation = useMarkVocabularyKnown();
  const difficultMutation = useMarkVocabularyDifficult();

  const { data: decksData } = useQuery({
    queryKey: ['my-decks'],
    queryFn: getMyDecks,
    enabled: Boolean(user),
  });

  const handleSave = () => {
    if (!searchResult) return;
    saveMutation.mutate(searchResult.id || searchResult._id);
  };

  const handleKnown = () => {
    if (!searchResult) return;
    knownMutation.mutate(searchResult.id || searchResult._id);
  };

  const handleDifficult = () => {
    if (!searchResult) return;
    difficultMutation.mutate(searchResult.id || searchResult._id);
  };

  const handleAddToDeck = async () => {
    if (!selectedDeckId || !searchResult) return;
    setAddingToDeck(true);
    setDeckMessage('');
    try {
      await addCardToDeck(selectedDeckId, searchResult.id || searchResult._id);
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

  const handleSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    setSearchQuery(trimmed);
    setShowSearchModal(true);
    setSearchLoading(true);
    setSearchResult(null);
    setSimilarResults([]);
    setDeckMessage('');
    setSelectedDeckId('');

    try {
      // Fetch vocabulary matching the query from DB
      const res = await httpClient.get(`/vocabularies?search=${encodeURIComponent(trimmed)}&limit=10`);
      const items = res.data.data.items || [];
      
      // Find exact match (case insensitive)
      const exact = items.find(
        (x: any) => x.text?.trim().toLowerCase() === trimmed.toLowerCase()
      );

      if (exact) {
        setSearchResult(exact);
      } else {
        setSimilarResults(items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAiDefine = async () => {
    setAiDefineLoading(true);
    setDeckMessage('');
    try {
      const res = await httpClient.post('/vocabularies/ai-define', { text: searchQuery });
      setSearchResult(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'AI definition failed.');
    } finally {
      setAiDefineLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleLogout = async () => {
    await logout();
    queryClient.invalidateQueries({ queryKey: ['me'] });
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home, color: 'text-brand-pink hover:bg-brand-pink/10' },
    { path: '/readings', label: 'Readings', icon: BookOpen, color: 'text-brand-blue hover:bg-brand-blue/10' },
    { path: '/vocabularies', label: 'Dictionary', icon: Book, color: 'text-emerald-500 hover:bg-emerald-50' },
    { path: '/flashcards', label: 'Flashcards', icon: Layers, color: 'text-brand-pink hover:bg-brand-pink/10' },
    { path: '/contributions', label: 'Contributions', icon: PlusCircle, color: 'text-amber-500 hover:bg-amber-50' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderRoleBadge = (role?: string) => {
    if (!role) return null;
    switch (role.toLowerCase()) {
      case 'admin':
        return (
          <span className="text-[10px] bg-brand-pink/15 text-brand-pink border border-brand-pink/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5 w-fit">
            👑 Admin
          </span>
        );
      case 'contributor':
        return (
          <span className="text-[10px] bg-brand-sky/20 text-brand-blue border border-brand-sky/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5 w-fit">
            ⭐ Contributor
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5 w-fit">
            🌱 Student
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7FAFE] font-sans">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-white border-r border-gray-100/80 flex flex-col justify-between p-6 shrink-0 hidden md:flex shadow-soft sticky top-0">
        <div className="space-y-6">
          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-2.5 px-2 group">
            <div className="w-10 h-10 bg-brand-pink rounded-2xl flex items-center justify-center shadow-pastel group-hover:scale-105 transition duration-200">
              <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-text-primary">
                Aura<span className="text-brand-pink">English</span>
              </span>
              <p className="text-[10px] text-text-secondary font-bold tracking-wider uppercase -mt-0.5">SRS & Readings</p>
            </div>
          </Link>

          {/* Streak Chip */}
          {user && <StreakChip />}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    active 
                      ? 'bg-brand-pink/10 text-brand-pink border border-brand-pink/5 shadow-sm' 
                      : `text-text-secondary hover:text-text-primary ${item.color}`
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-brand-pink' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Middle/Bottom Area */}
        <div className="space-y-6 pt-6 border-t border-gray-50">
          {/* Keep Going Mascot Card */}
          <div className="bg-[#FEF9E6] border border-[#F59E0B]/10 p-4 rounded-3xl flex flex-col items-center text-center space-y-2 shadow-sm">
            <img src="/bunny_reading.png" className="w-20 h-20 object-contain hover:scale-105 transition-all-180" alt="Bunny Mascot" />
            <div className="space-y-0.5">
              <h4 className="font-black text-xs text-amber-800">Keep going! ❤️</h4>
              <p className="text-[10px] text-amber-750 font-semibold leading-normal">
                Every word you learn brings you closer to your goals.
              </p>
            </div>
          </div>

          {/* User profile / Logout bottom card */}
          <div>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <img 
                    src="/bunny_reading.png" 
                    className="w-10 h-10 rounded-full border-2 border-brand-pink/30 object-cover shrink-0 bg-brand-pink/5 shadow-sm" 
                    alt="User avatar" 
                  />
                  <div className="overflow-hidden space-y-0.5">
                    <h4 className="font-extrabold text-sm text-text-primary truncate">{user.displayName || user.username}</h4>
                    {renderRoleBadge(user.role)}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full font-bold text-xs transition duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#44ACFF] text-white rounded-full font-bold text-sm shadow-soft hover:bg-[#44ACFF]/95 hover:scale-[1.02] active:scale-[0.98] transition duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-text-secondary bg-white hover:bg-slate-50 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Unified Top Header Bar */}
        <header className="bg-white border-b border-gray-100/80 h-16 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
          {/* Left Area: Mobile logo + Search Input */}
          <div className="flex items-center gap-4 flex-grow max-w-lg">
            {/* Logo on Mobile only */}
            <Link to="/" className="flex items-center gap-2 md:hidden shrink-0">
              <div className="w-8 h-8 bg-brand-pink rounded-xl flex items-center justify-center shadow-pastel">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg text-text-primary hidden sm:inline-block">AuraEnglish</span>
            </Link>

            {/* Global Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search word or phrase (e.g. curious, vertical farming)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-slate-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl pl-10 pr-4 py-2 text-xs md:text-sm font-semibold outline-none transition"
              />
              <Search className="w-4.5 h-4.5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition"
                >
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              )}
            </div>
          </div>

          {/* Right Area: Profile / Actions */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {user ? (
              <div className="flex items-center gap-3">
                <StreakChip variant="simple" />
                <div className="hidden md:flex items-center gap-2">
                  <img 
                    src="/bunny_reading.png" 
                    className="w-8 h-8 rounded-full border border-brand-pink/20 object-cover bg-brand-pink/5" 
                    alt="Avatar" 
                  />
                  <span className="font-bold text-xs text-text-primary">{user.displayName || user.username}</span>
                </div>
                {/* Logout only on mobile header */}
                <button
                  onClick={handleLogout}
                  className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition md:hidden"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-[#44ACFF] text-white font-bold text-xs rounded-xl shadow-soft hover:bg-[#44ACFF]/95 transition"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        {/* Navigation for mobile at bottom */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100/80 flex items-center justify-around z-40 md:hidden shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition duration-150 ${
                  active ? 'text-brand-pink scale-105' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-5.5 h-5.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Content body */}
        <main className="flex-grow p-5 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Vocabulary Lookup Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-pastel border border-gray-150 p-6 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-brand-pink" />
                <h3 className="text-lg font-black text-text-primary">Vocabulary Lookup</h3>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-text-secondary hover:text-text-primary p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            {searchLoading ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-text-secondary">Searching dictionary database...</p>
              </div>
            ) : searchResult ? (
              /* If a word was found or defined */
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-3.5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-2xl font-black text-brand-pink leading-none">{searchResult.text}</h4>
                      <p className="text-[10px] text-text-muted font-extrabold uppercase tracking-wider mt-2.5">
                        {searchResult.type?.replace('_', ' ')} {searchResult.level ? `· ${searchResult.level}` : ''}
                      </p>
                    </div>
                    {searchResult.partOfSpeech && (
                      <span className="text-[9px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {searchResult.partOfSpeech}
                      </span>
                    )}
                  </div>

                  {searchResult.phonetic && (
                    <p className="text-xs text-text-muted font-bold tracking-wide">{searchResult.phonetic}</p>
                  )}

                  <div className="py-3 border-t border-b border-gray-200/50 my-1 space-y-1 text-sm">
                    <p className="font-bold text-text-primary text-base leading-snug">
                      {searchResult.meanings?.[0]?.meaningVi || searchResult.meaningVi || 'Chưa có nghĩa'}
                    </p>
                    {(searchResult.meanings?.[0]?.meaningEn || searchResult.meaningEn) && (
                      <p className="text-xs text-text-secondary italic">
                        {searchResult.meanings?.[0]?.meaningEn || searchResult.meaningEn}
                      </p>
                    )}
                  </div>

                  {/* Examples */}
                  {(searchResult.meanings?.[0]?.examples?.[0] || searchResult.exampleEn) && (
                    <div className="text-xs bg-white p-3.5 rounded-2xl border border-slate-100 shadow-soft">
                      <p className="font-semibold text-text-primary">
                        "{searchResult.meanings?.[0]?.examples?.[0]?.exampleEn || searchResult.exampleEn}"
                      </p>
                      {(searchResult.meanings?.[0]?.examples?.[0]?.exampleVi || searchResult.exampleVi) && (
                        <p className="text-text-muted mt-1 font-medium">
                          {searchResult.meanings?.[0]?.examples?.[0]?.exampleVi || searchResult.exampleVi}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions for Logged in Users */}
                  {user && (
                    <div className="pt-3 border-t border-gray-200/50 space-y-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        <button
                          onClick={handleSave}
                          disabled={saveMutation.isPending}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-pink/15 hover:bg-brand-pink/25 text-brand-pink text-xs font-bold rounded-full transition duration-150"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                          Save
                        </button>
                        <button
                          onClick={handleKnown}
                          disabled={knownMutation.isPending}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-blue text-xs font-bold rounded-full transition duration-150"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Known
                        </button>
                        <button
                          onClick={handleDifficult}
                          disabled={difficultMutation.isPending}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-bold rounded-full transition duration-150"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Hard
                        </button>
                      </div>

                      {/* Add to Deck */}
                      {decksData && decksData.myDecks?.length > 0 && (
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Add to Flashcard Deck</label>
                          <div className="flex gap-2">
                            <select
                              value={selectedDeckId}
                              onChange={(e) => setSelectedDeckId(e.target.value)}
                              className="bg-white text-text-primary text-xs rounded-xl px-3 py-2 border border-gray-200 outline-none flex-grow focus:ring-2 focus:ring-brand-pink transition font-medium"
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
                  )}
                </div>
              </div>
            ) : (
              /* Word not found */
              <div className="space-y-4">
                {similarResults.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-text-secondary">Word/phrase not found. Similar dictionary matches:</p>
                    <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                      {similarResults.map((item: any) => (
                        <button
                          key={item.id || item._id}
                          onClick={() => handleSearch(item.text)}
                          className="w-full text-left p-3 bg-slate-50 hover:bg-brand-pink/5 border border-slate-100 hover:border-brand-pink/20 rounded-2xl transition duration-150"
                        >
                          <span className="font-bold text-text-primary text-sm block">{item.text}</span>
                          <span className="text-xs text-text-secondary block mt-0.5 line-clamp-1">
                            {item.meanings?.[0]?.meaningVi || 'Chưa có nghĩa'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-text-primary">No matching words or phrases found in database.</p>
                  </div>
                )}

                {/* AI definition CTA */}
                {user ? (
                  <div className="pt-3 border-t border-gray-100 flex flex-col items-center gap-3">
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-text-primary">Need a definition?</p>
                      <p className="text-[10px] text-text-secondary">Let DeepSeek AI translate and define "{searchQuery}" for you instantly.</p>
                    </div>
                    <button
                      onClick={handleAiDefine}
                      disabled={aiDefineLoading}
                      className="flex items-center gap-2 px-6 py-3.5 bg-brand-pink hover:bg-brand-pink/95 text-white font-extrabold text-xs rounded-full shadow-pastel hover:scale-[1.01] active:scale-[0.99] transition duration-200 w-full justify-center disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${aiDefineLoading ? 'animate-spin' : ''}`} />
                      {aiDefineLoading ? 'AI is defining...' : 'Define with DeepSeek AI'}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs italic text-text-secondary text-center">Login to look up definitions with AI</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
