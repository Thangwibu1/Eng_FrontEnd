import React, { useMemo } from 'react';

interface SelectableReadingTextProps {
  content: string;
  annotations: any[];
  onTextSelect: (selection: {
    text: string;
    start: number;
    end: number;
    rect: DOMRect;
  }) => void;
}

export function SelectableReadingText({
  content,
  annotations,
  onTextSelect,
}: SelectableReadingTextProps) {
  // Build non-overlapping, contiguous text segments
  const segments = useMemo(() => {
    const sorted = [...annotations].sort((a, b) => a.start - b.start);
    const result = [];
    let cursor = 0;

    for (const ann of sorted) {
      if (ann.start > cursor) {
        result.push({
          type: 'text' as const,
          text: content.slice(cursor, ann.start),
          start: cursor,
          end: ann.start,
        });
      }

      result.push({
        type: 'annotation' as const,
        text: content.slice(ann.start, ann.end),
        start: ann.start,
        end: ann.end,
        annotation: ann,
      });

      cursor = ann.end;
    }

    if (cursor < content.length) {
      result.push({
        type: 'text' as const,
        text: content.slice(cursor),
        start: cursor,
        end: content.length,
      });
    }

    return result;
  }, [content, annotations]);

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const container = e.currentTarget;
    if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
      return;
    }

    const selectedText = selection.toString();
    if (!selectedText.trim()) return;

    // Calculate exact start/end offsets relative to container plain text content
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(container);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    // Clean text by trimming spaces/punctuation at edges
    let cleanText = selectedText;
    let cleanStart = start;
    let cleanEnd = end;

    // Trim leading whitespace/punctuation (Unicode-aware)
    const leadingMatch = cleanText.match(/^[\s\p{P}]+/u);
    if (leadingMatch) {
      const leadingLen = leadingMatch[0].length;
      cleanText = cleanText.slice(leadingLen);
      cleanStart += leadingLen;
    }

    // Trim trailing whitespace/punctuation
    const trailingMatch = cleanText.match(/[\s\p{P}]+$/u);
    if (trailingMatch) {
      const trailingLen = trailingMatch[0].length;
      cleanText = cleanText.slice(0, -trailingLen);
      cleanEnd -= trailingLen;
    }

    if (!cleanText.trim()) {
      return;
    }

    if (cleanText.length > 120) {
      alert('Selected text is too long (maximum 120 characters).');
      selection.removeAllRanges();
      return;
    }

    onTextSelect({
      text: cleanText,
      start: cleanStart,
      end: cleanEnd,
      rect: range.getBoundingClientRect(),
    });
  };

  const getAnnotationStyles = (ann: any) => {
    const isManual = ann.source === 'manual';
    const isMatched = ann.status === 'matched';

    if (isManual) {
      if (isMatched) {
        return 'bg-emerald-100/90 border-b-2 border-emerald-500 text-emerald-950 font-bold hover:bg-emerald-200/90';
      } else {
        return 'bg-amber-100/90 border-b-2 border-amber-500 text-amber-950 font-bold hover:bg-amber-200/90';
      }
    } else {
      if (isMatched) {
        return 'bg-sky-100/50 border-b border-sky-400 text-sky-950 hover:bg-sky-200/50';
      } else {
        return 'bg-rose-100/50 border-b border-rose-400 text-rose-950 hover:bg-rose-200/50';
      }
    }
  };

  const getTooltipText = (ann: any) => {
    const sourceLabel = ann.source === 'manual' ? 'Manual' : 'AI';
    const statusLabel = ann.status === 'matched' ? 'Matched (Linked)' : 'Missing (New)';
    const meaning = ann.suggestedVocabulary?.meaningVi || ann.vocabulary?.meaningVi || '';
    return `[${sourceLabel} · ${statusLabel}] ${meaning ? ': ' + meaning : ''}`;
  };

  return (
    <div
      onMouseUp={handleMouseUp}
      className="p-6 md:p-8 bg-white rounded-3xl border border-gray-150 shadow-soft font-sans text-lg leading-relaxed text-text-primary whitespace-pre-wrap select-text selection:bg-brand-pink/20 focus:outline-none"
      style={{ minHeight: '300px' }}
    >
      {segments.map((segment, idx) => {
        if (segment.type === 'text') {
          return <span key={`text-${idx}`}>{segment.text}</span>;
        }

        const ann = segment.annotation;
        const styles = getAnnotationStyles(ann);
        const tooltip = getTooltipText(ann);

        return (
          <span
            key={`ann-${idx}`}
            className={`inline-block px-0.5 mx-0.5 rounded transition duration-150 cursor-pointer ${styles}`}
            title={tooltip}
          >
            {segment.text}
          </span>
        );
      })}
    </div>
  );
}
