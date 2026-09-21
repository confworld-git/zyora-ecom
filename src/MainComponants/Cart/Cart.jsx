import "./Cart.css";
import { HiOutlineTrash } from "react-icons/hi2";

const Cart = () => {
  return (
    <div className="cart">
      <h1 className="cart_title">
        Your <span>Cart</span>
      </h1>
      <p>You’ve got taste, and honestly, we’re impressed.</p>
      <section className="cart_section">
        <div className="cart_left_section">
          <div className="cart_item">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNii6ozXVJ5H_JiXhOG0_mOJYyVc7eci0OEEi6UJ87kA&s=10"
              alt="Product item"
            />
            <div className="cart_item_details">
              <h2>Cap</h2>
              <p>
                <span>Size:</span> Medium
              </p>
              <p>
                <span>Color:</span> Red
              </p>
              <h3>
                <i className="bi bi-currency-rupee"></i> 2000
              </h3>
            </div>
            <div className="cart_quantity">
              <i className="bi bi-dash"></i>
              <span>2</span>
              <i className="bi bi-plus"></i>
            </div>
            <div className="cart_trash">
              <HiOutlineTrash />
            </div>
          </div>
          <div className="cart_item">
            <img
              src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80"
              alt="Ruby red matte lipstick"
            />
            <div className="cart_item_details">
              <h2>Matte Lipstick</h2>
              <p>
                <span>Shade:</span> Ruby Red
              </p>
              <p>
                <span>Finish:</span> Matte
              </p>
              <h3>
                <i className="bi bi-currency-rupee"></i>
                <span>199</span>
              </h3>
            </div>
            <div className="cart_quantity">
              <i className="bi bi-dash"></i>
              <span>1</span>
              <i className="bi bi-plus"></i>
            </div>
            <div className="cart_trash">
              <HiOutlineTrash />
            </div>
          </div>
          <div className="cart_item">
            <img
              src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80"
              alt="Ruby red matte lipstick"
            />
            <div className="cart_item_details">
              <h2>Matte Lipstick</h2>
              <p>
                <span>Shade:</span> Ruby Red
              </p>
              <p>
                <span>Finish:</span> Matte
              </p>
              <h3>
                <i className="bi bi-currency-rupee"></i>
                <span>199</span>
              </h3>
            </div>
            <div className="cart_quantity">
              <i className="bi bi-dash"></i>
              <span>1</span>
              <i className="bi bi-plus"></i>
            </div>
            <div className="cart_trash">
              <HiOutlineTrash />
            </div>
          </div>
          <div className="cart_item">
            <img
              src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80"
              alt="Ruby red matte lipstick"
            />
            <div className="cart_item_details">
              <h2>Matte Lipstick</h2>
              <p>
                <span>Shade:</span> Ruby Red
              </p>
              <p>
                <span>Finish:</span> Matte
              </p>
              <h3>
                <i className="bi bi-currency-rupee"></i>
                <span>199</span>
              </h3>
            </div>
            <div className="cart_quantity">
              <i className="bi bi-dash"></i>
              <span>1</span>
              <i className="bi bi-plus"></i>
            </div>
            <div className="cart_trash">
              <HiOutlineTrash />
            </div>
          </div>
          <div className="cart_item">
            <img
              src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80"
              alt="Ruby red matte lipstick"
            />
            <div className="cart_item_details">
              <h2>Matte Lipstick</h2>
              <p>
                <span>Shade:</span> Ruby Red
              </p>
              <p>
                <span>Finish:</span> Matte
              </p>
              <h3>
                <i className="bi bi-currency-rupee"></i>
                <span>199</span>
              </h3>
            </div>
            <div className="cart_quantity">
              <i className="bi bi-dash"></i>
              <span>1</span>
              <i className="bi bi-plus"></i>
            </div>
            <div className="cart_trash">
              <HiOutlineTrash />
            </div>
          </div>
        </div>

        <aside className="cart_summary">
          <h2>Order Summary</h2>

          <div className="summary_row">
            <span>Subtotal</span>
            <strong>
              <i className="bi bi-currency-rupee"></i>4,799
            </strong>
          </div>

          <div className="summary_row">
            <span>Shipping</span>
            <strong>
              <i className="bi bi-currency-rupee"></i>250
            </strong>
          </div>

          <div className="summary_row">
            <span>Discount</span>
            <strong className="discount">
              -<i className="bi bi-currency-rupee"></i>500
            </strong>
          </div>

          <div className="promo_code">
            <input type="text" placeholder="Coupon code" />
            <button>Apply</button>
          </div>

          <div className="summary_total">
            <span>Total</span>
            <strong>
              <i className="bi bi-currency-rupee"></i>4,549
            </strong>
          </div>

          <button className="checkout_btn">Proceed to Checkout</button>
        </aside>
      </section>
    </div>
  );
};

export default Cart;
