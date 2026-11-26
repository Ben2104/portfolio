// Content for the portfolio. Sources: the project READMEs and commits, and my own résumé. Nothing invented.

export const GITHUB_URL = "https://github.com/Ben2104";
export const LINKEDIN_URL = "https://www.linkedin.com/in/hoang-khoi-do";

export type Project = {
  slug: string;
  title: string;
  year: number;
  cat: "ai" | "web" | "auto";
  team: number;
  img: string;
  short: string;
  line: string;
  event: string;
  award?: string;
  problem: string;
  solution: string;
  role: string;
  roleTitle: string;
  flow: string[];
  features: [string, string][];
  stack: string[];
  links: { live?: string; devpost?: string; source?: string };
};

export type Role = {
  n: string;
  role: string;
  org: string;
  when: string;
  where: string;
  text: string;
  tags: string[];
};

/** Current roles first, then past roles from newest to oldest. */
export const experience: Role[] = [
  {
    "n": "07",
    "role": "Full Stack Developer",
    "org": "Netsservice",
    "when": "Aug 2026 – Present",
    "where": "Denmark · Remote",
    "text": "Designed and built an iOS ride-hailing app end to end in Swift and SwiftUI on a Fastify API, with WebSocket sync for ride requests and trips.",
    "tags": [
      "Swift",
      "SwiftUI",
      "Fastify",
      "WebSockets"
    ]
  },
  {
    "n": "06",
    "role": "Project Manager",
    "org": "AI Club at CSULB",
    "when": "Jun 2026 – Present",
    "where": "Long Beach, CA · Hybrid",
    "text": "Lead a faculty-mentored biometric sensor research project with a team of four: scope, milestones, 10+ papers reviewed, CI/CD to Render.",
    "tags": [
      "Research",
      "GitHub Actions",
      "Render"
    ]
  },
  {
    "n": "03",
    "role": "Instructional Student Assistant",
    "org": "CSULB",
    "when": "Aug 2025 – Present",
    "where": "Long Beach, CA",
    "text": "Support 150+ students a term in computer science courses, in lab sessions and office hours.",
    "tags": [
      "Teaching",
      "Code review",
      "Office hours"
    ]
  },
  {
    "n": "05",
    "role": "Software Engineering Intern",
    "org": "DFM Europe",
    "when": "May – Aug 2026",
    "where": "Ho Chi Minh City · On-site",
    "text": "Built a LangGraph multi-agent pipeline: 90% less manual work across 500 test cases, 85% less processing time, accuracy up from 60% to 87%.",
    "tags": [
      "LangGraph",
      "Python",
      "Multi-agent"
    ]
  },
  {
    "n": "04",
    "role": "Webmaster",
    "org": "ACM at CSULB",
    "when": "Jan – May 2026",
    "where": "Long Beach, CA",
    "text": "Rebuilt the chapter site and took its Lighthouse score from 58 to 94, serving 1,000+ visitors and 500 members.",
    "tags": [
      "Next.js",
      "Performance",
      "Lighthouse 58 → 94"
    ]
  },
  {
    "n": "02",
    "role": "Tech Support Volunteer",
    "org": "De Anza College",
    "when": "Dec 2023 – Jun 2024",
    "where": "Cupertino, CA",
    "text": "Set up and repaired laptops for students who needed one, from hardware swaps to a clean Linux install.",
    "tags": [
      "Linux",
      "Hardware",
      "Troubleshooting",
      "System setup"
    ]
  },
  {
    "n": "01",
    "role": "Teaching Assistant",
    "org": "De Anza College",
    "when": "Sep 2023 – Jun 2024",
    "where": "Cupertino, CA",
    "text": "Helped students through C++ labs: reading compiler errors, stepping through a debugger and getting comfortable on Linux.",
    "tags": [
      "C++",
      "Debugging",
      "Linux"
    ]
  }
];

export const education = [
  {
    year: "(2026)",
    school: "California State University, Long Beach",
    detail: "B.S. in Computer Science, with a focus on software development, computational problem-solving, and emerging technologies. Expected graduation: December 2026.",
  },
  {
    year: "(2022–2024)",
    school: "De Anza College",
    detail: "Studied Computer Science, building a foundation in programming, computer systems, and problem-solving. Also gained practical experience through technical support and teaching assistance.",
  },
];

