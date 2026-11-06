import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * PublicLayout:
 * The public-facing layout for farmers, customers, and general website visitors.
 * Wraps all public store pages with the official public Header and Footer.
 */
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf8] text-stone-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
