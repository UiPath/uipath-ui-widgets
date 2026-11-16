interface LayoutPreviewProps {
  widgetId: string;
}

const STROKE = "#b2dfdb";
const FILL_SOFT = "#e0f2f1";
const FILL_BAR = "#00897b";
const FILL_ACCENT = "#ff9800";
const FILL_TEXT = "#cfd8dc";

function DataTablePreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      <rect
        x="12"
        y="12"
        width="80"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x="20"
          y={24 + i * 22}
          width="64"
          height="12"
          rx="3"
          fill={i === 1 ? FILL_SOFT : FILL_TEXT}
        />
      ))}
      <rect
        x="104"
        y="12"
        width="204"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      <rect x="104" y="12" width="204" height="20" rx="6" fill={FILL_BAR} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x="112"
            y={40 + i * 20}
            width="60"
            height="8"
            rx="2"
            fill={FILL_TEXT}
          />
          <rect
            x="180"
            y={40 + i * 20}
            width="50"
            height="8"
            rx="2"
            fill={FILL_TEXT}
          />
          <rect
            x="240"
            y={40 + i * 20}
            width="60"
            height="8"
            rx="2"
            fill={i === 2 ? FILL_ACCENT : FILL_TEXT}
          />
        </g>
      ))}
    </svg>
  );
}

function ValidationStationPreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      <rect
        x="12"
        y="12"
        width="72"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="20"
            y={20 + i * 36}
            width="56"
            height="10"
            rx="2"
            fill={i === 0 ? FILL_BAR : FILL_TEXT}
          />
          <rect
            x="20"
            y={34 + i * 36}
            width="40"
            height="6"
            rx="2"
            fill={FILL_TEXT}
          />
        </g>
      ))}
      <rect
        x="96"
        y="12"
        width="212"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="104"
            y={24 + i * 30}
            width="40"
            height="6"
            rx="2"
            fill={FILL_TEXT}
          />
          <rect
            x="104"
            y={34 + i * 30}
            width="84"
            height="14"
            rx="3"
            fill="white"
            stroke={i === 1 ? FILL_ACCENT : STROKE}
          />
        </g>
      ))}
      <rect x="200" y="22" width="100" height="70" rx="3" fill={FILL_SOFT} />
      <rect x="200" y="100" width="100" height="6" rx="2" fill={FILL_TEXT} />
      <rect x="200" y="112" width="80" height="6" rx="2" fill={FILL_TEXT} />
      <rect x="200" y="124" width="90" height="6" rx="2" fill={FILL_TEXT} />
      <rect x="200" y="136" width="70" height="6" rx="2" fill={FILL_TEXT} />
    </svg>
  );
}

/** A page thumbnail: a sheet with a few text lines, or a greyed blank one. */
function PageThumbnail({
  x,
  y,
  muted = false,
}: {
  x: number;
  y: number;
  muted?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="15"
        height="20"
        rx="1.5"
        fill={muted ? FILL_TEXT : "white"}
        stroke={muted ? "none" : STROKE}
      />
      {!muted &&
        [0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={x + 3}
            y={y + 4 + i * 4}
            width={i === 3 ? 6 : 9}
            height="1.5"
            rx="0.75"
            fill={FILL_TEXT}
          />
        ))}
    </g>
  );
}

/**
 * One classified group: drag handle, confidence, document-type select and
 * overflow menu, then a row of its page thumbnails.
 */
