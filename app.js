const API_URL = "https://cmagency-backend.onrender.com/api";

let items = [];
let categories = [];
let notepad = { id: -1, content: "" };
let filterCategoryId = -1;
let selectedDisplayLang = "en";
let showCompletedState = false;
setInterval(updateBelgradeWeather, 1000);
updateBelgradeWeather();

const languageBtn = document.getElementById("languageBtn");
if (!languageBtn) throw new Error("Greška pri učitavanju stranice");

const addEventListeners = () => {
  languageBtn.addEventListener("click", changeDisplayLang);

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.querySelector(".toggle-password");

  [usernameInput, passwordInput].forEach((input) =>
    input.addEventListener("keypress", (e) => e.key === "Enter" && login())
  );

  passwordInput.addEventListener("input", () => {
    togglePassword.style.display = passwordInput.value ? "block" : "none";
  });
};
const initializeApp = async () => {
  const logoutBtn = document.getElementById("logout");
  logoutBtn.classList.add("hidden");

  if (await checkAuth()) {
    await init();
    logoutBtn.classList.remove("hidden");
  }
};
document.addEventListener("DOMContentLoaded", () => {
  addEventListeners();
  loadExternalLibraries();
  initializeApp();
});

// API POMOĆNE FUNKCIJE
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

async function init() {
  document.getElementById("password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    login();
  }
  });
  
  showCompletedState = true;
  await Promise.all([
    loadCategories().then(toggleShowCompleted),
    loadNotepad(),
  ]);
}

