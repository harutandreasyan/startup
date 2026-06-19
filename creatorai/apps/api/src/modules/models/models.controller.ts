import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('models')
export class ModelsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('type') type?: string) {
    return this.prisma.aiModel.findMany({
      where: {
        active: true,
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.prisma.aiModel.findUniqueOrThrow({
      where: { slug },
    });
  }
}
