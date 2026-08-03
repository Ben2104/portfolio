# Timeline theo resume mới · ảnh About · Projects carousel

**Ngày:** 2026-08-02
**Branch:** `feat/timeline-resume-carousel`
**Trạng thái:** đã chốt với chủ repo qua brainstorming

## Bối cảnh

Portfolio Next.js 16 + Tailwind v4 + `motion/react`, dark theme (`--portfolio-bg: #1a1a1a`),
accent hiện tại là cam `--portfolio-accent: #ff9142`.

Ba yêu cầu gốc:

1. Timeline Experience phải khớp resume mới (`Khoi_Do_resume_reworked.docx`).
2. Bỏ ảnh cutout ở Experience, dựng lại timeline theo reference Dribbble
   [Responsive Vertical Timeline — CodingNepal](https://dribbble.com/shots/14891548-Responsive-Vertical-Timeline-Design-using-only-HTML-CSS):
   spine giữa, card so le trái/phải, node tròn có icon trên spine, mũi nhọn tam giác trỏ vào spine.
3. Đưa ảnh cutout đó sang About thay ảnh cũ, **không có màu cam**, hoà vào theme.

Bổ sung sau khi xem reference [gemmatruong.github.io/portfolio](https://gemmatruong.github.io/portfolio/):

4. Projects chuyển từ grid sang **carousel** có chevron trái/phải.

## Quyết định đã chốt

| # | Vấn đề | Chốt |
|---|--------|------|
| 1 | Phạm vi "không màu cam" | **Chỉ** Experience + ảnh About. Hero, nút About, section heading, badge 🏆 Projects, `globals.css` giữ cam. |
| 2 | Số mốc trên timeline | Giữ đủ **6** mốc; viết lại nội dung 4 mốc có trong resume. |
| 3 | Mốc thời gian DFM Europe | `May 2026 — Aug 2026` (theo resume), bullet chuyển thì quá khứ. |
| 4 | Ảnh cutout ở About | Đặt **trong** khung bo góc 30px hiện có, thêm nền (quầng cyan nhạt + lưới mờ + vạch sàn). |
| 5 | Bố cục card timeline | Ngày nằm **ngoài** card phía đối diện spine; giữ chip phân loại. |
| 6 | Kiểu carousel | Track trượt ngang scroll-snap, desktop 3 thẻ + thẻ 4 hé ra. Không autoplay. |

## Phạm vi file

| File | Việc |
|---|---|
| `src/data/portfolio.ts` | viết lại 4 mốc theo resume; đổi màu 6 mốc sang bảng không cam |
| `src/components/portfolio/experience.tsx` | bỏ cột ảnh cutout; dựng timeline so le |
| `src/components/portfolio/timeline-entry.tsx` *(mới)* | 1 card + node + mũi nhọn |
| `src/components/portfolio/about.tsx` | đổi sang ảnh cutout; bỏ lớp phủ cam + 2 khung viền cam |
| `src/components/portfolio/projects.tsx` | thay grid bằng carousel |
| `src/components/portfolio/project-carousel.tsx` *(mới)* | track / arrow / dot; `ProjectCard` giữ nguyên |
| `.gitignore` | thêm `.superpowers/` |

**Không chạm:** `hero.tsx`, `skills.tsx`, `contact.tsx`, `footer.tsx`, `navbar.tsx`,
`education.tsx`, `globals.css`, `spline-scene.tsx`, `terminal-preloader.tsx`.

## 1 · Dữ liệu timeline (`src/data/portfolio.ts`)

### Thứ tự

`experience.tsx` đang sắp theo ngày bắt đầu giảm dần qua `periodStartRank()` — giữ nguyên hàm này.
Thứ tự kết quả:

1. AI Club at CSULB — Project Manager — Jun 2026 — Present
2. DFM Europe — Software Engineering Intern — May 2026 — Aug 2026
3. ACM at CSULB — Webmaster — Jan 2026 — May 2026
4. California State University, Long Beach — Instructional Student Assistant — Aug 2025 — Present
5. De Anza College — Computer Technical Support Volunteer — Dec 2023 — Jun 2024
6. De Anza College — Teaching Assistant — Sep 2023 — Jun 2024

`periodStartRank()` split theo em dash `—`, nên mọi chuỗi `period` **phải** dùng em dash, không dùng
hyphen `-` hay en dash `–`.

### Bảng màu (bỏ hẳn `#f97316`)

| Nhóm | Màu | Mốc |
|---|---|---|
| Professional | `#00d4ff` | DFM Europe, ACM Webmaster |
| Leadership & Research | `#a78bfa` | AI Club |
| Teaching | `#94a3b8` | CSULB ISA, De Anza TA |
| Technical / Volunteer | `#64748b` | De Anza volunteer |

Ba màu này chỉ dùng trong Experience. `pillars`, `skillCategories`, `projects` giữ nguyên màu cũ
(kể cả `#f97316`) vì nằm ngoài phạm vi.

### Nội dung viết lại

**`professionalExperience[0]` — DFM Europe**

- `role`: Software Engineering Intern
- `period`: `May 2026 — Aug 2026`
- `location`: Ho Chi Minh City, Vietnam · On-site
- `color`: `#00d4ff`
- highlights (nguyên văn resume, thì quá khứ):
  1. Designed and deployed a multi-agent system using LangGraph to automate 3D-to-2D engineering
     drawing conversion, eliminating manual conversion steps for the ATN Drawing system.
  2. Partnered with mechanical and AI engineers to re-architect the technical drawing pipeline,
     improving processing performance by 85%.
  3. Built a Python/FastAPI backend integrating the OpenAI API to auto-scale 2D drawing output,
     maximizing sketch paper utilization and improving drawing precision by 87%.
  4. Developed an AI-powered isometric view generation feature, producing dimensionally accurate
     projections that cut manual layout time by 100%.
- `tags`: Python, FastAPI, LangGraph, OpenAI API, Multi-agent Systems

**`professionalExperience[1]` — ACM at CSULB**

- `period`: `Jan 2026 — May 2026` (giữ)
- `color`: `#00d4ff`
- highlights:
  1. Led the redesign and redevelopment of the ACM at CSULB landing page using Next.js, boosting
     mobile usability across 1000+ monthly visitors.
  2. Refactored the existing Next.js codebase into a more modular and scalable architecture,
     reducing technical debt and improving long-term maintainability.
  3. Shipped new dashboard features for image upload and management, integrating Next.js frontend
     components with backend APIs to support 500 active users.
- `tags`: giữ nguyên (Next.js, React.js, Tailwind CSS, Backend APIs)

> Resume để placeholder `improving page load speed by [X]%` — **bỏ mệnh đề đó**, không đưa
> placeholder lên site. Nếu chủ repo cấp số thật thì thêm lại vào bullet 1.

**`leadershipExperience[0]` — AI Club at CSULB**

- `period`: `Jun 2026 — Present` (giữ)
- `color`: `#a78bfa`
- highlights:
  1. Directed a faculty-mentored biometric sensor research project across a team of 4 members,
     defining scope, milestones, and responsibilities to keep deliverables on schedule.
  2. Synthesized findings from 10+ papers on wearable sensor technologies and physiological data
     collection to guide the team's technical direction and experimental design.
- `tags`: Research Coordination, Biometric Sensors, Wearable Technology

**`teachingExperience[0]` — CSULB Instructional Student Assistant**

- `period`: `Aug 2025 — Present` (giữ)
- `color`: `#94a3b8`
- highlights:
  1. Graded and delivered feedback on Python assignments, labs, and exams for 150+ students per term
     across computer arithmetic and matrix computation topics, applying a consistent rubric.
  2. Reviewed 150+ submissions per semester for correctness, efficiency, and code quality, helping
     raise average assignment scores by 90%.
- `tags`: giữ nguyên

> Bullet 2 giữ nguyên câu chữ resume theo yêu cầu chủ repo, dù "raise average assignment scores by
> 90%" đọc ra nghĩa điểm trung bình tăng gần gấp đôi.

**`teachingExperience[1]` — De Anza TA** — nội dung giữ nguyên, chỉ `color` → `#94a3b8`.

**`volunteerExperience[0]` — De Anza volunteer** — nội dung giữ nguyên, chỉ `color` → `#64748b`.

## 2 · Timeline (`experience.tsx` + `timeline-entry.tsx`)

### Xoá

Toàn bộ cột ảnh sticky (`experience.tsx:156-181`): `CUTOUT_IMAGE`, `Image`, parallax `parallaxY`,
`useTransform` cho parallax, radial-gradient cam `rgba(255,145,66,0.28)`, vạch sàn. Bỏ luôn
`import Image from "next/image"` và `import { profile }` nếu không còn dùng.

Grid 2 cột `md:grid-cols-[454px_minmax(0,1fr)]` → 1 cột full width.

### Desktop (`>= md`)

- Container `relative`, spine giữa: `absolute left-1/2 -ml-px w-0.5 inset-y-0 bg-white/10`.
- Thanh fill theo scroll: giữ `useScroll` + `spineScale` hiện có, đổi `bg-(--portfolio-accent)`
  → `#00d4ff`. Vẫn `origin-top` + `scaleY`.
- Mỗi mốc là một row `grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)]`:
  - mốc index chẵn → card ở cột 1, ngày ở cột 3
  - mốc index lẻ → ngày ở cột 1 (`text-right`), card ở cột 3
- Node: `absolute left-1/2 -translate-x-1/2 top-3`, tròn 34px, `bg-(--portfolio-surface)`,
  `box-shadow: 0 0 0 1px <color>73, 0 0 14px <color>40`, icon lucide 14px màu `<color>`:
  | Nhóm | Icon |
  |---|---|
  | Professional | `Briefcase` |
  | Teaching | `GraduationCap` |
  | Leadership & Research | `Users` |
  | Technical / Volunteer | `Wrench` |
- Mũi nhọn: `<span>` 12px vuông, `rotate-45`, `bg-(--portfolio-surface)`, `top-5`; card bên trái thì
  `-right-[7px]` + `border-t border-r border-white/10`; card bên phải thì `-left-[7px]` +
  `border-b border-l border-white/10`.
- Card: `bg-(--portfolio-surface) border border-white/10 rounded-2xl p-6` — giữ như card hiện tại.
  Nội dung theo thứ tự: chip phân loại → `role` → `company · location` → bullets → tags.
  Chip và tên công ty dùng `entry.color`.
- Ngày: `text-[11px] font-bold uppercase tracking-[0.08em] text-(--portfolio-subtle)`, canh top
  ngang với node.

### Mobile (`< md`)

- Spine dạt sang trái: `left-2`, card một cột `pl-10`.
- Mũi nhọn luôn ở cạnh trái card.
- Node `left-2 -translate-x-1/2`.
- Ngày chuyển **vào trong** card, đặt ngay dưới chip, vì không còn cột đối diện.

Cách làm: render ngày ở hai chỗ — bản ngoài card `hidden md:block`, bản trong card `md:hidden`.

### Animation

Giữ `motion.article` với `initial/whileInView` như hiện tại. `useReducedMotion()` true thì:
`y: 0`, `spineScale: 1` (spine đầy sẵn), node không scale.

## 3 · About (`about.tsx`)

- `PROFILE_IMAGE` → `/photos/cutout-experience.png`.
- `<Image>` đổi `object-cover` → `object-contain object-bottom`. Khung đổi `aspect-454/506` →
  `aspect-[2/3]` (ảnh cutout là 400×612 ≈ 2/3, giữ 454/506 sẽ méo).
- Bên trong khung, **thêm** 3 lớp nền. Cả 3 phải đứng **trước** `<Image>` trong DOM để ảnh nằm trên
  cùng, và đều `pointer-events-none`:
  - quầng sáng chân: `radial-gradient(ellipse 70% 55% at 50% 82%, rgba(0,212,255,0.16), transparent 72%)`
  - lưới mờ: hai `linear-gradient` 1px `rgba(255,255,255,0.045)`, `background-size: 26px 26px`
  - vạch sàn: `absolute left-1/2 -translate-x-1/2 bottom-4 h-px w-2/3 bg-white/16`
- **Xoá**: overlay `background: var(--portfolio-accent)` + `mixBlendMode: multiply`
  (`about.tsx:98-105`) và 2 div khung viền cam `rgba(255,145,66,0.7)` (`about.tsx:107-114`).
- Radial glow của section (`about.tsx:43`): `rgba(255,145,66,0.1)` → `rgba(255,255,255,0.06)`.
- Nút "Discover More About Me" **giữ cam** (ngoài phạm vi).
- `public/photos/photo-about.jpg` thành file không dùng — **không xoá**, để lại trong repo.

## 4 · Projects carousel

`projects.tsx` giữ `<section>`, `SectionHeading`, `<h2>`, và `ProjectCard` **y nguyên** (kể cả badge
🏆 cam). Chỉ thay khối grid `projects.tsx:123-127` bằng `<ProjectCarousel projects={projects} />`.

`project-carousel.tsx`:

- Track: `flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth` + ẩn scrollbar
  (`[scrollbar-width:none] [&::-webkit-scrollbar]:none`).
- Mỗi thẻ `snap-start shrink-0` với `basis`:
  - `< sm`: `86%` — 1 thẻ, hé thẻ sau
  - `sm`: `47%` — 2 thẻ
  - `lg`: `30.5%` — 3 thẻ, phần dư ~8% là thẻ 4 hé ra
- Chevron: 2 nút tròn 40px `border border-white/22 bg-black/50`, icon `ChevronLeft` / `ChevronRight`
  của lucide, đặt hai bên (desktop: absolute ngoài track; mobile: hàng dưới cùng dot).
  - `aria-label="Previous projects"` / `"Next projects"`
  - `disabled` + `opacity-40 cursor-not-allowed` khi ở đầu / cuối
- Dot: số trang suy từ chính DOM, **không** hard-code theo breakpoint —
  `pageCount = Math.max(1, Math.round(scrollWidth / clientWidth))`,
  `activePage = Math.round(scrollLeft / clientWidth)`. Cách này tự đúng ở mọi breakpoint mà không
  cần resize listener riêng cho `perView`. Dot active dài ra (`w-4.5`) màu `#00d4ff`, còn lại
  `w-1.5 bg-white/20`. Click dot `i` → `scrollTo({ left: i * clientWidth })`.
- Điều hướng bằng `scrollBy({ left: ±trackWidth, behavior: "smooth" })`; đọc `scrollLeft` qua
  listener `scroll` (throttle bằng `requestAnimationFrame`) để cập nhật dot + trạng thái disabled.
- Bàn phím: `onKeyDown` trên track, `ArrowLeft` / `ArrowRight`, `tabIndex={0}`.
- A11y: track có `role="region"`, `aria-roledescription="carousel"`, `aria-label="Projects"`.
- Không autoplay.
- `useReducedMotion()` true → `behavior: "auto"` thay vì `"smooth"`.

## Không làm (YAGNI)

- Không đổi `--portfolio-accent` trong `globals.css`.
- Không thêm thư viện carousel (embla, swiper) — `scroll-snap` + `motion/react` đã có là đủ.
- Không autoplay, không vòng lặp vô tận (loop) cho carousel.
- Không xoá `photo-about.jpg`.
- Không sửa `stats` ("1.5+ Years Experience", "15+ Projects Shipped") — chủ repo không yêu cầu.
- Không thêm mốc Honors & Awards từ resume thành section mới.

## Kiểm chứng

Repo **không có** test và **không có** lint script — `package.json` chỉ có `dev`, `build`, `start`.
Vì vậy bằng chứng hoàn thành là:

1. `npm run build` chạy sạch (Next 16 build có type-check TypeScript) — dán output thật.
2. `npm run dev` + tự mở xem: Experience desktop (so le, node, mũi nhọn, spine fill), Experience
   mobile 375px (spine trái, một cột, ngày trong card), About (cutout có nền, không cam),
   Projects (3 thẻ, chevron, dot, disabled ở hai đầu, swipe).
3. Grep xác nhận không còn `f97316` / `255,145,66` / `ff9142` trong `experience.tsx`,
   `about.tsx`, và trong 4 mảng experience của `portfolio.ts`.

Làm trên branch `feat/timeline-resume-carousel`, không commit thẳng `main`.
