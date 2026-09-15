import "./Featured.css";
import furnicher1 from "../../assets/Images/furnicher1.jfif";
import furnicher2 from "../../assets/Images/furnicher2.jfif";
import note1 from "../../assets/Images/note1.jfif";
import kitchen1 from "../../assets/Images/kitchen1.jfif";
import toy4 from "../../assets/Images/toy4.jfif";
import bag2 from "../../assets/Images/bag2.jfif";
// import toy5 from "../../assets/Images/toy5.png";
import note2 from "../../assets/Images/note2.jfif";
import note3 from "../../assets/Images/note3.jfif";
import note4 from "../../assets/Images/note4.jfif";

import bag5 from "../../assets/Images/bag5.jfif";
import dress2 from "../../assets/Images/dress2.jfif";
import dress3 from "../../assets/Images/dress3.jfif";
import toy2 from "../../assets/Images/toy2.png";
import bag3 from "../../assets/Images/bag3.jfif";
import kitchen2 from "../../assets/Images/kitchen2.jfif";
import toy3 from "../../assets/Images/toy3.jfif";

import dress1 from "../../assets/Images/dress1.jfif";
import bag4 from "../../assets/Images/bag4.jfif";
import toy1 from "../../assets/Images/toy1.jfif";
import dress4 from "../../assets/Images/dress4.jfif";

const Featured = () => {
  const products = [
    {
      image: bag2,
      name: "Green Fashion Bag",
      price: 1499,
      description: "Trendy handbag designed for everyday fashion.",
      category: "Fashion",
    },
    {
      image: bag5,
      name: "Elegant White Handbag",
      price: 1599,
      description: "Minimal and sophisticated handbag for every occasion.",
      category: "Fashion",
    },
    {
      image: bag3,
      name: "Navy Blue Handbag",
      price: 1399,
      description: "Classic blue handbag with a premium appearance.",
      category: "Fashion",
    },
    {
      image: bag4,
      name: "Luxury Black Handbag",
      price: 1799,
      description: "Premium black handbag with a stylish design.",
      category: "Fashion",
    },
    {
      image: dress1,
      name: "Floral Casual Dress",
      price: 899,
      description: "Comfortable floral dress for casual outings.",
      category: "Fashion",
    },
    {
      image: dress2,
      name: "Yellow Summer Dress",
      price: 999,
      description: "Light and comfortable dress for sunny days.",
      category: "Fashion",
    },
    {
      image: dress3,
      name: "Elegant White Dress",
      price: 1199,
      description: "Simple and elegant dress with a timeless look.",
      category: "Fashion",
    },
    {
      image: dress4,
      name: "Black & White Dress",
      price: 1099,
      description: "Modern black and white dress with an elegant style.",
      category: "Fashion",
    },

    {
      image: note1,
      name: "Pastel Stationery Set",
      price: 349,
      description: "Beautiful stationery essentials for work and study.",
      category: "Stationery",
    },
    {
      image: note2,
      name: "Floral Notebook Set",
      price: 299,
      description: "Cute notebooks with stylish floral designs.",
      category: "Stationery",
    },
    {
      image: note3,
      name: "Creative Planner Set",
      price: 449,
      description: "Organize your day with this colorful planner set.",
      category: "Stationery",
    },
    {
      image: note4,
      name: "Mint Desk Organizer",
      price: 399,
      description: "Keep your workspace neat and organized.",
      category: "Stationery",
    },

    {
      image: kitchen1,
      name: "Modern Kitchen Set",
      price: 899,
      description: "Stylish and practical essentials for your kitchen.",
      category: "Home & Kitchen",
    },
    {
      image: kitchen2,
      name: "Kitchen Essentials",
      price: 749,
      description: "Useful kitchen essentials for your everyday needs.",
      category: "Home & Kitchen",
    },
        {
      image: furnicher1,
      name: "Modern Bedside Table",
      price: 2499,
      description:
        "Stylish bedside table with open shelves and spacious drawers.",
      category: "Home & Kitchen",
    },
    {
      image: furnicher2,
      name: "Minimal Wooden Nightstand",
      price: 2299,
      description:
        "Modern wooden nightstand designed to keep your bedroom organized.",
      category: "Home & Kitchen",
    },

    {
      image: toy4,
      name: "Cuddly Teddy Bear",
      price: 699,
      description: "Soft and adorable teddy bear, perfect for gifting.",
      category: "Toys",
    },
    // {
    //   image: toy5,
    //   name: "Classic Red Teddy",
    //   price: 799,
    //   description: "Super-soft teddy bear made for warm cuddles.",
    //   category: "Toys",
    // },
    {
      image: toy2,
      name: "Soft Cream Teddy",
      price: 649,
      description: "Adorable soft toy that's perfect for kids and gifting.",
      category: "Toys",
    },
    {
      image: toy3,
      name: "Cute Panda Plush",
      price: 599,
      description: "Soft panda plush toy made for endless cuddles.",
      category: "Toys",
    },
    {
      image: toy1,
      name: "White Teddy Bear",
      price: 699,
      description: "Classic white teddy bear with an ultra-soft finish.",
      category: "Toys",
    },
  ];

  const categories = ["Fashion", "Stationery", "Home & Kitchen", "Toys"];
  return (
    <div className="Featured_Collection">
      <h1>
        Featured <span>Collections</span> Banner
      </h1>
      <p>Handpicked selections tailored to your lifestyle</p>
      <section>
        <div>
          <h1>New Arrivals</h1>
          <p>Fresh finds, just landed.</p>
        </div>
        <div>
          <h1>Best Sellers</h1>
          <p>Loved by thousands of happy customers. </p>
        </div>
        <div>
          <h1>Under ₹499</h1>
          <p>Great picks that won't break the bank.</p>
        </div>
      </section>
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (product) => product.category === category,
        );

        return (
          <div className="category_section" key={category}>
            <div className="category_heading">
              <h1>{category}</h1>
              <p>
                View products <i className="bi bi-arrow-right"></i>
              </p>
            </div>
            <div className="collections_imgs">
              {categoryProducts.map((product, index) => (
                <div className="product_card" key={index}>
                  <img src={product.image} alt={product.name} />
                  <div className="product_info">
                    <h2>{product.name}</h2>
                    <p className="product_price">₹{product.price}</p>
                    <p className="product_description">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Featured;
