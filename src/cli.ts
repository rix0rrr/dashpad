import * as yargs from 'yargs';
import { main } from './main';

async function cli() {
  yargs
    .env('DASHPAD')
    .command(
      ['$0 SOURCE', 'monitor SOURCE'],
      'Monitor a command or URL to feed the Launchpad',
      (opts) => opts
        .option('interval', {
          alias: 'i',
          type: 'number',
          description: 'Wait time between polls, in seconds',
          requiresArg: true,
          default: 60,
        })
        .positional('SOURCE', {
          type: 'string',
          description: 'Dashboard source (file, URL or !command)',
        })
        .demandOption('SOURCE'),
      async (argv) => {
        await main({
          intervalSeconds: argv.interval,
          source: argv.SOURCE,
        });
      },
    )
    .strict()
    .argv;
}

cli().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
