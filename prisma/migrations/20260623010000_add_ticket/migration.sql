-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "isAssigned" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3),
    "attendeeId" TEXT,
    "isCheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "checkedInBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qrCodeData_key" ON "Ticket"("qrCodeData");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_attendeeId_key" ON "Ticket"("attendeeId");

-- CreateIndex
CREATE INDEX "Ticket_registrationId_idx" ON "Ticket"("registrationId");

-- CreateIndex
CREATE INDEX "Ticket_eventId_idx" ON "Ticket"("eventId");

-- CreateIndex
CREATE INDEX "Ticket_ticketTypeId_idx" ON "Ticket"("ticketTypeId");

-- CreateIndex
CREATE INDEX "Ticket_ticketNumber_idx" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE INDEX "Ticket_qrCodeData_idx" ON "Ticket"("qrCodeData");

-- CreateIndex
CREATE INDEX "Ticket_eventId_isCheckedIn_idx" ON "Ticket"("eventId", "isCheckedIn");

-- CreateIndex
CREATE INDEX "Ticket_eventId_isAssigned_idx" ON "Ticket"("eventId", "isAssigned");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

