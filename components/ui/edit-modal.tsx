
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue: string | number;
  onSubmit: (value: string) => void;
}

export function EditModal({ isOpen, onClose, title, initialValue, onSubmit }: EditModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSubmit = () => {
    onSubmit(String(value));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value-input" className="text-right">
              Value
            </Label>
            <Input
              id="value-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
