import { OrderCancelledEvent, Publisher, Subjects } from "@hiroit/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
