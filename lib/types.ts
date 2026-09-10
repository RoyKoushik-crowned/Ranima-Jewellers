export type Availability = "AVAILABLE" | "RESERVED" | "SOLD" | "MADE_TO_ORDER" | "ARCHIVED";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  metal: "gold" | "silver";
  purity: string;
  gold_weight: number | null;
  gross_weight?: number | null;
  stone_weight?: number | null;
  stone_unit?: string | null;
  stone_type?: string | null;
  size: string | null;
  huid: string | null;
  hallmark_status: string;
  modification_available: boolean;
  availability: Availability;
  featured: boolean;
  additional_charges?: number;
  images: string[];
};