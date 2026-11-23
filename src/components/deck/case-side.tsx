"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** The case-study sidebar: section links, the one in view lit up. */
export function CaseSide({ items }: { items: readonly (readonly [string, string])[] }) {
  const [active, setActive] = useState(items[0][0]);

  useEffect(() => {
    const sections = items.map(([id]) => document.getElementById(id));
    const read = () => {
      const line = Math.max(64, window.innerHeight * 0.2);
      const current = sections.findLast((section) => section && section.getBoundingClientRect().top <= line);
      setActive(current?.id ?? items[0][0]);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
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
      <Link className="cs__back" href="/projects">
        ← Back to archive
      </Link>
    </aside>
  );
}
