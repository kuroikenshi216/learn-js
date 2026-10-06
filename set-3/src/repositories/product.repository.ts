import { Between, FindOptionsOrder, FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

import { AppDataSource } from "../database/data-source";
import { Product } from "../entities/Product";
import { ListProductsQuery } from "../validators/product.validator";

export class ProductRepository {
    private get repo() {
        return AppDataSource.getRepository(Product);
    }

    findById(id: string) {
        return this.repo.findOneBy({ id });
    }

    findPaginated(query: ListProductsQuery) {
        const where: FindOptionsWhere<Product> = {};

        if (query.search) {
            where.name = ILike(`%${query.search}%`);
        }
        if (query.category) {
            where.category = query.category;
        }
        if (query.minPrice !== undefined && query.maxPrice !== undefined) {
            where.price = Between(query.minPrice, query.maxPrice);
        } else if (query.minPrice !== undefined) {
            where.price = MoreThanOrEqual(query.minPrice);
        } else if (query.maxPrice !== undefined) {
            where.price = LessThanOrEqual(query.maxPrice);
        }

        return this.repo.findAndCount({
            where,
            order: { [query.sortBy]: query.order } as FindOptionsOrder<Product>,
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        });
    }

    create(data: Partial<Product>) {
        return this.repo.save(this.repo.create(data));
    }

    save(product: Product) {
        return this.repo.save(product);
    }

    async remove(product: Product) {
        await this.repo.remove(product);
    }
}
