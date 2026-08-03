# Timeline theo resume · ảnh About · Projects carousel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Timeline Experience khớp resume mới và chuyển sang bố cục so le kiểu Dribbble, ảnh cutout dời sang About không còn màu cam, Projects chuyển từ grid sang carousel.

**Architecture:** Dữ liệu nghiệp vụ nằm hết ở `src/data/portfolio.ts`; hai component mới (`timeline-entry.tsx`, `project-carousel.tsx`) tách phần layout phức tạp ra khỏi `experience.tsx` và `projects.tsx` để mỗi file giữ một trách nhiệm. Không thêm dependency: carousel dùng CSS `scroll-snap` + `scrollTo`, animation dùng `motion/react` đã có trong repo.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5.7, Tailwind CSS v4, `motion` v12, `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-08-02-timeline-about-carousel-design.md`

## Global Constraints

- Branch làm việc: `feat/timeline-resume-carousel`. Không commit thẳng `main`.
- **Repo không có test runner và không có linter.** `package.json` chỉ có `dev`, `build`, `start`. Không thêm framework test mới trong plan này. Bằng chứng hoàn thành = `npm run build` sạch + `grep` + xem trên dev server.
- `npm run build` của Next 16 đã bao gồm type-check TypeScript — đó là cổng kiểm tra chính.
- **Bỏ màu cam CHỈ trong:** `experience.tsx`, `timeline-entry.tsx`, 4 mảng experience của `portfolio.ts`, và **riêng khối khung ảnh** trong `about.tsx`.
- **Giữ nguyên màu cam ở:** `globals.css` (`--portfolio-accent: #ff9142`), `hero.tsx`, `skills.tsx`, `contact.tsx`, `footer.tsx`, `navbar.tsx`, `education.tsx`, badge 🏆 trong `ProjectCard`, nút "Discover More About Me" và `SectionHeading` của About.
- Màu dùng trong Experience: `#00d4ff` (Professional) · `#a78bfa` (Leadership & Research) · `#94a3b8` (Teaching) · `#64748b` (Technical / Volunteer).
- Mọi chuỗi `period` phải dùng **em dash `—`**, không dùng `-` hay `–`; `periodStartRank()` split theo em dash.
- Không thêm dependency mới vào `package.json`.
- Không autoplay, không loop vô tận cho carousel.
- Tôn trọng `useReducedMotion()` ở mọi animation mới.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `src/data/portfolio.ts` | *(sửa)* nguồn dữ liệu duy nhất — nội dung + màu 6 mốc experience |
| `src/components/portfolio/timeline-entry.tsx` | *(mới)* render MỘT mốc: node, mũi nhọn, card, ngày; biết cách lật trái/phải theo index |
| `src/components/portfolio/experience.tsx` | *(sửa)* gộp + sắp xếp 4 mảng experience, dựng spine và thanh fill theo scroll |
| `src/components/portfolio/about.tsx` | *(sửa)* khung ảnh cutout có nền, không cam |
| `src/components/portfolio/project-carousel.tsx` | *(mới)* track scroll-snap, chevron, dot, bàn phím, a11y |
| `src/components/portfolio/projects.tsx` | *(sửa)* thay grid bằng carousel; `ProjectCard` giữ nguyên |

`ProjectCard` **không** bị chuyển ra file khác — nó chỉ được `projects.tsx` dùng, và carousel nhận `children` nên không cần biết về nó.

---

### Task 0: Cài dependency và chốt baseline build

**Files:**
- Không sửa file nào. `package-lock.json` đã có trong repo — dùng `npm ci`, không `npm install`, để không làm lock file trôi.

**Interfaces:**
- Consumes: không.
- Produces: `node_modules/` — mọi task sau đều cần để `npm run build` chạy được.

- [ ] **Step 1: Cài dependency**

Run:
```bash
npm ci
```
Expected: cài xong không lỗi. Nếu `npm ci` báo lock file lệch `package.json` thì dùng `npm install` và **báo lại** rằng `package-lock.json` bị thay đổi.

