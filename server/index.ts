import './common/env';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { App } from './common/server';
import routes from './routes';

createConnection().then(() => {
  const port = parseInt(process.env.PORT, 10);

  new App()
    .router(routes)
    .listen(port);
});
