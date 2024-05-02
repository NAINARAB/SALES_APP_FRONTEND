import React, { useState, useEffect, Fragment } from "react";
import { Table, Button } from "react-bootstrap";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import CryptoJS from 'crypto-js';
import '../common.css'
import { api } from "../../host";

const initialState = {
  Id: "",
  Name: "",
  UserName: "",
  UserTypeId: "",
  Password: "",
  BranchId: "",
  UserId: "",
};

const Users = (props) => {
  const [usersData, setUsersData] = useState([]);
  const [screen, setScreen] = useState(false);
  const parseData = JSON.parse(localStorage.getItem('user'));
  const [reload, setReload] = useState(false);
  const [inputValue, setInputValue] = useState(initialState);
  const [editUser, setEditUser] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});

  const [usetTypeDropDown, setUsetTypeDropDown] = useState([]);
  const [branchDropDown, setBranchDropDown] = useState([]);

  const [filterInput, setFilterInput] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const toast = (one, two) => console.log('one two', one, two)

  useEffect(() => {
    fetch(`${api}api/masters/users?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}&Branch_Id=${parseData?.BranchId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsersData(data.data);
        }
      }).catch(e => console.error(e));
  }, [reload]);

  useEffect(() => {
    fetch(`${api}api/masters/userType`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsetTypeDropDown(data.data);
        }
      })
      .catch((e) => console.log(e));

    fetch(`${api}api/masters/branch/dropDown?User_Id=${parseData?.UserId}&Company_id=${parseData?.Company_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBranchDropDown(data.data);
        }
      })
      .catch((e) => console.log(e));
  }, [parseData?.Company_id, parseData?.UserId]);

  const createUser = () => {
    fetch(`${api}api/masters/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: inputValue.UserId,
        Name: inputValue.Name,
        UserName: inputValue.UserName,
        UserTypeId: inputValue.UserTypeId,
        Password: CryptoJS.AES.encrypt(inputValue.Password, 'ly4@&gr$vnh905RyB>?%#@-(KSMT').toString(),
        BranchId: inputValue.BranchId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReload(!reload);
          switchScreen();
          toast(data.message, 1);
        } else {
          toast(data.message, 3);
        }
      }).catch(e => console.log(e))
  };

  const clearValues = () => {
    setInputValue({
      Id: "",
      Name: "",
      UserName: "",
      UserTypeId: "",
      Password: "",
      BranchId: "",
    });
  };

  const switchScreen = () => {
    clearValues();
    setScreen(!screen);
    setEditUser(false);
  };

  const editUserFn = () => {
    fetch(`${api}api/masters/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: inputValue.UserId,
        Name: inputValue.Name,
        UserName: inputValue.UserName,
        UserTypeId: inputValue.UserTypeId,
        Password: CryptoJS.AES.encrypt(inputValue.Password, 'ly4@&gr$vnh905RyB>?%#@-(KSMT').toString(),
        BranchId: inputValue.BranchId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          switchScreen();
          setReload(!reload);
          toast(data.message, 1);

        } else {
          toast(data.message, 3);
        }
      }).catch(e => console.error(e))
  };

  const editRow = (user) => {
    switchScreen()
    setEditUser(true);
    setInputValue({
      Id: user.UserId,
      UserId: user.UserId,
      Name: user.Name,
      UserName: user.UserName,
      UserTypeId: user.UserTypeId,
      Password: '',
      BranchId: user.BranchId,
    });
  };

  const deleteRow = (user, stat) => {
    setIsDialogOpen(!isDialogOpen);
    if (stat === true) {
      setSelectedRow(user);
    }
  };

  const handleDeleteConfirm = () => {
    fetch(`${api}api/masters/users`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        UserId: selectedRow.UserId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReload(!reload);
          toast("User deleted successfully!", 1);
        } else {
          toast("Failed to delete user:" + data.message, 3);
        }
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        toast("An error occurred. Please try again later.", 3);
      }).finally(() => {
        setIsDialogOpen(!isDialogOpen);
        setSelectedRow({});
      })
  };

  function handleSearchChange(event) {
    const term = event.target.value;
    setFilterInput(term);
    const filteredResults = usersData.filter(item => {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(term.toLowerCase())
      );
    });

    setFilteredData(filteredResults);
  }

  return (
    <Fragment>

      {!screen ? (
        <div className="card">

          <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
            Users
            <div className="text-end">
              <Button
                onClick={() => switchScreen()}
                className="rounded-5 px-3 py-1 fa-13 shadow"
              >
                {!screen ? "Add User" : "Back"}
              </Button>
            </div>
          </div>

          <div className="card-body" style={{ maxHeight: "78vh", overflowY: 'scroll' }} >

            <div className="d-flex justify-content-end">
              <div className="col-md-4 pb-2">
                <input
                  type="search"
                  value={filterInput}
                  className="cus-inpt"
                  placeholder="Search"
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="table-responsive">
              <Table className="">
                <thead>
                  <tr>
                    <th className="fa-14">ID</th>
                    <th className="fa-14">Name</th>
                    <th className="fa-14">User Type</th>
                    <th className="fa-14">Mobile</th>
                    <th className="fa-14">Company</th>
                    <th className="fa-14">Branch</th>
                    <th className="fa-14">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredData && filteredData.length ? filteredData : filterInput === '' ? usersData : []).map((obj, index) => (
                    <tr key={index}>
                      <td className="fa-14">{obj.UserId}</td>
                      <td className="fa-14">{obj.Name}</td>
                      <td className="fa-14">{obj.UserType}</td>
                      <td className="fa-14">{obj.UserName}</td>
                      <td className="fa-14">{obj.Company_Name}</td>
                      <td className="fa-14">{obj.BranchName}</td>
                      <td className="fa-12" style={{ minWidth: "80px" }}>
                        <IconButton
                          onClick={() => { editRow(obj) }}
                          size="small"
                        >
                          <Edit className="fa-in" />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            deleteRow(obj, true);
                          }}
                          size="small"
                        >
                          <Delete className="fa-in del-red" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
            {editUser ? "Edit User" : "Add User"}
            <div className="text-end">
              <Button
                onClick={switchScreen}
                className="rounded-5 px-3 py-1 fa-13 shadow"
              >
                Back
              </Button>
            </div>
          </div>

          <form onSubmit={e => {
            e.preventDefault();
            editUser ? editUserFn() : createUser()
          }}>

            <div className="card-body">
              <div className="row">

                <div className="col-lg-4 col-md-6 p-2">
                  <label>Name</label>
                  <input
                    className="cus-inpt"
                    value={inputValue.Name} required
                    onChange={(e) =>
                      setInputValue({ ...inputValue, Name: e.target.value })
                    }
                  />
                </div>

                <div className="col-lg-4 col-md-6 p-2">
                  <label>Password</label>
                  <input
                    className="cus-inpt" required
                    type="password"
                    value={inputValue.Password}
                    onChange={(e) =>
                      setInputValue({ ...inputValue, Password: e.target.value })
                    }
                  />
                </div>

                <div className="col-lg-4 col-md-6 p-2">
                  <label>Mobile</label>
                  <input
                    className="cus-inpt"
                    type={"number"} required
                    value={inputValue.UserName}
                    minLength={10}
                    maxLength={10}
                    onChange={(e) =>
                      setInputValue({ ...inputValue, UserName: e.target.value })
                    }
                  />
                </div>

                <div className="col-lg-4 col-md-6 p-2">
                  <label>Branch</label>
                  <select
                    className="cus-inpt"
                    value={inputValue.BranchId} required
                    onChange={(e) =>
                      setInputValue({ ...inputValue, BranchId: e.target.value })
                    }
                  >
                    <option value={""}>select</option>
                    {branchDropDown?.map((o, i) => (
                      <option key={i} value={o.BranchId}>
                        {o.BranchName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-4 col-md-6 p-2">
                  <label>User Type</label>
                  <select
                    className="cus-inpt"
                    value={inputValue.UserTypeId}
                    onChange={(e) =>
                      setInputValue({ ...inputValue, UserTypeId: e.target.value })
                    }
                  >
                    <option value=''>Select</option>
                    {usetTypeDropDown?.map((o, i) => (
                      <option key={i} value={o.Id}>
                        {o.UserType}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            <div className="card-footer d-flex justify-content-end bg-white">
              <Button
                type='button'
                className="rounded-5 px-4 mx-1 btn-light bg-white"
                onClick={() => switchScreen()}
              >
                Back
              </Button>
              <Button
                className="rounded-5 px-4 shadow mx-1"
                type='submit'
              >
                {editUser ? "Update" : "Create"}
              </Button>
            </div>

          </form>

        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <b style={{ color: "black", padding: "0px 20px" }}>
              Do you Want to Delete?
            </b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default Users;