import { createBrowserRouter, RouterProviderProps } from "react-router-dom";
import App from "../App";
import Login from "../page/login";


const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  }, {
    path: '/home',
    element: <App />
  }
]);

export default router;