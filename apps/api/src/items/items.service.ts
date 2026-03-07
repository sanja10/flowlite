import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto, MoveItemDto, UpdateItemDto } from './dto';
import { EventType } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  private async assertBoardOwner(ownerId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board || board.archivedAt)
      throw new NotFoundException('Board not found');
    if (board.ownerId !== ownerId) throw new ForbiddenException();
    return board;
  }

  async list(ownerId: string, boardId: string) {
    await this.assertBoardOwner(ownerId, boardId);

    return this.prisma.item.findMany({
      where: { boardId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        boardId: true,
        statusId: true,
        title: true,
        dueAt: true,
        note: true,
        tag: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(ownerId: string, boardId: string, dto: CreateItemDto) {
    await this.assertBoardOwner(ownerId, boardId);

    // Default status: first non-done status by order
    const firstStatus = await this.prisma.status.findFirst({
      where: { boardId, isDone: false },
      orderBy: { order: 'asc' },
    });
    if (!firstStatus)
      throw new NotFoundException('No statuses found for board');

    const item = await this.prisma.item.create({
      data: {
        boardId,
        statusId: firstStatus.id,
        title: dto.title,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        note: dto.note,
        tag: dto.tag,
      },
      select: {
        id: true,
        boardId: true,
        statusId: true,
        title: true,
        dueAt: true,
        note: true,
        tag: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.prisma.event.create({
      data: {
        boardId,
        itemId: item.id,
        type: EventType.ITEM_CREATED,
        toStatusId: item.statusId,
        metadata: { title: item.title },
      },
    });

    return item;
  }

  async update(
    ownerId: string,
    boardId: string,
    itemId: string,
    dto: UpdateItemDto,
  ) {
    await this.assertBoardOwner(ownerId, boardId);

    const existing = await this.prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!existing || existing.boardId !== boardId || existing.archivedAt)
      throw new NotFoundException('Item not found');

    if (dto.statusId) {
      const status = await this.prisma.status.findUnique({
        where: { id: dto.statusId },
      });
      if (!status || status.boardId !== boardId)
        throw new NotFoundException('Status not found');
    }

    const updated = await this.prisma.item.update({
      where: { id: itemId },
      data: {
        title: dto.title ?? undefined,
        dueAt:
          dto.dueAt === null
            ? null
            : dto.dueAt
              ? new Date(dto.dueAt)
              : undefined,
        note: dto.note === null ? null : (dto.note ?? undefined),
        tag: dto.tag === null ? null : (dto.tag ?? undefined),
        statusId: dto.statusId ?? undefined,
      },
      select: {
        id: true,
        boardId: true,
        statusId: true,
        title: true,
        dueAt: true,
        note: true,
        tag: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.prisma.event.create({
      data: {
        boardId,
        itemId: updated.id,
        type: EventType.ITEM_UPDATED,
        metadata: { fields: Object.keys(dto) },
      },
    });

    return updated;
  }

  async move(
    ownerId: string,
    boardId: string,
    itemId: string,
    dto: MoveItemDto,
  ) {
    await this.assertBoardOwner(ownerId, boardId);

    const item = await this.prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.boardId !== boardId || item.archivedAt)
      throw new NotFoundException('Item not found');

    const toStatus = await this.prisma.status.findUnique({
      where: { id: dto.statusId },
    });
    if (!toStatus || toStatus.boardId !== boardId)
      throw new NotFoundException('Status not found');

    if (item.statusId === dto.statusId) return item;

    const updated = await this.prisma.item.update({
      where: { id: itemId },
      data: { statusId: dto.statusId },
      select: {
        id: true,
        boardId: true,
        statusId: true,
        title: true,
        dueAt: true,
        note: true,
        tag: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.prisma.event.create({
      data: {
        boardId,
        itemId: updated.id,
        type: EventType.ITEM_MOVED,
        fromStatusId: item.statusId,
        toStatusId: dto.statusId,
      },
    });

    return updated;
  }

  async remove(ownerId: string, boardId: string, itemId: string) {
    await this.assertBoardOwner(ownerId, boardId);

    const item = await this.prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.boardId !== boardId || item.archivedAt)
      throw new NotFoundException('Item not found');

    const updated = await this.prisma.item.update({
      where: { id: itemId },
      data: { archivedAt: new Date() },
      select: { id: true },
    });

    await this.prisma.event.create({
      data: {
        boardId,
        itemId,
        type: EventType.ITEM_DELETED,
      },
    });

    return updated;
  }
}
