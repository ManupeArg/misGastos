interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = '#6B7280' }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}25`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  );
}
