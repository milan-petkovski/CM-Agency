const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 10000;
const filePath = "items.json";

app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

// Učitavanje postojećih podataka sa obradom grešaka
function loadItems() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
        }
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error("Greška pri učitavanju items.json:", error);
        return [];
    }
}

const users = [
    { username: "milan", password: bcrypt.hashSync("123", 10) },
    { username: "luka", password: bcrypt.hashSync("lozinka123", 10) },
    { username: "marija", password: bcrypt.hashSync("lozinka123", 10) }
];

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }
});

app.get("/items", (req, res) => {
    res.json({ success: true, items: loadItems() });
});

app.post("/add", (req, res) => {
    const { item } = req.body;
    if (!item) return res.status(400).json({ success: false, message: "Item ne može biti prazan" });

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

app.delete("/delete/:item", (req, res) => {
    const itemName = decodeURIComponent(req.params.item);
    let items = loadItems();

    const itemIndex = items.findIndex(i => i.name === itemName);
    if (itemIndex !== -1) {
        if (items[itemIndex].count > 1) {
            items[itemIndex].count -= 1;
        } else {
            items.splice(itemIndex, 1);
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    res.json({ success: true, items });
});

app.get("/download", (req, res) => {
    let items = loadItems();
    let text = items.map(i => `${i.name}: ${i.count}`).join("\n");

    res.setHeader("Content-Disposition", "attachment; filename=lista.txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(text);
});

app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));
