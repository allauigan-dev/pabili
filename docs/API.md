# Pabili API Documentation

Complete API reference for building a React Native client application.

---

## Overview

| Property | Value |
|----------|-------|
| **Base URL** | `https://your-domain.com/api` (or `http://localhost:5173/api` for development) |
| **Content-Type** | `application/json` (except file uploads) |
| **Authentication** | Not yet implemented |

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Success Response (with message only)

```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error / invalid ID) |
| `404` | Not Found |
| `500` | Internal Server Error |
| `501` | Not Implemented |
| `503` | Service Unavailable |

---

## Health Check

### `GET /api/health`

Check if the API is running.

**Response**

```json
{
  "success": true,
  "message": "Pabili API is running",
  "timestamp": "2026-01-05T00:00:00.000Z"
}
```

---

## Orders API

Base path: `/api/orders`

### Data Model: Order

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Primary key (auto-increment) |
| `orderNumber` | `string` | Unique order identifier (e.g., `ORD-ABC123-XYZ1`) |
| `userId` | `integer?` | Optional user ID |
| `orderName` | `string` | **Required.** Name/description of the order item |
| `orderDescription` | `string?` | Detailed description |
| `orderQuantity` | `integer` | Quantity (default: 1) |
| `orderImage` | `string?` | URL to order image |
| `orderPrice` | `number` | **Required.** Cost per unit |
| `orderFee` | `number` | Fee per unit (default: 0) |
| `orderResellerPrice` | `number` | **Required.** Reseller's selling price per unit |
| `orderTotal` | `number` | Calculated: `quantity * (price + fee)` |
| `orderResellerTotal` | `number` | Calculated: `quantity * reseller_price` |
| `orderStatus` | `enum` | Status (see below) |
| `orderDate` | `string` | ISO timestamp |
| `storeId` | `integer` | **Required.** Reference to store |
| `resellerId` | `integer` | **Required.** Reference to reseller |
| `invoiceId` | `integer?` | Optional reference to invoice |
| `createdAt` | `string` | ISO timestamp |
| `updatedAt` | `string` | ISO timestamp |
| `deletedAt` | `string?` | Soft delete timestamp (null if active) |
| `storeName` | `string` | Joined: store name (read-only) |
| `resellerName` | `string` | Joined: reseller name (read-only) |

**Order Status Values**

| Status | Description |
|--------|-------------|
| `pending` | Order placed, awaiting action |
| `bought` | Item has been purchased |
| `packed` | Item is packed for delivery |
| `delivered` | Item delivered to reseller |
| `cancelled` | Order cancelled |
| `no_stock` | Item not available |

---

### `GET /api/orders`

List all orders (excluding soft-deleted).

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-LQ8J4K5M-A1B2",
      "userId": null,
      "orderName": "Sample Product",
      "orderDescription": "Product description",
      "orderQuantity": 2,
      "orderImage": null,
      "orderPrice": 100.00,
      "orderFee": 10.00,
      "orderResellerPrice": 150.00,
      "orderTotal": 220.00,
      "orderResellerTotal": 300.00,
      "orderStatus": "pending",
      "orderDate": "2026-01-05T00:00:00.000Z",
      "storeId": 1,
      "resellerId": 1,
      "invoiceId": null,
      "createdAt": "2026-01-05T00:00:00.000Z",
      "updatedAt": "2026-01-05T00:00:00.000Z",
      "deletedAt": null,
      "storeName": "Store A",
      "resellerName": "John Doe"
    }
  ]
}
```

---

### `GET /api/orders/:id`

Get a single order by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Order ID |

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

**Errors**

| Status | Error |
|--------|-------|
| `400` | Invalid order ID |
| `404` | Order not found |

---

### `POST /api/orders`

Create a new order.

**Request Body**

```json
{
  "orderName": "Product Name",
  "orderDescription": "Optional description",
  "orderQuantity": 2,
  "orderImage": "https://example.com/image.jpg",
  "orderPrice": 100.00,
  "orderFee": 10.00,
  "orderResellerPrice": 150.00,
  "storeId": 1,
  "resellerId": 1,
  "invoiceId": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderName` | `string` | ✅ | Min 1 character |