async function checkAuth() {
  const user = await sendApiRequest("auth/status", "GET");

  const loginSection = document.getElementById("log");
  const portalSection = document.getElementById("portal-content");
  const logoutButton = document.getElementById("logout");

  console.log("Prijavljen:", user);

  if (!user) {
    loginSection.classList.remove("hidden");
    portalSection.classList.add("hidden");
    logoutButton.classList.add("hidden");
    document.getElementById("username").focus();
    disableDevTools();
    return false;
  }

  loginSection.classList.add("hidden");
  portalSection.classList.remove("hidden");
  logoutButton.classList.remove("hidden");

  if (user.username !== "luka" && user.username !== "milan") return true;

  const motivationalQuotes = [
  // Jul 2025.
  "Jul počinje! Novi mesec, nova energija. Danas zacrtaj ciljeve koji te uzbuđuju i kreni ka njima bez oklevanja.",
  "Uspeh ne dolazi slučajno. Danas uloži disciplinu u svaki korak i rezultati će te sami pronaći.",
  "Ne traži motivaciju spolja – stvori je iznutra. Tvoja odlučnost danas otvara vrata sutrašnjeg rasta.",
  "Svaki dan je šansa da budeš bolji lider, bolji kreator, bolji ti. Iskoristi današnji potencijal u potpunosti.",
  "Kada deluješ sa strašću, klijenti to osećaju. Danas neka tvoj entuzijazam bude tvoj najjači alat.",
  "I najmanji napredak je bolji od stajanja u mestu. Danas napravi bar jedan korak ka svom cilju.",
  "Biznis je igra dugoročnog fokusa. Danas ne traži brze rezultate – gradi temelje koji traju.",
  "Tvoje ideje vrede. Danas ih pretvori u konkretne ponude i pokaži svetu šta možeš.",
  "Tvoje vreme je valuta – troši ga mudro. Danas eliminiši ono što ne doprinosi tvom cilju.",
  "Dan bez akcije je izgubljena prilika. Pokreni nešto – makar malo, makar nesavršeno.",
  "Sumnje su normalne, ali delovanje je ono što pravi razliku. Danas biraj akciju umesto sumnje.",
  "Ako ne ti – ko? Ako ne sada – kada? Danas je tvoj trenutak. Pokaži inicijativu.",
  "Sav trud do sada ima smisla samo ako danas nastaviš. Nema pauze – samo sledeći nivo.",
  "Ne postoji loš dan – samo dan sa lekcijom. Iskoristi svaki izazov kao odskočnu dasku.",
  "Danas radi kao da ceo svet gleda. I ako niko ne vidi – ti znaš da daješ maksimum.",
  "Vizija bez akcije je san. Danas radi na tome da tvoja vizija postane tvoj život.",
  "Umesto da se pitaš 'šta ako ne uspe?', danas se zapitaj 'šta ako uspe bolje nego što zamišljam?'",
  "Tvoje ime može postati brend. Danas gradi poverenje, doslednost i vrednost.",
  "Nije važno koliko puta padneš – važno je da danas ustaneš i probaš ponovo.",
  "Niko ne dolazi da ti da dozvolu. Danas sebi daj dozvolu da uspeš.",
  "Ne čekaj idealne uslove. Danas je dovoljno dobar dan da napraviš razliku.",
  "Rad koji se ne vidi odmah, danas je seme koje sutra daje plodove. Nastavi da sadiš.",
  "Tvoje granice su tamo gde ih ti postaviš. Danas ih pomeri bar za korak napred.",
  "Ti nisi rezultat okolnosti – ti si kreator rezultata. Danas se ponašaj kao lider.",
  "Svaka poruka, svaki dizajn, svaki mejl – sve to danas gradi tvoju reputaciju. Radi kvalitetno.",
  "Ne traži inspiraciju – budi inspiracija. Danas tvoj rad može zapaliti nečiju iskru.",
  "Jul je mesec kada se drugi uspavaju. Ti danas budi onaj koji grabi prilike.",
  "Svakim danom si sve bliže onome što želiš. Danas je još jedan važan korak.",
  "Danas pokaži profesionalnost čak i kad ti se ne radi. To je razlika između proseka i uspeha.",
  "Zamisli sebe na kraju meseca ponosnog – pa danas radi kao taj budući ti.",
  "Poslednji dan jula – pogledaj unazad sa zahvalnošću, ali gledaj napred sa ambicijom. Avgust te čeka – još jači!"
  ];

  const dateStr = localStorage.getItem("gotQuoteOfDay");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  if (dateStr === todayStr) return true;

  localStorage.setItem("gotQuoteOfDay", todayStr);

  const startDate = new Date("2025-07-01");
  startDate.setHours(0, 0, 0, 0);

  const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const quote = motivationalQuotes[daysPassed] || "Danas je pravi dan da uradiš nešto za svoj uspeh.";

  showNotification1(quote, "neutral");

  return true;
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginButton = document.querySelector("#log button");

  if (!username || !password) {
    showNotification("Unesite korisničko ime i lozinku.", "error");
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "Prijavljivanje...";

  const response = await sendApiRequest("auth/login", "POST", {
    username,
    password,
  });

  loginButton.disabled = false;
  loginButton.textContent = "Prijavi se";

  if (!response) {
    showNotification("Pogrešno korisničko ime ili lozinka.", "error");
  } else {
    const obavestenjeParagraf = document.querySelector(".obavestenje p");
    const obavestenjeSadrzaj = obavestenjeParagraf.textContent.trim();

    if (obavestenjeSadrzaj === "") {
      showPortal();
    } else {
      document.querySelector(".prijava").classList.add("hidden");
      document.querySelector(".obavestenje").classList.remove("hidden");
    }
    showNotification("Uspešno ste se prijavili!", "success");
  }
}

function showPortal() {
  document.getElementById("log").classList.add("hidden");
  document.getElementById("portal-content").classList.remove("hidden");
  document.getElementById("logout").classList.remove("hidden");
  checkAuth();
  init();
}

async function logout() {
  await sendApiRequest("auth/logout", "POST");
  showNotification("Uspešno ste se odjavili!", "success");
  document.getElementById("log").classList.remove("hidden");
  document.querySelector(".prijava").classList.remove("hidden");
  document.querySelector(".obavestenje").classList.add("hidden");
  document.getElementById("portal-content").classList.add("hidden");
  document.getElementById("logout").classList.add("hidden");
}

// POMOĆNE FUNKCIJE
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

function cleanURL(url) {
  url = url.trim();
  url = url.split("?")[0];
  url = url.replace(/^https?:\/\/(www\.)?/, "");
  url = url.replace("/@", "/");
  
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  return url.replace(/\/+$/, "");
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function togglePassword() {
  const password = document.getElementById("password");
  const eye = document.getElementById("eye-icon");
  password.type = password.type === "password" ? "text" : "password";
  eye.name = password.type === "password" ? "eye-outline" : "eye-off-outline";
}

async function refreshPortal() {
  const portalContent = document.getElementById("portal-content");
  if (!portalContent) return;

  items = [];
  categories = [];
  notepad = { id: -1, content: "" };
  filterCategoryId = -1;
  showCompletedState = false;

  document.getElementById("textInput").value = "";
  document.getElementById("categoryInput").value = "";
  document.getElementById("filterCategoryInput").value = "";
  document.getElementById("list").innerHTML = "";
  document.getElementById("categoryList").innerHTML = "";
  document.getElementById("filterCategoryList").innerHTML = "";
  document.getElementById("counter").textContent = "Učitavanje...";

  // Ponovno učitavanje podataka
  await init();
}

// FUNKCIJE ZA UI AŽURIRANJE
function updateCategoryUI() {
  const categoryList = document.getElementById("categoryList");
  const filterCategoryList = document.getElementById("filterCategoryList");

  categoryList.innerHTML = "";
  filterCategoryList.innerHTML = "";

  categories
    .map((x) => ({
      id: x.id,
      name: x.name,
      engCount: x.items.filter(
        (x) => x.completed === showCompletedState && x.langCode === "en"
      ).length,
      srCount: x.items.filter(
        (x) => x.completed === showCompletedState && x.langCode === "sr"
      ).length,
    }))
    .sort(
      selectedDisplayLang === "sr"
        ? (a, b) => b.srCount - a.srCount
        : (a, b) => b.engCount - a.engCount
    )
    .forEach(({ name, engCount, srCount }) => {
      const option = document.createElement("option");
      option.value = name;

      const count = selectedDisplayLang === "sr" ? srCount : engCount;
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
    showNotification("Nema stavki u ovoj kategoriji.", "error");
    filterCategoryId = -1;
    updateItemsUI();
    return;
  }

  const languageItems = itemsInCategory.filter(
    (x) => x.langCode === selectedDisplayLang
  );

  const filteredItems = languageItems.filter(
    (x) => x.completed === showCompletedState
  );

  const list = document.getElementById("list");
  list.innerHTML = "";

  if (filteredItems.length === 0 && !showCompletedState) {
    const li = document.createElement("li");
    li.textContent = "Nema nezavršenih stavki";
    li.classList.add("empty-message");
    list.appendChild(li);
  } else {
    filteredItems.forEach((i) => {
      const li = document.createElement("li");
      const cleanedLink = cleanURL(i.name);
      const urlPattern =
        /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)\/?$/;

      if (urlPattern.test(cleanedLink)) {
        const url = new URL(
          cleanedLink.startsWith("https://") ||
          cleanedLink.startsWith("http://")
            ? cleanedLink.replace("http://", "https://")
            : `https://${cleanedLink}`
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
      deleteButton.classList.add("unselectable");
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
          showNotification("Greška prilikom promene statusa stavke.", "error");
          updateItemsUI();
        } else {
          const updatedItem = items.find((item) => item.id === i.id);
          if (updatedItem.completed) {
            showNotification("Označena kao gotova!", "success");
          } else {
            showNotification("Vraćena u nezavršene!", "success");
          }
        }
      });

      li.appendChild(deleteButton);
      list.appendChild(li);
    });
  }

  const counter = document.getElementById("counter");
  counter.textContent = `Ukupno stavki: ${languageItems.length} (${
    filteredItems.length
  } ${showCompletedState ? "zavrsenih" : "nezavrsenih"})`;
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

// FUNKCIJE ZA MANIPULACIJU PODACIMA
async function loadCategories() {
  const response = await sendApiRequest("category/full", "GET");
  if (!response) {
    showNotification(
      "Greška prilikom učitavanja kategorija. Pokušajte ponovo.",
      "error"
    );
    return;
  }
  categories = response;
  items = response.flatMap((c) => c.items).sort((a, b) => b.id - a.id);

  updateItemsUI();
  updateCategoryUI();
}

async function loadNotepad() {
  const notepadTextarea = document.getElementById("notepadContent");
  if (!notepadTextarea) return;

  const response = await sendApiRequest("notepad/default", "GET");
  if (!response) {
    showNotification("Greška prilikom učitavanja notepada!", "error");
    return;
  }
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

async function addItem() {
  let textInput = cleanURL(document.getElementById("textInput").value.trim());
  const categoryInput = document.getElementById("categoryInput").value.trim();
  const addButton = document.getElementById("addItemBtn");

  if (!textInput || !categoryInput) {
    showNotification("Unesite naziv stavke i kategoriju.", "error");
    return;
  }

  const selectedCategory = categories.find(
    (category) => category.name === categoryInput
  );

  const selectedCategoryId = selectedCategory?.id;

  if (!selectedCategoryId || selectedCategoryId < 1) {
    showNotification("Odabrana kategorija ne postoji.", "error");
    return;
  }

  const urlPattern =
    /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)\/?$/;

  if (urlPattern.test(textInput))
    textInput = textInput.startsWith("http")
      ? textInput.replace(/\/+$/, "")
      : `https://${textInput}`.replace(/\/+$/, "");

  if (items.some((i) => i.name.replace(/\/+$/, "") === textInput)) {
    showNotification("Stavka sa tim nazivom već postoji.", "error");
    document.getElementById("textInput").value = "";
    document.getElementById("categoryInput").value = "";
    return;
  }

  addButton.disabled = true;
  addButton.textContent = "Dodavanje...";

  const response = await sendApiRequest("item", "POST", {
    name: textInput,
    categoryId: selectedCategoryId,
    langCode: selectedDisplayLang,
  });

  addButton.disabled = false;
  addButton.textContent = "Dodaj";

  if (!response) {
    showNotification("Greška prilikom dodavanja stavke.", "error");
    document.getElementById("textInput").value = "";
    document.getElementById("categoryInput").value = "";
    return;
  }

  showNotification("Stavka uspešno dodata!", "success");
  filterCategoryId = -1;
  showCompletedState = false;

  items = [response, ...items];
  selectedCategory.items = [response, ...selectedCategory.items];

  updateCategoryUI();
  updateItemsUI();
  document.getElementById("textInput").value = "";
  document.getElementById("categoryInput").value = "";
}

async function addCategory() {
  const categoryName = prompt("Unesite naziv nove kategorije:");
  if (!categoryName || categoryName.trim() === "") {
    showNotification("Morate uneti naziv kategorije!", "error");
    return;
  }

  const formattedName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

  if (categories.some((cat) => cat.name === formattedName)) {
    showNotification("Kategorija sa ovim nazivom već postoji!", "error");
    return;
  }

  const response = await sendApiRequest("category/bulk", "POST", [
    { name: formattedName },
  ]);

  if (!response || response.isFailed || !response.isSuccess) {
    showNotification("Greška prilikom dodavanja kategorije!", "error");
    return;
  }

  const newCategory = {
    id: Date.now(),
    name: formattedName,
    items: [],
    completed: false,
  };

  categories.push(newCategory);

  const categoryList = document.getElementById("klist");
  if (categoryList) {
    const li = document.createElement("li");
    li.textContent = newCategory.name;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete");
    deleteButton.classList.add("unselectable");
    deleteButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteCategory(newCategory.id);
    });

    li.appendChild(deleteButton);

    const completedCategories = Array.from(categoryList.children).filter(
      (item) => item.classList.contains("line-through")
    );

    if (completedCategories.length > 0) {
      categoryList.insertBefore(li, completedCategories[0]);
    } else {
      categoryList.appendChild(li);
    }
  }

  updateCategoryUI();
  showNotification("Kategorija uspešno dodata!", "success");
}

