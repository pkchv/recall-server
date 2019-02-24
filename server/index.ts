import './common/env';
import "reflect-metadata";
import { createConnection } from "typeorm";
import Server from './common/server';
import routes from './routes';


createConnection().then(connection => {
  const port = parseInt(process.env.PORT)

  new Server()
    .router(routes)
    .listen(port)
})
