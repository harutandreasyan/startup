import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GenerationsService } from './generations.service';

@Controller('generations')
@UseGuards(AuthGuard)
export class GenerationsController {
  constructor(private generationsService: GenerationsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() body: {
      type: string;
      model: string;
      prompt?: string;
      negativePrompt?: string;
      inputImageUrl?: string;
      params?: Record<string, unknown>;
    },
  ) {
    return this.generationsService.create(user.id, body);
  }

  // Save a finished client-side tool result (background removal, upscale) to the gallery.
  @Post('import')
  async importResult(
    @CurrentUser() user: any,
    @Body() body: { type: string; image: string; thumbnail?: string; prompt?: string },
  ) {
    return this.generationsService.importClientResult(user.id, body);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.generationsService.findAllByUser(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.generationsService.findOne(id, user.id);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.generationsService.delete(id, user.id);
  }
}
