import { User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  onCreateNotification?: () => void;
}

export function Header({ title, subtitle, onCreateNotification }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-600 mt-1">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {onCreateNotification && (
            <Button onClick={onCreateNotification} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Notification</span>
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <User className="text-slate-600 w-4 h-4" />
            </div>
            <span className="text-slate-700 font-medium">Admin User</span>
          </div>
        </div>
      </div>
    </header>
  );
}
