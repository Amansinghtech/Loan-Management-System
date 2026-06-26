'use client';

import { Button } from '@/components/ui/button';
import { api, getApiErrorMessage } from '@/lib/api';
import { SalarySlip } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileCheck2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];

export function UploadStep({
  uploaded,
  onUploaded,
  onBack,
  onContinue,
}: {
  uploaded: SalarySlip | null;
  onUploaded: (slip: SalarySlip) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!ALLOWED.includes(file.type)) {
      toast.error('Only PDF, JPG, or PNG files are allowed.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('File exceeds the 5 MB limit.');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    setUploading(true);
    try {
      const { data } = await api.post<{ salarySlip: SalarySlip }>('/uploads/salary-slip', form);
      onUploaded(data.salarySlip);
      toast.success('Salary slip uploaded');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent/50',
        )}
      >
        {uploaded ? (
          <>
            <FileCheck2 className="h-10 w-10 text-emerald-600" />
            <p className="font-medium">{uploaded.originalName}</p>
            <p className="text-sm text-muted-foreground">Uploaded. Click to replace.</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{uploading ? 'Uploading...' : 'Drag & drop your salary slip'}</p>
            <p className="text-sm text-muted-foreground">PDF, JPG or PNG — max 5 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={!uploaded || uploading}>
          Continue
        </Button>
      </div>
    </div>
  );
}