async function deleteItem(id) {
  const response = await sendApiRequest("item/" + id, "DELETE");
  if (!response) {
    showNotification("Greška prilikom brisanja stavke.", "error");
    return;
  }

  showNotification("Stavka uspešno obrisana!", "success");
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

async function deleteCategory(id) {
  const response = await sendApiRequest(`category/${id}`, "DELETE");
  if (!response) {
    showNotification("Greška prilikom brisanja kategorije!", "error");
    return;
  }

  categories = categories.filter((category) => category.id !== id);
  items = items.filter((item) => item.categoryId !== id);

  const isCategoryPage = !document
    .getElementById("kategorije")
    .classList.contains("hidden");
  if (isCategoryPage) {
    const tabList = document.getElementById("klist");
    tabList.innerHTML = "";
    const sortedCategories = categories
      .slice()
      .sort((a, b) => a.completed - b.completed || a.id - b.id);

    sortedCategories.forEach((category) => {
      const li = document.createElement("li");
      li.textContent = category.name;
      if (category.completed) li.classList.add("line-through");

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "X";
      deleteButton.classList.add("delete");
      deleteButton.classList.add("unselectable");
      deleteButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteCategory(category.id);
      });

      li.appendChild(deleteButton);
      li.addEventListener("dblclick", () =>
        toggleCategoryCompletion(category.id)
      );
      tabList.appendChild(li);
    });
  }

  updateCategoryUI();
  updateItemsUI();
  showNotification("Kategorija uspešno obrisana!", "success");
}

