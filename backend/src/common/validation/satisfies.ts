import { ValidateBy, ValidationArguments } from 'class-validator';

export function Satisfies<T extends object>(
  name: string,
  isValid: (value: unknown, object: T) => boolean,
  message: string,
): PropertyDecorator {
  return ValidateBy(
    {
      name,
      validator: {
        validate: (value: unknown, args?: ValidationArguments) =>
          isValid(value, args?.object as T),
      },
    },
    { message },
  );
}
