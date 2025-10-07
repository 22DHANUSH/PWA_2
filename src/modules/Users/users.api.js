import user_api from "../../app/users.axios";

export async function signup({
  FirstName,
  LastName,
  email,
  PhoneNumber,
  PasswordHash,
}) {
  const res = await user_api.post("/users", {
    FirstName,
    LastName,
    email,
    PhoneNumber,
    PasswordHash,
  });
  return res.data;
}

export async function login({ email, Password }) {
  const res = await user_api.post("/users/login", { email, Password });
  return res.data;
}

export async function getUser(userId) {
  const res = await user_api.get(`/users/${userId}`);
  return res.data;
}

export async function updateUser(userId, data) {
  const res = await user_api.put(`/users/${userId}`, data);
  return res.data;
}

export async function getUserProfile(userId) {
  const res = await user_api.get(`/user_profile/users/${userId}`);
  return res.data;
}

export async function createUserProfile({
  userId,
  DateOfBirth,
  Gender,
  ProfilePicture,
}) {
  const res = await user_api.post("/user_profile", {
    userId,
    DateOfBirth,
    Gender,
    ProfilePicture,
  });
  return res.data;
}

export async function updateUserProfile(profileId, data) {
  const res = await user_api.put(`/user_profile/${profileId}`, data);
  return res.data;
}

export async function getProfilePictureWithSas(profileId) {
  const res = await user_api.get(`/blob/GenerateSasToken/${profileId}/0`);
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "user");

  const res = await user_api.post("/blob/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function fetchAddresses(userId) {
  const res = await user_api.get(`/addresses/${userId}`);
  const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];

  if (data.length > 0 && !data.some((a) => a.isPrimary)) {
    data[0].isPrimary = true;
  }
  return data;
}

export async function createAddress(payload) {
  const res = await user_api.post("/addresses", payload);
  return res.data.addressId;
}

export async function updateAddress(addressId, payload) {
  await user_api.put(`/addresses/${addressId}`, {
    ...payload,
    AddressId: addressId,
  });
}

export async function deleteAddress(addressId) {
  await user_api.delete(`/addresses/${addressId}`);
}

export async function setPrimaryAddress(addressId, payload) {
  await user_api.put(`/addresses/${addressId}`, {
    ...payload,
    IsPrimary: true,
  });
}

export const addWishlistItem = async (userId, productSkuId) => {
  const addedAt = new Date().toISOString();
  const res = await user_api.post(`/wishlist_item`, {
    userId,
    productSkuId,
    addedAt,
  });
  return res.data;
};

export const getWishlistItems = async (
  userId,
  pageNumber = 1,
  pageSize = 10
) => {
  const res = await user_api.get(
    `/wishlist_item/users/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
  return res.data;
};

export const deleteWishlistItem = async (wishlistItemId) => {
  const res = await user_api.delete(`/wishlist_item/${wishlistItemId}`);
  return res.data;
};

export const deleteWishlistItemByUserIdAndProductSkuId = async (
  userId,
  productSkuId
) => {
  const res = await user_api.delete(
    `/wishlist_item/users/${userId}/product/${productSkuId}`
  );
  return res.data;
};

export const checkWishlist = async (userId, productSkuId) => {
  const res = await user_api.get(
    `/wishlist_item/users/${userId}/product/${productSkuId}`
  );
  return res.data;
};

export const getProductImagesWithSas = async (productSkuId) => {
  const res = await user_api.get(`/blob/GenerateSasToken/${productSkuId}/1`);
  return res.data;
};

export async function forgotPassword({ email, password }) {
  const res = await user_api.put("/users/forgotPassword", { email, password });
  return res.data;
}
