import { useParams, useNavigate, data } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import "../../assets/pages/products.scss";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/product/${id}`,
        );
        console.log(response.data.product);
        setProduct(response.data.product);
      } catch (error) {
        console.log(error.response);
      }
    };

    getProduct();
  }, [id]);

  const addCart = async (id, qty) => {
    try {
      const data = {
        data: {
        product_id: id,
        qty: qty,
        }
      };

      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/cart`,
        data,
      );

      console.log(response.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  return !product ? (
    <h2>查無產品</h2>
  ) : (
    <div className="container">
      <div className="card" style={{ width: "400px" }}>
        <img
          src={product.imageUrl}
          className="card-img-top"
          alt={product.title}
        />

        <div className="card-body">
          <h5 className="card-title">{product.title}</h5>

          <p className="card-text">{product.description}</p>

          <p className="card-text">原價：{product.price}</p>

          <p className="card-text">
            <small className="text-body-secondary">{product.unit}</small>
          </p>

          <button
            className="btn btn-primary"
            onClick={() => addCart(product.id, 1)}
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
