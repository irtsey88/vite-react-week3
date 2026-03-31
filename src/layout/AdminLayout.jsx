import { Outlet, Link } from "react-router-dom";

function AdminLayout() {
  return (
    <>
      <header>
        <ul className="nav">
          <li className="nav-item">
            <Link className="nav-link"  to="/admin/product">
              後台產品列表
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link"  to="/admin/order">
              後台訂單列表
            </Link>
          </li>
        </ul>
      </header>
      <main>
        <Outlet />
      </main>
      <footer></footer>
    </>
  );
}

export default AdminLayout;
