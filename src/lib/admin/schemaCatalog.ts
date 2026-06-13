import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  ChefHat,
  Clapperboard,
  Database,
  FileText,
  Film,
  GraduationCap,
  List,
  ListOrdered,
  Megaphone,
  Monitor,
  Music,
  Package,
  ShoppingCart,
  Store,
  User,
  MessageCircle,
} from "lucide-react";

export type SchemaCatalogItem = {
  type: string;
  icon: LucideIcon;
};

export const SCHEMA_CATALOG: SchemaCatalogItem[] = [
  { type: "Article", icon: FileText },
  { type: "Course", icon: GraduationCap },
  { type: "Event", icon: Calendar },
  { type: "FactCheck", icon: MessageCircle },
  { type: "Job Posting", icon: Megaphone },
  { type: "Music", icon: Music },
  { type: "Product", icon: ShoppingCart },
  { type: "Restaurant", icon: Store },
  { type: "Software", icon: Package },
  { type: "Book", icon: BookOpen },
  { type: "Dataset", icon: Database },
  { type: "FAQ", icon: List },
  { type: "HowTo", icon: ListOrdered },
  { type: "Movie", icon: Film },
  { type: "Person", icon: User },
  { type: "Recipe", icon: ChefHat },
  { type: "Service", icon: Monitor },
  { type: "Video", icon: Clapperboard },
];

export const SCHEMA_USER_TEMPLATES: SchemaCatalogItem[] = [
  { type: "WebPage", icon: FileText },
  { type: "Article", icon: FileText },
  { type: "LocalBusiness", icon: Store },
  { type: "Organization", icon: Monitor },
];

export const SCHEMA_IMPORT_SOURCES = [
  "URL / Online Page",
  "JSON File",
  "Google Rich Results Test",
] as const;

export type SchemaImportSource = (typeof SCHEMA_IMPORT_SOURCES)[number];

export function filterSchemaCatalog(
  items: SchemaCatalogItem[],
  query: string,
): SchemaCatalogItem[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((item) => item.type.toLowerCase().includes(normalized));
}

export function schemaTypeInUse(
  schemas: { type: string }[],
  type: string,
): boolean {
  return schemas.some(
    (schema) => schema.type.toLowerCase() === type.toLowerCase(),
  );
}
