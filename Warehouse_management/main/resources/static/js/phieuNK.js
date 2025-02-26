//  show/hidden
const showMenu = (toggleId, navbarId, bodyId) => {
    const toggle = document.getElementById(toggleId),
        navbar = document.getElementById(navbarId),
        bodypadding = document.getElementById(bodyId);
    if (toggle && navbar) {
        toggle.addEventListener('click', () => {
            navbar.classList.toggle('show');
            toggle.classList.toggle('rotate');
            bodypadding.classList.toggle('expander');
        });
    };
};
showMenu('nav_toggle', 'navbar', 'body');
//color hover of navbar
const linkColor = document.querySelectorAll('.nav_link');
function colorLink() {
    linkColor.forEach(link => link.classList.remove('active'));
    this.classList.add('active');
};
linkColor.forEach(link => link.addEventListener('click', colorLink));
//dropdown menu profile
const dropDownProfile = (menuId, userpicId) => {
    const userpic = document.getElementById(userpicId),
        menuProfile = document.getElementById(menuId);
    if (userpic && menuProfile) {
        userpic.addEventListener('click', (e) => {
            e.stopPropagation();
            menuProfile.classList.toggle('active');
        });
        window.addEventListener('click', (e) => {
            if (!menuProfile.contains(e.target) && !userpic.contains(e.target)) {
                menuProfile.classList.remove('active');
            };
        });
    };

};
dropDownProfile('drop-menu-profile', 'userpic');
//set username from sessionStorage
const usernameNK = sessionStorage.getItem('username');
if (usernameNK) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('username').textContent = `${usernameNK}`;
    });
    const username = sessionStorage.setItem("username", usernameNK)
}
// show/hide check-save
document.getElementById("save-form").addEventListener("click", (event) => {
    event.preventDefault();
    const tooltip = document.getElementById("check-save");
    tooltip.classList.toggle("active");
    listProductName.classList.remove("active")
    window.addEventListener("click", function closeTooltip(e) {
        e.stopPropagation();
        if (!tooltip.contains(e.target) && (e.target.id !== "save-form")) {
            tooltip.classList.remove("active");
            window.removeEventListener("click", closeTooltip);
        };
    });

});
//Show list supplierName when clicking the chevron (v)
const listSupplierName = document.getElementById("list-name-supplier");
const listProductName = document.getElementById("list-name-product");
const clickChevronSupplier = document.getElementById("chevron-supplier-btn");
const clickChevronProduct = document.getElementById("chevron-product-btn");
clickChevronSupplier.addEventListener("click", (e) => {
    e.preventDefault();
    listSupplierName.classList.toggle("active");
});
clickChevronProduct.addEventListener("click", (e) => {
    e.preventDefault();
    listProductName.classList.toggle("active");
});
//Show list supplierName when entering input
const enterInputSupplier = document.getElementById("supplier-name-input");
const enterInputProduct = document.getElementById("product-name-input");
enterInputProduct.addEventListener("input", () => {
    listProductName.classList.add("active");
    searchNameProduct();
    if (enterInputProduct.value === "") {
        listProductName.classList.remove("active");
    };
    //

});
enterInputSupplier.addEventListener("input", () => {
    listSupplierName.classList.add("active");
    searchNameSupplier();
    if (enterInputSupplier.value === "") {
        listSupplierName.classList.remove("active");
    };
    //

});

//function search of input name product, supplier
function searchNameSupplier() {
    const inputNameSupplier = document.getElementById("supplier-name-input").value.toLowerCase();
    const allNameSupplier = document.getElementsByClassName("name-supplier");
    Array.from(allNameSupplier).forEach((supplierName) => {
        const supplierText = supplierName.innerText.toLowerCase();
        if (supplierText.includes(inputNameSupplier)) {
            supplierName.style.display = '';
        } else {
            supplierName.style.display = "none";
        }
    });
};

function searchNameProduct() {
    const inputNameProduct = document.getElementById("product-name-input").value.toLowerCase();
    const allNameProduct = document.getElementsByClassName("name-product");
    Array.from(allNameProduct).forEach((productName) => {
        productText = productName.innerText.toLowerCase();
        if (productText.toLowerCase().includes(inputNameProduct)) {
            productName.style.display = '';
        } else {
            productName.style.display = "none";
        };
    });
};
//Open form add new product, new supplier
const closeProductIcon = document.querySelector(".icon-close-product");
const closeSupplierIcon = document.querySelector(".icon-close-supplier");
const addProductBtn = document.getElementById("add-product-btn");
const addSupplierBtn = document.getElementById("add-supplier-btn");
const openAddProduct = document.querySelector(".product-form");
const openAddSupplier = document.querySelector(".supplier-form");

