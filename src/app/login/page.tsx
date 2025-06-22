// app/login/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/controller/loginController';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await loginUser({ email, password });

        if (result.success && result.token) {
            toast.success('Login berhasil! Mengarahkan ke dashboard...');
            localStorage.setItem('auth_token', result.token);
            router.push('/dashboard');
        } else {
            const errorMessage = result.error || 'Login gagal.';
            setError(errorMessage);
            toast.error(errorMessage);
        }

        setIsLoading(false);
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-2xl shadow-purple-500/20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-purple-400 tracking-wider">
                        LOGIN
                    </h1>
                    <p className="text-gray-400 mt-2">Selamat datang kembali!</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-gray-300"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="block mb-2 text-sm font-medium text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 text-center animate-pulse">
                            {error}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-600/50"
                        >
                            {isLoading ? 'Loading...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}