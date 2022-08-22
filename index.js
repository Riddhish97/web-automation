/**
 * NOTE - Data from API will be sorted or not i was not sure so created algo base on unsorted data so looping on
 * all data using price range query params so all data can be scrap from website.
 * Used divide-and-conquer algorithm with little customization.
 */
const axios = require("axios");
// This Function will get all data from website API
async function getALlDataFromWebsite() {
  try {
    //Set default price
    let startPrice = 0,
      endPrince = 100000;
    //Request data for axios package
    let response = await getResFromApi(startPrice, endPrince);
    let products = [];
    //If website has 1000 or less data total data then add that data to array.
    if (response.total <= 1000) {
      products = products.concat(response.products);
    } else {
      //store total value
      let total = response.total;
      endPrince = (endPrince + startPrice) / 2;
      //check if total is scrap from website or not
      while (products.length < total) {
        console.log(startPrice, endPrince);
        let apiRes = await getResFromApi(startPrice, endPrince);
        //If API has more then thousand data then divide that end price in half and continue till 1000 or less data found
        if (apiRes.total <= 1000) {
          //Hard copy of end price to set in start price
          let tempEnd = JSON.parse(JSON.stringify(endPrince));
          products = products.concat(apiRes.products);
          //let in some range data is less then 500 for given price range so we are increase range 2* difference of start and end
          if (apiRes.total <= 500) {
            endPrince = endPrince + (endPrince - startPrice) * 2;
          } else {
            //end price is increase in difference of end-start difference
            endPrince = endPrince + (endPrince - startPrice);
          }
          //setting end price border to 100k
          if (endPrince > 100000) {
            endPrince = 100000;
          }
          startPrice = tempEnd;
        } else {
          // If total product is less then 1000 then divide end value by two for less request
          endPrince = (endPrince + startPrice) / 2;
        }
        console.log(products, "products");
      }
    }
    console.log("Total number of product scrap from website ", products.length);
    return products;
  } catch (err) {
    console.log(err);
  }
}
//This is sub function to get data from API
async function getResFromApi(startPrice, endPrince) {
  const config = {
    method: "get",
    url: `https://api.ecommerce.com/products?minPrice=${startPrice}&maxPrice=${endPrince}`,
    headers: {},
  };
  //This will return JSON data from API call
  let response = await axios(config);
  return response.data;
}
getALlDataFromWebsite();
