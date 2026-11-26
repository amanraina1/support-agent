import { AIChatWidget } from "../landing/AIChatWidget";
import { CTASection } from "../landing/CTASection";
import { Footer } from "../landing/Footer";
import { HeroSection } from "../landing/HeroSection";
import { InfoSection } from "../landing/InfoSection";
import { ProductsSection } from "../landing/ProductsSection";
import { SpecsSection } from "../landing/SpecsSection";
import { AppShell } from "../layout/AppShell";
import { MarqueeTicker } from "../ui/MarqueeTicker";

const MARQUEE_ITEMS = [
  "ORDER TRACKING",
  "PRODUCT CATALOG",
  "POLICIES",
  "HYDRATION ADVICE",
];

export default function Home() {
  return (
    <AppShell>
      <main className="lg:pl-20 relative bg-grid-pattern min-h-screen flex flex-col">
        <div className="fixed top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="fixed bottom-20 left-40 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none z-0" />
        <HeroSection />
        <MarqueeTicker items={MARQUEE_ITEMS} />
        <AIChatWidget />
        <InfoSection />
        <SpecsSection/>
        <ProductsSection />
        <CTASection/>
        <Footer />
      </main>
    </AppShell>
  );
}
