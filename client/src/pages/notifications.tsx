import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { CreateNotificationModal } from "@/components/modals/create-notification-modal";
import { DateFilterModal } from "@/components/modals/date-filter-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Trash2, Smartphone, Headphones, Laptop, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Notification, Product, Customer } from "@shared/schema";

export default function Notifications() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<Notification[]>({
    queryKey: dateFilter 
      ? ["/api/notifications", `from=${dateFilter.from}&to=${dateFilter.to}`]
      : ["/api/notifications"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete notification",
        variant: "destructive",
      });
    },
  });

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

  const getProductNames = (productIds: number[]) => {
    return productIds.map(id => {
      const product = products.find(p => p.id === id);
      return product ? product.name : "Unknown Product";
    });
  };

  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDateFilter = (from: string, to: string) => {
    setDateFilter({ from, to });
  };

  const clearDateFilter = () => {
    setDateFilter(null);
  };

  const notifications = notificationsQuery.data || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Notifications" 
        subtitle="Manage product notifications and announcements"
        onCreateNotification={() => setCreateModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-800">
              All Notifications ({notifications.length})
            </h2>
            {dateFilter && (
              <Badge variant="secondary" className="flex items-center space-x-2">
                <Calendar className="w-3 h-3" />
                <span>Filtered</span>
                <button onClick={clearDateFilter} className="ml-2 hover:bg-slate-300 rounded-full p-0.5">
                  ×
                </button>
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setDateFilterOpen(true)}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Filter by Date</span>
          </Button>
        </div>

        {notificationsQuery.isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications found</h3>
              <p className="text-slate-600 mb-4">
                {dateFilter 
                  ? "No notifications found for the selected date range." 
                  : "Get started by creating your first notification."
                }
              </p>
              <Button onClick={() => setCreateModalOpen(true)}>
                Create Notification
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {notifications.map((notification) => {
              const productNames = getProductNames(notification.productIds);
              const primaryProductName = productNames[0] || "Unknown Product";
              const Icon = getProductIcon(primaryProductName);
              
              return (
                <Card key={notification.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="text-primary w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-slate-800">{primaryProductName}</h3>
                            {productNames.length > 1 && (
                              <Badge variant="secondary">+{productNames.length - 1} more</Badge>
                            )}
                          </div>
                          
                          <p className="text-slate-600 mb-3">{notification.notificationBody}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Customer:</span>
                              <div className="text-slate-600">{notification.customerName}</div>
                              <div className="text-slate-500">{notification.customerEmail}</div>
                              {notification.customerPhone && (
                                <div className="text-slate-500">{notification.customerPhone}</div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Products:</span>
                              <div className="text-slate-600">{productNames.join(", ")}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <div className="flex items-center space-x-4">
                              <span>Customer ID: {notification.customerId}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span>{formatDate(notification.timestamp)}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              Delivered
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
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
