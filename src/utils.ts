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
