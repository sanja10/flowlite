import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TEMPLATES } from '@flowlite/shared';

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
  @Get()
  list() {
    return TEMPLATES;
  }
}
