import { useState } from 'react';
import { useVocabularies } from '../hooks/useVocabularies';
import { useVocabularySearch } from '../hooks/useVocabularySearch';
import { VocabularyCard } from '../components/VocabularyCard';
import { VocabularyFilter } from '../components/VocabularyFilter';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ChevronLeft, ChevronRight, Sparkles, Search } from 'lucide-react';

// Match type badge component
function MatchBadge({ matchType }: { matchType: 'exact' | 'prefix' | 'fuzzy' }) {
  const config = {
    exact: { label: 'Exact', className: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    prefix: { label: 'Prefix', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
    fuzzy: { label: 'Similar', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  };
  const { label, className } = config[matchType] || config.fuzzy;
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

export function VocabularyListPage() {
  const [query, setQuery] = useState<{
    search: string;
    type?: string;
    level?: string;
    topicId?: string;
    page: number;
    limit: number;
  }>({
    search: '',
    type: undefined,
    level: undefined,
    topicId: undefined,
    page: 1,
    limit: 12,
  });

  const isFuzzySearch = (query.search || '').trim().length >= 2;

  // Fuzzy search (active when search ≥ 2 chars)
  const {
    data: fuzzyData,
    isLoading: fuzzyLoading,
  } = useVocabularySearch({
    q: query.search || '',
    type: query.type,
    level: query.level,
    limit: 20,
  });

  // Regular paginated list (used when no search term)
  const { data: listData, isLoading: listLoading } = useVocabularies({
    search: isFuzzySearch ? '' : query.search,
    type: query.type,
    level: query.level,
    topicId: query.topicId,
    page: query.page,
    limit: query.limit,
  });

  const handlePageChange = (newPage: number) => {
    setQuery({ ...query, page: newPage });
  };

  const totalPages = listData?.pagination ? Math.ceil(listData.pagination.total / query.limit) : 1;
  const isLoading = isFuzzySearch ? fuzzyLoading : listLoading;

  // Render vocabulary items from fuzzy or list results
  const fuzzyResults = fuzzyData?.results || [];
  const listItems = listData?.items || [];

  const hasFuzzyResults = isFuzzySearch && fuzzyResults.length > 0;
  const hasFuzzyNoResults = isFuzzySearch && !fuzzyLoading && fuzzyResults.length === 0;
  const suggestions = fuzzyData?.suggestions || [];
  const hasSuggestions = suggestions.length > 0 && fuzzyData?.meta?.fuzzyCount !== undefined && fuzzyData.meta.exactCount === 0;

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight">Dictionary</h1>
          <p className="text-text-secondary mt-1 text-base">
            Browse and save vocabulary to your flashcards for spacing review.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 lg:sticky lg:top-8 h-fit">
          <VocabularyFilter value={query} onChange={setQuery} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Fuzzy search results */}
          {isFuzzySearch ? (
            <>
              {/* Did you mean? */}
              {hasSuggestions && (
                <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-text-secondary">
                    Showing similar results for{' '}
                    <strong className="text-text-primary">"{query.search}"</strong>. Did you mean:{' '}
                    {suggestions.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => setQuery({ ...query, search: s, page: 1 })}
                        className="font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition"
                      >
                        {s}{i < suggestions.length - 1 ? ', ' : ''}
                      </button>
                    ))}
                  </span>
                </div>
              )}

              {/* Fuzzy result stats */}
              {hasFuzzyResults && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Search className="w-3.5 h-3.5" />
                  <span>
                    {fuzzyData!.meta.exactCount > 0 && (
                      <span className="font-semibold text-emerald-600">{fuzzyData!.meta.exactCount} exact</span>
                    )}
                    {fuzzyData!.meta.exactCount > 0 && fuzzyData!.meta.prefixCount > 0 && <span>, </span>}
                    {fuzzyData!.meta.prefixCount > 0 && (
                      <span className="font-semibold text-blue-600">{fuzzyData!.meta.prefixCount} prefix</span>
                    )}
                    {(fuzzyData!.meta.exactCount > 0 || fuzzyData!.meta.prefixCount > 0) && fuzzyData!.meta.fuzzyCount > 0 && <span>, </span>}
                    {fuzzyData!.meta.fuzzyCount > 0 && (
                      <span className="font-semibold text-amber-600">{fuzzyData!.meta.fuzzyCount} similar</span>
                    )}
                    {' '}results found
                  </span>
                </div>
              )}

              {isLoading ? (
                <Loading />
              ) : hasFuzzyResults ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {fuzzyResults.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="absolute top-4 right-4 z-10">
                        <MatchBadge matchType={item.matchType} />
                      </div>
                      <VocabularyCard vocabulary={item} />
                    </div>
                  ))}
                </div>
              ) : hasFuzzyNoResults ? (
                <EmptyState description={`No results for "${query.search}". Try a different spelling.`} />
              ) : null}
            </>
          ) : (
            /* Regular list view */
            <>
              {isLoading ? (
                <Loading />
              ) : listItems.length > 0 ? (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {listItems.map((item: any) => (
                      <VocabularyCard key={item.id} vocabulary={item} />
                    ))}
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => handlePageChange(query.page - 1)}
                        disabled={query.page === 1}
                        className="p-2.5 rounded-full border border-gray-100 bg-white shadow-soft text-text-secondary hover:text-brand-pink disabled:opacity-50 disabled:hover:text-text-secondary transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-bold text-text-primary px-4">
                        Page {query.page} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(query.page + 1)}
                        disabled={query.page === totalPages}
                        className="p-2.5 rounded-full border border-gray-100 bg-white shadow-soft text-text-secondary hover:text-brand-pink disabled:opacity-50 disabled:hover:text-text-secondary transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState description="No vocabulary matches your filters. Try resetting them." />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
