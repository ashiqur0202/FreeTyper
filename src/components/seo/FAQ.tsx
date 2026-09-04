'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-surface-border bg-surface-raised">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium text-text-bright">{item.question}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-text-dim transition-transform ${
                openIndex === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-text-dim">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
