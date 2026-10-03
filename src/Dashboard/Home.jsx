import "./Dashboard.css";
import { FiArrowUpRight } from "react-icons/fi";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { RiStockLine } from "react-icons/ri";
import { TiShoppingCart } from "react-icons/ti";

const Home = ({ totalEnquiries, onNavigate }) => {
  const shortcuts = [
    {
      id: "orders",
      label: "Manage orders",
      detail: "Review and update customer orders",
      icon: <TiShoppingCart />,
    },
    {
      id: "stock",
      label: "Check inventory",
      detail: "Keep product availability up to date",
      icon: <RiStockLine />,
    },
    {
      id: "enquiry",
      label: "View enquiries",
      detail: "Respond to customer questions",
      icon: <LuMessageCircleQuestion />,
    },
  ];

  return (
    <div className="Dashboard_home">
      <section className="dashboard_welcome">
        <div className="dashboard_welcome-copy">
          <span className="dashboard-home-eyebrow">YOUR STORE AT A GLANCE</span>
          <h1>
            Welcome to your
            <br />
            control center.
          </h1>
          <p>Manage your store, stay on top of customer activity, and keep things moving.</p>
          <button type="button" onClick={() => onNavigate("orders")}>
            Go to orders <FiArrowUpRight />
          </button>
        </div>
        <div className="dashboard_welcome-art" aria-hidden="true">
          <span className="dashboard-art-orbit dashboard-art-orbit-one" />
          <span className="dashboard-art-orbit dashboard-art-orbit-two" />
          <span className="dashboard-art-sparkle">✳</span>
          <span className="dashboard-art-monogram">Z</span>
          <span className="dashboard-art-caption">CURATED FOR YOU</span>
        </div>
      </section>

      <div className="dashboard_section-heading">
        <div>
          <span className="dashboard-home-eyebrow">STORE PULSE</span>
          <h2>Your store today</h2>
        </div>
        <span className="dashboard-live-indicator"><i /> Overview snapshot</span>
      </div>
      <section className="dashboard_overview-grid" aria-label="Store overview">
        <article className="dashboard_overview-card dashboard_enquiry-card">
          <span className="dashboard_overview-icon">
            <LuMessageCircleQuestion />
          </span>
          <span className="dashboard_overview-label">Total enquiries</span>
          <strong>{totalEnquiries}</strong>
          <span className="dashboard_overview-note">Customer messages received</span>
        </article>
        <article className="dashboard_overview-note-card">
          <span className="dashboard_overview-icon">
            <TiShoppingCart />
          </span>
          <div>
            <strong>Thoughtful service,</strong>
            <p>one order and conversation at a time.</p>
          </div>
        </article>
      </section>

      <section className="dashboard_shortcuts">
        <div className="dashboard_section-heading">
          <div>
            <span className="dashboard-home-eyebrow">QUICK ACCESS</span>
            <h2>Pick up where you left off</h2>
          </div>
        </div>
        <div className="dashboard_shortcut-grid">
          {shortcuts.map((shortcut) => (
            <button
              className="dashboard_shortcut-card"
              key={shortcut.id}
              onClick={() => onNavigate(shortcut.id)}
              type="button"
            >
              <span className="dashboard_shortcut-icon">{shortcut.icon}</span>
              <span className="dashboard_shortcut-copy">
                <strong>{shortcut.label}</strong>
                <small>{shortcut.detail}</small>
              </span>
              <FiArrowUpRight className="dashboard_shortcut-arrow" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
