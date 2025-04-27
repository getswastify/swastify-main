"use client";

import CTASection from "@/components/Home/CTASection";
import Footer from "@/components/Home/Footer";
import HeroSection from "@/components/Home/HeroSection";
import MobileFrame from "@/components/Home/MobileFrame";
import { Spotlight } from "@/components/ui/spotlight-new";

const Home = () => {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black/[0.96] bg-grid-white/[0.02] antialiased">
      {/* Background Animation Layer */}
      <Spotlight />

      {/* Foreground Content */}
      <section className="relative z-10 w-full lg:w-[90%] px-4">
        <HeroSection />
      </section>

      <MobileFrame isPhone={true}/>

      <CTASection />
      <Footer />
    </main>
  );
};

export default Home;
