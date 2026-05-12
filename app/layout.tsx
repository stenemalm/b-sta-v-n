import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import CartPopup from '@/components/CartPopup';

export const metadata: Metadata = {
  title: 'Zooplats — Premium för katt & hund',
  description: 'Europas bästa premiummärken för katt och hund. Fri frakt över 599 kr. Hemleverans 3–7 arbetsdagar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CartProvider>
          <Nav />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
          <CookieBanner />
          <CartPopup />
        </CartProvider>
      </body>
    </html>
  );
}
