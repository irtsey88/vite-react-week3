import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

function Login({ getProducts, setIsAuth }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const onSubmit = async (formData) => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);

      const { token, expired } = response.data;

      document.cookie = `mia-reactwook=${token}; expires=${new Date(expired).toUTCString()}; path=/`;

      axios.defaults.headers.common.Authorization = token;

      navigate("/backoffice"); 
    } catch (error) {
      console.log(error);

      alert("登入失敗，請確認帳號密碼");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4 ">
          <h2 className="mb-4 text-center">請先登入</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="username" className="d-block form-label ">
                Email
              </label>

              <input
                id="username"
                type="email"
                className="form-control"
                placeholder="請輸入 Email"
                {...register("username", {
                  required: "Email 為必填",
                })}
              />

              {errors.username && (
                <div className="text-danger small mt-1">
                  {errors.username.message}
                </div>
              )}
            </div>

            {/* 密碼 */}
            <div className="mb-4">
              <label htmlFor="password" className="form-label d-block">
                密碼
              </label>

              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="請輸入密碼"
                {...register("password", {
                  required: "密碼為必填",
                })}
              />

              {errors.password && (
                <div className="text-danger small mt-1">
                  {errors.password.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={isLoading}
            >
              {isLoading ? "登入中..." : "登入"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
