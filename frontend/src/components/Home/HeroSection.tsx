import { Shield, Activity, BarChart3 } from "lucide-react";
import { ShimmerButton } from "../magicui/shimmer-button";
import Link from "next/link";
import MobileFrame from "./MobileFrame";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center">
      <div className="container px-4 md:px-6 z-10 flex flex-col lg:flex-row items-center gap-12 py-16 ">
        <div className="flex-1 space-y-8 ">
          <div className="space-y-6 ">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Revolutionizing Healthcare Technology
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="text-white">Transform healthcare with</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Swastify.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-300 max-w-xl">
              Empower your healthcare practice with AI-driven insights, seamless
              patient management, and advanced analytics that drive better
              outcomes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" passHref>
              <ShimmerButton
                className="!text-white font-semibold px-10"
                shimmerColor="green"
                shimmerSize="0.2rem">
                <span>Start Free</span>
              </ShimmerButton>
            </Link>
          </div>

          <div className="pt-6 border-t border-neutral-800 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-neutral-300 text-sm">Verified Doctors</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-neutral-300 text-sm">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-neutral-300 text-sm">
                Advanced Analytics
              </span>
            </div>
          </div>
        </div>

        <MobileFrame isPhone={false} />
      </div>
    </section>
  );
}
