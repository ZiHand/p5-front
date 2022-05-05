// ==========================================================
const apiUrlBase = "https://cryptic-refuge-55458.herokuapp.com/api/products/";
let orderArray = [];
let totalPrice = 0;
let userContact = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  email: "",
};

// ==========================================================
// dumpStorage
// ==========================================================
function dumpStorage() {
  console.log("******* Storage Dump Start *******");
  console.log("Storage count: " + localStorage.length);

  for (var i = 0; i < localStorage.length; i++) {
    console.log("Order index " + i + " : " + localStorage[i]);

    var retrievedObject = JSON.parse(localStorage[i]);

    if (!retrievedObject) {
      console.log("  Failed to retrive object: " + i);
    }
  }

  console.log("******* Storage Dump End *******");
  console.log("");
}

// ==========================================================
// removeOrderFromStorage
// ==========================================================
function removeOrderFromStorage(article) {
  let _id = article.getAttribute("data-id");
  let color = article.getAttribute("data-color");
  let foundItem = false;
  let itemIndex = 0;
  const storageCount = localStorage.length; // As length will change during loop we store it to continue parsing.

  if (storageCount <= 0) {
    throw "Une erreur est survenue lors de l'edition de votre panier.";
  }

  for (var i = 0; i < storageCount; i++) {
    var retrievedObject = JSON.parse(localStorage[i]);

    if (
      retrievedObject &&
      retrievedObject._id === _id &&
      retrievedObject.color === color
    ) {
      foundItem = true;
      localStorage.removeItem(itemIndex);
      continue;
    }

    if (foundItem) {
      localStorage.setItem(itemIndex, JSON.stringify(retrievedObject));
      itemIndex++;
      localStorage.removeItem(itemIndex);
      continue;
    }

    itemIndex++;
  }

  if (storageCount === localStorage.length) {
    throw "Une erreur est survenue lors de l'edition de votre panier.";
  }
}

// ==========================================================
// updateOrderQuantitytoStorage
// ==========================================================
function updateOrderQuantitytoStorage(article, quantity) {
  let _id = article.getAttribute("data-id");
  let color = article.getAttribute("data-color");

  for (var i = 0; i <= localStorage.length - 1; i++) {
    let retrievedObject = JSON.parse(localStorage[i]);

    if (!retrievedObject) {
      throw "Une erreur est survenue lors de l'edition de votre panier.";
    }

    if (retrievedObject._id === _id && retrievedObject.color === color) {
      if (quantity >= 1) {
        retrievedObject.count = quantity;
        localStorage.setItem(i, JSON.stringify(retrievedObject));
        break;
      }
    }
  }
}

