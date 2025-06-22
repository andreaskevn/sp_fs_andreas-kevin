"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerUser } from "@/controller/registerController";
import { FiUserPlus, FiLoader } from "react-icons/fi";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok!");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({ name, email, password });

      if (result.success) {
        toast.success("Registrasi berhasil! Silakan login.");
        router.push("/login");
      } else {
        toast.error(result.error || "Terjadi kesalahan.");
      }
    } catch (error: any) {
      toast.error("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute bottom-0 left-0 h-1/2 w-1/2 bg-gradient-to-tr from-purple-900 to-transparent blur-3xl"></div>
        <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-gradient-to-bl from-blue-900 to-transparent blur-3xl"></div>
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-2xl shadow-purple-500/20 z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-400">Buat Akun Baru</h1>
          <p className="text-gray-400 mt-2">Mulai kelola proyek Anda hari ini.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
            <input
              id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Konfirmasi Password</label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit" disabled={isLoading}
              className="w-full flex justify-center items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiUserPlus className="mr-2" />}
              {isLoading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-purple-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}