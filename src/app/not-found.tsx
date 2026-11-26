import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nf">
      <p className="lbl">404</p>
      <h1 className="giant">Page not found</h1>
      <div>
        <Link className="pill pill--w" href="/">
          Home
        </Link>
        <Link className="pill" href="/projects">
          Projects
        </Link>
      </div>
    </main>
  );
}
