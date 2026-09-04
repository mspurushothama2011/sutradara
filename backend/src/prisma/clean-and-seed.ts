import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanAndSeed() {
  console.log('🧹 Purging all fake test data and resetting to pristine state...');

  // 1. Delete all test orders, line items, attendance, logs, etc.
  await prisma.orderItem.deleteMany({});
  await prisma.trackingEvent.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.workLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✨ All fake data and test logs purged successfully.');

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('AdminPassword@2026', 10);
  const staffPasswordHash = await bcrypt.hash('StaffPassword@2026', 10);

  // 3. Create EXACTLY ONE Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sutradara.in',
      name: 'Sutraಧಾರ Admin',
      phone: '+919876543210',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
      customPermissions: [
        'products:view',
        'products:create_edit',
        'inventory:quick_update',
        'orders:manage',
        'marketing:manage',
        'finance:view',
        'staff:attendance_view',
        'staff:payroll_manage',
        'announcements:post',
        'audit:view',
      ],
    },
  });
  console.log(`👑 Created 1 Admin User: ${admin.email} (Pass: AdminPassword@2026)`);

  // 4. Create EXACTLY ONE Staff
  const staff = await prisma.user.create({
    data: {
      email: 'staff@sutradara.in',
      name: 'Priya Sharma (Vault Lead)',
      phone: '+919876543211',
      role: 'STAFF',
      passwordHash: staffPasswordHash,
      customPermissions: [
        'products:view',
        'inventory:quick_update',
        'orders:manage',
        'staff:attendance_view',
      ],
    },
  });
  console.log(`👔 Created 1 Staff User: ${staff.email} (Pass: StaffPassword@2026)`);

  // 5. Create EXACTLY ONE Customer
  const customer = await prisma.customer.create({
    data: {
      email: 'customer@sutradara.in',
      name: 'Ananya Deshmukh',
      phone: '+919820154321',
      isVerified: true,
      addresses: {
        create: [
          {
            recipientName: 'Ananya Deshmukh',
            recipientPhone: '+919820154321',
            street: '14, Altamount Road, Cumballa Hill',
            landmark: 'Near Antilia',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400026',
            country: 'India',
            label: 'Home',
            isDefault: true,
          },
        ],
      },
    },
  });
  console.log(`🛍️ Created 1 Customer: ${customer.email} (${customer.name})`);

  console.log('\n📊 Final Verification:');
  const userCount = await prisma.user.count();
  const customerCount = await prisma.customer.count();
  const orderCount = await prisma.order.count();
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();

  console.log(`- Admins & Staff Users: ${userCount} (1 Admin, 1 Staff)`);
  console.log(`- Customers: ${customerCount} (1 Customer)`);
  console.log(`- Orders: ${orderCount} (0 fake orders)`);
  console.log(`- Active Products: ${productCount} Sarees`);
  console.log(`- Craft Categories: ${categoryCount} Clusters`);
}

cleanAndSeed()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
