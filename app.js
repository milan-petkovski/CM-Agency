const API_URL = "https://cmagency.onrender.com";

// Provera da li je korisnik već prijavljen
document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (username && password) {
        autoLogin(username, password);
    }
});

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
            showContent();
            loadItems();
        } else {
            alert("Pogrešno korisničko ime ili lozinka");
        }
    });
}

function autoLogin(username, password) {
    fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showContent();
            loadItems();
        } else {
            logout();
        }
    });
}

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    document.getElementById("content").classList.add("hidden");
    document.getElementById("login-box").classList.remove("hidden");
}

function showContent() {
    document.getElementById("login-box").classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");
}

function addItem() {
    const textInput = document.getElementById("textInput").value;
    if (!textInput) return;

    fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: textInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateList(data.items);
            document.getElementById("textInput").value = "";
        }
    });
}

function downloadList() {
    fetch(`${API_URL}/items`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const itemsText = data.items.map(i => i.name).join("\n");
            const blob = new Blob([itemsText], { type: "text/plain" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "lista.txt";
            a.click();
        }
    });
}

function loadItems() {
    fetch(`${API_URL}/items`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateList(data.items);
        }
    });
}

function updateList(items) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    items.reverse().forEach(i => {
        const li = document.createElement("li");
        li.textContent = i.count > 1 ? `${i.name} (x${i.count})` : i.name;

        // Kreiranje dugmeta za brisanje
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.classList.add("delete-btn");

        // Dodavanje funkcionalnosti za brisanje
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteItem(i.name);
        });

        // Omogućavanje precrtavanja na klik na stavku
        li.addEventListener("click", (e) => {
            if (e.target !== deleteButton) {
                li.classList.toggle("line-through");
            }
        });

        li.appendChild(deleteButton);
        list.appendChild(li);
    });
}


function deleteItem(itemName) {
    const encodedItemName = encodeURIComponent(itemName);

    fetch(`${API_URL}/delete/${encodedItemName}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateList(data.items);
        } else {
            console.log('Greška prilikom brisanja:', data.message);
        }
    })
    .catch(error => {
        console.error('Greška u zahtevima:', error);
    });
}
