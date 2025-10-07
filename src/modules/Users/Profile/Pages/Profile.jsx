import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  getUser,
  getUserProfile,
  updateUser,
  updateUserProfile,
  uploadAvatar,
  createUserProfile,
  getProfilePictureWithSas,
} from "../../users.api";
import useLogout from "../../useLogout";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Typography,
  DatePicker,
  Avatar,
  Card,
  Row,
  Col,
  message,
} from "antd";
import {
  UploadOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  HeartOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./../../Profile/Profile.css";
import "../../../../assets/styles/global.css";

export default function Profile() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const logout = useLogout();

  const [user, setUser] = useState({
    FirstName: "",
    LastName: "",
    email: "",
    PhoneNumber: "",
  });
  const [profile, setProfile] = useState({
    dob: "",
    gender: "",
    profile_picture: "",
  });

  const [errors, setErrors] = useState({ email: "", phone: "" });
  const [savedUser, setSavedUser] = useState({});
  const [savedProfile, setSavedProfile] = useState({});
  const [hasProfile, setHasProfile] = useState(false);
  const [msg, setMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  const fetchData = async () => {
    try {
      const userData = await getUser(userId);
      const userObj = {
        FirstName:
          userData.fName || userData.FirstName || userData.firstName || "",
        LastName:
          userData.lName || userData.LastName || userData.lastName || "",
        email: userData.email || "",
        PhoneNumber:
          userData.phoneNo ||
          userData.PhoneNumber ||
          userData.phoneNumber ||
          "",
      };
      setUser(userObj);
      setSavedUser(userObj);

      try {
        const profileData = await getUserProfile(userId);

        const profileObj = {
          dob: profileData.dateOfBirth || "",
          gender: profileData.gender || profileData.Gender || "",
          profile_picture: "",
        };

        if (profileData.profilePicture || profileData.ProfilePicture) {
          const sasResponse = await getProfilePictureWithSas(
            profileData.profile_id || profileData.profileId
          );
          profileObj.profile_picture = sasResponse.profilePicture;
          console.log("SAS URL response:", sasResponse);
        }

        setProfile(profileObj);
        setSavedProfile(profileObj);
        setHasProfile(true);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          const emptyProfile = { dob: "", gender: "", profile_picture: "" };
          setProfile(emptyProfile);
          setSavedProfile(emptyProfile);
          setHasProfile(false);
        }
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleUserChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleProfileChange = (name, value) =>
    setProfile({ ...profile, [name]: value });

  const handleAvatarChange = async ({ file }) => {
    if (!isEditing) return;

    try {
      const res = await uploadAvatar(file);
      if (hasProfile) {
        const profileData = await getUserProfile(userId);
        const profileId = profileData.profile_id || profileData.profileId;

        await updateUserProfile(profileId, {
          dateOfBirth: profile.dob,
          gender: profile.gender,
          ProfilePicture: res.url,
        });
        console.log("Updated image blob URL:", res.url);
      } else {
        await createUserProfile({
          userId,
          DateOfBirth: profile.dob,
          Gender: profile.gender,
          ProfilePicture: res.url,
        });
        console.log("Newly Uploaded Image blob URL:", res.url);
        setHasProfile(true);
      }

      await fetchData();

      message.success("Avatar uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMsg("Avatar upload failed.");
      message.error("Failed to upload avatar.");
    }
  };

  const validateFields = () => {
    let valid = true;
    let newErrors = { email: "", phone: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      newErrors.email = "Invalid email format.";
      valid = false;
    }

    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(user.PhoneNumber)) {
      newErrors.phone = "Phone number must be 10–15 digits.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      await updateUser(userId, {
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.email,
        PhoneNumber: user.PhoneNumber,
      });

      if (hasProfile) {
        const profileData = await getUserProfile(userId);
        const profileId = profileData.profile_id || profileData.profileId;

        await updateUserProfile(profileId, {
          dateOfBirth: profile.dob,
          gender: profile.gender,
          ProfilePicture: profile.profile_picture,
        });
      } else {
        await createUserProfile({
          userId,
          DateOfBirth: profile.dob,
          Gender: profile.gender,
          ProfilePicture: profile.profile_picture,
        });
        setHasProfile(true);
      }

      setSavedUser(user);
      setSavedProfile(profile);

      message.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setUser(savedUser);
    setProfile(savedProfile);
    setIsEditing(false);
    setErrors({ email: "", phone: "" });
  };

  console.log(profile.profile_picture);

  return (
    <div className="profile-page">
      <Card className="profile-card">
        <Typography.Title level={3} className="profile-title">
          My Profile
        </Typography.Title>

        <Form layout="vertical" onFinish={handleSave}>
          {/* Avatar */}
          <Row justify="center" className="profile-avatar">
            <Col>
              <Avatar
                src={profile.profile_picture}
                // icon={!profile.profile_picture && <UserOutlined />}
                icon={<UserOutlined />}
                size={120}
              />
              {isEditing && (
                <div className="profile-avatar-upload">
                  <Upload
                    showUploadList={false}
                    customRequest={handleAvatarChange}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />}>Upload Avatar</Button>
                  </Upload>
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="First Name" required>
                <Input
                  name="FirstName"
                  value={user.FirstName}
                  onChange={handleUserChange}
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name" required>
                <Input
                  name="LastName"
                  value={user.LastName}
                  onChange={handleUserChange}
                  disabled={!isEditing}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            required
            validateStatus={errors.email ? "error" : ""}
            help={errors.email}
          >
            <Input
              name="email"
              value={user.email}
              onChange={handleUserChange}
              disabled={true}
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            required
            validateStatus={errors.phone ? "error" : ""}
            help={errors.phone}
          >
            <Input
              name="PhoneNumber"
              value={user.PhoneNumber}
              onChange={handleUserChange}
              disabled={!isEditing}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Date of Birth">
                <DatePicker
                  value={profile.dob ? dayjs(profile.dob) : null}
                  onChange={(date, dateString) =>
                    handleProfileChange("dob", dateString)
                  }
                  disabled={!isEditing}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Gender">
                <Select
                  value={profile.gender}
                  onChange={(value) => handleProfileChange("gender", value)}
                  disabled={!isEditing}
                >
                  <Select.Option value="">Select</Select.Option>
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="spacing">
            {isEditing ? (
              <Row justify="space-between" align="middle" gutter={16}>
                <Col>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="btn-primary"
                  >
                    Save Changes
                  </Button>
                </Col>
                <Col>
                  <Button className="btn-cancel" onClick={handleCancel}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            ) : (
              <Button
                type="primary"
                className="btn-edit"
                onClick={() => setIsEditing(true)}
                block
              >
                Edit Details
              </Button>
            )}
          </div>
        </Form>

        <Row justify="space-between" gutter={16} className="profile-links">
          <Col>
            <Button
              className="btn-grey"
              icon={<EnvironmentOutlined />}
              onClick={() => navigate("/addresses")}
            >
              My Addresses
            </Button>
          </Col>
          <Col>
            <Button
              className="btn-grey"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </Button>
          </Col>
          <Col>
            <Button
              className="btn-grey"
              icon={<HeartOutlined />}
              onClick={() => navigate("/wishlist")}
            >
              Wishlist
            </Button>
          </Col>
        </Row>

        <Button
          type="default"
          icon={<LogoutOutlined />}
          onClick={logout}
          block
          className="btn-logout"
        >
          Logout
        </Button>
      </Card>
    </div>
  );
}
