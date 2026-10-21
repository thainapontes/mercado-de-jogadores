import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../app.setup';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateMatchDto } from './dto/create-match.dto';
import {
  ListMatchesQueryDto,
  toMatchClubFilter,
} from './dto/list-matches.query';
import { MatchResponse, MatchSummaryResponse } from './match.mapper';
import { MatchesService } from './matches.service';

@ApiTags('league')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Post()
  async create(
    @Body() dto: CreateMatchDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchResponse> {
    const match = await this.matches.create(dto);
    response.location(`${API_PREFIX}/matches/${match.id}`);
    return match;
  }

  @Get()
  list(@Query() query: ListMatchesQueryDto): Promise<MatchSummaryResponse[]> {
    return this.matches.list(toMatchClubFilter(query));
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<MatchResponse> {
    return this.matches.findOne(id);
  }
}
