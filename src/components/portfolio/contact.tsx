"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle, Github, Linkedin, LoaderCircle, Mail, Twitter } from "lucide-react";
import { motion } from "motion/react";

import { profile, socials } from "@/data/portfolio";

import { SectionHeading } from "./section-heading";

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  mail: Mail,
} as const;

const initialForm: ContactForm = {
  name: "",
  email: "",
  message: "",
};

export function Contact() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange =
    (field: keyof ContactForm) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
      };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${profile.email}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          _subject: `Portfolio inquiry from ${form.name}`,
          _template: "table",
          _honey: "",
        }),
      });

      const result = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "The message could not be sent.");
      }

      setSent(true);
      setForm(initialForm);
    } catch {
      setError(
        `Your message could not be sent right now. Please email ${profile.email} directly.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative bg-(--portfolio-bg) px-6 py-28">
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent="var(--portfolio-accent)" label="Contact" />

        <h2 className="font-clash m-0 text-[clamp(40px,6vw,72px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          {profile.contactHeading}
        </h2>
        <p className="font-satoshi mt-3 text-[17px] text-(--portfolio-subtle)">
          {profile.contactBlurb}
        </p>
        <div className="mt-7 h-px w-full bg-white/20" />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <h3 className="font-clash m-0 text-[clamp(36px,5vw,64px)] font-bold leading-[1.04] text-(--portfolio-text)">
              Get in Touch With Me
            </h3>
            <a
              href={`mailto:${profile.email}`}
              className="font-clash block text-[clamp(22px,3vw,32px)] font-bold text-(--portfolio-accent) underline decoration-2 underline-offset-4"
            >
              {profile.email}
            </a>
            <p className="font-satoshi m-0 max-w-115 text-[16px] leading-[1.75] text-(--portfolio-muted)">
              {profile.opportunityBlurb}
            </p>
            <p className="font-satoshi m-0 text-[14px] text-(--portfolio-muted)">
              Typical response time:{" "}
              <span className="font-semibold text-white">{profile.responseTime}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6 md:p-8">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start gap-4"
              >
                <CheckCircle className="text-(--portfolio-accent)" size={40} />
                <h3 className="font-clash m-0 text-3xl text-(--portfolio-text)">
                  Message sent
                </h3>
                <p className="font-satoshi m-0 max-w-md text-[15px] text-(--portfolio-muted)">
                  Thanks for reaching out. Your message is on its way to {profile.email}.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="rounded-full border border-white/25 px-5 py-2.5 font-satoshi text-[12px] font-bold uppercase tracking-widest text-white"
                >
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <label className="block">
                  <span className="font-satoshi block text-[12px] font-bold uppercase tracking-widest text-white">
                    Name
                  </span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Your name"
                    className="mt-2 w-full border-0 border-b border-white/35 bg-transparent px-0 pb-3 pt-1 font-satoshi text-[18px] text-white outline-none focus:border-(--portfolio-accent)"
                  />
                </label>

                <label className="block">
                  <span className="font-satoshi block text-[12px] font-bold uppercase tracking-widest text-white">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="your@email.com"
                    className="mt-2 w-full border-0 border-b border-white/35 bg-transparent px-0 pb-3 pt-1 font-satoshi text-[18px] text-white outline-none focus:border-(--portfolio-accent)"
                  />
                </label>

                <label className="block">
                  <span className="font-satoshi block text-[12px] font-bold uppercase tracking-widest text-white">
                    Message
                  </span>
                  <textarea
                    rows={3}
                    required
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="Tell me about your project"
                    className="mt-2 w-full resize-none border-0 border-b border-white/35 bg-transparent px-0 pb-3 pt-1 font-satoshi text-[18px] text-white outline-none focus:border-(--portfolio-accent)"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-(--portfolio-accent) px-7 py-2.5 font-satoshi text-[12px] font-bold uppercase tracking-[0.11em] text-white transition disabled:cursor-wait disabled:opacity-65"
                >
                  {submitting ? (
                    <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {submitting ? "Sending..." : "Send Message"}
                </button>
                {error ? (
                  <p
                    role="alert"
                    className="font-satoshi m-0 flex items-start gap-2 text-[13px] leading-relaxed text-red-300"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      Your message could not be sent right now. Please email{" "}
                      <a className="underline underline-offset-2" href={`mailto:${profile.email}`}>
                        {profile.email}
                      </a>{" "}
                      directly.
                    </span>
                  </p>
                ) : (
                  <p className="font-satoshi m-0 text-[12px] text-white/45">
                    Sends your message directly to {profile.email}.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6">
          {socials.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {socials.map((social) => {
                const Icon = iconMap[social.icon];

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 no-underline transition hover:border-white/25"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15">
                        <Icon size={15} className="text-white/75" />
                      </span>
                      <span className="font-satoshi text-[13px] font-medium text-white/80">
                        {social.handle}
                      </span>
                    </div>
                    <ArrowUpRight size={14} className="text-white/45" />
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="font-satoshi m-0 text-[15px] text-(--portfolio-muted)">
              Contact links are not available right now.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
