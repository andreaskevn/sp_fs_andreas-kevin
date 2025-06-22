// controllers/authController.ts
import type { User } from '@/generated/prisma/client';

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    data?: Omit<User, 'password'>;
    error?: string;
}

export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Gagal melakukan registrasi');
        }
        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}