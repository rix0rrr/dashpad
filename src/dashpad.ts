import open from 'open';
import { ISource } from './source/isource';
import type { ILaunchpad, Surface, Style } from 'launchpad.js';
import { Color, DashboardState, TabType } from './protocol';

const PRESSED_COLOR = { style: 'palette', color: 53 } as const;
const OFF = { style: 'off' } as const;

export interface DashPadOptions {
  readonly intervalSeconds: number;
  readonly source: ISource;
}

export async function dashPad(options: DashPadOptions) {
  // Unfortunately, 'launchpad.js' is ESM-only and I prefer
  // CommonJS. This is the only way to import ESM from CJS.
  const { autoDetect, Surface, waitForReady } = await import('launchpad.js');

  const lp = autoDetect();
  await waitForReady(lp);
  const dashboard = new Dashboard(lp, new Surface(lp));

  return new Promise(() => {
    async function doPoll() {
      try {
        const newState = await options.source.poll();
        dashboard.updateTo(newState);
      } catch (e: any) {
        console.error(e.message);
      }

      setTimeout(doPoll, options.intervalSeconds * 1000);
    }

    doPoll();
  });
}

class Dashboard {
  private state?: DashboardState;
  private selectedTab: number = 0;
  private readonly actions = new Map<string, string>();

  constructor(lp: ILaunchpad, private readonly surface: Surface) {
    lp.on('buttonDown', button => {
      // Reflect pressed buttons
      const action = this.actions.get(xyKey(button.xy));
      if (action) {
        this.surface.layer(1).set(button.xy, PRESSED_COLOR);
      }
    });
    lp.on('buttonUp', button => {
      this.surface.layer(1).set(button.xy, OFF);

      const action = this.actions.get(xyKey(button.xy));
      if (action) {
        open(action);
      }
    });
  }

  public updateTo(state: DashboardState) {
    this.selectedTab = Math.min(this.selectedTab, state.tabs.length - 1);
    this.state = state;
    this.actions.clear();
    this.render();
  }

  private render() {
    this.surface.layer(0).allOff();
    if (!this.state?.tabs) { return; }

    // TABS
    for (const [i, tab] of enumerate(this.state.tabs)) {
      if (8 <= i) { break; } // No more than 8 tabs for now

      const selected = this.selectedTab === i;
      const color = selected
        ? (tab.selectedColor ?? { type: 'solid', paletteColor: PRESSED_COLOR.color })
        : tab.color;

      this.surface.layer(0).set(i, 0, buttonStyle(color));
    }

    // Render current tab
    const tab = this.state.tabs[this.selectedTab];
    if (!tab) { return; }

    switch (tab.tabType) {
      case 'list':
        this.renderList(tab);
        break;
    }
  }

  private renderList(tab: Extract<TabType, { tabType: 'list' }>) {
    let x = 0;
    let y = 1;

    for (const button of tab.buttons) {
      this.surface.layer(0).set(x, y, buttonStyle(button.color));
      if (button.link) {
        this.actions.set(xyKey([x, y]), button.link);
      }

      x += 1;
      if (x > 7) {
        x = 0;
        y += 1;
      }
      if (y > 8) { break; }
    }
  }
}

function buttonStyle(c: Color): Style {
  switch (c.type) {
    case 'solid': return { style: 'palette', color: c.paletteColor };
    case 'flash': return { style: 'flash', color: c.paletteColor };
    case 'pulse': return { style: 'pulse', color: c.paletteColor };
    case 'rgb': return { style: 'rgb', rgb: [c.r, c.g, c.b] };
  }
}

function enumerate<A>(xs: A[]): Array<[number, A]> {
  const ret = new Array<[number, A]>();
  for (let i = 0; i < xs.length; i++) {
    ret.push([i, xs[i]]);
  }
  return ret;
}

function xyKey(x: [number, number]): string {
  return `${x}`;
}