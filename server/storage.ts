import { 
  customers, 
  products, 
  notifications,
  notificationTemplates,
  type Customer, 
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Notification,
  type InsertNotification,
  type NotificationTemplate,
  type InsertNotificationTemplate
} from "@shared/schema";

export interface IStorage {
  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getAllNotifications(): Promise<Notification[]>;
  getNotificationsByDateRange(from: Date, to: Date): Promise<Notification[]>;
  createNotifications(data: { templateId?: number; productIds: number[]; customerIds: number[] }): Promise<Notification[]>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Template operations
  getNotificationTemplate(id: number): Promise<NotificationTemplate | undefined>;
  getAllNotificationTemplates(): Promise<NotificationTemplate[]>;
  createNotificationTemplate(template: InsertNotificationTemplate): Promise<NotificationTemplate>;
  updateNotificationTemplate(id: number, template: Partial<InsertNotificationTemplate>): Promise<NotificationTemplate | undefined>;
  deleteNotificationTemplate(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private products: Map<number, Product>;
  private notifications: Map<number, Notification>;
  private notificationTemplates: Map<number, NotificationTemplate>;
  private currentCustomerId: number;
  private currentProductId: number;
  private currentNotificationId: number;
  private currentNotificationTemplateId: number;

  constructor() {
    this.customers = new Map();
    this.products = new Map();
    this.notifications = new Map();
    this.notificationTemplates = new Map();
    this.currentCustomerId = 1;
    this.currentProductId = 1;
    this.currentNotificationId = 1;
    this.currentNotificationTemplateId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample customers
    const sampleCustomers = [
      { name: "John Smith", email: "john@example.com", phoneNumber: "+1-555-0123" },
      { name: "Sarah Johnson", email: "sarah@example.com", phoneNumber: "+1-555-0124" },
      { name: "Mike Wilson", email: "mike@example.com", phoneNumber: "+44-20-7946-0958" },
      { name: "Emily Davis", email: "emily@example.com", phoneNumber: "+33-1-42-86-83-26" },
    ];

    for (const customer of sampleCustomers) {
      await this.createCustomer(customer);
    }

    // Sample products
    const sampleProducts = [
      { 
        name: "iPhone 15 Pro", 
        description: "Latest flagship smartphone with titanium design", 
        storeLink: "https://apple.com/iphone-15-pro",
        thumbnailUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium.jpg",
        isActive: 1 
      },
      { 
        name: "MacBook Air M2", 
        description: "Thin and light laptop with M2 chip", 
        storeLink: "https://apple.com/macbook-air-m2",
        thumbnailUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606.jpg",
        isActive: 1 
      },
      { 
        name: "AirPods Pro", 
        description: "Wireless earbuds with noise cancellation", 
        storeLink: "https://apple.com/airpods-pro",
        thumbnailUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83.jpg",
        isActive: 1 
      },
      { 
        name: "iPad Pro", 
        description: "Professional tablet with M2 chip", 
        storeLink: "https://apple.com/ipad-pro",
        thumbnailUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202210.jpg",
        isActive: 1 
      },
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }

    // Sample notification templates
    const sampleTemplates = [
      {
        name: "Product Launch",
        template: "Hi {{customer.name}}, exciting news! We've just launched {{product.name}} - {{product.description}}. Check it out at {{product.storeLink}}!",
        description: "Template for new product launches",
        isDefault: 1
      },
      {
        name: "Product Update",
        template: "Hello {{customer.name}}, we've updated {{product.name}}! Contact us at {{customer.phoneNumber}} if you have questions.",
        description: "Template for product updates",
        isDefault: 0
      },
      {
        name: "Special Offer",
        template: "Dear {{customer.name}}, special offer on {{product.name}}! Visit {{product.storeLink}} to learn more.",
        description: "Template for special offers and promotions",
        isDefault: 0
      }
    ];

    for (const template of sampleTemplates) {
      await this.createNotificationTemplate(template);
    }
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.email === email,
    );
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getActiveProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isActive === 1);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      id,
      name: insertProduct.name,
      description: insertProduct.description ?? null,
      storeLink: insertProduct.storeLink ?? null,
      thumbnailUrl: insertProduct.thumbnailUrl ?? null,
      isActive: insertProduct.isActive !== undefined ? insertProduct.isActive : 1
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getNotificationsByDateRange(from: Date, to: Date): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => {
        const notificationDate = new Date(notification.timestamp);
        return notificationDate >= from && notificationDate <= to;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createNotifications(data: { templateId?: number; productIds: number[]; customerIds: number[] }): Promise<Notification[]> {
    const createdNotifications: Notification[] = [];
    const template = data.templateId ? await this.getNotificationTemplate(data.templateId) : null;
    
    // Create one notification per customer
    for (const customerId of data.customerIds) {
      const customer = await this.getCustomer(customerId);
      if (!customer) continue;
      
      // Get first product for template interpolation (can be enhanced to handle multiple products)
      const product = data.productIds.length > 0 ? await this.getProduct(data.productIds[0]) : null;
      
      let notificationBody = template?.template || "Default notification message";
      
      // Interpolate template fields if template and product exist
      if (template && product) {
        notificationBody = template.template
          .replace(/\{\{customer\.name\}\}/g, customer.name)
          .replace(/\{\{customer\.email\}\}/g, customer.email)
          .replace(/\{\{customer\.phoneNumber\}\}/g, customer.phoneNumber || '')
          .replace(/\{\{product\.name\}\}/g, product.name)
          .replace(/\{\{product\.description\}\}/g, product.description || '')
          .replace(/\{\{product\.storeLink\}\}/g, product.storeLink || '')
          .replace(/\{\{product\.thumbnailUrl\}\}/g, product.thumbnailUrl || '');
      }
      
      const id = this.currentNotificationId++;
      const notification: Notification = {
        id,
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phoneNumber,
        notificationBody,
        templateId: data.templateId || null,
        productIds: data.productIds,
        timestamp: new Date()
      };
      
      this.notifications.set(id, notification);
      createdNotifications.push(notification);
    }
    
    return createdNotifications;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Template methods
  async getNotificationTemplate(id: number): Promise<NotificationTemplate | undefined> {
    return this.notificationTemplates.get(id);
  }

  async getAllNotificationTemplates(): Promise<NotificationTemplate[]> {
    return Array.from(this.notificationTemplates.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createNotificationTemplate(insertTemplate: InsertNotificationTemplate): Promise<NotificationTemplate> {
    const id = this.currentNotificationTemplateId++;
    const template: NotificationTemplate = {
      id,
      name: insertTemplate.name,
      template: insertTemplate.template,
      description: insertTemplate.description || null,
      isDefault: insertTemplate.isDefault !== undefined ? insertTemplate.isDefault : 0,
      createdAt: new Date()
    };
    this.notificationTemplates.set(id, template);
    return template;
  }

  async updateNotificationTemplate(id: number, updates: Partial<InsertNotificationTemplate>): Promise<NotificationTemplate | undefined> {
    const template = this.notificationTemplates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...updates };
    this.notificationTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteNotificationTemplate(id: number): Promise<boolean> {
    return this.notificationTemplates.delete(id);
  }
}

export const storage = new MemStorage();
