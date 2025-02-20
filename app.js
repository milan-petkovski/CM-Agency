const API_URL = "https://cmagency.onrender.com";
let token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", checkAuth);

function checkAuth() {
    const loginSection = document.getElementById("log");
    const contentSection = document.getElementById("content");

    if (token) {
        loginSection.classList.add("hidden");
        contentSection.classList.remove("hidden");
        loadItems();
        loadCategories();
    } else {
        loginSection.classList.remove("hidden");
        contentSection.classList.add("hidden");
    }
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Unesite korisničko ime i lozinku.");
        return;
    }

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            token = data.token;
            localStorage.setItem("token", token);
            checkAuth();
        } else {
            alert(data.message || "Pogrešno korisničko ime ili lozinka");
        }
    })
    .catch(() => alert("Greška pri logovanju"));
}

function logout() {
    localStorage.removeItem("token");
    token = null;
    checkAuth();
}

function loadCategories() {
    fetch("kategorije.json")
        .then(response => response.json())
        .then(data => {
            const categoryList = document.getElementById("categoryList");
            const filterCategoryList = document.getElementById("filterCategoryList");
            categoryList.innerHTML = filterCategoryList.innerHTML = "";

            data.forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                categoryList.appendChild(option);
                filterCategoryList.appendChild(option.cloneNode(true));
            });
        })
        .catch(error => console.error("Greška pri učitavanju kategorija:", error));
}

function loadItems() {
    fetch(`${API_URL}/items`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => { if (data.success) updateList(data.items); })
    .catch(error => console.error("Greška pri učitavanju stavki:", error));
}

function cleanURL(url) {
    url = url.split("?")[0].replace(/https?:\/\/www\./, "https://").replace(/http:\/\/www\./, "http://");
    return url.includes("instagram.com") ? url.replace(/https?:\/\/www\./, "https://") : url;
}

function addItem() {
    const textInput = document.getElementById("textInput").value.trim();
    const categoryInput = document.getElementById("categoryInput").value.trim();
    if (!textInput || !categoryInput) {
        alert("Unesite naziv stavke i kategoriju.");
        return;
    }

    fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ item: textInput, category: categoryInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateList(data.items);
            document.getElementById("textInput").value = "";
            document.getElementById("categoryInput").value = "";
        }
    })
    .catch(error => console.error("Greška pri dodavanju stavki:", error));
}

function updateList(items) {
    const list = document.getElementById("list");
    list.innerHTML = "";
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
        
        li.addEventListener("click", e => {
            if (e.target !== deleteButton) li.classList.toggle("line-through");
        });
        
        li.appendChild(deleteButton);
        list.appendChild(li);
    });
    const counter = document.getElementById("counter");
    counter.textContent = `Ukupno stavki: ${items.length}`;
}

function filterItems() {
    const filterCategoryInput = document.getElementById("filterCategoryInput").value.trim();
    const validCategories = Array.from(document.getElementById("filterCategoryList").options).map(option => option.value);
    const formattedCategoryInput = filterCategoryInput.charAt(0).toUpperCase() + filterCategoryInput.slice(1).toLowerCase();

    if (filterCategoryInput && !validCategories.includes(formattedCategoryInput)) {
        alert("Izabrana kategorija ne postoji.");
        fetch(`${API_URL}/items`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateList(data.items);
                }
            })
            .catch(error => console.error("Greška pri učitavanju stavki:", error));
        return;
    }

    fetch(`${API_URL}/items`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const filteredItems = formattedCategoryInput ? data.items.filter(item => item.category === formattedCategoryInput) : data.items;
                document.getElementById("filterCategoryInput").value = "";
                if (!filteredItems.length) {
                    alert("Nema stavki u ovoj kategoriji.");
                    updateList(data.items);
                } else {
                    updateList(filteredItems);
                }
            }
        })
        .catch(error => console.error("Greška pri učitavanju stavki:", error));
}

function downloadList() {
    fetch(`${API_URL}/download`)
        .then(response => response.blob())
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "lista.txt";
            a.click();
        });
}

function deleteItem(itemName) {
    fetch(`${API_URL}/delete/${encodeURIComponent(itemName)}`, { method: "DELETE" })
        .then(response => response.json())
        .then(data => { if (data.success) updateList(data.items); });
}

function searchList() {
    const searchQuery = prompt("Unesite pojam za pretragu:");
    if (!searchQuery) return;

    const listItems = document.querySelectorAll("#list li");
    let visibleItemsCount = 0;

    listItems.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        if (itemText.includes(searchQuery.toLowerCase())) {
            item.style.display = "";
            visibleItemsCount++;
        } else {
            item.style.display = "none";
        }
    });

    const counter = document.getElementById("counter");
    counter.textContent = `Ukupno stavki: ${visibleItemsCount}`;
}