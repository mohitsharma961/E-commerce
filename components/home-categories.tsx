import Link from "next/link";
import Image from "next/image";
import getCategories from "@/actions/get-categories";
import getProducts from "@/actions/get-products";
import { Category } from "@/types";

const HomeCategories = async () => {
  const categories: Category[] = await getCategories();

  const categoriesWithProducts = await Promise.all(
    categories.map(async (c) => {
      const products = await getProducts({ categoryId: c.id });
      return { ...c, products: products.slice(0, 3) };
    })
  );

  if (!categoriesWithProducts || categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <section className="my-8">
      <h3 className="font-semibold text-2xl mb-4">Shop by category</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categoriesWithProducts.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className="relative group block h-48 rounded-lg overflow-hidden shadow-md"
          >
            <Image
              src={cat.billboard?.imageUrl || "/images/nike-reactx.png"}
              alt={cat.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div>
                <h4 className="text-white font-bold text-lg">{cat.name}</h4>
                <div className="flex gap-2 mt-2">
                  {cat.products?.map((p: any) => (
                    <div
                      key={p.id}
                      className="w-10 h-10 rounded overflow-hidden border-2 border-white/60"
                    >
                      <Image
                        src={p.images?.[0]?.url || "/images/nike-reactx.png"}
                        alt={p.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeCategories;