async function toggleCategoryCompletion(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.completed = !category.completed;
    if (category.completed && !category.completionAt) {
      // Ako je tek označena kao gotova, dodaj trenutni datum
      category.completionAt = new Date().toISOString();
    } else if (!category.completed) {
      delete category.completionAt;
    }
    showCategory();
  }

  const response = await sendApiRequest(
    "category/" + categoryId + "/toggle-complete",
    "PUT"
  );

  if (!response) {
    showNotification("Greška prilikom promene statusa kategorije.", "error");

    category.completed = !category.completed;
    if (!category.completed) delete category.completionAt;
    showCategory();
  } else {
    showNotification(
      category.completed
        ? "Kategorija označena kao gotova!"
        : "Kategorija vraćena u nezavršene!",
      "success"
    );
  }
}

// FUNKCIJE ZA BUTTONE
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
    document.getElementById("filterCategoryInput").value = "";
    return;
  }

  const selectedCategoryId = categories.find(
    (category) => category.name === formattedCategoryInput
  )?.id;

  if (!selectedCategoryId) {
    showNotification("Izabrana kategorija ne postoji.", "error");
    filterCategoryId = -1;
    updateItemsUI();
    document.getElementById("filterCategoryInput").value = "";
    return;
  }

  filterCategoryId = selectedCategoryId;
  const itemsInCategory = items.filter(
    (x) => x.categoryId === filterCategoryId
  );
  const filteredItems = itemsInCategory.filter(
    (x) =>
      x.completed === showCompletedState && x.langCode === selectedDisplayLang
  );

  const list = document.getElementById("list");
  list.innerHTML = "";

  // Ako nema stavki u kategoriji, prikazujemo empty message
  if (itemsInCategory.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nema stavki u ovoj kategoriji";
    li.classList.add("empty-message");
    list.appendChild(li);
    showNotification(
      `Kategorija "${formattedCategoryInput}" je prazna.`,
      "neutral"
    );
  } else if (filteredItems.length === 0) {
    // Ako nema stavki za trenutni showCompletedState
    const li = document.createElement("li");
    li.textContent = showCompletedState
      ? "Nema završenih stavki u ovoj kategoriji"
      : "Nema nezavršenih stavki u ovoj kategoriji";
    li.classList.add("empty-message");
    list.appendChild(li);
  } else {
    // Normalan prikaz stavki
    filteredItems.forEach((i) => {
      const li = document.createElement("li");
      const cleanedLink = cleanURL(i.name);
      const urlPattern =
        /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)\/?$/;

      if (urlPattern.test(cleanedLink)) {
        const url = new URL(
          cleanedLink.startsWith("http")
            ? cleanedLink
            : `https://${cleanedLink}`
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
      deleteButton.classList.add("unselectable");
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
          showNotification("Greška prilikom promene statusa stavke.", "error");
          updateItemsUI();
        } else {
          const updatedItem = items.find((item) => item.id === i.id);
          if (updatedItem.completed) {
            showNotification("Označena kao gotova!", "success");
          } else {
            showNotification("Vraćena u nezavršene!", "success");
          }
        }
      });

      li.appendChild(deleteButton);
      list.appendChild(li);
    });
  }

  const counter = document.getElementById("counter");
  counter.textContent = `Ukupno stavki: ${itemsInCategory.length} (${
    filteredItems.length
  } ${showCompletedState ? "završenih" : "nezavršenih"})`;

  document.getElementById("filterCategoryInput").value = "";
  showNotification(
    `Prikazana kategorija: ${formattedCategoryInput}`,
    "neutral"
  );
}

