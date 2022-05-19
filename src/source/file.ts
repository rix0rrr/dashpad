import { promises as fs } from 'fs';
import { DashboardState } from '../protocol';
import { validateDashboardState } from '../validate';
import { ISource } from './isource';

export class FileSource implements ISource {
  constructor(private readonly fileName: string) {
  }

  public async poll(): Promise<DashboardState> {
    const contents = await fs.readFile(this.fileName, { encoding: 'utf-8' });
    const parsed = JSON.parse(contents);
    return validateDashboardState(parsed);
  }
}
