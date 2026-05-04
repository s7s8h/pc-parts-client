const API_BASE_URL = "http://127.0.0.1:8000/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userName", data.user.name);

                message.style.color = "green";
                message.textContent = "Login successful. Redirecting...";

                setTimeout(function () {
                    window.location.href = "dashboard.html";
                }, 1000);
            } else {
                message.style.color = "red";
                message.textContent = data.message || "Login failed.";
            }
        } catch (error) {
            message.style.color = "red";
            message.textContent = "Cannot connect to the server.";
        }
    });
}

const partsContainer = document.getElementById("partsContainer");
const statusMessage = document.getElementById("statusMessage");
const welcomeUser = document.getElementById("welcomeUser");
const logoutBtn = document.getElementById("logoutBtn");
const addPartLink = document.getElementById("addPartLink");
const loginLink = document.getElementById("loginLink");
let currentParts = [];

if (welcomeUser) {
    const userName = localStorage.getItem("userName");

    if (localStorage.getItem("token")) {
        welcomeUser.textContent = `Welcome, ${userName || "User"}`;
    } else {
        welcomeUser.textContent = "";
    }
}

if (addPartLink) {
    if (localStorage.getItem("token")) {
        addPartLink.style.display = "inline-block";
    } else {
        addPartLink.style.display = "none";
    }
}

if (logoutBtn) {
    if (localStorage.getItem("token")) {
        logoutBtn.style.display = "inline-block";
    } else {
        logoutBtn.style.display = "none";
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        window.location.href = "login.html";
    });
}

if (loginLink) {
    if (localStorage.getItem("token")) {
        loginLink.style.display = "none";
    } else {
        loginLink.style.display = "inline-block";
    }
}

