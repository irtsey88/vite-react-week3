import { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";

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

function App() {
  /* ================= state ================= */
  const [formData, setFormData] = useState({
    username: "bastar_dize@icloud.com",
    password: "",
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");

  const itemModalRef = useRef(null);

  /* ================= 表單輸入 ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTemplateProduct((preData) => ({
      ...preData,
      [name]: type == "checkbox" ? checked : value,
    }));
  };

  const handleImagesUrlChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImagesUrl = [...pre.imagesUrl];
      newImagesUrl[index] = value;

      if (
        value !== "" &&
        index === newImagesUrl.length - 1 &&
        newImagesUrl.length < 5
      ) {
        newImagesUrl.push("");
      }
      if (value === "" && index < newImagesUrl.length - 1) {
        //陣列有值才顯示
        newImagesUrl.pop();
      }

      return {
        ...pre,
        imagesUrl: newImagesUrl,
      };
    });
  };

  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImagesUrl = [...pre.imagesUrl];
      newImagesUrl.push("");
      return {
        ...pre,
        imagesUrl: newImagesUrl,
      };
    });
  };

  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImagesUrl = [...pre.imagesUrl];
      newImagesUrl.pop();
      return {
        ...pre,
        imagesUrl: newImagesUrl,
      };
    });
  };

  /* ================= 取得產品 ================= */
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  const updateProducts = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    }
    const productData = {
      ...templateProduct,
      origin_price: Number(templateProduct.origin_price),
      price: Number(templateProduct.price),
      is_enabled: templateProduct.is_enabled ? 1 : 0,
      imagesUrl: [...templateProduct.imagesUrl.filter((url) => url !== "")], //過濾空字串
    };

    try {
      const response = await axios[method](url, { data: productData });
      console.log(response.data);
      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
    }
  };

  const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/api/${API_PATH}/admin/product/${id}`,
    );
    console.log(response.data);
    getProducts();
    closeModal();
  } catch (error) {
    console.log(error.response);
  }
};

  /* ================= 登入 ================= */
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;

      document.cookie = `mia-reactwook=${token};expires=${new Date(
        expired,
      )};path=/;`;

      axios.defaults.headers.common["Authorization"] = token;

      setIsAuth(true);
      getProducts();
    } catch (error) {
      console.log("登入失敗");
      setIsAuth(false);
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
        console.log("驗證失敗，請重新登入");
        setIsAuth(false);
      }
    };

    checkLogin();
  }, []);

  /* ================= Modal 控制 ================= */
  const openModal = (type, item) => {
    console.log(item);
    setModalType(type);
    setTemplateProduct((pre) => ({
      ...pre,
      ...item,
    }));
    itemModalRef.current?.show();
  };

  const closeModal = () => {
    itemModalRef.current?.hide();
  };

  const onConfirm = async () => {
    try {
      await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, {
        data: templateProduct,
      });

      await getProducts();
      closeModal();
    } catch (error) {
      console.log("新增產品失敗", error.response);
    }
  };

  /* ================= render ================= */
  return (
    <>
      {!isAuth ? (
        /* ===== 登入畫面 ===== */
        <div className="container login">
          <h1>請先登入</h1>

          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
              <label>Email address</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <label>Password</label>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              登入
            </button>
          </form>
        </div>
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
        </div>
      )}
      <div className="modal fade" id="itemModal" tabIndex="-1">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div
              className={`modal-header bg-${modalType === "delete" ? "danger" : "black"}`}
            >
              <h5 className="modal-title text-white">
                <span>
                  {modalType === "delete"
                    ? "刪除產品"
                    : modalType === "edit"
                      ? "編輯產品"
                      : "新增產品"}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeModal}
              ></button>
            </div>
            <div className="modal-body">
              {modalType === "delete" ? (
                <p className="fs-4">
                  確定要刪除
                  <span className="text-danger">{templateProduct.title}</span>
                  嗎？
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="請輸入圖片網址"
                          value={templateProduct.imageUrl}
                          onChange={(e) => handModalInputChange(e)}
                        />
                      </div>
                      {templateProduct.imageUrl && (
                        <img
                          className="img-fluid"
                          src={templateProduct.imageUrl}
                          alt="主圖"
                        />
                      )}
                    </div>

                    <div>
                      <div>
                        {templateProduct.imagesUrl.map((url, index) => (
                          <div key={index} className="mb-3">
                            <label
                              htmlFor={`imagesUrl-${index}`}
                              className="form-label"
                            >
                              輸入圖片網址
                            </label>

                            <input
                              type="text"
                              id={`imagesUrl-${index}`}
                              className="form-control"
                              placeholder={`請輸入圖片網址 ${index + 1}`}
                              value={url}
                              onChange={(e) =>
                                handleImagesUrlChange(index, e.target.value)
                              } //剪下來以後就消失了
                            />

                            {templateProduct && (
                              <img
                                className="img-fluid mt-2"
                                src={url}
                                alt={`副圖 ${index + 1}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {templateProduct.imagesUrl.length < 5 &&
                        templateProduct.imagesUrl[
                          templateProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm d-block w-100"
                            onClick={handleAddImage}
                          >
                            新增圖片
                          </button>
                        )}
                    </div>
                    <div>
                      {templateProduct.imagesUrl.length >= 1}
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => handleRemoveImage()}
                      >
                        刪除圖片
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-2">
                      <label htmlFor="title" className="form-label">
                        標題
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        placeholder="請輸入標題"
                        value={templateProduct.title}
                        onChange={(e) => handModalInputChange(e)}
                      />
                    </div>
                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">
                          分類
                        </label>
                        <input
                          name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={templateProduct.category}
                          onChange={(e) => handModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">
                          單位
                        </label>
                        <input
                          name="unit"
                          id="unit"
                          type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={templateProduct.unit}
                          onChange={(e) => handModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">
                          原價
                        </label>
                        <input
                          name="origin_price"
                          id="origin_price"
                          type="text"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={templateProduct.origin_price}
                          onChange={(e) => handModalInputChange(e)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">
                          售價
                        </label>
                        <input
                          name="price"
                          id="price"
                          type="text"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={templateProduct.price}
                          onChange={(e) => handModalInputChange(e)}
                        />
                      </div>
                    </div>
                    <hr />
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">
                        產品描述
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={templateProduct.description}
                        onChange={(e) => handModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">
                        說明內容
                      </label>
                      <textarea
                        name="content"
                        id="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={templateProduct.content}
                        onChange={(e) => handModalInputChange(e)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="is_enabled"
                          id="is_enabled"
                          type="checkbox"
                          checked={templateProduct.is_enabled}
                          className="form-check-input"
                          onChange={(e) =>
                            setTemplateProduct((prev) => ({
                              ...prev,
                              is_enabled: e.target.checked,
                            }))
                          }
                        />
                        <label
                          htmlFor="is_enabled"
                          className="form-check-label"
                        >
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modalType === "delete" ? (
                <button type="button" className="btn btn-danger"
                onClick={() => deleteProduct(templateProduct.id)}>
                  刪除
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    data-bs-dismiss="modal"
                    onClick={() => closeModal()}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                    onClick={() => updateProducts(templateProduct.id)}
                  >
                    確認
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default App;
