import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Mail,
  Phone,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
  UserCheck,
} from 'lucide-react'

const pilotItems = [
  'One recurring inspection or service-closeout workflow mapped end to end',
  'Review of 10–20 redacted historical packets to identify recurring evidence gaps',
  'Mobile-friendly required-evidence checklist using your existing terminology',
  'Missing-evidence and exception queue for office review',
  'Customer-ready closeout packet template and weekly management digest',
  'End-of-pilot findings report measuring completeness, rework, and turnaround',
]

const evidenceItems = [
  { icon: Camera, label: 'Required photos' },
  { icon: UserCheck, label: 'Technician identity and qualification record' },
  { icon: ClipboardCheck, label: 'System, asset, and inspection details' },
  { icon: TriangleAlert, label: 'Deficiencies and exception notes' },
  { icon: FileCheck2, label: 'Signatures, timestamps, and revision history' },
  { icon: BadgeCheck, label: 'Branded customer-ready closeout packet' },
]

const steps = [
  {
    number: '01',
    title: 'Map one real workflow',
    copy: 'We begin with one inspection type, your current form, and a small set of redacted completed packets.',
  },
  {
    number: '02',
    title: 'Catch missing evidence earlier',
    copy: 'A guided capture and exception process flags incomplete photos, signatures, identifiers, and supporting records before closeout.',
  },
  {
    number: '03',
    title: 'Measure the operational result',
    copy: 'The pilot tracks first-pass completeness, office rework, report-ready time, and deficiency handoff speed.',
  },
]

const mailSubject = encodeURIComponent('Inspection Readiness & Closeout Pilot')
const mailBody = encodeURIComponent(
  'Hi Michael,\n\nI would like to discuss the 30-day Inspection Readiness & Closeout Pilot.\n\nCompany:\nInspection or service workflow:\nBest phone number:\n\nThank you,',
)

function App() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Inspection Closeout Pilot home">
          <span className="brand-mark"><ShieldCheck size={20} /></span>
          <span>Inspection Closeout Pilot</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#pilot">Pilot</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span /> Sacramento & Northern California</div>
          <h1>Complete inspection packets before they become office rework.</h1>
          <p className="hero-lede">
            A focused 30-day pilot for regional fire and life-safety contractors. Catch missing photos,
            signatures, asset details, technician records, and deficiency evidence before the customer-ready packet is issued.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={`mailto:enterthefieldmichael@gmail.com?subject=${mailSubject}&body=${mailBody}`}>
              Discuss the pilot <ArrowRight size={18} />
            </a>
            <a className="button button-secondary" href="tel:+15308385844">
              <Phone size={18} /> 530-838-5844
            </a>
          </div>
          <div className="trust-row" aria-label="Pilot characteristics">
            <span><CheckCircle2 size={16} /> One workflow</span>
            <span><CheckCircle2 size={16} /> No core-system replacement</span>
            <span><CheckCircle2 size={16} /> Fixed 30-day scope</span>
          </div>
        </div>

        <aside className="hero-card" aria-label="Pilot summary">
          <div className="hero-card-top">
            <span>FOUNDING PILOT</span>
            <span className="status-dot">Local intake open</span>
          </div>
          <div className="price-row">
            <span className="price">$1,500</span>
            <span className="price-note">fixed 30-day pilot</span>
          </div>
          <div className="packet-preview">
            <div className="packet-header">
              <span>INSPECTION CLOSEOUT</span>
              <span className="packet-ready">READY</span>
            </div>
            <div className="packet-line wide" />
            <div className="packet-grid">
              <div><span>TECHNICIAN</span><strong>Qualified</strong></div>
              <div><span>PHOTOS</span><strong>8 / 8</strong></div>
              <div><span>SIGNATURE</span><strong>Captured</strong></div>
              <div><span>EXCEPTIONS</span><strong>1 reviewed</strong></div>
            </div>
            <div className="packet-photo-row">
              <div /><div /><div />
            </div>
            <div className="packet-footer">
              <span>Revision history recorded</span>
              <BadgeCheck size={18} />
            </div>
          </div>
        </aside>
      </section>

      <section className="problem-strip" aria-label="Problem statement">
        <div>
          <TimerReset size={24} />
          <strong>Field completion is not always report readiness.</strong>
        </div>
        <p>
          Photos live in phones, signatures are missing, asset details are unclear, and office staff repair the packet after the technician has moved on.
        </p>
      </section>

      <section className="section" id="pilot">
        <div className="section-heading">
          <div>
            <span className="section-kicker">THE FIRST PAID OFFER</span>
            <h2>30-Day Inspection Readiness & Closeout Pilot</h2>
          </div>
          <p>
            We work beside your current dispatch, billing, and inspection systems. The pilot is intentionally narrow so the result can be measured without a disruptive migration.
          </p>
        </div>

        <div className="pilot-layout">
          <div className="pilot-list">
            {pilotItems.map((item) => (
              <div className="pilot-item" key={item}>
                <CheckCircle2 size={20} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="pilot-metrics">
            <h3>What we measure</h3>
            <div className="metric"><span>01</span><p>First-pass packet completeness</p></div>
            <div className="metric"><span>02</span><p>Minutes of office rework per job</p></div>
            <div className="metric"><span>03</span><p>Field completion to customer-ready report</p></div>
            <div className="metric"><span>04</span><p>Deficiency documentation to quote-ready handoff</p></div>
          </div>
        </div>
      </section>

      <section className="section section-dark" id="process">
        <div className="section-heading light">
          <div>
            <span className="section-kicker">A PRACTICAL SIDECAR</span>
            <h2>Capture the right evidence. Review exceptions. Issue a stronger packet.</h2>
          </div>
          <p>
            The pilot does not claim to interpret code or guarantee compliance. It improves documentation completeness, consistency, reviewability, and operational visibility.
          </p>
        </div>

        <div className="evidence-grid">
          {evidenceItems.map(({ icon: Icon, label }) => (
            <div className="evidence-card" key={label}>
              <Icon size={24} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section founder-section">
        <div className="founder-card">
          <div className="founder-badge">MH</div>
          <div>
            <span className="section-kicker">FOUNDER-LED LOCAL PILOT</span>
            <h2>Built around the real handoff between field work and customer delivery.</h2>
            <p>
              I’m Michael “Mikey” Hughes, a Sacramento-area technical builder with field-service, systems, networking, and workflow experience. The first pilots are delivered hands-on so the repeatable work can be understood before it is automated.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <span className="section-kicker">TWO LOCAL PILOT OPENINGS</span>
          <h2>Start with a short workflow conversation.</h2>
          <p>
            Tell me which inspection or service-closeout workflow creates the most office correction. We can determine whether a bounded paid pilot is a fit without replacing the systems your team already uses.
          </p>
        </div>
        <div className="contact-actions">
          <a className="button button-primary button-large" href={`mailto:enterthefieldmichael@gmail.com?subject=${mailSubject}&body=${mailBody}`}>
            <Mail size={20} /> enterthefieldmichael@gmail.com
          </a>
          <a className="button button-outline button-large" href="tel:+15308385844">
            <Phone size={20} /> 530-838-5844
          </a>
        </div>
      </section>

      <footer>
        <div>
          <strong>Inspection Readiness & Closeout Pilot</strong>
          <span>Michael “Mikey” Hughes · Sacramento Area, California</span>
        </div>
        <p>
          This service supports documentation completeness and workflow consistency. It does not provide legal advice, code interpretation, certification, or a guarantee of regulatory compliance, safety, or audit acceptance.
        </p>
      </footer>
    </main>
  )
}

export default App
