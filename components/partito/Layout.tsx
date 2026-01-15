import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from './SkipLink';

interface LayoutProps {
  children: ReactNode;
  minimal?: boolean;
}

export const Layout = ({ children, minimal = false }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Header minimal={minimal} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
