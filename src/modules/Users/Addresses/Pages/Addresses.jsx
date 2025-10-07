import React, { useEffect, useState } from "react";
import { Button, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {fetchAddresses,createAddress,updateAddress,deleteAddress,setPrimaryAddress,} from "./../../users.api";
 
import AddressList from "./../../Addresses/Components/AddressList";
import AddressForm from "./../../Addresses/Components/AddressForm";
import ConfirmDelete from "./../../Addresses/Components/ConfirmDelete";
import "./../../Addresses/Addresses.css";
 
export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const userId = localStorage.getItem("userId");
 
  const loadAddresses = async () => {
    try {
      const data = await fetchAddresses(userId);
      setAddresses(data);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };
 
  useEffect(() => {
    if (userId) loadAddresses();
  }, [userId]);
 
  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      UserId: parseInt(userId),
    };
 
    try {
      if (editing) {
        await updateAddress(editing.addressId, payload);
      } else {
        await createAddress(payload);
      }
 
      setFormVisible(false);
      setEditing(null);
      loadAddresses();
    } catch (err) {
      console.error(err);
      message.error("Failed to save address");
    }
  };
 
  const handleDelete = async () => {
    const target = addresses.find((a) => a.addressId === deleteId);
    const isLastAddress = addresses.length === 1;
 
    if (isLastAddress) {
      message.warning("You cannot delete the last remaining address.");
      setDeleteVisible(false);
      setDeleteId(null);
      return;
    }
 
    try {
      await deleteAddress(deleteId);
      const updated = await fetchAddresses(userId);
 
      if (target?.isPrimary && updated.length > 0) {
        const oldest = updated.reduce((prev, curr) =>
          prev.addressId < curr.addressId ? prev : curr
        );
        await setPrimaryAddress(oldest.addressId, {
          ...oldest,
          UserId: parseInt(userId),
        });
 
        const final = await fetchAddresses(userId);
        setAddresses(final);
      } else {
        setAddresses(updated);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to delete address");
    } finally {
      setDeleteVisible(false);
      setDeleteId(null);
    }
  };
 
  const handleMakePrimary = async (id) => {
    try {
      const address = addresses.find((a) => a.addressId === id);
      if (!address) return;
 
      await setPrimaryAddress(id, {
        ...address,
        UserId: parseInt(userId),
      });
 
      loadAddresses();
    } catch (err) {
      console.error(err);
      message.error("Failed to set primary");
    }
  };
 
  return (
    <div className="address-page">
      <div className="address-container">
        <div className="address-header">
          <Typography.Title level={3} className="address-title">
            Manage Addresses
          </Typography.Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setFormVisible(true);
              setEditing(null);
            }}
            className="add-address-button"
          >
            Add New Address
          </Button>
        </div>
 
        <AddressList
          addresses={addresses}
          onEdit={(addr) => {
            setEditing(addr);
            setFormVisible(true);
          }}
          onDelete={(id) => {
            setDeleteId(id);
            setDeleteVisible(true);
          }}
          onMakePrimary={handleMakePrimary}
        />
 
        <AddressForm
          visible={formVisible}
          onCancel={() => setFormVisible(false)}
          onSubmit={handleSubmit}
          initialValues={editing}
        />
 
        <ConfirmDelete
          visible={deleteVisible}
          onCancel={() => setDeleteVisible(false)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}