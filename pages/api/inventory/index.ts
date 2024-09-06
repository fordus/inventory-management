import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { search } = req.query
    let items

    if (search) {
      items = await prisma.inventoryItem.findMany({
        where: {
          OR: [
            { name: { contains: search as string } },
            { description: { contains: search as string } },
          ],
        },
      })
    } else {
      items = await prisma.inventoryItem.findMany()
    }

    res.status(200).json(items)
  } else if (req.method === 'POST') {
    const item = await prisma.inventoryItem.create({
      data: req.body,
    })
    res.status(201).json(item)
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}