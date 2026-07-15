import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  ListChecks,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
  UserCheck,
  XCircle,
} from 'lucide-react'
import './enhancements.css'

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

const fitItems = [
  'Regional fire sprinkler, alarm, extinguisher, suppression, or integrated life-safety contractor',
  'At least 5 field technicians or roughly 50 recurring closeout packets per month',
  'Office staff re-enter, chase, verify, or repair evidence after field completion',
  'A current dispatch, billing, or inspection system that should remain in place',
]

const notFitItems = [
  'A one-person shop with little recurring commercial inspection work',
  'A request for automated code interpretation or a compliance guarantee',
  'A full replacement for scheduling, dispatch, invoicing, inventory, or CRM',
]

const customerProvides = [
  'One inspection or service-closeout workflow',
  'Current blank form or checklist',
  '10–20 redacted historical packets',
  'A technician qualification list relevant to the pilot',
  'One manager who can approve the mapped workflow',
]

const timeline = [
  ['Week 1', 'Baseline and workflow mapping', 'Review sample packets, define required evidence, and agree on the baseline measurements.'],
  ['Weeks 2–3', 'Guided live processing', 'Use the mapped checklist and exception process on a bounded set of jobs with human review.'],
  ['Week 4', 'Results and next decision', 'Deliver completed packets, a before-and-after findings report, and an optional recurring plan.'],
]

const faqs = [
  {
    question: 'Does this replace our current inspection or field-service software?',
    answer: 'No. The pilot is a narrow sidecar between field completion and customer-ready closeout. Your current dispatch, inspection, billing, accounting, and CRM systems stay in place.',
  },
  {
    question: 'Do you certify that our work is code-compliant?',
    answer: 'No. Your licensed personnel remain responsible for inspection judgment, code interpretation, certifications, filings, and final compliance decisions. The pilot improves documentation completeness, consistency, and reviewability.',
  },
  {
    question: 'What information do we have to share?',
    answer: 'The pilot begins with one current form, a small set of redacted historical packets, the relevant technician qualification list, and one live workflow. Do not send passwords, payment-card data, or unrelated personal information.',
  },
  {
    question: 'How much time does our team need to spend?',
    answer: 'Plan for one short kickoff, access to the sample materials, brief workflow clarification, and a weekly check-in. The process is designed to reduce—not add to—office administration.',
  },
  {
    question: 'What happens after the 30 days?',
    answer: 'You receive the completed pilot deliverables and findings report. Continuing monthly is optional and is recommended only when the measured workflow value supports it. The pilot does not require an annual contract.',
  },
  {
    question: 'How is pilot data handled?',
    answer: 'Access is limited to the pilot workflow, customer exports are supported, and retention or deletion is agreed during onboarding. A written data-handling summary is provided before real documents are accepted.',
  },
]

const mailSubject = encodeURIComponent('20-minute inspection workflow review')
const mailBody = encodeURIComponent(
  'Hi Michael,\n\nI would like to schedule a short workflow review for the Inspection Readiness & Closeout Pilot.\n\nCompany:\nInspection or service workflow:\nApproximate packets per month:\nBest phone number:\n\nThank you,',
)

