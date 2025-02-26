// show/hidden
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
    }
};
showMenu('nav_toggle', 'navbar', 'body');

// color hover of navbar
const linkColor = document.querySelectorAll('.nav_link');
function colorLink() {
    linkColor.forEach(link => link.classList.remove('active'));
    this.classList.add('active');
}
linkColor.forEach(link => link.addEventListener('click', colorLink));

// dropdown menu profile
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
            }
        });
    }
};
dropDownProfile('drop-menu-profile', 'userpic');

// show/hide button <<add products>>
const closeIcon = document.querySelector(".icon-close");
const addProductBtn = document.getElementById("add-product-btn");
const editProductBtn = document.getElementById("edit-btn");
const openAddProduct = document.querySelector(".product-form");

addProductBtn.addEventListener("click", () => {
    openAddProduct.classList.add("active");
    addProductBtn.classList.add("close");
});
closeIcon.addEventListener("click", () => {
    openAddProduct.classList.remove("active");
    addProductBtn.classList.remove("close");
});

// show products
function showListProducts() {
    fetch(`http://localhost:8000/api/products/get-all`)
        .then(response => response.json())
        .then(data => {
            let tableBody = document.getElementById('product-table-body');
            tableBody.innerHTML = "";
            let productsToShow = data.slice(0, 8);
            productsToShow.forEach(product => {
                let rowProduct = `
                <tr class="row" id="product-row-${product.productID}">
                    <td class="content">${product.productID}</td>
                    <td class="content" contenteditable="false" id="product-name-${product.productID}">${product.productName}</td>
                    <td class="content" contenteditable="false" id="product-quantity-${product.productID}">${product.quantity}</td>
                    <td class="content" contenteditable="false" id="product-unit-${product.productID}">${product.unitCal}</td>
                    <td class="content" contenteditable="false" id="product-category-${product.productID}">${product.category}</td>
                    <td class="content" contenteditable="false" id="product-price-${product.productID}">${product.price}</td>
                    <td class="content">${product.lastUpdate}</td>
                    <td id="delete-edit">
                        <button type="button" class="delete-button" id="delete-button" onclick="deleteProduct('${product.productID}', event)">Delete</button>
                        <button type="button" class="edit-button" id="edit-button-${product.productID}" onclick="toggleEdit('${product.productID}', event)">Edit</button>
                    </td>
                </tr>
            `;
                tableBody.innerHTML += rowProduct;
            });
        })
        .catch(error => {
            console.error("Error: ", error);
        });
}
showListProducts();

// function show products (search, viewall, hidesomeproducts)
function displayProducts(productsToShow) {
    let tableBodyProduct = document.getElementById("product-table-body");
    tableBodyProduct.innerHTML = "";
    productsToShow.forEach(product => {
        let rowProduct = `
                <tr class="row" id="product-row-${product.productID}">
                    <td class="content">${product.productID}</td>
                    <td class="content" contenteditable="false" id="product-name-${product.productID}">${product.productName}</td>
                    <td class="content" contenteditable="false" id="product-quantity-${product.productID}">${product.quantity}</td>
                    <td class="content" contenteditable="false" id="product-unit-${product.productID}">${product.unitCal}</td>
                    <td class="content" contenteditable="false" id="product-category-${product.productID}">${product.category}</td>
                    <td class="content" contenteditable="false" id="product-price-${product.productID}">${product.price}</td>
                    <td class="content">${product.lastUpdate}</td>
                    <td id="delete-edit">
                        <button type="button" class="delete-button" id="delete-button" onclick="deleteProduct('${product.productID}', event)">Delete</button>
                        <button type="button" class="edit-button" id="edit-button-${product.productID}" onclick="toggleEdit('${product.productID}', event)">Edit</button>
                    </td>
                </tr>
            `;
        tableBodyProduct.innerHTML += rowProduct;
    });
}

// function search products
async function searchProducts() {
    try {
        const searchTerm = document.getElementById("search-text").value.toLowerCase();
        const response = await fetch(`http://localhost:8000/api/products/search1?query=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status:${response.status}`);
        }
        const products = await response.json();
        displayProducts(products); // Gọi hàm hiển thị danh sách sản phẩm.
    } catch (error) {
        console.error("Error:", error);
    }
}

// Search: click icon <<search>> or input <<abc...>>
document.getElementById("search-button").addEventListener("click", searchProducts);
document.getElementById("search-text").addEventListener("input", searchProducts);