function downloadList() {
  const text = items
    .filter(
      (x) =>
        (filterCategoryId < 1 || x.categoryId === filterCategoryId) &&
        x.completed === showCompletedState &&
        x.langCode === selectedDisplayLang
    )
    .map((item) => item.name)
    .join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lista.txt";
  a.click();
  showNotification("Lista je uspešno preuzeta!", "success");
}

function searchList() {
  const searchQuery = prompt("Unesite pojam za pretragu:");
  if (!searchQuery) return;

  const isCategoryPage = !document
    .getElementById("kategorije")
    .classList.contains("hidden");
  const listId = isCategoryPage ? "#klist" : "#list";
  const listItems = document.querySelectorAll(`${listId} li`);

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

  if (visibleItemsCount === 0) {
    const list = document.querySelector(listId);
    const li = document.createElement("li");
    li.textContent = "Nema stavki koje odgovaraju pretrazi.";
    li.classList.add("empty-message");
    list.innerHTML = "";
    list.appendChild(li);
  }

  if (!isCategoryPage) {
    const counter = document.getElementById("counter");
    counter.textContent = `Ukupno stavki: ${visibleItemsCount}`;
  }

  showNotification(`Prikazivanje za pretragu: ${searchQuery}`, "neutral");
}

// FUNKCIJE ZA NAVIGACIJU IZMEĐU STRANICA
async function showCategory() {
  const contentSection = document.getElementById("content");
  const categoryView = document.getElementById("kategorije");
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  try {
    const tabList = document.getElementById("klist");
    tabList.innerHTML = "";

    // Sortiranje kategorija: završene od najstarijih do najnovijih
    const sortedCategories = categories.slice().sort((a, b) => {
      if (a.completed && b.completed) {
        const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
        const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
        return dateB - dateA; // Od najstarijih ka najnovijim
      }
      return a.completed - b.completed || a.id - b.id;
    });

    sortedCategories.forEach((category) => {
      const li = document.createElement("li");

      const textContainer = document.createElement("span");
      textContainer.style.display = "flex";
      textContainer.style.alignItems = "center";
      textContainer.style.gap = "5px";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = category.name;
      if (category.completed) {
        nameSpan.style.textDecoration = "line-through";
      }
      textContainer.appendChild(nameSpan);

      if (category.completed) {
        const completedAt = category.completedAt
          ? new Date(category.completedAt)
          : new Date();
        li.dataset.completedAt = completedAt.toISOString();
        const formattedDate = formatDate(completedAt);
        const dateSpan = document.createElement("span");
        dateSpan.textContent = `- ${formattedDate}`;
        dateSpan.classList.add("completion-date");
        textContainer.appendChild(dateSpan);
      }

      li.appendChild(textContainer);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "X";
      deleteButton.classList.add("delete");
      deleteButton.classList.add("unselectable");
      deleteButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteCategory(category.id);
      });

      li.appendChild(deleteButton);
      li.addEventListener("dblclick", () =>
        toggleCategoryCompletion(category.id)
      );
      tabList.appendChild(li);
    });

    mainContent.forEach((element) => element.classList.add("hidden"));
    contentSection.classList.add("hidden");

    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    categoryView.classList.remove("hidden");
  } catch (error) {
    console.error("Greška pri učitavanju kategorija:", error);
    contentSection.classList.remove("hidden");
    mainContent.forEach((element) => element.classList.remove("hidden"));
  }
}

