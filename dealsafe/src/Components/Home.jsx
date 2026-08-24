import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Camera,
  ChevronDown,
  CircleCheck,
  Clock3,
  FileCheck2,
  LockKeyhole,
  Menu,
  MessageCircle,
  PackageCheck,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Users,
  X,
  Zap,
} from "lucide-react";

// How-it-works and safety content used by the landing page and mobile pages.
// Content data: update these arrays to change repeated cards and FAQ entries.
const steps = [
  [
    "01",
    "Create the deal",
    "Add the item, agreed amount, seller contact and terms.",
  ],
  [
    "02",
    "Seller accepts",
    "The seller checks the details and accepts your invitation.",
  ],
  [
    "03",
    "Pay securely",
    "Fund the deal and we confirm that payment is secured.",
  ],
  [
    "04",
    "Receive & release",
    "Confirm delivery. Payment then becomes eligible for release.",
  ],
];
const safety = [
  [
    LockKeyhole,
    "Secure authentication",
    "Account protection and verified user sessions.",
  ],
  [
    Banknote,
    "Protected payment flow",
    "Sensitive payment actions are handled securely.",
  ],
  [
    FileCheck2,
    "Transaction records",
    "Every important action is recorded for clarity.",
  ],
  [
    Scale,
    "Dispute support",
    "Payments can remain locked while a dispute is reviewed.",
  ],
  [
    PackageCheck,
    "Evidence upload",
    "Keep photos, screenshots, receipts and delivery evidence together.",
  ],
  [
    ShieldCheck,
    "Privacy",
    "Your personal and transaction information is treated securely.",
  ],
];
const useCases = [
  "Phones & electronics",
  "Fashion",
  "Sneakers",
  "Furniture",
  "Gadgets",
  "Freelance services",
  "Social media purchases",
  "Person-to-person deals",
];
const faqs = [
  [
    "What is DealSafe?",
    "DealSafe is a transaction protection platform for buyers and sellers who have already found each other online. We hold the payment flow together until the agreed deal is completed.",
  ],
  [
    "Is DealSafe a marketplace?",
    "No. DealSafe does not list products or match buyers with sellers. Start with a conversation on TikTok, Instagram, WhatsApp, Facebook Marketplace or elsewhere, then move the transaction here.",
  ],
  [
    "Can I use DealSafe for something I found on TikTok or Instagram?",
    "Yes. DealSafe is designed for deals that begin on social platforms. Create a transaction before sending money directly to someone you do not know.",
  ],
  [
    "Who creates the transaction?",
    "Either the buyer or seller can create it. The other person receives an invitation to review and accept the agreed details.",
  ],
  [
    "When does the seller get paid?",
    "After the seller delivers and the buyer confirms that the deal is complete, the payment becomes eligible for release.",
  ],
  [
    "What happens if the seller does not deliver?",
    "Raise a dispute. Payment release is paused while both sides provide evidence and the transaction is reviewed.",
  ],
  [
    "What happens if the buyer refuses to confirm delivery?",
    "The seller can provide delivery evidence and raise a dispute so the situation can be reviewed fairly.",
  ],
  [
    "Can a seller reject a transaction?",
    "Yes. Sellers can review the details and reject or ask for changes before accepting.",
  ],
  [
    "Does DealSafe support disputes?",
    "Yes. A dispute process helps both parties share evidence and reach an appropriate resolution.",
  ],
  [
    "How much does DealSafe cost?",
    "The deal protection fee is shown clearly before funding. There is no monthly subscription or marketplace listing fee.",
  ],
];
const mobileLinks = [
  ["Safety", "/safety"],
  ["Fees", "/fees"],
  ["FAQ", "/faq"],
];

