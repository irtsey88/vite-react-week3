import { useState, useEffect} from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ modalType, templateProduct, closeModal, getProducts,}) {
  const [tempData, setTempData] =  useState(templateProduct);

    useEffect(() => {
    setTempData(templateProduct);
  }, [templateProduct]);


    const updateProducts = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    }
    const productData = {
      ...tempData,
      origin_price: Number(tempData.origin_price),
      price: Number(tempData.price),
      is_enabled: tempData.is_enabled ? 1 : 0,
      imagesUrl: [...tempData.imagesUrl.filter((url) => url !== "")], //過濾空字串
    };

    try {
      const response = await axios[method](url, { data: productData });
      console.log(response.data);
      getProducts();
      closeModal();
    } catch (error) {
      console.log(error.response);
      alert(error?.response?.data?.message || "商品操作失敗");
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
      alert(error?.response?.data?.message || "刪除商品失敗");
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0]; /* 取一筆方式的寫法 */
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file-to-upload", file);

      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData,
      );
      setTempData((pre) => ({
        ...pre,
        imageUrl: response.data.imageUrl,
      }));
      e.target.value = "";
    } catch (error) {
      console.log("上傳失敗", error.response);
    }
  };


  /* ================= 表單輸入 ================= */
  const handModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTempData((preData) => ({
      ...preData,
      [name]: type == "checkbox" ? checked : value,
    }));
  };

  const handleImagesUrlChange = (index, value) => {
    setTempData((pre) => {
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
    setTempData((pre) => {
      const newImagesUrl = [...pre.imagesUrl];
      newImagesUrl.push("");
      return {
        ...pre,
        imagesUrl: newImagesUrl,
      };
    });
  };

  const handleRemoveImage = () => {
    setTempData((pre) => {
      const newImagesUrl = [...pre.imagesUrl];
      newImagesUrl.pop();
      return {
        ...pre,
        imagesUrl: newImagesUrl,
      };
    });
  };

  return (
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
                <span className="text-danger">{tempData.title}</span>
                嗎？
              </p>
            ) : (
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-2">
                    <div className="mb-2">
                      <label htmlFor="fileInput" className="form-label">
                        上傳圖片
                      </label>
                      <input
                        type="file"
                        name="fileInput"
                        id="fileInput"
                        className="form-control"
                        accept=".jpg, .jpeg, .png"
                        onChange={(e) => uploadImage(e)}
                      />
                    </div>

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
                        value={tempData.imageUrl}
                        onChange={(e) => handModalInputChange(e)}
                      />
                    </div>
                    {tempData.imageUrl && (
                      <img
                        className="img-fluid"
                        src={tempData.imageUrl}
                        alt="主圖"
                      />
                    )}
                  </div>

                  <div>
                    <div>
                      {tempData.imagesUrl.map((url, index) => (
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

                          {tempData && (
                            <img
                              className="img-fluid mt-2"
                              src={url}
                              alt={`副圖 ${index + 1}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {tempData.imagesUrl.length < 5 &&
                      tempData.imagesUrl[
                        tempData.imagesUrl.length - 1
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
                    {tempData.imagesUrl.length >= 1}
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
                      value={tempData.title}
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
                        value={tempData.category}
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
                        value={tempData.unit}
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
                        type="number"
                        min={0}
                        className="form-control"
                        placeholder="請輸入原價"
                        value={tempData.origin_price}
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
                        type="number"
                        min={0}
                        className="form-control"
                        placeholder="請輸入售價"
                        value={tempData.price}
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
                      value={tempData.description}
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
                      value={tempData.content}
                      onChange={(e) => handModalInputChange(e)}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        name="is_enabled"
                        id="is_enabled"
                        type="checkbox"
                        checked={tempData.is_enabled}
                        className="form-check-input"
                        onChange={(e) =>
                          setTempData((prev) => ({
                            ...prev,
                            is_enabled: e.target.checked,
                          }))
                        }
                      />
                      <label htmlFor="is_enabled" className="form-check-label">
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
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => deleteProduct(tempData.id)}
              >
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
                  onClick={() => updateProducts(tempData.id)}
                >
                  確認
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