async function changeDisplayLang() {
  if (selectedDisplayLang === "sr") {
    languageBtn.textContent = "ENG";
    selectedDisplayLang = "en";
    showNotification("Prikazani jezik: Engleski", "neutral")
  } else {
    languageBtn.textContent = "SRB";
    selectedDisplayLang = "sr";
    showNotification("Prikazani jezik: Srpski", "neutral")
  }

  updateItemsUI();
  updateCategoryUI();
}

async function showNotepad() {
  const contentSection = document.getElementById("content");
  const categoryView = document.getElementById("kategorije");
  const notepadView = document.getElementById("notepad");
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  try {
    mainContent.forEach((element) => element.classList.add("hidden"));
    contentSection.classList.add("hidden");
    categoryView.classList.add("hidden");

    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    notepadView.classList.remove("hidden");
  } catch (error) {
    console.error("Greška pri učitavanju notepad-a:", error);
    contentSection.classList.remove("hidden");
    mainContent.forEach((element) => element.classList.remove("hidden"));
  }
}

async function backToMain() {
  const contentSection = document.getElementById("content");
  const categoryView = document.getElementById("kategorije");
  const notepadView = document.getElementById("notepad");
  const mainContent = contentSection.querySelectorAll(
    "h2, input, button, ul#list, p, a:not(#logout), .gore"
  );

  try {
    updateItemsUI();
    categoryView.classList.add("hidden");
    notepadView.classList.add("hidden");

    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    contentSection.classList.remove("hidden");
    mainContent.forEach((element) => element.classList.remove("hidden"));
  } catch (error) {
    console.error("Greška u backToMain:", error);
    if (!categoryView.classList.contains("hidden")) {
      categoryView.classList.remove("hidden");
      contentSection.classList.add("hidden");
    } else if (!notepadView.classList.contains("hidden")) {
      notepadView.classList.remove("hidden");
      contentSection.classList.add("hidden");
    }
  }
}

