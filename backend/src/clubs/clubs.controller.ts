import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../app.setup';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ClubDetailResponse, ClubResponse } from './club.mapper';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { ListClubsQueryDto, toClubSort } from './dto/list-clubs.query';

@ApiTags('clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Post()
  async create(
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.clubs.create(dto);
    response.location(`${API_PREFIX}/clubs/${club.id}`);
    return club;
  }

  @Get()
  list(@Query() query: ListClubsQueryDto): Promise<ClubResponse[]> {
    return this.clubs.list(toClubSort(query));
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<ClubDetailResponse> {
    return this.clubs.findOne(id);
  }
}
