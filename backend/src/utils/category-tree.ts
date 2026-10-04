export interface CategoryBreadcrumb {
  id: string;
  name: string;
  slug: string;
  level: number;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  region?: string | null;
  image?: string | null;
  isFeatured: boolean;
  displayOrder: number;
  parentId?: string | null;
  level: number; // 0 = Root, 1 = Subcategory, 2 = Sub-subcategory, 3 = Sub-sub-subcategory
  breadcrumbs: CategoryBreadcrumb[];
  children: CategoryTreeNode[];
  productCount: number;
  totalDescendantProductCount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const MAX_CATEGORY_DEPTH = 3; // 0, 1, 2, 3 -> Total 4 tiers

/**
 * Builds an in-memory N-level hierarchical tree from a flat category list in O(N) time.
 */
export function buildCategoryTree(rawCategories: any[]): CategoryTreeNode[] {
  const nodeMap = new Map<string, CategoryTreeNode>();
  const rootNodes: CategoryTreeNode[] = [];

  // 1. Initialize all nodes
  for (const cat of rawCategories) {
    const directCount = cat._count?.products ?? (cat.products ? cat.products.length : (cat.productCount ?? 0));
    nodeMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? null,
      region: cat.region ?? null,
      image: cat.image ?? null,
      isFeatured: cat.isFeatured ?? false,
      displayOrder: cat.displayOrder ?? 0,
      parentId: cat.parentId ?? null,
      level: 0,
      breadcrumbs: [],
      children: [],
      productCount: directCount,
      totalDescendantProductCount: directCount,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    });
  }

  // 2. Wire up parent-child relationships
  for (const cat of rawCategories) {
    const node = nodeMap.get(cat.id)!;
    if (cat.parentId && nodeMap.has(cat.parentId)) {
      const parent = nodeMap.get(cat.parentId)!;
      parent.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  // 3. Compute levels, breadcrumbs, and aggregate descendant product counts recursively
  function processNode(node: CategoryTreeNode, currentLevel: number, ancestorBreadcrumbs: CategoryBreadcrumb[]): number {
    node.level = currentLevel;
    const currentBreadcrumb: CategoryBreadcrumb = {
      id: node.id,
      name: node.name,
      slug: node.slug,
      level: currentLevel,
    };
    node.breadcrumbs = [...ancestorBreadcrumbs, currentBreadcrumb];

    // Sort children by displayOrder ascending, then name ascending
    node.children.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });

    let subtreeProductCount = node.productCount;
    for (const child of node.children) {
      subtreeProductCount += processNode(child, currentLevel + 1, node.breadcrumbs);
    }

    node.totalDescendantProductCount = subtreeProductCount;
    return subtreeProductCount;
  }

  // Sort root nodes
  rootNodes.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name);
  });

  for (const root of rootNodes) {
    processNode(root, 0, []);
  }

  return rootNodes;
}

/**
 * Flattens a category tree into a linear array preserving depth & ancestry breadcrumbs.
 */
export function flattenCategoryTree(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];

  function traverse(nodes: CategoryTreeNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return result;
}

/**
 * Recursively extracts all descendant category IDs for a given target category ID.
 */
export function getDescendantCategoryIds(targetCategoryId: string, allCategories: any[]): string[] {
  const childrenMap = new Map<string, string[]>();

  for (const cat of allCategories) {
    if (cat.parentId) {
      const list = childrenMap.get(cat.parentId) || [];
      list.push(cat.id);
      childrenMap.set(cat.parentId, list);
    }
  }

  const descendantIds: string[] = [];
  const queue = [targetCategoryId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = childrenMap.get(currentId) || [];
    for (const childId of children) {
      descendantIds.push(childId);
      queue.push(childId);
    }
  }

  return descendantIds;
}

/**
 * Validates depth and detects cycles before creating or updating a category.
 */
export function validateCategoryHierarchy(
  targetParentId: string | null | undefined,
  currentCategoryId: string | null | undefined,
  allCategories: any[]
): { isValid: boolean; computedLevel: number; error?: string } {
  if (!targetParentId) {
    return { isValid: true, computedLevel: 0 };
  }

  // Self reference check
  if (currentCategoryId && targetParentId === currentCategoryId) {
    return { isValid: false, computedLevel: 0, error: 'A category cannot be its own parent.' };
  }

  const catMap = new Map<string, any>();
  for (const c of allCategories) {
    catMap.set(c.id, c);
  }

  const parent = catMap.get(targetParentId);
  if (!parent) {
    return { isValid: false, computedLevel: 0, error: 'Specified parent category does not exist.' };
  }

  // Detect cycle & compute parent depth
  let current: any = parent;
  let parentDepth = 0;
  const visited = new Set<string>();

  if (currentCategoryId) {
    visited.add(currentCategoryId);
  }

  while (current) {
    if (visited.has(current.id)) {
      return {
        isValid: false,
        computedLevel: 0,
        error: 'Circular category hierarchy detected. Cannot set parent to a descendant category.',
      };
    }
    visited.add(current.id);
    parentDepth++;

    if (!current.parentId) {
      break;
    }
    current = catMap.get(current.parentId);
  }

  // Proposed node will have level = parentDepth (since root parent has depth 1 => child level 1)
  const proposedLevel = parentDepth; // e.g. parent is Root (level 0) -> proposed child is level 1

  if (proposedLevel > MAX_CATEGORY_DEPTH) {
    return {
      isValid: false,
      computedLevel: proposedLevel,
      error: `Category hierarchy cannot exceed 3 subcategory levels (${MAX_CATEGORY_DEPTH + 1} total tiers: Root -> Level 1 -> Level 2 -> Level 3).`,
    };
  }

  return { isValid: true, computedLevel: proposedLevel };
}
