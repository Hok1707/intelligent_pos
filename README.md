
# SmartPOS - AI-Powered Smartphone Shop Management System

SmartPOS is a comprehensive SaaS solution designed for smartphone retailers. It combines Point of Sale (POS), Inventory Management, Customer Relationship Management (CRM), and advanced AI tools powered by Google Gemini.

## 🚀 Project Overview

This project is built with a modern React stack, utilizing a mock backend (`axios-mock-adapter`) to simulate a real-world API environment. It is designed with multi-tenancy at its core, allowing multiple shops to operate in isolation on the same platform.

### Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **State Management**: Zustand (with persistence for theme/auth)
*   **UI Framework**: Tailwind CSS
*   **Routing**: React Router v6
*   **Forms**: React Hook Form + Zod
*   **Charts**: Recharts
*   **AI Integration**: Google GenAI SDK (Gemini 1.5 Flash / Pro)
*   **Mock Backend**: Axios Mock Adapter

---

## ✨ Functional Features

### 🛒 Point of Sale (POS) & Orders
*   **POS Interface**: Fast and intuitive interface for ringing up sales. Browse products, add to cart, and checkout.
*   **Payments**: Integrated payment modal supporting Cash, Card, and **Bakong KHQR** (Mocked) integration.
*   **Order Management**: View order history with status filtering (Paid/Pending/Cancelled), sorting, and payment updates.
*   **Auto-Stock Deduction**: Creating an order automatically reduces inventory levels.

### 📊 Dashboard & Analytics
*   **Real-time Overview**: Key metrics tracking (Total Sales, Sales Today, Low Stock Items).
*   **Recent Orders**: Quick view of the latest transactions directly on the dashboard.
*   **Interactive Charts**: Visual sales trends (Bar/Line charts) and inventory distribution.
*   **Low Stock Alerts**: Instant notifications for items falling below configurable thresholds.

### 📦 Inventory Management
*   **Stock Tracking**: Comprehensive grid view with search, filtering by category, and pagination.
*   **Bulk Actions**: Select multiple items to delete or update quantities in one go.
*   **Category Management**: Create, rename, and delete product categories.
*   **Export Data**: Download inventory data as CSV.
*   **Low Stock Settings**: Configurable threshold for low stock warnings.

### 🧾 Billing & Invoices
*   **Invoice Generation**: Create professional invoices with dynamic line items, tax calculations, and due dates.
*   **Status Tracking**: Monitor paid, pending, and overdue invoices.
*   **Export Options**: Export invoices to Excel or PDF (Simulated).
*   **Financial Overview**: Track total receivables and paid amounts.

### 💳 Payments & Installments
*   **EMI Calculator**: Built-in tool to calculate monthly payments based on principal, rate, and duration.
*   **Plan Management**: Track customer installment plans, remaining balances, and next due dates.
*   **Payment Schedule**: Detailed breakdown of principal vs. interest for every installment.

### 👥 Customer Relationship Management (CRM)
*   **Customer Profiles**: detailed view of customer info, total spend, and join date.
*   **Purchase History**: View all past invoices associated with a specific customer.
*   **Notes System**: Keep track of customer preferences and interactions.

### 🤖 AI Studio (Powered by Gemini)
*   **AI Assistant**: Chat interface for business queries and task automation (e.g., "Remind me to order stock").
*   **Image Generator**: Create marketing visuals for products using text prompts (supports 1K/2K/4K resolution).
*   **Smart Suggestions**: AI-driven insights for business operations.

### 👤 User & Access Management
*   **Multi-User Support**: Add employees (Managers/Staff) based on subscription limits.
*   **RBAC**: Strict Role-Based Access Control.
*   **Plan Management**: View and upgrade subscription tiers (Starter, Pro, Enterprise).
*   **Subscriber Management**: (Super Admin Only) View and manage all platform subscribers and their plans across all shops.

