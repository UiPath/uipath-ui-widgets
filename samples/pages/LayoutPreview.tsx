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
    // Both Validation Station samples render the same screen — only the data
    // flow differs — so they share one preview.
    case "validation-station":
    case "validation-station-prefetched":
      return <ValidationStationPreview />;
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
