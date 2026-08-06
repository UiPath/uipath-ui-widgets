import type { SVGProps } from "react";

export const ZoomInIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21M8 11h6M11 8v6" />
  </svg>
);
