import { Type } from "lucide-react";
import { z } from "zod";

export type ProductWithCategory = {
    id: number;
    title: string;
    slug: string;
    imagesUrl: string[];
    price: number;
    heroImage: string;
    category: number;
    maxQuantity: number;
};

export type ProductWithCategoriesResponse = ProductWithCategory[];

export type UpdateProductSchema = {
    category: number;
    heroImage: string;
    imagesUrl: string[];
    maxQuantity: number;
    price: number | null;
    slug: string;
    title: string;
};