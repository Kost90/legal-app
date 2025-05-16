import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventEmitterModule as EventModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventModule.forRoot({})],
  providers: [EventService],
  exports: [EventService],
})
export class EventEmitterModule {}
