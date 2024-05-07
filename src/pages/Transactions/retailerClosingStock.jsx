import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { customTableStyles } from "../tableColumns";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Card, Box, CardContent, CardMedia, Tooltip, Button, Tab, Paper, Typography } from "@mui/material";
import { Person, Call, LocationOn, ProductionQuantityLimits, ArrowBack } from "@mui/icons-material";
import '../common.css'
import Select from "react-select";
import { api } from "../../host";
import { customSelectStyles } from "../tableColumns";
import { toast } from 'react-toastify';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
// import ScrollableTabs from '@mui/material/ScrollableTabs';


const RetailerClosingStock = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [retailers, setRetailers] = useState([]);
    const [products, setProducts] = useState([]);
    const [productClosingStock, setProductClosingStock] = useState([]);
    const [filteredData, setFilteredData] = useState([])
    const [tabValue, setTabValue] = useState('1')

    const [dialog, setDialog] = useState({
        closingStock: false
    });
    const [filters, setFilters] = useState({
        cust: '',
        custGet: 'All Retailer',
    });

    const initialStockValue = {
        Company_Id: storage?.Company_id,
        ST_Date: new Date().toISOString().split('T')[0],
        Retailer_Id: '',
        Retailer_Name: '',
        Narration: '',
        Created_by: storage?.UserId,
        Product_Stock_List: []
    }
    const [stockInputValue, setStockInputValue] = useState(initialStockValue)
    const [closingStockValues, setClosingStockValues] = useState([]);


    useEffect(() => {
        fetch(`${api}api/masters/retailers/dropDown?Company_Id=${storage?.Company_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRetailers(data.data);
                }
            }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        fetch(`${api}api/masters/products/grouped`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data)
                }
            }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        if (stockInputValue?.Retailer_Id) {
            fetch(`${api}api/masters/retailers/productClosingStock?Retailer_Id=${stockInputValue?.Retailer_Id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setProductClosingStock(data.data)
                    }
                }).catch(e => console.error(e))
        }
    }, [stockInputValue?.ST_Date, stockInputValue?.Retailer_Id])

    useEffect(() => {
        const tempFilteredData = retailers.filter(o => {
            if (filters.cust) {
                return Number(o?.Retailer_Id) === Number(filters.cust);
            }

            return true;
        });
        setFilteredData(tempFilteredData);
    }, [filters.cust, retailers])

    const retailerColumn = [
        {
            name: 'Ledger',
            selector: (row) => row?.Retailer_Name,
            sortable: true,
        },
        {
            name: 'Incharge',
            selector: (row) => row?.Contact_Person,
            sortable: true,
        },
        {
            name: 'Mobile',
            selector: (row) => row.Mobile_No,
            sortable: true,
        },
        {
            name: 'Area',
            selector: (row) => row.AreaGet,
            sortable: true,
        },
        {
            name: 'Modified By',
            selector: (row) => row.lastModifiedBy,
            sortable: true,
        },
        {
            name: 'Action',
            cell: (row) => (
                <>

                    <Tooltip title='Update Closing Stock'>
                        <IconButton size="small" onClick={() => {
                            setDialog({ ...dialog, closingStock: true });
                            setStockInputValue({
                                ...stockInputValue,
                                Company_Id: row?.Company_Id,
                                Retailer_Id: row.Retailer_Id,
                                Retailer_Name: row?.Retailer_Name,
                            })
                        }} >
                            <ProductionQuantityLimits />
                        </IconButton>
                    </Tooltip>

                    {(row?.Latitude && row.Longitude) && (
                        <Tooltip title='Open in Google Map'>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${row?.Latitude},${row?.Longitude}`, '_blank');
                                }}
                                className="btn btn-info fa-14" color='primary'>
                                <LocationOn />
                            </IconButton>
                        </Tooltip>
                    )}

                </>
            )
        },
    ];

    const RetailerDetails = ({ data }) => {

        return (
            <div className="p-3">
                <Card sx={{ display: 'flex', mb: 1 }} >

                    <CardMedia
                        component="img"
                        sx={{ width: 350 }}
                        image={data?.imageUrl}
                        alt="retailer_picture"
                    />

                    <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>

                        <h6 className="mb-2 fa-16 fw-bold text-primary">{data?.Reatailer_Address}</h6>
                        <p className="fw-bold fa-14 text-muted">Route: {data?.RouteGet}</p>
                        <p className="fw-bold fa-14 text-muted">Class: {data?.Retailer_Class}</p>
                        <p className="fw-bold fa-14 text-muted">
                            Created: {data?.Created_Date ? new Date(data?.Created_Date).toLocaleDateString('en-IN') : '--:--:--'}
                            &nbsp; - &nbsp;
                            {data?.createdBy}
                        </p>
                        <p><Person className="fa-13 text-primary" /> {data?.Contact_Person}</p>
                        <p><Call className="fa-13 text-primary" /> {data?.Mobile_No}</p>

                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleStockInputChange = (productId, value) => {
        const productIndex = closingStockValues.findIndex(item => item.Product_Id === productId);

        if (productIndex !== -1) {
            const updatedValues = [...closingStockValues];
            updatedValues[productIndex].ST_Qty = value;
            setClosingStockValues(updatedValues);
        } else {
            setClosingStockValues(prevValues => [...prevValues, { Product_Id: productId, ST_Qty: value }]);
        }
    };

    const closeStockDialog = () => {
        setDialog({ ...dialog, closingStock: false });
        setClosingStockValues([]);
        setStockInputValue(initialStockValue)
    }

    const postClosingStock = () => {
        if (closingStockValues?.length > 0 && stockInputValue?.Retailer_Id) {
            fetch(`${api}api/masters/retailers/closingStock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...stockInputValue,
                    Product_Stock_List: closingStockValues
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        toast.success(data?.message);
                        closeStockDialog()
                    } else {
                        toast.error(data?.message)
                    }
                })
                .catch(e => console.error(e))
        } else {
            toast.error('Enter any one valid stock value')
        }
    }

    const getClosingStockCount = (productID) => {
        const obj = productClosingStock?.filter(o => Number(o?.Item_Id) === Number(productID));
        return obj[0]?.Previous_Balance ? 'Previous: ( ' + obj[0]?.Previous_Balance + ' )' : '' 
    }

    return (
        <>

            <div className="row mb-2">
                <div className="col-md-4 col-sm-6">
                    <label>Retailer</label>
                    <Select
                        value={{ value: filters?.cust, label: filters?.custGet }}
                        onChange={(e) => setFilters({ ...filters, cust: e.value, custGet: e.label })}
                        options={[
                            { value: '', label: 'All Retailer' },
                            ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                        ]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Retailer Name"}
                    />
                </div>
            </div>

            <div style={{ maxHeight: '80vh', overflowY: 'scroll' }}>

                <Card sx={{ mb: 1 }} >
                    <DataTable
                        columns={retailerColumn}
                        data={
                            filteredData.length > 0
                                ? filteredData
                                : (filters?.area === '' && filters?.cust === '')
                                    ? retailers
                                    : []
                        }
                        pagination
                        highlightOnHover={true}
                        fixedHeader={true}
                        fixedHeaderScrollHeight={'100vh'}
                        customStyles={customTableStyles}
                        expandableRows
                        expandableRowsComponent={RetailerDetails}
                    />
                </Card>

            </div>

            <Dialog
                open={dialog?.closingStock}
                onClose={closeStockDialog}
                fullScreen
            >
                <DialogTitle>
                    <IconButton size="small" onClick={closeStockDialog} className="me-2">
                        <ArrowBack />
                    </IconButton>
                    Add Closing Stock For
                    <span className="ps-1 text-primary">{stockInputValue?.Retailer_Name}</span>
                </DialogTitle>
                <DialogContent>

                    <div className="col-xl-3 col-sm-4 mb-4">
                        <label>Date</label>
                        <input
                            type="date"
                            value={stockInputValue?.ST_Date ? new Date(stockInputValue?.ST_Date).toISOString().split('T')[0] : ''}
                            onChange={e => setStockInputValue({ ...stockInputValue, ST_Date: e.target.value })}
                            className="cus-inpt" required
                        />
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
                                                    <h6>{oo?.Product_Name}</h6>
                                                    <p>{oo?.Product_Description + " - " + oo?.UOM}</p>

                                                    <div className="py-2">
                                                        <label className="mb-2 w-100">Closing Stock</label>
                                                        <input
                                                            style={{ maxWidth: 350 }}
                                                            type="number"
                                                            className="cus-inpt"
                                                            onChange={e => handleStockInputChange(oo?.Product_Id, e.target.value)}
                                                            value={
                                                                (closingStockValues.find(ooo =>
                                                                    Number(ooo?.Product_Id) === Number(oo?.Product_Id))?.ST_Qty
                                                                    || ''
                                                                )
                                                            }
                                                            placeholder={getClosingStockCount(oo?.Product_Id)}
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

                    <div className="col-lg-6 col-md-6 col-sm-8 mb-4">
                        <label>Narration</label>
                        <textarea
                            className="cus-inpt"
                            onChange={e => setStockInputValue({ ...stockInputValue, Narration: e.target.value })}
                            value={stockInputValue?.Narration}
                            rows={4}
                        />
                    </div>

                </DialogContent>
                <DialogActions className="bg-light">
                    <Button onClick={closeStockDialog}>cancel</Button>
                    <Button variant='contained' color='success' onClick={postClosingStock}>confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default RetailerClosingStock;