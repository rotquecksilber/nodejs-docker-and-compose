import { Injectable } from '@nestjs/common';

@Injectable()
export class StringSanitizerService {
  toLowerCase(value: string): string {
    return value.toLowerCase();
  }
}
