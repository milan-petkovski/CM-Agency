const API_URL_V2 = "http://localhost:5055/api";

let items = [];
let categories = [];
let notepad = {
  id: -1,
  content: "",
};

async function init() {
  await loadCategories();
  await loadNotepad();
}

async function sendApiRequest(uri, method, data) {
  try {
    const response = await fetch(`${API_URL_V2}/${uri}`, {
      method: method,
      headers:
        method === "GET" ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      console.error("Greška pri slanju api request-a:", response);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Greška pri slanju api request-a:", error);
    return null;
  }
}

async function loadNotepad() {
  // Set up notepad functionality with debounce
  const notepadTextarea = document.getElementById("notepadContent");
  if (!notepadTextarea) return;

  const response = await sendApiRequest("notepad/default", "GET");
  if (response) {
    notepad = response;
    notepadTextarea.value = notepad.content;
  }

  const debounceSave = debounce(async () => {
    console.log("Saving notepad content...");

    const content = notepadTextarea.value;
    notepad.content = content;

    sendApiRequest("notepad", "PUT", notepad);
  }, 500);

  notepadTextarea.addEventListener("input", debounceSave);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check authentication
  const isAuth = await checkAuth();
  if (isAuth) await init();
});

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function checkAuth() {
  const user = await sendApiRequest("auth/status", "GET");

  const loginSection = document.getElementById("log");
  const contentSection = document.getElementById("content");
  const logoutButton = document.getElementById("logout");

  if (user) {
    loginSection.classList.add("hidden");
    contentSection.classList.remove("hidden");
    logoutButton.style.display = "block";
    return true;
  }

  loginSection.classList.remove("hidden");
  contentSection.classList.add("hidden");
  logoutButton.style.display = "none";
  disableDevTools();
  return false;
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Unesite korisničko ime i lozinku.");
    return;
  }

  const response = await sendApiRequest("auth/login", "POST", {
    username,
    password,
  });

  if (!response) alert("Pogrešno korisničko ime ili lozinka");
  else {
    await init();
    checkAuth();
  }
}

async function logout() {
  await sendApiRequest("auth/logout", "POST");
  checkAuth();
}

async function loadCategories() {
  const response = await sendApiRequest("category/full", "GET");
  categories = response
    .map((c) => ({
      ...c,
      count: c.items.length,
    }))
    .sort((a, b) => b.count - a.count);
  items = response.flatMap((c) => c.items).sort((a, b) => b.id - a.id);

  updateList(items);

  const categoryList = document.getElementById("categoryList");
  const filterCategoryList = document.getElementById("filterCategoryList");

  categories.forEach(({ name, count: itemsCount }) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent =
      itemsCount === 0 ? name : `${name}: ${itemsCount} stavki`;
    categoryList.appendChild(option);
    filterCategoryList.appendChild(option.cloneNode(true)); // Dodaj i u filter
  });
}

function cleanURL(url) {
  url = url
    .split("?")[0]
    .replace(/https?:\/\/www\./, "https://")
    .replace(/http:\/\/www\./, "http://");
  return url.includes("instagram.com")
    ? url.replace(/https?:\/\/www\./, "https://")
    : url;
}

async function addItem() {
  const textInput = document.getElementById("textInput").value.trim();
  const categoryInput = document.getElementById("categoryInput").value.trim();

  if (!textInput || !categoryInput) {
    alert("Unesite naziv stavke i kategoriju.");
    return;
  }

  const selectedCategoryId = categories.find(
    (category) => category.name === categoryInput
  )?.id;

  if (!selectedCategoryId || selectedCategoryId < 1) {
    alert("Odabrana kategorija ne postoji.");
    return;
  }

  if (items.some((i) => i.name === textInput)) {
    alert("Stavka sa tim nazivom već postoji.");
    return;
  }

  const response = await sendApiRequest("item", "POST", {
    name: cleanURL(textInput),
    categoryId: selectedCategoryId,
  });

  if (!response) {
    alert("Greška pri dodavanju stavke.");
    return;
  }

  items = [response, ...items];
  updateList(items);
  document.getElementById("textInput").value = "";
  document.getElementById("categoryInput").value = "";
}

function updateList(items) {
  const list = document.getElementById("list");
  list.innerHTML = "";
  items.forEach((i) => {
    const li = document.createElement("li");
    const cleanedLink = cleanURL(i.name);
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)\/?$/;

    if (urlPattern.test(cleanedLink)) {
      const url = new URL(
        cleanedLink.startsWith("http") ? cleanedLink : `https://${cleanedLink}`
      );
      const link = document.createElement("a");
      link.href = cleanedLink;
      link.textContent =
        url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/+$/, "");
      link.target = "_blank";
      li.appendChild(link);
    } else {
      li.textContent = i.name;
    }

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete");
    deleteButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteItem(i.id);
    });

    li.addEventListener("click", (e) => {
      if (e.target !== deleteButton) li.classList.toggle("line-through");
    });

    li.appendChild(deleteButton);
    list.appendChild(li);
  });
  const counter = document.getElementById("counter");
  counter.textContent = `Ukupno stavki: ${items.length}`;
}

function filterItems() {
  const filterCategoryInput = document
    .getElementById("filterCategoryInput")
    .value.trim();

  const formattedCategoryInput =
    filterCategoryInput.charAt(0).toUpperCase() +
    filterCategoryInput.slice(1).toLowerCase();

  if (!formattedCategoryInput) {
    updateList(items);
    return;
  }

  const selectedCategoryId = categories.find(
    (category) => category.name === formattedCategoryInput
  )?.id;

  if (!selectedCategoryId) {
    alert("Izabrana kategorija ne postoji.");

    updateList(items);
    return;
  }

  const filteredItems = items.filter(
    (item) => item.categoryId === selectedCategoryId
  );

  if (filteredItems.length === 0) {
    alert("Nema stavki u ovoj kategoriji.");
    updateList(items);
    return;
  }

  updateList(filteredItems);
}

