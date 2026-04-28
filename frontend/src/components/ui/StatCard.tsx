interface StatCardProps {
  value: string;
  label: string;
  note: string;
}

export function StatCard({ value, label, note }: StatCardProps) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
      <p>{note}</p>
    </article>
  );
}
