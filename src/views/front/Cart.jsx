import { useState, useEffect } from "react";
import axios from "axios";
import { currency } from "../../utils/filter";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Cart() {
  const [cart, setCart] = useState({});

  useEffect(() => {
    const getCart = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);

        setCart(response.data.data);
      } catch (error) {
        console.error(error.response);
      }
    };

    getCart();
  }, []);

  const updateCart = async (cartID, productID, qty = 1) => {
    try {
      const data = {
        product_id: productID,
        qty,
      };

      const response = await axios.put(
        `${API_BASE}/api/${API_PATH}/cart/${cartID}`,
        { data }
      );

      console.log(response.data);

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(cartResponse.data.data);
    } catch (error) {
      console.error(error.response)
    }
  };

  const removeCartItem = async (cartID) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/api/${API_PATH}/cart/${cartID}`
      );

      console.log(response.data);

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(cartResponse.data.data);
    } catch (error) {
      console.error(error.response)
    }
  };

  const clearCart = async () => {
    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);

      console.log(response.data);

      const cartResponse = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCart(cartResponse.data.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <div className="container">
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
                        Number(e.target.value)
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
    </div>
  );
}

export default Cart;