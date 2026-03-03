import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Projects", href: "/projects" },
  { label: "Assessments", href: "/assessments/new" },
  { label: "Frameworks", href: "/frameworks" },
  { label: "Analytics", href: "/analytics" },
];

export function GovukHeader() {
  const location = useLocation();

  return (
    <header className="govuk-header" role="banner" data-module="govuk-header">
      <div className="govuk-header__container govuk-width-container">
        <div className="govuk-header__logo">
          <Link to="/" className="govuk-header__link govuk-header__link--homepage">
            <span className="govuk-header__logotype">
              <span className="govuk-header__logotype-text">
                CustomerFirst
              </span>
            </span>
          </Link>
        </div>
        <div className="govuk-header__content">
          <Link to="/" className="govuk-header__link govuk-header__service-name">
            Portfolio Scoring Tool
          </Link>
          <nav aria-label="Menu" className="govuk-header__navigation">
            <button
              type="button"
              className="govuk-header__menu-button govuk-js-header-toggle"
              aria-controls="navigation"
              aria-label="Show or hide menu"
              hidden
            >
              Menu
            </button>
            <ul id="navigation" className="govuk-header__navigation-list">
              {NAV_ITEMS.map((item) => (
                <li
                  key={item.href}
                  className={`govuk-header__navigation-item${
                    location.pathname.startsWith(item.href) ? " govuk-header__navigation-item--active" : ""
                  }`}
                >
                  <Link className="govuk-header__link" to={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
