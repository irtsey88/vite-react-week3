import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Login({getProducts, setIsAuth}) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  return (
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
  );
}

export default Login;
