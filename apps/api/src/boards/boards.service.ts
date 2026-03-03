import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TEMPLATES } from '@flowlite/shared';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async list(ownerId: string) {
    return this.prisma.board.findMany({
      where: { ownerId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        templateKey: true,
        stuckDays: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async get(ownerId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { statuses: { orderBy: { order: 'asc' } } },
    });
    if (!board || board.archivedAt)
      throw new NotFoundException('Board not found');
    if (board.ownerId !== ownerId) throw new ForbiddenException();

    return board;
  }

  async createFromTemplate(ownerId: string, name: string, templateKey: string) {
    const template = TEMPLATES.find((t) => t.key === templateKey);
    if (!template) throw new BadRequestException('Invalid templateKey');

    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          ownerId,
          name,
          templateKey: template.key,
          stuckDays: template.defaultStuckDays,
        },
        select: {
          id: true,
          name: true,
          templateKey: true,
          stuckDays: true,
          createdAt: true,
        },
      });

      await tx.status.createMany({
        data: template.statuses.map(
          (s: { name: string; order: number; isDone: boolean }) => ({
            boardId: board.id,
            name: s.name,
            order: s.order,
            isDone: s.isDone,
          }),
        ),
      });

      return board;
    });
  }
}
