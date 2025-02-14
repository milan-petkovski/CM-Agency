const API_URL = "https://cmagency.onrender.com";  // Zameni sa tvojim Render URL-om

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
            logout(); // Ako ne uspe, briše podatke
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
            document.getElementById("textInput").value = ""; // Obriši input
        }
    });
}

function downloadList() {
    fetch(`${API_URL}/items`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const itemsText = data.items.map(i => i.name).join("\n"); // Samo naziv
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
    list.innerHTML = ""; // Očistiti prethodni sadržaj liste

    // Dodavanje novih elemenata na vrh
    items.reverse().forEach(i => {
        const li = document.createElement("li");
        li.textContent = i.count > 1 ? `${i.name} (x${i.count})` : i.name;

        // Kreiranje dugmeta za brisanje
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.classList.add("delete-btn");

        // Dodavanje funkcionalnosti za brisanje
        deleteButton.addEventListener("click", () => {
            deleteItem(i.name);
        });

        li.appendChild(deleteButton);
        list.appendChild(li);
    });
}

function deleteItem(itemName) {
    fetch(`${API_URL}/delete/${itemName}`, {
        method: "DELETE"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateList(data.items); // Osvežavanje liste
        }
    });
}
