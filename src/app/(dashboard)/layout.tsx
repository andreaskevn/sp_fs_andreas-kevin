"use client";

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LuLayoutDashboard } from 'react-icons/lu';
import { FiBarChart2, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        toast.success('Logout berhasil!');
        localStorage.removeItem('auth_token');
        router.push('/login');
        router.refresh(); 
    };

    const getLinkClassName = (path: string) => {
        return pathname === path
            ? 'flex items-center p-3 rounded-lg bg-purple-800 transition-colors duration-200'
            : 'flex items-center p-3 rounded-lg hover:bg-purple-800 transition-colors duration-200';
    };

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shrink-0">
            <div className="text-2xl font-bold text-purple-400 mb-10 text-center tracking-widest">Multi-User Management App</div>
            <nav className="flex-grow">
                <ul>
                    <li className="mb-4">
                        <Link href="/dashboard" className={getLinkClassName('/dashboard')}>
                            <LuLayoutDashboard className="mr-3" />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="mb-4">
                        <Link href="/analytic" className={getLinkClassName('/analytic')}>
                            <FiBarChart2 className="mr-3" />
                            <span>Analytic</span>
                        </Link>
                    </li>
                </ul>
            </nav>
            <div>
                <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-lg hover:bg-red-600 transition-colors duration-200">
                    <FiLogOut className="mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default function DashboardAreaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-black text-gray-200 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}