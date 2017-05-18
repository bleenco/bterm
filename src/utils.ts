import * as https from 'https';

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

  inject(): void {
    this.build();
    if (this.styleEl) { this.styleEl.remove(); }

    this.styleEl = document.createElement('style') as HTMLStyleElement;
    this.styleEl.setAttribute('type', 'text/css');
    this.styleEl.innerHTML = this.css;

    console.log(this.styleEl);
    setTimeout(() => document.querySelector('head').appendChild(this.styleEl));
  }
}
