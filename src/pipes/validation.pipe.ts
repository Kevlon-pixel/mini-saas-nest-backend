import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationException } from 'src/exceptions/validation.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const { metatype } = metadata;
    if (!metatype) {
      return value;
    }

    const obj = plainToInstance(metadata.metatype!, value);
    const errors = await validate(obj);

    if (errors.length) {
      let messages = errors.map((err) => {
        const constraints = err.constraints
          ? Object.values(err.constraints).join(', ')
          : 'значение невалидно';
        return `${err.property} - ${constraints}`;
      });
      throw new ValidationException(messages);
    }

    return obj;
  }
}
