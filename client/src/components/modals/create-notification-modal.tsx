import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Customer, NotificationTemplate } from "@shared/schema";

interface CreateNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNotificationModal({ open, onOpenChange }: CreateNotificationModalProps) {
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [useTemplate, setUseTemplate] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?active=true"],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: templates = [] } = useQuery<NotificationTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Template handling
  const selectedTemplate = templates.find(t => t.id.toString() === selectedTemplateId);
  
  useEffect(() => {
    if (selectedTemplate && useTemplate) {
      setMessage(selectedTemplate.template);
    }
  }, [selectedTemplate, useTemplate]);

  // Template field interpolation
  const interpolateTemplate = (template: string, customer: Customer, product: Product) => {
    return template
      .replace(/\{\{customer\.name\}\}/g, customer.name)
      .replace(/\{\{customer\.email\}\}/g, customer.email)
      .replace(/\{\{customer\.phoneNumber\}\}/g, customer.phoneNumber || '')
      .replace(/\{\{product\.name\}\}/g, product.name)
      .replace(/\{\{product\.description\}\}/g, product.description || '')
      .replace(/\{\{product\.storeLink\}\}/g, product.storeLink || '')
      .replace(/\{\{product\.thumbnailUrl\}\}/g, product.thumbnailUrl || '');
  };

  const createNotificationMutation = useMutation({
    mutationFn: async (data: { templateId?: number; productIds: number[]; customerIds: number[] }) => {
      return apiRequest("POST", "/api/notifications", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create notification",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedProductIds([]);
    setSelectedCustomerIds([]);
    setMessage("");
    setCustomerSearch("");
    setSelectedTemplateId("");
    setUseTemplate(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProductIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedCustomerIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one customer",
        variant: "destructive",
      });
      return;
    }
    
    if (useTemplate && !selectedTemplateId) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    createNotificationMutation.mutate({
      templateId: useTemplate && selectedTemplate ? selectedTemplate.id : undefined,
      productIds: selectedProductIds,
      customerIds: selectedCustomerIds,
    });
  };

  const handleProductToggle = (productId: number) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCustomerToggle = (customerId: number) => {
    setSelectedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Notification</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useTemplate"
                checked={useTemplate}
                onCheckedChange={(checked) => setUseTemplate(checked === true)}
              />
              <Label htmlFor="useTemplate" className="text-sm font-medium">Use Template</Label>
            </div>
            
            {useTemplate && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{template.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <span className="font-medium">Preview:</span> {selectedTemplate.template}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-800 mb-3 block">Select Products</Label>
            {productsLoading ? (
              <div className="text-sm text-slate-500">Loading products...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-lg">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all">
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={() => handleProductToggle(product.id)}
                    />
                    <span className="text-sm font-medium text-slate-800">{product.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-800 mb-3 block">Select Customers</Label>
            <div className="relative mb-3">
              <Input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
            </div>
            {customersLoading ? (
              <div className="text-sm text-slate-500">Loading customers...</div>
            ) : (
              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg">
                {filteredCustomers.map((customer) => (
                  <label key={customer.id} className="flex items-center space-x-3 p-3 hover:bg-slate-50 cursor-pointer transition-all">
                    <Checkbox
                      checked={selectedCustomerIds.includes(customer.id)}
                      onCheckedChange={() => handleCustomerToggle(customer.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{customer.name}</div>
                      <div className="text-xs text-slate-500">{customer.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-800 mb-3 block">Notification Message</Label>
            <Textarea
              rows={4}
              placeholder="Write your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Write a compelling message about your product launch</span>
              <span>{message.length}/500</span>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createNotificationMutation.isPending}
            >
              {createNotificationMutation.isPending ? "Creating..." : "Create Notification"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
