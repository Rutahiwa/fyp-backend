import { Toaster } from 'sonner';
import { QueryProvider } from '@/components/admin/providers/QueryProvider';
import './globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
