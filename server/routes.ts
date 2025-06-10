import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertProductSchema, insertNotificationSchema, insertNotificationTemplateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Documentation endpoint
  app.get("/api", (req, res) => {
    const apiDocs = {
      title: "Product Notification Management API",
      version: "1.0.0",
      description: "REST API for managing products, customers, and notifications",
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      endpoints: {
        customers: {
          "GET /api/customers": "Get all customers",
          "GET /api/customers/:id": "Get customer by ID",
          "POST /api/customers": "Create new customer",
          "PUT /api/customers/:id": "Update customer",
          "DELETE /api/customers/:id": "Delete customer"
        },
        products: {
          "GET /api/products": "Get all products (use ?active=true for active only)",
          "GET /api/products/:id": "Get product by ID",
          "POST /api/products": "Create new product",
          "PUT /api/products/:id": "Update product",
          "DELETE /api/products/:id": "Delete product"
        },
        notifications: {
          "GET /api/notifications": "Get all notifications (supports ?from=date&to=date filtering)",
          "GET /api/notifications/:id": "Get notification by ID",
          "POST /api/notifications": "Create new notification",
          "DELETE /api/notifications/:id": "Delete notification"
        },
        templates: {
          "GET /api/templates": "Get all notification templates",
          "GET /api/templates/:id": "Get template by ID",
          "POST /api/templates": "Create new template",
          "PUT /api/templates/:id": "Update template",
          "DELETE /api/templates/:id": "Delete template"
        },
        stats: {
          "GET /api/stats": "Get application statistics"
        }
      },
      schemas: {
        Customer: {
          id: "number",
          name: "string",
          email: "string",
          phoneNumber: "string"
        },
        Product: {
          id: "number",
          name: "string",
          description: "string | null",
          storeLink: "string | null",
          thumbnailUrl: "string | null",
          isActive: "number (1 for active, 0 for inactive)"
        },
        Notification: {
          id: "number",
          customerId: "number",
          customerEmail: "string",
          customerName: "string",
          customerPhone: "string | null",
          notificationBody: "string",
          templateId: "number | null",
          productIds: "number[]",
          timestamp: "Date"
        },
        NotificationTemplate: {
          id: "number",
          name: "string",
          template: "string",
          description: "string | null",
          isDefault: "number (1 for default, 0 for regular)",
          createdAt: "Date"
        }
      },
      examples: {
        createCustomer: {
          method: "POST",
          url: "/api/customers",
          body: {
            name: "John Doe",
            email: "john@example.com",
            phoneNumber: "+1-555-0123"
          }
        },
        createProduct: {
          method: "POST",
          url: "/api/products",
          body: {
            name: "iPhone 15",
            description: "Latest smartphone",
            storeLink: "https://apple.com/iphone-15",
            thumbnailUrl: "https://example.com/iphone15.jpg",
            isActive: 1
          }
        },
        createNotification: {
          method: "POST",
          url: "/api/notifications",
          body: {
            message: "New iPhone 15 is now available!",
            productIds: [1, 2],
            customerIds: [1, 2, 3]
          }
        },
        dateRangeQuery: {
          method: "GET",
          url: "/api/notifications?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z",
          description: "Get notifications within date range"
        }
      }
    };
    
    res.json(apiDocs);
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      
      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(validatedData.email);
      if (existingCustomer) {
        return res.status(400).json({ message: "Customer with this email already exists" });
      }
      
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const products = activeOnly 
        ? await storage.getActiveProducts()
        : await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.partial().parse(req.body);
      
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const { from, to } = req.query;
      
      let notifications;
      if (from && to) {
        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);
        
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
        
        notifications = await storage.getNotificationsByDateRange(fromDate, toDate);
      } else {
        notifications = await storage.getAllNotifications();
      }
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.getNotification(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const { templateId, productIds, customerIds } = req.body;
      
      // Validate required fields
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Product IDs are required" });
      }
      
      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        return res.status(400).json({ message: "Customer IDs are required" });
      }
      
      // Validate that product IDs exist
      for (const productId of productIds) {
        const product = await storage.getProduct(productId);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${productId} not found` });
        }
      }
      
      // Validate that customer IDs exist
      for (const customerId of customerIds) {
        const customer = await storage.getCustomer(customerId);
        if (!customer) {
          return res.status(400).json({ message: `Customer with ID ${customerId} not found` });
        }
      }
      
      // Validate template if provided
      if (templateId) {
        const template = await storage.getNotificationTemplate(templateId);
        if (!template) {
          return res.status(400).json({ message: `Template with ID ${templateId} not found` });
        }
      }
      
      const notifications = await storage.createNotifications({ templateId, productIds, customerIds });
      res.status(201).json(notifications);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notifications" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Template endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllNotificationTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getNotificationTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertNotificationTemplateSchema.parse(req.body);
      const template = await storage.createNotificationTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNotificationTemplateSchema.partial().parse(req.body);
      const template = await storage.updateNotificationTemplate(id, validatedData);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNotificationTemplate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      const products = await storage.getActiveProducts();
      const customers = await storage.getAllCustomers();
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisWeekNotifications = notifications.filter(
        n => new Date(n.timestamp) >= oneWeekAgo
      );
      
      const stats = {
        totalNotifications: notifications.length,
        activeProducts: products.length,
        totalCustomers: customers.length,
        thisWeek: thisWeekNotifications.length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
