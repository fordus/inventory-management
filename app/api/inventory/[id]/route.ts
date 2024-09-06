import { PrismaClient } from '@prisma/client'
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher'
import { NextResponse } from 'next/server'

import { NextRequest } from "next/server"

const prisma = new PrismaClient()

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { id } = req.query

//   if (req.method === 'GET') {
//     const item = await prisma.inventoryItem.findUnique({
//       where: { id: Number(id) },
//     })
//     if (item) {
//       res.status(200).json(item)
//     } else {
//       res.status(404).json({ message: 'Item not found' })
//     }
//   } else if (req.method === 'PUT') {
//     const item = await prisma.inventoryItem.update({
//       where: { id: Number(id) },
//       data: req.body,
//     })
//     res.status(200).json(item)
//   } else if (req.method === 'DELETE') {
//     await prisma.inventoryItem.delete({
//       where: { id: Number(id) },
//     })
//     res.status(204).end()
//   } else {
//     res.status(405).json({ message: 'Method not allowed' })
//   }
// }

// here export a function for each HTTP method

export async function GET (req: NextRequest, context: { params: Params }) {
  const id = context.params.id

  const item = await prisma.inventoryItem.findUnique({
    where: { id: Number(id) },
  })
  if (item) {
    return NextResponse.json({ item })
  } else {
    return NextResponse.json({ message: 'Item not found' })
  }
}

export async function PUT (req: NextRequest, context: { params: Params }) {
  const id = context.params.id
  const body = await req.json()

  const item = await prisma.inventoryItem.update({
    where: { id: Number(id) },
    data: body,
  })
  return NextResponse.json({ item })
}

export async function DELETE (req: NextRequest, context: { params: Params }) {
  const id = context.params.id
  console.log('id', id)

  await prisma.inventoryItem.delete({
    where: { id: Number(id) },
  })
  return NextResponse.json({ message: 'Item deleted' })
}

