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
  | 'QC_INSPECTED'
  | 'DISPATCHED'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
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

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
  level: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  region?: string;
  image?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  level?: number; // 0: Main/Root, 1: Subcategory, 2: Sub-subcategory, 3: Sub-sub-subcategory
  breadcrumbs?: CategoryBreadcrumb[];
  subCategories?: SubCategory[]; // Maintained for legacy compatibility
  products?: Product[];
  productCount?: number;
  totalDescendantProductCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  category?: Category;
  productCount?: number;
  products?: Product[];
  createdAt?: string;
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
  categoryId?: string;
  category?: Category;
  subCategoryId?: string;
  subCategory?: SubCategory;
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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
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

export interface CreateRazorpayOrderRequest {
  items: { productId: string; quantity: number }[];
  couponCode?: string;
}

export interface CreateRazorpayOrderResponse {
  success: boolean;
  razorpayOrderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId: string;
  isSimulated: boolean;
  finalTotal: number;
  subtotal: number;
  discountAmount: number;
}

export interface VerifyRazorpayPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  couponCode?: string;
}

export interface VerifyRazorpayPaymentResponse {
  success: boolean;
  message: string;
  order: Order;
  trackingUrl: string;
}


