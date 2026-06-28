import { useState } from 'react';
import { useReadings } from '../hooks/useReadings';
import { Loading } from '../../../shared/components/Loading';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useTopics } from '../../vocabulary/hooks/useTopics';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Search } from 'lucide-react';

export function ReadingListPage() {
  const [query, setQuery] = useState<{
    search: string;
    level?: string;
    topicId?: string;
    page: number;
    limit: number;
  }>({
    search: '',
    level: undefined,
    topicId: undefined,
    page: 1,
    limit: 12,
  });

  const { data, isLoading } = useReadings(query);
  const { data: topics } = useTopics();

  const getLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-50 text-text-secondary border border-gray-150';
    const lvl = level.toUpperCase();
    if (lvl.startsWith('A')) {
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    } else if (lvl.startsWith('B')) {
      return 'bg-brand-pink/15 text-brand-pink border border-brand-pink/20';
    } else {
      return 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20';
    }
  };

  return (
    <div className="py-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Readings</h1>
        <p className="text-text-secondary mt-1 text-base">Select articles to read, click highlighted words to inspect definitions and save them.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft space-y-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles by title or description..."
            value={query.search}
            onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })}
            className="w-full bg-gray-50 border-0 focus:ring-2 focus:ring-brand-pink text-text-primary rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none transition"
          />
          <Search className="w-5 h-5 text-text-muted absolute left-4.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-col gap-4 text-xs font-bold pt-1 border-t border-gray-50">
          {/* Level filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-secondary uppercase tracking-wider min-w-[70px]">Level:</span>
            <button
              onClick={() => setQuery({ ...query, level: undefined, page: 1 })}
              className={`px-4 py-2 rounded-full transition-all-180 hover:scale-[1.02] active:scale-[0.98] ${
                query.level === undefined
                  ? 'bg-brand-pink text-white shadow-soft'
                  : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
              }`}
            >
              All Levels
            </button>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setQuery({ ...query, level: lvl, page: 1 })}
                className={`px-4 py-2 rounded-full transition-all-180 hover:scale-[1.02] active:scale-[0.98] ${
                  query.level === lvl
                    ? 'bg-brand-pink text-white shadow-soft'
                    : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Topic filters */}
          {topics && topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-text-secondary uppercase tracking-wider min-w-[70px]">Topic:</span>
              <button
                onClick={() => setQuery({ ...query, topicId: undefined, page: 1 })}
                className={`px-4 py-2 rounded-full transition-all-180 hover:scale-[1.02] active:scale-[0.98] ${
                  query.topicId === undefined
                    ? 'bg-brand-blue text-white shadow-soft'
                    : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
                }`}
              >
                All Topics
              </button>
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setQuery({ ...query, topicId: t.id, page: 1 })}
                  className={`px-4 py-2 rounded-full transition-all-180 hover:scale-[1.02] active:scale-[0.98] ${
                    query.topicId === t.id
                      ? 'bg-brand-blue text-white shadow-soft'
                      : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : data?.items?.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((reading: any) => (
            <div
              key={reading.id || reading._id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-pastel hover:scale-[1.02] active:scale-[0.99] transition-all-180 duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  {reading.level && (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getLevelColor(reading.level)}`}>
                      {reading.level}
                    </span>
                  )}
                  {reading.estimatedReadingTimeMinutes && (
                    <div className="flex items-center gap-1 text-xs text-text-secondary font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {reading.estimatedReadingTimeMinutes} min read
                    </div>
                  )}
                </div>

                <Link to={`/readings/${reading.id || reading._id}`}>
                  <h3 className="text-xl font-black text-text-primary hover:text-brand-pink mb-2 transition line-clamp-2">
                    {reading.title}
                  </h3>
                </Link>

                {reading.subtitle && (
                  <p className="text-sm text-text-secondary line-clamp-3 mb-4 leading-relaxed">{reading.subtitle}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs text-text-secondary flex items-center gap-1 font-bold">
                  <BookOpen className="w-4 h-4 text-brand-pink" />
                  Context-ready
                </span>

                <Link
                  to={`/readings/${reading.id || reading._id}`}
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold rounded-full shadow-soft hover:scale-105 active:scale-95 transition-all-180"
                >
                  Start Reading
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No readings available" description="Check back later for fresh learning materials, or try adjusting your search filters." />
      )}
    </div>
  );
}
