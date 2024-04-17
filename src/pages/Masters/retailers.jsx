import React, { useState, useEffect, Fragment } from "react";
import { Table, Button } from "react-bootstrap";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, Box, CardContent, CardMedia, } from "@mui/material";
import { Delete, Edit, Store, Person, Call } from "@mui/icons-material";
import '../common.css'
import Select from "react-select";


const RetailersMaster = () => {
    const [retailers, setRetailers] = useState([]);
    const domain = process.env.REACT_APP_BACKEND;
    const storage = JSON.parse(localStorage.getItem('user'));
    const [filters, setFilters] = useState({
        custName: '',
        custGet: 'select',
        area: '',
        areaGet: 'select',
    });

    useEffect(() => {
        fetch(`${domain}api/masters/retailers?Company_Id=${storage?.Company_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRetailers(data.data);
                }
            }).catch(e => console.error(e))
    }, [])

    return (
        <>
            <div className="row">
                <input type="text" className="cus-inpt" />
            </div>
            <div style={{maxHeight: '80vh', overflowY: 'scroll'}}>
                {retailers.map((o, i) => (
                    <Card key={i} sx={{ display: 'flex', mb: 1 }} >
                        <CardMedia
                            component="img"
                            sx={{ width: 151 }}
                            image={o?.imageUrl}
                            alt="retailer_picture"
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <CardContent sx={{ flex: '1 0 auto' }}>
                                <h5 className="mb-2 text-primary">{o?.Retailer_Name} {o?.AreaGet && '- ' + o?.AreaGet}</h5>
                                <p className="fw-bold fa-15 text-muted">{o?.Reatailer_Address}</p>
                                <p><Person className="fa-in text-primary" /> {o?.Contact_Person}</p>
                                <p><Call className="fa-in text-primary" /> {o?.Mobile_No}</p>
                            </CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>

                            </Box>
                        </Box>

                    </Card>
                ))}
            </div>
        </>
    )
}

export default RetailersMaster;