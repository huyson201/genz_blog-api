import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (args.constraints.length <= 0) return true;

    return args.constraints.every((relatedPropertyName) => {
      const relatedValue = (args.object as any)[relatedPropertyName as string];
      return value === relatedValue;
    });
  }

  defaultMessage(args?: ValidationArguments): string {
    return args.property + ' must match ' + args.constraints[0];
  }
}
