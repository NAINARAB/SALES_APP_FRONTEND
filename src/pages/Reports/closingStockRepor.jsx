import React, { useState, useEffect } from "react";
import { Card, CardContent, IconButton, Collapse } from "@mui/material";
import '../common.css'
import { api } from "../../host";

// import { toast } from 'react-toastify';
import { LocalDate, NumberFormat } from "../functions";
import { Add, Remove} from "@mui/icons-material";



const StockReportAreaBased = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [stockValue, setStockValaue] = useState([]);

    useEffect(() => {

        fetch(`${api}api/sales/areaBasedReport?Company_id=${storage?.Company_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStockValaue(data.data)
                }
            }).catch(e => console.error(e))

    }, [storage?.Company_id])

    const AreaList = ({ o, sno }) => {
        const [open, setOpen] = useState(false);

        const areaValue = () => {
            let totalClosingStockValue = 0;

            o?.Retailer?.forEach(retailer => {
                retailer?.Closing_Stock?.forEach(stock => {
                    totalClosingStockValue += stock.Previous_Balance * stock.Item_Rate;
                });
            });

            return totalClosingStockValue;
        };

        return (
            <>
                <tr>
                    <td className="fa-13 border">
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <Remove sx={{ fontSize: '16px', color: 'red' }} /> : <Add sx={{ fontSize: '16px' }} />}
                        </IconButton>
                    </td>
                    <td className="fa-13 border">{sno}</td>
                    <td className="fa-13 border">{o?.Area_Name ? o?.Area_Name : 'unknown'}</td>
                    <td className="fa-13 border">{o?.Retailer?.length}</td>
                    <td className="fa-13 border">{NumberFormat(areaValue())}</td>
                </tr>

                <tr>
                    <td colSpan={5} className="p-0 border-0">

                        <Collapse in={open} timeout="auto" unmountOnExit>

                            <div className="table-responsive my-2">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {['', 'SNo', 'Retailer', 'Products', 'Value'].map((ret, ind) => (
                                                <th key={ind} className="fa-14 border">{ret}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {o?.Retailer?.map((ret, ind) => <RetailerList o={ret} sno={ind + 1} />)}
                                    </tbody>
                                </table>
                            </div>

                        </Collapse>
                    </td>
                </tr>
            </>
        )
    }

    const RetailerList = ({ o, sno }) => {
        const [open, setOpen] = useState(false);

        const overAllValue = (data) => {
            let totalClosingStockValue = 0;

            o?.Closing_Stock?.forEach(stock => {
                totalClosingStockValue += stock?.Previous_Balance * stock?.Item_Rate;
            })

            return totalClosingStockValue;
        };

        return (
            <>
                <tr>
                    <td>
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <Remove sx={{ fontSize: '16px', color: 'red' }} /> : <Add sx={{ fontSize: '16px' }} />}
                        </IconButton>
                    </td>
                    <td className="fa-13 border">{sno}</td>
                    <td className="fa-13 border">
                        <span className="fa-bold">{o?.Retailer_Name}</span> <br />
                        <span className="fa-12 text-muted">{o?.Reatailer_Address}</span>
                    </td>
                    <td className="fa-13 border">{o?.Closing_Stock?.length}</td>
                    <td className="fa-13 border">
                        {NumberFormat(overAllValue())}
                    </td>
                </tr>

                <tr>
                    <td colSpan={5} className="p-0">
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <div className="table-responsive my-2">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {['Sno', 'Product Name', 'Date', 'Quantity', 'Rate', 'Value'].map(o => (
                                                <th className="fa-14 border text-center" key={o}>{o}</th>

                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {o?.Closing_Stock?.map((pro, i) => (
                                            <tr key={i}>
                                                <td className="fa-14 border">{i + 1}</td>
                                                <td className="fa-14 border">{pro?.Product_Name}</td>
                                                <td className="fa-14 border text-center">{LocalDate(pro?.Cl_Date)}</td>
                                                <td className="fa-14 border text-end">{NumberFormat(pro?.Previous_Balance)}</td>
                                                <td className="fa-14 border text-end">{pro?.Item_Rate}</td>
                                                <td className="fa-14 border text-end">
                                                    {(pro?.Previous_Balance && pro?.Item_Rate) ? NumberFormat(pro?.Item_Rate * pro?.Previous_Balance) : 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Collapse>
                    </td>
                </tr>
            </>
        )
    }

    const overAllValue = (data) => {
        let totalClosingStockValue = 0;

        data?.forEach(area => {
            area?.Retailer?.forEach(retailer => {
                retailer?.Closing_Stock?.forEach(stock => {
                    totalClosingStockValue += stock?.Previous_Balance * stock?.Item_Rate;
                });
            });
        });

        return totalClosingStockValue;
    };

    return (
        <>
            <Card>
                <div className="p-3 pb-2 d-flex align-items-center justify-content-between border-bottom">
                    <h6 className="fa-18">Closing Stock Reports</h6>
                    <span className="fw-bold ">₹ {NumberFormat(overAllValue(stockValue))}</span>
                </div>
                <CardContent>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    {['', 'SNo', 'Area', 'Retailers', 'Value'].map((o, i) => (
                                        <th key={i} className="border fa-14">{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stockValue?.map((o, i) => <AreaList key={i} sno={i + 1} o={o} />)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}


export default StockReportAreaBased;