import { TicketUpdatedEvent } from "@hiroit/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  // create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "new concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("ACKs the message", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage func with fabricated data
  await listener.onMessage(data, msg);

  // an assertion to make sure ack was called
  expect(msg.ack).toHaveBeenCalled();
});

it("will not ACK if the msg has skipped version", async () => {
  const { listener, data, msg } = await setup();
  data.version = 10;

  // call the onMessage func with fabricated data
  try {
    await listener.onMessage(data, msg);
  } catch (error) {}
  // an assertion to make sure ack was called
  expect(msg.ack).not.toHaveBeenCalled();
});
