import { TransformFnParams } from 'class-transformer';

// Function to handle non numeric value
export function toNumeric({ value }: TransformFnParams): number | undefined {
  if (typeof value !== 'string') {
    return value; // Return as is if not a string
  }
  const cleanedValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  const parsedValue = parseFloat(cleanedValue);
  return isNaN(parsedValue) ? undefined : parsedValue; // Return undefined if parsing results in NaN
}
