import { Inject, Service } from "typedi";
import { createConnection, getConnection, getConnectionOptions } from "typeorm";

import { Environment } from "../common/environment";

@Service("schema-provider.service")
export class SchemaProviderService {
  constructor(
    @Inject("environment") private readonly env: Environment,
  ) {}

  public async getConnection(userId: number) {

    // TODO: make it less hacky
    if (this.env.get("NODE_ENV") === "test") {
      return getConnection();
    }

    const schema = this.env.getOrFail("DB_USER_SCHEMA_PREFIX") + userId.toString(10);

    try {
      return getConnection(schema);
    } catch (error) {
      const connectionOptions = await getConnectionOptions();
      Object.assign(connectionOptions, { schema });
      Object.assign(connectionOptions, { name: schema });
      return createConnection(connectionOptions);
    }
  }
}
