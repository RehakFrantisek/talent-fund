"use client";

import { useState } from "react";

export interface AccordionItemData {
  title: string;
  content: string;
}

export default function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.title} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <button className="flex w-full items-center justify-between text-left font-semibold" onClick={() => setOpenIndex(isOpen ? -1 : idx)}>
              {item.title}
              <span>{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && <p className="mt-3 text-sm text-zinc-600">{item.content}</p>}
          </div>
        );
      })}
    </div>
  );
}
