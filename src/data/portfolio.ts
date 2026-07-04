
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
    bullets: [
      "Built real-time multi-party chat with Next.js and Firebase, synchronizing client, AI agent, and counselor state.",
      "Built a FastAPI transcription service processing recorded call audio via AssemblyAI (STT).",
      "Generated structured transcripts for dashboard visualization and GPT-4o context integration.",
    ],
    tags: [
      "Next.js",
      "Tailwind CSS",
      "FastAPI",
      "Python",
      "Firebase",
      "Twilio",
      "Docker",
      "AssemblyAI",
      "OpenAI API",
    ],
    color: "#7c3aed",
    image: "/projects/crisislineai.png",
    liveHref: "",
    devpostHref: "https://devpost.com/software/crisisline-ai",
    sourceHref: "https://github.com/Ben2104/CrisisLineAI",
    award: "",
    stars: "",
  },
  {
    title: "Shape-Sign",
    subtitle: "",
    desc: "Shape-Sign is an interactive application that utilizes hand gesture recognition models to help users learn and engage with sign language.",
    bullets: [
      "Built an interactive frontend for sign-language learning activities using Next.js and Tailwind CSS.",
      "Integrated hand-gesture recognition ML models for real-time shape and sign matching.",
      "Achieved 98% detection accuracy for alphabet signs and 80% for phrase signs.",
    ],
    tags: ["Next.js", "React.js", "Tailwind CSS", "TensorFlow", "Python"],
    color: "#00d4ff",
    image: "/projects/shape&sign.png",
    liveHref: "https://shape-sign.vercel.app/",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/Shape-Sign",
    award: "Best Overall Award — BeachHacks 8.0",
    stars: "",
  },
  {
    title: "911 OPERATOR ASSISTANT",
    subtitle: "",
    desc: "A web application designed to assist 911 operators by providing real-time information and resources during emergency calls.",
    bullets: [
      "Collaborated in a team of three to design, build, and deploy a 911 operator co-pilot dashboard.",
      "Connected a Next.js 15 (App Router) frontend to a FastAPI backend for real-time incident data.",
      "Built an interactive incident map with the Google Maps JavaScript API; transcribed calls with Faster-Whisper and classified incidents with Google Gemini (Vertex AI).",
    ],
    tags: [
      "Next.js",
      "React.js",
      "Tailwind CSS",
      "FastAPI",
      "Python",
      "Google Maps API",
      "Google Gemini",
      "Twilio",
    ],
    color: "#7c3aed",
    image: "/projects/911_operator.png",
    liveHref: "",
    devpostHref: "https://devpost.com/software/911-operator-assistant",
    sourceHref: "https://github.com/Ben2104/911-Operator-Assistant",
    award: "Best Overall Award — Marina Hacks 5.0 (out of 40 projects)",
    stars: "",
  },
  {
    title: "QuizzRiff",
    subtitle: "",
    desc: "QuizRiff helps educators save time by automating personalized quiz creation and adding a competitive scoring system to keep students engaged in learning.",
    bullets: [
      "Automated personalized quiz generation to save educators time building assessments.",
      "Built a Flask application with SQLite storage for quizzes and student results.",
      "Added a competitive scoring system to keep students engaged.",
    ],
    tags: ["Python", "HTML", "CSS", "SQLite3", "Flask", "WolframAlpha API"],
    color: "#f97316",
    image: "/projects/quizzriff.png",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/QuizzRiff",
    award: "",
    stars: "",
  },
  {
    title: "The Bookstore",
    subtitle: "",
    desc: "The Bookstore project is a MERN stack web app with full CRUD functionality for managing books, authors, and collections efficiently.",
    bullets: [
      "Built full CRUD workflows for managing books, authors, and collections.",
      "Implemented a MERN stack architecture with MongoDB, Express, React, and Node.js.",
    ],
    tags: ["MongoDB", "Express.js", "React.js", "Node.js", "Tailwind CSS"],
    color: "#00d4ff",
    image: "/projects/Bookstore.png",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/BookStore",
    award: "",
    stars: "",
  },
  {
    title: "LLM Chatbot",
    subtitle: "",
    desc: "LLM Chatbot is an AI-powered chatbot that uses large language models to engage in natural language conversations with users.",
    bullets: [
      "Built a React frontend and Node/Express backend for natural-language chat.",
      "Integrated the OpenAI API to power conversational responses.",
    ],
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
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/Chat-Bot",
    award: "",
    stars: "",
  },
  {
    title: "Pickleball-Booking-Extension",
    subtitle: "",
    desc: "A Chrome Extension that automates court booking at iPickle Cerritos by instantly reserving available courts exactly 7 days in advance at 7:00 AM, streamlining a highly competitive process.",
    bullets: [
      "Automated court booking at iPickle Cerritos via a Chrome extension.",
      "Reserved available courts exactly 7 days in advance at 7:00 AM.",
    ],
    tags: ["JavaScript", "HTML", "CSS"],
    color: "#f97316",
    image: "/projects/pickleball.jpg",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/Pickleball-Booking-Extension",
    award: "",
    stars: "",
  },
  {
    title: "Pickleball Booking Automation (Playwright & GitHub Actions)",
    subtitle: "",
    desc: "Automates court booking at iPickle Cerritos using Playwright for browser automation, scheduled via Cron-Jobs.org and executed as a GitHub Action.",
    bullets: [
      "Automated browser interactions using Playwright for court reservations.",
      "Scheduled recurring runs with Cron-Jobs.org, executed via GitHub Actions.",
    ],
    tags: ["JavaScript", "Playwright", "GitHub Actions", "Cron-Jobs.org"],
    color: "#00d4ff",
    image: "/projects/pickleball_bot.png",
    liveHref: "",
    devpostHref: "",
    sourceHref: "https://github.com/Ben2104/pickleball-bot",
    award: "",
    stars: "",
  },
] as const;

