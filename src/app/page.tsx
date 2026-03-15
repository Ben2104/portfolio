import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { Analytics } from "@vercel/analytics/next";

export default function Page() {
  return (
    <>
      <PortfolioPage />
      <Analytics />
    </>
  );
}
