import { getInstagramPosts } from './instagram';
import { parseInstagramCaption } from './parser';
import { redis } from './redis';

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  isSold: boolean;
  isAnnouncement: boolean;
  isManual?: boolean;
  condition?: string;
  measurements?: { n: number; d: number };
  description?: string;
  post?: any;
};

export async function getAllProducts(): Promise<Product[]> {
  try {
    // 1. Fetch Instagram posts
    const posts = await getInstagramPosts();
    
    // 2. Fetch Redis overrides and manual products
    let overrides: Record<string, string> = {};
    let manualProducts: Product[] = [];
    
    if (redis) {
      overrides = await redis.hgetall('product_overrides') || {};
      const manuals = await redis.lrange('manual_products', 0, -1);
      manualProducts = manuals.map(m => {
        const parsed = JSON.parse(m);
        return {
          ...parsed,
          isManual: true,
          isAnnouncement: false, // Manual products are always products
        };
      });
    }

    // 3. Map Instagram posts
    const igProducts = posts.map((post: any) => {
      const id = post.id;
      
      const parsed = parseInstagramCaption(post.caption || "");
      
      const defaultIsSold = parsed.isSold;
      const defaultIsAnnouncement = parsed.isAnnouncement;

      // Apply overrides if exist
      const overrideStr = overrides[id];
      const override = overrideStr ? JSON.parse(overrideStr) : {};

      return {
        id,
        name: override.name !== undefined ? override.name : parsed.name,
        price: override.price !== undefined ? override.price : parsed.price,
        image: post.media_url,
        isSold: override.isSold !== undefined ? override.isSold : defaultIsSold,
        isAnnouncement: defaultIsAnnouncement,
        condition: parsed.condition,
        measurements: parsed.measurements,
        description: parsed.description,
        post: post
      };
    });

    // 4. Combine and sort (put manual products at the top for visibility, or mix them)
    return [...manualProducts, ...igProducts];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
}
