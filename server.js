const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "tvoja_tajna_kljuc";

const app = express();
const PORT = process.env.PORT || 10000;
const filePath = "items.json";

app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

// Provera da li server radi
app.get("/", (req, res) => res.send("Server radi!"));

// Učitavanje postojećih podataka iz items.json sa obradom grešaka
const loadItems = () => {
    try {
        if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error("Greška pri učitavanju items.json:", error);
        return [];
    }
};

// Korisnici - heširane lozinke
const users = [
    { username: "milan", password: bcrypt.hashSync("123", 10) },
    { username: "luka", password: bcrypt.hashSync("lozinka123", 10) },
    { username: "marija", password: bcrypt.hashSync("lozinka123", 10) }
];

// Login - Provera korisničkog imena i lozinke
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" }); // Token važi 1 sat
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }
});

// Middleware funkciju za proveru tokena
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Nema tokena" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Nevažeći token" });
        req.user = user;
        next();
    });
}


// Preuzimanje svih stavki
app.get("/items", authenticateToken, (req, res) => {
    res.json({ success: true, items: loadItems() });
});

// Dodavanje nove stavke u items.json
app.post("/add", authenticateToken, (req, res) => {
    const { item, category } = req.body;
    if (!item || !category) return res.status(400).json({ success: false, message: "Item i kategorija ne mogu biti prazni" });

    const items = loadItems();
    items.push({ name: item, category });
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    res.json({ success: true, items });
});

// Brisanje stavke na osnovu naziva
app.delete("/delete/:item", (req, res) => {
    const itemName = decodeURIComponent(req.params.item);
    const items = loadItems();
    const itemIndex = items.findIndex(i => i.name === itemName);

    if (itemIndex !== -1) {
        items[itemIndex].count > 1 ? items[itemIndex].count-- : items.splice(itemIndex, 1);
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    }

    res.json({ success: true, items });
});

// Preuzimanje liste stavki kao tekstualni fajl
app.get("/download", (req, res) => {
    const text = loadItems().map(i => i.name).join("\n");
    res.setHeader("Content-Disposition", "attachment; filename=lista.txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(text);
});

// Pokretanje servera
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));
