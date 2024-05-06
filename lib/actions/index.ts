import Product from "../models/product.model";
import { connectTodb } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../util";
import { revalidatePath } from "next/cache";

export async function scrapeAndStoreProduct(productURL: string) {
  if (!productURL) return;

  try {
    connectTodb();
    const scrapedProduct: any = await scrapeAmazonProduct(productURL);
    
    if (!scrapedProduct) {
      console.log("Failed to scrape product");
      return; // Stop execution if product scraping failed
    }
    let product = scrapedProduct;

    // Check if scrapedProduct is an object and has a url property
    if (typeof scrapedProduct === 'object' && scrapedProduct !== null && 'url' in scrapedProduct) {
      const existingProduct = await Product.findOne({ url: scrapedProduct.url });
      if (existingProduct) {
        const updatedPriceHistory : any = [
          ...existingProduct.priceHistory,
          { price: scrapedProduct.currentPrice }
        ];
        product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory)

        }
      }
    }
    const newProduct = await Product.findOneAndUpdate(
      {url: scrapedProduct.url},
      product,
      {upsert: true, new:true}
      );
      revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`)
  }
}
