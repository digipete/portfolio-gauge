import { cn } from "@/lib/utils";

interface Props {
  type?: "success" | "warning" | "info";
  title: string;
  children: React.ReactNode;
}

export function GovukNotificationBanner({ type = "info", title, children }: Props) {
  return (
    <div
      className={cn(
        "govuk-notification-banner",
        type === "success" && "govuk-notification-banner--success",
        type === "warning" && "notification-banner--warning"
      )}
      role={type === "success" ? "alert" : "region"}
      aria-labelledby="govuk-notification-banner-title"
    >
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
          {title}
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        {children}
      </div>
    </div>
  );
}
