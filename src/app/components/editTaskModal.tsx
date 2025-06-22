"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateTask, type UpdateTaskData } from '@/controller/taskController';
import type { Task } from '@/controller/projectController';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskUpdated: () => void;
    task: Task | null;
    projectId: string;
    members: { id: string; user: { email: string } }[];
}

export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task, projectId, members }: EditTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setAssigneeId(task.assignee?.user.id || null); 
        }
    }, [task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;

        setIsSubmitting(true);
        const taskData: UpdateTaskData = {
            title,
            description,
            assigneeId: assigneeId === "unassigned" ? null : assigneeId,
        };

        const result = await updateTask(projectId, task.id, taskData);

        if (result.success) {
            toast.success("Task berhasil diperbarui!");
            onTaskUpdated();
            onClose();
        } else {
            toast.error(result.error || "Gagal memperbarui task.");
        }
        setIsSubmitting(false);
    };

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 bg-black/70 bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><FiX size={24} /></button>
                <h2 className="text-2xl font-bold mb-6">Edit Task: {task.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="flex items-center bg-purple-600 ...">
                            {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}