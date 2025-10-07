import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: localStorage.getItem("userId") || null,
  email: localStorage.getItem("email") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      localStorage.setItem("userId", action.payload.userId);
      localStorage.setItem("email", action.payload.email);
    },
    clearUser: (state) => {
      (state.userId = null),
        (state.email = null),
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
