"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchAnalytics, type AnalyticData } from '@/controller/analyticController';
import StatCard from '@/app/components/statCard';
import { FiLoader, FiList, FiCheckSquare, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function GlobalAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAnalytics = async () => {
            setIsLoading(true);
            const result = await fetchAnalytics();
            if (result.success && result.data) {
                setAnalytics(result.data);
            } else {
                toast.error(result.error || "Gagal memuat data analitik.");
            }
            setIsLoading(false);
        };
        loadAnalytics();
    }, []);

    const globalStats = useMemo(() => {
        if (analytics.length === 0) return null;

        const totalProjects = analytics.length;
        let totalTasks = 0;
        let totalDone = 0;

        const tableData = analytics.map(proj => {
            const projectTotalTasks = proj.taskCounts.TODO + proj.taskCounts.IN_PROGRESS + proj.taskCounts.DONE;
            const projectDoneTasks = proj.taskCounts.DONE;

            totalTasks += projectTotalTasks;
            totalDone += projectDoneTasks;

            const completion = projectTotalTasks > 0 ? (projectDoneTasks / projectTotalTasks) * 100 : 0;

            return {
                name: proj.projectName,
                total: projectTotalTasks,
                done: projectDoneTasks,
                inProgress: proj.taskCounts.IN_PROGRESS,
                todo: proj.taskCounts.TODO,
                completion: `${completion.toFixed(1)}%`
            };
        });

        const overallCompletion = totalTasks > 0 ? ((totalDone / totalTasks) * 100).toFixed(1) : 0;

        const chartData = analytics.map(proj => ({
            name: proj.projectName,
            Selesai: proj.taskCounts.DONE,
            Dikerjakan: proj.taskCounts.IN_PROGRESS,
            'Akan Dikerjakan': proj.taskCounts.TODO,
        }));

        return { totalProjects, totalTasks, overallCompletion, tableData, chartData };
    }, [analytics]);

    if (isLoading) return <div className="flex justify-center items-center h-full"><FiLoader className="text-4xl animate-spin" /></div>;
    if (!globalStats) return <p className="text-center text-gray-400">Tidak ada data proyek untuk dianalisis.</p>;

    return (
        <>
            <header className="p-6 border-b border-gray-800">
                <h1 className="text-3xl font-bold text-white">Global Project Analytics</h1>
                <p className="text-gray-400">Tinjauan performa dari semua proyek Anda.</p>
            </header>
            <main className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Proyek Aktif" value={globalStats.totalProjects} icon={FiList} color="bg-blue-600" />
                    <StatCard title="Total Task Keseluruhan" value={globalStats.totalTasks} icon={FiCheckSquare} color="bg-green-600" />
                    <StatCard title="Penyelesaian Rata-rata" value={`${globalStats.overallCompletion}%`} icon={FiPieChart} color="bg-purple-600" />
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><FiBarChart2 className="mr-2" /> Perbandingan Beban Kerja Proyek</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={globalStats.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }} />
                            <Legend />
                            <Bar dataKey="Akan Dikerjakan" stackId="a" fill="#8B5CF6" />
                            <Bar dataKey="Dikerjakan" stackId="a" fill="#3B82F6" />
                            <Bar dataKey="Selesai" stackId="a" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Rincian per Proyek</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700 text-sm text-gray-400">
                                <tr>
                                    <th className="p-3">Nama Proyek</th>
                                    <th className="p-3 text-center">Total Task</th>
                                    <th className="p-3 text-center">Selesai</th>
                                    <th className="p-3 text-center">Dikerjakan</th>
                                    <th className="p-3 text-center">Todo</th>
                                    <th className="p-3 text-right">Penyelesaian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {globalStats.tableData.map(proj => (
                                    <tr key={proj.name} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="p-3 font-semibold">{proj.name}</td>
                                        <td className="p-3 text-center">{proj.total}</td>
                                        <td className="p-3 text-center text-green-500">{proj.done}</td>
                                        <td className="p-3 text-center text-blue-500">{proj.inProgress}</td>
                                        <td className="p-3 text-center text-purple-500">{proj.todo}</td>
                                        <td className="p-3 text-right font-mono">{proj.completion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}