import { getCategoriesWithProducts } from "@/actions/categories";
import { ProductPageComponent } from "./page-component";
import { getProductWithCategories } from "@/actions/products";

export default async function Products() {
    const categories = await getCategoriesWithProducts();
    const productsWithCategories = await getProductWithCategories();

    return (<ProductPageComponent
        categories={categories}
        productsWithCategories={productsWithCategories}
    />);
}
