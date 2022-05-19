import { Validator } from 'jsonschema';
import { DashboardState } from './protocol';
import schema from './schema.json';

export function validateDashboardState(x: unknown): DashboardState {
  const v = new Validator();
  const result = v.validate(x, schema as any);
  if (!result.valid) {
    throw new Error(`Output does not match protocol\n${result}`);
  }
  return x as DashboardState;
}