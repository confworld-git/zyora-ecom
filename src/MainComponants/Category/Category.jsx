import "./Category.css";
import dress2 from "../../assets/Images/dress2.jfif";

const Category = () => {
  return (
    <div className="category">
      <h1>Categories</h1>
      <section>
        <div className="categories_list">
          <div className="collection_search">
            <i class="bi bi-search"></i>
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
          <div>
            <img src={dress2} alt="" />
            <h1>Product name</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ex, nisi.
            </p>
            <h2>₹2000</h2>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Category;
