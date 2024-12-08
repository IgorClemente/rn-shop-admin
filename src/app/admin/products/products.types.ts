import { Type } from "lucide-react";
import { z } from "zod";
import { Category } from "@/app/admin/categories/categories.types";

export type ProductWithCategory = {
    id: number;
    title: string;
    slug: string;
    imagesUrl: string[];
    price: number;
    heroImage: string;
    category: Category;
    maxQuantity: number;
};

export type ProductsWithCategoriesResponse = ProductWithCategory[];

export type UpdateProductSchema = {
    category: number;
    heroImage: string;
    imagesUrl: string[];
    maxQuantity: number;
    price: number | null;
    slug: string;
    title: string;
};