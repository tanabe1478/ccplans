import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toasts } from '../ui/Toasts';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Outlet />
      </main>
      <Toasts />
    </div>
  );
}
