import * as child_process from 'child_process';
import { DashboardState } from '../protocol';
import { validateDashboardState } from '../validate';
import { ISource } from './isource';

export class ShellSource implements ISource {
  constructor(private readonly command: string) {
  }

  public async poll(): Promise<DashboardState> {
    const output = await shell(this.command);
    const data = JSON.parse(output);
    return validateDashboardState(data);
  }
}

/**
 * OS helpers
 *
 * Shell function which both prints to stdout and collects the output into a
 * string.
 */
export async function shell(command: string): Promise<string> {
  return new Promise((ok, ko) => {
    child_process.exec(command, {}, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        ko(error);
        return;
      }

      ok(stdout);
    });
  });
}
