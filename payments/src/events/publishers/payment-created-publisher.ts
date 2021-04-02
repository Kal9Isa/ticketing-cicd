import { PaymentCreatedEvent, Publisher, Subjects } from "@hiroit/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
