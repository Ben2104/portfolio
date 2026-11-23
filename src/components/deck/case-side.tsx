"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** The case-study sidebar: section links, the one in view lit up. */
export function CaseSide({ items }: { items: readonly (readonly [string, string])[] }) {
  const [active, setActive] = useState(items[0][0]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    for (const [id] of items) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <aside className="cs__side" aria-label="Project navigation">
      <span className="mono">Project navigation</span>
      <ol>
        {items.map(([id, label], i) => (
          <li key={id}>
            <a className={"cs__nl" + (active === id ? " on" : "")} href={"#" + id} aria-current={active === id ? "location" : undefined}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              {label}
            </a>
          </li>
        ))}
      </ol>
      <Link className="cs__back" href="/#work">
        ← Back to archive
      </Link>
    </aside>
  );
}
