import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  accent?: "blue" | "green" | "orange";
  children?: ReactNode;
}

export function FeatureCard({
  title,
  description,
  accent = "blue",
  children
}: FeatureCardProps) {
  return (
    <article className={`feature-card feature-card-${accent}`}>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </article>
  );
}
