import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../util";


export async function scrapeAmazonProduct(url: string) {
  if(!url) return

/*This sample code assumes the request-promise package is installed. If it is not installed run: "npm install request-promise"
require('request-promise')({
    url: 'http://lumtest.com/myip.json',
    proxy: 'http://brd-customer-hl_ed4dd356-zone-pricewise:v1k480fqst2n@brd.superproxy.io:22225',
    rejectUnauthorized: false,
    })
.then(function(data){ console.log(data); },
    function(err){ console.error(err); });
    */

  //Brightdata proxy config
  const username = String(process.env.BRIGHT_DATA_USERNAME)
  const password = String(process.env.BRIGHT_DATA_PASSWORD)
  const port =22225;
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`, // Correction ici
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  };

  try {
    //fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);

    //extract the title
    const title = $('#productTitle').text().trim();

    //extract the price
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('a.size.base .a-color-price'),
      $('.a-button-selected .a-color-base'),
  
    );
    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen')
    )
    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'Currently unavailable';

    const images = $('#imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}';

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'));
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');
    const description = extractDescription($);
    //Construct data object with scraped info
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      outOfStock: outOfStock,
      description: description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(currentPrice) || Number(originalPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      reviewsCount: Number(3)
    }
    console.log(data);
  } catch (error: any) {
    throw new Error(`Failed to scrape product : ${error.message}`)
  }

}
