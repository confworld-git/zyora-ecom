import "./Category.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Category = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/products/get_products`,
        );

        console.log(response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    getProducts();
  }, []);

  return (
    <div className="category">
      <h1>Categories</h1>

      <section>
        <div className="categories_list">
          <div className="collection_search">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="Search..." />
          </div>

          <br />

          <div>
            <li>Fashion</li>
            <li>Beauty & Personal Care</li>
            <li>Footwear</li>
            <li>Bags & Luggage</li>
            <li>Soft Toys</li>
            <li>Home & Kitchen</li>
            <li>Stationery</li>
          </div>

          <br />

          <div>
            <li>Filter options</li>
          </div>
        </div>

        <div className="categories_items">
          {products.map((product) => (
            <div
              className="product_card"
              key={product._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/product/${product.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/product/${product.id}`);
                }
              }}
            >
              <img src={product.images?.[0]} alt={product.title} />
              <small>{product.brand}</small>
              <p className="product_description">{product.title}</p>
              <div className="price">
                <strong>₹{product.price.selling_price}</strong>
                <del>₹{product.price.mrp}</del>
                <span>({product.price.discount_percent}% OFF)</span>
              </div>
              <p>
                ⭐ {product.rating?.average ?? 0} ({product.rating?.count ?? 0})
              </p>
              {product.stock.in_stock ? <p>In Stock</p> : <p>Out of Stock</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Category;
