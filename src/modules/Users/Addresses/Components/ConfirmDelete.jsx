import React from "react";
import { Modal } from "antd";
import "./AddressForm"; 

export default function ConfirmDelete({ visible, onCancel, onConfirm }) {
  return (
    <Modal
      title="Confirm Delete"
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ className: "modal-ok-button" }}
    />
  );
}