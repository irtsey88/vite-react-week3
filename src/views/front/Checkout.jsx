import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { currency } from "../../utils/filter";
import { useForm } from "react-hook-form";
import { RotatingLines } from "react-loader-spinner";
import * as bootstrap from "bootstrap";
import SingleProductModal from "../../components/SingleProductModal";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Checkout() {
  const [product, setProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const productModalRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/products`,
        );
        console.log(response.data.products);
        setProducts(response.data.products);
      } catch (error) {
        console.log(error.response);
      }
    };
    getProducts();

    const getCart = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);

        console.log(response.data.data);
        setCart(response.data.data);
      } catch (error) {
        console.log(error.response);
      }
    };
    getCart();

    productModalRef.current = new bootstrap.Modal(
      document.getElementById("productModal"),
      {
        keyboard: false,
      },
    );

    // Modal 關閉時移除焦點
    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
  }, []);

  const addCart = async (id, qty = 1) => {
    setLoadingCartId(id);

    try {
      const data = {
        product_id: id,
        qty: qty,
      };

      const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data,
      });

      console.log(response.data);

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(cartResponse.data.data);
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoadingCartId(null);
    }
  };

  const updateCart = async (cartID, productID, qty = 1) => {
    try {
      const data = {
        product_id: productID,
        qty,
      };

      await axios.put(`${API_BASE}/api/${API_PATH}/cart/${cartID}`, { data });

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);

      setCart(cartResponse.data.data);
    } catch {
      alert("更新購物車失敗");
    }
  };

  const removeCartItem = async (cartID) => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cartID}`);

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);

      setCart(cartResponse.data.data);
    } catch (error) {
      console.error(error.response);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(cartResponse.data.data);
    } catch (error) {
      console.log(error.response);
    }
  };


  const onSubmit = async (formData) => {
    try {
      const data = {
        user: formData,
        message: formData.message,
      };

      await axios.post(`${API_BASE}/api/${API_PATH}/order`, { data });
      alert("訂購成功");

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(cartResponse.data.data);

      reset();

    } catch (error) {
      console.log(error.response);
      alert("訂單送出失敗");
    }
  };

  const getProduct = async (id) => {
    setLoadingProductId(id);
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/product/${id}`,
      );
      console.log(response.data.product);
      setProduct(response.data.product);
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoadingProductId(null);
    }

    productModalRef.current.show();
  };

  const closeModal = () => {
    productModalRef.current.hide();
  };

  return (
    <div className="container">
      {/* 產品列表 */}
      <table className="table align-middle">
        <thead>
          <tr>
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ width: "200px" }}>
                <div
                  style={{
                    height: "100px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundImage: `url(${product.imageUrl})`,
                  }}
                ></div>
              </td>
              <td>{product.title}</td>
              <td>
                <del className="h6">原價：{currency(product.origin_price)}</del>
                <div className="h5">特價：{currency(product.price)}</div>
              </td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => getProduct(product.id)}
                    disabled={loadingProductId === product.id}
                  >
                    {loadingProductId === product.id ? (
                      <RotatingLines
                        strokeColor="gray"
                        width={70}
                        height={16}
                      />
                    ) : (
                      "查看更多"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => addCart(product.id)}
                    disabled={loadingCartId === product.id}
                  >
                    {loadingCartId === product.id ? (
                      <RotatingLines color="pink" width={70} height={16} />
                    ) : (
                      "加到購物車"
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>購物車列表</h1>

      <div className="text-end">
        <button type="button" className="btn btn-danger" onClick={clearCart}>
          清空購物車
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>品名</th>
            <th>數量/單位</th>
            <th>小計</th>
          </tr>
        </thead>

        <tbody>
          {cart?.carts?.map((cartItem) => (
            <tr key={cartItem.id}>
              <td>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeCartItem(cartItem.id)}
                >
                  刪除
                </button>
              </td>

              <th scope="row">{cartItem.product.title}</th>

              <td>
                <div className="input-group input-group-sm mb-3">
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    aria-label="Sizing example input"
                    aria-describedby="inputGroup-sizing-sm"
                    defaultValue={cartItem.qty}
                    onChange={(e) =>
                      updateCart(
                        cartItem.id,
                        cartItem.product.id,
                        Number(e.target.value),
                      )
                    }
                  />
                  <span className="input-group-text" id="inputGroup-sizing-sm">
                    {cartItem.product.unit}
                  </span>
                </div>
              </td>

              <td className="text-end">{currency(cartItem.total)}</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td className="text-end" colSpan="3">
              總計
            </td>
            <td className="text-end">{currency(cart.final_total)}</td>
          </tr>
        </tfoot>
      </table>

      {/* 結帳頁面 */}
      <div className="my-5 row justify-content-center">
        <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="請輸入 Email"
              defaultValue=""
              {...register("email", {
                required: "請輸入Email",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Email 格式不正確",
                },
              })}
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="請輸入姓名"
              defaultValue=""
              {...register("name", {
                required: "請輸入姓名",
                minLength: {
                  value: 2,
                  message: "姓名至少 2 個字",
                },
              })}
            />
            {errors.name && (
              <p className="text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
              id="tel"
              name="tel"
              type="tel"
              className="form-control"
              placeholder="請輸入電話"
              defaultValue=""
              {...register("tel", {
                required: "請輸入收件人電話",
                minLength: {
                  value: 8,
                  message: "電話至少 8 碼",
                },
                pattern: {
                  value: /^\d+$/,
                  message: "電話僅能數字",
                },
              })}
            />
            {errors.tel && <p className="text-danger">{errors.tel.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="form-control"
              placeholder="請輸入地址"
              defaultValue=""
              {...register("address", {
                required: "請輸入收件人地址",
              })}
            />
            {errors.address && (
              <p className="text-danger">{errors.address.message}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
              id="message"
              className="form-control"
              cols="30"
              rows="10"
              {...register("message")}
            ></textarea>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
      </div>

      <SingleProductModal
        product={product}
        addCart={addCart}
        closeModal={closeModal}
      />
    </div>
  );
}

export default Checkout;
