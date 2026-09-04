import './globals.css';
import { AppProvider } from '@/components/app-provider';
import { AppShell } from '@/components/app-shell';
export const metadata = { title: 'DesignedbyTD Business Tracker', description: 'Client, project, payment and contract tracker for DesignedbyTD.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>;
}
