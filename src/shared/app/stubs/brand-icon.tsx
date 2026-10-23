import { useState } from "react";
import { Img, staticFile } from "remotion";
import { cn } from "@/shared/lib/utils";

// the app's BrandIcon, hiding itself when the asset is missing as the app's does; /public sits behind staticFile()
export default function BrandIcon({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  return (
    <Img
      src={staticFile(src.replace(/^\//, ""))}
      alt={alt}
      className={cn("h-5 w-5 shrink-0 object-contain", className)}
      maxRetries={0}
      onError={() => setMissing(true)}
    />
  );
}
