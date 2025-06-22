"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchProjects } from '@/controller/projectController';
import ProjectCard from '@/app/components/projectCard';
import { FiPlus, FiLoader } from 'react-icons/fi';
import Link from 'next/link';

export default function DashboardPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            setIsLoading(true);
            const result = await fetchProjects();
            if (result.success && result.data) {
                setProjects(result.data);
            } else {
                toast.error(result.error || "Gagal memuat proyek.");
            }
            setIsLoading(false);
        };
        loadProjects();
    }, []);

    return (
        <>
            <header className="p-6 flex justify-between items-center shrink-0">
                <h1 className="text-3xl font-bold text-white">Proyek Saya</h1>
                <Link
                    href={`/project/new`}
                    className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <FiPlus className="mr-2" />
                    Proyek Baru
                </Link>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <FiLoader className="text-purple-400 text-4xl animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}