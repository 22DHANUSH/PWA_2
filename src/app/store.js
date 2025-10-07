import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./../modules/Users/users.slice";
import orderReducer from './../modules/Orders/order.slice';
 
export const store = configureStore({
  reducer: {
    auth : authReducer,
    order : orderReducer,
  },
});