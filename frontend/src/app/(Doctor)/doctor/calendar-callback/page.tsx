'use client';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function CalendarCallbackPage() {
  const [status, setStatus] = useState("Connecting...");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setStatus("❌ No authorization code found in URL.");
      return;
    }

    const sendCode = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/doctor/calendar-callback?code=${code}`,
          { withCredentials: true }
        );
        setStatus("✅ Google Calendar connected!");
        setTimeout(() => router.push("/doctor/dashboard"), 2000);
      } catch (err) {
        console.error("❌ Callback failed", err);
        setStatus("❌ Failed to connect calendar. Are you logged in as a doctor?");
      }
    };

    sendCode();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold">{status}</p>
    </div>
  );
}
