import "./navbar.css";
// import logo from "../../assets/Logo/Zyora_logo.jpg";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>ZYORA</h1>
      {/* <img src={logo} alt="Logo" className="logo" /> */}
      {/* <div>
        <input type="text" placeholder="Search..." />
      </div> */}
      <ul>
        <li>Home</li>
        <li>Category</li>
        <li>Orders</li>
        <li>About Us</li>
        <li>Contact Us</li>
        <p className="cart_icon">
          <i class="bi bi-bag-check-fill"></i>
        </p>
      </ul>
    </nav>
  );
};

export default Navbar;
