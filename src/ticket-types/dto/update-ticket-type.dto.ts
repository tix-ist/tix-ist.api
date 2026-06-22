import { PartialType } from '@nestjs/swagger';
import { CreateTicketTypeDto } from './create-ticket-type.dto';

/** Every field optional. Quantity can't drop below sold; price locks once sold. */
export class UpdateTicketTypeDto extends PartialType(CreateTicketTypeDto) {}
