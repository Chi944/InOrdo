"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { PREVIEW_RESET_EVENT } from "@/lib/ui-events";

export type TabItem = {
  id: string;
  label: string;
  panel: ReactNode;
};

export function Tabs({ items, label }: { items: readonly TabItem[]; label: string }) {
  const firstItemId = items[0]?.id ?? "";
  const [activeId, setActiveId] = useState(firstItemId);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    function resetPreview() {
      setActiveId(firstItemId);
    }

    window.addEventListener(PREVIEW_RESET_EVENT, resetPreview);
    return () => window.removeEventListener(PREVIEW_RESET_EVENT, resetPreview);
  }, [firstItemId]);

  function selectIndex(index: number) {
    const next = items[index];
    if (!next) return;
    setActiveId(next.id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectIndex((index + 1) % items.length);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectIndex((index - 1 + items.length) % items.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectIndex(items.length - 1);
    }
  }

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => {
          const selected = item.id === activeItem?.id;
          return (
            <button
              aria-controls={`${baseId}-${item.id}-panel`}
              aria-selected={selected}
              className="tabs__tab"
              id={`${baseId}-${item.id}-tab`}
              key={item.id}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(node) => { tabRefs.current[index] = node; }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {activeItem ? (
        <div
          aria-labelledby={`${baseId}-${activeItem.id}-tab`}
          className="tabs__panel"
          id={`${baseId}-${activeItem.id}-panel`}
          role="tabpanel"
          tabIndex={0}
        >
          {activeItem.panel}
        </div>
      ) : null}
    </div>
  );
}
