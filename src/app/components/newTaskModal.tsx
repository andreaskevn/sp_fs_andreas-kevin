"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createTask, type NewTaskData } from '@/controller/taskController';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

// Tipe data untuk props
interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void; 
    projectId: string;
    members: { id: string; user: { email: string } }[]; 
}

export default function NewTaskModal({ isOpen, onClose, onTaskCreated, projectId, members }: NewTaskModalProps) {
    // State untuk form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
    const [assigneeId, setAssigneeId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const taskData: NewTaskData = {
            title,
            description,
            status,
            assigneeId: assigneeId === "unassigned" ? null : assigneeId,
        };

        const result = await createTask(projectId, taskData);

        if (result.success) {
            toast.success("Task baru berhasil dibuat!");
            onTaskCreated(); 
            onClose();       
            setTitle('');
            setDescription('');
            setStatus('TODO');
            setAssigneeId(null);
        } else {
            toast.error(result.error || "Gagal membuat task.");
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <FiX size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6">Buat Task Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Judul Task</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-gray-800 rounded border border-gray-700" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Deskripsi (Opsional)</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 bg-gray-800 rounded border border-gray-700"></textarea>
                    </div>
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                            <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 bg-gray-800 rounded border border-gray-700">
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="assignee" className="block text-sm font-medium text-gray-300 mb-1">Ditugaskan Kepada</label>
                            <select id="assignee" value={assigneeId || "unassigned"} onChange={e => setAssigneeId(e.target.value)} className="w-full p-2 bg-gray-800 rounded border border-gray-700">
                                <option value="unassigned">Tidak ditugaskan</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>{member.user.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-700">
                            {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}