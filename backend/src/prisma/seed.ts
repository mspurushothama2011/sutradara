import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive Sutraಧಾರ PostgreSQL database seeding...');

  // Hash default passwords
  const adminPasswordHash = await bcrypt.hash('AdminPassword@2026', 10);
  const staffPasswordHash = await bcrypt.hash('StaffPassword@2026', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sutradara.in' },
    update: {},
    create: {
      email: 'admin@sutradara.in',
      name: 'Sutraಧಾರ Royal Admin',
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
  console.log(`✓ Admin User: ${admin.email}`);

  // 2. Seed Staff User
  const staff = await prisma.user.upsert({
    where: { email: 'staff@sutradara.in' },
    update: {},
    create: {
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
  console.log(`✓ Staff User: ${staff.email}`);

  // 3. Seed Craft Cluster Categories & SubCategories (Max 3 each)
  const catBanarasi = await prisma.category.upsert({
    where: { slug: 'banarasi-heritage' },
    update: {},
    create: {
      name: 'Banarasi Heritage',
      slug: 'banarasi-heritage',
      region: 'Varanasi',
      description:
        'Centuries-old pit-loom heritage along the ghats of Varanasi, known for interlocking gold zari and Mughal floral arabesques.',
      image: '/frames/ezgif-frame-240.jpg',
      subCategories: {
        create: [
          {
            name: 'Kadhwa Pure Katan Silk',
            slug: 'kadhwa-pure-katan-silk',
            description: 'Individual motifs hand-locked into warp floats with zero loose backside threads.',
          },
          {
            name: 'Tanchoi & Jamdani Brocade',
            slug: 'tanchoi-jamdani-brocade',
            description: 'Intricate multi-warp figured silks with satin-like luster.',
          },
          {
            name: 'Jangla Shikargah (Gold Zari)',
            slug: 'jangla-shikargah-gold-zari',
            description: 'All-over dense floral jaal weaving celebrating traditional royal hunt tapestries.',
          },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`✓ Seeded Category: ${catBanarasi.name} with ${catBanarasi.subCategories.length} sub-categories`);

  const catKanjivaram = await prisma.category.upsert({
    where: { slug: 'kanjivaram-heritage' },
    update: {},
    create: {
      name: 'Kanjivaram Heritage',
      slug: 'kanjivaram-heritage',
      region: 'Kanchipuram',
      description:
        'The queen of South Indian handlooms, woven with heavy 3-ply mulberry silk and dipped tested gold zari.',
      image: '/frames/ezgif-frame-180.jpg',
      subCategories: {
        create: [
          {
            name: 'Korvai Interlocking Temple Border',
            slug: 'korvai-temple-border',
            description: 'Contrasting body and borders interlocking seamlessly with traditional temple spires.',
          },
          {
            name: 'Heavy Bridal 3-Ply Mulberry Silk',
            slug: 'bridal-3ply-mulberry-silk',
            description: 'Substantial, heirloom-weight silks woven for generational auspicious ceremonies.',
          },
          {
            name: 'Classic Petni & Contrast Pallu',
            slug: 'classic-petni-contrast-pallu',
            description: 'Contrast pallu linked with delicate warp knotting traditions.',
          },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`✓ Seeded Category: ${catKanjivaram.name} with ${catKanjivaram.subCategories.length} sub-categories`);

  const catPaithani = await prisma.category.upsert({
    where: { slug: 'paithani-heritage' },
    update: {},
    create: {
      name: 'Paithani Heritage',
      slug: 'paithani-heritage',
      region: 'Yeola',
      description:
        'Maharashtra’s royal tapestry weave characterized by oblique border patterns and vibrant kaleidoscope peacock pallus.',
      image: '/frames/ezgif-frame-150.jpg',
      subCategories: {
        create: [
          {
            name: 'Muniya & Oblique Border',
            slug: 'muniya-oblique-border',
            description: 'Famous parrot motif borders hand-interlocked into pure silk selvedges.',
          },
          {
            name: 'Handwoven Peacock Pallu',
            slug: 'handwoven-peacock-pallu',
            description: 'Intricate tapestry woven pallus depicting dancing peacocks in antique copper zari.',
          },
          {
            name: 'Pure Tapestry Zari Weave',
            slug: 'pure-tapestry-zari-weave',
            description: 'Solid gold tissue pallu woven without weft floats on the reverse side.',
          },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`✓ Seeded Category: ${catPaithani.name} with ${catPaithani.subCategories.length} sub-categories`);

  const catChanderi = await prisma.category.upsert({
    where: { slug: 'chanderi-heritage' },
    update: {},
    create: {
      name: 'Chanderi Heritage',
      slug: 'chanderi-heritage',
      region: 'Chanderi',
      description:
        'Featherlight tissue silks and sheer organzas from Madhya Pradesh, woven with delicate meenakari butis.',
      image: '/frames/ezgif-frame-120.jpg',
      subCategories: {
        create: [
          {
            name: 'Featherlight Tissue & Organza',
            slug: 'featherlight-tissue-organza',
            description: 'Gossamer handwoven organza silk with metallic luster.',
          },
          {
            name: 'Gold & Silver Meenakari Butis',
            slug: 'gold-silver-meenakari-butis',
            description: 'Delicate dual-toned zari florets sprinkled across the silk body.',
          },
          {
            name: 'Classic Chanderi Katan Silk',
            slug: 'classic-chanderi-katan-silk',
            description: 'Fine counts of mulberry silk offering unmatched fluid grace.',
          },
        ],
      },
    },
    include: { subCategories: true },
  });
  console.log(`✓ Seeded Category: ${catChanderi.name} with ${catChanderi.subCategories.length} sub-categories`);

  // 4. Seed Products with 1:1 Confidential Wholesale Procurement Vault
  const productsData = [
    {
      sku: 'BAN-KAT-001',
      name: 'Varanasi Royal Kadhwa Pure Katan Silk Saree',
      slug: 'varanasi-royal-kadhwa-pure-katan-silk-saree',
      description:
        'An unrepeatable masterpiece handwoven on a traditional pit loom in Varanasi over 320 craft hours. Features authentic pure gold zari floral jaal with a rich crimson pallu and Silk Mark certification.',
      categoryId: catBanarasi.id,
      subCategoryId: catBanarasi.subCategories[0]?.id,
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
      isDealOfDay: false,
      tags: ['Diwali', 'Bridal', 'Exclusive'],
      images: [
        '/frames/ezgif-frame-240.jpg',
        '/frames/ezgif-frame-120.jpg',
        '/frames/ezgif-frame-001.jpg',
      ],
      procurement: {
        costPrice: 22000,
        weaverGuildName: 'Ramprasad Kadhwa Weavers Society, Varanasi',
        weaverContact: '+91 94150 11223',
        procurementDate: new Date('2026-07-15'),
        invoiceRef: 'VNS-2026-INV-802',
        notes: 'Certified pure gold zari (2.8% tested Au purity). Master weaver: Pandit Ramprasad.',
      },
    },
    {
      sku: 'KAN-KOR-002',
      name: 'Kanchipuram Temple Border Korvai Silk Saree',
      slug: 'kanchipuram-temple-border-korvai-silk-saree',
      description:
        'Generational Korvai interlocking weave with traditional peacock motifs in 2G Tested Gold Zari. Contrast emerald green border on deep ruby red silk body.',
      categoryId: catKanjivaram.id,
      subCategoryId: catKanjivaram.subCategories[0]?.id,
      sellingPrice: 42000,
      comparePrice: 48000,
      costPrice: 26000,
      stock: 2,
      isHeirloom1of1: false,
      fabric: 'Kanjivaram Silk',
      zariType: 'Tested Gold Zari',
      craftRegion: 'Kanchipuram',
      weaveStyle: 'Korvai',
      silkMarkNumber: 'SM-IN-2026-9102',
      videoUrl: 'https://assets.sutradara.in/videos/kan-sil-002-drape.mp4',
      isFeatured: true,
      isDealOfDay: true,
      dealExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tags: ['Bridal', 'Wedding', 'Temple Border'],
      images: [
        '/frames/ezgif-frame-180.jpg',
        '/frames/ezgif-frame-120.jpg',
        '/frames/ezgif-frame-060.jpg',
      ],
      procurement: {
        costPrice: 26000,
        weaverGuildName: 'Sri Kamakshi Weavers Co-op, Kanchipuram',
        weaverContact: '+91 94440 33445',
        procurementDate: new Date('2026-08-01'),
        invoiceRef: 'KPM-2026-778',
        notes: 'Triple shuttle korvai pit loom. Pure mulberry 3-ply silk.',
      },
    },
    {
      sku: 'PAI-MUN-003',
      name: 'Yeola Muniya Border Pure Paithani Silk Saree',
      slug: 'yeola-muniya-border-pure-paithani-silk-saree',
      description:
        'Classic Yeola handwoven Paithani with authentic parrot (Muniya) border in antique zari and rich peacock kaleidoscope pallu on royal purple mulberry silk.',
      categoryId: catPaithani.id,
      subCategoryId: catPaithani.subCategories[0]?.id,
      sellingPrice: 34500,
      comparePrice: 39000,
      costPrice: 19500,
      stock: 1,
      isHeirloom1of1: true,
      fabric: 'Paithani Silk',
      zariType: 'Antique Copper Zari',
      craftRegion: 'Yeola',
      weaveStyle: 'Tapestry',
      silkMarkNumber: 'SM-IN-2026-7734',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Festive', 'Heritage', 'Paithani'],
      images: [
        '/frames/ezgif-frame-150.jpg',
        '/frames/ezgif-frame-090.jpg',
        '/frames/ezgif-frame-030.jpg',
      ],
      procurement: {
        costPrice: 19500,
        weaverGuildName: 'Yeola Paithani Guild, Nashik',
        weaverContact: '+91 98220 55667',
        procurementDate: new Date('2026-08-10'),
        invoiceRef: 'YLA-2026-441',
        notes: 'Hand tapestry pallu with dual flying peacocks.',
      },
    },
    {
      sku: 'CHA-TIS-004',
      name: 'Chanderi Handspun Tissue Silk Saree',
      slug: 'chanderi-handspun-tissue-silk-saree',
      description:
        'Ethereal featherlight Chanderi tissue silk woven with silver zari meenakari floral butis. Translucent drape ideal for summer evening soirees and festivities.',
      categoryId: catChanderi.id,
      subCategoryId: catChanderi.subCategories[0]?.id,
      sellingPrice: 24000,
      comparePrice: 28000,
      costPrice: 13500,
      stock: 3,
      isHeirloom1of1: false,
      fabric: 'Chanderi Tissue Silk',
      zariType: 'Silver Zari',
      craftRegion: 'Chanderi',
      weaveStyle: 'Eknaliya',
      silkMarkNumber: 'SM-IN-2026-6621',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Pastel', 'Summer Soiree', 'Lightweight'],
      images: [
        '/frames/ezgif-frame-120.jpg',
        '/frames/ezgif-frame-060.jpg',
        '/frames/ezgif-frame-180.jpg',
      ],
      procurement: {
        costPrice: 13500,
        weaverGuildName: 'Pranpur Silk Weavers Cluster, Ashoknagar',
        weaverContact: '+91 97550 88990',
        procurementDate: new Date('2026-08-15'),
        invoiceRef: 'CHD-2026-112',
        notes: 'High twist silk warp, unrefined gold/silver weft.',
      },
    },
    {
      sku: 'BAN-JAN-005',
      name: 'Varanasi Antique Jangla Pure Gold Zari Saree',
      slug: 'varanasi-antique-jangla-pure-gold-zari-saree',
      description:
        'A royal wedding heirloom featuring an all-over intricate shikargah tapestry woven in gold and silver Ganga-Jamuna zari over saffron pure katan silk.',
      categoryId: catBanarasi.id,
      subCategoryId: catBanarasi.subCategories[2]?.id,
      sellingPrice: 52000,
      comparePrice: 60000,
      costPrice: 31000,
      stock: 1,
      isHeirloom1of1: true,
      fabric: 'Pure Katan Silk',
      zariType: 'Pure Gold Zari',
      craftRegion: 'Varanasi',
      weaveStyle: 'Jangla',
      silkMarkNumber: 'SM-IN-2026-9044',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Heirloom', 'Royal', 'Bridal'],
      images: [
        '/frames/ezgif-frame-240.jpg',
        '/frames/ezgif-frame-200.jpg',
        '/frames/ezgif-frame-160.jpg',
      ],
      procurement: {
        costPrice: 31000,
        weaverGuildName: 'Madangir Traditional Guild, Varanasi',
        weaverContact: '+91 94150 99887',
        procurementDate: new Date('2026-08-20'),
        invoiceRef: 'VNS-2026-INV-955',
        notes: 'Over 480 loom hours. Ganga-Jamuna dual zari weave.',
      },
    },
  ];

  for (const item of productsData) {
    const { procurement, ...prodDetails } = item;
    const prod = await prisma.product.upsert({
      where: { sku: prodDetails.sku },
      update: prodDetails,
      create: prodDetails,
    });

    if (procurement) {
      await prisma.productProcurement.upsert({
        where: { productId: prod.id },
        update: {
          costPrice: procurement.costPrice,
          weaverGuildName: procurement.weaverGuildName,
          weaverContact: procurement.weaverContact,
          procurementDate: procurement.procurementDate,
          invoiceRef: procurement.invoiceRef,
          notes: procurement.notes,
        },
        create: {
          productId: prod.id,
          costPrice: procurement.costPrice,
          weaverGuildName: procurement.weaverGuildName,
          weaverContact: procurement.weaverContact,
          procurementDate: procurement.procurementDate,
          invoiceRef: procurement.invoiceRef,
          notes: procurement.notes,
        },
      });
    }
    console.log(`✓ Seeded Product & Procurement Vault: ${prod.name} (${prod.sku})`);
  }

  // 5. Seed Coupons
  const coupons = [
    {
      code: 'VIRASAT10',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      minOrderValue: 25000,
      maxDiscount: 5000,
      usageLimit: 100,
      usedCount: 14,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FIRSTHEIRLOOM',
      discountType: 'FLAT' as const,
      discountValue: 2500,
      minOrderValue: 30000,
      usageLimit: 50,
      usedCount: 8,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'UTSAV20',
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      minOrderValue: 50000,
      maxDiscount: 12000,
      usageLimit: 25,
      usedCount: 3,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    console.log(`✓ Seeded Coupon: ${c.code}`);
  }

  console.log('✅ PostgreSQL seeding finished with complete live craft catalog!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
