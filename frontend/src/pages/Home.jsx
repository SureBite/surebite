import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Download,
  ListChecks,
  Printer,
  QrCode,
  ScanText,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { DietaryMark } from '../components/DishCard'
import Navbar, { Logo } from '../components/Navbar'
import Reveal from '../components/Reveal'

const STEPS = [
  { icon: Camera, title: 'Upload', text: 'Photograph your existing menu. No need to type every dish.' },
  { icon: Sparkles, title: 'Extract', text: 'AI reads dishes, descriptions and prices, and suggests allergen tags.' },
  { icon: ShieldCheck, title: 'Verify & publish', text: 'Your team checks every dish before anything goes public.' },
  { icon: QrCode, title: 'Create your QR', text: 'Download a printable QR card for your restaurant tables.' },
  { icon: SlidersHorizontal, title: 'Let guests explore', text: 'Guests choose dietary preferences and allergens to avoid.' },
]

const RESTAURANT_POINTS = [
  { icon: ScanText, title: 'Start with what you have', text: 'Upload a legible photo instead of rebuilding your paper menu from scratch.' },
  { icon: ListChecks, title: 'Keep review in one place', text: 'Check dishes, ingredients, prices and all 14 allergen groups side by side.' },
  { icon: Printer, title: 'Ready for your tables', text: 'Download your published menu’s QR as PNG or SVG, or print a table-tent card.' },
]

const GUEST_POINTS = [
  { title: 'No extra steps', text: 'No app install or account stands between a guest and your menu.' },
  { title: 'Choices that make sense', text: 'Choose All, Veg or Non-Veg, then select allergens to avoid.' },
  { title: 'Information, not a guarantee', text: 'Hide conflicting dishes or mark them clearly. Always speak to your server about allergies.' },
]

const FAQS = [
  {
    q: 'Does AI decide which allergens are present?',
    a: 'AI suggests tags from the menu. Restaurant staff review the recipes and confirm every dish before publishing.',
  },
  { q: 'Will guests need an app or account?', a: 'No. A scan opens your published menu in their mobile browser.' },
  {
    q: 'Does a filtered dish mean it is allergy-free?',
    a: 'No. “Matches your filters” means no selected allergens are listed. Cross-contact may occur, so guests should always speak to their server.',
  },
  {
    q: 'Can I use the paper menu I already have?',
    a: 'Yes. Upload a clear photo with readable dish names, descriptions and prices. Check the extracted information against the original.',
  },
]

function Chip({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white">
      <Check size={11} aria-hidden="true" /> {children}
    </span>
  )
}

