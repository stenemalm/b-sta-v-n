import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Zooplats — Europeiska premiumprodukter för katt',
  description: 'Vi importerar de bästa europeiska kattmärkena direkt från Tyskland. Fri frakt över 599 kr. 3–7 dagars leverans.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CartProvider>
          <Nav />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
