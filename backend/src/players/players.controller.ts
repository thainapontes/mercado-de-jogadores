import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../app.setup';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerResponse } from './player.mapper';
import { PlayersService } from './players.service';

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Post()
  async create(
    @Body() dto: CreatePlayerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.players.create(dto);
    response.location(`${API_PREFIX}/players/${player.id}`);
    return player;
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return this.players.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ): Promise<PlayerResponse> {
    return this.players.update(id, dto);
  }

  @Patch(':id/condition')
  updateCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateConditionDto,
  ): Promise<PlayerResponse> {
    return this.players.updateCondition(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.players.remove(id);
  }
}