function PreviewCard({ title, dish, className = '' }) {
  return (
    <div className={`card w-full max-w-xs p-5 shadow-lg ${className}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted">Saffron Table · Dinner menu</p>
      <p className="mt-2 font-serif text-2xl">{title}</p>
      <div className="mt-3 flex gap-2">
        <Chip>Dairy</Chip>
        <Chip>Gluten</Chip>
      </div>
      <p className="mt-3 text-xs text-brand">2 dishes match your filters</p>
      <div className="mt-3 rounded-xl bg-cream p-3">
        <DietaryMark dietaryType={dish.dietaryType} />
        <div className="mt-1 flex justify-between text-sm font-semibold">
          <span>{dish.name}</span>
          <span>{dish.price}</span>
        </div>
        <p className="mt-1 text-xs text-muted">{dish.description}</p>
        {dish.contains && <p className="mt-1 text-xs font-semibold">Contains: {dish.contains}</p>}
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted">
          <Check size={11} aria-hidden="true" /> Staff verified
        </p>
      </div>
      <p className="mt-3 text-[11px] text-muted">Cross-contact may occur. Please tell your server about your allergies.</p>
    </div>
  )
}

function FaqItem({ faq, open, onToggle }) {
  const id = useId()
  return (
    <div
      className={`rounded-xl border bg-white transition-colors duration-200 ${
        open ? 'border-brand/40 shadow-sm' : 'border-line hover:border-brand-tint'
      }`}
    >
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className={`font-sans text-[15px] font-semibold transition-colors ${open ? 'text-ink' : 'text-muted'}`}>{faq.q}</span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-ink transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{faq.a}</p>
        </div>
      </div>
    </div>
  )
}

function FaqList() {
  const [openIndex, setOpenIndex] = useState(0)
  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-3">
      {FAQS.map((faq, index) => (
        <Reveal key={faq.q} delay={index * 100}>
          <FaqItem faq={faq} open={openIndex === index} onToggle={() => setOpenIndex(openIndex === index ? -1 : index)} />
        </Reveal>
      ))}
    </div>
  )
}

function Home() {
  return (
    <div className="bg-cream">
      <Navbar variant="public" />

      <main className="overflow-x-clip">
        <section className="page grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-12">
          <div>
            <span className="pill pill-green animate-fade-up uppercase tracking-wide">Thoughtful hospitality, clearer choices</span>
            <h1 className="mt-6 animate-fade-up text-5xl [animation-delay:80ms] leading-[1.05] text-brand sm:text-6xl xl:text-[4.25rem]">
              Your menu.
              <br />
              More welcoming
              <br />
              for everyone.
            </h1>
            <p className="mt-6 max-w-lg animate-fade-up text-base text-muted [animation-delay:160ms]">
              Turn a photo of your paper menu into a staff-verified digital menu. Help guests explore dishes, understand
              allergens and start a better conversation.
            </p>
            <div className="mt-7 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
              <Link to="/auth?mode=register" className="btn btn-primary">
                <ArrowRight size={16} aria-hidden="true" /> Create restaurant account
              </Link>
              <a href="#how-it-works" className="btn btn-secondary">
                See how it works
              </a>
            </div>
            <p className="mt-5 flex animate-fade-up items-center gap-2 text-xs text-muted [animation-delay:320ms]">
              <Smartphone size={14} aria-hidden="true" /> One QR code. No guest account. No app to install.
            </p>
          </div>

          <div
            className="flex min-h-[26rem] animate-scale-in lg:min-h-[30rem] items-end justify-end rounded-3xl bg-brand bg-cover bg-left p-6 [animation-delay:150ms] [animation-duration:0.7s]"
            style={{ backgroundImage: 'url(/images/food-table.jpg)' }}
            role="img"
            aria-label="Indian dishes served on a restaurant table"
          >
            <PreviewCard
              className="animate-float"
              title="Find your kind of dish."
              dish={{ dietaryType: 'veg', name: 'Chana masala', price: '₹220', description: 'Chickpeas, tomato, onion, sunflower oil and spices.' }}
            />
          </div>
        </section>

        <section className="bg-brand-soft">
          <div className="page flex flex-col justify-between gap-4 py-6 text-sm font-semibold sm:flex-row">
            <span className="flex items-center gap-2">
              <Camera size={16} aria-hidden="true" /> Start with your paper menu
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} aria-hidden="true" /> Reviewed by your team
            </span>
            <span className="flex items-center gap-2">
              <QrCode size={16} aria-hidden="true" /> Shared at every table
            </span>
          </div>
        </section>

        <section id="how-it-works" className="page scroll-mt-24 py-12 lg:py-14">
          <Reveal>
            <p className="eyebrow">From paper to table</p>
            <h2 className="mt-3 text-4xl">A familiar menu. A thoughtful new experience.</h2>
            <p className="mt-3 text-muted">Five simple steps, with your kitchen’s knowledge at the heart of the process.</p>
          </Reveal>

          <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, index) => (
              <Reveal as="li" variant="zoom" key={step.title} delay={index * 110} className="card card-hover group p-5">
                <div className="flex items-start justify-between text-muted">
                  <step.icon size={22} className="text-brand transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  <span className="text-[11px]">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-5 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </Reveal>
            ))}
          </ol>

          <Reveal variant="zoom" className="mt-8 grid items-center gap-8 rounded-3xl bg-brand-soft p-6 lg:grid-cols-[1fr_2fr] lg:p-8">
            <div>
              <h3 className="font-serif text-3xl leading-tight">AI gives you a head start. Your team has the final say.</h3>
              <p className="mt-4 text-sm text-muted">
                Compare the original menu with the extracted dishes. Correct ingredients, dietary types and allergen
                suggestions, then verify each item.
              </p>
              <p className="mt-4 text-sm font-semibold">No unverified drafts are public.</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between border-b border-line pb-4 text-sm font-semibold">
                <span>Dinner menu · Saffron Table</span>
                <span className="pill pill-amber">4 / 6 verified</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-4">
                <div>
                  <p className="text-sm font-semibold">Chana masala</p>
                  <p className="text-xs text-muted">No listed allergens</p>
                </div>
                <span className="pill pill-green">
                  <Check size={11} aria-hidden="true" /> Staff verified
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-4">
                <div>
                  <p className="text-sm font-semibold">Paneer tikka</p>
                  <p className="text-xs text-muted">Dairy</p>
                </div>
                <span className="pill pill-amber">AI inferred · Review needed</span>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="for-restaurants" className="scroll-mt-24 bg-white">
          <div className="page py-12 lg:py-14">
            <Reveal>
              <p className="eyebrow">For your restaurant</p>
              <h2 className="mt-3 text-4xl">Less retyping. More attention to the details.</h2>
              <p className="mt-3 text-muted">A practical workspace for turning menu information into a guest-facing experience.</p>
            </Reveal>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {RESTAURANT_POINTS.map((point, index) => (
                <Reveal key={point.title} delay={index * 140}>
                  <point.icon size={22} className="text-brand" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{point.title}</h3>
                  <p className="mt-2 text-sm text-muted">{point.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-14">
          <Reveal variant="left" className="flex justify-center rounded-3xl bg-brand-soft p-6">
            <PreviewCard
              title="Saffron Table"
              dish={{
                dietaryType: 'non_veg',
                name: 'Fish curry',
                price: '₹420',
                description: 'Fish, coconut milk, tomato and mustard seeds.',
                contains: 'Fish, Mustard',
              }}
            />
          </Reveal>
          <Reveal variant="right" delay={120}>
            <p className="eyebrow">For your guests</p>
            <h2 className="mt-3 text-4xl leading-tight">
              A little more clarity.
              <br />A more comfortable choice.
            </h2>
            <p className="mt-4 text-muted">Scan, browse and tailor the menu to personal preferences — right in the browser.</p>
            <ul className="mt-6 space-y-5">
              {GUEST_POINTS.map((point) => (
                <li key={point.title} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold">{point.title}</p>
                    <p className="mt-1 text-sm text-muted">{point.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="bg-brand text-white">
          <Reveal variant="zoom" className="page flex flex-col items-center py-12 text-center lg:py-14">
            <ShieldCheck size={30} aria-hidden="true" />
            <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-white/80">Our non-negotiable principle</p>
            <h2 className="mt-4 text-4xl text-white">AI Infers. Humans Verify. Diners Stay Safe.</h2>
            <p className="mt-5 max-w-3xl text-white/90">
              AI tags are preliminary suggestions, not the final word. Your restaurant staff must review every dish before
              publishing. Cross-contact guidance stays visible on every diner menu.
            </p>
          </Reveal>
        </section>

        <section className="page grid items-center gap-8 py-12 lg:grid-cols-[3fr_2fr] lg:py-14">
          <Reveal variant="left">
            <p className="eyebrow">A small card. A better conversation.</p>
            <h2 className="mt-3 text-3xl">Your published menu, within reach.</h2>
            <p className="mt-3 text-sm text-muted">
              Set your QR card on the table. Guests can explore dishes and allergen information while your team remains
              available for questions.
            </p>
          </Reveal>
          <Reveal as="ul" variant="right" delay={120} className="space-y-4 rounded-2xl bg-brand-soft p-6 text-sm">
            <li className="flex items-center gap-3">
              <QrCode size={16} aria-hidden="true" /> A public menu link, created after publishing
            </li>
            <li className="flex items-center gap-3">
              <Download size={16} aria-hidden="true" /> PNG and SVG downloads for your QR
            </li>
            <li className="flex items-center gap-3">
              <Printer size={16} aria-hidden="true" /> Printable table-tent layout for your restaurant
            </li>
          </Reveal>
        </section>

        <section id="faqs" className="scroll-mt-24 bg-white">
          <div className="page py-12 lg:py-14">
            <Reveal className="flex flex-col items-center text-center">
              <span className="pill pill-green uppercase tracking-wide">FAQs</span>
              <h2 className="mt-4 text-4xl leading-tight">Good questions. Clear answers.</h2>
              <p className="mt-3 text-sm text-muted">What to know before you bring SureBite to your tables.</p>
            </Reveal>
            <FaqList />
          </div>
        </section>

        <section className="page py-10">
          <Reveal variant="zoom" className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-soft p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="text-4xl">Make room for more informed choices.</h2>
              <p className="mt-3 text-muted">Start with your restaurant account. Then bring your first menu to the table.</p>
            </div>
            <Link to="/auth?mode=register" className="btn btn-primary">
              <ArrowRight size={16} aria-hidden="true" /> Create restaurant account
            </Link>
          </Reveal>
        </section>
      </main>

      <footer className="page pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-6">
          <Logo />
          <nav className="flex gap-6 text-sm" aria-label="Footer">
            <a href="#how-it-works" className="hover:text-brand">
              How it works
            </a>
            <a href="#faqs" className="hover:text-brand">
              FAQs
            </a>
            <Link to="/auth" className="hover:text-brand">
              Manager sign in
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-2 pt-5 text-xs text-muted">
          <span>© {new Date().getFullYear()} SureBite</span>
          <span>Allergen information supports — never replaces — a conversation with your server.</span>
        </div>
      </footer>
    </div>
  )
}

export default Home