function downloadList() {
  const text = items.map((item) => item.name).join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lista.txt";
  a.click();
}

async function deleteItem(id) {
  const response = await sendApiRequest("item/" + id, "DELETE");
  if (!response) {
    alert("Greška pri brisanju stavke.");
    return;
  }

  items = items.filter((item) => item.id !== id);
  updateList(items);
}

function searchList() {
  const searchQuery = prompt("Unesite pojam za pretragu:");
  if (!searchQuery) return;

  const listItems = document.querySelectorAll("#list li");
  let visibleItemsCount = 0;

  listItems.forEach((item) => {
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
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  // Zadrži prethodni prikaz (npr. #content) dok se podaci ne učitaju
  try {
    // Ne sakrivaj #content odmah, čekaj dok se podaci ne učitaju
    const response = await fetch("kategorije.json");
    const data = await response.json();

    // Popuni kategorije
    const categoryOnlyList = document.getElementById("klist");
    categoryOnlyList.innerHTML = ""; // Očisti prethodni sadržaj

    data.forEach((category) => {
      const li = document.createElement("li");
      li.textContent = category;
      categoryOnlyList.appendChild(li);
    });

    // Sakrij prethodni prikaz i prikaži kategorije sa animacijom kada je DOM spreman
    mainContent.forEach((element) => element.classList.add("hidden"));
    contentSection.classList.add("hidden");

    await new Promise((resolve) => requestAnimationFrame(() => resolve())); // Sačekaj DOM ažuriranje

    categoryView.classList.remove("hidden");
  } catch (error) {
    console.error("Greška pri učitavanju kategorija:", error);
    // Vrati se na prethodni prikaz (npr. #content) bez animacije
    contentSection.classList.remove("hidden");
    mainContent.forEach((element) => element.classList.remove("hidden"));
  }
}

async function showNotepad() {
  const contentSection = document.getElementById("content");
  const categoryView = document.getElementById("kategorije");
  const iframeView = document.getElementById("server");
  const notepadView = document.getElementById("notepad");
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  try {
    // Hide other views
    mainContent.forEach((element) => element.classList.add("hidden"));
    contentSection.classList.add("hidden");
    categoryView.classList.add("hidden");
    iframeView.classList.add("hidden");

    await new Promise((resolve) => requestAnimationFrame(() => resolve()));

    notepadView.classList.remove("hidden");
  } catch (error) {
    console.error("Greška pri učitavanju notepad-a:", error);
    contentSection.classList.remove("hidden");
    mainContent.forEach((element) => element.classList.remove("hidden"));
  }
}

async function showIframe() {
  const contentSection = document.getElementById("content");
  const categoryView = document.getElementById("kategorije");
  const iframeView = document.getElementById("server");
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  // Zadrži prethodni prikaz dok se iframe ne učita
  try {
    // Ne sakrivaj trenutni prikaz odmah, čekaj dok se iframe ne učita
    // Simuliraj učitavanje sa malim kašnjenjem (300ms) za sigurnost
    await new Promise((resolve) => setTimeout(resolve, 300)); // Kratko kašnjenje

    // Sakrij prethodni prikaz i prikaži iframe sa animacijom kada je DOM spreman
    mainContent.forEach((element) => element.classList.add("hidden"));
    contentSection.classList.add("hidden");
    categoryView.classList.add("hidden");

    await new Promise((resolve) => requestAnimationFrame(() => resolve())); // Sačekaj DOM ažuriranje

    iframeView.classList.remove("hidden");
  } catch (error) {
    console.error("Greška pri učitavanju iframe-a:", error);
    // Vrati se na prethodni prikaz (npr. #content ili #kategorije)
    contentSection.classList.remove("hidden");
    mainContent.forEach((element) => element.classList.remove("hidden"));
  }
}

async function backToMain() {
  const contentSection = document.getElementById("content");
  const categoryView = document.getElementById("kategorije");
  const iframeView = document.getElementById("server");
  const notepadView = document.getElementById("notepad");
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  try {
    updateList(items);

    // Hide all secondary views explicitly
    categoryView.classList.add("hidden");
    iframeView.classList.add("hidden");
    notepadView.classList.add("hidden");

    // Wait for DOM to update
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));

    // Show main content
    contentSection.classList.remove("hidden");
    mainContent.forEach((element) => {
      element.classList.remove("hidden");
    });
  } catch (error) {
    console.error("Greška u backToMain:", error);
    // Revert to the previous visible view if there’s an error
    if (!categoryView.classList.contains("hidden")) {
      categoryView.classList.remove("hidden");
      contentSection.classList.add("hidden");
    } else if (!iframeView.classList.contains("hidden")) {
      iframeView.classList.remove("hidden");
      contentSection.classList.add("hidden");
    } else if (!notepadView.classList.contains("hidden")) {
      notepadView.classList.remove("hidden");
      contentSection.classList.add("hidden");
    }
  }
}

function disableDevTools() {
  document.onkeydown = (e) => {
    // Onemogućava F12
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }

    // Onemogućava Ctrl+Shift+I i Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) {
      e.preventDefault();
      return false;
    }

    // Onemogućava Ctrl+U
    if (e.ctrlKey && e.key === "U") {
      e.preventDefault();
      return false;
    }
  };
}
