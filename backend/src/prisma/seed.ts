import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sutradara database seeding...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('AdminPassword@2026', 10);
  const staffPasswordHash = await bcrypt.hash('StaffPassword@2026', 10);

  // 1. Create Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sutradara.in' },
    update: {},
    create: {
      email: 'admin@sutradara.in',
      name: 'Sutradara Admin',
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
  console.log(`✓ Seeded Admin User: ${admin.email}`);

  // 2. Create Staff Account (With limited capabilities)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@sutradara.in' },
    update: {},
    create: {
      email: 'staff@sutradara.in',
      name: 'Priya Sharma (Fulfillment Staff)',
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
  console.log(`✓ Seeded Staff User: ${staff.email}`);

  // 3. Create Sample 1-of-1 Heirloom Product
  const product = await prisma.product.upsert({
    where: { sku: 'BAN-KAT-001' },
    update: {},
    create: {
      sku: 'BAN-KAT-001',
      name: 'Varanasi Royal Kadhwa Pure Katan Silk Saree',
      slug: 'varanasi-royal-kadhwa-pure-katan-silk-saree',
      description:
        'An unrepeatable masterpiece handwoven on a traditional pit loom in Varanasi over 320 craft hours. Features authentic pure gold zari floral jaal with a rich crimson pallu and Silk Mark certification.',
      sellingPrice: 38500,
      comparePrice: 45000,
      costPrice: 22000,
      stock: 1,
      isHeirloom1of1: true,
      fabric: 'Pure Katan Silk',
      zariType: 'Pure Gold Zari',
      craftRegion: 'Varanasi',
      weaveStyle: 'Kadhwa',
      silkMarkNumber: 'SM-IN-2026-8891',
      videoUrl: 'https://assets.sutradara.in/videos/ban-kat-001-drape.mp4',
      isFeatured: true,
      tags: ['Diwali', 'Bridal', 'Exclusive'],
      images: [
        '/frames/ezgif-frame-240.jpg',
        '/frames/ezgif-frame-120.jpg',
        '/frames/ezgif-frame-001.jpg',
      ],
    },
  });
  console.log(`✓ Seeded Sample Heirloom Saree: ${product.name} (SKU: ${product.sku})`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