// EKSTERNE SKRIPTE
function loadScript(src, isModule = false) {
  return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      if (isModule) script.type = "module";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
  });
}

async function loadExternalLibraries() {
  try {
      // Učitavanje Ionicons skripti
      await Promise.all([
          loadScript("https://cdn.jsdelivr.net/npm/ionicons@latest/dist/ionicons/ionicons.esm.js", true),
          loadScript("https://cdn.jsdelivr.net/npm/ionicons@latest/dist/ionicons/ionicons.js")
      ]);

      // Učitavanje Formspree biblioteke
      await loadScript("https://formspree.io/js/formbutton-v1.min.js");

      // Inicijalizacija Formspree konfiguracije
      window.formbutton = window.formbutton || function () {
          (formbutton.q = formbutton.q || []).push(arguments);
      };

      formbutton("create", {
          theme: "minimal",
          button: ".problem",
          offset: { bottom: 5, left: 0 },
          action: "https://formspree.io/f/mvgappby",
          title: "Prijavi problem",
          fields: [
              {
                  type: "textarea",
                  required: true,
                  placeholder: "Opisite problem..."
              },
              {
                  type: "submit",
              }
          ],
          onResponse: function (ok, setStatus) {
              if (ok) {
                  setStatus("Hvala što ste prijavili problem!");
              } else {
                  setStatus("<span style='color:red'>Postoji problem. Dobili smo obaveštenje.</span>");
              }
          }
      });
  } catch (error) {
      console.error("Greška prilikom učitavanja eksternih biblioteka:", error);
  }
}

