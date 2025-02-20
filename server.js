const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = "tvoja_tajna_kljuc";
const filePath = "items.json";

app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
    origin: ["https://tvoj-domen.com"],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "CSRF-Token"],
    credentials: true
}));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

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

// Kreiranje JWT tokena
const generateToken = (user) => {
    return jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "1h" });
};

// Middleware za autentifikaciju
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Login ruta sa JWT
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }
});

// Logout ruta
app.post("/logout", (req, res) => {
    res.clearCookie("token").json({ success: true });
});

// Dohvatanje CSRF tokena
app.get("/get-csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Dohvatanje stavki (samo za autorizovane korisnike)
app.get("/items", authenticateToken, (req, res) => {
    res.json({ success: true, items: loadItems() });
});

// Dodavanje stavki sa validacijom
app.post("/add", 
    authenticateToken,
    body("item").isURL().withMessage("Neispravan URL"),
    body("category").isAlphanumeric().withMessage("Neispravna kategorija"),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { item, category } = req.body;
        let items = loadItems();
        const existingItem = items.find(i => i.name === item);

        if (existingItem) {
            existingItem.count += 1;
        } else {
            items.push({ name: item, count: 1, category });
        }

        fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
        res.json({ success: true, items });
    }
);

// Brisanje stavki (samo za autorizovane korisnike)
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

// Preuzimanje liste stavki
app.get("/download", authenticateToken, (req, res) => {
    let items = loadItems();
    let text = items.map(i => `${i.name}`).join("\n");

    res.setHeader("Content-Disposition", "attachment; filename=lista.txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(text);
});

// Pokretanje servera
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));