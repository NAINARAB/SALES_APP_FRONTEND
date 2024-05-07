import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { customTableStyles } from "../tableColumns";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Card, Box, CardContent, CardMedia, Tooltip, Button, Tab, Paper, Typography } from "@mui/material";
import { Person, Call, LocationOn, ProductionQuantityLimits, ArrowBack, Edit, Verified } from "@mui/icons-material";
import '../common.css'
import Select from "react-select";
import { api } from "../../host";
import { customSelectStyles } from "../tableColumns";
import { toast } from 'react-toastify';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';


const RetailersMaster = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [retailers, setRetailers] = useState([]);
    const [area, setArea] = useState([]);
    const [filteredData, setFilteredData] = useState([])

    const [dialog, setDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

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
        Retailer_Name: '',
        Narration: '',
        Created_by: storage?.UserId,
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
    }, [])

    useEffect(() => {
        const tempFilteredData = retailers.filter(o => {
            if (filters.area) {
                return Number(o?.Area_Id) === Number(filters.area);
            }
            if (filters.cust) {
                return Number(o?.Retailer_Id) === Number(filters.cust);
            }

            return true;
        });
        setFilteredData(tempFilteredData);
    }, [filters.area, filters.cust, retailers])

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
                    <Tooltip title='Edit Retailer'>
                        <IconButton size="small" onClick={() => {
                            setDialog(true);
                            setIsEdit(true)
                            setStockInputValue({
                                ...stockInputValue,
                                Company_Id: row?.Company_Id,
                                Retailer_Id: row.Retailer_Id,
                                Retailer_Name: row?.Retailer_Name,
                            })
                        }} >
                            <Edit />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title='Verify Location'>
                        <IconButton size="small">
                            <Verified color='success' />
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

    const closeStockDialog = () => {
        setDialog(false);
        setStockInputValue(initialStockValue)
    }

    return (
        <>

            <div className="row mb-2">

                <div className="col-md-4 col-sm-6">
                    <label>Area</label>
                    <Select
                        value={{ value: filters?.area, label: filters?.areaGet }}
                        onChange={(e) => setFilters({ ...filters, area: e.value, areaGet: e.label })}
                        options={[
                            { value: '', label: 'All Area' },
                            ...area.map(obj => ({ value: obj?.Area_Id, label: obj?.Area_Name }))
                        ]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Area Name"}
                    />
                </div>

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
                open={dialog}
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


                </DialogContent>
                <DialogActions className="bg-light">
                    <Button onClick={closeStockDialog}>cancel</Button>
                    <Button variant='contained' color='success' onClick={() => {}}>confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default RetailersMaster;