// NOTIFIKACIJE I BEZBEDNOST
function showNotification(message, type = "error") {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const currentNotifications = container.getElementsByClassName("notification");
  if (currentNotifications.length > 0) {
    currentNotifications[0].remove();
  }

  const notification = document.createElement("div");
  notification.classList.add("notification", type);
  notification.textContent = message;

  container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.add("show");
  });

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showNotification1(message, type = "error") {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const currentNotifications = container.getElementsByClassName("notification");
  if (currentNotifications.length > 0) {
    currentNotifications[0].remove();
  }

  const notification = document.createElement("div");
  notification.classList.add("notification", type);
  notification.textContent = message;

  container.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.add("show");
  });

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 20000);
}

async function updateBelgradeWeather() {
  const tempElement = document.getElementById("current-temp");
  const timeElement = document.getElementById("current-time");
  const weatherIcon = document.getElementById("weather-icon");
  if (!tempElement || !timeElement || !weatherIcon) return;

  const nowUTC = new Date();
  const belgradeOffset = 0;
  const belgradeTime = new Date(
    nowUTC.getTime() + belgradeOffset * 60 * 60 * 1000
  );

  const hours = belgradeTime.getHours().toString().padStart(2, "0");
  const minutes = belgradeTime.getMinutes().toString().padStart(2, "0");
  const seconds = belgradeTime.getSeconds().toString().padStart(2, "0");
  const timeString = `${hours}:${minutes}:${seconds}`;
  timeElement.textContent = `${timeString}`;

  try {
    const apiKey = "e5ca671fe10342a68d5153018250903";
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Belgrade&aqi=no`
    );
    const data = await response.json();

    if (data?.current) {
      const realTemp = Math.round(data.current.temp_c);
      tempElement.textContent = `${realTemp}°C`;

      const iconUrl = `https:${data.current.condition.icon}`;
      weatherIcon.src = iconUrl;
      weatherIcon.style.display = "inline";
      weatherIcon.alt = data.current.condition.text;
    } else {
      tempElement.textContent = `N/A`;
      weatherIcon.style.display = "none";
    }
  } catch (error) {
    tempElement.textContent = `N/A`;
    weatherIcon.style.display = "none";
  }
}

function disableDevTools() {
  document.onkeydown = (e) => {
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.key === "U") {
      e.preventDefault();
      return false;
    }
  };
}



async function getCategorySuggestions(text) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-031740e6a2674df38818517a9916bd47`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Ti si asistent koji pomaže sa kategorizacijom web linkova i sadržaja. Korisnik će poslati link ili tekst, a ti treba da predložiš najrelevantniju kategoriju iz postojeće liste ili da predložiš novu. Odgovaraj samo sa imenom kategorije, bez dodatnih komentara."
          },
          {
            role: "user",
            content: `Postojeće kategorije: ${categories.map(c => c.name).join(', ')}. Predloži kategoriju za: "${text}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 10
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Greška pri dobijanju predloga:", error);
    return null;
  }
}
function showSuggestions(suggestions) {
  const suggestionsList = document.getElementById('suggestionsList');
  suggestionsList.innerHTML = '';
  
  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = suggestion;
    item.addEventListener('click', () => {
      document.getElementById('categoryInput').value = suggestion;
      suggestionsList.classList.add('hidden');
    });
    suggestionsList.appendChild(item);
  });
  
  suggestionsList.classList.remove('hidden');
}
async function suggestCategory() {
  const textInput = document.getElementById('textInput').value.trim();
  const button = document.getElementById('suggestButton');
  button.disabled = true;
  button.textContent = "...";
  
  try {
    const suggestion = await getCategorySuggestions(textInput);
    if (suggestion) {
      showSuggestions([suggestion]);
    } else {
      showNotification("AI nije mogao da generiše predlog", "neutral");
    }
  } catch (error) {
    showNotification("Greška pri dobijanju predloga", "error");
    console.error(error);
  } finally {
    button.disabled = false;
    button.textContent = "AI predlog kategorije";
  }
}

const textInput = document.getElementById('textInput');
const suggestButton = document.getElementById('suggestButton');

function toggleButtonVisibility() {
  suggestButton.style.display = textInput.value.trim() ? 'inline-block' : 'none';
}
textInput.addEventListener('input', toggleButtonVisibility);
toggleButtonVisibility();