function ClassificationGroup({
  y,
  pages,
  state,
}: {
  y: number;
  pages: number;
  state: "selected" | "classified" | "unclassified";
}) {
  const unclassified = state === "unclassified";
  return (
    <g>
      {state === "selected" && (
        <rect x="14" y={y - 2} width="2" height="34" rx="1" fill={FILL_BAR} />
      )}
      {/* Drag handle */}
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={20 + col * 3}
            cy={y + 2 + row * 3}
            r="0.9"
            fill={FILL_TEXT}
          />
        )),
      )}
      {/* Confidence — N/A for pages no type was assigned to */}
      <rect
        x="26"
        y={y + 3}
        width="7"
        height="3"
        rx="1"
        fill={unclassified ? FILL_ACCENT : FILL_BAR}
      />
      {/* Document-type select */}
      <rect
        x="36"
        y={y}
        width="82"
        height="10"
        rx="2"
        fill="white"
        stroke={STROKE}
      />
      <rect
        x="40"
        y={y + 3.5}
        width={unclassified ? 36 : 24}
        height="3"
        rx="1"
        fill={unclassified ? FILL_TEXT : FILL_BAR}
      />
      {/* Overflow menu */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="125" cy={y + 2 + i * 3} r="0.9" fill={FILL_TEXT} />
      ))}
      {state === "selected" && (
        <rect
          x="33.5"
          y={y + 12.5}
          width="20"
          height="25"
          rx="2"
          fill={FILL_SOFT}
        />
      )}
      {Array.from({ length: pages }, (_, i) => (
        <PageThumbnail
          key={i}
          x={36 + i * 20}
          y={y + 15}
          muted={unclassified}
        />
      ))}
    </g>
  );
}

function ClassificationStationPreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      {/* Split and classify: one group per document found in the file */}
      <rect
        x="12"
        y="12"
        width="120"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      <ClassificationGroup y={18} pages={3} state="selected" />
      <ClassificationGroup y={56} pages={2} state="unclassified" />
      <ClassificationGroup y={94} pages={4} state="classified" />
      {/* Actions: Discard, Save, Submit, report as exception */}
      <line x1="12" y1="131" x2="132" y2="131" stroke={STROKE} />
      <rect x="20" y="138" width="14" height="3" rx="1" fill={FILL_TEXT} />
      <rect
        x="40"
        y="135"
        width="30"
        height="9"
        rx="2"
        fill="white"
        stroke={FILL_BAR}
      />
      <rect x="74" y="135" width="38" height="9" rx="2" fill={FILL_BAR} />
      <rect x="116" y="135" width="10" height="9" rx="2" fill={FILL_ACCENT} />
      {/* Document viewer on the selected page */}
      <rect
        x="140"
        y="12"
        width="168"
        height="136"
        rx="6"
        fill="#eceff1"
        stroke={STROKE}
      />
      <rect
        x="182"
        y="20"
        width="84"
        height="120"
        rx="2"
        fill="white"
        stroke={STROKE}
      />
      <rect x="188" y="26" width="72" height="50" rx="2" fill={FILL_SOFT} />
      <rect x="193" y="32" width="38" height="6" rx="2" fill={FILL_BAR} />
      <rect x="193" y="42" width="22" height="6" rx="2" fill={FILL_BAR} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x="188"
          y={84 + i * 10}
          width={i === 4 ? 40 : 72}
          height="4"
          rx="1.5"
          fill={FILL_TEXT}
        />
      ))}
      {/* Floating controls: menu, page navigation, search, zoom */}
      <rect x="148" y="20" width="22" height="10" rx="5" fill={FILL_TEXT} />
      <rect x="276" y="20" width="24" height="10" rx="5" fill={FILL_TEXT} />
      <circle cx="154" cy="135" r="5" fill={FILL_TEXT} />
      <rect x="276" y="130" width="24" height="10" rx="5" fill={FILL_TEXT} />
    </svg>
  );
}

function DocumentViewerPreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      <rect
        x="12"
        y="12"
        width="296"
        height="136"
        rx="6"
        fill="#eceff1"
        stroke={STROKE}
      />
      {/* The page, with the next one coming into view */}
      <rect
        x="104"
        y="20"
        width="112"
        height="116"
        rx="2"
        fill="white"
        stroke={STROKE}
      />
      <rect
        x="104"
        y="140"
        width="112"
        height="8"
        rx="2"
        fill="white"
        stroke={STROKE}
      />
      <rect x="112" y="28" width="96" height="44" rx="2" fill={FILL_SOFT} />
      <rect x="118" y="34" width="52" height="6" rx="2" fill={FILL_BAR} />
      <rect x="118" y="44" width="30" height="6" rx="2" fill={FILL_BAR} />
      {/* Text lines: passive highlights on extracted values, and the highlighted reference */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x="112"
          y={80 + i * 9}
          width={i === 5 ? 50 : 96}
          height="4"
          rx="1.5"
          fill={i === 1 || i === 4 ? FILL_SOFT : FILL_TEXT}
        />
      ))}
      <rect
        x="110"
        y="96"
        width="56"
        height="8"
        rx="2"
        fill="#fff3e0"
        stroke={FILL_ACCENT}
      />
      <rect x="113" y="98" width="50" height="4" rx="1.5" fill={FILL_ACCENT} />
      {/* Floating controls: menu and text view, page navigation and rotate, search, zoom and full screen */}
      <rect
        x="20"
        y="20"
        width="34"
        height="14"
        rx="7"
        fill="white"
        stroke={STROKE}
      />
      <path
        d="M 26 24.5 L 33 24.5 M 26 27 L 33 27 M 26 29.5 L 33 29.5"
        stroke={FILL_BAR}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect
        x="40"
        y="23.5"
        width="9"
        height="7"
        rx="1"
        fill="none"
        stroke={FILL_BAR}
        strokeWidth="1.2"
      />
      <rect
        x="244"
        y="20"
        width="40"
        height="14"
        rx="7"
        fill="white"
        stroke={STROKE}
      />
      <rect x="256" y="25" width="16" height="4" rx="1.5" fill={FILL_BAR} />
      <circle cx="296" cy="27" r="7" fill="white" stroke={STROKE} />
      <circle
        cx="296"
        cy="27"
        r="3"
        fill="none"
        stroke={FILL_BAR}
        strokeWidth="1.2"
      />
      <circle cx="27" cy="133" r="7" fill="white" stroke={STROKE} />
      <circle
        cx="26"
        cy="132"
        r="2.5"
        fill="none"
        stroke={FILL_BAR}
        strokeWidth="1.2"
      />
      <path
        d="M 28 134 L 30.5 136.5"
        stroke={FILL_BAR}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect
        x="244"
        y="126"
        width="40"
        height="14"
        rx="7"
        fill="white"
        stroke={STROKE}
      />
      <path
        d="M 252 133 L 258 133 M 270 133 L 276 133 M 273 130 L 273 136"
        stroke={FILL_BAR}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="296" cy="133" r="7" fill="white" stroke={STROKE} />
      <rect
        x="292.5"
        y="129.5"
        width="7"
        height="7"
        rx="1"
        fill="none"
        stroke={FILL_BAR}
        strokeWidth="1.2"
        strokeDasharray="2.5 2"
      />
    </svg>
  );
}

function InvoiceReviewWorkspacePreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      {/* Document viewer — left column, spans both rows */}
      <rect
        x="12"
        y="12"
        width="150"
        height="94"
        rx="6"
        fill={FILL_SOFT}
        stroke={STROKE}
      />
      <rect x="24" y="24" width="90" height="6" rx="2" fill={FILL_TEXT} />
      <rect x="24" y="36" width="120" height="6" rx="2" fill={FILL_ACCENT} />
      <rect x="24" y="48" width="110" height="6" rx="2" fill={FILL_TEXT} />
      <rect x="24" y="60" width="100" height="6" rx="2" fill={FILL_TEXT} />
      {/* Line-items table editor — left column, bottom */}
      <rect
        x="12"
        y="112"
        width="150"
        height="36"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      <rect x="12" y="112" width="150" height="12" rx="6" fill={FILL_BAR} />
      {[0, 1].map((i) => (
        <rect
          key={i}
          x="20"
          y={130 + i * 9}
          width="134"
          height="5"
          rx="2"
          fill={FILL_TEXT}
        />
      ))}
      {/* Doc-type field — right column, top strip */}
      <rect
        x="170"
        y="12"
        width="138"
        height="18"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      <rect x="178" y="18" width="70" height="6" rx="2" fill={FILL_BAR} />
      <path d="M 292 19 L 300 19 L 296 24 Z" fill={FILL_BAR} />
      {/* Fields form — right column, middle */}
      <rect
        x="170"
        y="36"
        width="138"
        height="70"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x="178"
            y={44 + i * 20}
            width="40"
            height="6"
            rx="2"
            fill={FILL_TEXT}
          />
          <rect
            x="178"
            y={52 + i * 20}
            width="122"
            height="12"
            rx="3"
            fill="white"
            stroke={i === 1 ? FILL_ACCENT : STROKE}
          />
        </g>
      ))}
      {/* Business rules — right column, bottom */}
      <rect
        x="170"
        y="112"
        width="138"
        height="36"
        rx="6"
        fill="#fff3e0"
        stroke={FILL_ACCENT}
      />
      <circle cx="180" cy="124" r="4" fill={FILL_ACCENT} />
      <rect x="190" y="121" width="100" height="6" rx="2" fill={FILL_TEXT} />
      <circle cx="180" cy="138" r="4" fill={FILL_ACCENT} />
      <rect x="190" y="135" width="80" height="6" rx="2" fill={FILL_TEXT} />
    </svg>
  );
}

function MultiFileUploadPreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      <rect
        x="12"
        y="12"
        width="200"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      <rect x="12" y="12" width="200" height="18" rx="6" fill={FILL_SOFT} />
      <rect x="20" y="18" width="60" height="6" rx="2" fill={FILL_BAR} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="20"
            y={42 + i * 22}
            width="90"
            height="8"
            rx="2"
            fill={FILL_TEXT}
          />
          <rect
            x="120"
            y={42 + i * 22}
            width="40"
            height="8"
            rx="2"
            fill={FILL_TEXT}
          />
          <circle cx="178" cy={46 + i * 22} r="5" fill={FILL_BAR} />
          <circle cx="194" cy={46 + i * 22} r="5" fill={FILL_ACCENT} />
        </g>
      ))}
      <rect
        x="224"
        y="12"
        width="84"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      <rect
        x="232"
        y="36"
        width="68"
        height="100"
        rx="6"
        fill={FILL_SOFT}
        stroke={FILL_BAR}
        strokeDasharray="3 3"
      />
      <path
        d="M 266 70 L 266 100 M 252 86 L 266 70 L 280 86"
        stroke={FILL_BAR}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="248" y="110" width="36" height="6" rx="2" fill={FILL_BAR} />
    </svg>
  );
}

function ConversationalAgentPreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      <rect
        x="12"
        y="12"
        width="296"
        height="136"
        rx="6"
        fill="white"
        stroke={STROKE}
      />
      <rect x="24" y="24" width="160" height="22" rx="11" fill={FILL_SOFT} />
      <rect x="32" y="32" width="120" height="6" rx="2" fill={FILL_BAR} />
      <rect x="136" y="56" width="160" height="22" rx="11" fill={FILL_BAR} />
      <rect x="144" y="64" width="140" height="6" rx="2" fill="white" />
      <rect x="24" y="88" width="120" height="22" rx="11" fill={FILL_SOFT} />
      <rect x="32" y="96" width="90" height="6" rx="2" fill={FILL_BAR} />
      <rect
        x="24"
        y="120"
        width="240"
        height="20"
        rx="10"
        fill="white"
        stroke={STROKE}
      />
      <rect x="32" y="127" width="80" height="6" rx="2" fill={FILL_TEXT} />
      <circle cx="284" cy="130" r="10" fill={FILL_ACCENT} />
      <path
        d="M 280 130 L 288 130 M 285 127 L 288 130 L 285 133"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayoutPreview({ widgetId }: LayoutPreviewProps) {
  switch (widgetId) {
    case "datatable":
      return <DataTablePreview />;
    // The Validation Station samples render the same screen — only the data
    // source differs — so they share one preview.
    case "validation-station":
    case "validation-station-prefetched":
    case "validation-station-ixp":
      return <ValidationStationPreview />;
    case "classification-station":
      return <ClassificationStationPreview />;
    case "document-viewer":
      return <DocumentViewerPreview />;
    case "invoice-review-workspace":
      return <InvoiceReviewWorkspacePreview />;
    case "multi-file-upload":
      return <MultiFileUploadPreview />;
    case "conversational-agent-chat":
      return <ConversationalAgentPreview />;
    default:
      return null;
  }
}

export default LayoutPreview;
