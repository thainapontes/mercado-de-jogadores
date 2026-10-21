import { Module } from '@nestjs/common';
import { ClubsModule } from './clubs/clubs.module';
import { ClockModule } from './common/clock/clock.module';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ClockModule, PlayersModule, ClubsModule],
})
export class AppModule {}
