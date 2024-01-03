import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifyDto } from './verify.dto';

@ApiTags('verify')
@Controller({
  path: 'verify',
  version: '1',
})
export class VerifyController {
  constructor() {}

  @Post()
  @ApiOperation({ summary: 'Verify contract' })
  async create(@Body() data: VerifyDto) {
    // const data = await this.userService.create({ ...createUserDto });
    return { data };
  }
}