export const facts = [
  ["Based in", "Long Beach, California"],
  ["Studying", "B.S. Computer Science, CSULB"],
  ["Working", "Full Stack, Netsservice"],
  ["Open to", "Software roles from Dec 2026"],
] as const;

/** Intrinsic height of each /deck/projects/<img>.webp (all 1400px wide), so next/image reserves the right box. */
export const imgH: Record<string, number> = {
  '911_operator': 1400, Bookstore: 875, chatbot: 1400, crisislineai: 765, lobe: 1149,
  'material-enhancement-assistant': 875, pickleball: 934, pickleball_bot: 1400, quizzriff: 787, 'shape-sign': 934,
};

/** Card badge: the award or hackathon name; null for plain "... project" events. */
export const badge = (p: Project) => (p.award ? p.event : /project$/i.test(p.event) ? null : p.event);

export const projects: Project[] = [
  { slug: 'lobe', title: 'Lobe', year: 2026, cat: 'ai', team: 3, img: 'lobe', roleTitle: 'Front-end developer',
    short: 'Shared 3D brain MRI review',
    line: 'A web app where people review brain MRI scans together and practice reading them with quick games.',
    event: 'Built at CalHacks 13.0',
    problem: 'Reviewing MRI slices and 3D views with other people usually means one shared screen and a lot of pointing at the wrong spot.',
    solution: 'A MONAI SegResNet model segments the tumour from four MRI sequences. The case then opens as linked 2D slices, a 3D brain and a live review room.',
    role: 'I built the Miro-style 3D whiteboard, fixed dragging, anchoring and undo on it, and polished the motion and the phone layout.',
    flow: ['A NIfTI MRI scan is uploaded', 'SegResNet segments the tumour', 'Slices, 3D brain and review room stay linked', 'A .docx report goes out by email'],
    features: [['Find the tumour', 'Automatic segmentation from four MRI sequences.'], ['Study in 2D and 3D', 'Slices and the 3D brain move together.'], ['Review live', 'Voice, chat, notes and a shared 3D whiteboard in one room.'], ['Ask the assistant', 'A Claude-powered helper drives the viewer for you.'], ['Practice reading', 'Two games: Find the slice and Beat the AI.']],
    stack: ['TypeScript', 'React Three Fiber', 'NiiVue', 'Convex', 'LiveKit', 'MONAI', 'Claude API', 'Docker'],
    links: { devpost: 'https://devpost.com/software/lobe', source: 'https://github.com/DuongAnh1201/Lobe' } },
  { slug: 'material-enhancement-assistant', title: 'Material Enhancement Assistant', year: 2026, cat: 'ai', team: 4, img: 'material-enhancement-assistant', roleTitle: 'Full-stack developer',
    short: 'Course material workspace for professors',
    line: 'Helps professors make their course material clearer, while they approve every change.',
    event: 'Team project',
    problem: 'Professors have slides and readings in many formats and little time to check which parts confuse students.',
    solution: 'Upload the files once; the app reads them, answers questions about them, drafts quizzes and outlines, and nothing changes without the professor saying yes.',
    role: 'I built Google and GitHub sign-in, added retries to the Gemini quiz calls, and moved chat to DeepSeek and outlines to Cerebras.',
    flow: ['A PDF, DOCX or PPTX upload', 'Stored in S3 and indexed', 'Chat, quizzes and outlines', 'The professor approves each change'],
    features: [['Upload any format', 'PDF, DOCX and PPTX up to 50 MB.'], ['Chat with the course', 'Answers come from the uploaded material.'], ['Draft quizzes', 'Gemini writes them, with retries when it stalls.'], ['Outline slides', 'A beta outline writer on Cerebras.'], ['Sign in fast', 'Google or GitHub accounts.']],
    stack: ['Python', 'FastAPI', 'TypeScript', 'Next.js', 'Gemini', 'DeepSeek', 'Cerebras', 'Docker'],
    links: { source: 'https://github.com/spiderpilo/Material-Enhancement-Assistant' } },
  { slug: 'crisislineai', title: 'CrisisLineAI', year: 2026, cat: 'ai', team: 3, img: 'crisislineai', roleTitle: 'Full-stack developer',
    short: 'Crisis chat and phone line',
    line: 'A crisis support chat and phone line where AI keeps people company until a counselor takes over.',
    event: 'Hackathon project',
    problem: 'When every counselor is busy, people reaching a crisis line wait alone, on the phone or in a chat window.',
    solution: 'An AI agent answers right away by chat or voice, scores the risk level, and hands the conversation to a counselor with a summary.',
    role: 'I built the chat with its model calls, the counselor choices, the transcript view with risk badges and a summary button, and the Docker setup.',
    flow: ['A call or a chat comes in', 'The AI answers and keeps listening', 'Risk level and summary update', 'A counselor takes over'],
    features: [['Answer at once', 'Realtime chat on Firestore with streamed replies.'], ['Take over', 'A counselor dashboard with one-click takeover.'], ['See the risk', 'Each conversation carries a risk level and a summary.'], ['Talk by phone', 'Twilio voice with AssemblyAI and ElevenLabs.'], ['Keep the record', 'Full transcripts after every call.']],
    stack: ['Python', 'FastAPI', 'LangChain', 'OpenAI API', 'Firebase', 'Twilio', 'AssemblyAI', 'Docker'],
    links: { devpost: 'https://devpost.com/software/crisisline-ai', source: 'https://github.com/Ben2104/CrisisLineAI' } },
  { slug: 'shape-sign', title: 'Shape-Sign', year: 2025, cat: 'ai', team: 4, img: 'shape-sign', roleTitle: 'Front-end developer & UI designer',
    short: 'Sign language through the webcam',
    line: 'Learn sign language in front of your webcam: it recognises your hand shapes as you sign.',
    event: 'Best Overall, BeachHacks 8.0', award: 'Best Overall',
    problem: 'Sign language is hard to practise alone, because nobody tells you whether your hand is right.',
    solution: 'The webcam tracks the hand, a model reads the sign, and short lessons on the alphabet, music and shapes give feedback in the moment.',
    role: 'I built the front end and designed the interface.',
    flow: ['The webcam sees your hand', 'MediaPipe finds the hand points', 'An LSTM reads 60 frames', 'The lesson answers right or wrong'],
    features: [['Read hand shapes', 'MediaPipe and TensorFlow, live in the browser.'], ['Follow motion', 'An LSTM over 60 frames plus a dense network.'], ['Learn the alphabet', 'Letter by letter with instant checks.'], ['Play to learn', 'Music and shape-matching lessons.']],
    stack: ['JavaScript', 'Next.js', 'React', 'Tailwind CSS', 'TensorFlow', 'MediaPipe', 'Python', 'Vercel'],
    links: { live: 'https://shape-sign.vercel.app', devpost: 'https://devpost.com/software/shape-sign', source: 'https://github.com/Ben2104/Shape-Sign' } },
  { slug: '911-operator-assistant', title: '911 Operator Assistant', year: 2025, cat: 'ai', team: 3, img: '911_operator', roleTitle: 'Front-end developer',
    short: 'Call audio to incidents on a map',
    line: 'Helps 911 operators turn call audio into incident details and a pin on the map.',
    event: 'Best Overall, Marina Hacks 5.0', award: 'Best Overall',
    problem: 'During a call an operator listens, types and searches for the address all at once.',
    solution: 'The call is transcribed, Gemini pulls out the incident and the place, and the dashboard drops it on a map with the actions to take.',
    role: 'I built the dashboard: the home page, the nav, incident cards that open on the map, adding and removing incidents, sending units and loading transcripts.',
    flow: ['A call recording comes in', 'faster-whisper transcribes it', 'Gemini finds the incident and place', 'The dashboard pins it on a map'],
    features: [['Transcribe calls', 'faster-whisper on the call audio.'], ['Read the incident', 'Gemini parses what happened and where.'], ['Map it', 'Google geocoding and a marker per incident.'], ['Dispatch', 'Send units from the incident card.']],
    stack: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Python', 'FastAPI', 'Gemini', 'Google Maps', 'Twilio'],
    links: { devpost: 'https://devpost.com/software/911-operator-assistant', source: 'https://github.com/Ben2104/911-Operator-Assistant' } },
  { slug: 'llm-chatbot', title: 'LLM Chatbot', year: 2025, cat: 'ai', team: 1, img: 'chatbot', roleTitle: 'Solo developer',
    short: 'Chat, summarise links, read files',
    line: 'A chat app that talks with GPT, summarises a web page from its link and reads files you upload.',
    event: 'Solo project',
    problem: 'Asking a model about a page or a file meant copying text back and forth by hand.',
    solution: 'One chat window: paste a link to get a summary, or drop a file and ask about it.',
    role: 'I built it alone, front end and Express server.',
    flow: ['A message, link or file', 'Express sends it on', 'The OpenAI API answers', 'The reply shows in the chat'],
    features: [['Chat with GPT', 'A plain chat window.'], ['Summarise links', 'Paste a URL, get the gist.'], ['Upload files', 'Multer takes the file for the model.']],
    stack: ['React', 'Tailwind CSS', 'Vite', 'Node.js', 'Express', 'OpenAI API'],
    links: { source: 'https://github.com/Ben2104/Chat-Bot' } },
  { slug: 'quizzriff', title: 'QuizzRiff', year: 2023, cat: 'web', team: 4, img: 'quizzriff', roleTitle: 'Back-end developer',
    short: 'Personal quizzes with a scoreboard',
    line: 'Writes a quiz for each student and keeps a competitive score, so practice feels like a game.',
    event: 'Team project',
    problem: 'Teachers spend hours writing quizzes, and the same quiz rarely fits every student.',
    solution: 'QuizzRiff generates the questions per student with WolframAlpha and ranks scores so the class competes.',
    role: 'I wrote the first version of the Flask app and the README.',
    flow: ['A student opens a quiz', 'WolframAlpha builds the questions', 'Answers are scored', 'The scoreboard updates'],
    features: [['Generate quizzes', 'Questions written for each student.'], ['Compete', 'A shared scoreboard for the class.']],
    stack: ['Python', 'Flask', 'SQLite', 'HTML', 'CSS', 'WolframAlpha'],
    links: { source: 'https://github.com/Ben2104/QuizzRiff' } },
  { slug: 'the-bookstore', title: 'The Bookstore', year: 2024, cat: 'web', team: 1, img: 'Bookstore', roleTitle: 'Solo developer',
    short: 'Books and authors, full CRUD',
    line: 'A full-stack app for keeping a list of books and authors: add, edit, find and delete.',
    event: 'Solo project',
    problem: 'I wanted to learn the whole MERN stack by building one complete app end to end.',
    solution: 'A React front end on an Express API with MongoDB, covering every create, read, update and delete path.',
    role: 'I built it alone.',
    flow: ['A book or author is added', 'The Express API takes it', 'MongoDB stores it', 'React lists and edits it'],
    features: [['Manage books', 'Create, edit and delete.'], ['Manage authors', 'Linked to their books.']],
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    links: { source: 'https://github.com/Ben2104/BookStore' } },
  { slug: 'pickleball-booking-extension', title: 'Pickleball Booking Extension', year: 2025, cat: 'auto', team: 1, img: 'pickleball', roleTitle: 'Solo developer',
    short: 'Books a court at 7 AM sharp',
    line: 'A Chrome extension that books a court at iPickle Cerritos at 7 AM, the moment booking opens seven days ahead.',
    event: 'Solo project',
    problem: 'Courts open for booking seven days ahead at 7 AM and are gone within minutes.',
    solution: 'The extension waits for 7:00 and books the court for you, then tells you it worked.',
    role: 'I built it alone.',
    flow: ['You pick a court and a time', 'The extension waits for 7:00', 'It books the court', 'A notification confirms it'],
    features: [['Book on time', 'Fires at 7:00 sharp.'], ['Schedule it', 'One button to set it up.'], ['Get told', 'A notification when the booking lands.']],
    stack: ['JavaScript', 'Chrome', 'HTML', 'CSS'],
    links: { source: 'https://github.com/Ben2104/Pickleball-Booking-Extension' } },
  { slug: 'pickleball-bot', title: 'Pickleball Bot', year: 2025, cat: 'auto', team: 1, img: 'pickleball_bot', roleTitle: 'Solo developer',
    short: 'Court booking that runs itself',
    line: 'The next step after the extension: a bot that books courts on a schedule without a laptop open.',
    event: 'Solo project',
    problem: 'The extension needed a browser left open at 7 AM, every day.',
    solution: 'A scheduled job starts a Playwright browser on my own runner, books the best free court, records the attempt and adds it to the calendar.',
    role: 'I built it alone: the self-hosted runner, the court priority list, a daylight-saving fix and one job per player.',
    flow: ['cron-jobs.org fires at 7:00', 'GitHub Actions starts the job', 'Playwright books the best court', 'Google Calendar gets the event'],
    features: [['Run on a schedule', 'cron-jobs.org and GitHub Actions.'], ['Pick the best court', 'A priority order per player.'], ['Record the attempt', 'A video of each run.'], ['Sync the calendar', 'The booking lands in Google Calendar.']],
    stack: ['JavaScript', 'Playwright', 'GitHub Actions', 'Chrome'],
    links: { source: 'https://github.com/Ben2104/pickleball-bot' } },
];