### ⚙️ General Settings
*   **Dark Mode**: Fully supported dark theme.
*   **Multi-Language**: Toggle between English and Khmer support.
*   **Profile Management**: Update user details and avatar.

---

## 🔐 Architecture & Multi-tenancy

### 1. Multi-tenancy Strategy
The application uses a **Discriminator Column** strategy. Every primary entity (User, StockItem, Customer, Invoice) contains a `shopId` field.
*   **Isolation**: The backend (simulated in `services/api.ts`) filters all data queries by the logged-in user's `shopId`.
*   **Global Admin**: Users with the `admin` role ignore this filter and can see data across all shops.

### 2. Authentication
*   **Token-based**: Uses a simulated JWT token stored in `localStorage`.
*   **Interceptor**: An Axios interceptor automatically attaches the `Authorization: Bearer <token>` header to every request.

---

## 🛡️ Role-Based Access Control (RBAC)

The system defines three primary roles: `admin`, `manager`, and `staff`.

| Feature / Action | Admin (Global) | Manager (Shop Owner) | Staff |
| :--- | :---: | :---: | :---: |
| **Scope** | All Shops | Own Shop Only | Own Shop Only |
| **View Dashboard** | ✅ | ✅ | ✅ |
| **Manage Stock** | ✅ (Create/Edit/Delete) | ✅ (Create/Edit/Delete) | ✅ (Create/Edit/Delete) |
| **View Reports** | ✅ | ✅ | ❌ |
| **Manage Users** | ✅ | ✅ (Staff/Mgr only) | ❌ |
| **Manage Subscribers** | ✅ | ❌ | ❌ |
| **Manage Plans** | ✅ | ✅ | ❌ |
| **POS & Orders** | ✅ | ✅ | ✅ |
| **Billing/Invoices** | ✅ | ✅ | ✅ |
| **AI Tools** | ✅ | ✅ | ✅ |
| **Export Data** | ✅ | ✅ | ❌ |

### Implementation Details
*   **UI Level**: Navigation links (Reports, Users, Plans, Subscribers) are hidden for specific roles in `Layout.tsx` using `allowedRoles` or `deniedRole` properties.
*   **API Level**: The mock backend (`api.ts`) inspects the user's role before processing sensitive requests.

---

## 💾 Data Models

### User
```typescript
interface User {
  id: string;
  shopId: string;      // Partition Key
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'inactive';
  // ... other profile fields
}
```

### StockItem (Product)
```typescript
interface StockItem {
  id: string;
  shopId: string;      // Partition Key
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}
```

### Order
```typescript
interface Order {
  id: string;
  shopId: string;
  orderNumber: string;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  items: OrderItem[];
  // ...
}
```

---

## 🔌 API Endpoints (Mocked)

All endpoints are prefixed with `/api/v1` (simulated).

### Auth
*   `POST /auth/login`: Returns User object + Token.
*   `POST /auth/register`: Creates a new Manager user and a new `shopId`.
*   `PUT /auth/profile/:id`: Update profile details.

### Resources
*   `GET /stock`: Returns items for current `shopId`.
*   `POST /stock`: Create item.
*   `DELETE /stock/:id`: Delete item (Available to all roles in store context).
*   `GET /orders`: List orders.
*   `POST /orders`: Create new order (POS).
*   `GET /users`: Returns employees for current `shopId` (Or all if Admin).
*   `POST /users`: Create employee (**Manager Only**).

---

## 🛠️ Setup for Backend Implementation

To migrate this from the mock adapter to a real backend (Node.js/Python/Go):

1.  **Remove Mock Adapter**: Delete `services/api.ts` (or the mock setup block within it).
2.  **Environment Variables**: Set `REACT_APP_API_URL` to your backend server URL.
3.  **Middleware**: Implement a middleware in your backend to:
    *   Verify the JWT token.
    *   Extract `shopId` and `role` from the token claims or database.
    *   Inject `shopId` into every database query to ensure isolation.
4.  **RBAC Middleware**: Create a middleware to check permissions for sensitive routes.
