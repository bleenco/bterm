import * as https from 'https';

declare var Promise: any;

export function checkNewVersion(options: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(options, (resp) => {
      let body = '';
      resp.on('data', (chunk) => body += chunk);
      resp.on('end', () => {
        let parsed = JSON.parse(body);
        resolve(parsed.message);
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

export function getExtraMargin(osPlatform, winInLine, positionOnLine, isHeight): number {
  let extraMargin = 0;
  if (osPlatform === 'darwin' && isHeight) {
    if (winInLine === 0 && positionOnLine === 0) {
      extraMargin = 23;
    }
  }
  return  extraMargin;
}

export interface WindowPosition {
    screenSize: any;
    widthLines: number;
    heightLines: number;
    width: number;
    height: number;
}

interface ICSSRule {
  selector: string;
  rule: string;
};

export class CssBuilder {
  css: string;
  rules: ICSSRule[];
  styleEl: HTMLStyleElement;

  constructor() {
    this.rules = [];
  }

  has(selector: string): boolean {
    return this.rules.filter((rule: ICSSRule) => rule.selector === selector).length > 0;
  }

  find(selector: string): number {
    let index: number = -1;
    [].forEach.call(this.rules, (rule: ICSSRule, i: number) => {
      if (rule.selector === selector) { index = i; }
    });

    return index;
  }

  clear(): CssBuilder { this.rules = []; return this; }

  remove(selector: string): void {
    let pos: number = this.find(selector);
    if (!pos) { return; }

    this.rules.splice(pos, 1);
  }

  add(selector: string, rule: string): CssBuilder {
    let newRule: ICSSRule = { selector: selector, rule: rule };
    this.rules.push(newRule);
    return this;
  }

  build(): void {
    this.css = '';
    this.rules.forEach((rule: ICSSRule) => {
      this.css += `${rule.selector} { ${rule.rule} }` + '\n';
    });
  }

  toString() {
    this.build();
    return this.css;
  }

  inject(seamless: boolean = true): void {
    this.build();
    if (!seamless && this.styleEl) { this.styleEl.remove(); }

    let newStyle: HTMLStyleElement = document.createElement('style') as HTMLStyleElement;
    newStyle.setAttribute('type', 'text/css');
    newStyle.innerHTML = this.css;

    document.querySelector('head').appendChild(newStyle);
    if (this.styleEl) { this.styleEl.remove(); }
    this.styleEl = newStyle;
  }
}
