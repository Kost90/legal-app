import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AiAuthorityListGeneratedEvent } from '../template/dto/authoriti-list-event.dto';
import { messages } from './messages/messages';

@Injectable()
export class EventService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  onGeneratedAuthoritySave(event: AiAuthorityListGeneratedEvent) {
    setImmediate(() => {
      this.eventEmitter.emit(messages.SAVE_GENERATED_AUTHORITY, event);
    });
  }
}
