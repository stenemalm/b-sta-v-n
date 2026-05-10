import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Bästa Vän — Premium kattmat, sand & tillbehör',
  description: 'Handplockat premium för din katt. Fri frakt över 499 kr. Rekommenderat av uppfödare.',
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
