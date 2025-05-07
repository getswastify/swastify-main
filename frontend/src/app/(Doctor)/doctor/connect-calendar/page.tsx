'use client';
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function ConnectCalendar() {
  const handleConnect = async () => {
    try {
      const res = await axios.get("http://localhost:3001/doctor/calendar-connect", {
        withCredentials: true,
      });
      const { url } = res.data;
      window.location.href = url;
    } catch (err) {
      console.error("❌ Failed to get Google Auth URL", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-2xl font-bold">Connect Your Calendar</h2>
      <Button onClick={handleConnect}>Connect with Google</Button>
    </div>
  );
}
