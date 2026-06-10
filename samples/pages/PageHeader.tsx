import { getWidget } from "../widgets";

interface PageHeaderProps {
  widgetId: string;
}

function PageHeader({ widgetId }: PageHeaderProps) {
  const widget = getWidget(widgetId);
  if (!widget) return null;
  return (
    <div className="app-header">
      <a className="back-link" href="#/">
        ← All widgets
      </a>
      <h1>{widget.title}</h1>
      <p>{widget.description}</p>
    </div>
  );
}

export default PageHeader;
