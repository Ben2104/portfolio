"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { GITHUB_URL, LINKEDIN_URL } from "@/data/site";
import { sendMessage } from "@/lib/contact";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";
import { Reveal } from "./reveal";

type State = "idle" | "sending" | "sent" | "error";

const Arrow = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
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
      await sendMessage({ name: String(d.get("name")), email: String(d.get("email")), message: String(d.get("message")) });
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="scr ct" id="contact" aria-labelledby="ct-h">
      <div className="wrap">
        <Reveal>
          <p className="lbl">06 / Contact</p>
          <h2 id="ct-h">
            <span>Let&apos;s build something</span> <span className="ct__out">extraordinary.</span>
          </h2>
          <p className="ct__sub">
            Interested in software engineering opportunities, technical collaborations, or student-led projects? I would be
            happy to connect.
          </p>
        </Reveal>

        <div className="ct__grid">
          <Reveal>
            <h3>Get in touch with me</h3>
            <p className="ct__st">
              <i aria-hidden="true" />
              <span>Currently exploring software engineer roles and interesting open-source collaborations.</span>
            </p>
            <p className="ct__rt mono">
              Typical response time: <b>under 24 hours</b>
            </p>
            <ul className="ct__cards">
              <li>
                <a className="ct__card" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <span className="ct__ic"><GithubIcon /></span>
                  <span className="ct__ct"><span className="mono">GitHub</span>@Ben2104</span>
                  <Arrow />
                </a>
              </li>
              <li>
                <a className="ct__card" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                  <span className="ct__ic"><LinkedinIcon /></span>
                  <span className="ct__ct"><span className="mono">LinkedIn</span>Hoang Khoi Do</span>
                  <Arrow />
                </a>
              </li>
              <li>
                <a className="ct__card" href="#contact-form">
                  <span className="ct__ic"><MailIcon /></span>
                  <span className="ct__ct"><span className="mono">Email</span>Send a message with the form</span>
                  <Arrow />
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <form className="ct__form" id="contact-form" aria-label="Contact form" onSubmit={submit}>
              <label>
                Name
                <input name="name" type="text" autoComplete="name" placeholder="Your name" required maxLength={120} />
              </label>
              <label>
                Email
                <input name="email" type="email" autoComplete="email" placeholder="you@company.example" required maxLength={200} />
              </label>
              <label>
                Message
                <textarea name="message" placeholder="Tell me about your project" required maxLength={4000} />
              </label>
              <button className="ct__send" type="submit" disabled={state === "sending"}>
                {state === "sending" ? "Sending…" : "Send message ↗"}
              </button>
              <p className={"ct__msg" + (state === "error" ? " ct__msg--err" : "")} role="status" aria-live="polite">
                {state === "sent" && "Message sent. Thanks, I will reply within a day."}
                {state === "error" && "Your message could not be sent right now. Please try again, or reach me on LinkedIn or GitHub."}
              </p>
            </form>
          </Reveal>
        </div>

        <div className="ct__foot mono">
          <span>KHOI.OS / Portfolio</span>
          <span>Hoang Khoi Do</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </div>
    </section>
  );
}
