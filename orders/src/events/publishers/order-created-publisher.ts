import { OrderCreatedEvent, Publisher, Subjects } from "@hiroit/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
