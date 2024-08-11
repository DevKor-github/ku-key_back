import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsTimeConstraint implements ValidatorConstraintInterface {
  validate(time: string) {
    const regex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    return regex.test(time);
  }

  defaultMessage() {
    return 'Time must be in the format HH:MM:SS';
  }
}

export function IsTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTimeConstraint,
    });
  };
}
