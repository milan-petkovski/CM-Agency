const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "tajna_kljuc";
const filePath = "data.json";

app.use(express.json());
app.use(cors());

const users = [
    { username: "milan", password: bcrypt.hashSync("123", 10) },
    { username: "luka", password: bcrypt.hashSync("lozinka123", 10) },
    { username: "marija", password: bcrypt.hashSync("lozinka123", 10) }
];

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Previše neuspešnih pokušaja prijave. Pokušajte kasnije."
});

app.post("/login", loginLimiter, (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "2h" });
    res.json({ success: true, token });
});

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Pristup odbijen" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Nevalidan token" });
        req.user = user;
        next();
    });
}

function loadItems() {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
}

app.get("/items", authenticateToken, (req, res) => {
    res.json({ success: true, items: loadItems() });
});

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

app.delete("/delete/:item", authenticateToken, (req, res) => {
    const itemName = decodeURIComponent(req.params.item);
    let items = loadItems();
    const itemIndex = items.findIndex(i => i.name === itemName);
    
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
    }

    fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    res.json({ success: true, items });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));