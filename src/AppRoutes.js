import SaleOrderConvert from "./pages/salesOrderConvertion/saleOrdersModification";
import Users from "./pages/Masters/users";
import RetailersMaster from "./pages/Masters/retailers";

export const routes = [
    {
        path: '/saleOrder/convert',
        comp: <SaleOrderConvert />
    },
    {
        path: '/masters/users',
        comp: <Users />
    },
    {
        path: '/masters/retailers',
        comp: <RetailersMaster />
    }
]