export const skillCategories = [
  {
    label: "Frontend",
    color: "#00d4ff",
    skills: [
      { name: "React.js", level: 98, icon: "/assets/reactjs.png" },
      { name: "Next.js", level: 92, icon: "/assets/nextjs.png" },
      { name: "TypeScript", level: 95, icon: "/assets/typescript.png" },
      { name: "JavaScript", level: 96, icon: "" },
      { name: "HTML", level: 96, icon: "" },
      { name: "CSS", level: 94, icon: "" },
      { name: "Tailwind CSS", level: 96, icon: "/assets/tailwindcss.png" },
    ],
  },
  {
    label: "Backend",
    color: "#7c3aed",
    skills: [
      { name: "Node.js", level: 75, icon: "/assets/nodejs.png" },
      { name: "Express.js", level: 78, icon: "" },
      { name: "FastAPI", level: 84, icon: "/assets/fastapi.png" },
      { name: "REST APIs", level: 88, icon: "/assets/restapi.png" },
      { name: "GraphQL", level: 65, icon: "" },
      { name: "Webhooks", level: 72, icon: "" },
      { name: "WebSocket", level: 74, icon: "" },
    ],
  },
  {
    label: "AI / Automation",
    color: "#f97316",
    skills: [
      { name: "OpenAI API", level: 88, icon: "" },
      { name: "AssemblyAI", level: 70, icon: "" },
      { name: "TensorFlow", level: 68, icon: "" },
      { name: "Playwright", level: 80, icon: "" },
      { name: "GitHub Actions", level: 92, icon: "" },
    ],
  },
  {
    label: "Databases",
    color: "#00d4ff",
    skills: [
      { name: "MongoDB", level: 70, icon: "/assets/mongodb.png" },
      { name: "Firebase", level: 74, icon: "" },
      { name: "SQLite", level: 76, icon: "" },
    ],
  },
  {
    label: "DevOps & Tools",
    color: "#7c3aed",
    skills: [
      { name: "Docker", level: 75, icon: "/assets/docker.png" },
      { name: "Git", level: 90, icon: "" },
      { name: "GitHub", level: 90, icon: "/assets/github.png" },
      { name: "GitHub Actions", level: 92, icon: "/assets/githubaction.png" },
      { name: "Linux", level: 82, icon: "" },
      { name: "Bash", level: 78, icon: "" },
      { name: "CI/CD", level: 80, icon: "" },
    ],
  },
  {
    label: "Languages",
    color: "#f97316",
    skills: [
      { name: "Python", level: 80, icon: "/assets/python.png" },
      { name: "JavaScript", level: 96, icon: "" },
      { name: "TypeScript", level: 95, icon: "" },
      { name: "Java", level: 70, icon: "" },
      { name: "C/C++", level: 75, icon: "" },
      { name: "SQL", level: 78, icon: "" },
      { name: "C#", level: 65, icon: "" },
    ],
  },
  {
    label: "Teaching & Collaboration",
    color: "#00d4ff",
    skills: [
      { name: "Code Review", level: 85, icon: "" },
      { name: "Grading", level: 90, icon: "" },
      { name: "Tutoring", level: 88, icon: "" },
      { name: "Project Planning", level: 84, icon: "" },
      { name: "Technical Communication", level: 86, icon: "" },
      { name: "Literature Research", level: 80, icon: "" },
    ],
  },
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

export const teachingExperience = [
  {
    role: "Instructional Student Assistant",
    company: "California State University, Long Beach",
    period: "Aug 2025 — Present",
    location: "Long Beach, California, United States · Hybrid",
    color: "#7c3aed",
    description: "",
    highlights: [
      "Grading Python assignments, labs, and exams on computer arithmetic and matrix computations, providing feedback on correctness, efficiency, and code quality while maintaining consistent rubrics.",
      "Debugging student code and coaching systematic problem decomposition, edge-case handling, and test-case design to improve assignment outcomes and confidence.",
    ],
    tags: ["Python", "Computer Arithmetic", "Matrix Computations", "Grading Rubrics"],
  },
  {
    role: "Teaching Assistant",
    company: "De Anza College",
    period: "Sep 2023 — Jun 2024",
    location: "Cupertino, California, United States",
    color: "#00d4ff",
    description: "",
    highlights: [
      "Assisted professors in planning and delivering instructional content for Beginning Programming Methodologies in C++, helping students grasp fundamental concepts.",
      "Conducted review sessions, provided one-on-one tutoring, and facilitated group discussions to enhance student understanding.",
      "Evaluated labs, assignments, quizzes, and exams, providing constructive feedback to students and instructor to support academic growth.",
    ],
    tags: ["C++", "Linux", "Debugging"],
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
