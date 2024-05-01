// Import necessary libraries
const axios = require("axios"); // For making HTTP requests
const fs = require("fs"); // For file system operations
const cheerio = require("cheerio"); // For web scraping

// Target website URL
const url =
  "https://www.amazon.ae/gp/movers-and-shakers/home/ref=zg_bsms_home_sm";
const parsedUrl = new URL(url);
const host = "https://" + parsedUrl.host; // Extracting host from URL

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to fetch data from the website
async function fetchData() {
  // Using Axios to fetch data from the website
  const response = await axios(url);
  // Parsing the fetched data with Cheerio
  const $ = cheerio.load(response.data);

  // Selecting div with class "p13n-sc-uncoverable-faceout"
  const uncoverableDiv = $(".p13n-sc-uncoverable-faceout");

  // Finding anchor tags with class "a-link-normal" inside the div
  const link = uncoverableDiv.find(".a-link-normal");

  const hrefs = [];
  // Extracting href attribute from anchor tags
  link.each((index, element) => {
    const href = $(element).attr("href");
    // Filtering out duplicate links and links starting with '/product-reviews'
    if (!hrefs.includes(host + href) && !href.startsWith("/product-reviews")) {
      hrefs.push(host + href);
    }
  });

  // Returning the extracted hrefs
  return hrefs;
}

// Function to get best seller ranks
async function getBestSellerRank(links) {
  const ranks = [];
  // Iterating through each link to get product categories
  for (const link of links) {
    const response = await axios(link);
    const $ = cheerio.load(response.data);
    const productDetailsHTML = $("#wayfinding-breadcrumbs_container");
    const productCategory = productDetailsHTML.find(".a-link-normal");
    const category =
      productCategory[productCategory.length - 1].children[0].data.trim();
    ranks.push(category);
  }
  console.log(ranks);
  return ranks;
}

// Function to search for products and their details
async function searchResult(categories) {
  const searchResults = [];
  // Iterating through each category
  for (const category of categories) {
    try {
      // Replacing spaces with '+' and trimming whitespaces
      category.replaceAll(" ", "+").trim();
      const response = await axios(`${host}/s?k=${category}`);
      // bu alana error handler
      const $ = cheerio.load(response.data);
      const products = $(".puis-card-container");
      products.each((index, element) => {
        const productInfo = $(element).find(".s-title-instructions-style");
        const productName = productInfo.find("span")[0].children[0].data.trim();
        const productLink = productInfo.find(".a-link-normal");
        const productHref = productLink.attr("href");
        // Checking for duplicate search results
        if (
          !searchResults.includes({
            productName,
            productLink: host + productHref,
            searchedLink: `${host}/s?k=${category}`,
            category,
          })
        ) {
          searchResults.push({
            productName,
            productLink: host + productHref,
            searchedLink: `${host}/s?k=${category}`,
            category,
          });
        }
      });
      console.log("Data acquisition is successful, wait 10 seconds");
      await delay(10000); // Adjust the duration
    } catch (error) {
      console.log("503 error, waiting for 25 seconds");
      categories.push(category);
      await delay(25000); // Adjust the duration
    }
  }
  return searchResults;
}
//
async function searchCategoryResult(categories) {
  const searchResults = [];
  // Iterating through each category
  for (const category of categories) {
    try {
      // Replacing spaces with '+' and trimming whitespaces
      category.replaceAll(" ", "+").trim();
      const response = await axios(`${host}/s?k=${category}`);
      // bu alana error handler
      const $ = cheerio.load(response.data);
      const products = $("#departments");
      const productInfo = products
        .find(".a-link-normal")
        .find(".a-size-base")
        .prevObject.text()
        .trim()
        .split("\n")[0];
      productInfo.replaceAll(" ", "+").trim();
      searchResults.push({
        category,
        categoryLink: `${host}/s?k=${productInfo}`,
      });
      await delay(10000); // Adjust the duration
    } catch (error) {
      console.log("503 error, waiting for 25 seconds");
      categories.push(category);
      await delay(25000); // Adjust the duration
    }
  }
  return searchResults;
}

// Fetch data, get best seller ranks, and search results
fetchData()
  .then(async (href) => {
    await getBestSellerRank(href).then(async (ranks) => {
      console.log("Seller result: " + typeof ranks);
      // Writing search results to a JSON file
      ranks.forEach((category) => {
        fs.appendFile("data.txt", category + ", ", (error) => {
          if (error) {
            console.error(error);
            throw error;
          }
          console.log("data.txt written correctly");
        });
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });

