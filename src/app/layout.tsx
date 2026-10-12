import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskTrack - Task & Team Management',
  description: 'Assignment 2 PRN232 Task Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} bg-[#f8f9fa] text-gray-900 antialiased`}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
