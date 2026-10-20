import { Img, staticFile } from "remotion";
import { cn } from "@/shared/lib/utils";

// same markup as the app's BrandIcon; the app serves /public at the root, Remotion behind staticFile()
export default function BrandIcon({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <Img src={staticFile(src.replace(/^\//, ""))} alt={alt} className={cn("h-5 w-5 shrink-0 object-contain", className)} />;
}
