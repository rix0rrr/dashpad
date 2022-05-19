import * as https from 'https';
import { DashboardState } from '../protocol';
import { validateDashboardState } from '../validate';
import { ISource } from './isource';

export class UrlSource implements ISource {
  constructor(private readonly url: string) {
  }

  public poll(): Promise<DashboardState> {
    return new Promise<DashboardState>((ok, ko) => {
      const req = https.get(this.url, {
      }, res => {
        if (res.statusCode === 200) {
          res.setEncoding('utf8');
          const chunks: string[] = [];

          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            try {
              const data = JSON.parse(chunks.join(''));
              ok(validateDashboardState(data));
            } catch (e) {
              ko(e);
            }
          });
          res.on('error', ko);
        } else {
          ko(new Error(`HTTP call failed: ${res.statusCode}`));
        }
      });
      req.on('error', ko);
    });
  }
}