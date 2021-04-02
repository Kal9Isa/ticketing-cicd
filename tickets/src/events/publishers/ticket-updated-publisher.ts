import { Publisher, Subjects, TicketUpdatedEvent } from "@hiroit/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
