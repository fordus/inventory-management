import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET (req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search')
  
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

 return NextResponse.json(items)
}

export async function POST (req: NextRequest) {
  const body = await req.json()
  const item = await prisma.inventoryItem.create({
    data: body,
  })
  return NextResponse.json({ item })
}
