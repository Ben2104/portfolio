export const profile = {
  initials: "AC",
  name: "Alex Chen",
  availability: "Available for work",
  title:
    "Crafting digital experiences at the intersection of design and engineering.",
  roles: ["Staff Engineer", "System Architect", "Open Source"],
  aboutHeading: "Building the future, one commit at a time.",
  aboutBody:
    "I'm a Staff Software Engineer with 7+ years building at scale across Meta, Stripe, and Airbnb. I specialize in distributed systems, developer tooling, and crafting interfaces that feel effortless. When I'm not shipping features, I contribute to open source and mentor engineers on their journey.",
  contactHeading: "Let's build something extraordinary.",
  opportunityBlurb:
    "Currently exploring Staff+ engineering roles, fractional CTO work, and interesting OSS collaborations.",
  responseTime: "under 24 hours",
  email: "alex@chen.io",
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

export const stats = [
  { value: "7+", label: "Years Experience" },
  { value: "60+", label: "Projects Shipped" },
  { value: "12k+", label: "GitHub Stars" },
  { value: "3", label: "Big Tech Roles" },
] as const;

export const pillars = [
  {
    icon: "code2",
    title: "Clean Code",
    desc: "Writing maintainable, scalable systems that stand the test of time.",
    color: "#00d4ff",
  },
  {
    icon: "layers",
    title: "Full Stack",
    desc: "Owning the entire product, from pixel-perfect UI to distributed backend.",
    color: "#7c3aed",
  },
  {
    icon: "zap",
    title: "Performance",
    desc: "Obsessed with speed. Every millisecond counts in the user experience.",
    color: "#f97316",
  },
] as const;

export const projects = [
  {
    title: "NeuralFlow",
    subtitle: "AI/ML Dashboard Platform",
    desc: "Real-time ML pipeline monitoring with interactive model training visualizations and experiment tracking at scale.",
    tags: ["React", "Python", "TensorFlow", "WebSockets"],
    color: "#00d4ff",
    stars: "4.2k",
    image:
      "https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMG1hY2hpbmUlMjBsZWFybmluZyUyMG5ldXJhbCUyMG5ldHdvcmslMjB2aXN1YWxpemF0aW9ufGVufDF8fHx8MTc3MzM2ODE2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    liveHref: "#",
    sourceHref: "#",
  },
  {
    title: "Velocity",
    subtitle: "E-Commerce Platform",
    desc: "High-performance commerce platform handling 50k+ concurrent users with sub-100ms response times globally.",
    tags: ["Next.js", "Go", "PostgreSQL", "Redis"],
    color: "#7c3aed",
    stars: "2.8k",
    image:
      "https://images.unsplash.com/photo-1757301714935-c8127a21abc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjBtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2UlMjBkZXNpZ258ZW58MXx8fHwxNzczMjg1NTA5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    liveHref: "#",
    sourceHref: "#",
  },
  {
    title: "Nexus",
    subtitle: "Real-time Collaboration",
    desc: "Figma-meets-Notion: a collaborative workspace with live cursors, conflict-free replicated data types, and zero-latency sync.",
    tags: ["React", "Socket.io", "Yjs", "Redis"],
    color: "#f97316",
    stars: "3.1k",
    image:
      "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsLXRpbWUlMjBjb2xsYWJvcmF0aW9uJTIwc29mdHdhcmUlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzczMzY4MTY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    liveHref: "#",
    sourceHref: "#",
  },
  {
    title: "DevScope",
    subtitle: "DevOps Monitoring Suite",
    desc: "Kubernetes-native observability platform with distributed tracing, anomaly detection, and automated incident response.",
    tags: ["Go", "Kubernetes", "Prometheus", "Grafana"],
    color: "#00d4ff",
    stars: "1.9k",
    image:
      "https://images.unsplash.com/photo-1758905024964-4b4818821a04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZvcHMlMjBjbG91ZCUyMGluZnJhc3RydWN0dXJlJTIwbW9uaXRvcmluZ3xlbnwxfHx8fDE3NzMzNjgxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    liveHref: "#",
    sourceHref: "#",
  },
  {
    title: "Prism CLI",
    subtitle: "Developer Tooling",
    desc: "A blazing-fast CLI toolkit for scaffolding, code generation, and automated refactoring across monorepos.",
    tags: ["Rust", "CLI", "WASM", "TypeScript"],
    color: "#7c3aed",
    stars: "5.6k",
    image:
      "https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcGVuJTIwc291cmNlJTIwY29kZSUyMGRldmVsb3BlciUyMHRlcm1pbmFsfGVufDF8fHx8MTc3MzM2ODE2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    liveHref: "#",
    sourceHref: "#",
  },
  {
    title: "EdgeAPI",
    subtitle: "Serverless Gateway",
    desc: "Globally distributed API gateway running on the edge with built-in auth, rate limiting, and zero cold starts.",
    tags: ["TypeScript", "Cloudflare", "Hono", "D1"],
    color: "#f97316",
    stars: "2.4k",
    image:
      "https://images.unsplash.com/photo-1721444127971-b7d0023bbef2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBUEklMjBzZXJ2ZXJsZXNzJTIwY2xvdWQlMjBhcmNoaXRlY3R1cmUlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzMzNjgxNjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    liveHref: "#",
    sourceHref: "#",
  },
] as const;

export const skillCategories = [
  {
    label: "Frontend",
    color: "#00d4ff",
    skills: [
      { name: "React", level: 98 },
      { name: "TypeScript", level: 95 },
      { name: "Next.js", level: 92 },
      { name: "Three.js", level: 80 },
      { name: "Tailwind CSS", level: 96 },
      { name: "Vue.js", level: 78 },
    ],
  },
  {
    label: "Backend",
    color: "#7c3aed",
    skills: [
      { name: "Node.js", level: 94 },
      { name: "Go", level: 85 },
      { name: "Python", level: 90 },
      { name: "Rust", level: 70 },
      { name: "GraphQL", level: 88 },
      { name: "FastAPI", level: 84 },
    ],
  },
  {
    label: "Database",
    color: "#f97316",
    skills: [
      { name: "PostgreSQL", level: 92 },
      { name: "Redis", level: 88 },
      { name: "MongoDB", level: 82 },
      { name: "Supabase", level: 86 },
      { name: "Prisma", level: 90 },
      { name: "ClickHouse", level: 74 },
    ],
  },
  {
    label: "DevOps & Cloud",
    color: "#00d4ff",
    skills: [
      { name: "Docker", level: 93 },
      { name: "Kubernetes", level: 85 },
      { name: "AWS", level: 88 },
      { name: "Terraform", level: 78 },
      { name: "GitHub Actions", level: 92 },
      { name: "Cloudflare", level: 84 },
    ],
  },
] as const;

export const allBadges = [
  "React",
  "TypeScript",
  "Next.js",
  "Vue.js",
  "Tailwind CSS",
  "Three.js",
  "Node.js",
  "Go",
  "Python",
  "Rust",
  "GraphQL",
  "FastAPI",
  "Express",
  "PostgreSQL",
  "Redis",
  "MongoDB",
  "Supabase",
  "Prisma",
  "ClickHouse",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Terraform",
  "GitHub Actions",
  "Cloudflare",
  "Figma",
  "Git",
  "Linux",
  "WebSockets",
  "gRPC",
  "Kafka",
] as const;

export const experiences = [
  {
    role: "Staff Software Engineer",
    company: "Meta",
    period: "2023 — Present",
    location: "Menlo Park, CA",
    color: "#00d4ff",
    description:
      "Leading cross-functional teams of 12+ engineers on Meta's developer infrastructure platform. Architected a new service mesh reducing p99 latency by 40% across 200+ microservices. Drove adoption of our internal platform from 2k to 15k engineers.",
    highlights: [
      "Built and scaled internal developer platform to 15k+ engineers",
      "Reduced infrastructure costs by $2.4M annually via optimization",
      "Led architecture of new GraphQL federation layer",
    ],
    tags: ["Go", "React", "Kubernetes", "GraphQL"],
  },
  {
    role: "Senior Software Engineer",
    company: "Stripe",
    period: "2020 — 2023",
    location: "San Francisco, CA",
    color: "#7c3aed",
    description:
      "Core member of the Payments API team handling $1T+ in annual transaction volume. Redesigned the idempotency system and built the TypeScript SDK used by 500k+ developers worldwide. Mentored 8 engineers from mid-level to senior.",
    highlights: [
      "Owned TypeScript SDK with 500k+ weekly downloads",
      "Reduced payment failure rate by 18% via ML-powered retry logic",
      "Shipped real-time webhook delivery system with 99.99% reliability",
    ],
    tags: ["Ruby", "TypeScript", "PostgreSQL", "Kafka"],
  },
  {
    role: "Software Engineer",
    company: "Airbnb",
    period: "2018 — 2020",
    location: "San Francisco, CA",
    color: "#f97316",
    description:
      "Joined as an early member of the Search Infrastructure team. Rebuilt the listing search engine using Elasticsearch and ML ranking models, improving booking conversion by 22%. Created a reusable component library adopted across 4 product teams.",
    highlights: [
      "Rebuilt search engine improving conversion by 22%",
      "Created shared component library with 120+ React components",
      "Led migration from monolith to microservices architecture",
    ],
    tags: ["Java", "React", "Elasticsearch", "Redis"],
  },
  {
    role: "Junior Software Engineer",
    company: "Vercel",
    period: "2017 — 2018",
    location: "Remote",
    color: "#00d4ff",
    description:
      "Contributed to the Next.js framework and Vercel platform. Built features for the deployment dashboard, improved the CLI DX, and helped grow the open source community from 8k to 40k GitHub stars.",
    highlights: [
      "Contributed to Next.js core with 60+ merged PRs",
      "Built real-time deployment log streaming",
      "Helped grow the OSS community from 8k to 40k stars",
    ],
    tags: ["Next.js", "Node.js", "TypeScript", "Go"],
  },
] as const;

export const socials = [
  {
    icon: "github",
    label: "GitHub",
    handle: "@alexchen",
    href: "#",
    color: "#f8fafc",
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    handle: "alexchen",
    href: "#",
    color: "#0ea5e9",
  },
  {
    icon: "twitter",
    label: "Twitter",
    handle: "@alexchen",
    href: "#",
    color: "#1d9bf0",
  },
  {
    icon: "mail",
    label: "Email",
    handle: "alex@chen.io",
    href: "mailto:alex@chen.io",
    color: "#00d4ff",
  },
] as const;

