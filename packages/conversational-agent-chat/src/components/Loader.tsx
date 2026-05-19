type LoaderProps = {
  size?: number;
};

// This should live in the apollo-ui package and be imported by the widget, but for now since
// apollo-ui doesn't have a loader component we'll add it here. Once apollo implements
// the loader component this can be removed and imported from apollo instead
export const Loader = ({ size = 72 }: LoaderProps) => (
  <svg
    className="uipath-loader"
    width={size}
    height={size}
    viewBox="0 0 400 400"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Loading"
    role="img"
  >
    <path d="M32,48H352V368" fill="none" />
    <path d="M368,352H48V32" fill="none" />
  </svg>
);
