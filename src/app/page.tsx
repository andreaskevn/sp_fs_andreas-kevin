// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiLogIn, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    toast.success('Anda berhasil logout.');
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const ActionButtons = () => {
    if (isLoading) {
      return <div className="h-14 w-64"></div>;
    }

    if (isAuthenticated) {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            Masuk ke Dashboard
            <FiArrowRight className="ml-2" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full sm:w-auto text-gray-400 hover:text-white font-semibold transition-colors"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/login"
          className="flex items-center justify-center w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg shadow-purple-500/30"
        >
          <FiLogIn className="mr-2" />
          Login
        </Link>
        <Link
          href="/register"
          className="flex items-center justify-center w-full sm:w-auto text-gray-300 hover:text-white font-semibold transition-colors"
        >
          Register
          <FiArrowRight className="ml-2" />
        </Link>
      </div>
    );
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute bottom-0 left-0 h-1/2 w-1/2 bg-gradient-to-tr from-purple-900 to-transparent blur-3xl"></div>
        <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-gradient-to-bl from-blue-900 to-transparent blur-3xl"></div>
      </div>
      <div className="text-center z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Multi-User Management App
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-8">
          Organisasikan proyek Anda, kelola tugas, dan berkolaborasi dengan tim secara mulus di satu tempat.
        </p>
        <ActionButtons />
      </div>
    </main>
  );
}