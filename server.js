const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000; // Render dodeljuje PORT

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Server radi na Render-u!");
});

const users = [
    { username: "milan", password: "lozinka123" },
    { username: "luka", password: "lozinka123" },
    { username: "marija", password: "lozinka123" }
];

const filePath = "items.json";

// Učitavanje postojećih podataka
function loadItems() {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Prijava korisnika
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }
});

app.get("/items", (req, res) => {
    let items = loadItems();
    res.json({ success: true, items });
});

// Dodavanje itema u listu
app.post("/add", (req, res) => {
    const { item } = req.body;
    if (!item) {
        return res.status(400).json({ success: false, message: "Item ne može biti prazan" });
    }

    let items = loadItems();
    const existingItem = items.find(i => i.name === item);

    if (existingItem) {
        existingItem.count += 1;
    } else {
        items.push({ name: item, count: 1 });
    }

    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    res.json({ success: true, items });
});

// Preuzimanje liste u txt formatu
app.get("/download", (req, res) => {
    let items = loadItems();
    let text = items.map(i => `${i.name}: ${i.count}`).join("\n");

    fs.writeFileSync("list.txt", text);
    res.download("list.txt");
});

// Brisanje itema iz liste
app.delete("/delete/:item", (req, res) => {
    const itemName = req.params.item;
    let items = loadItems();
    
    // Filtriranje liste da se ukloni traženi item
    items = items.filter(i => i.name !== itemName);
    
    // Upisivanje izmenjene liste u fajl
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    res.json({ success: true, items });
});

app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
