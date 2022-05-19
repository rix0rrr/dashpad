import { DashboardState } from '../protocol';

export interface ISource {
  poll(): Promise<DashboardState>;
}