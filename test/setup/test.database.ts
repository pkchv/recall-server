import { cloneDeep } from "lodash";
import { Connection, createConnection, getConnection } from "typeorm";

export class TestDatabase {
  public async createConnection(args?: any): Promise<Connection> {
    return await createConnection({
      database: ":memory:",
      dropSchema: true,
      logging: false,
      synchronize: true,
      type: "sqlite",
      ...cloneDeep(args),
    });
  }

  public async close(): Promise<void> {
    return getConnection().close();
  }
}
