"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { GITHUB_URL, LINKEDIN_URL } from "@/data/site";
import { sendMessage } from "@/lib/contact";
import { Reveal } from "./reveal";

type State = "idle" | "sending" | "sent" | "error";

const Arrow = () => (
  <svg viewBox="0 0 24 24" width={40} height={40} aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export function Contact() {
  const [state, setState] = useState<State>("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setState("sending");
    try {
      await sendMessage({ name: String(d.get("name")), email: String(d.get("email")), subject: String(d.get("subject") ?? ""), message: String(d.get("message")) });
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <section className="scr ct" id="contact" aria-labelledby="ct-h">
        <div className="wrap">
          <Reveal>
            <h2 className="giant" id="ct-h">Contact me</h2>
          </Reveal>

          <div className="ct__grid">
            <Reveal>
              <p className="ct__tag">
                Have a project in mind?
                <br />
                Let&apos;s make it happen.
              </p>
              <p className="ct__st">
                <i aria-hidden="true" />
                <span>Currently exploring software engineer roles and interesting open-source collaborations.</span>
              </p>
              <dl className="ct__meta">
                <div>
                  <dt className="mono">Social profiles</dt>
                  <dd>
                    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
                    {" — "}
                    <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  </dd>
                </div>
                <div>
                  <dt className="mono">Get in touch</dt>
                  <dd><a href="#contact-form">Send a message with the form</a></dd>
                </div>
                <div>
                  <dt className="mono">Location</dt>
                  <dd>Long Beach, CA</dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.1}>
              <form className="ct__form" id="contact-form" aria-label="Contact form" method="post" onSubmit={submit}>
                <div className="ct__row">
                  <input name="name" aria-label="Name" readOnly={state === "sending"} type="text" autoComplete="name" placeholder="NAME" required maxLength={120} />
                  <input name="email" aria-label="Email" readOnly={state === "sending"} type="email" autoComplete="email" placeholder="EMAIL" required maxLength={200} />
                </div>
                <input name="subject" aria-label="Subject" readOnly={state === "sending"} type="text" placeholder="SUBJECT" maxLength={200} />
                <textarea name="message" aria-label="Message" readOnly={state === "sending"} placeholder="MESSAGE" required maxLength={4000} />
                <button className="ct__send" type="submit" disabled={state === "sending"}>
                  {state === "sending" ? "Sending…" : "Submit"}
                  <Arrow />
                </button>
                <p className={"ct__msg" + (state === "error" ? " ct__msg--err" : "")} role="status" aria-live="polite">
                  {state === "sent" && "Message sent. Thanks, I will reply within a day."}
                  {state === "error" && "Your message could not be sent right now. Please try again, or reach me on LinkedIn or GitHub."}
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="scr ty" id="thank-you" aria-labelledby="ty-h">
        <div className="wrap">
          <div className="ty__top mono">
            <span>KHOI.OS / Portfolio 2026</span>
            <a className="pill pill--w" href="#contact-form">Work with me ↗</a>
          </div>
          <h2 className="giant ty__big" id="ty-h">Thank you</h2>
          <div className="ty__foot">
            <a className="mono" href="#top">Back to top ↑</a>
            <span className="mono">2026</span>
            <p>Hoang Khoi Do</p>
          </div>
        </div>
      </section>
    </>
  );
}
