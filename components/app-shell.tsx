"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { PREVIEW_RESET_EVENT } from "@/lib/ui-events";

const projectLinks = [
  { href: "/demo", label: "Overview", mark: "⌂" },
  { href: "/demo#items", label: "Project items", mark: "□" },
  { href: "/demo#dependencies", label: "Dependencies", mark: "↗" },
  { href: "/demo#impacts", label: "Impact review", mark: "!" },
  { href: "/demo#history", label: "History & undo", mark: "↶" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sessionMenuRef = useRef<HTMLDetailsElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 50);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    function resetPreview() {
      setMobileOpen(false);
      if (sessionMenuRef.current) sessionMenuRef.current.open = false;
    }

    window.addEventListener(PREVIEW_RESET_EVENT, resetPreview);
    return () => window.removeEventListener(PREVIEW_RESET_EVENT, resetPreview);
  }, []);

  function closeMobileNavigation() {
    setMobileOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  function trapMobileNavigation(event: ReactKeyboardEvent<HTMLElement>) {
    if (!mobileOpen || event.key !== "Tab") return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusable = Array.from(
      sidebar.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getAttribute("aria-hidden") !== "true");
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && (document.activeElement === first || !sidebar.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const onPatternsPage = pathname === "/demo/components";

  return (
    <div className="app-shell">
      <aside
        aria-label="Project navigation"
        aria-modal={mobileOpen ? true : undefined}
        className={cn("app-sidebar", mobileOpen && "is-open")}
        id="app-navigation"
        onKeyDown={trapMobileNavigation}
        ref={sidebarRef}
        role={mobileOpen ? "dialog" : undefined}
      >
        <div className="app-sidebar__header">
          <Link className="brand brand--app" href="/" aria-label="InOrdo home">
            <span className="brand__mark" aria-hidden="true">IO</span>
            <span>InOrdo</span>
          </Link>
          <button
            aria-label="Close project navigation"
            className="icon-button app-sidebar__close"
            onClick={closeMobileNavigation}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="project-selector">
          <label htmlFor="project-selector">Project</label>
          <select defaultValue="climate-summit" id="project-selector">
            <option value="climate-summit">Climate Summit 2026</option>
          </select>
          <span>Synthetic fixture · 24 records</span>
        </div>

        <nav aria-label="Workspace sections" className="app-nav">
          <p className="app-nav__label">Workspace</p>
          <ul>
            {projectLinks.map((link) => {
              const current = link.href === "/demo" && !onPatternsPage && !link.href.includes("#");
              return (
                <li key={link.href}>
                  <a aria-current={current ? "page" : undefined} href={link.href} onClick={() => setMobileOpen(false)}>
                    <span aria-hidden="true" className="app-nav__mark">{link.mark}</span>
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="app-nav__label app-nav__label--secondary">Reference</p>
          <ul>
            <li>
              <Link aria-current={onPatternsPage ? "page" : undefined} href="/demo/components" onClick={() => setMobileOpen(false)}>
                <span aria-hidden="true" className="app-nav__mark">◇</span>
                UI patterns
              </Link>
            </li>
          </ul>
        </nav>

        <div className="app-sidebar__footer">
          <Badge tone="warning">Preview only</Badge>
          <p>No project data is connected.</p>
        </div>
      </aside>

      {mobileOpen ? <button aria-hidden="true" className="app-overlay" onClick={closeMobileNavigation} tabIndex={-1} type="button" /> : null}

      <div className="app-frame" inert={mobileOpen ? true : undefined}>
        <header className="app-topbar">
          <button
            aria-controls="app-navigation"
            aria-expanded={mobileOpen}
            className="button button--secondary app-topbar__menu"
            onClick={() => setMobileOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <span aria-hidden="true">☰</span>
            Menu
          </button>

          <nav aria-label="Breadcrumb" className="breadcrumbs">
            <ol>
              <li><Link href="/">InOrdo</Link></li>
              <li><Link href="/demo">Synthetic demo</Link></li>
              {onPatternsPage ? <li aria-current="page">UI patterns</li> : <li aria-current="page">Overview</li>}
            </ol>
          </nav>

          <div className="app-topbar__actions">
            <ConfirmationDialog />
            <details className="session-menu" ref={sessionMenuRef}>
              <summary aria-label="Demo session menu — no account connected">
                <span className="avatar" aria-hidden="true">MT</span>
                <span className="session-menu__label"><strong>Demo session</strong><small>No account connected</small></span>
                <span aria-hidden="true">⌄</span>
              </summary>
              <div className="session-menu__panel">
                <p className="eyebrow">Synthetic role</p>
                <strong>Mei Lin Tan</strong>
                <span>Summit director · fixture only</span>
                <Link href="/">Exit demo</Link>
              </div>
            </details>
          </div>
        </header>

        <main className="app-main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
