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
  const [summaryCounts, setSummaryCounts] = useState({
    orders: null,
    coupons: null,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const navigation = [
    { id: "home", label: "Overview", icon: <RiHome4Line /> },
    { id: "orders", label: "Orders", icon: <TiShoppingCart /> },
    { id: "stock", label: "Inventory", icon: <RiStockLine /> },
    { id: "enquiry", label: "Enquiries", icon: <LuMessageCircleQuestion /> },
    { id: "coupon_code", label: "Coupon codes", icon: <MdOutlineLocalOffer /> },
    { id: "add_product", label: "Add products", icon: <AiOutlineProduct /> },
    { id: "admin", label: "Admin settings", icon: <MdOutlinePersonOutline /> },
  ];
  const activePage =
    navigation.find((item) => item.id === activeSection)?.label || "Overview";

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

  useEffect(() => {
    if (activeSection !== "home") return;

    let cancelled = false;
    const getSummaryCounts = async () => {
      setSummaryLoading(true);
      const results = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`, {
          withCredentials: true,
        }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/coupons`, {
          withCredentials: true,
        }),
      ]);

      if (cancelled) return;

      const [ordersResult, couponsResult] = results;
      if (ordersResult.status === "fulfilled") {
        const orders = ordersResult.value.data.orders;
        if (Array.isArray(orders)) {
          setSummaryCounts((current) => ({ ...current, orders: orders.length }));
        } else {
          console.error("Unable to load dashboard order count: invalid response");
        }
      } else {
        console.error("Unable to load dashboard order count:", ordersResult.reason);
      }

      if (couponsResult.status === "fulfilled") {
        const coupons =
          couponsResult.value.data.coupons ?? couponsResult.value.data.data;
        if (Array.isArray(coupons)) {
          setSummaryCounts((current) => ({ ...current, coupons: coupons.length }));
        } else {
          console.error("Unable to load dashboard coupon count: invalid response");
        }
      } else {
        console.error("Unable to load dashboard coupon count:", couponsResult.reason);
      }

      setSummaryLoading(false);
    };

    getSummaryCounts();
    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  const totalEnquiries = enquiryData.length;
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="dashboard">
      <section className="dashboard_secton">
        <aside className="dashboard_left_section">
          <div className="dashboard_brand">
            <span className="dashboard_brand-mark" aria-hidden="true">Z</span>
            <div>
              <h1>ZYORA</h1>
              <span>STORE ADMIN</span>
            </div>
          </div>
          <span className="dashboard_nav-label">WORKSPACE</span>
          <nav className="dashboard_nav" aria-label="Dashboard navigation">
            {navigation.map((item) => (
              <button
                className={`dashboard-nav-item${activeSection === item.id ? " dashboard-nav-active" : ""}`}
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                type="button"
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === "enquiry" && totalEnquiries > 0 && (
                  <span className="dashboard-nav-count">{totalEnquiries}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="dashboard_sidebar-footer">
            <div className="dashboard_store-status">
              <span className="dashboard_status-dot" />
              <span>Store management</span>
            </div>
            <button className="dashboard-logout" onClick={handleLogout} type="button">
              <RiLogoutCircleLine />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
        <main className="dashboard_right_section">
          <header className="dashboard_topbar">
            <div className="dashboard_breadcrumb">
              <span>ZYORA</span>
              <span aria-hidden="true">/</span>
              <strong>{activePage}</strong>
            </div>
            <div className="dashboard_topbar-meta">
              <span className="dashboard_today">{today}</span>
              <span className="dashboard_admin-avatar" role="img" aria-label="Administrator">A</span>
            </div>
          </header>
          <div className="dashboard_content">
            {activeSection === "home" && (
              <Home
                totalOrders={summaryCounts.orders}
                totalEnquiries={totalEnquiries}
                totalCoupons={summaryCounts.coupons}
                summaryLoading={summaryLoading}
                onNavigate={setActiveSection}
              />
            )}
            {activeSection === "orders" && <Orders />}
            {activeSection === "stock" && <StockManagement />}
            {activeSection === "enquiry" && (
              <EnquiryData enquiryData={enquiryData} />
            )}
            {activeSection === "add_product" && <AddProduct />}
            {activeSection === "admin" && <Admin />}
            {activeSection === "coupon_code" && <CouponList />}
          </div>
        </main>
      </section>
    </div>
  );
};

export default Dashboard;
