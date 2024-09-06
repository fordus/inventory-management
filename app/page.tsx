'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Toaster, toast } from 'sonner'
import * as XLSX from 'xlsx'

type InventoryItem = {
  id: number
  name: string
  description: string
  quantity: number
  price: number
}

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({})
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [search])

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/inventory${search ? `?search=${search}` : ''}`)
      if (!res.ok) {
        throw new Error('Failed to fetch items')
      }
      const data = await res.json()
      setItems(data)
    } catch (error) {
      toast.error('Failed to fetch inventory items. Please try again.')
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (!res.ok) {
        throw new Error('Failed to add item')
      }
      setNewItem({})
      fetchItems()
      setIsAddDialogOpen(false)
      toast.success('Item added successfully!')
    } catch (error) {
      toast.error('Failed to add item. Please try again.')
    }
  }

  const handleUpdate = async () => {
    if (editingItem) {
      try {
        const res = await fetch(`/api/inventory/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem),
        })
        if (!res.ok) {
          throw new Error('Failed to update item')
        }
        setEditingItem(null)
        fetchItems()
        toast.success('Item updated successfully!')
      } catch (error) {
        toast.error('Failed to update item. Please try again.')
      }
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete item')
      }
      fetchItems()
      toast.success('Item deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete item. Please try again.')
    }
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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(items)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory')
    XLSX.writeFile(workbook, 'inventory.xlsx')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8" style={{
      backgroundImage: `
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}>
      <Toaster position="top-right" />
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
            <div className="flex justify-between">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add New Item</Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
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
              <Button onClick={exportToExcel}>Export to Excel</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white bg-opacity-90">
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-gray-500">No items found. Add some items to your inventory!</p>
            ) : (
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
                          <DialogContent className="bg-white">
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
            )}
          </CardContent>
        </Card>

        <Card className="bg-white bg-opacity-90">
          <CardHeader>
            <CardTitle>Inventory Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-gray-500">No items in inventory. Add some items to see analytics!</p>
            ) : (
              <div className="grid gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Total Inventory Value</h3>
                  <p className="text-3xl font-bold">${getTotalValue().toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Top 5 Items by Value</h3>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}