| `orderDescription` | `string` | ❌ | |
| `orderQuantity` | `integer` | ❌ | Default: 1, must be positive |
| `orderImage` | `string` | ❌ | URL to image |
| `orderPrice` | `number` | ✅ | Must be positive |
| `orderFee` | `number` | ❌ | Default: 0, must be >= 0 |
| `orderResellerPrice` | `number` | ✅ | Must be positive |
| `storeId` | `integer` | ✅ | Must be positive |
| `resellerId` | `integer` | ✅ | Must be positive |
| `invoiceId` | `integer` | ❌ | Optional, must be positive if provided |

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-LQ8J4K5M-A1B2",
    ...
  }
}
```

---

### `PUT /api/orders/:id`

Update an existing order.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Order ID |

**Request Body**

All fields from POST are optional. Only include fields you want to update.

```json
{
  "orderQuantity": 5,
  "orderStatus": "bought"
}
```

> [!NOTE]
> If `orderQuantity`, `orderPrice`, `orderFee`, or `orderResellerPrice` are updated, the `orderTotal` and `orderResellerTotal` will be automatically recalculated.

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `PATCH /api/orders/:id/status`

Update only the order status.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Order ID |

**Request Body**

```json
{
  "status": "bought"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | `enum` | ✅ | `pending`, `bought`, `packed`, `delivered`, `cancelled`, `no_stock` |

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `DELETE /api/orders/:id`

Soft delete an order (sets `deletedAt` timestamp).

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Order ID |

**Response**

```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

---

## Stores API

Base path: `/api/stores`

### Data Model: Store

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Primary key (auto-increment) |
| `storeName` | `string` | **Required.** Store name |
| `storeAddress` | `string?` | Address |
| `storePhone` | `string?` | Phone number |
| `storeEmail` | `string?` | Email address |
| `storeLogo` | `string?` | URL to logo image |
| `storeCover` | `string?` | URL to cover image |
| `storeDescription` | `string?` | Description |
| `storeStatus` | `enum` | `active` or `inactive` (default: `active`) |
| `createdAt` | `string` | ISO timestamp |
| `updatedAt` | `string` | ISO timestamp |
| `deletedAt` | `string?` | Soft delete timestamp |

---

### `GET /api/stores`

List all stores (excluding soft-deleted).

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "storeName": "SM Mall",
      "storeAddress": "123 Main St, Manila",
      "storePhone": "+63 912 345 6789",
      "storeEmail": "store@example.com",
      "storeLogo": null,
      "storeCover": null,
      "storeDescription": "Large department store",
      "storeStatus": "active",
      "createdAt": "2026-01-05T00:00:00.000Z",
      "updatedAt": "2026-01-05T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### `GET /api/stores/:id`

Get a single store by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Store ID |

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

**Errors**

| Status | Error |
|--------|-------|
| `400` | Invalid store ID |
| `404` | Store not found |

---

### `POST /api/stores`

Create a new store.

**Request Body**

```json
{
  "storeName": "New Store",
  "storeAddress": "456 Oak Ave",
  "storePhone": "+63 912 345 6789",
  "storeEmail": "store@example.com",
  "storeLogo": "https://example.com/logo.jpg",
  "storeCover": "https://example.com/cover.jpg",
  "storeDescription": "Store description",
  "storeStatus": "active"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `storeName` | `string` | ✅ | Min 1 character |
| `storeAddress` | `string` | ❌ | |
| `storePhone` | `string` | ❌ | |
| `storeEmail` | `string` | ❌ | Valid email or empty string |
| `storeLogo` | `string` | ❌ | URL |
| `storeCover` | `string` | ❌ | URL |
| `storeDescription` | `string` | ❌ | |
| `storeStatus` | `enum` | ❌ | `active` (default) or `inactive` |

**Response** (201 Created)

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `PUT /api/stores/:id`

Update an existing store.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Store ID |

**Request Body**

All fields from POST are optional.

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `DELETE /api/stores/:id`

Soft delete a store.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Store ID |

**Response**

```json
{
  "success": true,
  "message": "Store deleted successfully"
}
```

---

## Resellers API

Base path: `/api/resellers`

### Data Model: Reseller

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Primary key (auto-increment) |
| `resellerName` | `string` | **Required.** Reseller name |
| `resellerAddress` | `string?` | Address |
| `resellerPhone` | `string?` | Phone number |
| `resellerEmail` | `string?` | Email |
| `resellerPhoto` | `string?` | URL to photo |
| `resellerDescription` | `string?` | Description |
| `resellerStatus` | `enum` | `active` or `inactive` (default: `active`) |
| `createdAt` | `string` | ISO timestamp |
| `updatedAt` | `string` | ISO timestamp |
| `deletedAt` | `string?` | Soft delete timestamp |

---

### `GET /api/resellers`

List all resellers (excluding soft-deleted).

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "resellerName": "Juan Dela Cruz",
      "resellerAddress": "Barangay 123, City",
      "resellerPhone": "+63 912 345 6789",
      "resellerEmail": "juan@example.com",
      "resellerPhoto": null,
      "resellerDescription": "Regular reseller",
      "resellerStatus": "active",
      "createdAt": "2026-01-05T00:00:00.000Z",
      "updatedAt": "2026-01-05T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### `GET /api/resellers/:id`

Get a single reseller by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Reseller ID |

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

**Errors**

| Status | Error |
|--------|-------|
| `400` | Invalid reseller ID |
| `404` | Reseller not found |

---

### `GET /api/resellers/:id/orders`

Get all orders for a specific reseller.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Reseller ID |

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-ABC123-XYZ1",
      ...
    }
  ]
}
```

---

### `GET /api/resellers/:id/balance`

Get the outstanding balance for a reseller.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Reseller ID |

**Response**

```json
{
  "success": true,
  "data": {
    "totalOrders": 5000.00,
    "totalPayments": 3000.00,
    "balance": 2000.00
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalOrders` | `number` | Sum of all `orderResellerTotal` for this reseller |
| `totalPayments` | `number` | Sum of all **confirmed** payments for this reseller |
| `balance` | `number` | Outstanding balance (`totalOrders - totalPayments`) |

---

### `POST /api/resellers`

Create a new reseller.

**Request Body**

```json
{
  "resellerName": "Maria Santos",
  "resellerAddress": "456 Palm St",
  "resellerPhone": "+63 912 345 6789",
  "resellerEmail": "maria@example.com",
  "resellerPhoto": "https://example.com/photo.jpg",
  "resellerDescription": "New reseller",
  "resellerStatus": "active"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resellerName` | `string` | ✅ | Min 1 character |
| `resellerAddress` | `string` | ❌ | |
| `resellerPhone` | `string` | ❌ | |
| `resellerEmail` | `string` | ❌ | Valid email or empty string |
| `resellerPhoto` | `string` | ❌ | URL |
| `resellerDescription` | `string` | ❌ | |
| `resellerStatus` | `enum` | ❌ | `active` (default) or `inactive` |

**Response** (201 Created)

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `PUT /api/resellers/:id`

Update an existing reseller.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Reseller ID |

**Request Body**

All fields from POST are optional.

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `DELETE /api/resellers/:id`

Soft delete a reseller.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Reseller ID |

**Response**

```json
{
  "success": true,
  "message": "Reseller deleted successfully"
}
```

---

## Payments API

Base path: `/api/payments`

### Data Model: Payment

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Primary key (auto-increment) |
| `paymentAmount` | `number` | **Required.** Payment amount |
| `paymentMethod` | `enum` | Payment method (see below) |
| `paymentReference` | `string?` | Reference number |
| `paymentProof` | `string?` | URL to receipt/proof image |
| `paymentNotes` | `string?` | Notes |
| `paymentStatus` | `enum` | Status (see below) |
| `paymentDate` | `string` | ISO timestamp |
| `resellerId` | `integer` | **Required.** Reference to reseller |
| `invoiceId` | `integer?` | Optional reference to invoice |
| `createdAt` | `string` | ISO timestamp |
| `updatedAt` | `string` | ISO timestamp |
| `deletedAt` | `string?` | Soft delete timestamp |

**Payment Method Values**

| Value | Description |
|-------|-------------|
| `cash` | Cash payment (default) |
| `gcash` | GCash e-wallet |
| `paymaya` | PayMaya/Maya e-wallet |
| `bank_transfer` | Bank transfer |
| `other` | Other method |

**Payment Status Values**

| Status | Description |
|--------|-------------|
| `pending` | Awaiting confirmation (default) |
| `confirmed` | Payment confirmed |
| `rejected` | Payment rejected |

---

### `GET /api/payments`

List all payments (excluding soft-deleted).

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paymentAmount": 500.00,
      "paymentMethod": "gcash",
      "paymentReference": "GC123456789",
      "paymentProof": "https://example.com/receipt.jpg",
      "paymentNotes": "Payment for January orders",
      "paymentStatus": "confirmed",
      "paymentDate": "2026-01-05T00:00:00.000Z",
      "resellerId": 1,
      "invoiceId": null,
      "createdAt": "2026-01-05T00:00:00.000Z",
      "updatedAt": "2026-01-05T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### `GET /api/payments/:id`

Get a single payment by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Payment ID |

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

**Errors**

| Status | Error |
|--------|-------|
| `400` | Invalid payment ID |
| `404` | Payment not found |

---

### `POST /api/payments`

Record a new payment.

**Request Body**

```json
{
  "paymentAmount": 500.00,
  "paymentMethod": "gcash",
  "paymentReference": "GC123456789",
  "paymentProof": "https://example.com/receipt.jpg",
  "paymentNotes": "Payment for January orders",
  "resellerId": 1,
  "invoiceId": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paymentAmount` | `number` | ✅ | Must be positive |
| `paymentMethod` | `enum` | ❌ | Default: `cash` |
| `paymentReference` | `string` | ❌ | Transaction reference |
| `paymentProof` | `string` | ❌ | URL to proof image |
| `paymentNotes` | `string` | ❌ | |
| `resellerId` | `integer` | ✅ | Must be positive |
| `invoiceId` | `integer` | ❌ | Optional, must be positive if provided |

**Response** (201 Created)

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `PUT /api/payments/:id`

Update an existing payment.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Payment ID |

**Request Body**

All fields from POST are optional.

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `PATCH /api/payments/:id/confirm`

Confirm a payment (sets status to `confirmed`).

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Payment ID |

**Request Body**

None required.

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `DELETE /api/payments/:id`

Soft delete a payment.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Payment ID |

**Response**

```json
{
  "success": true,
  "message": "Payment deleted successfully"
}
```

---

## Invoices API

Base path: `/api/invoices`

### Data Model: Invoice

| Field | Type | Description |
|-------|------|-------------|
| `id` | `integer` | Primary key (auto-increment) |
| `invoiceNumber` | `string` | Unique invoice number (e.g., `INV-202601-A1B2`) |
| `invoiceTotal` | `number` | Total amount (default: 0) |
| `invoicePaid` | `number` | Amount paid (default: 0) |
| `invoiceNotes` | `string?` | Notes |
| `dueDate` | `string?` | Due date |
| `invoiceStatus` | `enum` | Status (see below) |
| `resellerId` | `integer` | **Required.** Reference to reseller |
| `createdAt` | `string` | ISO timestamp |
| `updatedAt` | `string` | ISO timestamp |
| `deletedAt` | `string?` | Soft delete timestamp |

**Invoice Status Values**

| Status | Description |
|--------|-------------|
| `draft` | Draft invoice (default) |
| `sent` | Invoice sent to reseller |
| `paid` | Fully paid |
| `partial` | Partially paid |
| `overdue` | Past due date |
| `cancelled` | Cancelled |

---

### `GET /api/invoices`

List all invoices (excluding soft-deleted).

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoiceNumber": "INV-202601-A1B2",
      "invoiceTotal": 1000.00,
      "invoicePaid": 500.00,
      "invoiceNotes": "January orders",
      "dueDate": "2026-01-31",
      "invoiceStatus": "partial",
      "resellerId": 1,
      "createdAt": "2026-01-05T00:00:00.000Z",
      "updatedAt": "2026-01-05T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### `GET /api/invoices/:id`

Get a single invoice by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Invoice ID |

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

**Errors**

| Status | Error |
|--------|-------|
| `400` | Invalid invoice ID |
| `404` | Invoice not found |

---

### `GET /api/invoices/:id/pdf`

Generate a PDF for the invoice.

> [!WARNING]
> This endpoint is not yet implemented and returns a `501 Not Implemented` status.

**Response** (501)

```json
{
  "success": false,
  "error": "PDF generation not yet implemented"
}
```

---

### `POST /api/invoices`

Create a new invoice.

**Request Body**

```json
{
  "invoiceTotal": 1000.00,
  "invoicePaid": 0,
  "invoiceNotes": "January orders",
  "dueDate": "2026-01-31",
  "invoiceStatus": "draft",
  "resellerId": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceTotal` | `number` | ❌ | Default: 0, must be >= 0 |
| `invoicePaid` | `number` | ❌ | Default: 0, must be >= 0 |
| `invoiceNotes` | `string` | ❌ | |
| `dueDate` | `string` | ❌ | Date string |
| `invoiceStatus` | `enum` | ❌ | Default: `draft` |
| `resellerId` | `integer` | ✅ | Must be positive |

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoiceNumber": "INV-202601-A1B2",
    ...
  }
}
```

---

### `PUT /api/invoices/:id`

Update an existing invoice.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Invoice ID |

**Request Body**

All fields from POST are optional.

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `PATCH /api/invoices/:id/status`

Update only the invoice status.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Invoice ID |

**Request Body**

```json
{
  "status": "sent"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | `enum` | ✅ | `draft`, `sent`, `paid`, `partial`, `overdue`, `cancelled` |

**Response**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### `DELETE /api/invoices/:id`

Soft delete an invoice.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `integer` | Invoice ID |

**Response**

```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

---

## File Upload API

Base path: `/api/upload`

### File Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 10 MB |
| Allowed types | JPEG, PNG, WebP, GIF |
| Storage | Cloudflare R2 |

---

### `POST /api/upload`

Upload a file to R2 storage.

**Request**

Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | `File` | ✅ | The file to upload |
| `folder` | `string` | ❌ | Folder path (default: `temp`) |

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "key": "temp/550e8400-e29b-41d4-a716-446655440000.jpg",
    "url": "/files/temp/550e8400-e29b-41d4-a716-446655440000.jpg",
    "originalFilename": "my-photo.jpg",
    "fileSize": 245678,
    "mimeType": "image/jpeg"
  }
}
```

**Errors**

| Status | Error |
|--------|-------|
| `400` | No file provided |
| `400` | Invalid file type |
| `400` | File too large |
| `503` | File storage not configured |

**Recommended Folder Structure**

| Entity | Folder Pattern |
|--------|----------------|
| Orders | `orders/{order_id}` |
| Stores | `stores/{store_id}` |
| Resellers | `resellers/{reseller_id}` |
| Payments | `payments/{payment_id}` |

---

### `DELETE /api/upload/:key`

Delete a file from R2 storage.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Full R2 object key (e.g., `temp/uuid.jpg`) |

**Response**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Errors**

| Status | Error |
|--------|-------|
| `400` | No key provided |
| `404` | File not found |

---

## React Native Integration Guide

### Recommended Libraries

| Purpose | Library |
|---------|---------|
| HTTP Client | `axios` or `fetch` |
| State Management | `@tanstack/react-query` (TanStack Query) |
| Form Handling | `react-hook-form` with `zod` |
| Image Upload | `expo-image-picker` + `FormData` |

### Example: Fetching Orders

```typescript
import axios from 'axios';

const API_BASE = 'https://your-domain.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  orderName: string;
  orderStatus: string;
  // ... other fields
}

async function fetchOrders(): Promise<Order[]> {
  const response = await axios.get<ApiResponse<Order[]>>(`${API_BASE}/orders`);
  
  if (!response.data.success) {
    throw new Error(response.data.error);
  }
  
  return response.data.data!;
}
```

### Example: Creating an Order

```typescript
interface CreateOrderData {
  orderName: string;
  orderPrice: number;
  orderFee?: number;
  orderResellerPrice: number;
  orderQuantity?: number;
  storeId: number;
  resellerId: number;
}

async function createOrder(data: CreateOrderData): Promise<Order> {
  const response = await axios.post<ApiResponse<Order>>(
    `${API_BASE}/orders`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error);
  }
  
  return response.data.data!;
}
```

### Example: Uploading an Image

```typescript
import * as ImagePicker from 'expo-image-picker';

async function uploadImage(folder: string): Promise<string> {
  // 1. Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  
  if (result.canceled) {
    throw new Error('Image selection cancelled');
  }
  
  const asset = result.assets[0];
  
  // 2. Create FormData
  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.mimeType || 'image/jpeg',
    name: asset.fileName || 'photo.jpg',
  } as any);
  formData.append('folder', folder);
  
  // 3. Upload
  const response = await axios.post<ApiResponse<{ url: string }>>(
    `${API_BASE}/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error);
  }
  
  return response.data.data!.url;
}
```

### Example: TanStack Query Hook

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query hook
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
}

// Mutation hook
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

---

## Error Handling

All endpoints may return these common errors:

| Status | Error | Cause |
|--------|-------|-------|
| `400` | `Invalid [entity] ID` | Path parameter is not a valid integer |
| `400` | Validation error | Request body failed Zod validation |
| `404` | `[Entity] not found` | Entity with given ID doesn't exist or is soft-deleted |
| `500` | `Failed to [action] [entity]` | Database or internal error |

### Validation Error Example

When Zod validation fails, you'll receive a `400` response with details:

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "too_small",
        "minimum": 1,
        "type": "string",
        "inclusive": true,
        "message": "Order name is required",
        "path": ["orderName"]
      }
    ],
    "name": "ZodError"
  }
}
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-05 | 1.0.0 | Initial API documentation |
