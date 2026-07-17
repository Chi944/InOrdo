import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Understand project change before it spreads",
  description:
    "Trace evidence to project impact, approve recovery actions selectively, and keep every operation reversible.",
};

export default function Home() {
  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <Link className="brand" href="/" aria-label="InOrdo home">
          <span className="brand__mark" aria-hidden="true">IO</span>
          <span>InOrdo</span>
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#problem">Problem</a>
          <a href="#workflow">Workflow</a>
          <a href="#principles">Principles</a>
        </nav>
        <Link className="button button--secondary button--compact" href="/demo">Explore demo</Link>
      </header>

      <main id="main-content">
        <section className="hero section-shell">
          <div className="hero__copy">
            <p className="eyebrow">Work and productivity · Change control for real teams</p>
            <h1>Know what a project change will break—before you approve it.</h1>
            <p className="hero__lede">
              InOrdo connects source evidence to dependent work, makes impact reviewable, and keeps people in control of every change.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" href="/demo">Explore the synthetic demo <span aria-hidden="true">→</span></Link>
              <a className="button button--quiet" href="#workflow">See how it works</a>
            </div>
            <p className="honesty-note">
              UX shell preview using synthetic data. AI extraction, persistence, approvals, and undo are not connected in this build.
            </p>
          </div>

          <div className="hero-preview" aria-label="Illustrative InOrdo workflow preview">
            <div className="hero-preview__topline">
              <span>Climate Action Summit 2026</span>
              <span className="preview-label">Synthetic preview</span>
            </div>
            <div className="evidence-preview">
              <span className="preview-step">01 · Evidence</span>
              <p>“The venue is unavailable on 12 September. Move the summit to 26 September 2026.”</p>
              <small>Original source preserved</small>
            </div>
            <div className="impact-preview">
              <div>
                <span className="preview-step">02 · Impact</span>
                <strong>9 direct · 7 downstream</strong>
              </div>
              <ul aria-label="Example affected work">
                <li><span aria-hidden="true">!</span> Speaker confirmations <small>Direct</small></li>
                <li><span aria-hidden="true">↗</span> Briefing pack <small>3-hop path</small></li>
                <li><span aria-hidden="true">!</span> Student travel <small>Human review</small></li>
              </ul>
            </div>
            <div className="approval-preview">
              <span className="preview-step">03 · Approval</span>
              <span>8 selected</span>
              <span className="approval-preview__hold">1 held for review</span>
              <span className="preview-step">04 · Undo</span>
              <span>Available after an operation</span>
            </div>
          </div>
        </section>

        <section className="problem-section section-shell" id="problem" aria-labelledby="problem-title">
          <div>
            <p className="eyebrow">The coordination gap</p>
            <h2 id="problem-title">One changed fact can invalidate an entire plan.</h2>
          </div>
          <div className="problem-section__copy">
            <p>
              Teams then spend hours finding affected tasks, recovering lost context, coordinating fixes, and explaining decisions after the fact.
            </p>
            <div className="problem-list" role="list" aria-label="Common project change problems">
              <span role="listitem">Hidden blockers</span>
              <span role="listitem">Missed deadlines</span>
              <span role="listitem">Lost context</span>
              <span role="listitem">Untraceable decisions</span>
            </div>
          </div>
        </section>

        <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
          <div className="section-shell">
            <div className="section-heading">
              <p className="eyebrow">A controlled response to change</p>
              <h2 id="workflow-title">Evidence → impact → approval → undo</h2>
              <p>AI helps structure the update. Explicit project relationships determine reach. People decide what happens next.</p>
            </div>
            <ol className="workflow-grid">
              <li><span>01</span><h3>Evidence</h3><p>Paste a trusted source update and keep the original text visible.</p></li>
              <li><span>02</span><h3>Impact</h3><p>Review a structured candidate change and deterministic dependency paths.</p></li>
              <li><span>03</span><h3>Approval</h3><p>Select recovery actions one by one. A proposal is never permission.</p></li>
              <li><span>04</span><h3>Undo</h3><p>Inspect operation history and reverse supported changes with context intact.</p></li>
            </ol>
          </div>
        </section>

        <section className="principles-section section-shell" id="principles" aria-labelledby="principles-title">
          <div className="section-heading section-heading--left">
            <p className="eyebrow">Product principles</p>
            <h2 id="principles-title">Built for judgment, not autopilot.</h2>
          </div>
          <div className="principles-grid">
            <article><span aria-hidden="true">↳</span><h3>Evidence before action</h3><p>Every proposal starts with the source and keeps it available for challenge.</p></article>
            <article><span aria-hidden="true">◇</span><h3>AI proposes; people decide</h3><p>Structured extraction and recovery ideas stay pending until a person approves them.</p></article>
            <article><span aria-hidden="true">⌁</span><h3>Deterministic where it matters</h3><p>Explicit dependency traversal explains why each record is in scope.</p></article>
            <article><span aria-hidden="true">↶</span><h3>Traceable and reversible</h3><p>Approved operations belong in history with an honest undo boundary.</p></article>
          </div>
        </section>

        <section className="demo-cta section-shell" aria-labelledby="demo-cta-title">
          <div>
            <p className="eyebrow">See the working visual shell</p>
            <h2 id="demo-cta-title">Follow one venue change through a real project shape.</h2>
            <p>The demo uses a fictional eight-person university coalition and clearly labeled local fixture data.</p>
          </div>
          <div>
            <Link className="button button--primary" href="/demo">Open the synthetic workspace <span aria-hidden="true">→</span></Link>
            <small>No sign-in or live project connection required.</small>
          </div>
        </section>
      </main>

      <footer className="marketing-footer section-shell">
        <Link className="brand" href="/" aria-label="InOrdo home"><span className="brand__mark" aria-hidden="true">IO</span><span>InOrdo</span></Link>
        <p>Understand change. Approve with context. Keep a way back.</p>
        <span>Build Week UX shell · Synthetic demo</span>
      </footer>
    </div>
  );
}
