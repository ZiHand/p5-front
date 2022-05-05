// ==========================================================
const apiUrlBase = "https://cryptic-refuge-55458.herokuapp.com/api/products/";
let _ID = new URL(window.location.href).searchParams.get("id");
let productObj = {
  colors: [],
  _id: "",
  name: "",
  price: 0,
  imageUrl: "",
  description: "",
  altTxt: "",
};
let OrderProduct = { _id: "", color: "", count: 1, price: 0 };

// **********************************************************
//                      Events listeners
// **********************************************************
const orderBtn = document.getElementById("addToCart");
orderBtn.addEventListener("click", onOrderClick);

const quantityCtrl = document.getElementById("quantity");
quantityCtrl.defaultValue = "1";
quantityCtrl.addEventListener("change", onQuantityChange);

const colorOption = document.getElementById("colors");
colorOption.addEventListener("change", onColorChange);

// **********************************************************
// ==========================================================
//
//                          Helpers
//
// ==========================================================
// **********************************************************

// ==========================================================
// isOrderSameOf
// ==========================================================
function isOrderSameOf(_productOrder, _OtherProductOrder) {
  if (!_productOrder || !_OtherProductOrder) return false;

  if (
    _productOrder._id === _OtherProductOrder._id &&
    _productOrder.color === _OtherProductOrder.color
  )
    return true;

  return false;
}

// ==========================================================
// isCountValid
// ==========================================================
function isCountValid() {
  if (OrderProduct && OrderProduct.count >= 1) return true;

  return false;
}

// ==========================================================
// isColorValid
// ==========================================================
function isColorValid() {
  if (OrderProduct && OrderProduct.color != "") return true;

  return false;
}

// ==========================================================
// isOrderProductValid
// ==========================================================
function isOrderProductValid() {
  if (isColorValid() && isCountValid() && OrderProduct._id != "") return true;

  return false;
}

// ==========================================================
// **********************************************************
//                        API Calls
// **********************************************************
// ==========================================================

// ==========================================================
// apiAskForProduct
//
// Args:
//    - String (URL)
//
// return Promise.
// ==========================================================
function apiAskForProduct(url) {
  fetch(url)
    .then(function (res) {
      if (res.ok) {
        return res.json();
      }
    })
    .then(function (data) {
      // Fill datas
      productObj.colors = data.colors;
      productObj._id = data._id;
      productObj.name = data.name;
      productObj.price = data.price;
      productObj.imageUrl = data.imageUrl;
      productObj.description = data.description;
      productObj.altTxt = data.altTxt;

      return productObj;
    })
    .then(function (object) {
      if (!object) throw "apiAskForProduct Failed to retreive object";

      WriteToDOM(object);
    })
    .catch(function (err) {
      // Une erreur est survenue
      console.log(err);
    });
}

// ==========================================================
// Write to the DOM
// ==========================================================
function WriteToDOM(obj) {
  // The innerText property sets or returns the text content of the specified node, and all its descendants.
  // If you set the innerText property, any child nodes are removed and replaced by a single Text node containing the specified string.
  // Note: This property is similar to the textContent property, however there are some differences:
  // textContent returns the text content of all elements, while innerText returns the content of all elements, except for <script> and <style> elements.
  // innerText will not return the text of elements that are hidden with CSS (textContent will).

  document.getElementsByClassName(
    "item__img"
  )[0].innerHTML = `<img src="${obj.imageUrl}" alt="${obj.altTxt}">`;
  document.getElementById("title").textContent = obj.name;
  document.getElementById("price").textContent = obj.price;
  document.getElementById("description").textContent = obj.description;

  obj.colors.forEach((color) => {
    var element = document.createElement("option");
    element.setAttribute("value", color);
    element.innerText = color;

    colorOption.appendChild(element);
  });
}

// **********************************************************
// ==========================================================
//
//                        Storage
//
// ==========================================================
// **********************************************************

// ==========================================================
// addToStorage
// ==========================================================
function addToStorage() {
  // Check if current orderProduct fit another one.
  // If so inc it.
  // Else, add new one.

  let bFound = false;

  for (var i = 0; i < localStorage.length; i++) {
    // Retrieve the orderObject
    var retrievedObject = JSON.parse(localStorage[i]);

    if (isOrderSameOf(OrderProduct, retrievedObject)) {
      // Inc retrievedObject
      retrievedObject.count++;
      bFound = true;
      localStorage.setItem(i, JSON.stringify(retrievedObject));
      break;
    }
  }

  if (!bFound) {
    localStorage.setItem(localStorage.length, JSON.stringify(OrderProduct));
  }
}

// **********************************************************
// ==========================================================
//
//                        Events
//
// ==========================================================
// **********************************************************

// ==========================================================
// onOrderClick
// ==========================================================
function onOrderClick(event) {
  event.preventDefault();

  OrderProduct._id = productObj._id;
  OrderProduct.price = productObj.price;

  // Check validity
  if (isOrderProductValid()) {
    // Write to local storage.
    addToStorage();
    goToSiteLocation("index.html");
    //window.location.replace("./index.html");
    return;
  }

  alert("Une erreur est survenue, merci de verifier vos choix.");
}

// ==========================================================
// onQuantityChange
// ==========================================================
function onQuantityChange(event) {
  event.preventDefault();

  // Check validity
  if (OrderProduct && event.target.value >= 1 && event.target.value <= 100) {
    OrderProduct.count = event.target.value;
    return;
  }

  alert("Meci de saisir une valeur superireur à 0 et inférieur à 100.");

  // Return to default
  quantityCtrl.value = 1;
}

// ==========================================================
// onColorChange
// ==========================================================
function onColorChange(event) {
  event.preventDefault();

  // Check validity
  if (OrderProduct && event.target.value != "") {
    OrderProduct.color = event.target.value;
    return;
  }

  alert("Merci de choisir une couleur valide.");
}

// ==========================================================

// ==========================================================
// Write product to  DOM
// ==========================================================
async function writeProductToDOM() {
  apiAskForProduct(apiUrlBase + _ID);
}

// ==========================================================
writeProductToDOM();
