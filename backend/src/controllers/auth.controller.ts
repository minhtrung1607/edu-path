import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { sendOTP } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.isVerified) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      // If user exists but not verified, we can resend OTP or update password
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: { email, password: hashedPassword },
    });

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.otp.create({
      data: { email, otpCode, expiresAt },
    });

    await sendOTP(email, otpCode);

    res.status(200).json({ message: 'Registration successful, please verify OTP', email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode } = req.body;

    const otpRecord = await prisma.otp.findFirst({
      where: { email, otpCode },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    if (otpRecord.expiresAt < new Date()) {
      res.status(400).json({ message: 'OTP expired' });
      return;
    }

    // Mark user as verified
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    // Delete OTP records for this email
    await prisma.otp.deleteMany({ where: { email } });

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Check if student profile exists
    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    const needsOnboarding = !student;

    res.status(200).json({ token, user, needsOnboarding });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({ message: 'Please verify your email first' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    const needsOnboarding = !student;

    res.status(200).json({ token, user, needsOnboarding });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleOAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Mocking Google OAuth verify token
    const { email, name, avatar } = req.body; // In real app, we verify Google token and get these info

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          isVerified: true, // Google accounts are implicitly verified
          role: 'STUDENT',
        },
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    let needsOnboarding = !student;
    
    if (needsOnboarding) {
       // Auto create partial student record with avatar from Google if we want, or leave it for onboarding
    }

    res.status(200).json({ token, user, needsOnboarding });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't leak whether user exists or not for security
      res.status(200).json({ message: 'If email exists, an OTP will be sent' });
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.create({ data: { email, otpCode, expiresAt } });
    await sendOTP(email, otpCode);

    res.status(200).json({ message: 'If email exists, an OTP will be sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode, newPassword } = req.body;

    const otpRecord = await prisma.otp.findFirst({
      where: { email, otpCode },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.otp.deleteMany({ where: { email } });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeOnboarding = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { skills, goal, deadline, name } = req.body;

    const student = await prisma.student.upsert({
      where: { userId },
      update: { skills, goal, deadline: new Date(deadline), name },
      create: { userId, skills, goal, deadline: new Date(deadline), name },
    });

    res.status(200).json({ message: 'Onboarding completed', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
