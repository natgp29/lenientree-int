import { useEffect, useState } from "react";
import { supabase } from "./supabase";


const API = "http://localhost:3000";

const statuses = [
    "pending",
    "paid",
    "accepted",
    "preparing",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled",
];

function Admin({role}) {
    
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API}/orders`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    const {
  data: { session }
} = await supabase.auth.getSession();

if (!session) {
  alert("You are not logged in");
  return;
}
    try {
      const response = await fetch(`${API}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  if (loading) {
    return <h2>Loading orders...</h2>;
  }

  return (
    <div className="admin">
  <div className="admin-header">
    <h1>Cinema Order Dashboard</h1>

    <button onClick={handleLogout}>
      Logout
    </button>
  </div>
      

      {orders.length === 0 ? (
        <p>No active orders.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-header">
              <strong>Order #{order.id.slice(0, 8)}</strong>
              {role === "delivery" && (
  <span>
    📍 {order.seats?.screens?.name} — Seat {order.seats?.seat_label}
  </span>
)}
            </div>

            <div className="order-items">
              {order.order_items.map((item) => (
                <div key={item.id}>
                  {item.products?.name} × {item.quantity}
                  <span>₹{Number(item.unit_price) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-total">
              Total: ₹{Number(order.total)}
            </div>

            <p>
              Status: <strong>{order.status}</strong>
            </p>

            <div className="status-buttons">
    {role === "kitchen" && (
        <>
            {(order.status === "pending" || order.status === "paid") && (
    <button onClick={() => updateStatus(order.id, "accepted")}>
        Accept Order
    </button>
)}

            {order.status === "accepted" && (
                <button onClick={() => updateStatus(order.id, "preparing")}>
                    Start Preparing
                </button>
            )}

            {order.status === "preparing" && (
                <button onClick={() => updateStatus(order.id, "ready")}>
                    Mark Ready
                </button>
            )}
        </>
    )}

    {role === "delivery" && (
        <>
            {order.status === "ready" && (
                <button onClick={() => updateStatus(order.id, "out_for_delivery")}>
                    Out for Delivery
                </button>
            )}

            {order.status === "out_for_delivery" && (
                <button onClick={() => updateStatus(order.id, "delivered")}>
                    Mark Delivered
                </button>
            )}
        </>
    )}
</div>
          </div>
        ))
      )}
    </div>
  );
  async function handleLogout() {
  await supabase.auth.signOut();
  window.location.href = "/admin";
}
}

export default Admin;