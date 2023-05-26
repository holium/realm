/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

import {
  CreateSpaceInvitePayload,
  CreateSpaceInviteResponse,
} from '@holium/shared';

import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

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
      return res.status(200).json(invite);
    }
  } else if (req.method === 'POST') {
    // Create the invite and corresponding space.
    const payload: CreateSpaceInvitePayload | null = req.body;
    if (!payload) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const invite = await prisma.spaceInvite.create({
      data: {
        from: payload.from,
        space: {
          create: payload.space,
        },
      },
    });

    const inviteUrl = `https://join.holium.com/${invite.id}`;

    const response: CreateSpaceInviteResponse = {
      inviteUrl,
    };

    return res.status(200).json(response);
  } else if (req.method === 'DELETE') {
    // Delete the invite.
    const path = req.body.path as string;

    await prisma.spaceInvite.deleteMany({
      where: {
        space: {
          path,
        },
      },
    });

    return res.status(200).json({ message: 'Invites deleted' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