- [ ] **Step 2: Build baseline TRƯỚC khi sửa gì**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`.

Đây là baseline. Nếu build **đã** lỗi từ đầu, dừng lại và báo chủ repo — không được sửa lỗi có sẵn rồi tính vào việc này, và cũng không được kết luận là mình làm gãy.

- [ ] **Step 3: Xác nhận icon `Wrench` có trong lucide-react đã cài**

Run:
```bash
grep -c "declare const Wrench" node_modules/lucide-react/dist/lucide-react.d.ts
```
Expected: `1`. Nếu là `0`, Task 2 phải dùng `Settings` thay `Wrench` và ghi lại thay đổi khi báo cáo.

Không commit gì ở task này (`node_modules/` đã nằm trong `.gitignore`).

---

### Task 1: Dữ liệu experience theo resume mới

**Files:**
- Modify: `src/data/portfolio.ts:264-356`

**Interfaces:**
- Consumes: không.
- Produces: 4 mảng `professionalExperience`, `leadershipExperience`, `volunteerExperience`, `teachingExperience`. Mỗi phần tử có shape: `{ role: string; company: string; period: string; location: string; color: string; description: string; highlights: readonly string[]; tags: readonly string[] }` (giữ nguyên shape cũ, chỉ đổi giá trị). Task 2 và 3 dựa vào shape này.

- [ ] **Step 1: Thay `professionalExperience`**

Thay nguyên khối `export const professionalExperience = [...] as const;` (dòng 264-293) bằng:

```ts
export const professionalExperience = [
  {
    role: "Software Engineering Intern",
    company: "DFM Europe",
    period: "May 2026 — Aug 2026",
    location: "Ho Chi Minh City, Vietnam · On-site",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Designed and deployed a multi-agent system using LangGraph to automate 3D-to-2D engineering drawing conversion, eliminating manual conversion steps for the ATN Drawing system.",
      "Partnered with mechanical and AI engineers to re-architect the technical drawing pipeline, improving processing performance by 85%.",
      "Built a Python/FastAPI backend integrating the OpenAI API to auto-scale 2D drawing output, maximizing sketch paper utilization and improving drawing precision by 87%.",
      "Developed an AI-powered isometric view generation feature, producing dimensionally accurate projections that cut manual layout time by 100%.",
    ],
    tags: ["Python", "FastAPI", "LangGraph", "OpenAI API", "Multi-agent Systems"],
  },
  {
    role: "Webmaster",
    company: "ACM at CSULB",
    period: "Jan 2026 — May 2026",
    location: "Long Beach, California, United States · Hybrid",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Led the redesign and redevelopment of the ACM at CSULB landing page using Next.js, boosting mobile usability across 1000+ monthly visitors.",
      "Refactored the existing Next.js codebase into a more modular and scalable architecture, reducing technical debt and improving long-term maintainability.",
      "Shipped new dashboard features for image upload and management, integrating Next.js frontend components with backend APIs to support 500 active users.",
    ],
    tags: ["Next.js", "React.js", "Tailwind CSS", "Backend APIs"],
  },
] as const;
```

- [ ] **Step 2: Thay `leadershipExperience`**

Thay khối `export const leadershipExperience = [...] as const;` (dòng 295-309) bằng:

```ts
export const leadershipExperience = [
  {
    role: "Project Manager",
    company: "AI Club at CSULB",
    period: "Jun 2026 — Present",
    location: "Long Beach, California, United States · Remote",
    color: "#a78bfa",
    description: "",
    highlights: [
      "Directed a faculty-mentored biometric sensor research project across a team of 4 members, defining scope, milestones, and responsibilities to keep deliverables on schedule.",
      "Synthesized findings from 10+ papers on wearable sensor technologies and physiological data collection to guide the team's technical direction and experimental design.",
    ],
    tags: ["Research Coordination", "Biometric Sensors", "Wearable Technology"],
  },
] as const;
```

- [ ] **Step 3: Đổi màu `volunteerExperience`**

Trong `export const volunteerExperience`, chỉ đổi một dòng — giữ nguyên toàn bộ `highlights` và `tags`:

```ts
    color: "#64748b",
```

(dòng cũ: `color: "#00d4ff",`)

- [ ] **Step 4: Sửa `teachingExperience`**

Phần tử `[0]` (CSULB Instructional Student Assistant): đổi `color` và thay `highlights`:

```ts
    color: "#94a3b8",
    description: "",
    highlights: [
      "Graded and delivered feedback on Python assignments, labs, and exams for 150+ students per term across computer arithmetic and matrix computation topics, applying a consistent rubric.",
      "Reviewed 150+ submissions per semester for correctness, efficiency, and code quality, helping raise average assignment scores by 90%.",
    ],
