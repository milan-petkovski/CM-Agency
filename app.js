const API_URL = "http://localhost:5055/api";

let items = [];
let categories = [];
let notepad = {
  id: -1,
  content: "",
};
let filterCategoryId = -1;
let showCompletedState = false;

async function init() {
  showCompletedState = true;
  await Promise.all([
    loadCategories().then(toggleShowCompleted),
    loadNotepad(),
  ]);
}

async function sendApiRequest(urlExtension, method, data) {
  try {
    const response = await fetch(`${API_URL}/${urlExtension}`, {
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
  document.getElementById("logout").classList.add("hidden");

  // Check authentication
  const isAuth = await checkAuth();
  if (!isAuth) return;

  await init();
  document.getElementById("logout").classList.remove("hidden");
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
    document.getElementById("logout").classList.remove("hidden");
    checkAuth();
  }
}

async function logout() {
  await sendApiRequest("auth/logout", "POST");
  checkAuth();
}

async function loadCategories() {
  const response = await sendApiRequest("category/full", "GET");
  categories = response;
  items = response.flatMap((c) => c.items).sort((a, b) => b.id - a.id);

  updateItemsUI();
  updateCategoryUI();
}

function updateCategoryUI() {
  const categoryList = document.getElementById("categoryList");
  const filterCategoryList = document.getElementById("filterCategoryList");

  categoryList.innerHTML = "";
  filterCategoryList.innerHTML = "";

  categories
    .map((x) => ({
      name: x.name,
      count: x.items.filter((x) => x.completed === showCompletedState).length,
    }))
    .sort((a, b) => b.count - a.count)
    .forEach(({ name, count }) => {
      const option = document.createElement("option");
      option.value = name;

      option.textContent = count === 0 ? name : `${count} stavki`;
      categoryList.appendChild(option);
      filterCategoryList.appendChild(option.cloneNode(true));
    });
}

function updateItemsUI() {
  const itemsInCategory =
    filterCategoryId < 1
      ? items
      : items.filter((x) => x.categoryId === filterCategoryId);

  if (itemsInCategory.length === 0 && filterCategoryId > 0) {
    alert("Nema stavki u ovoj kategoriji.");
    filterCategoryId = -1;
    updateItemsUI();
    return;
  }

  const filteredItems = itemsInCategory.filter(
    (x) => x.completed === showCompletedState
  );

  const list = document.getElementById("list");
  list.innerHTML = "";
  filteredItems.forEach((i) => {
    const li = document.createElement("li");
    const cleanedLink = cleanURL(i.name);
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)\/?$/;

    if (urlPattern.test(cleanedLink)) {
      const url = new URL(
        cleanedLink.startsWith("http") ? cleanedLink : `https://${cleanedLink}`
      );
      const cleanedLink2 =
        url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/+$/, "");

      const link = document.createElement("a");
      link.href = cleanedLink;
      link.textContent = cleanedLink2;
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

    if (i.completed) li.classList.add("line-through");

    li.addEventListener("dblclick", async (e) => {
      if (e.target === deleteButton) return;

      items = items.map((item) => {
        if (item.id === i.id) {
          item.completed = !item.completed;
        }
        return item;
      });

      updateItemsUI();

      const response = await sendApiRequest(
        "item/" + i.id + "/toggle-complete",
        "PUT"
      );

      if (!response) {
        items = items.map((item) => {
          if (item.id === i.id) {
            item.completed = !item.completed;
          }
          return item;
        });

        alert("Greška pri promjeni statusa stavke.");
        updateItemsUI();
      }
    });

    li.appendChild(deleteButton);
    list.appendChild(li);
  });
  const counter = document.getElementById("counter");
  counter.textContent = `Ukupno stavki: ${itemsInCategory.length} (${
    filteredItems.length
  } ${showCompletedState ? "zavrsenih" : "nezavrsenih"})`;
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

function toggleShowCompleted() {
  showCompletedState = !showCompletedState;
  updateCategoryUI();
  updateItemsUI();

  const showCompletedButton = document.getElementById("showCompletedButton");
  showCompletedButton.textContent = showCompletedState
    ? "Prikazi nezavrsene stavke"
    : "Prikazi zavrsene stavke";
}

async function addItem() {
  let textInput = cleanURL(document.getElementById("textInput").value.trim());
  const categoryInput = document.getElementById("categoryInput").value.trim();

  if (!textInput || !categoryInput) {
    alert("Unesite naziv stavke i kategoriju.");
    return;
  }

  const selectedCategory = categories.find(
    (category) => category.name === categoryInput
  );

  const selectedCategoryId = selectedCategory?.id;

  if (!selectedCategoryId || selectedCategoryId < 1) {
    alert("Odabrana kategorija ne postoji.");
    return;
  }

  const urlPattern =
    /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)\/?$/;

  if (urlPattern.test(textInput))
    textInput = textInput.startsWith("http")
      ? textInput.replace(/\/+$/, "")
      : `https://${textInput}`.replace(/\/+$/, "");

  if (items.some((i) => i.name.replace(/\/+$/, "") === textInput)) {
    alert("Stavka sa tim nazivom već postoji.");
    return;
  }

  const response = await sendApiRequest("item", "POST", {
    name: textInput,
    categoryId: selectedCategoryId,
  });

  if (!response) {
    alert("Greška pri dodavanju stavke.");
    return;
  }

  filterCategoryId = -1;
  showCompletedState = false;

  items = [response, ...items];
  selectedCategory.items = [response, ...selectedCategory.items];

  updateCategoryUI();
  updateItemsUI();
  document.getElementById("textInput").value = "";
  document.getElementById("categoryInput").value = "";
}

function filterItems() {
  const filterCategoryInput = document
    .getElementById("filterCategoryInput")
    .value.trim();

  const formattedCategoryInput =
    filterCategoryInput.charAt(0).toUpperCase() +
    filterCategoryInput.slice(1).toLowerCase();

  if (!formattedCategoryInput) {
    filterCategoryId = -1;
    updateItemsUI();
    return;
  }

  const selectedCategoryId = categories.find(
    (category) => category.name === formattedCategoryInput
  )?.id;

  if (!selectedCategoryId) {
    alert("Izabrana kategorija ne postoji.");
    filterCategoryId = -1;
    updateItemsUI();
    return;
  }

  filterCategoryId = selectedCategoryId;
  updateItemsUI();
}

function downloadList() {
  const text = items
    .filter((x) => filterCategoryId < 1 || x.categoryId === filterCategoryId)
    .map((item) => item.name)
    .join("\n");
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

  const item = items.find((item) => item.id === id);
  if (item) {
    const category = categories.find(
      (category) => category.id === item.categoryId
    );

    category.items = category.items.filter((item) => item.id !== id);
    updateCategoryUI();
  }

  items = items.filter((item) => item.id !== id);
  updateItemsUI();
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

async function openCategoriesTab() {
  const contentSection = document.getElementById("content");
  const categoryView = document.getElementById("kategorije");
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  try {
    const tabList = document.getElementById("klist");
    tabList.innerHTML = "";

    categories.forEach((category) => {
      const li = document.createElement("li");
      li.textContent = category.name;
      if (category.completed) li.classList.add("line-through");
      tabList.appendChild(li);

      li.addEventListener("dblclick", () =>
        toggleCategoryCompletion(category.id)
      );
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

  async function toggleCategoryCompletion(categoryId) {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      category.completed = !category.completed;
      openCategoriesTab();
    }

    const response = await sendApiRequest(
      "category/" + categoryId + "/toggle-complete",
      "PUT"
    );

    if (!response) alert("Greška pri promeni statusa kategorije.");
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
    updateItemsUI();

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
