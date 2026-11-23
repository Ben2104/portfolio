"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  features: [string, string][];
  img: string;
  title: string;
  details: [string, string, string][];
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Deck pages 19-25: feature cards, each opening a detail view with a large preview. */
export function CaseFeatures({ features, img, title, details }: Props) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(0);
  const src = "/deck/projects/" + img + ".webp";
  const [name, text] = features[open];

  const show = (k: number) => {
    setOpen(k);
    dlg.current?.showModal();
  };

  return (
    <>
      <ul className="cf">
        {features.map(([n, t], k) => (
          <li key={n} className="cf__card">
            <span className="mono cf__id">
              Feature_{pad(k + 1)} <b aria-hidden="true">↗</b>
            </span>
            <div className="cf__thumb">
              <Image src={src} alt="" fill sizes="(max-width: 860px) 90vw, 30vw" />
            </div>
            <h3>{n}</h3>
            <p>{t}</p>
            <button type="button" className="cf__go mono" onClick={() => show(k)} aria-haspopup="dialog">
              View details ↗
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dlg}
        className="cf__dlg"
        aria-labelledby="cf-name"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="cf__win">
          <div className="cf__top">
            <span className="lbl">Feature_{pad(open + 1)} / Detail view</span>
            <button type="button" className="cf__x" onClick={() => dlg.current?.close()} aria-label="Close">
              ×
            </button>
          </div>
          <h3 id="cf-name">{name}</h3>
          <p className="cf__sub">{text}</p>
          <div className="cf__prev">
            <Image src={src} alt={`${title}: ${name}`} fill sizes="(max-width: 860px) 92vw, 1000px" />
          </div>
          <p className="lbl cf__tdh">Technical details</p>
          <dl className="cf__tech">
            {details.map(([k, v, note]) => (
              <div key={k}>
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
                <dd className="cf__note">{note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </dialog>
    </>
  );
}
