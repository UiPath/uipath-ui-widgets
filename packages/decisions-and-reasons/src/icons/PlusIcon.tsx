import type { SVGProps } from "react";

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={14}
    height={14}
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
    <path d="M12 5v14M5 12h14" />
  </svg>
);
