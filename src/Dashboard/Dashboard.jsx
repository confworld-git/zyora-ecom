import "./Dashboard.css";
import { TiShoppingCart } from "react-icons/ti";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { AiOutlineProduct } from "react-icons/ai";
import { MdOutlinePersonOutline } from "react-icons/md";
import { RiHome4Line } from "react-icons/ri";
import EnquiryData from "./EnquiryData";
// import Home from "./Home";
import axios from "axios";
import { useEffect, useState } from "react";
import AddProduct from "./AddProducts";
import { useNavigate } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const [enquiryData, setEnquiryData] = useState([]);
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

  // const totalEnquiries = enquiryData.length;

  return (
    <div className="dashboard">
      <section className="dashboard_secton">
        <div className="dashboard_left_section">
          <h1>ZYORA</h1>
          <li>
            <RiHome4Line />
            Home
          </li>
          <li>
            <TiShoppingCart />
            Orders
          </li>
          <li>
            <LuMessageCircleQuestion />
            Enquiry
          </li>
          <li>
            <AiOutlineProduct />
            Add Products
          </li>
          <li>
            <MdOutlinePersonOutline />
            Admin Panel
          </li>
          <li onClick={handleLogout}>
            <RiLogoutCircleLine />
            Logout
          </li>
        </div>
        <div className="dashboard_right_section">
          <EnquiryData enquiryData={enquiryData} />
          {/* <Home totalEnquiries={totalEnquiries} /> */}
          <AddProduct />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
