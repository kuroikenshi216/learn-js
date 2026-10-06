import "reflect-metadata";
import { DataSource } from "typeorm";

import { env } from "../config/env";
import { Product } from "../entities/Product";
import { RefreshToken } from "../entities/RefreshToken";
import { User } from "../entities/User";

export const AppDataSource = new DataSource({
    type: "postgres",
    ...env.db,

    synchronize: false,
    logging: ["error"],

    entities: [User, RefreshToken, Product],
    migrations: [__dirname + "/migrations/*.{ts,js}"],
});
