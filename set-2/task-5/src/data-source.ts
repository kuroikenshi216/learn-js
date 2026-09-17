import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";

import { User } from "./entity/User";
import { Product } from "./entity/Product";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? "postgres",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "ct_task5",

    // Schema changes only ever happen through migrations, never by TypeORM
    // silently altering tables to match the entities on every boot.
    synchronize: false,
    logging: true,

    entities: [User, Product],
    migrations: ["src/migrations/*.ts"],
});
