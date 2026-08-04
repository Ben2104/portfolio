export type BootLineTone =
  | "kernel"
  | "service"
  | "portfolio"
  | "warning"
  | "login"
  | "prompt";

export type BootLine = {
  id: string;
  at: number;
  message: string;
  timestamp?: string;
  status?: "ok" | "warn";
  tone: BootLineTone;
};

export const LINUX_BOOT_SEQUENCE: readonly BootLine[] = [
  {
    id: "kernel",
    at: 0,
    timestamp: "0.000000",
    message: "Linux version 6.8.12-portfolio (khoi@portfolio)",
    tone: "kernel",
  },
  {
    id: "command-line",
    at: 170,
    timestamp: "0.012481",
    message: "Command line: quiet splash portfolio.mode=interactive",
    tone: "kernel",
  },
  {
    id: "memory",
    at: 340,
    timestamp: "0.083197",
    message: "Memory: creative workspace available",
    tone: "kernel",
  },
  {
    id: "filesystems",
    at: 510,
    message: "Mounted virtual filesystems.",
    status: "ok",
    tone: "service",
  },
  {
    id: "device-manager",
    at: 690,
    message: "Started portfolio device manager.",
    status: "ok",
    tone: "service",
  },
  {
    id: "network-start",
    at: 880,
    message: "Starting network services...",
    tone: "service",
  },
  {
    id: "network-ready",
    at: 1080,
    message: "Reached target Network Online.",
    status: "ok",
    tone: "service",
  },
  {
    id: "portfolio-modules",
    at: 1280,
    timestamp: "1.284203",
    message: "Initializing portfolio modules",
    tone: "portfolio",
  },
  {
    id: "experience",
    at: 1480,
    message: "Loaded experience.service",
    status: "ok",
    tone: "portfolio",
  },
  {
    id: "projects",
    at: 1680,
    message: "Loaded projects.mount",
    status: "ok",
    tone: "portfolio",
  },
  {
    id: "skills",
    at: 1880,
    message: "Loaded skills.index",
    status: "ok",
    tone: "portfolio",
  },
  {
    id: "contact",
    at: 2080,
    message: "Listening on contact.socket",
    status: "ok",
    tone: "portfolio",
  },
  {
    id: "graphics",
    at: 2320,
    message: "Starting graphical portfolio interface...",
    tone: "service",
  },
  {
    id: "graphics-ready",
    at: 2580,
    message: "Started graphical portfolio interface.",
    status: "ok",
    tone: "service",
  },
  {
    id: "target",
    at: 2820,
    message: "Reached target Portfolio Session.",
    status: "ok",
    tone: "service",
  },
  {
    id: "login",
    at: 3160,
    message: "portfolio login: khoi",
    tone: "login",
  },
  {
    id: "login-success",
    at: 3450,
    message: "Login successful. Welcome back, Khoi.",
    tone: "login",
  },
  {
    id: "prompt",
    at: 3820,
    message: "khoi@portfolio:~$ startx",
    tone: "prompt",
  },
] as const;

export const BOOT_SEQUENCE_DURATION = 5200;
export const BOOT_EXIT_DELAY = 700;
