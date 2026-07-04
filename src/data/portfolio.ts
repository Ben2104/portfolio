
export const profile = {
  initials: "KD",
  name: "Khoi Do",
  availability: "Available for work",
  title:
    "Crafting digital experiences where design meets engineering.",
  roles: ["Computer Science Student", "Software Engineer"],
  aboutHeading: "Building the future, one commit at a time.",
  aboutBody:
    "I'm a Computer Science Student with a passion for creating innovative solutions at the intersection of design and engineering. When I'm not coding, I contribute to open source and mentor other students on their journey.",
  contactHeading: "Let's build something extraordinary.",
  opportunityBlurb:
    "Currently exploring Software Engineer roles, and interesting OSS collaborations.",
  responseTime: "under 24 hours",
  email: "dohoangkhoi341@gmail.com",
};

export const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Teaching", href: "#teaching" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Education", href: "#education" },
  { label: "Awards", href: "#awards" },
  { label: "Contact", href: "#contact" },
] as const;

export const stats = [
  { value: "1.5+", label: "Years Experience" },
  { value: "15+", label: "Projects Shipped" },
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
    title: "CrisisLineAI",
    subtitle: "Voice AI Agent Crisis Support System",
    desc: "A multi-channel crisis support system that combines realtime web chat, counselor takeover controls, and voice-call AI orchestration.",
    tags: [
      "Next.js",
      "Tailwind CSS",
      "FastAPI",
      "Python",
      "Firebase",
      "Twilio",
      "Docker",
    ],
    color: "#7c3aed",
    image: "/projects/crisislineai.png",
    liveHref: "https://devpost.com/software/crisisline-ai",
    sourceHref: "https://github.com/Ben2104/CrisisLineAI",
    stars: "",
  },
  {
    title: "Shape-Sign",
    subtitle: "",
    desc: "Shape-Sign is an interactive application that utilizes hand gesture recognition models to help users learn and engage with sign language.",
    tags: ["Next.js", "React.js", "Tailwind CSS", "TensorFlow", "Python"],
    color: "#00d4ff",
    image: "/projects/shape&sign.png",
    liveHref: "https://shape-sign.vercel.app/",
    sourceHref: "https://github.com/Ben2104/Shape-Sign",
    stars: "",
  },
  {
    title: "911 OPERATOR ASSISTANT",
    subtitle: "",
    desc: "A web application designed to assist 911 operators by providing real-time information and resources during emergency calls.",
    tags: [
      "Next.js",
      "Node.js",
      "FastAPI",
      "Python",
      "Tailwind CSS",
      "Google Maps API",
      "Geoapify API",
      "Twilio API",
    ],
    color: "#7c3aed",
    image: "/projects/911_operator.png",
    liveHref: "",
    sourceHref: "https://github.com/Ben2104/911-Operator-Assistant",
    stars: "",
  },
  {
    title: "QuizzRiff",
    subtitle: "",
    desc: "QuizRiff helps educators save time by automating personalized quiz creation and adding a competitive scoring system to keep students engaged in learning.",
    tags: ["Python", "HTML", "CSS", "SQLite3", "Flask", "WolframAlpha API"],
    color: "#f97316",
    image: "/projects/quizzriff.png",
    liveHref: "",
    sourceHref: "https://github.com/Ben2104/QuizzRiff",
    stars: "",
  },
  {
    title: "The Bookstore",
    subtitle: "",
    desc: "The Bookstore project is a MERN stack web app with full CRUD functionality for managing books, authors, and collections efficiently.",
    tags: ["MongoDB", "Express.js", "React.js", "Node.js", "Tailwind CSS"],
    color: "#00d4ff",
    image: "/projects/Bookstore.png",
    liveHref: "",
    sourceHref: "https://github.com/Ben2104/BookStore",
    stars: "",
  },
  {
    title: "LLM Chatbot",
    subtitle: "",
    desc: "LLM Chatbot is an AI-powered chatbot that uses large language models to engage in natural language conversations with users.",
    tags: [
      "React",
      "Tailwind CSS",
      "Vite",
      "Node.js",
      "Express",
      "OpenAI API",
      "Multer",
    ],
    color: "#7c3aed",
    image: "/projects/chatbot.png",
    liveHref: "",
    sourceHref: "https://github.com/Ben2104/Chat-Bot",
    stars: "",
  },
  {
    title: "Pickleball-Booking-Extension",
    subtitle: "",
    desc: "A Chrome Extension that automates court booking at iPickle Cerritos by instantly reserving available courts exactly 7 days in advance at 7:00 AM, streamlining a highly competitive process.",
    tags: ["JavaScript", "HTML", "CSS"],
    color: "#f97316",
    image: "/projects/pickleball.jpg",
    liveHref: "",
    sourceHref: "https://github.com/Ben2104/Pickleball-Booking-Extension",
    stars: "",
  },
  {
    title: "Pickleball Booking Automation (Playwright & GitHub Actions)",
    subtitle: "",
    desc: "Automates court booking at iPickle Cerritos using Playwright for browser automation, scheduled via Cron-Jobs.org and executed as a GitHub Action.",
    tags: ["JavaScript", "Playwright", "GitHub Actions", "Cron-Jobs.org"],
    color: "#00d4ff",
    image: "/projects/pickleball_bot.png",
    liveHref: "",
    sourceHref: "https://github.com/Ben2104/pickleball-bot",
    stars: "",
  },
] as const;

