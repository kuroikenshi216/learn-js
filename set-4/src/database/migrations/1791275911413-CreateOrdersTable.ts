import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrdersTable1791275911413 implements MigrationInterface {
    name = 'CreateOrdersTable1791275911413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "item" character varying(255) NOT NULL, "quantity" integer NOT NULL, "email" character varying(255) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "orders"`);
    }

}