function App() {
  const samplePacketUrl = `${import.meta.env.BASE_URL}sample-packet.html`

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
          <a href="#faq">FAQ</a>
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
              Request a 20-minute workflow review <ArrowRight size={18} />
            </a>
            <a className="button button-secondary" href={samplePacketUrl} target="_blank" rel="noreferrer">
              <FileText size={18} /> View sample packet
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
            <div className="packet-photo-row"><div /><div /><div /></div>
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

      <section className="section fit-section" id="fit">
        <div className="section-heading">
          <div>
            <span className="section-kicker">A NARROW, TESTABLE FIT</span>
            <h2>Designed for inspection-led regional contractors—not every field-service business.</h2>
          </div>
          <p>
            The first pilot is deliberately constrained so we can measure a real handoff without asking your company to adopt another all-in-one platform.
          </p>
        </div>
        <div className="fit-grid">
          <article className="fit-card fit-positive">
            <div className="card-title"><Building2 size={24} /><h3>Likely a strong fit</h3></div>
            {fitItems.map((item) => <p key={item}><CheckCircle2 size={18} />{item}</p>)}
          </article>
          <article className="fit-card fit-negative">
            <div className="card-title"><XCircle size={24} /><h3>Not the first fit</h3></div>
            {notFitItems.map((item) => <p key={item}><XCircle size={18} />{item}</p>)}
          </article>
        </div>
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

        <div className="sample-callout">
          <div>
            <span className="section-kicker">FICTIONAL DEMONSTRATION</span>
            <h3>See what a complete, indexed closeout packet could look like.</h3>
            <p>The public sample uses invented company, customer, site, technician, equipment, and deficiency details. It demonstrates structure—not a required inspection form or code standard.</p>
          </div>
          <a className="button button-outline" href={samplePacketUrl} target="_blank" rel="noreferrer">
            Open sample packet <ExternalLink size={18} />
          </a>
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

      <section className="section scope-section" id="scope">
        <div className="section-heading">
          <div>
            <span className="section-kicker">CLEAR INPUTS AND TIMELINE</span>
            <h2>A bounded pilot your team can understand before it begins.</h2>
          </div>
          <p>The engagement starts with redacted examples and one current workflow. We do not need broad access to your company systems to determine whether the closeout process can be improved.</p>
        </div>
        <div className="scope-grid">
          <article className="scope-card">
            <div className="card-title"><ListChecks size={24} /><h3>What your team provides</h3></div>
            {customerProvides.map((item) => <p key={item}><CheckCircle2 size={17} />{item}</p>)}
          </article>
          <article className="scope-card timeline-card">
            <div className="card-title"><Clock3 size={24} /><h3>How the 30 days run</h3></div>
            {timeline.map(([week, title, copy]) => (
              <div className="timeline-item" key={week}>
                <span>{week}</span><div><strong>{title}</strong><p>{copy}</p></div>
              </div>
            ))}
          </article>
        </div>
      </section>

      <section className="data-band" aria-label="Pilot data handling summary">
        <div><LockKeyhole size={30} /></div>
        <div>
          <span className="section-kicker">PILOT DATA HANDLING</span>
          <h2>Collect only what the workflow needs.</h2>
          <p>Begin with redacted historical packets. Access, storage, retention, export, and deletion are documented before live customer materials are accepted. Do not send passwords, payment-card data, or unrelated personal records.</p>
        </div>
      </section>

      <section className="section founder-section">
        <div className="founder-card">
          <div className="founder-badge">MH</div>
          <div>
            <span className="section-kicker">FOUNDER-LED LOCAL PILOT</span>
            <h2>Built around the real handoff between field work and customer delivery.</h2>
            <p>
              I’m Michael W. Hughes, a Sacramento-area technical builder with field-service, systems, networking, and workflow experience. The first pilots are delivered hands-on so the repeatable work can be understood before it is automated.
            </p>
            <div className="founder-contact">
              <span><MapPin size={17} /> Sacramento Area, California</span>
              <a href="tel:+15308385844"><Phone size={17} /> 530-838-5844</a>
              <a href="mailto:enterthefieldmichael@gmail.com"><Mail size={17} /> enterthefieldmichael@gmail.com</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading">
          <div>
            <span className="section-kicker">COMMON QUESTIONS</span>
            <h2>Know exactly what the pilot is—and what it is not.</h2>
          </div>
          <p>A short workflow conversation comes first. The paid pilot is proposed only when there is a bounded process, a measurable baseline, and a clear operational owner.</p>
        </div>
        <div className="faq-list">
          {faqs.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <span className="section-kicker">TWO LOCAL PILOT OPENINGS</span>
          <h2>Start with a 20-minute workflow review.</h2>
          <p>
            Tell me which inspection or service-closeout workflow creates the most office correction. We can determine whether a bounded paid pilot is a fit without replacing the systems your team already uses.
          </p>
        </div>
        <div className="contact-actions">
          <a className="button button-primary button-large" href={`mailto:enterthefieldmichael@gmail.com?subject=${mailSubject}&body=${mailBody}`}>
            <Mail size={20} /> Request the workflow review
          </a>
          <a className="button button-outline button-large" href="tel:+15308385844">
            <Phone size={20} /> 530-838-5844
          </a>
          <a className="quiet-link" href={samplePacketUrl} target="_blank" rel="noreferrer">View the fictional sample packet <ExternalLink size={15} /></a>
        </div>
      </section>

      <footer>
        <div>
          <strong>Inspection Readiness & Closeout Pilot</strong>
          <span>Michael W. Hughes · Sacramento Area, California</span>
          <span>530-838-5844 · enterthefieldmichael@gmail.com</span>
        </div>
        <p>
          This service supports documentation completeness and workflow consistency. It does not provide legal advice, code interpretation, certification, or a guarantee of regulatory compliance, safety, or audit acceptance.
        </p>
      </footer>
    </main>
  )
}

export default App
