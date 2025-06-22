"use client";

import Link from 'next/link';
import type { Project } from '@/controller/projectController';
import { FiUsers, FiCheckSquare, FiSettings } from 'react-icons/fi';
import { BsThreeDotsVertical } from "react-icons/bs";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-md hover:shadow-purple-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Owner: {project.owner.email}</p>
                <div className="flex space-x-4 text-sm text-gray-400">
                    <span className="flex items-center"><FiUsers className="mr-2" /> {project._count.members} Anggota</span>
                    <span className="flex items-center"><FiCheckSquare className="mr-2" /> {project._count.tasks} Tasks</span>
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
                <Link href={`/project/${project.id}`} className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                    Lihat Board →
                </Link>
                <Link href={`/project/${project.id}/settings`} className="text-gray-500 hover:text-white">
                    <FiSettings />
                </Link>
            </div>
        </div>
    );
}