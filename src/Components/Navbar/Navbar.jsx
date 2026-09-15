import "./navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>ZYORA</h1>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>Category</li>
        <li>Orders</li>
        <li>
          <a href="/About_Us">About Us</a>
        </li>
        <li>
          <a href="/Contact_Us">Contact Us</a>
        </li>
        <p className="cart_icon">
          <i class="bi bi-bag-check-fill"></i>
        </p>
      </ul>
    </nav>
  );
};

export default Navbar;
