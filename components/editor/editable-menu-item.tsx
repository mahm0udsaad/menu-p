"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useDrag, useDrop, type DropTargetMonitor } from "react-dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Save, X, Trash2, Star, GripVertical } from "lucide-react"
import { updateMenuItemData, quickUpdateItem } from "@/lib/actions/editor/quick-menu-actions"
import { toast } from "sonner"
import ConfirmationModal from "@/components/ui/confirmation-modal"
import { useMenuEditor } from "@/contexts/menu-editor-context"

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
  isTemporary?: boolean
}

interface DragItem {
  id: string
  index: number
  type: string
}

interface EditableMenuItemProps {
  item: MenuItem
  index: number
  categoryId: string
  onUpdate: (updatedItem: MenuItem) => void
  onDelete: (itemId: string) => void
  onSaveNewItem?: (item: MenuItem) => Promise<void>
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
  onSaveNewItem,
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { appliedRowStyles } = useMenuEditor()

  // Auto-enter edit mode for temporary items
  useEffect(() => {
    if (item.isTemporary && !isEditing) {
      setIsEditing(true)
    }
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [item.isTemporary, isEditing])

  // Update edit data when item changes
  useEffect(() => {
    setEditData({
      name: item.name,
      description: item.description || "",
      price: item.price?.toFixed(2) || "",
    })
  }, [item])

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
    accept: ItemTypes.MENU_ITEM,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(draggedItem: DragItem, monitor: DropTargetMonitor) {
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
    item: () => ({ id: item.id, index, type: ItemTypes.MENU_ITEM }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (draggedItem, monitor) => {
      if (!monitor.didDrop()) {
        // If dropped outside a valid target, handle it here if needed
      }
    }
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
    
    try {
      if (item.isTemporary && onSaveNewItem) {
        // Handle saving temporary items
        const updatedItem = {
          ...item,
          name: editData.name,
          description: editData.description,
          price: isNaN(price!) ? null : price,
        }
        await onSaveNewItem(updatedItem)
        setIsEditing(false)
      } else {
        // Handle updating existing items
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
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ")
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    if (item.isTemporary) {
      // Delete temporary item if user cancels
      onDelete(item.id)
    } else {
      // Reset to original values for existing items
      setEditData({
        name: item.name,
        description: item.description || "",
        price: item.price?.toFixed(2) || "",
      })
      setIsEditing(false)
    }
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

  const handleDeleteConfirm = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDelete(item.id)
    }, 300); // Wait for animation to finish
    setIsDeleteModalOpen(false)
  }

  const opacity = isDragging ? 0 : (isVisible ? 1 : 0);

  // If custom render is provided, use it
  if (customRender) {
    return customRender({
      item,
      onUpdate,
      onDelete,
    })
  }

  return (
    <div 
      ref={preview}
      style={{
        opacity,
        transition: 'opacity 300ms ease-in-out, max-height 300ms ease-in-out',
        maxHeight: isVisible ? '1000px' : '0',
        overflow: 'hidden',
      }}
    >
      <div
        ref={ref}
        data-handler-id={handlerId}
        className={`group relative p-3 sm:p-4 bg-white hover:bg-slate-50 ${
          !item.is_available ? "opacity-60" : ""
        } ${item.isTemporary ? "ring-2 ring-blue-200 bg-blue-50" : ""}`}
        style={{
          border: appliedRowStyles.border ? `1px solid ${appliedRowStyles.borderColor}` : 'none',
          borderRadius: `${appliedRowStyles.borderRadius}px`,
        }}
      >
        <div className="flex gap-3 sm:gap-4">
          {/* Drag handle */}
          <div className="cursor-move pt-1 flex-shrink-0">
            <GripVertical className="h-5 w-5 text-slate-400" />
          </div>

          {isEditing ? (
            // EDIT MODE
            <div className="flex-1 space-y-3">
              {/* Action buttons at the top */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleSave} 
                    size="sm" 
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    size="sm" 
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {item.isTemporary ? "حذف" : "إلغاء"}
                  </Button>
                </div>
                {item.isTemporary && (
                  <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                    عنصر جديد
                  </span>
                )}
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    اسم الطبق
                  </label>
                  <Input
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    placeholder="اسم الطبق"
                    className="text-lg sm:text-xl font-semibold h-12"
                    autoFocus={item.isTemporary}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    السعر
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      value={editData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="pl-8 text-lg font-bold h-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    الوصف
                  </label>
                  <Textarea
                    name="description"
                    value={editData.description}
                    onChange={handleInputChange}
                    placeholder="إضافة وصف..."
                    className="text-sm resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ) : (
            // VIEW MODE
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg sm:text-xl font-semibold capitalize leading-tight" style={{ color: appliedRowStyles.itemColor, textShadow: appliedRowStyles.textShadow ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                  {item.name}
                </h3>
                <Button
                  onClick={toggleFeatured}
                  size="sm"
                  variant="ghost"
                  className="p-1 h-auto transition-opacity flex-shrink-0"
                >
                  <Star className={`h-4 w-4 ${item.is_featured ? "text-amber-500 fill-current" : "text-slate-300"}`} />
                </Button>
              </div>
              
              {item.description && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: appliedRowStyles.descriptionColor, textShadow: appliedRowStyles.textShadow ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                  {item.description}
                </p>
              )}
              
              <div className="text-lg sm:text-xl font-bold" style={{ color: appliedRowStyles.priceColor, textShadow: appliedRowStyles.textShadow ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none' }}>
                {item.price ? `$${item.price.toFixed(2)}` : ""}
              </div>
            </div>
          )}

          {/* Action buttons in view mode */}
          {!isEditing && (
            <div className="flex flex-col items-center gap-2 transition-opacity flex-shrink-0">
              <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
              <Button onClick={() => setIsDeleteModalOpen(true)} size="sm" variant="ghost" className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`حذف "${item.name}"`}
        description="هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  )
}
