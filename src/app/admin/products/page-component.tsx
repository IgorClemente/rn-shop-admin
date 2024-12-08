'use client';

import React, { FC, useState } from 'react'
import { Category } from '@/app/admin/categories/categories.types';
import { ProductsWithCategoriesResponse } from './products.types';
import { createOrUpdateProductSchema, CreateOrUpdateProductSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { imageUploadHandler } from '@/actions/categories';
import { toast } from 'sonner';
import { createProduct, deleteProduct, updateProduct } from '@/actions/products';

type Props = {
    categories: Category[];
    productsWithCategories: ProductsWithCategoriesResponse
};

export const ProductPageComponent: FC<Props> = ({
    categories,
    productsWithCategories
}) => {

    const [currentProduct, setCurrentProduct] = useState<CreateOrUpdateProductSchema | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const form = useForm<CreateOrUpdateProductSchema>({
        resolver: zodResolver(createOrUpdateProductSchema),
        defaultValues: {
            title: '',
            category: undefined,
            price: undefined,
            maxQuantity: undefined,
            heroImage: undefined,
            images: [],
            intent: 'create'
        }
    });

    const router = useRouter();

    const productCreateUpdateHandler = async (data: CreateOrUpdateProductSchema) => {
        const {
            category,
            images,
            maxQuantity,
            price,
            title,
            heroImage,
            slug,
            intent = 'create'
        } = data;

        const uploadFile = async (file: File) => {
            const uniqueId = uuid();
            const fileName = `product/product-${uniqueId}-${file.name}`;
            const formData = new FormData();
            formData.append('file', file, fileName);
            return imageUploadHandler(formData);
        };

        let heroImageUrl: string | undefined;
        let imagesUrl: string[] = [];

        if (heroImage) {
            const imagePromise = Array.from(heroImage).map(file =>
                uploadFile(file as File)
            );

            try {
                [heroImageUrl] = await Promise.all(imagePromise);
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Error uploading image');
                return;
            }
        }

        if (images.length > 0) {
            const imagesPromises = Array.from(images).map(file => uploadFile(file as File));

            try {
                imagesUrl = (await Promise.all(imagesPromises)) as string[];
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Error uploading image');
                return;
            }
        }

        switch (intent) {
            case 'create': {
                if (heroImageUrl && imagesUrl.length > 0) {
                    await createProduct({
                        category: Number(category),
                        images: imagesUrl,
                        heroImage,
                        maxQuantity: Number(maxQuantity),
                        price: Number(price),
                        title
                    });
                    form.reset();
                    router.refresh();
                    setIsProductModalOpen(false);
                    toast.success('Product created successfully');
                }
                break;
            }
            case 'update': {
                if (heroImageUrl && imagesUrl.length > 0 && slug) {
                    await updateProduct({
                        category: Number(category),
                        heroImage,
                        imagesUrl,
                        maxQuantity: Number(maxQuantity),
                        price: Number(price),
                        slug,
                        title
                    });
                    form.reset();
                    router.refresh();
                    toast.success('Product updated successfully');
                }
                break;
            }
            default:
                console.log('Invalid intent');
        }
    }

    const deleteProductHandler = async () => {
        if (currentProduct?.slug) {
            await deleteProduct(currentProduct.slug);
            router.refresh();
            toast.success('Product deleted successfully');
            setIsDeleteModalOpen(false);
            setCurrentProduct(null);
        }
    }

    return (
        <div>ProductPageComponent</div>
    )
}

