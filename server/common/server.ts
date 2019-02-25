import { Application, default as express } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';
import os from 'os';
import cookieParser from 'cookie-parser';
import swagger from './swagger';
import { logger } from './logger';

export class App {

  private app: Application;

  constructor() {
    const app = express();
    const root = path.normalize(`${__dirname}/../..`);
    app.set('appPath', path.resolve(root, 'client'));
    app.use(bodyParser.json({
      limit: process.env.REQUEST_LIMIT || '100kb',
    }));
    app.use(bodyParser.urlencoded({
      extended: true, limit: process.env.REQUEST_LIMIT || '100kb',
    }));
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(express.static(path.resolve(root, 'public')));
    this.app = app;
  }

  router(routes: (app: Application) => void): App {
    swagger(this.app, routes);
    return this;
  }

  listen(port: string | number = process.env.PORT): Application {
    const welcome = (port: string | number) => {
      return () => {
        return logger.info(`up and running in ${process.env.NODE_ENV || 'development'}`
          + `@: ${os.hostname()} on port: ${port}}`);
      };
    };

    http.createServer(this.app)
      .listen(port, welcome(port));

    return this.app;
  }
}
