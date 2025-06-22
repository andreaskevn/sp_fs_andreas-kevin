"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchProjectById, type Project } from '@/controller/projectController';
import {
    updateProjectName,
    deleteProject,
    inviteMember,
    removeMember
} from '@/controller/settingController';
import { FiLoader, FiUserPlus, FiTrash2, FiSave } from 'react-icons/fi';

interface ProjectWithMembers extends Project {
    members: { id: string; user: { id: string; email: string } }[];
}

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const membershipId = params.membershipId as string;

    const [project, setProject] = useState<ProjectWithMembers | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [projectName, setProjectName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");

    const loadProject = useCallback(async () => {
        if (!projectId) return;
        setIsLoading(true);
        const result = await fetchProjectById(projectId);
        if (result.success && result.data) {
            setProject(result.data as ProjectWithMembers);
            setProjectName(result.data.name);
        } else {
            toast.error(result.error || "Tidak dapat memuat proyek.");
            router.push('/dashboard');
        }
        setIsLoading(false);
    }, [projectId, router]);

    useEffect(() => { loadProject(); }, [loadProject]);

    const handleUpdateName = async () => {
        toast.promise(updateProjectName(projectId, projectName), {
            loading: 'Menyimpan...',
            success: 'Nama proyek berhasil diperbarui!',
            error: (err) => err.toString(),
        });
    };

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await inviteMember(projectId, inviteEmail);
        if (res.success) {
            toast.success(`Berhasil mengundang ${inviteEmail}`);
            setInviteEmail("");
            loadProject();
        } else {
            toast.error(res.error || "Gagal mengundang anggota.");
        }
    };

    const handleRemoveMember = async (projectId: string, membershipId: string) => {
        if (window.confirm("Anda yakin ingin menghapus anggota ini?")) {
            const res = await removeMember(projectId, membershipId);
            if (res.success) {
                toast.success("Anggota berhasil dihapus.");
                loadProject();
            } else {
                toast.error(res.error || "Gagal menghapus.");
            }
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm("PERINGATAN: Anda akan menghapus proyek ini secara permanen. Aksi ini tidak bisa dibatalkan. Lanjutkan?")) {
            const res = await deleteProject(projectId);
            if (res.success) {
                toast.success("Proyek berhasil dihapus.");
                router.push('/dashboard');
            } else {
                toast.error(res.error || "Gagal menghapus proyek.");
            }
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-full"><FiLoader className="text-4xl animate-spin" /></div>;
    if (!project) return <p>Proyek tidak ditemukan.</p>;

    return (
        <>
            <header className="p-6 border-b border-gray-800"><h1 className="text-3xl font-bold">Pengaturan Proyek: {project.name}</h1></header>
            <main className="p-6 space-y-8">
                <div className="bg-gray-900 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Pengaturan Umum</h2>
                    <div className="flex items-end space-x-4">
                        <div className="flex-grow">
                            <label htmlFor="projectName" className="block text-sm mb-1 text-gray-400">Nama Proyek</label>
                            <input id="projectName" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full p-2 bg-gray-800 rounded" />
                        </div>
                        <button onClick={handleUpdateName} className="bg-purple-600 hover:bg-purple-700 p-2 rounded flex items-center"><FiSave className="mr-2" /> Simpan</button>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Anggota</h2>
                    <form onSubmit={handleInviteMember} className="flex items-end space-x-4 mb-6">
                        <div className="flex-grow">
                            <label htmlFor="inviteEmail" className="block text-sm mb-1 text-gray-400">Undang Anggota Baru (via Email)</label>
                            <input id="inviteEmail" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full p-2 bg-gray-800 rounded" placeholder="nama@email.com" required />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 p-2 rounded flex items-center"><FiUserPlus className="mr-2" /> Undang</button>
                    </form>
                    <ul className="space-y-2">
                        {project.members.map(member => (
                            <li key={member.id} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                                <span>{member.user.email} {member.user.id === project.owner.id && <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full ml-2">Owner</span>}</span>
                                {member.user.id !== project.owner.id && (
                                    <button onClick={() => handleRemoveMember(project.id, member.id)} className="text-red-500 hover:text-red-400"><FiTrash2 /></button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white">Hapus Proyek Ini</h3>
                            <p className="text-sm text-gray-400">Setelah dihapus, tidak ada cara untuk mengembalikannya. Harap yakin.</p>
                        </div>
                        <button onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Hapus Proyek</button>
                    </div>
                </div>
            </main>
        </>
    );
}