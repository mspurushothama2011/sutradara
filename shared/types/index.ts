/**
 * Sutradara — Master Shared Type Definitions
 * Shared between Next.js Frontend and Express Backend
 */

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export type Capability =
  | 'products:view'
  | 'products:create_edit'
  | 'inventory:quick_update'
  | 'orders:manage'
  | 'marketing:manage'
  | 'finance:view'
  | 'staff:attendance_view'
  | 'staff:payroll_manage'
  | 'announcements:post'
  | 'audit:view';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type AttendanceStatus =
  | 'PRESENT'
  | 'HALF_DAY'
  | 'LATE'
  | 'APPROVED_LEAVE'
  | 'ABSENT';

export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  customPermissions: Capability[];
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number;
  comparePrice?: number;
  costPrice?: number; // Restricted to finance:view
  stock: number;
  isHeirloom1of1: boolean;
  fabric: string;
  zariType: string;
  craftRegion: string;
  weaveStyle?: string;
  silkMarkNumber?: string;
  videoUrl?: string;
  isFeatured: boolean;
  isDealOfDay: boolean;
  dealExpiresAt?: string;
  tags: string[];
  images: string[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName?: string;
  user?: User;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface WorkLog {
  id: string;
  userId: string;
  userName?: string;
  user?: User;
  date: string;
  tasksSummary: string;
  itemsProcessed?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isUrgent: boolean;
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  image?: string;
  product?: Product;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface TrackingEvent {
  id: string;
  status: string;
  location?: string;
  message: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  googleId?: string;
  isVerified: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  user?: User;
  customerId?: string;
  customer?: Customer;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  courierPartner?: string;
  awbNumber?: string;
  trackingUrl?: string;
  inspectionVideoUrl?: string;
  isNdrFlagged: boolean;
  ndrReason?: string;
  trackingEvents?: TrackingEvent[];
  items: OrderItem[];
  createdAt: string;
}

export interface SendOtpPayload {
  email: string;
  turnstileToken?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  name?: string;
  phone?: string;
}

export interface GoogleAuthPayload {
  idToken: string;
}

