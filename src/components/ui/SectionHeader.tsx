interface SectionHeaderProps {
  /** id do título, usado pela seção em aria-labelledby. */
  headingId: string;
  title: string;
  description?: string;
}

export function SectionHeader({ headingId, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <h2
        id={headingId}
        className="font-display text-x-large uppercase tracking-wide text-title"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-medium text-subtitle">{description}</p>
      )}
    </div>
  );
}