export const cats: Record<string, string> = { ai: 'AI and ML', web: 'Web apps', auto: 'Automation' };

// tool name -> file in public/deck/icons; tools without one show as words
export const toolIcons: Record<string, string> = {
  'TypeScript': 'typescript-icon', 'JavaScript': 'javascript', 'Python': 'python', 'React': 'react',
  'React Three Fiber': 'threejs', 'Next.js': 'nextjs-icon', 'Node.js': 'nodejs-icon', 'FastAPI': 'fastapi-icon',
  'Tailwind CSS': 'tailwindcss-icon', 'TensorFlow': 'tensorflow', 'Docker': 'docker-icon', 'GitHub Actions': 'github-actions',
  'MongoDB': 'mongodb-icon', 'Firebase': 'firebase-icon', 'Playwright': 'playwright', 'OpenAI API': 'openai-icon',
  'Claude API': 'claude-icon', 'Gemini': 'google-gemini-icon', 'Twilio': 'twilio-icon', 'LangChain': 'langchain-icon',
  'Flask': 'flask', 'Express': 'express', 'SQLite': 'sqlite', 'HTML': 'html-5', 'Chrome': 'chrome', 'Vercel': 'vercel-icon',
};

/** Per-role detail from the Canva deck, keyed by Role.n. */
export const xpDetail: Record<string, { summary: string; points: string[]; tags: string[] }> = {
  "07": {
    summary: "Developing end-to-end software solutions, with a focus on iOS applications, backend systems, and real-time communication.",
    points: ["Developed an iOS ride-hailing application.", "Implemented real-time passenger and driver synchronization.", "Integrated backend services and WebSocket communication."],
    tags: ["Swift", "SwiftUI", "Fastify", "iOS", "WebSocket"],
  },
  "06": {
    summary: "Leading a faculty-mentored biometric sensor research project, coordinating a four-member team and translating research findings into technical direction and project deliverables.",
    points: ["Directed a 4-member research team, defining project scope, milestones, and individual responsibilities.", "Analyzed findings from 10+ research papers on wearable sensors and physiological data collection.", "Built GitHub Actions CI/CD pipelines to automate testing, containerization, and deployment to Render."],
    tags: ["Research Coordination", "Biometric Sensors", "GitHub Actions", "CI/CD", "Render"],
  },
  "05": {
    summary: "Developed AI-powered engineering solutions to automate 3D-to-2D technical drawing conversion, optimizing processing efficiency and improving drawing accuracy.",
    points: ["Built a LangGraph-based multi-agent pipeline that converted 3D engineering models into 2D technical drawings, reducing manual work by 90% across 500 test cases.", "Collaborated with mechanical and AI engineers to cut processing time by 85%, while improving drawing accuracy from 60% to 87% through a Python/FastAPI service integrated with OpenAI API."],
    tags: ["Multi-agent Systems", "LangGraph", "OpenAI API", "FastAPI", "Python"],
  },
  "04": {
    summary: "Rebuilt and enhanced the ACM at CSULB website, improving web performance and developing dashboard features to support its growing community.",
    points: ["Rebuilt the ACM website using Next.js, increasing Lighthouse performance from 58 to 94 for 1,000+ monthly visitors.", "Developed dashboard features for image upload and management, integrating Next.js with a MongoDB-backed API to support 500 active users."],
    tags: ["Next.js", "Tailwind CSS", "React.js", "MongoDB"],
  },
  "03": {
    summary: "Supported computer science instruction by grading Python assignments, labs, and exams, providing detailed feedback to help students strengthen their programming and computational skills.",
    points: ["Graded Python assignments, labs, and exams for 150+ students per term across computer arithmetic and matrix computation topics, applying consistent evaluation rubrics.", "Reviewed 150+ submissions per semester for correctness, efficiency, and code quality, helping raise average assignment scores by 90%."],
    tags: ["Python", "Matrix Computations", "Grading Rubrics", "Computer Arithmetic"],
  },
  "02": {
    summary: "Provided hands-on technical support by maintaining computer systems, troubleshooting hardware and software issues, and refurbishing devices for students in need.",
    points: ["Installed and configured hardware, software, system updates, and security patches across computing environments.", "Diagnosed and resolved hardware failures, software malfunctions, and network connectivity issues to minimize downtime.", "Refurbished outdated laptops by replacing defective components and reinstalling software, restoring devices for distribution to underprivileged students."],
    tags: ["Linux", "Troubleshooting", "Hardware", "System Setup"],
  },
  "01": {
    summary: "Supported introductory C++ programming instruction by assisting professors, guiding students through programming concepts, and providing hands-on academic support.",
    points: ["Assisted professors in planning and delivering lessons for Beginning Programming Methodologies in C++, helping students understand fundamental programming concepts.", "Conducted review sessions, provided one-on-one tutoring, and facilitated group discussions to strengthen student understanding.", "Evaluated labs, assignments, quizzes, and exams, providing constructive feedback to students and instructors to support academic growth."],
    tags: ["C++", "Linux", "Debugging"],
  },
};

