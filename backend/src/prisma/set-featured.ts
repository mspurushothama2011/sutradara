import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setFeatured() {
  // Flag top 4 categories as isFeatured
  const slugs = ['banarasi-heritage', 'kanjivaram-heritage', 'paithani-heritage', 'chanderi-heritage'];
  
  for (let i = 0; i < slugs.length; i++) {
    await prisma.category.updateMany({
      where: { slug: slugs[i] },
      data: { isFeatured: true, displayOrder: i + 1 },
    });
  }

  const list = await prisma.category.findMany({
    select: { name: true, slug: true, isFeatured: true, displayOrder: true },
    orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
  });

  console.log('Categories in DB with featured status:', list);
}

setFeatured()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