async function loadParts() {
    if (!partsContainer) return;

    statusMessage.textContent = "Loading parts...";

    try {
        const response = await fetch(`${API_BASE_URL}/parts`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const parts = await response.json();

        currentParts = parts;
sortCurrentParts();
statusMessage.textContent = `${parts.length} parts loaded.`;
    } catch (error) {
        statusMessage.textContent = "Cannot load parts from server.";
    }
}

async function loadPartsByCategory(category) {
    if (!partsContainer) return;

    statusMessage.textContent = `Loading ${category} parts...`;

    try {
        const response = await fetch(`${API_BASE_URL}/parts/category/${category}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const parts = await response.json();

        currentParts = parts;
sortCurrentParts();
statusMessage.textContent = `${parts.length} ${category} parts loaded.`;
    } catch (error) {
        statusMessage.textContent = "Cannot load category data from server.";
    }
}

function displayParts(parts) {
    partsContainer.innerHTML = "";

    parts.forEach(function (part) {
        const card = document.createElement("div");
        card.className = "part-card";

       card.innerHTML = `
    <span class="badge">${part.category}</span>
    <h3>${part.name}</h3>
    <p><strong>Brand:</strong> ${part.brand}</p>
    <p class="price">${part.price} SAR</p>
    <p><strong>Rating:</strong> ${part.rating || 0} / 5</p>
    <p><strong>Warranty:</strong> ${part.warranty || "Not specified"}</p>
    <p><strong>Specification:</strong> ${part.specification}</p>
    <p><strong>Stock:</strong> ${part.stock}</p>
    <p><strong>ID:</strong> ${part.id}</p>
${localStorage.getItem("token") ? `
    <button class="details-btn" onclick="viewPartDetails(${part.id})">View Details</button>
    <button class="edit-btn" onclick="openEditPage(${part.id})">Edit</button>
    <button class="delete-btn" onclick="deletePart(${part.id})">Delete</button>
` : `
    <button class="details-btn" onclick="viewPartDetails(${part.id})">View Details</button>
`}
`;

        partsContainer.appendChild(card);
    });
}

if (partsContainer) {
    loadParts();
}

const addPartForm = document.getElementById("addPartForm");

if (addPartForm) {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
    }

    addPartForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const token = localStorage.getItem("token");
        const addMessage = document.getElementById("addMessage");

     const newPart = {
    name: document.getElementById("partName").value,
    category: document.getElementById("category").value,
    brand: document.getElementById("brand").value,
    price: document.getElementById("price").value,
    specification: document.getElementById("specification").value,
    description: document.getElementById("description").value,
    rating: document.getElementById("rating").value || 0,
    warranty: document.getElementById("warranty").value,
    stock: document.getElementById("stock").value,
    image_url: document.getElementById("imageUrl").value
};

        try {
            const response = await fetch(`${API_BASE_URL}/parts/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newPart)
            });

            const data = await response.json();

            if (response.ok) {
                addMessage.style.color = "green";
                addMessage.textContent = data.message || "Part added successfully.";
                addPartForm.reset();
            } else {
                addMessage.style.color = "red";
                addMessage.textContent = data.message || "Failed to add part.";
            }
        } catch (error) {
            addMessage.style.color = "red";
            addMessage.textContent = "Cannot connect to the server.";
        }
    });
}
async function viewPartDetails(id) {
    const detailsBox = document.getElementById("detailsBox");

    try {
        const response = await fetch(`${API_BASE_URL}/parts/${id}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const part = await response.json();

        detailsBox.style.display = "block";
        detailsBox.innerHTML = `
    <h3>Part Details</h3>
    <p><strong>ID:</strong> ${part.id}</p>
    <p><strong>Name:</strong> ${part.name}</p>
    <p><strong>Category:</strong> ${part.category}</p>
    <p><strong>Brand:</strong> ${part.brand}</p>
    <p><strong>Price:</strong> ${part.price} SAR</p>
    <p><strong>Rating:</strong> ${part.rating || 0} / 5</p>
    <p><strong>Warranty:</strong> ${part.warranty || "Not specified"}</p>
    <p><strong>Specification:</strong> ${part.specification}</p>
    <p><strong>Description:</strong> ${part.description || "No description available."}</p>
    <p><strong>Stock:</strong> ${part.stock}</p>
`;

        detailsBox.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        detailsBox.style.display = "block";
        detailsBox.innerHTML = "<p>Cannot load part details.</p>";
    }
}

function sortCurrentParts() {
    if (!partsContainer) return;

    const sortSelect = document.getElementById("sortSelect");
    const sortValue = sortSelect ? sortSelect.value : "default";

    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput ? searchInput.value.toLowerCase() : "";

    let filteredParts = currentParts.filter(function (part) {
        return (
            part.name.toLowerCase().includes(searchText) ||
            part.brand.toLowerCase().includes(searchText) ||
            part.category.toLowerCase().includes(searchText)
        );
    });

    if (sortValue === "priceLowHigh") {
        filteredParts.sort(function (a, b) {
            return Number(a.price) - Number(b.price);
        });
    } else if (sortValue === "priceHighLow") {
        filteredParts.sort(function (a, b) {
            return Number(b.price) - Number(a.price);
        });
    } else if (sortValue === "ratingHighLow") {
        filteredParts.sort(function (a, b) {
            return Number(b.rating) - Number(a.rating);
        });
    }

    displayParts(filteredParts);
}

function searchParts() {
    sortCurrentParts();

    const searchInput = document.getElementById("searchInput");
    const searchText = searchInput.value;

    const visibleCards = document.querySelectorAll(".part-card").length;
    statusMessage.textContent = `${visibleCards} result(s) found for "${searchText}".`;
}

async function deletePart(id) {
    const confirmed = confirm("Are you sure you want to delete this part?");

    if (!confirmed) {
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/parts/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Part deleted successfully.");

            currentParts = currentParts.filter(function (part) {
                return part.id !== id;
            });

            sortCurrentParts();

            if (statusMessage) {
                statusMessage.textContent = `${currentParts.length} parts loaded.`;
            }
        } else {
            alert(data.message || "Failed to delete part.");
        }
    } catch (error) {
        alert("Cannot connect to the server.");
    }
}

function openEditPage(id) {
    window.location.href = `edit-part.html?id=${id}`;
}

async function loadPartForEdit() {
    const editForm = document.getElementById("editPartForm");
    if (editForm && !localStorage.getItem("token")) {
    alert("You must login before editing a part.");
    window.location.href = "login.html";
    return;
}

    if (!editForm) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const partId = params.get("id");

    if (!partId) {
        document.getElementById("editMessage").textContent = "No part ID was provided.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/parts/${partId}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        const part = await response.json();

        document.getElementById("partName").value = part.name || "";
        document.getElementById("category").value = part.category || "";
        document.getElementById("brand").value = part.brand || "";
        document.getElementById("price").value = part.price || "";
        document.getElementById("specification").value = part.specification || "";
        document.getElementById("description").value = part.description || "";
        document.getElementById("rating").value = part.rating || 0;
        document.getElementById("warranty").value = part.warranty || "";
        document.getElementById("stock").value = part.stock || "";
        document.getElementById("imageUrl").value = part.image_url || "";
    } catch (error) {
        document.getElementById("editMessage").textContent = "Cannot load part data.";
    }

    editForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const token = localStorage.getItem("token");

        const updatedPart = {
            name: document.getElementById("partName").value,
            category: document.getElementById("category").value,
            brand: document.getElementById("brand").value,
            price: document.getElementById("price").value,
            specification: document.getElementById("specification").value,
            description: document.getElementById("description").value,
            rating: document.getElementById("rating").value || 0,
            warranty: document.getElementById("warranty").value,
            stock: document.getElementById("stock").value,
            image_url: document.getElementById("imageUrl").value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/parts/${partId}`, {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedPart)
            });

            const data = await response.json();

            if (response.ok) {
    document.getElementById("editMessage").textContent = data.message || "Part updated successfully.";

    setTimeout(function () {
        window.location.href = "dashboard.html";
    }, 1000);
} else {
    document.getElementById("editMessage").textContent = data.message || "Failed to update part.";
}
        } catch (error) {
            document.getElementById("editMessage").textContent = "Cannot connect to the server.";
        }
    });
}

loadPartForEdit();