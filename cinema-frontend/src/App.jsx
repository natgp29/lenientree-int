import { useEffect, useState } from "react";
import "./App.css";
import QrCodes from "./QrCodes";
import Login from "./Login";
import Staff from "./Staff";

const API = "http://192.168.1.6:3000";


function App() {
   if (window.location.pathname === "/qrcodes") {
    return <QrCodes />;
  }
  if (window.location.pathname === "/admin") {
    return <Login onLogin={(user) => {
        window.location.href = `/staff?user=${user.id}`;
    }} />;
}

if (window.location.pathname === "/staff") {
  return <Staff />;
}

  const params = new URLSearchParams(window.location.search);
const qrToken = params.get("token") || "cinema-seat-a1-demo";
  const [seat, setSeat] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(false);

  useEffect(() => {
    loadSeat();
  }, []);
  useEffect(() => {
  if (!order?.id) return;

  const interval = setInterval(() => {
    refreshOrder();
  }, 5000);

  return () => clearInterval(interval);
}, [order?.id]);

  async function loadSeat() {
    try {
      const seatResponse = await fetch(
        `${API}/public/seat/${qrToken}`
      );

      const seatData = await seatResponse.json();

      if (!seatData.success) {
        throw new Error("Invalid QR code");
      }

      setSeat(seatData.seat);

      const theatreId =
        seatData.seat.screens.theatres.id;

      const menuResponse = await fetch(
        `${API}/public/menu/${theatreId}`
      );

      const menuData = await menuResponse.json();

      setProducts(menuData.products || []);

    } catch (error) {
      console.error(error);
      alert("Unable to load cinema information");
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product) {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] || 0) + 1
    }));
  }

  function removeFromCart(product) {
    setCart((current) => {
      const quantity = current[product.id] || 0;

      if (quantity <= 1) {
        const updated = { ...current };
        delete updated[product.id];
        return updated;
      }

      return {
        ...current,
        [product.id]: quantity - 1
      };
    });
  }

  function getCartTotal() {
    return products.reduce((total, product) => {
      const quantity = cart[product.id] || 0;
      return total + Number(product.price) * quantity;
    }, 0);
  }

  async function refreshOrder() {
  if (!order?.id) return;

  try {
    const response = await fetch(`${API}/orders/${order.id}`);
    const data = await response.json();

    if (data.success) {
      setOrder(data.order);
    }
  } catch (error) {
    console.error("Failed to refresh order:", error);
  }
}


  function placeOrder() {
    if (getCartTotal() === 0) {
        alert("Please add an item first");
        return;
    }

    setPayment(true);
}
async function processPayment() {
    const items = Object.entries(cart).map(
        ([product_id, quantity]) => ({
            product_id,
            quantity
        })
    );

    try {
        const response = await fetch(`${API}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                seat_id: seat.id,
                items,
                payment_status: "paid"
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        setOrder(data.order);
        setCart({});
        setPayment(false);

    } catch (error) {
        console.error(error);
        alert("Payment failed");
    }
}

  if (payment) {
    return (
        <div className="app">
            <div className="success-card">
                <h1>Payment</h1>

                <p>Total Amount</p>
                <h2>₹{getCartTotal()}</h2>

                <button onClick={() => setPayment(false)}>
                    Back to Order
                </button>

                <button onClick={processPayment}>
    Pay Now
</button>
            </div>
        </div>
    );
}

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (order) {
    return (
      <div className="app">
        <div className="success-card">
          <h1>Order Placed! 🎉</h1>

          <p>
            Your order has been sent to the cinema.
          </p>

          <div className="order-info">
            <p>
              <strong>Order ID:</strong>
              <br />
              {order.id}
            </p>

            <p>
              <strong>Seat:</strong> {seat.seat_label}
            </p>

            <p>
              <strong>Total:</strong> ₹{order.total}
            </p>

            <p>
              <strong>Status:</strong> {order.status}
            </p>
          </div>

          <button
            onClick={() => setOrder(null)}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">

      <header>
        <h1>🎬 {seat?.screens?.theatres?.name}</h1>

        <p>
          Screen {seat?.screens?.screen_number}
          {" • "}
          Seat {seat?.seat_label}
        </p>
      </header>

      <main>

        <h2>Food & Drinks</h2>

        <div className="menu">
          {products.map((product) => {
            const quantity = cart[product.id] || 0;

            return (
              <div
                className="product"
                key={product.id}
              >
                <div>
                  <h3>{product.name}</h3>

                  <p>
                    {product.menu_categories?.name}
                  </p>

                  <strong>
                    ₹{product.price}
                  </strong>
                </div>

                <div className="quantity">

  {quantity === 0 ? (
    <button
      className="add-button"
      onClick={() => addToCart(product)}
    >
      Add
    </button>
  ) : (
    <>
      <button
        onClick={() => removeFromCart(product)}
      >
        −
      </button>

      <span>{quantity}</span>

      <button
        onClick={() => addToCart(product)}
      >
        +
      </button>
    </>
  )}

</div>

              </div>
            );
          })}
        </div>

        <div className="cart">

  <h2>Your Order</h2>

  {products
    .filter((product) => cart[product.id] > 0)
    .map((product) => (
      <div className="cart-item" key={product.id}>
        <span>
          {product.name} × {cart[product.id]}
        </span>

        <strong>
          ₹{Number(product.price) * cart[product.id]}
        </strong>
      </div>
    ))}

  <hr />

  <div className="cart-total">
    <span>Total</span>
    <strong>₹{getCartTotal()}</strong>
  </div>

  <button
    className="order-button"
    onClick={placeOrder}
    disabled={getCartTotal() === 0}
  >
    Proceed to Payment
  </button>

</div>

      </main>

    </div>
  );
}

export default App;