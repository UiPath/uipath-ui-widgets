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

function ConnectorsPreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <g key={i}>
            <rect
              x={16 + col * 100}
              y={16 + row * 66}
              width="88"
              height="54"
              rx="8"
              fill="white"
              stroke={i === 1 ? FILL_ACCENT : STROKE}
            />
            <circle
              cx={32 + col * 100}
              cy={34 + row * 66}
              r="9"
              fill={FILL_SOFT}
            />
            <rect
              x={48 + col * 100}
              y={28 + row * 66}
              width="46"
              height="6"
              rx="2"
              fill={FILL_BAR}
            />
            <rect
              x={24 + col * 100}
              y={50 + row * 66}
              width="60"
              height="5"
              rx="2"
              fill={FILL_TEXT}
            />
          </g>
        );
      })}
    </svg>
  );
}

function SlackMessagePreview() {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="160" fill="#f5f7fa" />
      <rect
        x="16"
        y="16"
        width="288"
        height="128"
        rx="8"
        fill="white"
        stroke={STROKE}
      />
      {/* recipient field */}
      <rect x="32" y="32" width="70" height="6" rx="2" fill={FILL_BAR} />
      <rect
        x="32"
        y="42"
        width="256"
        height="20"
        rx="5"
        fill="white"
        stroke={STROKE}
      />
      <circle cx="46" cy="52" r="5" fill={FILL_ACCENT} />
      <rect x="58" y="49" width="90" height="6" rx="2" fill={FILL_TEXT} />
      {/* message field */}
      <rect x="32" y="74" width="60" height="6" rx="2" fill={FILL_BAR} />
      <rect
        x="32"
        y="84"
        width="256"
        height="34"
        rx="5"
        fill={FILL_SOFT}
        stroke={STROKE}
      />
      <rect x="40" y="92" width="180" height="6" rx="2" fill={FILL_TEXT} />
      <rect x="40" y="103" width="120" height="6" rx="2" fill={FILL_TEXT} />
      {/* send button */}
      <rect x="226" y="124" width="62" height="14" rx="7" fill={FILL_BAR} />
    </svg>
  );
}

function LayoutPreview({ widgetId }: LayoutPreviewProps) {
  switch (widgetId) {
    case "datatable":
      return <DataTablePreview />;
    case "validation-station":
      return <ValidationStationPreview />;
    case "multi-file-upload":
      return <MultiFileUploadPreview />;
    case "conversational-agent-chat":
      return <ConversationalAgentPreview />;
    case "connectors":
      return <ConnectorsPreview />;
    case "slack-message":
      return <SlackMessagePreview />;
    default:
      return null;
  }
}

export default LayoutPreview;
