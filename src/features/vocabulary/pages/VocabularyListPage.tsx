import { useState } from 'react';
import { useVocabularies } from '../hooks/useVocabularies';
import { VocabularyCard } from '../components/VocabularyCard';
import { VocabularyFilter } from '../components/VocabularyFilter';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const { data, isLoading } = useVocabularies(query);

  const handlePageChange = (newPage: number) => {
    setQuery({ ...query, page: newPage });
  };

  const totalPages = data?.pagination ? Math.ceil(data.pagination.total / query.limit) : 1;

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight">Dictionary</h1>
          <p className="text-text-secondary mt-1 text-base">Browse and save vocabulary to your flashcards for spacing review.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 lg:sticky lg:top-8 h-fit">
          <VocabularyFilter value={query} onChange={setQuery} />
        </div>

        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <Loading />
          ) : data?.items?.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data.items.map((item: any) => (
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
            <EmptyState description="No vocabulary matches your search filters. Try resetting them." />
          )}
        </div>
      </div>
    </div>
  );
}
