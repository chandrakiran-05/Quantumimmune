"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-xs text-secondary font-data uppercase tracking-wider">Redirecting to live prediction...</p>
    </div>
  );
}
