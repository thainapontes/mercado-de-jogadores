import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { UpdateLineupDto } from './dto/update-lineup.dto';
import { LineupResponse } from './lineup.mapper';
import { LineupService } from './lineup.service';

@ApiTags('league')
@Controller('clubs/:id/lineup')
export class LineupController {
  constructor(private readonly lineup: LineupService) {}

  @Get()
  findOne(@Param('id', ParseIdPipe) id: number): Promise<LineupResponse> {
    return this.lineup.findOne(id);
  }

  @Put()
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateLineupDto,
  ): Promise<LineupResponse> {
    return this.lineup.update(id, dto);
  }
}
