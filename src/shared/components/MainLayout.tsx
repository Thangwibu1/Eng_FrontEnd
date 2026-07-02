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

const getMeaningVi = (item: any) =>
  item?.meanings?.find((meaning: any) => meaning?.meaningVi?.trim())?.meaningVi?.trim()
  || item?.meaningVi?.trim()
  || '';

const getMeaningEn = (item: any) =>
  item?.meanings?.find((meaning: any) => meaning?.meaningEn?.trim())?.meaningEn?.trim()
  || item?.meaningEn?.trim()
  || '';

const getExample = (item: any) => {
  const nestedExample = item?.meanings
    ?.flatMap((meaning: any) => meaning?.examples || [])
    ?.find((example: any) => example?.exampleEn?.trim() || example?.exampleVi?.trim());

  return nestedExample || (item?.exampleEn || item?.exampleVi
    ? { exampleEn: item.exampleEn, exampleVi: item.exampleVi }
    : null);
};

const getSynonyms = (item: any): string[] => {
  const fromMeanings = item?.meanings?.flatMap((m: any) => m?.synonyms || []) || [];
  const direct = item?.synonyms || [];
  const all = [...fromMeanings, ...direct];
  return [...new Set(all)].filter(Boolean).slice(0, 6);
};

const getAntonyms = (item: any): string[] => {
  const fromMeanings = item?.meanings?.flatMap((m: any) => m?.antonyms || []) || [];
  const direct = item?.antonyms || [];
  const all = [...fromMeanings, ...direct];
  return [...new Set(all)].filter(Boolean).slice(0, 6);
};

