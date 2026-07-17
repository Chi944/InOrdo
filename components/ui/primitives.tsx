import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions, meta }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="page-header__description">{description}</p> : null}
        {meta ? <div className="page-header__meta">{meta}</div> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

type CardProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  footer?: ReactNode;
  id?: string;
  title?: string;
};

export function Card({ children, className, description, eyebrow, footer, id, title }: CardProps) {
  return (
    <section className={cn("card", className)} id={id}>
      {eyebrow || title || description ? (
        <header className="card__header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
        </header>
      ) : null}
      <div className="card__body">{children}</div>
      {footer ? <footer className="card__footer">{footer}</footer> : null}
    </section>
  );
}

const statusSymbols = {
  neutral: "•",
  positive: "✓",
  warning: "!",
  danger: "!",
  info: "i",
  proposed: "◇",
} as const;

export type BadgeTone = keyof typeof statusSymbols;

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={cn("badge", `badge--${tone}`)}>
      <span aria-hidden="true" className="badge__symbol">{statusSymbols[tone]}</span>
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel state-panel--empty">
      <span aria-hidden="true" className="state-panel__mark">○</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <span aria-hidden="true" className="state-panel__mark">!</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function LoadingSkeleton({ label = "Loading content" }: { label?: string }) {
  return (
    <div className="loading-skeleton" role="status" aria-label={label}>
      <span className="loading-skeleton__line loading-skeleton__line--short" />
      <span className="loading-skeleton__line" />
      <span className="loading-skeleton__line loading-skeleton__line--medium" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  help?: string;
  id: string;
  label: string;
};

export function FormField({ error, help, id, label, className, ...inputProps }: FormFieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("form-field", className)}>
      <label htmlFor={id}>{label}</label>
      {help ? <p className="form-field__help" id={helpId}>{help}</p> : null}
      <input id={id} aria-describedby={describedBy} aria-invalid={Boolean(error)} {...inputProps} />
      {error ? <p className="form-field__error" id={errorId}>{error}</p> : null}
    </div>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
};

export function IconButton({ icon, label, className, type = "button", ...buttonProps }: IconButtonProps) {
  return (
    <button className={cn("icon-button", className)} type={type} aria-label={label} title={label} {...buttonProps}>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export function InlineResult({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warning" }) {
  return (
    <div className={cn("inline-result", `inline-result--${tone}`)} role="status" aria-live="polite">
      <span aria-hidden="true">{tone === "success" ? "✓" : tone === "warning" ? "!" : "i"}</span>
      <span>{children}</span>
    </div>
  );
}
