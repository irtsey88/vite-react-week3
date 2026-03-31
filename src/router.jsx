import { createHashRouter } from "react-router-dom";

import FrontendLayout from "./layout/FrontendLayout";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import SingleProduct from "./views/front/SingleProduct";
import Cart from "./views/front/Cart";
import Checkout from "./views/front/Checkout";
import Login from "./views/front/Login";
import BackOffice from "./views/admin/AdminProducts";
import NotFound from "./views/front/NotFound";
import AdminLayout from "./layout/AdminLayout";
import AdminProducts from "./views/admin/AdminProducts";
import AdminOrders from "./views/admin/AdminOrders";

export const router = createHashRouter([
  {
    path: "/",
    element: <FrontendLayout />,
    children: [
      {
        index: true, // 預設首頁
        element: <Home />,
      },
      {
        path: "product",
        element: <Products />,
      },
      {
        path: "product/:id",
        element: <SingleProduct />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },

  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        path: "product",
        element: <AdminProducts />,
      },
      {
        path: "order",
        element: <AdminOrders />,
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);