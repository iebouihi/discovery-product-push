# Product Notification Management System

A full-stack web application for managing product notifications, built with React frontend and Express.js backend. The system allows users to create and manage notifications that inform customers about new products.

## Features

- **Dashboard**: Overview with statistics and recent notifications
- **Product Management**: Create, edit, delete, and activate/deactivate products
- **Customer Management**: Manage customer database with email contacts
- **Notification System**: Create notifications linking products to customers
- **Date Filtering**: Query notifications within specific time ranges
- **REST API**: Complete RESTful API with comprehensive documentation
- **Responsive Design**: Modern, professional UI that works on all devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **TanStack Query** for state management and API calls
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **In-memory storage** with sample data
- **Zod** for request validation
- **Drizzle ORM** schema definitions

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-notification-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend UI: http://localhost:5000
   - API Documentation: http://localhost:5000/api

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and query client
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # In-memory data storage
│   └── vite.ts            # Vite development server setup
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Data models and validation schemas
└── package.json           # Dependencies and scripts
```

## API Documentation

The REST API provides endpoints for managing customers, products, and notifications. Access the interactive API documentation at `/api` endpoint.

### Base URL
```
http://localhost:5000/api
```

### Key Endpoints

#### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

#### Products
- `GET /api/products` - Get all products
- `GET /api/products?active=true` - Get active products only
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications?from=DATE&to=DATE` - Filter by date range
- `POST /api/notifications` - Create new notification
- `DELETE /api/notifications/:id` - Delete notification

#### Statistics
- `GET /api/stats` - Get application statistics

### Date Range Filtering

Query notifications within a specific time range using ISO 8601 format:

```bash
GET /api/notifications?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z
```

### Example API Requests

#### Create a Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1-555-0123"
  }'
```

#### Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest smartphone",
    "storeLink": "https://apple.com/iphone-15",
    "thumbnailUrl": "https://example.com/iphone15.jpg",
    "isActive": 1
  }'
```

#### Create a Notification
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "message": "New iPhone 15 is now available!",
    "productIds": [1, 2],
    "customerIds": [1, 2, 3]
  }'
```

## Data Models

### Customer
```typescript
{
  id: number
  name: string
  email: string
  phoneNumber: string  // Country + number format (e.g., +1-555-0123)
}
```

### Product
```typescript
{
  id: number
  name: string
  description: string | null
  storeLink: string | null        // URL to product store page
  thumbnailUrl: string | null     // URL to product thumbnail image
  isActive: number  // 1 for active, 0 for inactive
}
```

### Notification
```typescript
{
  id: number
  message: string
  productIds: number[]
  customerIds: number[]
  timestamp: Date
}
```

## Sample Data

The application comes pre-loaded with sample data:

**Customers:**
- John Smith (john@example.com)
- Sarah Johnson (sarah@example.com)
- Mike Wilson (mike@example.com)
- Emily Davis (emily@example.com)

**Products:**
- iPhone 15 Pro
- MacBook Air M2
- AirPods Pro
- iPad Pro

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

The application uses the following environment variables:

- `NODE_ENV` - Application environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string (when using persistent storage)

## Usage Guide

### Creating Notifications

1. Navigate to the Dashboard or Notifications page
2. Click "Create Notification" or "New Notification"
3. Select one or more products from the list
4. Choose customers to notify
5. Write a custom notification message
6. Click "Create Notification"

### Managing Products

1. Go to the Products page via sidebar navigation
2. Use "Add Product" to create new products
3. Edit existing products using the Edit button
4. Toggle product active status with the switch
5. Delete products using the trash icon

### Managing Customers

1. Access the Customers page from the sidebar
2. Add new customers with "Add Customer"
3. Edit customer information as needed
4. Remove customers using the delete button

### Filtering Notifications

1. On the Notifications page, click "Filter by Date"
2. Select start and end dates/times
3. Apply the filter to see notifications in that range
4. Clear the filter to see all notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.