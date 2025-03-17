import { Module } from '@nestjs/common';
import { X11Service } from './x11.service';

@Module({
  providers: [X11Service],
  exports: [X11Service],
})
export class X11Module {}
