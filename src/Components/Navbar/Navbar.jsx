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
        <li>
          <a href="/About_Us">About Us</a>
        </li>
        <li>
          <a href="/Contact_Us">Contact Us</a>
        </li>
        <a className="cart_icon" href="/Cart">
          <i class="bi bi-bag-check-fill"></i>
          {/* <i class="bi bi-bag-check"></i> */}
        </a>
        <a className="cart_icon" href="/Favorites">
          <i class="bi bi-heart-fill"></i>
          {/* <i class="bi bi-heart"></i> */}
        </a>
      </ul>
    </nav>
  );
};

export default Navbar;
