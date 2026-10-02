import type { SVGProps } from "react";

export const WarnIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={11}
    height={11}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...props}
  >
    <path d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-7h-2v5h2V9z" />
  </svg>
);
