import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "products" })
export class Product {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "text", nullable: true })
    description!: string | null;

    @Column({ type: "varchar", length: 100 })
    category!: string;

    // pg returns numeric columns as strings (to not lose precision), so turn it back into a number
    @Column({
        type: "numeric",
        precision: 10,
        scale: 2,
        transformer: { to: (value: number) => value, from: (value: string) => Number(value) },
    })
    price!: number;

    @Column({ type: "int", default: 0 })
    stock!: number;

    @Column({ name: "image_url", type: "varchar", length: 500, nullable: true })
    imageUrl!: string | null;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt!: Date;
}
