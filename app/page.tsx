'use client'

import { useState } from 'react'
import { create } from 'zustand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Toaster, toast } from 'sonner'
import * as XLSX from 'xlsx'
import { Github } from 'lucide-react'

type InventoryItem = {
    id: number
    name: string
    description: string
    quantity: number
    price: number
    createdAt: Date
}

type InventoryStore = {
    items: InventoryItem[]
    addItem: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void
    updateItem: (id: number, item: Partial<InventoryItem>) => void
    deleteItem: (id: number) => void
}

const useInventoryStore = create<InventoryStore>((set) => ({
    items: [],
    addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: Date.now(), createdAt: new Date() }]
    })),
    updateItem: (id, updatedItem) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, ...updatedItem } : item)
    })),
    deleteItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
    }))
}))

export default function InventoryManagement() {
    const { items, addItem, updateItem, deleteItem } = useInventoryStore()
    const [search, setSearch] = useState('')
    const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id' | 'createdAt'>>({ name: '', description: '', quantity: 0, price: 0 })
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    )

    const handleCreate = () => {
        addItem(newItem)
        setNewItem({ name: '', description: '', quantity: 0, price: 0 })
        setIsAddDialogOpen(false)
        toast.success('Item added successfully!')
    }

    const handleUpdate = () => {
        if (editingItem) {
            updateItem(editingItem.id, editingItem)
            setEditingItem(null)
            setIsEditDialogOpen(false)
            toast.success('Item updated successfully!')
        }
    }

    const handleDelete = (id: number) => {
        deleteItem(id)
        toast.success('Item deleted successfully!')
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
                        <CardTitle className="text-2xl font-bold flex justify-between items-center">
                            Inventory Management
                            <a href="https://github.com/fordus/inventory-management" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                                <Github size={24} />
                            </a>
                        </CardTitle>
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
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                Name
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="Name"
                                                value={newItem.name}
                                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="description" className="text-right">
                                                Description
                                            </Label>
                                            <Input
                                                id="description"
                                                placeholder="Description"
                                                value={newItem.description}
                                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="quantity" className="text-right">
                                                Quantity
                                            </Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                placeholder="Quantity"
                                                value={newItem.quantity}
                                                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="price" className="text-right">
                                                Price
                                            </Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                placeholder="Price"
                                                value={newItem.price}
                                                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                                className="col-span-3"
                                            />
                                        </div>
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
                        {filteredItems.length === 0 ? (
                            <p className="text-center text-gray-500">No items found. Add some items to your inventory!</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>${item.price.toFixed(2)}</TableCell>
                                            <TableCell>{item.createdAt.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="mr-2" onClick={() => setEditingItem(item)}>Edit</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-white">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Item</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="edit-name" className="text-right">
                                                                    Name
                                                                </Label>
                                                                <Input
                                                                    id="edit-name"
                                                                    placeholder="Name"
                                                                    value={editingItem?.name || ''}
                                                                    onChange={(e) => setEditingItem({ ...editingItem!, name: e.target.value })}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="edit-description" className="text-right">
                                                                    Description
                                                                </Label>
                                                                <Input
                                                                    id="edit-description"
                                                                    placeholder="Description"
                                                                    value={editingItem?.description || ''}
                                                                    onChange={(e) => setEditingItem({ ...editingItem!, description: e.target.value })}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="edit-quantity" className="text-right">
                                                                    Quantity
                                                                </Label>
                                                                <Input
                                                                    id="edit-quantity"
                                                                    type="number"
                                                                    placeholder="Quantity"
                                                                    value={editingItem?.quantity || 0}
                                                                    onChange={(e) => setEditingItem({ ...editingItem!, quantity: parseInt(e.target.value) })}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="edit-price" className="text-right">
                                                                    Price
                                                                </Label>
                                                                <Input
                                                                    id="edit-price"
                                                                    type="number"
                                                                    placeholder="Price"
                                                                    value={editingItem?.price || 0}
                                                                    onChange={(e) => setEditingItem({ ...editingItem!, price: parseFloat(e.target.value) })}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
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