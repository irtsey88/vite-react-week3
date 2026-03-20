import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/Pagination";
import Login from "./views/Login";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};

function App2() {
  /* ================= state ================= */

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");
  const [pagination, setPagination] = useState({});
  const itemModalRef = useRef(null);

  /* ================= 取得產品 ================= */
  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (error) {
      console.log(error.response);
    }
  };

  /* ================= useEffect ================= */
  useEffect(() => {
    itemModalRef.current = new bootstrap.Modal(
      document.getElementById("itemModal"),
      { keyboard: false },
    );

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mia-reactwook="))
      ?.split("=")[1];

    if (!token) return;

    axios.defaults.headers.common["Authorization"] = token;

    const checkLogin = async () => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        console.log("驗證失敗，請重新登入", error);
        setIsAuth(false);
      }
    };

    checkLogin();
  }, []);

  /* ================= Modal 控制 ================= */
const openModal = (type, item) => {
  setModalType(type);
  setTemplateProduct({
    ...INITIAL_TEMPLATE_DATA,
    ...item,
  });
  itemModalRef.current?.show();
};

  const closeModal = () => {
    itemModalRef.current?.hide();
  };


  /* ================= render ================= */
  return (
    <>
      {!isAuth ? (
        /* ===== 登入畫面 ===== */
        <Login getProducts={getProducts} setIsAuth={setIsAuth} />
      ) : (
        /* ===== 產品列表 ===== */
        <div className="container">
          <h2>產品列表</h2>

          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
            >
              建立新的產品
            </button>
          </div>

          <table className="table mt-3">
            <thead>
              <tr>
                <th>分類</th>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td>{item.title}</td>
                  <td>{item.origin_price}</td>
                  <td>{item.price}</td>
                  <td
                    className={item.is_enabled ? "text-success" : "text-danger"}
                  >
                    {item.is_enabled ? "啟用" : "未啟用"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => openModal("edit", item)}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => openModal("delete", item)}
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination pagination={pagination} onChangePage={getProducts} />
        </div>
      )}

      <ProductModal
        modalType={modalType}
        closeModal={closeModal}
        templateProduct={templateProduct}
        getProducts={getProducts}
      />
    </>
  );
}
export default App2;