// ==========================================================
// apiAskForProduct
// ==========================================================
// Args:
//    - String (URL)
//    - Object (Order)
//
// return Promise.
// ==========================================================
function apiAskForProduct(url, order) {
  fetch(url)
    .then(function (res) {
      if (res.ok) {
        return res.json();
      }
    })
    .then(function (data) {
      let productObj = {
        colors: [],
        _id: "",
        name: "",
        price: 0,
        imageUrl: "",
        description: "",
        altTxt: "",
      };

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
    .then(function (product) {
      return writeOrderToArticleItems(order, product);
    })
    .then(function (itemindex) {
      const delete_item = document.getElementsByClassName("deleteItem");

      registerDeleteEvents(delete_item.item(itemindex - 1));

      const itemQuantity = document.getElementsByClassName("itemQuantity");
      registerQuantityEvents(itemQuantity.item(itemindex - 1));

      updateCartPrice(null, null);
    })
    .catch(function (err) {
      console.log("apiAskForProduct throw Error: " + err);
    });
}

// ==========================================================
// loadOrderFromStorage
// ==========================================================
// Args:
//    - None
//
// return void
// ==========================================================
function loadOrderFromStorage() {
  let _orderArray = [];

  for (var i = 0; i < localStorage.length; i++) {
    // Retrieve the orderObject
    var retrievedOrder = JSON.parse(localStorage[i]);

    if (retrievedOrder) {
      _orderArray.push(retrievedOrder);
    }
  }

  return _orderArray;
}

// ==========================================================
//  function writeOrderToArticleItems
// ==========================================================
// Arguments:
//      - Object    (order)
//      - Object    (product)
//
// Return item index (number)
// ==========================================================
function writeOrderToArticleItems(order, product) {
  let cart__items = document.getElementById("cart__items");
  let price = product.price * order.count;

  let article_write = `<article class="cart__item" data-id="${order._id}" data-color="${order.color}">
    <div class="cart__item__img">
      <img src="${product.imageUrl}" alt="${product.altTxt}">
    </div>
    <div class="cart__item__content">
      <div class="cart__item__content__description">
        <h2>${product.name}</h2>
        <p>${order.color}</p>
        <p>${price} €</p>
      </div>
      <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté : </p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${order.count}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem">Supprimer</p>
        </div>
      </div>
    </div>
  </article>`;

  cart__items.insertAdjacentHTML("beforeend", article_write);

  return document.getElementsByClassName("deleteItem").length;
}

// ==========================================================
// updateCartPrice
// ==========================================================
function updateCartPrice(article, priceNode) {
  let totalQuantity = document.getElementById("totalQuantity");
  let totalPrice = document.getElementById("totalPrice");
  let articleCount = 0;
  let price = 0;

  for (var i = 0; i <= localStorage.length - 1; i++) {
    let retrievedObject = JSON.parse(localStorage[i]);

    if (retrievedObject) {
      articleCount += Number(retrievedObject.count);
      price += Number(retrievedObject.price) * Number(retrievedObject.count);
    } else {
      console.log(
        "updateCartPrice FAILED ! retrievedObject == null : " + localStorage[i]
      );
    }

    if (
      article &&
      article.getAttribute("data-id") === retrievedObject._id &&
      priceNode
    ) {
      priceNode.textContent =
        (
          Number(retrievedObject.price) * Number(retrievedObject.count)
        ).toString() + " €";
    }
  }

  if (totalQuantity) {
    totalQuantity.textContent = articleCount.toString();
  }

  if (totalPrice) {
    totalPrice.textContent = price.toString();
  }
}

// **********************************************************
//                      Events listeners
// **********************************************************
const formName = document.getElementById("firstName");
const formLastName = document.getElementById("lastName");
const formAddress = document.getElementById("address");
const formCity = document.getElementById("city");
const formEmail = document.getElementById("email");
const orderBtn = document.getElementById("order");

formName.addEventListener("change", onNameChange);
formLastName.addEventListener("change", onLastNameChange);
formAddress.addEventListener("change", onAddressChange);
formCity.addEventListener("change", onCityChange);
formEmail.addEventListener("change", onEmailChange);
orderBtn.addEventListener("click", onOrderClick);

// ==========================================================
// registerDeleteEvents
// ==========================================================
function registerDeleteEvents(delete_item) {
  delete_item.addEventListener("click", onDeleteClick);
}

// ==========================================================
// registerQuantityEvents
// ==========================================================
function registerQuantityEvents(item) {
  item.addEventListener("change", onQuantityChange);
}

// ==========================================================
// onDeleteClick
// ==========================================================
function onDeleteClick(event) {
  event.preventDefault();

  if (event.currentTarget === this) {
    let cart__item__content__settings__delete =
      event.currentTarget.parentElement;

    if (cart__item__content__settings__delete) {
      let cart__item__content__settings =
        cart__item__content__settings__delete.parentElement;

      if (cart__item__content__settings) {
        let cart__item__content = cart__item__content__settings.parentElement;

        if (cart__item__content) {
          let article = cart__item__content.parentElement;

          if (article) {
            removeOrderFromStorage(article);

            if (localStorage.length <= 0) {
              // Go back to products
              alert(
                "Votre panier est vide ! Choisissez les produits qui vous conviennent dans notre catalogue !"
              );
              goToSiteLocation("index.html");
            } else {
              // reload script
              location.reload();
            }
          }
        }
      }
    }
  }
}

// ==========================================================
// onQuantityChange
// ==========================================================
function onQuantityChange(event) {
  event.preventDefault();

  let priceNode = null;

  if (event.currentTarget === this) {
    let cart__item__content__settings__quantity =
      event.currentTarget.parentElement;

    if (cart__item__content__settings__quantity) {
      let cart__item__content__settings =
        cart__item__content__settings__quantity.parentElement;

      if (cart__item__content__settings) {
        let cart__item__content = cart__item__content__settings.parentElement;

        if (cart__item__content) {
          let cart__item__content__description =
            cart__item__content.firstElementChild;

          if (cart__item__content__description) {
            // Find the last "p"
            if (
              cart__item__content__description.children &&
              cart__item__content__description.children.length
            ) {
              priceNode = cart__item__content__description.children[2];
            }
          }

          let article = cart__item__content.parentElement;

          if (article) {
            if (event.target.value <= 0 || event.target.value > 100) {
              alert(
                "Merci de saisir une valeur superireur à 0 et inférieur à 100."
              );

              event.target.value = event.target.defaultValue;
              return;
            }

            updateOrderQuantitytoStorage(article, event.target.value);

            updateCartPrice(article, priceNode);
          }
        }
      }
    }
  }
}

// ==========================================================
// onNameChange
// ==========================================================
function onNameChange(event) {
  let elt = document.getElementById("firstNameErrorMsg");

  if (!elt) {
    console.log(
      "onNameChange error : getElementById('firstNameErrorMsg') = " + elt
    );
    return;
  }

  if (!validateName(formName)) {
    elt.textContent = "Merci de fournir un prenom valide.";
    return;
  }

  elt.textContent = null;
}

// ==========================================================
// onLastNameChange
// ==========================================================
function onLastNameChange(event) {
  let elt = document.getElementById("lastNameErrorMsg");

  if (!elt) {
    console.log(
      "onLastNameChange error : getElementById('lastNameErrorMsg') = " + elt
    );
    return;
  }

  if (!validateName(formLastName)) {
    elt.textContent = "Merci de fournir un nom valide.";
    return;
  }

  elt.textContent = null;
}

// ==========================================================
// onAddressChange
// ==========================================================
function onAddressChange(event) {
  let elt = document.getElementById("addressErrorMsg");

  if (!elt) {
    console.log(
      "onAddressChange error : getElementById('addressErrorMsg') = " + elt
    );
    return;
  }

  if (!validateAdress(formAddress)) {
    elt.textContent = "Merci de fournir une addresse valide.";
    return;
  }

  elt.textContent = null;
}

// ==========================================================
// onCityChange
// ==========================================================
function onCityChange(event) {
  let elt = document.getElementById("cityErrorMsg");

  if (!elt) {
    console.log("onCityChange error : getElementById('cityErrorMsg') = " + elt);
    return;
  }

  if (!validateCity(formCity)) {
    elt.textContent = "Merci de fournir un nom de ville valide.";
    return;
  }

  elt.textContent = null;
}

// ==========================================================
// onEmailChange
// ==========================================================
function onEmailChange(event) {
  let elt = document.getElementById("emailErrorMsg");

  if (!elt) {
    console.log(
      "onEmailChange error : getElementById('emailErrorMsg') = " + elt
    );
    return;
  }

  if (!validateEmail(formEmail)) {
    elt.textContent = "Merci de fournir una addresse Email valide.";
    return;
  }

  elt.textContent = null;
}

// ==========================================================
// checkForm
// ==========================================================
function checkForm() {
  return (
    validateName(formName) &&
    validateName(formLastName) &&
    validateAdress(formAddress) &&
    validateCity(formCity) &&
    validateEmail(formEmail)
  );
}

// ==========================================================
// onOrderClick
// ==========================================================
function onOrderClick(event) {
  event.preventDefault();

  if (checkForm()) {
    submitForm();
    return;
  }

  console.log("checkForm FAILED");
}

// ==========================================================
// validateName
// ==========================================================
function validateName(element) {
  var regex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s,'-]{2,30}$/;
  return regex.test(element.value);
}

// ==========================================================
// validateAdress
// ==========================================================
function validateAdress(element) {
  var regex = /^[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s,'-]*$/;
  return regex.test(element.value);
}

// ==========================================================
// validateCity
// ==========================================================
function validateCity(element) {
  var regex = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s,'-]*$/;
  return regex.test(element.value);
}

// ==========================================================
// validateEmail
// ==========================================================
function validateEmail(element) {
  var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(element.value);
}

// ==========================================================
// computeJsonBody
// ==========================================================
function computeJsonBody() {
  userContact.firstName = formName.value;
  userContact.lastName = formLastName.value;
  userContact.address = formAddress.value;
  userContact.city = formCity.value;
  userContact.email = formEmail.value;

  let productArray = [];

  orderArray.forEach((item) => {
    productArray.push(item._id);
  });

  return { contact: userContact, products: productArray };
}

// ==========================================================
// goToSiteLocation
// ==========================================================
function goToSiteLocation(pageName) {
  var currentUrl = window.location.href;
  let indexOf = currentUrl.lastIndexOf("/") + 1;

  document.location = currentUrl.substring(0, indexOf) + pageName;
}

// ==========================================================
// submitForm
// ==========================================================
async function submitForm() {
  fetch(apiUrlBase + "order", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(computeJsonBody()),
  })
    .then(function (res) {
      if (res.ok) {
        return res.json();
      }
    })
    .then(function (value) {
      goToSiteLocation("confirmation.html?Id=" + value.orderId);
    })
    .catch(function (err) {
      console.log("submitForm throw : " + err);
    });
}

// ==========================================================
// Main run
// ==========================================================
function mainRun() {
  orderArray = loadOrderFromStorage();

  orderArray.forEach((item) => {
    apiAskForProduct(apiUrlBase + item._id, item);
  });
}

// ==========================================================
mainRun();
