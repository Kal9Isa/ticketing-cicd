import useRequest from "../../hooks/use-request";
import StripeCheckout from "react-stripe-checkout";
import { useState, useEffect } from "react";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  if (timeLeft < 0) {
    return <div>Order Expired!</div>;
  }

  return (
    <div>
      <div>Time left to pay: {timeLeft} seconds</div>
      {errors}
      {/* To test 4242 4242 4242 4242 any cvv2 expDate */}
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51IbgEnB7vWFlBoAXWcPXb5YaaVTgLl7dVFrWOAntpl15oFjFA3FgYwpXVs6K2zFFD5qP8oVT3GStYPhQIzGsYvfs00ncoWCZni"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
