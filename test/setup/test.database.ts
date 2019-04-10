import { cloneDeep } from "lodash";
import { Connection, ConnectionOptions, createConnection, getConnection } from "typeorm";

export const connectionOptions: ConnectionOptions = {
  database: ":memory:",
  dropSchema: true,
  logging: false,
  synchronize: true,
  type: "sqlite",
};

export class TestDatabase {
  public async createConnection(args?: any): Promise<Connection> {
    return await createConnection({
      ...connectionOptions,
      ...cloneDeep(args),
    });
  }

  public async close(): Promise<void> {
    return getConnection().close();
  }
}