export const skillCategories = [
  {
    label: "Frontend",
    color: "#00d4ff",
    skills: [
      { name: "React", level: 98, icon: "/assets/reactjs.png" },
      { name: "TypeScript", level: 95, icon: "/assets/typescript.png" },
      { name: "Next.js", level: 92, icon: "/assets/nextjs.png" },
      { name: "Tailwind CSS", level: 96, icon: "/assets/tailwindcss.png" },
    ],
  },
  {
    label: "Backend",
    color: "#7c3aed",
    skills: [
      { name: "Node.js", level: 75, icon: "/assets/nodejs.png" },
      { name: "Python", level: 80, icon: "/assets/python.png" },
      { name: "FastAPI", level: 84, icon: "/assets/fastapi.png" },
      { name: "REST APIs", level: 88, icon: "/assets/restapi.png" },
    ],
  },
  {
    label: "Database",
    color: "#f97316",
    skills: [
      { name: "PostgreSQL", level: 68, icon: "/assets/postgressql.png" },
      { name: "MongoDB", level: 70, icon: "/assets/mongodb.png" },
      { name: "Supabase", level: 60, icon: "/assets/supabase.png" },
      { name: "Prisma", level: 90, icon: "/assets/prisma.png" },
    ],
  },
  {
    label: "DevOps & Cloud",
    color: "#00d4ff",
    skills: [
      { name: "Docker", level: 75, icon: "/assets/docker.png" },
      { name: "GitHub Actions", level: 92, icon: "/assets/githubaction.png" },
    ],
  },
] as const;

export const allBadges = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "Python",
  "FastAPI",
  "Express",
  "PostgreSQL",
  "MongoDB",
  "Supabase",
  "Prisma",
  "Docker",
  "GitHub Actions",
  "Figma",
  "Git",
  "Linux",
  "WebSockets",
] as const;

export const professionalExperience = [
  {
    role: "Software Engineering Intern",
    company: "DFM Europe",
    period: "Jun 2026 — Present",
    location: "Ho Chi Minh City, Vietnam · On-site",
    color: "#7c3aed",
    description: "",
    highlights: [
      "Engineering a Python/FastAPI backend for the ATN Drawing system, automating the conversion of 3D engineering models into precise 2D technical drawings for construction industry applications.",
      "Integrating the OpenAI API into the FastAPI service to intelligently scale 2D output, maximizing sketch paper utilization and improving drawing precision.",
      "Developing an AI-powered isometric view generation feature using the OpenAI API, producing dimensionally accurate projections that optimize space usage on technical sketch sheets.",
    ],
    tags: ["Python", "FastAPI", "OpenAI API", "Technical Drawing Automation"],
  },
  {
    role: "Webmaster",
    company: "ACM at CSULB",
    period: "Jan 2026 — May 2026",
    location: "Long Beach, California, United States · Hybrid",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Led the redesign and redevelopment of the ACM at CSULB landing page using Next.js, improving usability, responsiveness, and visual consistency across the site.",
      "Refactored the existing Next.js codebase into a more modular and scalable architecture, reducing technical debt and improving long-term maintainability.",
      "Designed and implemented new dashboard features enabling users to upload and manage images, integrating Next.js frontend components with backend APIs for seamless data handling.",
    ],
    tags: ["Next.js", "React.js", "Tailwind CSS", "Backend APIs"],
  },
] as const;

export const leadershipExperience = [
  {
    role: "Project Manager",
    company: "AI Club at CSULB",
    period: "Jun 2026 — Present",
    location: "Long Beach, California, United States · Remote",
    color: "#f97316",
    description: "",
    highlights: [
      "Leading planning and coordination for a faculty-mentored biometric sensor research project investigating heat, humidity, and alcohol sensors on human subjects, defining project scope, milestones, and team responsibilities.",
      "Conducting literature research on wearable sensor technologies and physiological data collection, synthesizing findings to guide the team's technical direction and experimental design.",
    ],
    tags: ["Biometric Sensors", "Wearable Technology", "Research Coordination"],
  },
] as const;

export const volunteerExperience = [
  {
    role: "Computer Technical Support Volunteer",
    company: "De Anza College",
    period: "Dec 2023 — Jun 2024",
    location: "Cupertino, California, United States · On-site",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Installed and configured a wide range of hardware and software, ensuring optimal functionality and seamless integration for various computing environments. Provided support for system updates, security patches, and application installations to enhance performance.",
      "Diagnosed and resolved technical issues related to hardware failures, software malfunctions, and network connectivity problems. Delivered hands-on troubleshooting support to improve efficiency and minimize downtime for users.",
      "Refurbished and repaired broken and outdated laptops by replacing defective components, optimizing system performance, and reinstalling necessary software. Successfully restored numerous devices, which were then distributed to underprivileged students in need of reliable technology for their education.",
    ],
    tags: ["Linux", "Hardware Troubleshooting", "System Setup"],
  },
] as const;

export const socials = [
  {
    icon: "github",
    label: "GitHub",
    handle: "@Ben2104",
    href: "https://github.com/Ben2104",
    color: "#f8fafc",
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    handle: "Hoang Khoi Do",
    href: "https://www.linkedin.com/in/hoang-khoi-do/",
    color: "#0ea5e9",
  },
  {
    icon: "mail",
    label: "Email",
    handle: "dohoangkhoi341@gmail.com",
    href: "mailto:dohoangkhoi341@gmail.com",
    color: "#00d4ff",
  },
] as const;
