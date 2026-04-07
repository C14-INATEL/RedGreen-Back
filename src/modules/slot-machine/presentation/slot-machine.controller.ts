import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SlotMachineService } from '../application/slot-machine.service';
import { CreateSlotMachineDto } from '../domain/dto/create-slot-machine.dto';
import { UpdateSlotMachineDto } from '../domain/dto/update-slot-machine.dto';
import { SlotMachineResponseDto } from '../domain/dto/slot-machine-response.dto';
import { AdminGuard } from '@core/guards/admin.guard';

@ApiTags('SlotMachine')
@Controller('slot/machine')
export class SlotMachineController {
  constructor(private readonly SlotMachineService: SlotMachineService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new slot machine' })
  @ApiCreatedResponse({ type: SlotMachineResponseDto })
  async Create(@Body() DTO: CreateSlotMachineDto) {
    return this.SlotMachineService.Create(DTO);
  }

  @Get()
  @ApiOperation({ summary: 'Get all slot machines' })
  @ApiOkResponse({ type: SlotMachineResponseDto, isArray: true })
  async FindAll() {
    return this.SlotMachineService.FindAll();
  }

  @Get(':Id')
  @ApiOperation({ summary: 'Get a slot machine by ID' })
  @ApiOkResponse({ type: SlotMachineResponseDto })
  async FindOne(@Param('Id') Id: string) {
    return this.SlotMachineService.FindOne(+Id);
  }

  @Put(':Id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update slot machine by ID' })
  @ApiOkResponse({ type: SlotMachineResponseDto })
  async Update(@Param('Id') Id: string, @Body() DTO: UpdateSlotMachineDto) {
    return this.SlotMachineService.Update(+Id, DTO);
  }

  @Patch(':Id/deactivate')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Toggle activation status of a slot machine by ID' })
  @ApiOkResponse({ type: SlotMachineResponseDto })
  async Deactivate(@Param('Id') Id: string) {
    return this.SlotMachineService.Deactivate(+Id);
  }

  @Delete(':Id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a slot machine by ID' })
  async Remove(@Param('Id') Id: string) {
    await this.SlotMachineService.Remove(+Id);
    return { message: 'Slot machine removed successfully' };
  }
}
