// lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export function verifyAuth(request: NextRequest): { userId: string } | null {
  const token = request.headers.get('authorization')?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return { userId: decoded.userId };
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
}