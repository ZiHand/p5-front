// ==========================================================
// Variables definitions
// ==========================================================
const apiUrlBase        = "http://localhost:3000/api/";
const apiAllProductsUrl = apiUrlBase + "products";

// ==========================================================
//  apiAskForProducts
// ==========================================================
// Arguments:
//      - Array     (products)
//      - String    (Url)
//
// Return void
// ==========================================================
function apiAskForProducts(productsArray, url) 
{
  fetch(url)
    .then(function(res) 
    {
      if (res.ok) 
      {
        return res.json();
      }
    })
    .then(function(json) 
    {
      // Json parsing
      for (var obj of json) 
      {
        const productObj =  {colors: [], _id: "", name: "", price: 0, imageUrl: "", description: "", altTxt: ""};

          // Check know properties
          for (const key in obj)
          {
              if(productObj.hasOwnProperty(key))
              {
                  productObj[key] = obj[key]; 
              }
          }

          // Add To Array.
          productsArray.push(productObj);
      }

      return productsArray;
    })
    .then(function(array)
    {
      let items = document.getElementById('items');

      if (!items)
      {
        throw "apiAskForProducts throw Error : getElementById('items') = " + items;
      }

      // Create new array of strings to write to DOM
      const theseProducts = array.map(function(element)
      {
          return writePoductToDOM(element);
      });

      items.innerHTML = theseProducts.join('\n');
    })
    .catch(function(err) 
    {
      // Une erreur est survenue
      console.log(err);
    });   
}

// ==========================================================
//  function writePoductToDOM
// ==========================================================
// Arguments:
//      - Object    (product)
//
// Return a string that represent a product as html
// ==========================================================
function writePoductToDOM(product)
{
    let write = `<a href="./product.html?id=${product._id}">
    <article>
      <img src="${product.imageUrl}" alt="${product.altTxt}">
      <h3 class="productName">${product.name}</h3>
      <p class="productDescription">${product.description}</p>
    </article>
  </a>`;

  return write;
}

// ==========================================================
// Write products into the DOM
// ==========================================================
async function writeProductsToDOM()
{
    let items = document.getElementById('items');

    if (items)
    {
        let productsArray = new Array();
        apiAskForProducts(productsArray, apiAllProductsUrl);
    }
    else
    {
        // Handle errors.
        throw "writeProductsToDOM FAILED";
    }
}


// ==========================================================
// Main run
// ==========================================================
try
{
  writeProductsToDOM();
}
catch(err)
{
  console.log(err);
}


