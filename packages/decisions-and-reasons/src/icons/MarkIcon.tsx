import type { SVGProps } from "react";

export const MarkIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="m9 11-6 6v3h3l6-6M16 5l3 3M13.5 6.5 17 3l4 4-3.5 3.5z" />
  </svg>
);
