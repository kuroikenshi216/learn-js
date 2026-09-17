import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

import { User } from "./User";

@Entity({ name: "products" })
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    price!: string;

    @Column({ type: "int", default: 0 })
    stock!: number;

    @ManyToOne(() => User, user => user.products, {
        nullable: true,
        onDelete: "SET NULL",
    })
    @JoinColumn({ name: "owner_id" })
    owner!: User | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
