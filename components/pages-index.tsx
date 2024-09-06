'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type InventoryItem = {
  id: number
  name: string
  description: string
  quantity: number
  price: number
}

export function PagesIndex() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({})
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchItems()
  }, [search])

  const fetchItems = async () => {
    const res = await fetch(`/api/inventory${search ? `?search=${search}` : ''}`)
    const data = await res.json()
    setItems(data)
  }

  const handleCreate = async () => {
    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
    setNewItem({})
    fetchItems()
  }

  const handleUpdate = async () => {
    if (editingItem) {
      await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      })
      setEditingItem(null)
      fetchItems()
    }
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  const getTotalValue = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0)
  }

  const getTopItems = () => {
    return items
      .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        value: item.quantity * item.price
      }))
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8" style={{
      backgroundImage: `
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="bg-white bg-opacity-90">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Inventory Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Item</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Name"
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity || ''}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  />
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="bg-white bg-opacity-90">
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="mr-2">Edit</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Input
                              placeholder="Name"
                              value={editingItem?.name || ''}
                              onChange={(e) => setEditingItem({ ...editingItem!, name: e.target.value })}
                            />
                            <Input
                              placeholder="Description"
                              value={editingItem?.description || ''}
                              onChange={(e) => setEditingItem({ ...editingItem!, description: e.target.value })}
                            />
                            <Input
                              type="number"
                              placeholder="Quantity"
                              value={editingItem?.quantity || ''}
                              onChange={(e) => setEditingItem({ ...editingItem!, quantity: parseInt(e.target.value) })}
                            />
                            <Input
                              type="number"
                              placeholder="Price"
                              value={editingItem?.price || ''}
                              onChange={(e) => setEditingItem({ ...editingItem!, price: parseFloat(e.target.value) })}
                            />
                            <Button onClick={handleUpdate}>Update</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white bg-opacity-90">
          <CardHeader>
            <CardTitle>Inventory Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold">Total Inventory Value</h3>
                <p className="text-2xl font-bold">${getTotalValue().toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Top 5 Items by Value</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTopItems()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}