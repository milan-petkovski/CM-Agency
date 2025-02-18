const API_URL = "https://cmagency.onrender.com";

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
    document.getElementById("log").classList.remove("hidden");
}

function showContent() {
    document.getElementById("log").classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");
}

function addItem() {
    const textInput = document.getElementById("textInput").value;
    if (!textInput) return;

    // Check if the input is a URL and remove the protocol, www., and trailing slashes
    const urlPattern = /^(https?:\/\/)?(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    let displayText = textInput;

    if (urlPattern.test(textInput)) {
        const url = new URL(textInput);
        displayText = url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/+$/, '');
    }

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

        // Check if the item is a URL
        const urlPattern = /^(https?:\/\/)?(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (urlPattern.test(i.name)) {
            const url = new URL(i.name);
            const displayText = url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/+$/, '');
            const link = document.createElement("a");
            link.href = i.name;
            link.textContent = displayText;
            link.target = "_blank"; // Open in new tab
            li.appendChild(link);
        } else {
            li.textContent = i.count > 1 ? `${i.name} (x${i.count})` : i.name;
        }

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.classList.add("delete");

        // Add delete functionality
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteItem(i.name);
        });

        // Enable strikethrough on click
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