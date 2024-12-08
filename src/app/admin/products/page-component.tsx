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
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductTableRow } from './product-table-row';
import { ProductForm } from './product-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';

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
                        heroImage: heroImageUrl,
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
                        heroImage: heroImageUrl,
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
        <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
            <div className='container mx-auto p-4'>
                <div className='flex justify-between items-center mb-4'>
                    <h1 className='text-2xl font-bold'>
                        Products Management
                    </h1>
                    <Button
                        onClick={() => {
                            setCurrentProduct(null);
                            setIsProductModalOpen(true);
                        }}
                    >
                        <PlusIcon className='mr-2 h-4 w-4' /> Add Product
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Max Quantity</TableHead>
                            <TableHead>Hero Image</TableHead>
                            <TableHead>Product Images</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            productsWithCategories.map(product => (
                                <ProductTableRow
                                    key={product.id}
                                    product={product}
                                    setCurrentProduct={setCurrentProduct}
                                    setIsProductModalOpen={setIsProductModalOpen}
                                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                                />
                            ))
                        }
                    </TableBody>
                </Table>

                <ProductForm
                    form={form}
                    onSubmit={productCreateUpdateHandler}
                    categories={categories}
                    isProductModalOpen={isProductModalOpen}
                    setIsProductModalOpen={setIsProductModalOpen}
                    defaultValues={currentProduct}
                />

                <Dialog
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogContent>Delete Product</DialogContent>
                        </DialogHeader>
                        <p>Are you sure you want to delete {currentProduct?.title}</p>
                        <DialogFooter>
                            <Button variant='destructive' onClick={deleteProductHandler}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </main>
    )
}

