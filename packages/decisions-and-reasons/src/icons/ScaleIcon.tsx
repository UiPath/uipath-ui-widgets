import type { SVGProps } from "react";

export const ScaleIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M12 3v18M7 3h10M5 8l-3 7a3.5 3.5 0 0 0 7 0l-3-7zM19 8l-3 7a3.5 3.5 0 0 0 7 0l-3-7z" />
  </svg>
);
