import { cn } from "@/lib/utils";

/** Raised surface: borders are 1px shadow rings so they never affect layout. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl bg-surface shadow-sm ring-1 ring-line", className)} {...props} />;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  titleId?: string;
}

export function CardHeader({ title, description, action, className, titleId }: CardHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6", className)}>
      <div className="min-w-0">
        <h2 id={titleId} className="text-[15px] font-semibold tracking-[-0.015em] text-foreground">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
