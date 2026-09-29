"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";

import { projects } from "@/data/portfolio";

import { buildShelfBooks, createShelf } from "./shelf-engine";
import "./shelf.css";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={direction === "left" ? "m10.5 3.5-4.5 4.5 4.5 4.5" : "m5.5 3.5 4.5 4.5-4.5 4.5"} />
    </svg>
  );
}

type ProjectShelfProps = {
  /** Section header, rendered inside the shelf so it dims while a book is open */
  header: ReactNode;
  /** The <section>, used to line wheel stepping up with the viewport */
  sectionRef: RefObject<HTMLElement | null>;
};

export default function ProjectShelf({ header, sectionRef }: ProjectShelfProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const books = useMemo(() => buildShelfBooks(projects), []);

  useEffect(() => {
    const root = rootRef.current;
    const section = sectionRef.current;
    if (!root || !section) return;
    return createShelf({ root, section, books });
  }, [books, sectionRef]);

  return (
    <div ref={rootRef} className="pshelf">
      <div className="scene-shell">
        <canvas className="scene" data-shelf="scene" aria-hidden="true" />
      </div>

      <div className="pshelf-header">{header}</div>

      <div className="browse-ui" data-shelf="browse-ui" role="group" aria-label="Project shelf navigation">
        <div className="selection">
          <span className="counter" data-shelf="counter">
            01 / {String(books.length).padStart(2, "0")}
          </span>
          <div className="selection__copy">
            <h3 className="selection__title" data-shelf="selection-title">
              {books[0]?.title}
            </h3>
            <p className="selection__note" data-shelf="selection-note">
              {books[0]?.tagline || books[0]?.description}
            </p>
          </div>
        </div>

        <div className="browse-actions">
          <button className="round-button" data-shelf="previous" type="button" aria-label="Previous project" disabled>
            <Chevron direction="left" />
          </button>
          <button className="text-button" data-shelf="inspect" type="button">
            Open
          </button>
          <button className="round-button" data-shelf="next" type="button" aria-label="Next project">
            <Chevron direction="right" />
          </button>
        </div>

        <nav className="index-nav" aria-label="Project index">
          <div className="markers" data-shelf="markers" role="tablist" aria-label="Choose a project" />
          <p className="microcopy">Scroll · arrows · select</p>
        </nav>
      </div>

      <aside
        className="detail-panel"
        data-shelf="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pshelf-detail-title"
        aria-hidden="true"
        inert
      >
        <button className="close-button" data-shelf="close-detail" type="button" aria-label="Return project to shelf">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>
        <p className="eyebrow" data-shelf="detail-eyebrow" />
        <h3 className="detail-title" id="pshelf-detail-title" data-shelf="detail-title" />
        <p className="detail-deck" data-shelf="detail-deck" />
        <dl className="meta-list" data-shelf="detail-meta" />
        <div className="page-navigation" role="group" aria-label="Browse pages">
          <button className="page-button" data-shelf="previous-page" type="button" aria-label="Previous page" disabled>
            <Chevron direction="left" />
          </button>
          <p className="page-status" aria-live="off">
            <strong data-shelf="page-label">Closed</strong>
            <span data-shelf="page-counter">Click book to open</span>
          </p>
          <button className="page-button" data-shelf="next-page" type="button" aria-label="Next page" disabled>
            <Chevron direction="right" />
          </button>
        </div>
        <div className="detail-controls">
          <p className="microcopy" data-shelf="detail-microcopy">
            Drag cover or click once to open · Background to orbit
          </p>
          <div className="detail-buttons">
            <button className="text-button reset-button" data-shelf="toggle-book" type="button" aria-pressed="false">
              Open book
            </button>
            <button className="text-button reset-button" data-shelf="reset-view" type="button">
              Reset view
            </button>
          </div>
        </div>
      </aside>

      <div className="sr-only" data-shelf="live-region" aria-live="polite" />

      {/* Readable without WebGL; hidden once the scene is ready */}
      <section className="static-fallback" aria-label="Projects">
        <p className="fallback__status" data-shelf="fallback-status">
          Preparing the interactive shelf…
        </p>
        <ul className="fallback__grid">
          {books.map((book) => (
            <li
              key={book.id}
              className="fallback-book"
              style={
                {
                  "--book-color": book.color,
                  "--book-foil": book.foil,
                  "--book-height": `${Math.round(book.height * 170)}px`,
                } as CSSProperties
              }
            >
              <span>Project {String(book.number).padStart(2, "0")}</span>
              <a href={book.links[0]?.href} target="_blank" rel="noopener noreferrer">
                {book.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="loading" data-shelf="loading" aria-live="polite">
        <div className="loading__inner">
          <div className="loading__mark" aria-hidden="true" />
          <p>Binding the collection</p>
        </div>
      </div>
    </div>
  );
}
