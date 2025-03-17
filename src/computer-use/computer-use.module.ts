import { Module } from '@nestjs/common';
import { ComputerUseController } from './computer-use.controller';
import { ComputerUseService } from './computer-use.service';
import { X11Module } from '../x11/x11.module';

@Module({
  imports: [X11Module],
  controllers: [ComputerUseController],
  providers: [ComputerUseService],
  exports: [ComputerUseService],
})
export class ComputerUseModule {}
