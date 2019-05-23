import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as pathToSwaggerUi from 'swagger-ui-dist';
import { aliCloudFCHandler } from './utils';

const port = 3000;

const app = express();

const functionParh = path.join(process.cwd(), './src/function');

const fileList = fs.readdirSync(functionParh);

fileList.forEach(async (file: string) => {
  if (file.indexOf('.ts') !== -1) {
    const name = file.substr(0, file.lastIndexOf('.'));
    fs.readFileSync(path.join(process.cwd(), './.env'), 'utf8')
      .split('\n')
      .map((p: string) => {
        return p.split('=');
      })
      .filter((p: string[]) => {
        return p.length === 2;
      })
      .forEach((p: string[]) => {
        process.env[p[0]] = p[1];
      });
    const func = await import(path.join(functionParh, file));
    app.all(`/${name}`, (req: express.Request, res: express.Response) => {
      if (func.config.methods.indexOf(req.method) !== -1) {
        const funcHandler = func.handler as aliCloudFCHandler;
        funcHandler(
          {
            url: req.url,
            headers: req.headers,
            method: req.method,
            path: req.path,
            queries: req.query,
          },
          {
            setStatusCode: (code: number) => {
              res.statusCode = code;
            },
            send: (result: string) => {
              res.send(result);
            },
          },
          {
            requestId: 'request-id',
            credentials: {
              accessKeyId: '1',
              accessKeySecret: '2',
              securityToken: '2',
            },
          }
        );
      } else {
        res.statusCode = 405;
        res.send('Method Not Allowed');
      }
    });
  }
});

app.get('/', (_: express.Request, res: express.Response) => {
  res.statusCode = 404;
  res.send('Not Found');
});

app.use('/api-docs/swagger', express.static(pathToSwaggerUi.getAbsoluteFSPath()));

app.listen(port, '0.0.0.0');
