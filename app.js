const API_URL = "https://cmagency.onrender.com";

document.addEventListener("DOMContentLoaded", checkAuth);

function checkAuth() {
    const user = localStorage.getItem("user");
    const loginSection = document.getElementById("log");
    const contentSection = document.getElementById("content");
    const logoutButton = document.getElementById("logout");

    if (user) {
        toggleVisibility(loginSection, false);
        toggleVisibility(contentSection, true);
        logoutButton.style.display = "block";
        loadItems();
        loadCategories();
    } else {
        toggleVisibility(loginSection, true);
        toggleVisibility(contentSection, false);
        logoutButton.style.display = "none";
    }
}

function toggleVisibility(element, isVisible) {
    element.classList.toggle("hidden", !isVisible);
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Unesite korisničko ime i lozinku.");
        return;
    }

    apiRequest("/login", "POST", { username, password })
        .then(data => {
            if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", username);
                checkAuth();
            } else {
                alert(data.message || "Pogrešno korisničko ime ili lozinka");
            }
        });
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    checkAuth();
}

function loadCategories() {
    Promise.all([fetch("kategorije.json").then(res => res.json()), apiRequest("/items")])
        .then(([categories, itemData]) => {
            if (!itemData.success) return;
            const categoryList = document.getElementById("categoryList");
            const filterCategoryList = document.getElementById("filterCategoryList");
            categoryList.innerHTML = filterCategoryList.innerHTML = "";

            const categoryItemsMap = itemData.items.reduce((map, item) => {
                map[item.category] = (map[item.category] || []).concat(item);
                return map;
            }, {});

            const categoriesWithItems = [];
            const categoriesWithoutItems = [];

            categories.forEach(category => {
                const itemCount = categoryItemsMap[category]?.length || 0;
                if (itemCount > 0) {
                    categoriesWithItems.push({ category, itemCount });
                } else {
                    categoriesWithoutItems.push(category);
                }
            });

            categoriesWithItems.sort((a, b) => b.itemCount - a.itemCount);

            const fragment = document.createDocumentFragment();
            categoriesWithItems.forEach(({ category, itemCount }) => {
                fragment.appendChild(createOption(category, `${itemCount} stavki`));
                filterCategoryList.appendChild(createOption(category, `${itemCount} stavki`));
            });
            categoriesWithoutItems.forEach(category => {
                fragment.appendChild(createOption(category, category));
                filterCategoryList.appendChild(createOption(category, category));
            });

            categoryList.appendChild(fragment);
        })
        .catch(error => console.error("Greška pri učitavanju kategorija ili stavki:", error));
}

function loadItems() {
    apiRequest("/items").then(data => {
        if (data.success) updateList(data.items);
    });
}

function addItem() {
    const textInput = document.getElementById("textInput").value.trim();
    const categoryInput = document.getElementById("categoryInput").value.trim();
    if (!textInput || !categoryInput) {
        alert("Unesite naziv stavke i kategoriju.");
        return;
    }

    apiRequest("/add", "POST", { item: cleanURL(textInput), category: categoryInput })
        .then(data => {
            if (data.success) {
                updateList(data.items);
                document.getElementById("textInput").value = "";
                document.getElementById("categoryInput").value = "";
            }
        });
}

function updateList(items) {
    const list = document.getElementById("list");
    list.innerHTML = "";
    const fragment = document.createDocumentFragment();
    items.reverse().forEach(i => {
        const li = document.createElement("li");
        const cleanedLink = cleanURL(i.name);
        const urlPattern = /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

        if (urlPattern.test(cleanedLink)) {
            const url = new URL(cleanedLink.startsWith("http") ? cleanedLink : `https://${cleanedLink}`);
            const link = document.createElement("a");
            link.href = cleanedLink;
            link.textContent = url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/+$/, "");
            link.target = "_blank";
            li.appendChild(link);
        } else {
            li.textContent = i.count > 1 ? `${i.name} (x${i.count})` : i.name;
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.classList.add("delete");
        deleteButton.addEventListener("click", e => {
            e.stopPropagation();
            deleteItem(i.name);
        });

        li.appendChild(deleteButton);
        fragment.appendChild(li);
    });

    list.appendChild(fragment);
    document.getElementById("counter").textContent = `Ukupno stavki: ${items.length}`;
}

function deleteItem(itemName) {
    apiRequest(`/delete/${encodeURIComponent(itemName)}`, "DELETE")
        .then(data => {
            if (data.success) updateList(data.items);
        });
}

function cleanURL(url) {
    return url.split("?")[0].replace(/https?:\/\/www\./, "https://").replace(/http:\/\/www\./, "http://");
}

function createOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

function apiRequest(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token");
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    };

    if (body) options.body = JSON.stringify(body);

    return fetch(`${API_URL}${endpoint}`, options)
        .then(response => {
            if (!response.ok) throw new Error(`Greška: ${response.status}`);
            return response.json();
        })
        .catch(error => {
            console.error("API greška:", error);
            alert("Došlo je do greške. Pokušajte ponovo.");
        });
}