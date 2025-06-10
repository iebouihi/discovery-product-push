import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilter: (from: string, to: string) => void;
}

export function DateFilterModal({ open, onOpenChange, onApplyFilter }: DateFilterModalProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromDate || !toDate) {
      return; // Both dates are required
    }
    
    onApplyFilter(fromDate, toDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter by Date Range</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-slate-800 mb-2 block">From Date</Label>
            <Input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-800 mb-2 block">To Date</Label>
            <Input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Apply Filter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
