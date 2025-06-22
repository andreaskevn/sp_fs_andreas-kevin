// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import type { LoginApiResponse, UserSafeData } from "@/lib/definition";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      const response: LoginApiResponse = {
        error: "Email dan password dibutuhkan",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Gunakan pesan error yang sama untuk keamanan
      const response: LoginApiResponse = { error: "Kredensial tidak valid" };
      return NextResponse.json(response, { status: 401 });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const response: LoginApiResponse = { error: "Kredensial tidak valid" };
      return NextResponse.json(response, { status: 401 });
    }

    // Buat JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" } // Token berlaku 24 jam
    );

    // Siapkan data yang aman
    const userSafeData: UserSafeData = {
      id: user.id,
      email: user.email,
    };

    // Buat respons sukses sesuai interface
    const response: LoginApiResponse = {
      message: "Login berhasil!",
      token: token,
      user: userSafeData,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    const response: LoginApiResponse = {
      error: "Terjadi kesalahan pada server",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
