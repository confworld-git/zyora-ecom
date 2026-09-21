import "./Favorites.css";
import bag1 from "../../assets/Images/bag1.jfif";
import bag2 from "../../assets/Images/bag2.jfif";
import bag3 from "../../assets/Images/bag3.jfif";

const Favorites = () => {
  return (
    <div className="favourites">
      <h1>
        Favorite <span>Items</span>
      </h1>
      <p>Because your cart can’t hold all your crushes.</p>
      <section className="favourite_products">
        <div>
          <i class="bi bi-heart-fill"></i>
          <button>
            <i class="bi bi-cart4"></i>
          </button>
          <img src={bag1} alt="" />
          <h1>Product name</h1>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            <i class="bi bi-currency-rupee"></i>2000
          </p>
        </div>
        <div>
          <i class="bi bi-heart-fill"></i>
          <button>
            <i class="bi bi-cart4"></i>
          </button>
          <img src={bag2} alt="" />
          <h1>Product name</h1>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            <i class="bi bi-currency-rupee"></i>2000
          </p>
        </div>
        <div>
          <i class="bi bi-heart-fill"></i>
          <button>
            <i class="bi bi-cart4"></i>
          </button>
          <img src={bag3} alt="" />
          <h1>Product name</h1>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            <i class="bi bi-currency-rupee"></i>2000
          </p>
        </div>
        <div>
          <i class="bi bi-heart-fill"></i>
          <button>
            <i class="bi bi-cart4"></i>
          </button>
          <img src={bag3} alt="" />
          <h1>Product name</h1>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            <i class="bi bi-currency-rupee"></i>2000
          </p>
        </div>
      </section>
    </div>
  );
};

export default Favorites;
