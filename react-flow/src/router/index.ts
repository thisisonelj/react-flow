import { createBrowserRouter } from "react-router-dom";
import { Home, About, NotFound, FlowList } from "../pages";
import Layout from "../components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "about",
        Component: About,
      },
      {
        path: "*",
        Component: NotFound,
      },
      {
        path: "flowList",
        Component: FlowList,
      },
    ],
  },
]);
