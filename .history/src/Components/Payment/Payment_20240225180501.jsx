import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import { useSpring, animated } from "react-spring";
import styles from "./Payment.module.css";

const Payment = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    zipCode: "",
    email: "",
    paymentMethod: "CreditCard", // Default to CreditCard for initial state
    cardDetails: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
    },
    paypalEmail: "", // Additional field for PayPal email
  });
  const [showAnimation, setShowAnimation] = useState(false);

  const animationProps = useSpring({
    opacity: showAnimation ? 1 : 0,
    transform: showAnimation ? "scale(1)" : "scale(0)",
    from: { opacity: 0, transform: "scale(0)" },
    config: { tension: 300, friction: 10 },
  });

  useEffect(() => {
    if (location.state && location.state.items) {
      setCartItems(location.state.items);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.cardDetails) {
      setFormData({
        ...formData,
        cardDetails: { ...formData.cardDetails, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.email) {
      console.error("No user logged in");
      return;
    }

    const orderDate = new Date().toISOString();

    const orderData = {
      email: currentUser.email,
      orderDate,
      items: cartItems.map((item) => ({
        title: item.title,
        price: item.price.toString(),
        description: item.description,
        category: item.category,
        image: item.image,
      })),
      paymentMethod: formData.paymentMethod,
      paymentDetails:
        formData.paymentMethod === "CreditCard"
          ? formData.cardDetails
          : { paypalEmail: formData.paypalEmail },
    };

    try {
      const response = await axios.post(
        "https://epicbazaar.onrender.com/orders",
        orderData
      );
      if (response.status === 200 || response.status === 201) {
        setShowAnimation(true);
        setTimeout(() => {
          navigate("/orders", { replace: true });
        }, 2000); // Redirect after 2 seconds
      } else {
        console.error("Failed to submit order:", response.statusText);
      }
    } catch (error) {
      console.error(
        "Order submission error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div id="parent">
      <div className={styles.paymentFormContainer}>
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
          {/* Existing input fields for fullName, streetAddress, etc. */}

          <div className={styles.inputGroup}>
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              required
            >
              <option value="CreditCard">Credit Card</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>

          {formData.paymentMethod === "CreditCard" && (
            <div className={styles.cardDetails}>
              {/* Existing Card Details Inputs */}
              {/* Card Number */}
              <div className={styles.inputGroup}>
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  placeholder="Enter your card number"
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardDetails.cardNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* Expiry Month and Year */}
              <div className={styles.splitInput}>
                <div className={styles.inputGroup}>
                  <label htmlFor="expiryMonth">Expiry Month</label>
                  <input
                    placeholder="MM"
                    type="text"
                    id="expiryMonth"
                    name="expiryMonth"
                    value={formData.cardDetails.expiryMonth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="expiryYear">Expiry Year</label>
                  <input
                    placeholder="YYYY"
                    type="text"
                    id="expiryYear"
                    name="expiryYear"
                    value={formData.cardDetails.expiryYear}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              {/* CVC */}
              <div className={styles.inputGroup}>
                <label htmlFor="cvc">CVC</label>
                <input
                  style={{ width: "30%" }}
                  placeholder="CVC"
                  type="text"
                  id="cvc"
                  name="cvc"
                  value={formData.cardDetails.cvc}
                  maxLength="4"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}

          {formData.paymentMethod === "PayPal" && (
            <div className={styles.inputGroup}>
              <label htmlFor="paypalEmail">PayPal Email</label>
              <input
                placeholder="Enter your PayPal email"
                type="email"
                id="paypalEmail"
                name="paypalEmail"
                value={formData.paypalEmail}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <button type="submit" className={styles.submitButton}>
            Place Order
          </button>
        </form>
      </div>
      <animated.div
        style={animationProps}
        className={styles.celebrationAnimation}
      >
        Order Placed Successfully !!!
      </animated.div>
    </div>
  );
};

export default Payment;
