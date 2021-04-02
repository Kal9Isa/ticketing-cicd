import { Publisher, Subjects, TicketCreatedEvent } from "@hiroit/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
