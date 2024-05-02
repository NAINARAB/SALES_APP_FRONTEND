import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { customTableStyles } from "../tableColumns";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, Box, CardContent, CardMedia, Tooltip, ImageOutlined, Button, Tab } from "@mui/material";
import { Delete, Edit, Store, Person, Call, LocationOn, ProductionQuantityLimits } from "@mui/icons-material";
import '../common.css'
import Select from "react-select";
import { api } from "../../host";
import { customSelectStyles } from "../tableColumns";

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';


const RetailersMaster = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [retailers, setRetailers] = useState([]);
    const [area, setArea] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredData, setFilteredData] = useState([])
    const [tabValue, setTabValue] = useState('1')

    const [dialog, setDialog] = useState({
        closingStock: false
    });
    const [filters, setFilters] = useState({
        cust: '',
        custGet: 'All Retailer',
        area: '',
        areaGet: 'All Area',
    });
    const initialStockValue = {
        Company_Id: storage?.Company_id,
        ST_Date: new Date().toISOString().split('T')[0],
        Retailer_Id: '',
        Narration: '',
        Created_by: storage?.Name,
        Product_Stock_List: []
    }
    const [stockInputValue, setStockInputValue] = useState(initialStockValue)


    useEffect(() => {
        fetch(`${api}api/masters/retailers?Company_Id=${storage?.Company_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRetailers(data.data);
                }
            }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        fetch(`${api}api/masters/areas`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setArea(data.data)
                }
            }).catch(e => console.error(e))
        fetch(`${api}api/masters/products/grouped`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data)
                }
            }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        const tempFilteredData = [];
        if (filters.area) {
            setFilters(pre => ({ ...pre, cust: '', custGet: 'All Retailer' }))
            retailers.map(o => {
                if (Number(o?.Area_Id) === Number(filters.area)) {
                    tempFilteredData.push(o)
                }
            })
            setFilteredData(tempFilteredData)
        } else if (filters.cust) {
            setFilters(pre => ({ ...pre, area: '', areaGet: 'All Area' }))
            retailers.map(o => {
                if (Number(o?.Retailer_Id) === Number(filters.cust)) {
                    tempFilteredData.push(o)
                }
            })
            setFilteredData(tempFilteredData)
        }
    }, [filters.area, filters.cust])

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
                        <IconButton size="small" onClick={() => setDialog({ ...dialog, closingStock: true })} >
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
                            ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj.Retailer_Name }))
                        ]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Retailer Name"}
                    />
                </div>

                <div className="col-md-4 col-sm-6">
                    <label>Area</label>
                    <Select
                        value={{ value: filters?.area, label: filters?.areaGet }}
                        onChange={(e) => setFilters({ ...filters, area: e.value, areaGet: e.label })}
                        options={[
                            { value: '', label: 'All Area' },
                            ...area.map(obj => ({ value: obj?.Area_Id, label: obj.Area_Name }))
                        ]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Area Name"}
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
                onClose={() => setDialog({ ...dialog, closingStock: false })}
                fullScreen
            >
                <DialogTitle>Add Closing Stock</DialogTitle>
                <DialogContent>

                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8 mb-4">
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
                            <TabList indicatorColor='transparant' onChange={(e, n) => setTabValue(n)} >
                                {products.map((o, i) => (
                                    <Tab 
                                        key={i} 
                                        sx={String(tabValue) === String(i) ? { backgroundColor: '#c6d7eb' } : {}} 
                                        label={o?.Pro_Group} 
                                        value={String(i)} 
                                    />
                                ))}
                            </TabList>
                        </Box>

                        <TabPanel value="1" sx={{ p: 0 }}>
                             
                        </TabPanel>

                        <TabPanel value="2" sx={{ p: 0 }}> 

                        </TabPanel>
                    </TabContext>

                    {/* <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="border fa-13">S No</th>
                                    <th className="border fa-13">Product</th>
                                    <th className="border fa-13">Quantity</th>
                                    <th className="border fa-13">Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockInputValue?.Product_Stock_List?.map((o, i) => {
                                    <tr>
                                        <td className="border fa-13">{i + 1}</td>
                                        <td className="border fa-13">{o?.Product_Name}</td>
                                        <td className="border fa-13">{o?.Qty}</td>
                                        <td className="border fa-13">{o?.Unit}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div> */}
                </DialogContent>
                <DialogActions>
                    <Button type="button" onClick={() => setDialog({ ...dialog, closingStock: false })}>cancel</Button>
                    <Button type="button" onClick={() => setDialog({ ...dialog, closingStock: false })}>confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default RetailersMaster;