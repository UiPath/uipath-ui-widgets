import type { SVGProps } from "react";

export const ErrorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={28}
    height={28}
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
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.6v.1" />
  </svg>
);
