import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export const ORDER_STEPS = ["processing", "packed", "shipped", "delivered"] as const;

export type OrderStatus = "pending" | (typeof ORDER_STEPS)[number] | "failed";

@Entity({ name: "orders" })
export class Order {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    item!: string;

    @Column({ type: "int" })
    quantity!: number;

    @Column({ type: "varchar", length: 255 })
    email!: string;

    @Column({ type: "varchar", length: 20, default: "pending" })
    status!: OrderStatus;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt!: Date;
}
