import React, { useState, useEffect } from "react";
import { Card, Box, CardContent, CardMedia, Button, Tab, CardActions } from "@mui/material";
import '../common.css'
import Select from "react-select";
import { api } from "../../host";
import { customSelectStyles } from "../tableColumns";
import { toast } from 'react-toastify';
import { isGraterNumber, ISOString } from "../functions";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import InvoiceBillTemplate from "./invoiceTemplate";
import { Visibility } from "@mui/icons-material";



const SaleOrderCreation = () => {
    const storage = JSON.parse(localStorage.getItem('user'));

    const [retailers, setRetailers] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);

    const [tabValue, setTabValue] = useState('1');

    const initialValue = {
        Company_Id: storage?.Company_id,
        So_Date: ISOString(),
        Retailer_Id: '',
        Retailer_Name: 'Select',
        Sales_Person_Id: '',
        Sales_Person_Name: 'Select',
        Branch_Id: storage?.BranchId,
        Narration: '',
        Created_by: storage?.UserId,
        Product_Array: [],
        So_Id: ''
    }

    const [orderDetails, setOrderDetails] = useState(initialValue)
    const [orderProducts, setOrderProducts] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {

        fetch(`${api}api/masters/retailers/dropDown?Company_Id=${storage?.Company_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRetailers(data.data);
                }
            }).catch(e => console.error(e))

        fetch(`${api}api/masters/products/grouped`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data)
                }
            }).catch(e => console.error(e))

        fetch(`${api}api/masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSalePerson(data.data)
                }
            }).catch(e => console.error(e))

    }, [storage?.Company_id])

    const handleStockInputChange = (productId, value, rate) => {
        const productIndex = orderProducts.findIndex(item => item.Item_Id === productId);

        if (productIndex !== -1) {
            const updatedValues = [...orderProducts];
            updatedValues[productIndex].Bill_Qty = value;
            updatedValues[productIndex].Item_Rate = rate

            setOrderProducts(updatedValues);
        } else {
            setOrderProducts(prevValues => [...prevValues, { Item_Id: productId, Bill_Qty: value, Item_Rate: rate }]);
        }
    };

    const postSaleOrder = () => {
        if (orderProducts?.length > 0 && orderDetails?.Retailer_Id) {
            fetch(`${api}api/sales/saleOrder`, {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...orderDetails,
                    Product_Array: orderProducts.filter(o => isGraterNumber(o?.Bill_Qty, 0))
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        toast.success(data?.message);
                        // setReload(!reload)
                        setOrderDetails(initialValue);
                        setOrderProducts([])
                    } else {
                        toast.error(data?.message)
                    }
                })
                .catch(e => console.error(e))
        } else {
            if (orderProducts.length <= 0) {
                return toast.error('Enter any one product quantity')
            }
            if (!orderDetails?.Retailer_Id) {
                return toast.error('Select Retailer')
            }
        }
    }

    // useEffect(() => console.log(orderProducts), [orderProducts])

    return (
        <>
            <Card>

                <div className="p-3 pb-2 d-flex align-items-center justify-content-between">
                    <h6 className="fa-18">Sale Order</h6>
                </div>

                <CardContent style={{ maxHeight: '68vh', overflow: 'auto' }}>

                    <div className="row">
                        <div className="col-xl-3 col col-sm-4 mb-4">
                            <label>Date</label>
                            <input
                                type="date"
                                value={orderDetails?.So_Date ? new Date(orderDetails?.So_Date).toISOString().split('T')[0] : ''}
                                onChange={e => setOrderDetails({ ...orderDetails, So_Date: e.target.value })}
                                className="cus-inpt" required
                            />
                        </div>

                        <div className="col-xl-3 col-sm-4 mb-4">
                            <label>Retailer Name</label>
                            <Select
                                value={{ value: orderDetails?.Retailer_Id, label: orderDetails?.Retailer_Name }}
                                onChange={(e) => setOrderDetails({ ...orderDetails, Retailer_Id: e.value, Retailer_Name: e.label })}
                                options={[
                                    ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Retailer Name"}
                            />

                        </div>

                        <div className="col-xl-3 col-sm-4 mb-4">
                            <label>Sales Person Name</label>
                            <Select
                                value={{ value: orderDetails?.Sales_Person_Id, label: orderDetails?.Sales_Person_Name }}
                                onChange={(e) => setOrderDetails({ ...orderDetails, Sales_Person_Id: e.value, Sales_Person_Name: e.label })}
                                options={[
                                    { value: '', label: 'Select' },
                                    ...salesPerson.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Sales Person Name"}
                            />
                        </div>
                    </div>

                    <TabContext value={tabValue}>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList
                                indicatorColor='transparant'
                                onChange={(e, n) => setTabValue(n)}
                                variant='scrollable'
                                scrollButtons="auto"
                            >
                                {products?.map((o, i) => (
                                    <Tab
                                        key={i}
                                        sx={String(tabValue) === String(o?.Pro_Group_Id) ? { backgroundColor: '#c6d7eb' } : {}}
                                        label={o?.Pro_Group}
                                        value={String(o?.Pro_Group_Id)}
                                    />
                                ))}
                            </TabList>
                        </Box>

                        {products?.map((o, i) => (
                            <TabPanel key={i} value={String(o?.Pro_Group_Id)} sx={{ p: 0 }}>
                                <div className="row">
                                    {o?.GroupedProductArray?.map((oo, ii) => (
                                        <div className="col-xl-4 col-lg-6 p-2" key={ii}>
                                            <Card sx={{ display: 'flex' }}>

                                                <CardMedia
                                                    component="img"
                                                    sx={{ width: 151 }}
                                                    image={oo?.productImageUrl}
                                                    alt="Pic"
                                                />

                                                <CardContent sx={{ flexGrow: '1' }}>
                                                    <h6 className="fa-14">{oo?.Product_Name}</h6>
                                                    <p className="fa-14">{oo?.Product_Description + " - " + oo?.UOM}</p>

                                                    <div className="py-2">
                                                        <label className="mb-2 w-100">Quantity</label>
                                                        <input
                                                            style={{ maxWidth: 350 }}
                                                            type="number"
                                                            className="cus-inpt"
                                                            onChange={e =>
                                                                handleStockInputChange(
                                                                    oo?.Product_Id,
                                                                    e.target.value,
                                                                    oo?.Item_Rate
                                                                )
                                                            }
                                                            value={(
                                                                orderProducts.find(ooo => Number(ooo?.Item_Id) === Number(oo?.Product_Id))?.Bill_Qty || ''
                                                            )}
                                                        />
                                                    </div>
                                                </CardContent>

                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </TabPanel>
                        ))}
                    </TabContext>

                </CardContent>
                <CardActions className="d-flex justify-content-between align-items-center bg-light">

                    <div className="col-lg-6 col-md-6 col-sm-10 col-9">
                        <input
                            className="cus-inpt bg-white"
                            onChange={e => setOrderDetails({ ...orderDetails, Narration: e.target.value })}
                            value={orderDetails?.Narration}
                            placeholder="Discribtion"
                            // rows={4}
                        />
                    </div>
                    <InvoiceBillTemplate orderDetails={orderDetails} orderProducts={orderProducts} postFun={postSaleOrder}>
                        <Button  variant='contained' color='primary' startIcon={<Visibility />}>Preview</Button>
                    </InvoiceBillTemplate>
                    
                </CardActions>
            </Card>
        </>
    )
}


export default SaleOrderCreation;