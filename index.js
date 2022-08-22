/**
 * NOTE - Data from API will be sorted or not, I was not sure so created algo base on unsorted data so looping on
 * all data using price range query params. So all data can be extracted from website.
 * Used divide-and-conquer algorithm with little customization. In here dataset is not provided so we don't have an idea if price 0-100 has more product
 * than 5000-50000 So created a general algorithm which can handle both scenario.
 */
const axios = require("axios");
// This Function will get all data from website API
async function getALlDataFromWebsite() {
  try {
    //Set default price
    let startPrice = 0,
      endPrince = 100000;
    //Request data form axios package
    let response = await getResFromApi(startPrice, endPrince);
    let products = [];
    //If website has 1000 or less total data than add that data to array.
    if (response.total <= 2) {
      products = products.concat(response.products);
    } else {
      //store total value
      let total = response.total;
      //Set new end price as total data is more than 1k
      endPrince = (endPrince + startPrice) / 2;
      //check if total is extracted from website or not
      while (products.length < total) {
        let apiRes = await getResFromApi(startPrice, endPrince);
        //If API has more than thousand data than divide that end price in half and continue till 1000 or less data found
        if (apiRes.total <= 2) {
          //Hard copy of end price to set in start price
          let tempEnd = JSON.parse(JSON.stringify(endPrince));
          products = products.concat(apiRes.products);
          /**
           * let in some range data is less than 500 for given price range so we are increase range two time i.e 2* difference of start and end
           * So request can be optimized as given range data is less than 500 show we can increase the range by double in that case.
           */
          if (apiRes.total <= 500) {
            endPrince = endPrince + (endPrince - startPrice) * 2;
          } else {
            //end price is increase in difference of end-start difference(Keeping it simple. Here we can add dynamic logic base on pervious data)
            endPrince = endPrince + (endPrince - startPrice);
          }
          //setting end price border to 100k
          if (endPrince > 100000) {
            endPrince = 100000;
          }
          startPrice = tempEnd;
        } else {
          // If total product is greater than 1000 So divide end value by two for less request
          endPrince = (endPrince + startPrice) / 2;
        }
      }
    }
    console.log(
      "Total number of product extracted from website ",
      products.length
    );
    return products;
  } catch (err) {
    console.log(err);
  }
}
/**
 * This is sub function to get data from API using axios package, 
 * Last params is to handle when server fail or throw error due to any reason then we will gradually slow down our request to server
 * @param {number} startPrice 
 * @param {number} endPrince 
 * @param {number} backoffFact 
 * @returns JSON
 */
function getResFromApi(startPrice, endPrince, backoffFact = 1) {
  return new Promise(async function (resolve, reject) {
    try {
      const config = {
        method: "get",
        url: `https://api.ecommerce.com/products?minPrice=${startPrice}&maxPrice=${endPrince}`, //This is imaginary URL can replace original URL here
        headers: {},
      };
      console.log(config);
      //This will return JSON data from API call
      let response = await axios(config);
      resolve(response.data);
    } catch (err) {
      console.log(err);
      /**
       * We will wait in case of API server fail first for 1 second for second time for 2s and gradually increase wait till 10s than return error.
       */
      console.log(backoffFact)
      let timeout = 1000 * backoffFact;
      if (backoffFact >= 10) {
       return reject(err);
      }
      setTimeout(async () => {
        let responseJson = await getResFromApi(startPrice,endPrince, backoffFact + 1);
        return resolve(responseJson)
      }, timeout);
    }
  });
}
getALlDataFromWebsite();
