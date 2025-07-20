"use client"

import { Draggable } from "react-dnd"
import { GripVertical, Edit, Trash2, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MenuItem as MenuItemType } from "@/types/menu"

interface MenuItemProps {
  item: MenuItemType
  index: number
  onEdit: (item: MenuItemType) => void
  onDelete: (id: string) => void
}

export function MenuItem({ item, index, onEdit, onDelete }: MenuItemProps) {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group relative bg-white rounded-lg border transition-all duration-200 ${
            snapshot.isDragging
              ? "shadow-2xl border-blue-300 scale-105 rotate-1"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          } ${!item.isAvailable ? "opacity-75" : ""}`}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              <div
                {...provided.dragHandleProps}
                className="mt-1 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded-md hover:bg-gray-100 transition-colors"
              >
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Item Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      {item.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {!item.isAvailable && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-600">Sold Out</span>
                        </div>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{item.description}</p>
                    )}

                    {item.dietaryInfo.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.dietaryInfo.map((dietary) => (
                          <Badge key={dietary} variant="secondary" className="text-xs">
                            {dietary}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="font-bold text-lg text-gray-900">
                      {item.currency}
                      {item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
