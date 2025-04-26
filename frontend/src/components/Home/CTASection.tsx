import { ArrowRight } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CTASection = () => {
  return (
    <>
    <section className="container relative z-10 mx-auto px-4 py-20">
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-500 px-6 py-16 shadow-xl sm:px-12 sm:py-24">
  <div className="absolute inset-0 opacity-20 mix-blend-overlay">
    <svg
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 800 800"
    >
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
  <div className="relative mx-auto max-w-2xl text-center">
    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
      Ready to transform your healthcare experience?
    </h2>
    <p className="mt-6 text-lg leading-8 text-emerald-100">
      Join thousands of users who have already improved their healthcare journey with Swastify.
    </p>
    <div className="mt-10 flex items-center justify-center gap-x-6">
      <Link href="/register/doctor" passHref>
        <Button
          asChild
          size="lg"
          className="bg-white text-emerald-700 hover:bg-emerald-50"
        >
          <span>For Doctors</span>
        </Button>
      </Link>

      <Link href="/register/hospital" passHref>
        <Button
          asChild
          variant="link"
          className="text-white hover:text-emerald-200"
        >
          <span className="flex items-center">
            For Hospitals <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </Button>
      </Link>
    </div>
  </div>
</div>
</section></>
  )
}

export default CTASection