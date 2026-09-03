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
  const categoriesToSeed = [
    {
      name: 'Banarasi Heritage',
      slug: 'banarasi-heritage',
      region: 'Varanasi',
      description: 'Centuries-old pit-loom heritage along the ghats of Varanasi, known for interlocking gold zari and Mughal floral arabesques.',
      image: '/frames/ezgif-frame-240.jpg',
      subCategories: [
        { name: 'Kadhwa Pure Katan Silk', slug: 'kadhwa-pure-katan-silk', description: 'Individual motifs hand-locked into warp floats with zero loose backside threads.' },
        { name: 'Tanchoi & Jamdani Brocade', slug: 'tanchoi-jamdani-brocade', description: 'Intricate multi-warp figured silks with satin-like luster.' },
        { name: 'Jangla Shikargah (Gold Zari)', slug: 'jangla-shikargah-gold-zari', description: 'All-over dense floral jaal weaving celebrating traditional royal hunt tapestries.' },
      ],
    },
    {
      name: 'Kanjivaram Heritage',
      slug: 'kanjivaram-heritage',
      region: 'Kanchipuram',
      description: 'The queen of South Indian handlooms, woven with heavy 3-ply mulberry silk and dipped tested gold zari.',
      image: '/frames/ezgif-frame-180.jpg',
      subCategories: [
        { name: 'Korvai Interlocking Temple Border', slug: 'korvai-temple-border', description: 'Contrasting body and borders interlocking seamlessly with traditional temple spires.' },
        { name: 'Heavy Bridal 3-Ply Mulberry Silk', slug: 'bridal-3ply-mulberry-silk', description: 'Substantial, heirloom-weight silks woven for generational auspicious ceremonies.' },
        { name: 'Classic Petni & Contrast Pallu', slug: 'classic-petni-contrast-pallu', description: 'Contrast pallu linked with delicate warp knotting traditions.' },
      ],
    },
    {
      name: 'Paithani Heritage',
      slug: 'paithani-heritage',
      region: 'Yeola',
      description: 'Maharashtra’s royal tapestry weave characterized by oblique border patterns and vibrant kaleidoscope peacock pallus.',
      image: '/frames/ezgif-frame-150.jpg',
      subCategories: [
        { name: 'Muniya & Oblique Border', slug: 'muniya-oblique-border', description: 'Famous parrot motif borders hand-interlocked into pure silk selvedges.' },
        { name: 'Handwoven Peacock Pallu', slug: 'handwoven-peacock-pallu', description: 'Intricate tapestry woven pallus depicting dancing peacocks in antique copper zari.' },
        { name: 'Pure Tapestry Zari Weave', slug: 'pure-tapestry-zari-weave', description: 'Solid gold tissue pallu woven without weft floats on the reverse side.' },
      ],
    },
    {
      name: 'Chanderi Heritage',
      slug: 'chanderi-heritage',
      region: 'Chanderi',
      description: 'Featherlight tissue silks and sheer organzas from Madhya Pradesh, woven with delicate meenakari butis.',
      image: '/frames/ezgif-frame-120.jpg',
      subCategories: [
        { name: 'Featherlight Tissue & Organza', slug: 'featherlight-tissue-organza', description: 'Gossamer handwoven organza silk with metallic luster.' },
        { name: 'Gold & Silver Meenakari Butis', slug: 'gold-silver-meenakari-butis', description: 'Delicate dual-toned zari florets sprinkled across the silk body.' },
        { name: 'Classic Chanderi Katan Silk', slug: 'classic-chanderi-katan-silk', description: 'Fine counts of mulberry silk offering unmatched fluid grace.' },
      ],
    },
    {
      name: 'Patan Patola & Bandhani',
      slug: 'patan-patola-bandhani',
      region: 'Patan',
      description: 'Legendary double-ikkat and tie-dye mastery from Gujarat where warp and weft are individually dyed prior to loom setting.',
      image: '/frames/ezgif-frame-200.jpg',
      subCategories: [
        { name: 'Double Ikkat Silk Patola', slug: 'double-ikkat-silk-patola', description: 'Mathematical precision double-ikkat weaves featuring geometric elephants and parrots.' },
        { name: 'Traditional Rai Bandhani Silk', slug: 'traditional-rai-bandhani-silk', description: 'Micro-knotted pure georgette and gajji silk dyed in natural Madder dyes.' },
        { name: 'Gharchola Zari Grid Saree', slug: 'gharchola-zari-grid-saree', description: 'Auspicious 52-square gold zari grid sarees with traditional auspicious motifs.' },
      ],
    },
    {
      name: 'Baluchari & Swarnachari',
      slug: 'baluchari-swarnachari',
      region: 'Bishnupur',
      description: 'Narrative silk tapestries from Bengal depicting epic scenes from the Ramayana and Mahabharata in pure gold brocade.',
      image: '/frames/ezgif-frame-160.jpg',
      subCategories: [
        { name: 'Baluchari Narrative Silk', slug: 'baluchari-narrative-silk', description: 'Pallus depicting courtly scenes and mythological legends in resham threads.' },
        { name: 'Swarnachari Gold Brocade', slug: 'swarnachari-gold-brocade', description: 'Rich woven scenes highlighted with shining gold and silver lurex threads.' },
        { name: 'Dhakai Jamdani Fine Muslin', slug: 'dhakai-jamdani-fine-muslin', description: 'Feather-touch translucent muslin cotton-silk with supplementary floating wefts.' },
      ],
    },
    {
      name: 'Mysore & Gadwal Silk',
      slug: 'mysore-gadwal-silk',
      region: 'Mysore',
      description: 'Royal court silks of Karnataka and Telangana featuring 100% pure KSIC crepe silk with solid gold zari borders.',
      image: '/frames/ezgif-frame-090.jpg',
      subCategories: [
        { name: 'Mysore Pure Crepe Silk', slug: 'mysore-pure-crepe-silk', description: 'Legendary KSIC pure crepe silk weighing 120 GSM with pure gold-dipped borders.' },
        { name: 'Gadwal Sico Zari Temple Saree', slug: 'gadwal-sico-zari-temple', description: 'Fine cotton body interlocked with solid silk borders and gold tissue pallu.' },
        { name: 'Pochampally Ikkat Silk', slug: 'pochampally-ikkat-silk', description: 'Vibrant geometric ikat designs handcrafted in the weavers village of Bhoodan.' },
      ],
    },
    {
      name: 'Tussar & Muga Wild Silk',
      slug: 'tussar-muga-wild-silk',
      region: 'Bhagalpur',
      description: 'Rich textured wild silks of eastern India including natural golden Assam Muga and handspun Ghicha Tussar.',
      image: '/frames/ezgif-frame-060.jpg',
      subCategories: [
        { name: 'Assam Golden Muga Silk', slug: 'assam-golden-muga-silk', description: 'Rare golden wild silk from Brahmaputra valley that grows glossier with every wash.' },
        { name: 'Bhagalpuri Handspun Ghicha Tussar', slug: 'bhagalpuri-ghicha-tussar', description: 'Textured coarse-grained wild tussar with organic rustic earthy sheen.' },
        { name: 'Eri Ahimsa Peace Silk', slug: 'eri-ahimsa-peace-silk', description: 'Ethically harvested non-violent silk offering wool-like thermal comfort.' },
      ],
    },
  ];

  const categoryMap = new Map<string, any>();

  for (const catData of categoriesToSeed) {
    const { subCategories, ...catDetails } = catData;
    let cat = await prisma.category.findUnique({
      where: { slug: catDetails.slug },
      include: { subCategories: true },
    });

    if (!cat) {
      cat = await prisma.category.create({
        data: {
          ...catDetails,
          subCategories: {
            create: subCategories,
          },
        },
        include: { subCategories: true },
      });
    } else {
      cat = await prisma.category.update({
        where: { id: cat.id },
        data: catDetails,
        include: { subCategories: true },
      });
      // Ensure sub-categories exist
      for (const sub of subCategories) {
        const existingSub = cat.subCategories.find((s) => s.slug === sub.slug);
        if (!existingSub && cat.subCategories.length < 3) {
          await prisma.subCategory.create({
            data: {
              categoryId: cat.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
            },
          });
        }
      }
      const reloaded = await prisma.category.findUnique({
        where: { id: cat.id },
        include: { subCategories: true },
      });
      if (reloaded) {
        cat = reloaded;
      }
    }

    if (cat) {
      categoryMap.set(cat.slug, cat);
      console.log(`✓ Seeded Category: ${cat.name} (${cat.subCategories.length} sub-categories)`);
    }
  }

  // 4. Seed 16 Authentic Products with 1:1 Confidential Wholesale Procurement Vault
  const productsData = [
    {
      sku: 'BAN-KAT-001',
      name: 'Varanasi Royal Kadhwa Pure Katan Silk Saree',
      slug: 'varanasi-royal-kadhwa-pure-katan-silk-saree',
      description: 'An unrepeatable masterpiece handwoven on a traditional pit loom in Varanasi over 320 craft hours. Features authentic pure gold zari floral jaal with a rich crimson pallu and Silk Mark certification.',
      categorySlug: 'banarasi-heritage',
      subCategoryIndex: 0,
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
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Diwali', 'Bridal', 'Exclusive'],
      images: ['/frames/ezgif-frame-240.jpg', '/frames/ezgif-frame-120.jpg', '/frames/ezgif-frame-001.jpg'],
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
      description: 'Generational Korvai interlocking weave with traditional peacock motifs in 2G Tested Gold Zari. Contrast emerald green border on deep ruby red silk body.',
      categorySlug: 'kanjivaram-heritage',
      subCategoryIndex: 0,
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
      isFeatured: true,
      isDealOfDay: true,
      dealExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tags: ['Bridal', 'Wedding', 'Temple Border'],
      images: ['/frames/ezgif-frame-180.jpg', '/frames/ezgif-frame-120.jpg', '/frames/ezgif-frame-060.jpg'],
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
      description: 'Classic Yeola handwoven Paithani with authentic parrot (Muniya) border in antique zari and rich peacock kaleidoscope pallu on royal purple mulberry silk.',
      categorySlug: 'paithani-heritage',
      subCategoryIndex: 0,
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
      images: ['/frames/ezgif-frame-150.jpg', '/frames/ezgif-frame-090.jpg', '/frames/ezgif-frame-030.jpg'],
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
      description: 'Ethereal featherlight Chanderi tissue silk woven with silver zari meenakari floral butis. Translucent drape ideal for summer evening soirees and festivities.',
      categorySlug: 'chanderi-heritage',
      subCategoryIndex: 0,
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
      images: ['/frames/ezgif-frame-120.jpg', '/frames/ezgif-frame-060.jpg', '/frames/ezgif-frame-180.jpg'],
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
      description: 'A royal wedding heirloom featuring an all-over intricate shikargah tapestry woven in gold and silver Ganga-Jamuna zari over saffron pure katan silk.',
      categorySlug: 'banarasi-heritage',
      subCategoryIndex: 2,
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
      images: ['/frames/ezgif-frame-240.jpg', '/frames/ezgif-frame-200.jpg', '/frames/ezgif-frame-160.jpg'],
      procurement: {
        costPrice: 31000,
        weaverGuildName: 'Madangir Traditional Guild, Varanasi',
        weaverContact: '+91 94150 99887',
        procurementDate: new Date('2026-08-20'),
        invoiceRef: 'VNS-2026-INV-955',
        notes: 'Over 480 loom hours. Ganga-Jamuna dual zari weave.',
      },
    },
    {
      sku: 'PAT-IKK-006',
      name: 'Patan Royal Double Ikkat Pure Silk Patola Saree',
      slug: 'patan-royal-double-ikkat-pure-silk-patola-saree',
      description: 'Incomparable double-ikkat masterpiece woven by master Salvi artisans. Both warp and weft tie-dyed in natural madder red and indigo displaying traditional Nari Kunjar motifs.',
      categorySlug: 'patan-patola-bandhani',
      subCategoryIndex: 0,
      sellingPrice: 78000,
      comparePrice: 92000,
      costPrice: 48000,
      stock: 1,
      isHeirloom1of1: true,
      fabric: 'Double Ikkat Mulberry Silk',
      zariType: 'Pure Gold Zari',
      craftRegion: 'Patan',
      weaveStyle: 'Double Ikkat',
      silkMarkNumber: 'SM-IN-2026-9921',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Heirloom', 'Patola', 'Collector'],
      images: ['/frames/ezgif-frame-200.jpg', '/frames/ezgif-frame-150.jpg', '/frames/ezgif-frame-100.jpg'],
      procurement: {
        costPrice: 48000,
        weaverGuildName: 'Salvi Patola Guild, Patan',
        weaverContact: '+91 98250 11998',
        procurementDate: new Date('2026-08-05'),
        invoiceRef: 'PAT-2026-009',
        notes: 'Reversible double-ikkat silk. 600 loom hours.',
      },
    },
    {
      sku: 'PAT-BAN-007',
      name: 'Kutch Traditional Rai Bandhani Silk Saree',
      slug: 'kutch-traditional-rai-bandhani-silk-saree',
      description: 'Over 10,000 micro-knotted bandhej dots hand-tied on pure Gajji silk with rich zari borders. Dyed in brilliant auspicious vermillion red and mustard gold.',
      categorySlug: 'patan-patola-bandhani',
      subCategoryIndex: 1,
      sellingPrice: 28500,
      comparePrice: 33000,
      costPrice: 16000,
      stock: 2,
      isHeirloom1of1: false,
      fabric: 'Gajji Silk',
      zariType: 'Tested Gold Zari',
      craftRegion: 'Patan',
      weaveStyle: 'Tie & Dye Bandhani',
      silkMarkNumber: 'SM-IN-2026-8432',
      isFeatured: false,
      isDealOfDay: false,
      tags: ['Bandhani', 'Festive', 'Bridal'],
      images: ['/frames/ezgif-frame-170.jpg', '/frames/ezgif-frame-110.jpg', '/frames/ezgif-frame-050.jpg'],
      procurement: {
        costPrice: 16000,
        weaverGuildName: 'Khatri Artisan Cooperative, Bhuj',
        weaverContact: '+91 94280 44556',
        procurementDate: new Date('2026-08-12'),
        invoiceRef: 'KTC-2026-312',
        notes: 'Handcrafted traditional knotting.',
      },
    },
    {
      sku: 'BAL-SWA-008',
      name: 'Bishnupur Swarnachari Gold Brocade Silk Saree',
      slug: 'bishnupur-swarnachari-gold-brocade-silk-saree',
      description: 'Epic Mahabharata dialogue depicted along the ornate pallu and border in rich gold and silver brocade over midnight blue Bishnupur mulberry silk.',
      categorySlug: 'baluchari-swarnachari',
      subCategoryIndex: 1,
      sellingPrice: 36000,
      comparePrice: 42000,
      costPrice: 20500,
      stock: 1,
      isHeirloom1of1: true,
      fabric: 'Murshidabad Mulberry Silk',
      zariType: 'Pure Gold Zari',
      craftRegion: 'Bishnupur',
      weaveStyle: 'Swarnachari Brocade',
      silkMarkNumber: 'SM-IN-2026-5541',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Swarnachari', 'Mythological', 'Heirloom'],
      images: ['/frames/ezgif-frame-160.jpg', '/frames/ezgif-frame-130.jpg', '/frames/ezgif-frame-070.jpg'],
      procurement: {
        costPrice: 20500,
        weaverGuildName: 'Bishnupur Heritage Handloom Society, Bankura',
        weaverContact: '+91 94340 77889',
        procurementDate: new Date('2026-08-14'),
        invoiceRef: 'BNK-2026-501',
        notes: 'Gold lurex jacquard loom weaving.',
      },
    },
    {
      sku: 'BAL-JAM-009',
      name: 'Dhakai Jamdani Fine Handwoven Muslin Saree',
      slug: 'dhakai-jamdani-fine-handwoven-muslin-saree',
      description: 'Featherlight sheer cotton-silk muslin adorned with intricate geometric floral jaal woven with individual floating bamboo shuttle wefts in antique gold.',
      categorySlug: 'baluchari-swarnachari',
      subCategoryIndex: 2,
      sellingPrice: 29500,
      comparePrice: 35000,
      costPrice: 17000,
      stock: 2,
      isHeirloom1of1: false,
      fabric: 'Muslin Cotton Silk',
      zariType: 'Tested Gold Zari',
      craftRegion: 'Bishnupur',
      weaveStyle: 'Jamdani Supplementary Weft',
      silkMarkNumber: 'SM-IN-2026-4190',
      isFeatured: false,
      isDealOfDay: false,
      tags: ['Jamdani', 'Summer', 'Classic'],
      images: ['/frames/ezgif-frame-140.jpg', '/frames/ezgif-frame-080.jpg', '/frames/ezgif-frame-020.jpg'],
      procurement: {
        costPrice: 17000,
        weaverGuildName: 'Shantipur Jamdani Guild, Nadia',
        weaverContact: '+91 97320 66778',
        procurementDate: new Date('2026-08-18'),
        invoiceRef: 'STP-2026-219',
        notes: 'Handloom 200 count fine muslin.',
      },
    },
    {
      sku: 'MYS-CRE-010',
      name: 'Mysore Royal KSIC 120 GSM Pure Crepe Silk Saree',
      slug: 'mysore-royal-ksic-120-gsm-pure-crepe-silk-saree',
      description: 'Sovereign pure crepe silk authenticated with official KSIC government standards. Heavy 120 GSM weight with solid pure gold-embossed temple zari border.',
      categorySlug: 'mysore-gadwal-silk',
      subCategoryIndex: 0,
      sellingPrice: 32000,
      comparePrice: 37500,
      costPrice: 18500,
      stock: 3,
      isHeirloom1of1: false,
      fabric: 'Pure Mysore Crepe Silk',
      zariType: 'Pure Gold Zari',
      craftRegion: 'Mysore',
      weaveStyle: 'Crepe De Chine',
      silkMarkNumber: 'SM-IN-2026-1188',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Mysore Silk', 'Royal', 'Office to Festive'],
      images: ['/frames/ezgif-frame-090.jpg', '/frames/ezgif-frame-040.jpg', '/frames/ezgif-frame-190.jpg'],
      procurement: {
        costPrice: 18500,
        weaverGuildName: 'Karnataka Silk Industries Corporation, Mysore',
        weaverContact: '+91 82124 88990',
        procurementDate: new Date('2026-08-22'),
        invoiceRef: 'MYS-2026-092',
        notes: '0.65% pure gold dipping, 100% natural mulberry.',
      },
    },
    {
      sku: 'GAD-SIC-011',
      name: 'Gadwal Sico Zari Contrast Temple Saree',
      slug: 'gadwal-sico-zari-contrast-temple-saree',
      description: 'Traditional Kuta-border weave where the breathable cotton body is hand-interlocked with pure mulberry silk borders and gold tissue kuttu pallu.',
      categorySlug: 'mysore-gadwal-silk',
      subCategoryIndex: 1,
      sellingPrice: 22500,
      comparePrice: 26000,
      costPrice: 12500,
      stock: 2,
      isHeirloom1of1: false,
      fabric: 'Gadwal Sico Silk Cotton',
      zariType: 'Tested Gold Zari',
      craftRegion: 'Mysore',
      weaveStyle: 'Kuttu Interlock',
      silkMarkNumber: 'SM-IN-2026-3392',
      isFeatured: false,
      isDealOfDay: false,
      tags: ['Gadwal', 'Temple Weave', 'Lightweight'],
      images: ['/frames/ezgif-frame-110.jpg', '/frames/ezgif-frame-070.jpg', '/frames/ezgif-frame-030.jpg'],
      procurement: {
        costPrice: 12500,
        weaverGuildName: 'Gadwal Handloom Cluster, Jogulamba',
        weaverContact: '+91 94400 55667',
        procurementDate: new Date('2026-08-25'),
        invoiceRef: 'GDW-2026-144',
        notes: 'Hand interlocking pit loom.',
      },
    },
    {
      sku: 'TUS-MUG-012',
      name: 'Assam Royal Golden Muga Wild Silk Saree',
      slug: 'assam-royal-golden-muga-wild-silk-saree',
      description: 'The golden jewel of Assam. Naturally golden Antheraea assamensis wild silk handwoven with red and green kingkhap motifs. Inherent golden luster that deepens with time.',
      categorySlug: 'tussar-muga-wild-silk',
      subCategoryIndex: 0,
      sellingPrice: 65000,
      comparePrice: 75000,
      costPrice: 38000,
      stock: 1,
      isHeirloom1of1: true,
      fabric: 'Assam Golden Muga Silk',
      zariType: 'Pure Gold Zari',
      craftRegion: 'Bhagalpur',
      weaveStyle: 'Kingkhap Rib Weave',
      silkMarkNumber: 'SM-IN-2026-7788',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Muga', 'Heirloom', 'Assam Golden Silk'],
      images: ['/frames/ezgif-frame-060.jpg', '/frames/ezgif-frame-130.jpg', '/frames/ezgif-frame-210.jpg'],
      procurement: {
        costPrice: 38000,
        weaverGuildName: 'Sualkuchi Master Silk Society, Kamrup',
        weaverContact: '+91 94350 22334',
        procurementDate: new Date('2026-08-26'),
        invoiceRef: 'SLK-2026-089',
        notes: 'Certified Geographical Indication (GI) protected Muga silk.',
      },
    },
    {
      sku: 'TUS-GHI-013',
      name: 'Bhagalpuri Handspun Ghicha Tussar Silk Saree',
      slug: 'bhagalpuri-handspun-ghicha-tussar-silk-saree',
      description: 'Organic rustic elegance woven from handspun ghicha cocoons in Bhagalpur. Handblock kalamkari tree-of-life pallu with subtle antique bronze zari selvedge.',
      categorySlug: 'tussar-muga-wild-silk',
      subCategoryIndex: 1,
      sellingPrice: 19500,
      comparePrice: 23000,
      costPrice: 10500,
      stock: 4,
      isHeirloom1of1: false,
      fabric: 'Handspun Ghicha Tussar',
      zariType: 'Antique Copper Zari',
      craftRegion: 'Bhagalpur',
      weaveStyle: 'Organic Textured Weave',
      silkMarkNumber: 'SM-IN-2026-6677',
      isFeatured: false,
      isDealOfDay: false,
      tags: ['Organic', 'Tussar', 'Handblock'],
      images: ['/frames/ezgif-frame-080.jpg', '/frames/ezgif-frame-140.jpg', '/frames/ezgif-frame-200.jpg'],
      procurement: {
        costPrice: 10500,
        weaverGuildName: 'Nathnagar Tussar Society, Bhagalpur',
        weaverContact: '+91 94310 66778',
        procurementDate: new Date('2026-08-28'),
        invoiceRef: 'BGP-2026-442',
        notes: 'Hand reeled ghicha yarn.',
      },
    },
    {
      sku: 'KAN-VIN-014',
      name: 'Kanchipuram Vintage Mubbagam 3-Color Silk Saree',
      slug: 'kanchipuram-vintage-mubbagam-3-color-silk-saree',
      description: 'Rare Mubbagam heritage format where the saree body is divided horizontally into three equal contrasting jewel-toned panels separated by gold zari stripes.',
      categorySlug: 'kanjivaram-heritage',
      subCategoryIndex: 2,
      sellingPrice: 46000,
      comparePrice: 54000,
      costPrice: 28000,
      stock: 1,
      isHeirloom1of1: true,
      fabric: 'Kanjivaram Silk',
      zariType: 'Tested Gold Zari',
      craftRegion: 'Kanchipuram',
      weaveStyle: 'Mubbagam Triple Panel',
      silkMarkNumber: 'SM-IN-2026-9288',
      isFeatured: true,
      isDealOfDay: false,
      tags: ['Mubbagam', 'Vintage', 'Heirloom'],
      images: ['/frames/ezgif-frame-180.jpg', '/frames/ezgif-frame-220.jpg', '/frames/ezgif-frame-100.jpg'],
      procurement: {
        costPrice: 28000,
        weaverGuildName: 'Varadharaja Weavers Society, Kanchipuram',
        weaverContact: '+91 94440 99881',
        procurementDate: new Date('2026-08-29'),
        invoiceRef: 'KPM-2026-991',
        notes: 'Triple horizontal panel format.',
      },
    },
    {
      sku: 'BAN-TAN-015',
      name: 'Varanasi Royal Satin Tanchoi Silk Saree',
      slug: 'varanasi-royal-satin-tanchoi-silk-saree',
      description: 'Extremely soft fluid Chinese-influenced multi-color extra weft brocade in emerald green and champagne gold with zero floating backside threads.',
      categorySlug: 'banarasi-heritage',
      subCategoryIndex: 1,
      sellingPrice: 31000,
      comparePrice: 36000,
      costPrice: 17500,
      stock: 2,
      isHeirloom1of1: false,
      fabric: 'Pure Katan Silk',
      zariType: 'Silver Zari',
      craftRegion: 'Varanasi',
      weaveStyle: 'Tanchoi Satin',
      silkMarkNumber: 'SM-IN-2026-8904',
      isFeatured: false,
      isDealOfDay: false,
      tags: ['Tanchoi', 'Fluid Silk', 'Cocktail'],
      images: ['/frames/ezgif-frame-230.jpg', '/frames/ezgif-frame-170.jpg', '/frames/ezgif-frame-090.jpg'],
      procurement: {
        costPrice: 17500,
        weaverGuildName: 'Pilikothi Weavers Union, Varanasi',
        weaverContact: '+91 94150 44332',
        procurementDate: new Date('2026-08-30'),
        invoiceRef: 'VNS-2026-INV-998',
        notes: 'Fine gauge satin warp.',
      },
    },
    {
      sku: 'CHA-ORG-016',
      name: 'Chanderi Gold Jaal Royal Organza Saree',
      slug: 'chanderi-gold-jaal-royal-organza-saree',
      description: 'Delicate sheer organza silk saree woven with full body ashrafi gold coin motifs and scalloped zari borders for daytime imperial celebrations.',
      categorySlug: 'chanderi-heritage',
      subCategoryIndex: 1,
      sellingPrice: 26500,
      comparePrice: 31000,
      costPrice: 14500,
      stock: 2,
      isHeirloom1of1: false,
      fabric: 'Chanderi Organza Silk',
      zariType: 'Pure Gold Zari',
      craftRegion: 'Chanderi',
      weaveStyle: 'Organza Jacquard',
      silkMarkNumber: 'SM-IN-2026-6712',
      isFeatured: false,
      isDealOfDay: false,
      tags: ['Organza', 'Meenakari', 'Pastel'],
      images: ['/frames/ezgif-frame-120.jpg', '/frames/ezgif-frame-050.jpg', '/frames/ezgif-frame-210.jpg'],
      procurement: {
        costPrice: 14500,
        weaverGuildName: 'Bunkar Vikas Samiti, Chanderi',
        weaverContact: '+91 97550 11223',
        procurementDate: new Date('2026-08-31'),
        invoiceRef: 'CHD-2026-204',
        notes: 'Fine silk organza with pure zari coins.',
      },
    },
  ];

  for (const item of productsData) {
    const { procurement, categorySlug, subCategoryIndex, ...prodDetails } = item;
    const cat = categoryMap.get(categorySlug);
    const subCat = cat?.subCategories?.[subCategoryIndex] || cat?.subCategories?.[0];

    const prod = await prisma.product.upsert({
      where: { sku: prodDetails.sku },
      update: {
        ...prodDetails,
        categoryId: cat ? cat.id : undefined,
        subCategoryId: subCat ? subCat.id : undefined,
      },
      create: {
        ...prodDetails,
        categoryId: cat ? cat.id : undefined,
        subCategoryId: subCat ? subCat.id : undefined,
      },
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
    console.log(`✓ Seeded Product & Vault: ${prod.name} (${prod.sku})`);
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
