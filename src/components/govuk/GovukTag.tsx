import { cn } from "@/lib/utils";

type TagColour = "grey" | "green" | "turquoise" | "blue" | "red" | "orange" | "yellow" | "purple" | "pink";

interface GovukTagProps {
  children: React.ReactNode;
  colour?: TagColour;
  className?: string;
}

export function GovukTag({ children, colour, className }: GovukTagProps) {
  return (
    <strong
      className={cn(
        "govuk-tag",
        colour && `govuk-tag--${colour}`,
        className
      )}
    >
      {children}
    </strong>
  );
}

export function OutcomeTag({ outcome }: { outcome: string }) {
  const colourMap: Record<string, TagColour> = {
    IN: "green",
    CONDITIONAL: "yellow",
    OUT: "red",
  };
  return <GovukTag colour={colourMap[outcome] || "grey"}>{outcome}</GovukTag>;
}

export function StageTag({ stage }: { stage: string }) {
  const colourMap: Record<string, TagColour> = {
    Idea: "grey",
    Discovery: "blue",
    Alpha: "turquoise",
    Beta: "orange",
    Live: "green",
  };
  return <GovukTag colour={colourMap[stage] || "grey"}>{stage}</GovukTag>;
}
