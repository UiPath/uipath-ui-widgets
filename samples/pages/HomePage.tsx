import LayoutPreview from "./LayoutPreview";
import { widgets } from "../widgets";

function HomePage() {
  return (
    <>
      <div className="app-header">
        <h1>UiPath UI Widgets</h1>
        <p>Sample showcase for embeddable React widgets</p>
      </div>
      <ul className="home-list">
        {widgets.map((w) => (
          <li key={w.id}>
            <a className="home-list-item" href={`#/${w.id}`}>
              <div className="home-list-item-preview">
                <LayoutPreview widgetId={w.id} />
              </div>
              <div className="home-list-item-body">
                <span className="home-list-item-title">{w.title}</span>
                <span className="home-list-item-description">
                  {w.description}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default HomePage;
