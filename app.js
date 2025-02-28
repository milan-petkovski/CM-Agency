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
        disableDevTools();
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
            localStorage.setItem("user", username);
            checkAuth();
        } else {
            alert(data.message || "Pogrešno korisničko ime ili lozinka");
        }
    })
    .catch(() => alert("Greška pri logovanju"));
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

            // Prvo podeliti kategorije u one sa stavkama i one bez
            const categoriesWithItems = [];
            const categoriesWithoutItems = [];

            // Napraviti API poziv za sve stavke, pa ih podeliti po kategorijama
            fetch(`${API_URL}/items`)
                .then(response => response.json())
                .then(itemData => {
                    if (itemData.success) {
                        const allItems = itemData.items;
                        
                        // Podeliti stavke po kategorijama
                        const categoryItemsMap = {};
                        allItems.forEach(item => {
                            if (!categoryItemsMap[item.category]) {
                                categoryItemsMap[item.category] = [];
                            }
                            categoryItemsMap[item.category].push(item);
                        });

                        // Podeliti kategorije sa stavkama i one bez
                        data.forEach(category => {
                            const itemCount = categoryItemsMap[category] ? categoryItemsMap[category].length : 0;
                            if (itemCount > 0) {
                                categoriesWithItems.push({ category, itemCount });
                            } else {
                                categoriesWithoutItems.push(category);
                            }
                        });

                        // Sortiranje kategorija po broju stavki
                        categoriesWithItems.sort((a, b) => b.itemCount - a.itemCount);

                        // Prikazivanje kategorija sa stavkama na vrhu
                        categoriesWithItems.forEach(({ category, itemCount }) => {
                            const option = document.createElement("option");
                            option.value = category;
                            option.textContent = `${itemCount} stavki`;
                            categoryList.appendChild(option);
                            filterCategoryList.appendChild(option.cloneNode(true)); // Dodaj i u filter
                        });

                        // Prikazivanje kategorija bez stavki na dnu
                        categoriesWithoutItems.forEach(category => {
                            const option = document.createElement("option");
                            option.value = category;
                            categoryList.appendChild(option);
                            filterCategoryList.appendChild(option.cloneNode(true)); // Dodaj i u filter
                        });
                    }
                })
                .catch(error => console.error("Greška pri učitavanju stavki:", error));
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
    if (!textInput || !categoryInput) {
        alert("Unesite naziv stavke i kategoriju.");
        return;
    }
    
    fetch(`${API_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: cleanURL(textInput), category: categoryInput })
    })
        .then(response => {
            if (response.status === 409) {
                return response.json().then(data => {
                    alert(data.message || "Stavka sa tim nazivom već postoji u toj kategoriji.");
                });
            }
            return response.json();
        })
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

async function showCategories() {
    const contentSection = document.getElementById("content");
    const categoryView = document.getElementById("kategorije");
    const mainContent = contentSection.querySelectorAll("h2, input, button, ul#list, p, a:not(#logout), .gore");

    // Zadrži prethodni prikaz (npr. #content) dok se podaci ne učitaju
    try {
        // Ne sakrivaj #content odmah, čekaj dok se podaci ne učitaju
        const response = await fetch("kategorije.json");
        const data = await response.json();

        // Popuni kategorije
        const categoryOnlyList = document.getElementById("klist");
        categoryOnlyList.innerHTML = ""; // Očisti prethodni sadržaj

        data.forEach(category => {
            const li = document.createElement("li");
            li.textContent = category;
            categoryOnlyList.appendChild(li);
        });

        // Sakrij prethodni prikaz i prikaži kategorije sa animacijom kada je DOM spreman
        mainContent.forEach(element => element.classList.add("hidden"));
        contentSection.classList.add("hidden");

        await new Promise(resolve => requestAnimationFrame(() => resolve())); // Sačekaj DOM ažuriranje

        categoryView.classList.remove("hidden");
    } catch (error) {
        console.error("Greška pri učitavanju kategorija:", error);
        // Vrati se na prethodni prikaz (npr. #content) bez animacije
        contentSection.classList.remove("hidden");
        mainContent.forEach(element => element.classList.remove("hidden"));
    }
}

async function showIframe() {
    const contentSection = document.getElementById("content");
    const categoryView = document.getElementById("kategorije");
    const iframeView = document.getElementById("server");
    const mainContent = contentSection.querySelectorAll("h2, input, button, ul#list, p, a:not(#logout), .gore");

    // Zadrži prethodni prikaz dok se iframe ne učita
    try {
        // Ne sakrivaj trenutni prikaz odmah, čekaj dok se iframe ne učita
        // Simuliraj učitavanje sa malim kašnjenjem (300ms) za sigurnost
        await new Promise(resolve => setTimeout(resolve, 300)); // Kratko kašnjenje

        // Sakrij prethodni prikaz i prikaži iframe sa animacijom kada je DOM spreman
        mainContent.forEach(element => element.classList.add("hidden"));
        contentSection.classList.add("hidden");
        categoryView.classList.add("hidden");

        await new Promise(resolve => requestAnimationFrame(() => resolve())); // Sačekaj DOM ažuriranje

        iframeView.classList.remove("hidden");
    } catch (error) {
        console.error("Greška pri učitavanju iframe-a:", error);
        // Vrati se na prethodni prikaz (npr. #content ili #kategorije)
        contentSection.classList.remove("hidden");
        mainContent.forEach(element => element.classList.remove("hidden"));
    }
}

async function backToMain() {
    const contentSection = document.getElementById("content");
    const categoryView = document.getElementById("kategorije");
    const iframeView = document.getElementById("server");
    const mainContent = contentSection.querySelectorAll("h2, input, button, ul#list, p, a:not(#logout), .gore");

    // Zadrži trenutni prikaz dok se podaci ne učitaju
    try {
        // Ne sakrivaj trenutni prikaz odmah, čekaj dok se podaci ne učitaju
        const response = await fetch(`${API_URL}/items`);
        const data = await response.json();

        if (data.success) {
            await updateList(data.items);
        } else {
            throw new Error("Neuspešno učitavanje stavki: " + data.message);
        }

        // Sakrij trenutni prikaz (kategorije ili iframe) i prikaži glavni sadržaj sa animacijom
        categoryView.classList.add("hidden");
        iframeView.classList.add("hidden");

        await new Promise(resolve => requestAnimationFrame(() => resolve())); // Sačekaj DOM ažuriranje

        contentSection.classList.remove("hidden");
        mainContent.forEach(element => element.classList.remove("hidden"));
    } catch (error) {
        console.error("Greška:", error);
        // Vrati se na prethodni prikaz (npr. #kategorije ili #server)
        if (!categoryView.classList.contains("hidden")) {
            categoryView.classList.remove("hidden");
        } else if (!iframeView.classList.contains("hidden")) {
            iframeView.classList.remove("hidden");
        }
    }
}

function disableDevTools() {
    document.onkeydown = (e) => {
        // Onemogućava F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    
        // Onemogućava Ctrl+Shift+I i Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) {
            e.preventDefault();
            return false;
        }
    
        // Onemogućava Ctrl+U
        if (e.ctrlKey && e.key === 'U') {
            e.preventDefault();
            return false;
        }
    };
};