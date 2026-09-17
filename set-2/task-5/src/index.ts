import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Product } from "./entity/Product";

async function main(): Promise<void> {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const productRepo = AppDataSource.getRepository(Product);

    let user = await userRepo.findOneBy({ email: "ada@example.com" });

    if (!user) {
        user = userRepo.create({
            name: "Ada Lovelace",
            email: "ada@example.com",
        });
        await userRepo.save(user);
        console.log("Created user:", user);
    } else {
        console.log("Found existing user:", user);
    }

    const product = productRepo.create({
        name: "Mechanical Keyboard",
        price: "4999.00",
        stock: 25,
        owner: user,
    });
    await productRepo.save(product);
    console.log("Created product:", product);

    const productsWithOwners = await productRepo.find({
        relations: { owner: true },
    });
    console.log("\nAll products with owners:");
    console.log(productsWithOwners);

    await AppDataSource.destroy();
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
