import React, { useEffect, useState } from "react";
import { ConfigProvider, Modal, Form, Input, Select, Button, message,} from "antd";
import LocationPicker from "./LocationPicker";
import "./../../Addresses/Addresses.css";

const { Option } = Select;

export default function AddressForm({ visible, onCancel, onSubmit, initialValues }) {
  const [form] = Form.useForm();
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
        if (
          typeof initialValues.latitude === "number" &&
          typeof initialValues.longitude === "number"
        ) {
          setLat(initialValues.latitude);
          setLng(initialValues.longitude);
          setShowMap(true);
        }
      } else {
        form.resetFields();
        setLat(null);
        setLng(null);
        setShowMap(false);
      }
    }
  }, [visible, initialValues]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setLat(null);
      setLng(null);
      setShowMap(false);
    }
  }, [visible]);

const reverseGeocode = async (latitude, longitude) => {
  try {
    const token = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();

    const place = data.features?.[0];
    if (!place) throw new Error("No address found");

    const context = place.context || [];
    const get = (type) => context.find((c) => c.id.includes(type))?.text || "";

    const street = place.address ? `${place.address} ${place.text}` : place.text;
    const neighborhood = get("neighborhood") || get("locality");
    const district = get("district");

    const addressLine2 = [street, neighborhood, district].filter(Boolean).join(", ");

    form.setFieldsValue({
      addressLine1: "", 
      addressLine2,
      city: get("place"),
      state: get("region"),
      zip: get("postcode"),
      country: get("country"),
    });
  } catch (err) {
    console.error("Mapbox reverse geocoding failed:", err);
    message.error("Could not fetch address from location");
  }
};

  const handleUseLocation = () => {
    setShowMap(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setTimeout(() => {
          reverseGeocode(latitude, longitude);
        }, 100);
      },
      (err) => {
        console.error("Location access denied:", err);
        message.error("Unable to access location");
      }
    );
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const finalValues = {
        ...values,
        latitude: lat,
        longitude: lng,
      };
      onSubmit(finalValues);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Address" : "Add New Address"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={initialValues ? "Update" : "Save"}
      cancelText="Cancel"
      okButtonProps={{ className: "modal-ok-button" }}
    >
      <ConfigProvider theme={{ token: { colorPrimary: "black" } }}>
        <Button
          type="default"
          onClick={handleUseLocation}
          className="use-location-button"
        >
          Use My Location
        </Button>

        {showMap && lat !== null && lng !== null && (
          <LocationPicker
            lat={lat}
            lng={lng}
            onChange={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
              reverseGeocode(newLat, newLng);
            }}
          />
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            label="Address Line 1"
            name="addressLine1"
            rules={[{ required: true, message: "Please enter Address Line 1" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Address Line 2"
            name="addressLine2"
            rules={[{ required: true, message: "Please enter Address Line 2" }]}
          >
          <Input />
          </Form.Item>

          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: "Please enter city" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: "Please enter state" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="PIN Code"
            name="zip"
            rules={[
              { required: true, message: "Please enter PIN code" },
              { pattern: /^\d{6}$/, message: "PIN code must be 6 digits" },
            ]}
          >
            <Input maxLength={6} />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: "Please select country" }]}
          >
            <Select>
              {["India", "USA", "UK", "Canada", "Australia"].map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </ConfigProvider>
    </Modal>
  );
}