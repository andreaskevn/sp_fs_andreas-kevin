"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createProject } from '@/controller/projectController';
import { FiSave, FiLoader } from 'react-icons/fi';

export default function NewProjectPage() {
    const router = useRouter();
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) {
            toast.error("Nama proyek tidak boleh kosong.");
            return;
        }

        setIsCreating(true);
        const result = await createProject(projectName);
        setIsCreating(false);

        if (result.success && result.data) {
            toast.success("Proyek berhasil dibuat!");
            router.push(`/project/${result.data.id}`);
        } else {
            toast.error(result.error || "Gagal membuat proyek.");
        }
    };

    return (
        // Halaman ini otomatis dibungkus oleh layout.tsx dari (dashboard)
        <>
            <header className="p-6 border-b border-gray-800">
                <h1 className="text-3xl font-bold text-white">Buat Proyek Baru</h1>
            </header>
            <main className="p-6">
                <div className="max-w-lg mx-auto bg-gray-900 p-8 rounded-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="projectName" className="block text-lg mb-2 text-gray-300">
                                Nama Proyek
                            </label>
                            <p className="text-sm text-gray-500 mb-3">Pilih nama yang deskriptif untuk proyek Anda.</p>
                            <input
                                id="projectName"
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Contoh: Aplikasi Manajemen Keuangan"
                                required
                                disabled={isCreating}
                            />
                        </div>
                        <div className="flex justify-end items-center space-x-4">
                            <Link href="/dashboard" className="text-gray-400 hover:text-white">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                            >
                                {isCreating ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                                {isCreating ? 'Membuat...' : 'Buat Proyek'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}