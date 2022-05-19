import { dashPad } from './dashpad';
import { FileSource } from './source/file';
import { ISource } from './source/isource';
import { ShellSource } from './source/shell';
import { UrlSource } from './source/url';

export interface MainOptions {
  readonly intervalSeconds: number;
  readonly source: string;
}

export async function main(options: MainOptions) {
  let source: ISource;

  if (options.source.startsWith('!')) {
    source = new ShellSource(options.source.substring(1));
  } else if (options.source.match(/^https?:/)) {
    source = new UrlSource(options.source);
  } else {
    source = new FileSource(options.source);
  }

  await dashPad({
    intervalSeconds: options.intervalSeconds,
    source,
  });
}
