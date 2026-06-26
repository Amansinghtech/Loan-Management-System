'use client';

import { Button } from '@/components/ui/button';
import { api, getApiErrorMessage } from '@/lib/api';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ViewSlipButton({ slipKey }: { slipKey: string }) {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const { data } = await api.get<{ url: string }>('/uploads/view', {
        params: { key: slipKey },
      });
      window.open(data.url, '_blank', 'noopener');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not open salary slip'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={open} disabled={loading}>
      <FileText className="h-4 w-4" /> Slip
    </Button>
  );
}
