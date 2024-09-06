import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: Number(id) },
    })
    if (item) {
      res.status(200).json(item)
    } else {
      res.status(404).json({ message: 'Item not found' })
    }
  } else if (req.method === 'PUT') {
    const item = await prisma.inventoryItem.update({
      where: { id: Number(id) },
      data: req.body,
    })
    res.status(200).json(item)
  } else if (req.method === 'DELETE') {
    await prisma.inventoryItem.delete({
      where: { id: Number(id) },
    })
    res.status(204).end()
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}