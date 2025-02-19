const API_URL = "https://cmagency.onrender.com";

document.addEventListener("DOMContentLoaded", checkAuth);

function checkAuth() {
    const token = localStorage.getItem("token");
    const loginSection = document.getElementById("log");
    const contentSection = document.getElementById("content");
    const logoutButton = document.getElementById("logout");

    if (token) {
        fetch(`${API_URL}/verify`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loginSection.classList.add("hidden");
                contentSection.classList.remove("hidden");
                logoutButton.style.display = "block";
                loadItems();
                loadCategories();
            } else {
                logout();
            }
        })
        .catch(() => logout());
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

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            checkAuth();
        } else {
            alert("Pogrešno korisničko ime ili lozinka.");
        }
    })
    .catch(() => alert("Greška pri povezivanju sa serverom."));
}

function logout() {
    localStorage.removeItem("token");
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
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/items`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => { if (data.success) updateList(data.items); })
    .catch(error => console.error("Greška pri učitavanju stavki:", error));
}

function addItem() {
    const textInput = document.getElementById("textInput").value.trim();
    const categoryInput = document.getElementById("categoryInput").value.trim();
    if (!textInput || !categoryInput) return;
    
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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

function deleteItem(itemName) {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/delete/${encodeURIComponent(itemName)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => { if (data.success) updateList(data.items); });
}

function downloadItem(itemName) {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/download/${encodeURIComponent(itemName)}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = itemName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => console.error("Greška pri preuzimanju stavke:", error));
}