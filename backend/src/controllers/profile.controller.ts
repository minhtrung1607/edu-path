import { Response } from 'express';
import prisma from '../lib/prisma';

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;
    const { name, avatar, skills, goal, deadline } = req.body;

    const student = await prisma.student.upsert({
      where: { userId },
      update: { name, avatar, skills, goal, deadline: deadline ? new Date(deadline) : undefined },
      create: { userId, name, avatar, skills, goal, deadline: deadline ? new Date(deadline) : undefined },
    });

    res.status(200).json({ message: 'Profile updated successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
