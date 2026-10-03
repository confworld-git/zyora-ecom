import "./Dashboard.css";
import { TiShoppingCart } from "react-icons/ti";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlinePersonOutline } from "react-icons/md";
import { RiHome4Line } from "react-icons/ri";
import { MdOutlineLocalOffer } from "react-icons/md";
import EnquiryData from "./EnquiryData";
import Admin from "./Admin";
import Home from "./Home";
import axios from "axios";
import { useEffect, useState } from "react";
import AddProduct from "./AddProducts";
import { useNavigate } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import { toast } from "react-hot-toast";
import CouponList from "./CouponList";
import Orders from "./Orders";
import StockManagement from "./StockManagement";
import { RiStockLine } from "react-icons/ri";

const Dashboard = () => {
  const [enquiryData, setEnquiryData] = useState([]);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );

      toast.success("Logged out successfully");

      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    const getContactData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/contact/Contact_data`,
        );
        setEnquiryData(response.data.data);
      } catch (error) {
        console.error("Error fetching contact data:", error);
      }
    };
    getContactData();
  }, []);

  const totalEnquiries = enquiryData.length;

  return (
    <div className="dashboard">
      <section className="dashboard_secton">
        <div className="dashboard_left_section">
          <h1>ZYORA</h1>
          <li className={activeSection === "home" ? "dashboard-nav-active" : ""} onClick={() => setActiveSection("home")}>
            <RiHome4Line />
            Home
          </li>
          <li className={activeSection === "orders" ? "dashboard-nav-active" : ""} onClick={() => setActiveSection("orders")}>
            <TiShoppingCart />
            Orders
          </li>
          <li className={activeSection === "stock" ? "dashboard-nav-active" : ""} onClick={() => setActiveSection("stock")}>
            <RiStockLine />
            Stock Management
          </li>
          <li className={activeSection === "enquiry" ? "dashboard-nav-active" : ""} onClick={() => setActiveSection("enquiry")}>
            <LuMessageCircleQuestion />
            Enquiry
          </li>
          <li className={activeSection === "add_product" ? "dashboard-nav-active" : ""} onClick={() => setActiveSection("add_product")}>
            <AiOutlineProduct />
            Add Products
          </li>
          <li className={activeSection === "coupon_code" ? "dashboard-nav-active" : ""} onClick={() => setActiveSection("coupon_code")}>
            <MdOutlineLocalOffer />
            Coupon Code
          </li>
          <li className={activeSection === "admin" ? "dashboard-nav-active" : ""} onClick={() => setActiveSection("admin")}>
            <MdOutlinePersonOutline />
            Admin Panel
          </li>
          <li onClick={handleLogout}>
            <RiLogoutCircleLine />
            Logout
          </li>
        </div>
        <div className="dashboard_right_section">
          {activeSection === "home" && <Home totalEnquiries={totalEnquiries} />}
          {activeSection === "orders" && <Orders />}
          {activeSection === "stock" && <StockManagement />}
          {activeSection === "enquiry" && (
            <EnquiryData enquiryData={enquiryData} />
          )}
          {activeSection === "add_product" && <AddProduct />}
          {activeSection === "admin" && <Admin />}
          {activeSection === "coupon_code" && <CouponList />}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
