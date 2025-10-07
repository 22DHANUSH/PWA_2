import { useDispatch } from "react-redux";
import { clearUser } from "./users.slice";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Cart/CartContext";

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const logout = async () => {
    dispatch(clearUser());
    await refreshCartCount();
    navigate("/");
  };

  return logout;
}
