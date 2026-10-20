import { Module } from '@nestjs/common';
import { ClockModule } from './common/clock/clock.module';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ClockModule, PlayersModule],
})
export class AppModule {}
