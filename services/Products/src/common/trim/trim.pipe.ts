import { PipeTransform, Injectable } from '@nestjs/common';

type TrimmedValue = string | object | TrimmedValue[];

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown): TrimmedValue {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value.map((element) => this.transform(element));
    }

    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          value[key] = this.transform(value[key]);
        }
      }
    }

    return value as TrimmedValue;
  }
}
