"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface InlineEditableProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
  inputClassName?: string
  type?: "text" | "number"
}

export default function InlineEditable({
  value,
  onSave,
  placeholder = "Click to edit",
  multiline = false,
  className,
  inputClassName,
  type = "text",
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (type === "text") {
        inputRef.current.select()
      }
    }
  }, [isEditing, type])

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    } else if (e.key === "Enter" && multiline && e.ctrlKey) {
      handleSave()
    }
  }

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input

    return (
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("border-emerald-400 focus:border-emerald-500", inputClassName)}
        type={type}
        step={type === "number" ? "0.01" : undefined}
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5 transition-colors min-h-[1.5rem] flex items-center",
        !value && "text-slate-400 italic",
        className,
      )}
    >
      {value || placeholder}
    </div>
  )
}