export function MainLayout({ children }: MainLayoutProps) {
  const { data: user } = useMe();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [similarResults, setSimilarResults] = useState<any[]>([]);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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

  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSearchRef = React.useRef(false);
  const selectedVocabularyIdRef = React.useRef<string | null>(null);

  const performSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setShowSearchDropdown(true);
    setSearchLoading(true);
    selectedVocabularyIdRef.current = null;
    setSearchResult(null);
    setSimilarResults([]);
    setDeckMessage('');
    setSelectedDeckId('');

    try {
      // Use fuzzy search endpoint: exact → prefix → fuzzy fallback
      const res = await httpClient.get(`/vocabularies/search?q=${encodeURIComponent(trimmed)}&limit=10`);
      const searchData = res.data.data;
      const items = searchData.results || [];

      // Typing only shows suggestions. A result is expanded only after the
      // user explicitly selects it from the list.
      setSimilarResults(items);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Trigger search whenever searchQuery changes (debounced)
  React.useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(trimmed);
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchImmediate = (query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSearchQuery(query);
    performSearch(query);
  };

  const handleSelectSearchResult = async (item: any) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (item.text !== searchQuery) {
      skipNextSearchRef.current = true;
      setSearchQuery(item.text);
    }
    setSearchResult(item);
    setSimilarResults([]);
    setShowSearchDropdown(true);
    setDeckMessage('');
    setSelectedDeckId('');

    const vocabularyId = item.id || item._id;
    selectedVocabularyIdRef.current = vocabularyId;
    if (!vocabularyId) return;

    try {
      const res = await httpClient.get(`/vocabularies/${vocabularyId}`);
      if (selectedVocabularyIdRef.current !== vocabularyId) return;
      setSearchResult(res.data.data?.vocabulary || res.data.data || item);
    } catch (err) {
      console.error(err);
      // The search result still provides a useful fallback if detail loading fails.
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchImmediate(searchQuery);
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

  const handleLogout = async () => {
    await logout();
    queryClient.invalidateQueries({ queryKey: ['me'] });
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home, color: 'text-brand-pink hover:bg-brand-pink/10' },
    { path: '/readings', label: 'Readings', icon: BookOpen, color: 'text-brand-blue hover:bg-brand-blue/10' },
    { path: '/flashcards', label: 'Flashcards', icon: Layers, color: 'text-brand-pink hover:bg-brand-pink/10' },
    { path: '/contributions', label: 'Contributions', icon: PlusCircle, color: 'text-amber-500 hover:bg-amber-50' },
    ...(user?.role === 'admin' ? [{ path: '/vocabularies/add', label: 'Add Vocab', icon: Plus, color: 'text-purple-500 hover:bg-purple-50' }] : []),
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
          <Link to="/" className="flex items-center gap-2.5 px-2 group">
            <div className="w-10 h-10 bg-brand-pink/10 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition duration-200">
              <img src="/bunny_reading.png" className="w-7 h-7 object-contain" alt="Logo" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-text-primary">
                <span className="text-brand-pink">Hagu</span>
              </span>
              <p className="text-[10px] text-text-secondary font-bold tracking-wider uppercase -mt-0.5">Dictionary & Readings</p>
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
            <Link to="/" className="flex items-center gap-2 md:hidden shrink-0">
              <div className="w-8 h-8 bg-brand-pink/10 rounded-xl flex items-center justify-center shadow-sm">
                <img src="/bunny_reading.png" className="w-5.5 h-5.5 object-contain" alt="Logo" />
              </div>
              <span className="font-extrabold text-lg text-text-primary hidden sm:inline-block">Hagu</span>
            </Link>

            {/* Global Search Input with Inline Dropdown */}
            <div className="relative w-full" ref={searchRef}>
              <input
                type="text"
                placeholder="Search a word or phrase..."
                value={searchQuery}
                onChange={(e) => {
                  selectedVocabularyIdRef.current = null;
                  setSearchQuery(e.target.value);
                  setSearchResult(null);
                  if (!e.target.value.trim()) {
                    setShowSearchDropdown(false);
                    setSimilarResults([]);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim() && (searchResult || similarResults.length > 0 || searchLoading)) {
                    setShowSearchDropdown(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-slate-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl pl-10 pr-9 py-2 text-xs md:text-sm font-semibold outline-none transition"
              />
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                    setSearchResult(null);
                    setSimilarResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition"
                >
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              )}

              {/* Inline Search Dropdown */}
              {showSearchDropdown && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[70vh] overflow-y-auto animate-fade-in">
                  {searchLoading ? (
                    <div className="py-6 flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-brand-pink border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-text-secondary">Searching...</p>
                    </div>
                  ) : searchResult ? (
                    <div className="p-4 space-y-3">
                      {/* Word found */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xl font-black text-brand-pink leading-none">{searchResult.text}</h4>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">
                            {searchResult.type?.replace('_', ' ')} {searchResult.level ? `· ${searchResult.level}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowSearchDropdown(false)}
                          className="p-1 hover:bg-gray-100 rounded-full transition shrink-0"
                        >
                          <X className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                      </div>

                      {searchResult.phonetic && (
                        <p className="text-xs text-text-muted font-bold">{searchResult.phonetic}</p>
                      )}

                      {(getMeaningVi(searchResult) || getMeaningEn(searchResult)) && (
                        <div className="py-2.5 border-t border-b border-gray-100">
                          {getMeaningVi(searchResult) && (
                            <p className="font-bold text-text-primary text-sm leading-snug">
                              {getMeaningVi(searchResult)}
                            </p>
                          )}
                          {getMeaningEn(searchResult) && (
                            <p className="text-xs text-text-secondary italic mt-0.5">
                              {getMeaningEn(searchResult)}
                            </p>
                          )}
                        </div>
                      )}

                      {getExample(searchResult) && (
                        <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1">Example</p>
                          {getExample(searchResult)?.exampleEn && (
                            <p className="font-semibold text-text-primary">
                              "{getExample(searchResult)?.exampleEn}"
                            </p>
                          )}
                          {getExample(searchResult)?.exampleVi && (
                            <p className="text-text-muted mt-0.5">{getExample(searchResult)?.exampleVi}</p>
                          )}
                        </div>
                      )}

                      {(getSynonyms(searchResult).length > 0 || getAntonyms(searchResult).length > 0) && (
                        <div className="space-y-2">
                          {getSynonyms(searchResult).length > 0 && (
                            <div>
                              <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">Synonyms</p>
                              <div className="flex flex-wrap gap-1.5">
                                {getSynonyms(searchResult).map((word: string) => (
                                  <button
                                    key={word}
                                    onClick={() => handleSearchImmediate(word)}
                                    className="px-2.5 py-1 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue text-[11px] font-bold rounded-full transition"
                                  >
                                    {word}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {getAntonyms(searchResult).length > 0 && (
                            <div>
                              <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1.5">Antonyms</p>
                              <div className="flex flex-wrap gap-1.5">
                                {getAntonyms(searchResult).map((word: string) => (
                                  <button
                                    key={word}
                                    onClick={() => handleSearchImmediate(word)}
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-500 text-[11px] font-bold rounded-full transition"
                                  >
                                    {word}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {user && (
                        <div className="pt-2 border-t border-gray-100 space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={handleSave}
                              disabled={saveMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink text-xs font-bold rounded-full transition"
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" /> Save
                            </button>
                            <button
                              onClick={handleKnown}
                              disabled={knownMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue text-xs font-bold rounded-full transition"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Known
                            </button>
                            <button
                              onClick={handleDifficult}
                              disabled={difficultMutation.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-bold rounded-full transition"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Hard
                            </button>
                          </div>

                          {decksData && decksData.myDecks?.length > 0 && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Add to Flashcard Deck</label>
                              <div className="flex gap-2">
                                <select
                                  value={selectedDeckId}
                                  onChange={(e) => setSelectedDeckId(e.target.value)}
                                  className="bg-white text-text-primary text-xs rounded-xl px-3 py-1.5 border border-gray-200 outline-none flex-grow focus:ring-2 focus:ring-brand-pink transition"
                                >
                                  <option value="">Select deck...</option>
                                  {decksData.myDecks.map((deck: any) => (
                                    <option key={deck.id} value={deck.id}>{deck.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={handleAddToDeck}
                                  disabled={addingToDeck || !selectedDeckId}
                                  className="p-2 bg-brand-pink text-white rounded-xl hover:bg-brand-pink/90 disabled:opacity-50 transition"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              {deckMessage && <p className="text-[10px] font-bold text-brand-pink italic">{deckMessage}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : similarResults.length > 0 ? (
                    <div className="p-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-1">Search results</p>
                      {similarResults.map((item: any) => {
                        const meaningVi = getMeaningVi(item);
                        return (
                          <button
                            key={item.id || item._id}
                            onClick={() => handleSelectSearchResult(item)}
                            className="w-full text-left px-3 py-2.5 hover:bg-brand-pink/5 rounded-xl transition group"
                          >
                            <span className="font-bold text-text-primary text-sm block group-hover:text-brand-pink transition">{item.text}</span>
                            {meaningVi && (
                              <span className="text-xs text-text-secondary line-clamp-1">{meaningVi}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">Not found in dictionary</p>
                        <p className="text-xs text-text-secondary mt-0.5">Try AI definition for "{searchQuery}"</p>
                      </div>
                      {user ? (
                        <button
                          onClick={handleAiDefine}
                          disabled={aiDefineLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-pink hover:bg-brand-pink/90 text-white font-bold text-xs rounded-xl shadow-pastel transition disabled:opacity-50"
                        >
                          <Sparkles className={`w-4 h-4 ${aiDefineLoading ? 'animate-spin' : ''}`} />
                          {aiDefineLoading ? 'AI is defining...' : 'Define with AI'}
                        </button>
                      ) : (
                        <p className="text-xs italic text-text-secondary text-center">Login to define with AI</p>
                      )}
                    </div>
                  )}
                </div>
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

    </div>
  );
}