```

Phần tử `[1]` (De Anza Teaching Assistant): **chỉ** đổi màu, giữ nguyên `highlights` và `tags`:

```ts
    color: "#94a3b8",
```

- [ ] **Step 5: Xác nhận không còn cam trong 4 mảng experience**

Run:
```bash
sed -n '260,360p' src/data/portfolio.ts | grep -c "f97316"
```
Expected: `0`

- [ ] **Step 6: Xác nhận em dash trong mọi `period` mới**

Run:
```bash
grep -n 'period: "' src/data/portfolio.ts
```
Expected: mọi dòng dùng `—` (U+2014). Không dòng nào chứa `–` hoặc ` - `.

- [ ] **Step 7: Build**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`, không có lỗi TypeScript. Nếu báo lỗi về `pillars`/`skills` thì là lỗi có sẵn — dừng và báo lại, đừng sửa file ngoài phạm vi.

- [ ] **Step 8: Commit**

```bash
git add src/data/portfolio.ts
git commit -m "feat(data): rewrite experience entries from new resume, drop orange"
```

---

### Task 2: Component `timeline-entry.tsx`

**Files:**
- Create: `src/components/portfolio/timeline-entry.tsx`

**Interfaces:**
- Consumes: shape phần tử experience từ Task 1.
- Produces:
  - `export type TimelineCategory = "Professional" | "Teaching" | "Leadership & Research" | "Technical / Volunteer"`
  - `export type TimelineEntry` — object với `role`, `company`, `period`, `location`, `color`, `highlights: readonly string[]`, `tags: readonly string[]`, `category: TimelineCategory`
  - `export function TimelineEntryCard({ entry, index }: { entry: TimelineEntry; index: number })`
  
  Task 3 import đúng ba tên này. `index` chẵn → card bên trái, lẻ → card bên phải.

- [ ] **Step 1: Tạo file với nội dung đầy đủ**

