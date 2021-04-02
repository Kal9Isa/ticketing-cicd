import { ExpirationCompleteEvent } from "@hiroit/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { OrderStatus, Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  // create an instance of listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: "test",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, order };
};

it("updates the order status to cancelled", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit the order cancelled event", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const { id } = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(id).toEqual(order.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage func with fabricated data
  await listener.onMessage(data, msg);

  // an assertion to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});
