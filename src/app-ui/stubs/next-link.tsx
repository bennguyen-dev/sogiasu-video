import type React from "react";

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string };
};

export default function Link({ href, ...rest }: Props) {
  return (
    <a
      href={typeof href === "string" ? href : (href.pathname ?? "#")}
      {...rest}
    />
  );
}
