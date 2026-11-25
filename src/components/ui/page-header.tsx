interface PageHeaderProps {
  /** Mono section index shown in the eyebrow, e.g. "01". */
  index: string;
  /** Eyebrow label, e.g. "Overview". */
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/** Page heading with the landing page's "01 —— LABEL" eyebrow. */
export function PageHeader({ index, eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow mb-3 inline-flex items-center gap-2.5 text-ink-2">
          <span className="text-accent-text">{index}</span>
          <span className="h-px w-6 bg-line-strong" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="text-[2rem] leading-[1.05] font-semibold tracking-[-0.04em] text-foreground sm:text-[2.5rem]">
          {title}
        </h1>
        {description && <p className="mt-2.5 max-w-xl text-[15px] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
