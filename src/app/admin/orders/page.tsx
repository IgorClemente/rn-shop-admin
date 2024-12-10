import { getOrdersWithProducts } from "@/actions/orders";
import PageComponent from "./page-component";

const Orders = async () => {
    const orderWithProducts = await getOrdersWithProducts();

    if (!orderWithProducts) return (
        <div className='text-center font-bold text-2xl'>No orders found</div>
    );

    return (
        <div>
            <PageComponent ordersWithProducts={orderWithProducts} />
        </div>
    );
};

export default Orders;