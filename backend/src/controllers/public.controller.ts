import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getPublicRoadmaps = async (req: Request, res: Response): Promise<void> => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
    
    res.status(200).json(roadmaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPublicKnowledge = async (req: Request, res: Response): Promise<void> => {
  try {
    const knowledgeList = await prisma.knowledge.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(knowledgeList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
