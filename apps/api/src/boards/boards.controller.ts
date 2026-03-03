import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUserId } from '../auth/user.decorator';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto';

@ApiTags('boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boards: BoardsService) {}

  @Get()
  list(@CurrentUserId() userId: string) {
    return this.boards.list(userId);
  }

  @Post()
  create(@CurrentUserId() userId: string, @Body() dto: CreateBoardDto) {
    return this.boards.createFromTemplate(userId, dto.name, dto.templateKey);
  }

  @Get(':id')
  get(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.boards.get(userId, id);
  }
}
