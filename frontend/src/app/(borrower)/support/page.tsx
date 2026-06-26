'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BRAND } from '@/lib/brand';
import { Mail, Phone } from 'lucide-react';

const FAQS = [
  { q: 'How long does approval take?', a: 'Eligibility is instant. Sanction and disbursement are handled by our operations team and are usually completed within a day.' },
  { q: 'Why was my application rejected?', a: 'Rejections always include a reason from the sanction team — you can see it on the loan card under "My Loans".' },
  { q: 'How do I repay my loan?', a: 'Repayments are recorded against your loan by our collection team using your bank UTR. Your outstanding balance updates automatically and the loan closes once fully repaid.' },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-muted-foreground">We are here to help. Reach out any time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <CardTitle className="pt-2">Email us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Send us your query and we will get back within one business day.
            </p>
            <Button asChild className="w-full">
              <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <CardTitle className="pt-2">Call us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Speak to an agent for urgent help, Mon–Sat, 9am–6pm.
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href={`tel:${BRAND.supportPhone.replace(/\s/g, '')}`}>{BRAND.supportPhone}</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {FAQS.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
