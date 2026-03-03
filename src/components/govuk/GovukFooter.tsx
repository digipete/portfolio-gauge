export function GovukFooter() {
  return (
    <footer className="govuk-footer" role="contentinfo">
      <div className="govuk-width-container">
        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
            <h2 className="govuk-visually-hidden">Support links</h2>
            <ul className="govuk-footer__inline-list">
              <li className="govuk-footer__inline-list-item">
                <a className="govuk-footer__link" href="#/about">
                  About the scoring framework
                </a>
              </li>
              <li className="govuk-footer__inline-list-item">
                <a className="govuk-footer__link" href="#/accessibility">
                  Accessibility statement (demo)
                </a>
              </li>
            </ul>
            <p className="govuk-footer__meta-custom">
              CustomerFirst Portfolio Scoring Tool (Demo)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