export const skills = [
  { title: "Frontend development", text: "Building responsive and user-friendly web interfaces using React.js, Next.js, TypeScript, JavaScript, HTML, CSS, and Tailwind CSS. Focused on creating seamless digital experiences through clean, maintainable, and scalable frontend solutions." },
  { title: "Backend & AI automation", text: "Developing backend services and intelligent automation using Node.js, Express.js, Python, FastAPI, OpenAI API, and TensorFlow. Experienced with API integration, database management, real-time communication, and automated workflows." },
];

/** Real public repos from github.com/Ben2104. */
export const repos = [
  { name: "network-simulator", url: "https://github.com/Ben2104/network-simulator", text: "Educational network routing simulator: BFS over virtual routers.", stack: "React · Fastify · TypeScript" },
  { name: "jarvis-neuro", url: "https://github.com/Ben2104/jarvis-neuro", text: "Educational 3D brain-tumour viewer with a voice agent. Not for diagnosis.", stack: "TypeScript" },
  { name: "schemacheck", url: "https://github.com/Ben2104/schemacheck", text: "Tiny declarative JSON-style schema validator.", stack: "Python" },
];

export const contributions = [
  { title: "Student mentoring", text: "Teaching assistant, grader and tutor for introductory CS students." },
  { title: "Community Discord bot", text: "Server setup and bot for a Vietnamese LeetCode community.", url: "https://github.com/Ben2104/Ticungbimdsa-discord-bot" },
  { title: "ACM at CSULB website", text: "Rebuilt the chapter site: Lighthouse 58 to 94." },
];
