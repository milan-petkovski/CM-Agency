const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "tajni_kljuc";

// CORS podešavanja
const allowedOrigins = [
    "https://cm-agency.vercel.app",
    "https://cmagency.onrender.com",
    "http://127.0.0.1:5500"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Origin nije dozvoljen od strane CORS-a"));
        }
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Uveri se da je ovo postavljeno na true
}));

app.use(express.json());
app.use(cookieParser());

// Fiktivna baza korisnika
const users = [
    { username: "milan", password: bcrypt.hashSync("123", 10) },
    { username: "luka", password: bcrypt.hashSync("lozinka123", 10) },
    { username: "marija", password: bcrypt.hashSync("lozinka123", 10) }
];

// Middleware za proveru autentifikacije
const authMiddleware = (req, res, next) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Forbidden" });
        req.user = user;
        next();
    });
};

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }
    
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

    // Postavi kolačić sa tokenom
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",  // Koristi secure u produkciji
        sameSite: "None", // Moramo postaviti None za cross-origin kolačiće
        maxAge: 60 * 60 * 1000  // Postavi kolačiću 1 sat isteka
    });
    res.json({ success: true });
});

// Logout endpoint
app.post("/logout", (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Koristi secure u produkciji
        sameSite: "None"
    });
    res.json({ success: true, message: "Uspešno ste se odjavili" });
});

// Endpoint za proveru autentifikacije
app.get("/check-auth", authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

// Zaštićeni endpoint za stavke
app.get("/items", authMiddleware, (req, res) => {
    res.json({ success: true, items: ["Item 1", "Item 2", "Item 3"] });
});

app.listen(PORT, () => {
    console.log(`Server pokrenut na portu ${PORT}`);
});
