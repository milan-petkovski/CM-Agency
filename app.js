const API_URL = "https://cmagency.onrender.com";

document.addEventListener("DOMContentLoaded", checkAuth);

function checkAuth() {
    const user = localStorage.getItem("user");
    const loginSection = document.getElementById("log");
    const contentSection = document.getElementById("content");
    const logoutButton = document.getElementById("logout");

    if (user) {
        loginSection.classList.add("hidden");
        contentSection.classList.remove("hidden");
        logoutButton.style.display = "block";
        loadItems();
        loadCategories();
    } else {
        loginSection.classList.remove("hidden");
        contentSection.classList.add("hidden");
        logoutButton.style.display = "none";
    }
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Unesite korisničko ime i lozinku.");
        return;
    }

    localStorage.setItem("user", username);
    checkAuth();
}

function logout() {
    localStorage.removeItem("user");
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
                [categoryList, filterCategoryList].forEach(list => {
                    const option = document.createElement("option");
                    option.value = category;
                    list.appendChild(option);
                });
            });
        })
        .catch(error => console.error("Greška pri učitavanju kategorija:", error));
}

function loadItems() {
    fetch(`${API_URL}/items`)
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
    if (!textInput || !categoryInput) return;
    
    fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: cleanURL(textInput), category: categoryInput })
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
}

function filterItems() {
    const filterCategoryInput = document.getElementById("filterCategoryInput").value.trim();
    fetch(`${API_URL}/items`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const filteredItems = filterCategoryInput ? data.items.filter(item => item.category === filterCategoryInput) : data.items;
                if (!filteredItems.length) alert("Nema stavki u ovoj kategoriji.");
                updateList(filteredItems);
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