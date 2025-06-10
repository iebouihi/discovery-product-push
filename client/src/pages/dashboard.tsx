import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { CreateNotificationModal } from "@/components/modals/create-notification-modal";
import { DateFilterModal } from "@/components/modals/date-filter-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Package, Users, Calendar, Smartphone, Headphones, Laptop, ArrowUp, ChevronRight, Plus, Code } from "lucide-react";
import { Link } from "wouter";
import type { Notification, Product, Customer } from "@shared/schema";

interface Stats {
  totalNotifications: number;
  activeProducts: number;
  totalCustomers: number;
  thisWeek: number;
}

export default function Dashboard() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const recentNotifications = notifications.slice(0, 3);

  const getProductIcon = (productName: string) => {
    if (productName.toLowerCase().includes('iphone') || productName.toLowerCase().includes('phone')) {
      return Smartphone;
    }
    if (productName.toLowerCase().includes('airpods') || productName.toLowerCase().includes('headphones')) {
      return Headphones;
    }
    if (productName.toLowerCase().includes('macbook') || productName.toLowerCase().includes('laptop')) {
      return Laptop;
    }
    return Package;
  };

  const getProductName = (productIds: number[]) => {
    if (productIds.length === 0) return "Unknown Product";
    const product = products.find(p => p.id === productIds[0]);
    return product ? product.name : "Unknown Product";
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const handleDateFilter = (from: string, to: string) => {
    // This would filter the notifications - for now we'll just log
    console.log("Filter from:", from, "to:", to);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Dashboard" 
        subtitle="Manage your product notifications"
        onCreateNotification={() => setCreateModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Notifications</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalNotifications || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bell className="text-primary w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  12%
                </span>
                <span className="text-slate-600 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Active Products</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.activeProducts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                  <Package className="text-indigo-500 w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  8%
                </span>
                <span className="text-slate-600 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Customers</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.totalCustomers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Users className="text-green-500 w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  24%
                </span>
                <span className="text-slate-600 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">This Week</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.thisWeek || 0}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Calendar className="text-amber-500 w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  18%
                </span>
                <span className="text-slate-600 ml-2">vs last week</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Notifications */}
          <Card className="lg:col-span-2">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Recent Notifications</h2>
                <Link href="/notifications">
                  <a className="text-primary hover:text-blue-600 font-medium text-sm">View All</a>
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No notifications yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Create your first notification
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentNotifications.map((notification) => {
                    const productName = getProductName(notification.productIds);
                    const Icon = getProductIcon(productName);
                    
                    return (
                      <div key={notification.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-all">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="text-primary w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 truncate">{productName}</h3>
                            <span className="text-sm text-slate-500 flex-shrink-0 ml-2">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm mt-1 line-clamp-2">{notification.message}</p>
                          <div className="flex items-center mt-2 space-x-4 text-xs text-slate-500">
                            <span>{notification.customerIds.length} customers</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto hover:border-primary hover:bg-primary/5"
                onClick={() => setCreateModalOpen(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="text-primary w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-800">Create Notification</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Button>
              
              <Link href="/products">
                <Button
                  variant="outline"
                  className="w-full justify-between p-4 h-auto hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                      <Package className="text-indigo-500 w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-800">Manage Products</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Button>
              </Link>
              
              <Link href="/customers">
                <Button
                  variant="outline"
                  className="w-full justify-between p-4 h-auto hover:border-green-500 hover:bg-green-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Users className="text-green-500 w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-800">View Customers</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Button>
              </Link>
              
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto hover:border-amber-500 hover:bg-amber-50"
                onClick={() => setDateFilterOpen(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="text-amber-500 w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-800">Filter by Date</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Button>
            </div>
            
            <div className="p-6 pt-0">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-2">API Integration</h3>
                <p className="text-slate-600 text-sm mb-3">Access notification data programmatically using our REST API.</p>
                <Button 
                  className="w-full bg-slate-800 hover:bg-slate-700"
                  onClick={() => window.open('/api', '_blank')}
                >
                  View API Docs
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      
      <CreateNotificationModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
      
      <DateFilterModal
        open={dateFilterOpen}
        onOpenChange={setDateFilterOpen}
        onApplyFilter={handleDateFilter}
      />
    </div>
  );
}
