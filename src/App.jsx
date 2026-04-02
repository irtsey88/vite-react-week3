import { RouterProvider } from "react-router-dom";

import { router } from "./router";
import MessageToast from "./components/MessageToast";

function App() {
  return (
    <>
      <MessageToast />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
