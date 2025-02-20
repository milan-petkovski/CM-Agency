const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 10000;
const filePath = "items.json";
const SECRET_KEY = "your-secret-key"; // Koristite environment varijable u produkciji

// Lista dozvoljenih domena
const allowedOrigins = [
    "http://127.0.0.1:5500",
    "https://cm-agency.vercel.app",
    "https://cmagency.onrender.com"
];

// CORS konfiguracija
const corsOptions = {
    origin: function (origin, callback) {
        // Proverite da li je origin u listi dozvoljenih domena
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Dozvolite Authorization header
    credentials: true // Dozvolite slanje kredencijala (npr. cookies)
};

// Middleware
app.use(helmet()); // Sigurnosna zaglavlja
app.use(cors(corsOptions)); // Primenite CORS konfiguraciju
app.use(bodyParser.json());

// Rate limiting za zaštitu od brute force napada
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuta
    max: 100 // Ograničenje na 100 zahteva po korisniku
});
app.use(limiter);

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

// Korisnici (u produkciji koristite bazu podataka)
const users = [
    { username: "milan", password: bcrypt.hashSync("123", 10) },
    { username: "luka", password: bcrypt.hashSync("lozinka123", 10) },
    { username: "marija", password: bcrypt.hashSync("lozinka123", 10) }
];

// Generisanje JWT tokena
function generateToken(user) {
    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "1h" });
}

// Middleware za autentifikaciju
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Rute
app.get("/", (req, res) => {
    res.send("Server radi!");
});

// Prijava
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }
});

// Dobijanje svih stavki (zaštićeno)
app.get("/items", authenticateToken, (req, res) => {
    res.json({ success: true, items: loadItems() });
});

// Dodavanje stavke (zaštićeno)
app.post("/add", authenticateToken, (req, res) => {
    const { item, category } = req.body;
    if (!item) return res.status(400).json({ success: false, message: "Item ne može biti prazan" });

    let items = loadItems();
    const existingItem = items.find(i => i.name === item);

    if (existingItem) {
        existingItem.count += 1;
    } else {
        items.push({ name: item, count: 1, category });
    }

    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    res.json({ success: true, items });
});

// Brisanje stavke (zaštićeno)
app.delete("/delete/:item", authenticateToken, (req, res) => {
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

// Preuzimanje liste (zaštićeno)
app.get("/download", authenticateToken, (req, res) => {
    let items = loadItems();
    let text = items.map(i => `${i.name}`).join("\n");

    res.setHeader("Content-Disposition", "attachment; filename=lista.txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(text);
});

// Pokretanje servera
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));