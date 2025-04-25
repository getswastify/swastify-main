import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

// Component that uses authentication state
function HomeContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16 md:gap-8 md:py-24">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary">Swastify</span>
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Where Healthcare meets Innovation. Connect with doctors, manage
            appointments, and access your health records.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function HomeLoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16 md:gap-8 md:py-24">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary">Swastify</span>
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Where Healthcare meets Innovation. Connect with doctors, manage
            appointments, and access your health records.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" disabled>
            Loading...
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}