```tsx
"use client";

import { Briefcase, GraduationCap, Users, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export type TimelineCategory =
  | "Professional"
  | "Teaching"
  | "Leadership & Research"
  | "Technical / Volunteer";

export type TimelineEntry = {
  role: string;
  company: string;
  period: string;
  location: string;
  color: string;
  highlights: readonly string[];
  tags: readonly string[];
  category: TimelineCategory;
};

const categoryIcon = {
  Professional: Briefcase,
  Teaching: GraduationCap,
  "Leadership & Research": Users,
  "Technical / Volunteer": Wrench,
} as const;

export function TimelineEntryCard({
  entry,
  index,
}: {
  entry: TimelineEntry;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = categoryIcon[entry.category];
  const isRight = index % 2 === 1;

  const notchClass = isRight
    ? "absolute -left-[7px] top-5 h-3 w-3 rotate-45 border-b border-l border-white/10 bg-(--portfolio-surface)"
    : "absolute -left-[7px] top-5 h-3 w-3 rotate-45 border-b border-l border-white/10 bg-(--portfolio-surface) md:left-auto md:-right-[7px] md:border-b-0 md:border-l-0 md:border-r md:border-t";

  return (
    <div className="relative grid grid-cols-1 pl-10 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:pl-0">
      <span
        className="absolute left-2 top-3 z-10 flex h-[34px] w-[34px] -translate-x-1/2 items-center justify-center rounded-full bg-(--portfolio-surface) md:left-1/2"
        style={{
          boxShadow: `0 0 0 1px ${entry.color}73, 0 0 14px ${entry.color}40`,
        }}
      >
        <Icon size={14} style={{ color: entry.color }} />
      </span>

      <motion.article
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -20% 0px" }}
        transition={{ duration: 0.45 }}
        className={`relative rounded-2xl border border-white/10 bg-(--portfolio-surface) p-6 md:row-start-1 ${
          isRight ? "md:col-start-3" : "md:col-start-1"
        }`}
      >
        <span className={notchClass} />

        <span
          className="font-satoshi inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{
            color: entry.color,
            borderColor: `${entry.color}88`,
            background: `${entry.color}1a`,
          }}
        >
          {entry.category}
        </span>

        <span className="font-satoshi mt-3 block text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-subtle) md:hidden">
          {entry.period}
        </span>

        <h4 className="font-clash m-0 mt-3 text-[24px] font-bold leading-[1.2] text-(--portfolio-text)">
          {entry.role}
        </h4>

        <p className="font-satoshi mb-0 mt-2 text-[15px] leading-[1.55] text-(--portfolio-muted)">
          <span style={{ color: entry.color }}>{entry.company}</span>
          {" · "}
          {entry.location}
        </p>

        {entry.highlights.length > 0 ? (
          <ul className="mt-5 space-y-2.5">
            {entry.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: entry.color }}
                />
                <span className="font-satoshi text-[14px] leading-[1.7] text-white/78">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {entry.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="font-satoshi rounded-full border border-white/16 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/72"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </motion.article>

      <div
        className={`hidden md:row-start-1 md:block md:pt-4 ${
          isRight ? "md:col-start-1 md:pr-6 md:text-right" : "md:col-start-3 md:pl-6"
        }`}
      >
        <span className="font-satoshi text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-subtle)">
          {entry.period}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build (file mới chưa ai import — chỉ cần type-check sạch)**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`. Nếu lỗi `Wrench` không tồn tại trong `lucide-react`, đổi sang `Settings` và ghi lại thay đổi đó khi báo cáo.

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/timeline-entry.tsx
git commit -m "feat(experience): add alternating timeline entry component"
```

---

### Task 3: Dựng lại `experience.tsx`

**Files:**
- Modify: `src/components/portfolio/experience.tsx` (thay toàn bộ file)

**Interfaces:**
- Consumes: `TimelineEntryCard`, `TimelineEntry` từ Task 2; 4 mảng experience từ Task 1.
- Produces: `export function Experience()` — signature không đổi, `portfolio-page.tsx` không cần sửa.

- [ ] **Step 1: Thay toàn bộ nội dung file**

```tsx
"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import {
  leadershipExperience,
  professionalExperience,
  teachingExperience,
  volunteerExperience,
} from "@/data/portfolio";

import { SectionHeading } from "./section-heading";
import { TimelineEntryCard } from "./timeline-entry";

const SPINE_ACCENT = "#00d4ff";

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
] as const;

function periodStartRank(period: string) {
  const [start] = period.split("—").map((part) => part.trim());
  const [month, year] = start.split(" ");
  const monthIndex = MONTHS.indexOf(month.toLowerCase().slice(0, 3) as (typeof MONTHS)[number]);
  return Number(year) * 12 + (monthIndex === -1 ? 0 : monthIndex);
}

