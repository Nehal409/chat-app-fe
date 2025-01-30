import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
    </>
  );
};

export default MainLayout;
