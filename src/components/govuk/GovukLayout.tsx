import { ReactNode } from "react";
import { GovukHeader } from "./GovukHeader";
import { GovukFooter } from "./GovukFooter";

interface GovukLayoutProps {
  children: ReactNode;
}

export function GovukLayout({ children }: GovukLayoutProps) {
  return (
    <>
      <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
        Skip to main content
      </a>
      <GovukHeader />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          {children}
        </main>
      </div>
      <GovukFooter />
    </>
  );
}
