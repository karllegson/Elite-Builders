export type PostCategory = {
  id: string;
  name: string;
  parentId: string | null;
};

export type CategoryOption = {
  id: string;
  label: string;
};

export function createCategoryId(): string {
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCategory(
  name: string,
  parentId: string | null,
): PostCategory {
  return {
    id: createCategoryId(),
    name: name.trim(),
    parentId: parentId || null,
  };
}

export function buildCategoryOptions(
  categories: PostCategory[],
): CategoryOption[] {
  const byParent = new Map<string | null, PostCategory[]>();

  for (const category of categories) {
    const parentKey = category.parentId;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(category);
    byParent.set(parentKey, siblings);
  }

  const options: CategoryOption[] = [];

  const walk = (parentId: string | null, depth: number) => {
    const siblings = byParent.get(parentId) ?? [];

    siblings
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((category) => {
        options.push({
          id: category.id,
          label: `${"— ".repeat(depth)}${category.name}`,
        });
        walk(category.id, depth + 1);
      });
  };

  walk(null, 0);

  return options;
}