// function delete products
function deleteProduct(productId, event) {
    event.preventDefault();
    fetch(`http://localhost:8000/api/products/delete/${productId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status:${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            const rowToDelete = document.getElementById(`product-row-${productId}`);
            if (rowToDelete) {
                rowToDelete.remove();
            }
            showListProducts();
            showNotificationOk("Product Deleted Successfully");
        })
        .catch(error => {
            console.error(`Error deleting product: `, error);
            showNotificationError(error.message);
        });
}

// function edit products
function toggleEdit(productId, event) {
    event.preventDefault();
    const isEditing = document.getElementById(`edit-button-${productId}`).innerText === `Edit`;
    const rowProduct = document.getElementById(`product-row-${productId}`);
    const nameCell = document.getElementById(`product-name-${productId}`);
    const unitCell = document.getElementById(`product-unit-${productId}`);
    const categoryCell = document.getElementById(`product-category-${productId}`);
    const priceCell = document.getElementById(`product-price-${productId}`);

    if (isEditing) {
        rowProduct.style.background = "white";
        rowProduct.style.color = "black";
        nameCell.contentEditable = "true";
        unitCell.contentEditable = "true";
        categoryCell.contentEditable = "true";
        priceCell.contentEditable = "true";
        document.getElementById(`edit-button-${productId}`).innerText = 'Save';
    } else {
        const updatedProduct = {
            productName: nameCell.innerText,
            unitCal: unitCell.innerText,
            category: categoryCell.innerText,
            price: parseFloat(priceCell.innerText)
        };
        updateProduct(productId, updatedProduct);
        nameCell.contentEditable = "false";
        unitCell.contentEditable = "false";
        categoryCell.contentEditable = "false";
        priceCell.contentEditable = "false";
        document.getElementById(`edit-button-${productId}`).innerText = `Edit`;
        rowProduct.style.background = "";
        rowProduct.style.color = "";
    }
}

function updateProduct(productID, updatedProduct) {
    fetch(`http://localhost:8000/api/products/update/${productID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status:${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            showNotificationOk("Product updated successfully");
        })
        .catch(error => {
            console.error('Error:', error);
            showNotificationError(error.message);
        });
}

// function add products
document.getElementById("save-product").addEventListener("click", (e) => {
    e.preventDefault();
    const newProduct = {
        productName: document.getElementById("product-name").value,
        unitCal: document.getElementById("product-unitCal").value,
        quantity: 0,
        category: document.getElementById("product-category").value,
        price: parseFloat(document.getElementById("product-price").value),
    };
    fetch(`http://localhost:8000/api/products/insert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status:${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            openAddProduct.classList.remove("active");
            addProductBtn.classList.remove("close");
            showListProducts();
            showNotificationOk("Product Added Successfully");
        })
        .catch(error => {
            console.error("Error: ", error);
            showNotificationError(error.message);
        });
});

// view all or hide some products
let showAll = false;
async function viewAllOrHide() {
    try {
        const response = await fetch('http://localhost:8000/api/products/get-all');
        if (!response.ok) {
            throw new Error(`HTTP error! Status:${response.status}`);
        }
        const AllProducts = await response.json();

        const tableBody = document.getElementById("product-table-body");
        tableBody.innerHTML = "";
        if (!showAll) {
            displayProducts(AllProducts);
            showAll = !showAll;
            document.getElementById("view-all-btn").textContent = "Hide Some Products";
        } else {
            let showSomeProducts = AllProducts.slice(0, 8);
            displayProducts(showSomeProducts);
            showAll = !showAll;
            document.getElementById("view-all-btn").textContent = "View All";
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}

document.getElementById("view-all-btn").addEventListener("click", (event) => {
    event.preventDefault();
    viewAllOrHide();
});

// function show notification

const showNotificationError = (message) => {
    const notification = document.getElementById("notification-error");
    notification.style.display = "flex";
    const notificationText = document.getElementById("content-error");
    notificationText.innerText = message;
    // hidden the notification after 3s
    setTimeout(() => {
        notification.style.display = "none";
    }, 1500);
};

const showNotificationOk = (message) => {
    const notification = document.getElementById("notification-success");
    notification.style.display = "flex";
    const notificationText = document.getElementById("content-success");
    notificationText.innerText = message;
    // hidden the notification after 3s
    setTimeout(() => {
        notification.style.display = "none";
    }, 1500);
};

