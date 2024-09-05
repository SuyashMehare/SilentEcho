import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/users.model';
import { ApiResponse } from '@/types/ApiResponse';
import bcrypt from "bcryptjs";
import NextAuth from 'next-auth/next';
import CredentialsProvider from "next-auth/providers/credentials"
import { NextResponse } from 'next/server';
import { authOptions } from './options';

const handlers = NextAuth(authOptions)


export {handlers as GET, handlers as POST}

