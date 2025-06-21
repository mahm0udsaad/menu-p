"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Save, X, Trash2, Star, GripVertical } from "lucide-react"
import { updateMenuItemData, quickUpdateItem } from "@/lib/actions/editor/quick-menu-actions"
import { toast } from "sonner"

const ItemTypes = {
  MENU_ITEM: "menu_item",
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | null
  is_available: boolean
  is_featured: boolean
}

interface EditableMenuItemProps {
  item: MenuItem
  index: number
  categoryId: string
  onUpdate: (updatedItem: MenuItem) => void
  onDelete: (itemId: string) => void
  moveItem: (dragIndex: number, hoverIndex: number) => void
  customRender?: (props: {
    item: MenuItem;
    onUpdate: (updatedItem: MenuItem) => void;
    onDelete: (itemId: string) => void;
  }) => React.ReactNode;
}

export default function EditableMenuItem({ 
  item, 
  index, 
  onUpdate, 
  onDelete, 
  moveItem, 
  customRender 
}: EditableMenuItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: item.name,
    description: item.description || "",
    price: item.price?.toFixed(2) || "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null) // Ref for the main draggable/droppable item

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.MENU_ITEM,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(draggedItem: { index: number }, monitor) {
      if (!ref.current) return
      const dragIndex = draggedItem.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveItem(dragIndex, hoverIndex)
      draggedItem.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.MENU_ITEM,
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Apply drag and drop connectors to the main item div (ref.current)
  drag(drop(ref))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const price = editData.price ? Number.parseFloat(editData.price) : null
    const result = await updateMenuItemData(item.id, {
      name: editData.name,
      description: editData.description,
      price: isNaN(price!) ? null : price,
    })

    if (result.success && result.item) {
      onUpdate(result.item as MenuItem)
      setIsEditing(false)
      toast.success("تم حفظ التغييرات بنجاح")
    } else {
      toast.error(result.error || "فشل في حفظ التغييرات")
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setEditData({
      name: item.name,
      description: item.description || "",
      price: item.price?.toFixed(2) || "",
    })
    setIsEditing(false)
  }

  const toggleFeatured = async () => {
    const newFeaturedState = !item.is_featured
    const result = await quickUpdateItem(item.id, "is_featured", newFeaturedState)
    if (result.success) {
      onUpdate({ ...item, is_featured: newFeaturedState })
      toast.success(newFeaturedState ? "تم إضافة العنصر للمميزات" : "تم إزالة العنصر من المميزات")
    } else {
      toast.error(result.error || "فشل في تحديث حالة العنصر")
    }
  }

  // If custom render is provided, use it
  if (customRender) {
    return customRender({
      item,
      onUpdate,
      onDelete,
    })
  }

  const opacity = isDragging ? 0 : 1

  return (
    <div ref={preview} style={{ opacity }} data-handler-id={handlerId}>
      <div
        ref={ref} // This div is now the drag source and drop target
        className={`group relative py-4 px-2 rounded-md hover:bg-slate-50 transition-all ${
          !item.is_available ? "opacity-60" : ""
        }`}
      >
        <div className="flex justify-between items-start gap-4">
          {/* The grip handle is now just a visual indicator within the draggable item */}
          <div className="cursor-move pt-1">
            <GripVertical className="h-5 w-5 text-slate-400" />
          </div>
          {isEditing ? (
            // EDIT MODE
            <div className="flex-1 space-y-2">
              <Input
                name="name"
                value={editData.name}
                onChange={handleInputChange}
                placeholder="اسم الطبق"
                className="text-xl font-semibold"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  name="price"
                  type="number"
                  value={editData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pl-7 font-bold"
                />
              </div>
              <Textarea
                name="description"
                value={editData.description}
                onChange={handleInputChange}
                placeholder="إضافة وصف..."
                className="text-sm"
                rows={2}
              />
              <div className="flex items-center gap-2 pt-2">
                <Button onClick={handleSave} size="sm" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "جاري الحفظ..." : "حفظ"}
                </Button>
                <Button onClick={handleCancel} size="sm" variant="ghost">
                  <X className="h-4 w-4 mr-2" />
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            // VIEW MODE
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-slate-800 capitalize">{item.name}</h3>
                <Button
                  onClick={toggleFeatured}
                  size="sm"
                  variant="ghost"
                  className="p-1 h-auto transition-opacity"
                >
                  <Star className={`h-4 w-4 ${item.is_featured ? "text-amber-500 fill-current" : "text-slate-300"}`} />
                </Button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">{item.description}</p>
              <div className="text-xl font-bold text-slate-800">{item.price ? `$${item.price.toFixed(2)}` : ""}</div>
            </div>
          )}

          {/* Action buttons in view mode */}
          {!isEditing && (
            <div className="flex flex-col items-center gap-2 transition-opacity">
              <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              <Button onClick={() => onDelete(item.id)} size="sm" variant="ghost" className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
