import { Link, useLocation } from "wouter";
import { Bell, Home, Package, Users, FileText, Plus } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/templates", icon: FileText, label: "Templates" },
    { path: "/products", icon: Package, label: "Products" },
    { path: "/customers", icon: Users, label: "Customers" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bell className="text-white w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">NotifyPro</h1>
        </div>
      </div>
      
      <nav className="px-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Actions
          </div>
          <Link href="/notifications">
            <a className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all">
              <Plus className="w-5 h-5" />
              <span>Create Notification</span>
            </a>
          </Link>
        </div>
      </nav>
    </div>
  );
}