addProductBtn.addEventListener("click", () => {
    openAddProduct.classList.add("active");
    addProductBtn.classList.add("close");
    openAddSupplier.classList.remove("active");
});
closeProductIcon.addEventListener("click", () => {
    openAddProduct.classList.remove("active");
    addProductBtn.classList.remove("close");
});

addSupplierBtn.addEventListener("click", () => {
    openAddSupplier.classList.add("active");
    addSupplierBtn.classList.add("close");
    openAddProduct.classList.remove("active");
});
closeSupplierIcon.addEventListener("click", () => {
    openAddSupplier.classList.remove("active");
    addSupplierBtn.classList.remove("close");
});
//function: fetch name supplier from dtb and showListNameSupplier
async function fetchNameSupplier() {
    try {
        const response = await fetch("http://localhost:3000/suppliers");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };
        return await response.json();
    } catch (error) {
        console.error("Error: ", error);
    };
}
async function showListNameSupplier() {
    const suppliers = await fetchNameSupplier();
    const listNameSupplier = document.getElementById("list-name-supplier");
    listNameSupplier.innerHTML = "";
    suppliers.forEach(supplier => {
        const nameSupplier = `
            <p class="name-supplier" id="name-supplier-${supplier.supplierID}">${supplier.supplierName}</p>
        `;
        listNameSupplier.innerHTML += nameSupplier;
    })
    listNameSupplier.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("name-supplier")) {
            const inputSupplier = document.getElementById("supplier-name-input");
            inputSupplier.value = e.target.textContent.trim();
            listNameSupplier.classList.remove('active');
            showProductsBySupplier();
        };
    });
};
showListNameSupplier();
//function: fetch name product from dtb and showListNameProduct
async function fetchNameProduct() {
    try {
        const response = await fetch("http://localhost:3000/products");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };
        return await response.json();
    } catch (error) {
        console.error("Error: ", error);
    };
};
async function showListNameProduct() {
    const products = await fetchNameProduct();
    const listNameProduct = document.getElementById("list-name-product");
    listNameProduct.innerHTML = "";
    products.forEach(product => {
        const nameProduct = `
                <p class="name-product" id="name-product-${product.productID}" >${product.productName}</p>
            `;
        listNameProduct.innerHTML += nameProduct;
    })
    listNameProduct.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("name-product")) {
            const inputProduct = document.getElementById("product-name-input");
            inputProduct.value = e.target.textContent.trim();
            listNameProduct.classList.remove('active');
        };
    });
};
showListNameProduct();
//function fetch and show data product by supplierName
async function fetchProductsBySupplierName(supplierName) {
    try {
        const response = await fetch(`http://localhost:3000/supplierProduct/search?name=${supplierName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        };
        return response.json();
    } catch (error) {
        console.error("Error: ", error);
    };
};
async function showProductsBySupplier() {
    const supplierName = document.getElementById("supplier-name-input").value;
    const products = await fetchProductsBySupplierName(supplierName);
    console.log(products);
    const listNameProduct = document.getElementById("list-name-product");
    listNameProduct.innerHTML = "";
    products.forEach(product => {
        const nameProduct = `
             <p class="name-product" id="name-product-${product.productID}" >${product.productName}</p>
        `;
        listNameProduct.innerHTML += nameProduct;
    });
    const textViewAll = document.createElement("span");
    textViewAll.id = "view-all-list";
    textViewAll.innerText = "---See full product list---";
    listNameProduct.appendChild(textViewAll);
    document.getElementById("view-all-list").addEventListener("click", () => {
        showListNameProduct();
    });
    listNameProduct.classList.add("active");
    document.getElementById("product-name-input").value = "";
    listNameProduct.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("name-product")) {
            const inputProduct = document.getElementById("product-name-input");
            inputProduct.value = e.target.textContent.trim();
            listNameProduct.classList.remove('active');
        };
    });
};

const supplierInput = document.getElementById("supplier-name-input");
supplierInput.addEventListener("input", showProductsBySupplier);
//gen info supplier
async function genInfoToForm() {
    const supplierName = document.getElementById("supplier-name-input").value;
    const dataS = await fetch(`http://localhost:3000/suppliers/search?name=${supplierName}`);
    const suppliers = await dataS.json();
    const productName = document.getElementById("product-name-input").value;
    const dataP = await fetch(`http://localhost:3000/products/search?name=${productName}`);
    const products = await dataP.json();
    const formPhieuNK = document.getElementById("inforSupplierProduct");
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.id = `product-${products.productID}`;
    productDiv.innerHTML = `
            <div class="product-info">
                <span class="delete-product" id="delete-product-${products.productID}" onclick="deleteProduct('${products.productID}')">
                    <ion-icon name="close"></ion-icon>
                </span>
                <div class="product-details">
                    <h3>Product ID: ${products.productID}</h3>
                    <p>Product Name: ${products.productName}</p>
                    <p>UnitCal: ${products.unitCal}</p>
                    <p>Price: ${products.price.toLocaleString("vi-VN")} VND</p>
                    <label for="quantity-product-${products.productID}">Quantity:</label>
                    <input type="number" min="1" placeholder="Quantity" id="quantity-product-${products.productID}" class="input-quantity" required>
                </div>
                <div class="supplier-details">
                    <h3>Supplier ID: ${suppliers.supplierID}</h3>
                    <p>Supplier Name: ${suppliers.supplierName}</p>
                    <p>Supplier Contact: ${suppliers.contactNumber}</p>
                    <p>Address: ${suppliers.address}</p>
                    <button class="accept-product-btn">Accept The Product</button>
                </div>
            </div>
    `;
    formPhieuNK.appendChild(productDiv);
    //event accept
    bindAcceptProductEvent(productDiv);

}
const addButton = document.getElementById("add-btn");
addButton.addEventListener("click", (e) => {
    e.preventDefault();
    genInfoToForm();
});
//gen infor product 2 (if need)
function bindAcceptProductEvent(productElement) {
    const acceptButtons = document.querySelectorAll(".accept-product-btn");
    acceptButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const inputProductName = document.getElementById("product-name-input");
            const listProductName = document.getElementById("list-name-product");
            const listSupplierName = document.getElementById("list-name-supplier");
            inputProductName.value = "";
            listProductName.classList.add("active");
            listSupplierName.classList.remove("active");
            button.style.display = "none";
            const quantityInput = productElement.querySelector(".input-quantity");
            quantityInput.disabled = true;
            calculateTotals();
        });
    });
};
//delete product in form
function deleteProduct(productID) {
    const product = document.getElementById(`product-${productID}`);
    product.remove();
    calculateTotals();

};
//reset form phieu nk
function resetForm() {
    document.getElementById("inforSupplierProduct").innerHTML = "";
    document.getElementById("total-price").innerText = "";
    document.getElementById("total-product").innerText = "";
};
const resetBtn = document.getElementById("reset-phieunk-btn");
resetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetForm();
});
//date-in
const today = new Date();
const formattedDate = today.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
});
//function calc total-product, total-price
function calculateTotals() {
    let totalProduct = 0;
    let totalPrice = 0;
    const quantityInputs = document.querySelectorAll('.input-quantity');
    quantityInputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const productID = input.id.split('-')[2];

        const priceElement = document.querySelector(`#product-${productID} .product-details p:nth-child(4)`);
        const priceText = priceElement.textContent.split(':')[1].trim(); 
        const price = parseFloat(priceText.replace(/\D/g, '')) || 0;

        totalProduct += quantity;
        totalPrice += quantity * price;
    });
    document.getElementById('total-product').textContent = `Total Product: ${totalProduct}`;
    document.getElementById('total-price').textContent = `Total Price: ${totalPrice.toLocaleString('vi-VN')} VND`;
    document.getElementById("date-in").textContent = `Date: ${formattedDate}`;

};
// function add suppliers
document.getElementById("save-supplier").addEventListener("click", (e) => {
    e.preventDefault();
    const newSupplier = {
        supplierName: document.getElementById("supplier-name").value,
        contactNumber: document.getElementById("number-contact").value,
        address: document.getElementById("address").value
    };
    fetch('http://localhost:3000/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status:${response.status}`);
            openAddSupplier.classList.remove("active");
            return response.json();
        })
        .then(dataS => {
            console.log(dataS);
            const inputNameSupplier = document.getElementById("supplier-name-input");
            inputNameSupplier.value = dataS.supplierName;
            const listNameProduct = document.getElementById("list-name-product");
            showListNameProduct();
            listNameProduct.classList.add("active");
            const listNameSupplier = document.getElementById("list-name-supplier");
            listNameSupplier.classList.remove("active");
        })
        .catch(error => {
            console.error("Error:", error);
        });
});
//function add products
document.getElementById("save-product").addEventListener("click", (e) => {
    e.preventDefault();
    const newProduct = {
        productName: document.getElementById("product-name").value,
        unitCal: document.getElementById("product-unitCal").value,
        quantity: 0,
        category: document.getElementById("product-category").value,
        price: parseFloat(document.getElementById("product-price").value),
    };
    console.log("Sending data:", JSON.stringify(newProduct));
    fetch(`http://localhost:3000/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
        .then(response => {
            console.log(response)
            if (!response.ok) {
                throw new Error(`HTTP error! Status:${response.status}`);
            }
            return response.json();
        })
        .then(dataP => {
            const inputNameProduct = document.getElementById("product-name-input");
            inputNameProduct.value = dataP.productName;
            openAddProduct.classList.remove("active");
            const listNameProduct = document.getElementById("list-name-product");
            listNameProduct.classList.remove("active");
        })
        .catch(error => {
            console.error("Error: ", error);
        });
});
// function link productID to supplierID
const checkSave = document.getElementById("check-save");
checkSave.addEventListener("click", async (e) => {
    e.preventDefault();
    checkSave.classList.remove("active");
    const infoPhieuNK = Array.from(document.querySelectorAll(".product")).map((product) => {
        return {
            productName: product.querySelector("p:nth-child(2)").textContent.split(": ")[1],
            supplierName: product.querySelector(".supplier-details p:nth-child(2)").textContent.split(": ")[1]
        };
    });
    infoPhieuNK.forEach(info => {
        const productName = info.productName;
        const supplierName = info.supplierName;
        linkProductToSupplier(productName, supplierName);
    });
});
async function linkProductToSupplier(productName, supplierName){
    try {
        const [resS, resP] = await Promise.all([
            fetch(`http://localhost:3000/products/search?name=${productName}`),
            fetch(`http://localhost:3000/suppliers/search?name=${supplierName}`)
        ]);
        if (!resS.ok || !resP.ok) {
            throw new Error(`HTTP error! Status: ${resP.status} & ${resS.status}`);
        };
        const productData = await resS.json();
        const supplierData = await resP.json();
        const idSAP = {
            supplierID: supplierData.supplierID,
            productID: productData.productID,
            supplierName: supplierName,
            productName: productName
        };
        const resPOST = await fetch('http://localhost:3000/supplierProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(idSAP)
        });
        if (!resPOST.ok) {
            throw new Error(`HTTP error! Status: ${resPOST.status}`);
        };
    } catch (error) {
        console.error(error);
    };
};
checkSave.addEventListener("click", async (e) => {
    e.preventDefault();
    //save info phieu nk in session storage
    const infoPhieuNK = Array.from(document.querySelectorAll(".product")).map((product) => {
        return {
            productID: product.querySelector("h3").textContent.split(": ")[1],
            productName: product.querySelector("p:nth-child(2)").textContent.split(": ")[1],
            unitCal: product.querySelector("p:nth-child(3)").textContent.split(": ")[1],
            price: product.querySelector("p:nth-child(4)").textContent.split(": ")[1],
            quantity: product.querySelector(".input-quantity").value,
            supplierID: product.querySelector(".supplier-details h3").textContent.split(": ")[1],
            supplierName: product.querySelector(".supplier-details p:nth-child(2)").textContent.split(": ")[1],
            supplierContact: product.querySelector(".supplier-details p:nth-child(3)").textContent.split(": ")[1],
            supplierAddress: product.querySelector(".supplier-details p:nth-child(4)").textContent.split(": ")[1]
        };
    });
    const totalProductElement = document.getElementById("total-product").textContent;
    const totalProduct = parseInt(totalProductElement.split(": ")[1].trim());
    const totalPriceElement = document.getElementById("total-price").textContent;
    const totalPrice = parseFloat(totalPriceElement.split(": ")[1].trim().replace(/\D/g, ""));
    const dateIn = document.getElementById("date-in").textContent;
    try {
        const importNote = {
            quantities: infoPhieuNK.map(info => info.quantity),
            totalMoney: totalPrice,
            totalQuantity: totalProduct,
            supplierID: infoPhieuNK.find(info => info.supplierID).supplierID,
            productIDs: infoPhieuNK.map(info => info.productID)
        };
        console.log(importNote);
        const resPOST = await fetch('http://localhost:3000/Imports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(importNote)
        });
        if (!resPOST.ok) {
            throw new Error(`HTTP error! Status: ${resPOST.status}`);
        };
        const dataIm = await resPOST.json();
        const importID = dataIm.importID;
        const phieuNKData = {
            infoPhieuNK,
            totalPriceElement,
            totalProductElement,
            dateIn,
            importID
        };
        sessionStorage.setItem("phieuNKData", JSON.stringify(phieuNKData));
        window.open("/templates/showPhieuNK.html", "_blank");

    } catch (error) {
        console.error(error);
    };
});


