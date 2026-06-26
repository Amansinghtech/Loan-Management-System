import { Logo, LogoMark } from '@/components/brand/logo';
import { LoanCalculator } from '@/components/landing/loan-calculator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/brand';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  CalendarCheck,
  CircleDollarSign,
  Clock,
  FileCheck2,
  Gauge,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

const VALUE_PROPS = [
  { icon: Gauge, title: 'Decision in seconds', body: 'Our rule engine checks eligibility the moment you submit your details.' },
  { icon: ShieldCheck, title: 'Bank-grade security', body: 'Hashed credentials, signed sessions, and private document storage.' },
  { icon: CircleDollarSign, title: 'Transparent pricing', body: 'A flat 12% p.a. simple interest. No hidden charges, ever.' },
  { icon: Clock, title: 'Track every stage', body: 'Watch your loan move from applied to disbursed to closed in real time.' },
];

const STEPS = [
  { icon: UserCheck, title: 'Check eligibility', body: 'Share a few personal details and pass an instant eligibility check.' },
  { icon: FileCheck2, title: 'Upload & configure', body: 'Add your salary slip and pick an amount and tenure that suit you.' },
  { icon: Banknote, title: 'Get disbursed', body: 'Once approved, funds are released and your repayment schedule begins.' },
];

const ELIGIBILITY = [
  { icon: CalendarCheck, label: 'Age', value: '23 – 50 years' },
  { icon: CircleDollarSign, label: 'Monthly income', value: 'Rs. 25,000+' },
  { icon: BriefcaseBusiness, label: 'Employment', value: 'Salaried / Self-employed' },
  { icon: BadgeCheck, label: 'Documents', value: 'Valid PAN + salary slip' },
];

const FAQS = [
  { q: 'How much can I borrow?', a: 'You can apply for a personal loan between Rs. 50,000 and Rs. 5,00,000, for a tenure of 30 to 365 days.' },
  { q: 'How is interest calculated?', a: 'We use simple interest at a fixed 12% per annum: SI = (Principal x Rate x Days) / (365 x 100). Your total repayment is principal plus interest.' },
  { q: 'What makes me eligible?', a: 'You must be between 23 and 50 years old, earn at least Rs. 25,000 per month, hold a valid PAN, and be employed (salaried or self-employed).' },
  { q: 'What happens after I apply?', a: 'Your application moves through sanction, disbursement, and collection. You can track its exact status from your dashboard at any time.' },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="brand-gradient h-1 w-full" />
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 to-background" />
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
              <span className="brand-text-gradient font-semibold">MERN</span> · Next.js · TypeScript
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Personal loans <span className="brand-text-gradient">{BRAND.maxLoanLabel}</span>,
              approved in minutes
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">{BRAND.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Apply for a loan <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">
                  <ShieldCheck className="h-4 w-4" /> Staff login
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> 100% online
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> No hidden fees
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-primary" /> Instant eligibility
              </span>
            </div>
          </div>
          <div className="md:pl-6">
            <LoanCalculator />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">Why choose {BRAND.name}?</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="bg-secondary/40 py-16">
        <div className="container">
          <h2 className="text-center text-3xl font-bold tracking-tight">3 steps to your loan</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative rounded-xl border bg-card p-6">
                <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
                  {i + 1}
                </span>
                <s.icon className="mt-2 h-7 w-7 text-primary" />
                <p className="mt-3 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="container py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">Eligibility criteria</h2>
        <p className="mt-2 text-center text-muted-foreground">
          Meet these and you are ready to apply.
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ELIGIBILITY.map((e) => (
            <div key={e.label} className="rounded-xl border bg-card p-6 text-center">
              <e.icon className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{e.label}</p>
              <p className="font-semibold">{e.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/40 py-16">
        <div className="container max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-8 rounded-xl border bg-card px-6">
            {FAQS.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="brand-gradient flex flex-col items-center gap-4 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Ready when you are</h2>
          <p className="max-w-md opacity-90">
            Create an account and get an eligibility decision in seconds.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">
              Apply now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LogoMark className="h-6 w-6" />
            <span>
              {BRAND.name} — {BRAND.tagline}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built as a full-stack assignment. Not a real lender.
          </p>
        </div>
      </footer>
    </main>
  );
}
