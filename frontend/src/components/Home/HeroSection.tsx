import { Button } from "@/components/ui/button";
import {  Shield, Activity, BarChart3 } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react"; // ✅ using motion/react lightweight
import { ShimmerButton } from "../magicui/shimmer-button";


export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center">
      <div className="container px-4 md:px-6 z-10 flex flex-col lg:flex-row items-center gap-12 py-16">
        <div className="flex-1 space-y-8">
          <div className="space-y-6">
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
            <ShimmerButton className="!text-white font-semibold px-10" shimmerColor="green" shimmerSize="0.2rem" >
              Start Free
            </ShimmerButton>

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

        <div className="relative w-full max-w-md mx-auto">
          {/* Main Portrait Hero Image */}
          <div className="relative w-full aspect-[2/3] overflow-visible">
            <Image
              src="/images/hero-img.png"
              alt="Swastify Healthcare Dashboard"
              width={720}
              height={1080}
              className="w-full h-auto object-contain rounded-2xl shadow-2xl"
            />

            {/* Floating Images with Titles */}
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 3,
                ease: "easeInOut",
              }}
              className="absolute -top-8 left-4 flex flex-col items-center">
              <Image
                src="/images/floating1.jpg"
                alt="Doctor Consultation"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold  text-neutral-300">
                Consultations
              </span>
            </motion.div>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4,
                ease: "easeInOut",
              }}
              className="absolute top-15 -right-4 flex flex-col items-center">
              <Image
                src="/images/floating2.jpg"
                alt="Hospital Management"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold text-neutral-300">Telemedicine</span>
            </motion.div>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 5,
                ease: "easeInOut",
              }}
              className="absolute bottom-20 -left-3 flex flex-col items-center">
              <Image
                src="/images/floating3.jpg"
                alt="Health Analytics"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold text-neutral-300">Appointment</span>
            </motion.div>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 6,
                ease: "easeInOut",
              }}
              className="absolute -bottom-0 right-6 flex flex-col items-center">
              <Image
                src="/images/floating4.jpg"
                alt="Patient Management"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold text-neutral-300">Medical Records</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
