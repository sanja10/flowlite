import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUserId } from '../auth/user.decorator';
import { CreateItemDto, MoveItemDto, UpdateItemDto } from './dto';
import { ItemsService } from './items.service';

@ApiTags('items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/items')
export class ItemsController {
  constructor(private items: ItemsService) {}

  @Get()
  list(@CurrentUserId() userId: string, @Param('boardId') boardId: string) {
    return this.items.list(userId, boardId);
  }

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Param('boardId') boardId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.items.create(userId, boardId, dto);
  }

  @Patch(':itemId')
  update(
    @CurrentUserId() userId: string,
    @Param('boardId') boardId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.items.update(userId, boardId, itemId, dto);
  }

  @Post(':itemId/move')
  move(
    @CurrentUserId() userId: string,
    @Param('boardId') boardId: string,
    @Param('itemId') itemId: string,
    @Body() dto: MoveItemDto,
  ) {
    return this.items.move(userId, boardId, itemId, dto);
  }

  @Delete(':itemId')
  remove(
    @CurrentUserId() userId: string,
    @Param('boardId') boardId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.items.remove(userId, boardId, itemId);
  }
}
