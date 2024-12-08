import { getCategoriesWithProducts } from "@/actions/categories";
import { ProductPageComponent } from "./page-component";

export default async function Products() {
    const categories = await getCategoriesWithProducts();

    return <ProductPageComponent categories={categories} />;
}