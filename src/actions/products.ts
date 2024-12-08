'use server';

import slugify from "slugify";
import { createClient } from "@/supabase/server";

import { ProductsWithCategoriesResponse, UpdateProductSchema } from "@/app/admin/products/products.types";
import { CreateProductSchemaServer, createProductSchemaServer } from "@/app/admin/products/schema";

const supabase = await createClient();

export const getProductWithCategories = async (): Promise<ProductsWithCategoriesResponse> => {
    const { data, error } = await supabase
        .from('product')
        .select('*, category:category(*)')
        .returns<ProductsWithCategoriesResponse>();

    console.log(data);

    if (error) throw new Error(`Error fetching products with categories: ${error.message}`);

    return data || [];
};

export const createProduct = async ({
    category,
    heroImage,
    images,
    maxQuantity,
    price,
    title
}: CreateProductSchemaServer) => {

    const slug = slugify(title, { lower: true });

    const { data, error } = await supabase
        .from('product')
        .insert({
            category,
            heroImage,
            imagesUrl: images,
            maxQuantity,
            price,
            slug,
            title
        });

    if (error) throw new Error(`Error creating product: ${error.message}`);

    return data;
};

export const updateProduct = async ({
    category,
    heroImage,
    imagesUrl,
    maxQuantity,
    price,
    slug,
    title
}: UpdateProductSchema) => {

    const { data, error } = await supabase
        .from('product')
        .update({
            category,
            heroImage,
            imagesUrl,
            maxQuantity,
            price,
            title
        })
        .match({ slug });

    if (error) throw new Error(`Error updating product: ${error.message}`);

    return data;
};

export const deleteProduct = async (slug: string) => {
    const { error } = await supabase.from('product').delete().match({ slug });

    if (error) throw new Error(`Error deleting product: ${error.message}`);
};

