import type { SVGProps } from "react";

export const SignalIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" />
  </svg>
);
