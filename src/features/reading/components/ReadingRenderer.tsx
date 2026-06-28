import { useState } from 'react';
import { ReadingSpan } from './ReadingSpan';

interface ReadingRendererProps {
  readingId: string;
  spans: any[];
  vocabularyMap: Record<string, any>;
}

export function ReadingRenderer({ readingId, spans, vocabularyMap }: ReadingRendererProps) {
  const [activeSpanIndex, setActiveSpanIndex] = useState<number | null>(null);

  // Sort spans by orderIndex to ensure correct display order
  const sortedSpans = [...spans].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <article className="mt-8 text-xl leading-10 font-normal tracking-wide text-text-primary text-justify bg-white rounded-3xl border border-gray-50 p-8 shadow-soft max-w-2xl mx-auto">
      {sortedSpans.map((span, index) => (
        <ReadingSpan
          key={span.orderIndex || index}
          readingId={readingId}
          span={span}
          vocabulary={span.vocabularyId ? vocabularyMap[span.vocabularyId] : undefined}
          isOpen={activeSpanIndex === span.orderIndex}
          onOpenChange={(open) => {
            if (open) {
              setActiveSpanIndex(span.orderIndex);
            } else {
              setActiveSpanIndex((prev) => prev === span.orderIndex ? null : prev);
            }
          }}
        />
      ))}
    </article>
  );
}
