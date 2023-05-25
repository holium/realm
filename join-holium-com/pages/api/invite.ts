/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // GET /api/invite/:id
  if (req.method === 'GET') {
    const inviteId = req.query.id as string;

    const invite = await prisma.spaceInvite.findUnique({
      where: {
        id: inviteId,
      },
    });

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    } else {
      return res.json(invite);
    }
  } else if (req.method === 'POST') {
    // Create the invite and corresponding space.
  } else if (req.method === 'DELETE') {
    // Delete the invite.
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
