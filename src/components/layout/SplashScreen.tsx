
"use client";

import Image from 'next/image';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ease-in-out">
      <div className="relative animate-logo-pulse">
        <Image
          src="/logo.png"
          alt="CyberMozhi Loading..."
          width={200} // Adjusted size for splash screen
          height={53}  // Adjusted size for splash screen (maintaining aspect ratio of 120/32 -> 200/53.33)
          priority // Ensures logo loads quickly for splash
        />
      </div>
      <p className="mt-4 text-sm text-primary/80">Loading CyberMozhi...</p>
    </div>
  );
}
