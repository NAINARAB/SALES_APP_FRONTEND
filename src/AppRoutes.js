import SaleOrderConvert from "./pages/salesOrderConvertion/saleOrdersModification";
import Users from "./pages/Masters/users";
import RetailersMaster from "./pages/Masters/retailers";
import ProductsMaster from "./pages/Masters/products";
import RetailerClosingStock from "./pages/Transactions/retailerClosingStock";
import VisitedLogs from "./pages/Tracking/visitLogs";
import SaleOrderCreation from "./pages/Sales/saleOrderCreation";

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
    },
    {
        path: '/masters/products',
        comp: <ProductsMaster />
    },
    {
        path: '/transaction/retailerClosingStock',
        comp: <RetailerClosingStock />
    },
    {
        path: '/tracking/visitLogs',
        comp: <VisitedLogs />
    },
    {
        path: '/sales/saleOrder',
        comp: <SaleOrderCreation />
    },
]