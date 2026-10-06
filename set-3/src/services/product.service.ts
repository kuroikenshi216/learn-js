import { Product } from "../entities/Product";
import { AppError } from "../errors/app-error";
import { redis } from "../lib/redis";
import { ProductRepository } from "../repositories/product.repository";
import { getCache, setCache } from "../utils/cache";
import { CreateProductInput, ListProductsQuery, UpdateProductInput } from "../validators/product.validator";

const LIST_TTL_SECONDS = 60;
const ITEM_TTL_SECONDS = 300;

// bumping this number makes every cached list key outdated at once,
// without having to find and delete each one
const LIST_VERSION_KEY = "products:list:version";

type ProductList = {
    data: Product[];
    meta: { page: number; limit: number; total: number; totalPages: number };
};

export class ProductService {
    constructor(private productRepository: ProductRepository) {}

    async list(query: ListProductsQuery) {
        const version = (await redis.get(LIST_VERSION_KEY)) ?? "0";
        const cacheKey = `products:list:v${version}:${JSON.stringify(query)}`;

        const cached = await getCache<ProductList>(cacheKey);
        if (cached) {
            return cached;
        }

        const [products, total] = await this.productRepository.findPaginated(query);
        const result: ProductList = {
            data: products,
            meta: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };

        await setCache(cacheKey, result, LIST_TTL_SECONDS);
        return result;
    }

    async getById(id: string) {
        const cached = await getCache<Product>(`products:${id}`);
        if (cached) {
            return cached;
        }

        const product = await this.findOrFail(id);
        await setCache(`products:${id}`, product, ITEM_TTL_SECONDS);
        return product;
    }

    async create(input: CreateProductInput) {
        const product = await this.productRepository.create(input);
        await this.invalidate();
        return product;
    }

    async update(id: string, input: UpdateProductInput) {
        const product = await this.findOrFail(id);
        Object.assign(product, input);

        const saved = await this.productRepository.save(product);
        await this.invalidate(id);
        return saved;
    }

    async setImageUrl(id: string, imageUrl: string) {
        const product = await this.findOrFail(id);
        product.imageUrl = imageUrl;

        const saved = await this.productRepository.save(product);
        await this.invalidate(id);
        return saved;
    }

    async delete(id: string) {
        const product = await this.findOrFail(id);
        await this.productRepository.remove(product);
        await this.invalidate(id);
    }

    // reads straight from the DB - used before writes so we never update a stale cached copy
    private async findOrFail(id: string) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new AppError(404, "Product not found");
        }
        return product;
    }

    private async invalidate(id?: string) {
        await redis.incr(LIST_VERSION_KEY);
        if (id) {
            await redis.del(`products:${id}`);
        }
    }
}
