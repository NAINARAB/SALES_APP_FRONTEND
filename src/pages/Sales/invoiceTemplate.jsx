import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from '@mui/material';
import { Close, Save } from '@mui/icons-material';
import { api } from '../../host';
import { isEqualNumber, isGraterNumber, NumberFormat } from '../functions';


const InvoiceBillTemplate = (props) => {
    const { orderDetails, orderProducts, postFun } = props;
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [retailerInfo, setRetailerInfo] = useState([]); 

    useEffect(() => {
        fetch(`${api}api/masters/products`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data)
                }
            }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        fetch(`${api}api/masters/retailers/retaileDetails?Retailer_Id=${orderDetails?.Retailer_Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRetailerInfo(data.data)
                }
            }).catch(e => console.error(e))
    }, [orderDetails?.Retailer_Id])

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const includedProducts = products.filter(product => {
        return orderProducts.some(orderProduct => isEqualNumber(orderProduct?.Item_Id, product?.Product_Id) && isGraterNumber(orderProduct?.Bill_Qty, 0));
    });

    // console.log(orderDetails);

    return (
        <>
            <span onClick={handleOpen}>{props.children}</span>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>

                <DialogTitle>Order Preview</DialogTitle>

                <DialogContent>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className='border text-white theme-bg'>Sno</th>
                                    <th className='border text-white theme-bg'>Product</th>
                                    <th className='border text-white theme-bg'>Quantity</th>
                                    <th className='border text-white theme-bg'>Item Rate</th>
                                    <th className='border text-white theme-bg'>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {includedProducts.map((o, i) => {
                                    const quantity = orderProducts.find(oo => isEqualNumber(oo?.Item_Id, o?.Product_Id))?.Bill_Qty || 0;
                                    const amount = quantity * o?.Item_Rate;
                                    return (
                                        <tr key={i}>
                                            <td className='border'>{i + 1}</td>
                                            <td className='border'>{o?.Product_Name}</td>
                                            <td className='border'>{NumberFormat(quantity)}</td>
                                            <td className='border'>{NumberFormat(o?.Item_Rate)}</td>
                                            <td className='border'>{NumberFormat(amount)}</td>
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td className='border' colSpan="3"></td>
                                    <td className='fw-bold text-end'>Total</td>
                                    <td className='fw-bold border'>
                                        {NumberFormat(includedProducts.reduce((total, o) => {
                                            const quantity = orderProducts.find(oo => isEqualNumber(oo?.Item_Id, o?.Product_Id))?.Bill_Qty || 0;
                                            return total + (quantity * o?.Item_Rate);
                                        }, 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button startIcon={<Close />} variant='outlined' color='error' onClick={handleClose}>
                        Close
                    </Button>
                    {postFun && (
                        <Button
                            startIcon={<Save />}
                            variant='contained'
                            color='success'
                            onClick={() => {
                                postFun();
                                handleClose();
                            }}
                        >
                            Submit
                        </Button>
                    )}
                </DialogActions>

            </Dialog>
        </>
    )
}

export default InvoiceBillTemplate;