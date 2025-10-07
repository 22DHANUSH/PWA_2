import React from "react";
import { Card, Tag } from "antd";
import { EditOutlined, DeleteOutlined,StarOutlined  } from "@ant-design/icons";
import "./../../Addresses/Addresses.css";

export default function AddressCard({ address, onEdit, onDelete, onMakePrimary }) {
  if (!address) return null;

  return (
    <Card className="address-card" bodyStyle={{ padding: 16 }}>
      <div className="address-card-header">
        <div className="address-card-label">
          {address.isPrimary && (
            <div className="primary-label">Primary Address</div>
          )}
        </div>

        <div className="address-card-actions">

          {address.isPrimary ? (
            <Tag className="primary-tag">PRIMARY</Tag>
          ) : (
            <StarOutlined
              className="action-icon set-primary-icon"
              onClick={() => onMakePrimary(address.addressId)}
              title="Set as Primary"
            />
          )}

          <EditOutlined
            className="action-icon"
            onClick={() => onEdit(address)}
          />
          <DeleteOutlined
            className="action-icon"
            onClick={() => onDelete(address.addressId)}
          />
        </div>
      </div>

      <div className="address-details">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>{address.city}, {address.state}, {address.zip}</p>
        <p>{address.country}</p>
      </div>


    </Card>
  );
}