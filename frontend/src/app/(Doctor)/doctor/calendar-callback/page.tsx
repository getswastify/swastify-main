
'use client';

import CalendarCallbackContent from "@/components/doctor/CalendarCallbackContent";
import { Suspense } from "react";


export default function CalendarCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><p>Loading...</p></div>}>
      <CalendarCallbackContent/>
    </Suspense>
  );
}
