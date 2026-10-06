import "reflect-metadata";
import { DataSource } from "typeorm";

import { env } from "../config/env";
import { Order } from "../entities/Order";

export const AppDataSource = new DataSource({
    type: "postgres",
    ...env.db,

    synchronize: false,
    logging: ["error"],

    entities: [Order],
    migrations: [__dirname + "/migrations/*.{ts,js}"],
});
