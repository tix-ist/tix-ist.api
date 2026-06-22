import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

/** Every field optional; patch any subset. Changing `slug` re-checks uniqueness. */
export class UpdateEventDto extends PartialType(CreateEventDto) {}
