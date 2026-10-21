import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StandingResponse } from './match.mapper';
import { MatchesService } from './matches.service';

@ApiTags('league')
@Controller('standings')
export class StandingsController {
  constructor(private readonly matches: MatchesService) {}

  @Get()
  list(): Promise<StandingResponse[]> {
    return this.matches.standings();
  }
}