// Shared navigation and display components.
// Shared UI primitives used across the landing page and detail pages.
function Logo() {
  return (
    <a className="logo" href="#top" aria-label="DealSafe home">
      <span className="logo-mark">
        <ShieldCheck size={19} />
      </span>
      <span>
        Deal<span>Safe</span>
      </span>
    </a>
  );
}
function Button({ children, secondary = false, href = "#create" }) {
  return (
    <a className={`button ${secondary ? "button-secondary" : ""}`} href={href}>
      {children}
      {!secondary && <ArrowRight size={17} />}
    </a>
  );
}
function SectionIntro({ eyebrow, title, text }) {
  return (
    <div className="section-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {text && <p className="section-copy">{text}</p>}
    </div>
  );
}
function TransactionCard() {
  return (
    <div className="transaction-card">
      <div className="transaction-top">
        <span className="mini-label">DEALSAFE TRANSACTION</span>
        <span className="secure-pill">
          <LockKeyhole size={12} /> Secure
        </span>
      </div>
      <div className="transaction-product">
        <div className="phone-icon">
          <Smartphone size={28} />
        </div>
        <div>
          <strong>iPhone 15 Pro</strong>
          <small>Personal purchase</small>
        </div>
        <b>GHS 8,000</b>
      </div>
      <div className="protected">
        <div className="protected-icon">
          <ShieldCheck size={18} />
        </div>
        <div>
          <small>STATUS</small>
          <strong>Money protected</strong>
        </div>
        <BadgeCheck size={22} />
      </div>
      <div className="progress-list">
        {[
          "Deal created",
          "Seller accepted",
          "Payment secured",
          "Awaiting delivery",
          "Payment released",
        ].map((item, index) => (
          <div
            className={`progress-item ${index < 3 ? "done" : index === 3 ? "active" : ""}`}
            key={item}
          >
            <span>
              {index < 3 ? (
                <CircleCheck size={18} />
              ) : index === 3 ? (
                <Clock3 size={17} />
              ) : (
                <span className="empty-dot" />
              )}
            </span>
            <span>{item}</span>
            {index === 3 && <small>In progress</small>}
          </div>
        ))}
      </div>
      <div className="card-foot">
        <span>
          <Users size={14} /> Buyer + seller connected
        </span>
        <span>•••</span>
      </div>
    </div>
  );
}

