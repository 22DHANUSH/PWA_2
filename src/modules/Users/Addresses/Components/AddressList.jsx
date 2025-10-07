import React from "react";
import { Row, Col, Empty } from "antd";
import AddressCard from "./AddressCard";
import "./../../Addresses/Addresses.css";

export default function AddressList({ addresses, onEdit, onDelete, onMakePrimary }) {
  const primary = addresses.find((a) => a.isPrimary);
  const others = addresses.filter((a) => !a.isPrimary);

  if (addresses.length === 0) {
    return <Empty description="No addresses yet" />;
  }

  return (
    <>
      {primary && (
        <div className="primary-address-wrapper">
          <AddressCard
            address={primary}
            onEdit={onEdit}
            onDelete={onDelete}
            onMakePrimary={onMakePrimary}
          />
        </div>
      )}
      <Row gutter={[16, 16]}>
        {others.map((addr) => (
          <Col xs={24} sm={12} md={12} key={addr.addressId}>
            <AddressCard
              address={addr}
              onEdit={onEdit}
              onDelete={onDelete}
              onMakePrimary={onMakePrimary}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}