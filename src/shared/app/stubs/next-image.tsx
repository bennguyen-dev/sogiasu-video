import type React from "react";
import { Img, staticFile } from "remotion";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
};

// the app serves /public at the root, Remotion behind staticFile(); Img holds the frame until it loads
export default function Image({
  src,
  fill,
  priority,
  unoptimized,
  style,
  ...rest
}: Props) {
  return (
    <Img
      {...rest}
      src={src.startsWith("/") ? staticFile(src.slice(1)) : src}
      style={
        fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              ...style,
            }
          : style
      }
    />
  );
}