// Mobile-only detail pages for Safety, Fees, and FAQ.
// Mobile-only detail pages for Safety, Fees, and FAQ.
function MobileDetailPage({ type }) {
  const page =
    type === "safety"
      ? {
          eyebrow: "Your protection",
          title: "Built around safer transactions",
          text: "The important details stay visible, recorded and easy to understand.",
          icon: ShieldCheck,
        }
      : type === "fees"
        ? {
            eyebrow: "Clear before you commit",
            title: "Simple, transparent pricing",
            text: "Protection should not come with surprises. Your final fee is shown before a transaction is funded.",
            icon: Banknote,
          }
        : {
            eyebrow: "Questions, answered",
            title: "Good to know",
            text: "A few things people ask before their first protected deal.",
            icon: MessageCircle,
          };
  const PageIcon = page.icon;
  return (
    <div className="mobile-detail">
      <header className="mobile-detail-header">
        <a className="back-link" href="/">
          <ArrowRight size={17} /> Back to DealSafe
        </a>
        <Logo />
      </header>
      <main>
        <div className="mobile-detail-hero">
          <div className="detail-icon">
            <PageIcon size={23} />
          </div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.text}</p>
        </div>
        {type === "safety" && (
          <div className="mobile-detail-list">
            {safety.map(([Icon, title, text]) => (
              <article className="mobile-info-card" key={title}>
                <div className="safety-icon">
                  <Icon size={21} />
                </div>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        )}
        {type === "fees" && (
          <div className="mobile-fee-detail">
            <div className="fee-head">
              <div className="fee-icon">
                <Banknote size={23} />
              </div>
              <span>DEAL PROTECTION FEE</span>
            </div>
            <h2>A small percentage of each successfully funded transaction.</h2>
            <div className="fee-items">
              <span>
                <CircleCheck /> No monthly subscription
              </span>
              <span>
                <CircleCheck /> No marketplace listing fee
              </span>
              <span>
                <CircleCheck /> Fee clearly shown before payment
              </span>
              <span>
                <CircleCheck /> No hidden charges
              </span>
            </div>
            <small>
              Final fees will be displayed before a transaction is funded.
            </small>
          </div>
        )}
        {type === "faq" && (
          <div className="faq-list mobile-faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        )}
      </main>
      <div className="mobile-detail-cta">
        <Button>Create a safe deal</Button>
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navLinks = [
    ["How it works", "#how-it-works"],
    ["Why DealSafe", "#protection"],
    ["Safety", "#safety"],
    ["Fees", "#fees"],
    ["FAQ", "#faq"],
  ];
  const mobileNavLinks = [
    ["How it works", "#how-it-works"],
    ["Why DealSafe", "#protection"],
    ...mobileLinks,
  ];
  const mobilePage = window.location.pathname.replace("/", "");
  if (
    window.matchMedia("(max-width: 560px)").matches &&
    mobileLinks.some(([label]) => label.toLowerCase() === mobilePage)
  )
    return <MobileDetailPage type={mobilePage} />;
  return (
    <div id="top" className="site-shell">
      {/* Sticky navigation and responsive mobile menu. */}
      {/* Sticky navigation and mobile menu. */}
      <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="container nav-inner">
          <Logo />
          <nav className="desktop-nav">
            {navLinks.map(([label, href]) => (
              <a href={href} key={label}>
                {label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <a className="button button-secondary login-button" href="/login">
              Log in
            </a>
            <Button>Create a deal</Button>
          </div>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav">
            {mobileNavLinks.map(([label, href]) => (
              <a href={href} onClick={() => setMenuOpen(false)} key={label}>
                {label}
              </a>
            ))}
            <a className="button button-secondary login-button" href="/login">Log in</a>
            <Button>Create a deal</Button>
          </nav>
        )}
      </header>
      <main>
        {/* Hero: primary value proposition and transaction preview. */}
        {/* Hero: primary message and transaction preview. */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="announcement">
                <span>
                  <Sparkles size={14} /> Built for deals that start online
                </span>
                <ArrowRight size={14} />
              </div>
              <h1>
                Buy from anyone online. <em>Pay with confidence.</em>
              </h1>
              <p>
                DealSafe protects your money when buying from sellers on TikTok,
                Instagram, WhatsApp and other social platforms. Your money is
                only released after the deal is successfully completed.
              </p>
              <div className="hero-buttons">
                <Button>Create a safe deal</Button>
                <Button secondary href="#how-it-works">
                  See how it works <ArrowRight size={17} />
                </Button>
              </div>
              <div className="trust-line">
                <div className="avatar-stack">
                  <span>AK</span>
                  <span>KM</span>
                  <span>YA</span>
                </div>
                <span>
                  <strong>Simple protection</strong>
                  <br />
                  No direct payment to strangers.
                </span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="visual-caption">
                <span className="live-dot" /> Live transaction preview
              </div>
              <TransactionCard />
              <div className="floating-note note-one">
                <CircleCheck size={18} />
                <span>
                  <strong>Payment secured</strong>
                  <small>Just now</small>
                </span>
              </div>
              <div className="floating-note note-two">
                <Zap size={17} />
                <span>
                  <strong>Ready when you are</strong>
                  <small>Start in under 2 minutes</small>
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* Trust platforms: secondary context for the desktop landing page. */}
        {/* Trust context: hidden on small screens to keep the landing page focused. */}
        <section className="trust-section mobile-secondary-section">
          <div className="container trust-wrap">
            <div>
              <p className="eyebrow">Already found each other?</p>
              <h2>A safer way to buy from people you meet online.</h2>
            </div>
            <div className="platforms">
              <span>
                <MessageCircle /> WhatsApp
              </span>
              <span>
                <Camera /> Instagram
              </span>
              <span>
                <Users /> Facebook
              </span>
              <span className="tiktok-word">TikTok</span>
              <span>
                <Store /> Online sellers
              </span>
            </div>
            <p>
              Found something you want to buy on social media? Move the
              transaction to DealSafe before sending your money.
            </p>
          </div>
        </section>
        {/* How it works: the four-step transaction flow. */}
        {/* How it works: the four essential transaction steps. */}
        <section id="how-it-works" className="section">
          <div className="container">
            <SectionIntro
              eyebrow="The simple way to transact"
              title="How DealSafe works"
              text="From agreement to payment release in four clear steps."
            />
            <div className="steps-grid">
              {steps.map(([number, title, text], index) => {
                const Icon = [FileCheck2, Users, LockKeyhole, PackageCheck][
                  index
                ];
                return (
                  <div className="step-card" key={number}>
                    <div className="step-number">{number}</div>
                    <div className="step-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    {index < 3 && <span className="step-line" />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* Buyer protection: why payment should not be sent directly. */}
        {/* Protection: the core reason to use DealSafe. */}
        <section id="protection" className="protection-section">
          <div className="container protection-grid">
            <div className="protection-art">
              <div className="shield-orbit">
                <ShieldCheck size={58} />
              </div>
              <div className="orbit-label label-a">Payment held safely</div>
              <div className="orbit-label label-b">Deal evidence</div>
              <div className="orbit-label label-c">Buyer confirmed</div>
            </div>
            <div className="protection-copy">
              <p className="eyebrow">A better safety net</p>
              <h2>Stop sending money directly to strangers.</h2>
              <p>
                When buying from an unfamiliar seller online, DealSafe provides
                an extra layer of transaction protection, so everyone knows what
                happens next.
              </p>
              <div className="benefit-list">
                {[
                  "Payment confirmation before delivery",
                  "Funds protected during the transaction",
                  "Clear records and activity history",
                  "Delivery confirmation and dispute support",
                ].map((item) => (
                  <span key={item}>
                    <CircleCheck size={17} />
                    {item}
                  </span>
                ))}
              </div>
              <Button>Protect my next purchase</Button>
            </div>
          </div>
        </section>
        {/* Buyer and seller audience benefits. */}
        {/* Audience benefits for buyers and sellers. */}
        <section className="section audience-section">
          <div className="container">
            <div className="audience-grid">
              <div className="audience-card buyer">
                <p className="eyebrow">For buyers</p>
                <h2>Buy with confidence.</h2>
                <p>
                  You found the perfect item. Keep your money protected while
                  the seller gets it to you.
                </p>
                <ul>
                  {[
                    "Create a transaction yourself",
                    "Invite any seller",
                    "Keep proof of your agreement",
                    "Confirm delivery before release",
                    "Raise a dispute if needed",
                  ].map((item) => (
                    <li key={item}>
                      <CircleCheck size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button>Create a deal</Button>
              </div>
              <div className="audience-card seller">
                <p className="eyebrow">For sellers</p>
                <h2>Sell without worrying about fake buyers.</h2>
                <p>
                  Know when a buyer has funded the transaction before you
                  package and deliver.
                </p>
                <ul>
                  {[
                    "Know when the buyer has funded",
                    "Receive confirmation before delivering",
                    "Build trusted transaction history",
                    "Get paid after successful completion",
                  ].map((item) => (
                    <li key={item}>
                      <CircleCheck size={17} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button secondary href="#faq">
                  Learn about selling <ArrowRight size={17} />
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Detailed transaction flow: hidden on small landing pages. */}
        {/* Detailed flow: secondary content hidden on small screens. */}
        <section className="flow-section mobile-secondary-section">
          <div className="container">
            <SectionIntro
              eyebrow="One clear path"
              title="From conversation to completion"
            />
            <div className="flow-row">
              {[
                "Agree on social media",
                "Create DealSafe transaction",
                "Buyer pays",
                "Payment secured",
                "Seller delivers",
                "Buyer confirms",
                "Seller gets paid",
              ].map((item, index) => {
                const Icon = [
                  MessageCircle,
                  FileCheck2,
                  Banknote,
                  LockKeyhole,
                  PackageCheck,
                  BadgeCheck,
                  Banknote,
                ][index];
                return (
                  <div className="flow-item" key={item}>
                    <div
                      className={`flow-icon ${index === 6 ? "flow-final" : ""}`}
                    >
                      <Icon size={20} />
                    </div>
                    <span>{item}</span>
                    {index < 6 && (
                      <ArrowRight className="flow-arrow" size={16} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* Safety preview on mobile, full safety grid on desktop. */}
        {/* Safety: desktop grid and compact mobile preview. */}
        <section id="safety" className="section safety-section">
          <div className="container">
            <SectionIntro
              eyebrow="Designed with care"
              title="Built around safer transactions"
              text="The important details stay visible, recorded and easy to understand."
            />
            <div className="mobile-section-preview">
              <p>
                Secure authentication, protected payment flow, transaction
                records and dispute support in one clear safety layer.
              </p>
              <a className="text-button" href="/safety">
                View all safety features <ArrowRight size={16} />
              </a>
            </div>
            <div className="safety-grid">
              {safety.map(([Icon, title, text]) => (
                <div className="safety-card" key={title}>
                  <div className="safety-icon">
                    <Icon size={21} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Fees preview on mobile, full pricing card on desktop. */}
        {/* Fees: desktop pricing card and compact mobile preview. */}
        <section id="fees" className="fees-section">
          <div className="container fees-grid">
            <div>
              <p className="eyebrow">Clear before you commit</p>
              <h2>Simple, transparent pricing.</h2>
              <p>
                Protection should not come with surprises. Your final fee is
                shown before a transaction is funded.
              </p>
              <div className="mobile-section-preview">
                <p>
                  A small, clearly displayed protection fee on successfully
                  funded transactions. No subscriptions or hidden charges.
                </p>
                <a className="text-button" href="/fees">
                  View fee details <ArrowRight size={16} />
                </a>
              </div>
            </div>
            <div className="fee-card">
              <div className="fee-head">
                <div className="fee-icon">
                  <Banknote size={23} />
                </div>
                <span>DEAL PROTECTION FEE</span>
              </div>
              <h3>
                A small percentage of each successfully funded transaction.
              </h3>
              <div className="fee-items">
                <span>
                  <CircleCheck /> No monthly subscription
                </span>
                <span>
                  <CircleCheck /> No marketplace listing fee
                </span>
                <span>
                  <CircleCheck /> Fee shown before payment
                </span>
                <span>
                  <CircleCheck /> No hidden charges
                </span>
              </div>
              <small>
                Final fees will be displayed before a transaction is funded.
              </small>
            </div>
          </div>
        </section>
        {/* Example use cases, not marketplace listings. */}
        {/* Example use cases, not marketplace listings. */}
        <section className="section use-section">
          <div className="container">
            <SectionIntro
              eyebrow="For real life"
              title="Made for everyday online deals"
              text="These are examples, not listings. DealSafe stays between you and the person you already found."
            />
            <div className="use-grid">
              {useCases.map((item, index) => (
                <div className="use-card" key={item}>
                  <span>0{index + 1}</span>
                  <h3>{item}</h3>
                  <ArrowRight size={18} />
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Dispute process and payment safety warning. */}
        {/* Dispute process and payment warning. */}
        <section className="dispute-section">
          <div className="container dispute-grid">
            <div>
              <p className="eyebrow">When plans change</p>
              <h2>What if something goes wrong?</h2>
              <p>
                Problems happen. DealSafe gives both sides a clear process to
                pause the payment and share what happened.
              </p>
            </div>
            <div className="dispute-flow">
              {[
                "Buyer or seller raises a dispute",
                "Payment release is paused",
                "Both parties provide evidence",
                "DealSafe reviews the transaction",
                "An appropriate resolution is made",
              ].map((item, index) => (
                <div className="dispute-step" key={item}>
                  <span>{index + 1}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="container warning">
            <Zap size={19} />
            <span>
              <strong>Keep the protection intact:</strong> Never complete
              payments outside DealSafe for a transaction created on the
              platform.
            </span>
          </div>
        </section>
        {/* FAQ preview on mobile, accordion on desktop. */}
        {/* FAQ: desktop accordion and mobile detail-page link. */}
        <section id="faq" className="section faq-section">
          <div className="container faq-grid">
            <SectionIntro
              eyebrow="Questions, answered"
              title="Good to know"
              text="A few things people ask before their first protected deal."
            />
            <div className="mobile-section-preview">
              <p>
                Learn how DealSafe works, when sellers get paid, what happens
                during a dispute and more.
              </p>
              <a className="text-button" href="/faq">
                View all FAQs <ArrowRight size={16} />
              </a>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer], index) => (
                <div
                  className={`faq-item ${openFaq === index ? "faq-open" : ""}`}
                  key={question}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  >
                    <span>{question}</span>
                    <ChevronDown size={19} />
                  </button>
                  <div className="faq-answer">
                    <p>{answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Final conversion call to action. */}
        {/* Final conversion call to action. */}
        <section id="create" className="final-cta">
          <div className="container final-inner">
            <div>
              <p className="eyebrow">Ready when you are</p>
              <h2>
                Your next online deal doesn't have to depend on trust alone.
              </h2>
              <p>
                Protect your transaction before sending money to someone you
                don't know.
              </p>
            </div>
            <div className="hero-buttons">
              <Button>Create a safe deal</Button>
              <Button secondary href="#how-it-works">
                How it works <ArrowRight size={17} />
              </Button>
            </div>
          </div>
        </section>
      </main>
      {/* Footer: full link columns on desktop, compact identity on mobile. */}
      {/* Footer: full links on desktop and compact identity on mobile. */}
      <footer id="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>Safer payments for deals that start online.</p>
            <div className="socials">
              <a href="#footer" aria-label="Instagram">
                <Camera size={17} />
              </a>
              <a href="#footer" aria-label="Facebook">
                <Users size={17} />
              </a>
              <a href="#footer" aria-label="WhatsApp">
                <MessageCircle size={17} />
              </a>
            </div>
          </div>
          {[
            ["Product", "How it works", "Fees", "Safety", "FAQ"],
            ["Company", "About", "Contact", "Help center"],
            [
              "Legal",
              "Terms of service",
              "Privacy policy",
              "Dispute policy",
              "Refund policy",
            ],
            ["Account", "Log in", "Sign up"],
          ].map(([title, ...links]) => (
            <div className="footer-column" key={title}>
              <strong>{title}</strong>
              {links.map((link) => (
                <a href="#top" key={link}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="container footer-bottom">
          <span>© 2026 DealSafe. All rights reserved.</span>
          <span>
            Made for safer online deals in Ghana{" "}
            <span className="ghana-dot">●</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