const timeline = [
  ...professionalExperience.map((entry) => ({ ...entry, category: "Professional" as const })),
  ...teachingExperience.map((entry) => ({ ...entry, category: "Teaching" as const })),
  ...leadershipExperience.map((entry) => ({
    ...entry,
    category: "Leadership & Research" as const,
  })),
  ...volunteerExperience.map((entry) => ({
    ...entry,
    category: "Technical / Volunteer" as const,
  })),
].sort((a, b) => periodStartRank(b.period) - periodStartRank(a.period));

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative bg-(--portfolio-bg) px-6 py-28"
    >
      <div className="relative mx-auto w-full max-w-300">
        <SectionHeading accent={SPINE_ACCENT} label="Experience" />

        <h2 className="font-clash m-0 text-[clamp(36px,5vw,56px)] font-bold leading-[1.08] tracking-[-0.02em] text-(--portfolio-text)">
          Experience
        </h2>

        <div className="relative mt-12">
          <div className="absolute left-2 top-0 h-full w-0.5 -translate-x-1/2 bg-white/10 md:left-1/2" />
          <motion.div
            style={{
              scaleY: prefersReducedMotion ? 1 : spineScale,
              background: SPINE_ACCENT,
            }}
            className="absolute left-2 top-0 h-full w-0.5 origin-top -translate-x-1/2 md:left-1/2"
          />

          <div className="space-y-8">
            {timeline.map((entry, index) => (
              <TimelineEntryCard
                key={`${entry.company}-${entry.role}`}
                entry={entry}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

Lưu ý: `SectionHeading` của section này đổi từ `var(--portfolio-accent)` sang cyan — đây là hệ quả trực tiếp của yêu cầu "Experience không có cam". Nhãn "Experience" ở section này sẽ khác màu với nhãn các section khác (vẫn cam). Nếu chủ repo muốn nhãn giữ cam, đổi lại một dòng: `accent="var(--portfolio-accent)"`.

- [ ] **Step 2: Xác nhận không còn ảnh cutout và không còn cam trong file**

Run:
```bash
grep -nE "cutout|next/image|255,145,66|f97316|portfolio-accent" src/components/portfolio/experience.tsx
```
Expected: không có dòng nào in ra (exit code 1).

- [ ] **Step 3: Build**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Xem thực tế trên dev server**

Run:
```bash
npm run dev
```
Mở `http://localhost:3000/#experience` và kiểm 6 điểm:
1. Không còn ảnh chân dung ở Experience.
2. Spine chạy giữa, card so le trái/phải, mốc đầu (AI Club) ở bên trái.
3. Node tròn có icon nằm đúng trên spine, không lệch.
4. Mũi nhọn tam giác trỏ từ card vào spine, đúng phía.
5. Ngày nằm ngoài card, phía đối diện, canh ngang với node.
6. Thu cửa sổ về 375px: spine dạt sang trái, card một cột, ngày nằm trong card ngay dưới chip, mũi nhọn luôn ở cạnh trái.

Nếu preview trong pane bị policy chặn localhost, dừng lại và nhờ chủ repo xác nhận 6 điểm trên — **không** được báo là đã xong dựa trên suy đoán.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/experience.tsx
git commit -m "feat(experience): alternating timeline, remove portrait column"
```

---

### Task 4: Ảnh cutout sang About, bỏ cam ở khối ảnh

**Files:**
- Modify: `src/components/portfolio/about.tsx:18` (hằng ảnh), `:43` (glow section), `:80-115` (khối khung ảnh)

**Interfaces:**
- Consumes: file tĩnh `public/photos/cutout-experience.png` (đã có trong repo, 400×612).
- Produces: không có export mới.

- [ ] **Step 1: Đổi hằng ảnh**

Dòng 18, từ:
```tsx
const PROFILE_IMAGE = "/photos/photo-about.jpg";
```
thành:
```tsx
const PROFILE_IMAGE = "/photos/cutout-experience.png";
```

- [ ] **Step 2: Bỏ glow cam của section**

Dòng 43, từ:
```tsx
            "radial-gradient(ellipse 36% 24% at 18% 34%, rgba(255,145,66,0.1), transparent 70%)",
```
thành:
```tsx
            "radial-gradient(ellipse 36% 24% at 18% 34%, rgba(255,255,255,0.06), transparent 70%)",
```

- [ ] **Step 3: Thay toàn bộ khối khung ảnh**

Thay từ `<div className="relative aspect-454/506 w-full bg-[#1f1f1f]">` đến hết hai `<div>` viền cam (dòng 89-114) bằng:

```tsx
              <div className="relative aspect-[2/3] w-full bg-(--portfolio-surface)">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 55% at 50% 82%, rgba(0,212,255,0.16), transparent 72%)",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                  }}
                />
                <div className="pointer-events-none absolute bottom-4 left-1/2 h-px w-2/3 -translate-x-1/2 bg-white/16" />
                <Image
                  src={PROFILE_IMAGE}
                  alt={`${profile.name} portrait cutout`}
                  fill
                  className="object-contain object-bottom"
                  sizes="(max-width: 900px) 100vw, 454px"
                  priority
                />
              </div>
```

Ba lớp nền phải đứng **trước** `<Image>` trong DOM để ảnh nằm trên cùng, và cả ba đều `pointer-events-none`.

Bị xoá hoàn toàn trong bước này:
- overlay `background: "var(--portfolio-accent)"` + `mixBlendMode: "multiply"`
- `<div>` viền cam `left-[-20px] top-[56%]` với `borderColor: "rgba(255,145,66,0.7)"`
- `<div>` viền cam `right-[18px] top-[8%]` với `borderColor: "rgba(255,145,66,0.7)"`

- [ ] **Step 4: Xác nhận cam chỉ còn ở nút và SectionHeading**

Run:
```bash
grep -nE "255,145,66|portfolio-accent" src/components/portfolio/about.tsx
```
Expected: đúng **2** dòng — dòng `SectionHeading accent="var(--portfolio-accent)"` và dòng `className` của nút "Discover More About Me" (chứa cả `bg-(--portfolio-accent)` và `shadow-[...rgba(255,145,66,0.24)]`). Không còn dòng nào trong khối khung ảnh.

- [ ] **Step 5: Build**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 6: Xem thực tế**

Mở `http://localhost:3000/#about`, kiểm 4 điểm:
1. Ảnh trong khung là ảnh cutout (nền trong suốt), không phải ảnh nền xám cũ.
2. Không còn lớp phủ cam trên da/áo, không còn 2 khung viền cam ở góc.
3. Ảnh có quầng sáng cyan nhạt ở chân, lưới mờ, vạch sàn — không bị "trôi".
4. Ảnh không bị méo hay bị cắt đầu (do đổi sang `aspect-[2/3]` + `object-contain`).

- [ ] **Step 7: Commit**

```bash
git add src/components/portfolio/about.tsx
git commit -m "feat(about): use portrait cutout on neutral backdrop, drop orange tint"
```

---

### Task 5: Component `project-carousel.tsx`

**Files:**
- Create: `src/components/portfolio/project-carousel.tsx`

**Interfaces:**
- Consumes: không (nhận `children` bất kỳ).
- Produces: `export function ProjectCarousel({ children }: { children: React.ReactNode })`. Mỗi child được bọc trong một slide `snap-start`. Task 6 dùng đúng tên này và truyền các `<ProjectCard>` làm children.

- [ ] **Step 1: Tạo file với nội dung đầy đủ**

```tsx
"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";

const DOT_ACCENT = "#00d4ff";

export function ProjectCarousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const pages = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    setPageCount(pages);
    setActivePage(Math.min(pages - 1, Math.round(el.scrollLeft / el.clientWidth)));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    sync();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const goToPage = useCallback(
    (page: number) => {
      const el = trackRef.current;
      if (!el) return;
      const target = Math.max(0, Math.min(pageCount - 1, page));
      el.scrollTo({
        left: target * el.clientWidth,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [pageCount, prefersReducedMotion],
  );

  const atStart = activePage <= 0;
  const atEnd = activePage >= pageCount - 1;

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/22 bg-black/50 text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="relative mt-14">
      <button
        type="button"
        onClick={() => goToPage(activePage - 1)}
        disabled={atStart}
        aria-label="Previous projects"
        className={`${arrowClass} absolute -left-5 top-1/2 z-10 hidden -translate-y-1/2 lg:flex`}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => goToPage(activePage + 1)}
        disabled={atEnd}
        aria-label="Next projects"
        className={`${arrowClass} absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 lg:flex`}
      >
        <ChevronRight size={18} />
      </button>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goToPage(activePage + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToPage(activePage - 1);
          }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <div className="shrink-0 basis-[86%] snap-start sm:basis-[47%] lg:basis-[30.5%]">
            {child}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goToPage(activePage - 1)}
          disabled={atStart}
          aria-label="Previous projects"
          className={`${arrowClass} lg:hidden`}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              aria-label={`Go to project page ${page + 1}`}
              aria-current={page === activePage}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: page === activePage ? 18 : 6,
                background: page === activePage ? DOT_ACCENT : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goToPage(activePage + 1)}
          disabled={atEnd}
          aria-label="Next projects"
          className={`${arrowClass} lg:hidden`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add src/components/portfolio/project-carousel.tsx
git commit -m "feat(projects): add scroll-snap carousel component"
```

---

### Task 6: Nối carousel vào `projects.tsx`

**Files:**
- Modify: `src/components/portfolio/projects.tsx:1-9` (import), `:122-132` (khối grid)

**Interfaces:**
- Consumes: `ProjectCarousel` từ Task 5.
- Produces: không có export mới. `ProjectCard` **không đổi một dòng nào**, kể cả badge 🏆 cam.

- [ ] **Step 1: Thêm import**

Sau dòng `import { SectionHeading } from "./section-heading";` thêm:

```tsx
import { ProjectCarousel } from "./project-carousel";
```

- [ ] **Step 2: Thay khối grid bằng carousel**

Thay:
```tsx
        {projects.length > 0 ? (
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        ) : (
```
bằng:
```tsx
        {projects.length > 0 ? (
          <ProjectCarousel>
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </ProjectCarousel>
        ) : (
```

Phần `) : (` và khối "No projects available yet." giữ nguyên.

- [ ] **Step 3: Build**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Xem thực tế**

Mở `http://localhost:3000/#projects`, kiểm 7 điểm:
1. Desktop ≥1024px: thấy 3 thẻ đầy + thẻ thứ 4 hé ra bên phải.
2. Chevron trái bị mờ + không bấm được khi đang ở trang đầu; chevron phải mờ khi ở trang cuối.
3. Bấm chevron phải: track trượt đúng một trang, dot đổi theo.
4. Bấm dot: nhảy đúng trang đó.
5. Click vào track rồi bấm ←/→: trượt đúng.
6. 768px: 2 thẻ. 375px: 1 thẻ + hé thẻ sau, swipe được, chevron hiện ở hàng dưới cạnh dot.
7. Không có thanh scrollbar ngang lộ ra dưới track.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/projects.tsx
git commit -m "feat(projects): swap grid for carousel"
```

---

### Task 7: Rà soát cuối và báo cáo

**Files:**
- Không sửa file nào. Chỉ kiểm chứng và, nếu phát hiện sai, quay lại task tương ứng.

**Interfaces:**
- Consumes: kết quả Task 1-6.
- Produces: báo cáo cho chủ repo.

- [ ] **Step 1: Xác nhận phạm vi "bỏ cam" đúng như đã chốt**

Run:
```bash
grep -rnE "f97316|ff9142|255,145,66|255 145 66" src/ | sort
```
Expected — **chỉ** những dòng sau còn cam, không thêm không bớt:
- `src/app/globals.css` — `--portfolio-accent` và `::selection`
- `src/components/portfolio/hero.tsx` — 3 dòng (2 glow + nút)
- `src/components/portfolio/about.tsx` — 1 dòng (nút "Discover More About Me")
- `src/components/portfolio/projects.tsx` — 1 dòng (hover shadow của card)
- `src/data/portfolio.ts` — 5 dòng `#f97316` còn lại thuộc `pillars`, `projects`, `skillCategories` (**không** thuộc 4 mảng experience)

Nếu `experience.tsx`, `timeline-entry.tsx`, `project-carousel.tsx` xuất hiện trong output → có chỗ sót, quay lại sửa.

- [ ] **Step 2: Xác nhận `photo-about.jpg` không còn được tham chiếu nhưng vẫn tồn tại**

Run:
```bash
grep -rn "photo-about" src/ ; ls -la public/photos/
```
Expected: `grep` không in ra dòng nào; `ls` vẫn thấy cả `photo-about.jpg` và `cutout-experience.png`.

- [ ] **Step 3: Build sạch lần cuối**

Run:
```bash
npm run build
```
Expected: `✓ Compiled successfully`, 0 lỗi TypeScript. Dán output thật vào báo cáo.

- [ ] **Step 4: Xem lại toàn trang một lượt**

Mở `http://localhost:3000/` từ đầu, cuộn hết trang ở 1440px rồi 375px. Xác nhận không có section nào bị vỡ layout do các thay đổi trên — đặc biệt là `portfolio-page.tsx` không cần sửa và Hero/Skills/Contact/Footer vẫn như cũ.

- [ ] **Step 5: Báo cáo cho chủ repo**

Nêu rõ:
- Output thật của `npm run build`.
- Những gì đã tự mắt xác nhận vs. những gì cần chủ repo xác nhận (nếu preview bị policy chặn localhost thì nói thẳng).
- Hai chỗ trong resume cần chủ repo quyết: placeholder `[X]%` ở bullet ACM đã bị bỏ; câu "raise average assignment scores by 90%" giữ nguyên nguyên văn.
- Nhãn `SectionHeading` của Experience đã đổi sang cyan, khác màu với các section khác — sửa lại bằng một dòng nếu không muốn.
- Branch `feat/timeline-resume-carousel` với 6 commit code (cộng 1 commit spec có trước), chưa merge vào `main`, chưa push.
