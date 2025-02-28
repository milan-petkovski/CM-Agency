const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 10000;
const filePath = "items.json";
const notepadFilePath = "notepad.json";

app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

const motivationalMessages = [
    "Svaki dan je nova prilika za uspeh, Luka!",
    "Tvoj trud danas vodi ka velikim stvarima sutra, Luka!",
    "Veruj u sebe, Luka, jer ti to možeš!",
    "Mali koraci vode ka velikim ciljevima, Luka!",
    "Danas je tvoj dan da zablistaš, Luka!"
];

// Load login tracker
const loadLoginTracker = () => {
    try {
        if (!fs.existsSync(loginTrackerPath)) fs.writeFileSync(loginTrackerPath, JSON.stringify({}));
        return JSON.parse(fs.readFileSync(loginTrackerPath, "utf8"));
    } catch (error) {
        console.error("Greška pri učitavanju loginTracker.json:", error);
        return {};
    }
};

// Save login tracker
const saveLoginTracker = (tracker) => {
    fs.writeFileSync(loginTrackerPath, JSON.stringify(tracker, null, 2));
};

// Provera da li server radi
app.get("/", (req, res) => {
    const items = loadItems();
    const serverInfo = {
        status: "Server radi!",
        timestamp: new Date().toISOString(),
        itemsCount: items.length,
        uptime: process.uptime().toFixed(2) + " sekundi",
        memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB",
        endpoints: {
            login: " /login (POST) - Prijava korisnika",
            items: " /items (GET) - Preuzimanje svih stavki",
            add: " /add (POST) - Dodavanje nove stavke",
            delete: " /delete/:item (DELETE) - Brisanje stavke",
            download: " /download (GET) - Preuzimanje liste kao tekstualnog fajla"
        },
        serverPort: PORT
    };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <style>
        .info {
            margin-bottom: 15px;
            font-size: 1.4rem;
            color: #a0a0a0;
        }
        .info strong {
            color: #fff;
            margin-right: 10px;
        }
        .endpoints {
            margin-top: 20px;
            text-align: left;
        }
        .endpoints h2 {
            font-size: 1.8rem;
            color: #de201d;
            margin-bottom: 10px;
        }
        .endpoints ul {
            list-style: none;
            padding: 0;
        }
        .endpoints li {
            font-size: 1.2rem;
            color: #dfdfdf;
            margin-bottom: 8px;
            padding-left: 15px;
            position: relative;
        }
        .endpoints li:before {
            content: "→";
            color: #de201d;
            position: absolute;
            left: 0;
            top: 0;
        }
        @media (max-width: 480px) {
            .container {
                padding: 15px;
                width: 90%;
            }
            .info {
                font-size: 1.2rem;
            }
            .endpoints h2 {
                font-size: 1.6rem;
            }
            .endpoints li {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="info"><strong>Status:</strong>${serverInfo.status}</div>
        <div class="info"><strong>Vreme:</strong>${new Date(serverInfo.timestamp).toLocaleString()}</div>
        <div class="info"><strong>Broj stavki:</strong>${serverInfo.itemsCount}</div>
        <div class="info"><strong>Vreme rada:</strong>${serverInfo.uptime}</div>
        <div class="info"><strong>Port:</strong>${serverInfo.serverPort}</div>
        <div class="endpoints">
            <h2>Dostupni endpointovi</h2>
            <ul>
                <li> ${serverInfo.endpoints.login}</li>
                <li> ${serverInfo.endpoints.items}</li>
                <li> ${serverInfo.endpoints.add}</li>
                <li> ${serverInfo.endpoints.delete}</li>
                <li> ${serverInfo.endpoints.download}</li>
            </ul>
        </div>
    </div>
</body>
</html>
    `;
    res.send(html);
});

// Učitavanje postojećih podataka iz items.json i notepad.json sa obradom grešaka
const loadItems = () => {
    try {
        if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error("Greška pri učitavanju items.json:", error);
        return [];
    }
};
const loadNotepad = () => {
    try {
        if (!fs.existsSync(notepadFilePath)) fs.writeFileSync(notepadFilePath, JSON.stringify({ content: "" }));
        return JSON.parse(fs.readFileSync(notepadFilePath, "utf8"));
    } catch (error) {
        console.error("Greška pri učitavanju notepad.json:", error);
        return { content: "" };
    }
};

// Korisnici - heširane lozinke
const users = [
    { username: "milan", password: bcrypt.hashSync("123", 10) },
    { username: "luka", password: bcrypt.hashSync("lozinka123", 10) },
    { username: "marija", password: bcrypt.hashSync("lozinka123", 10) }
];

// Login - Provera korisničkog imena i lozinke
app.get("/login", (req, res) => {
    res.status(405).json({ 
        success: false, 
        message: "Method Not Allowed. Use POST to log in." 
    });
});

// Existing POST /login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
    }

    let message = null;
    if (username === "luka") {
        const loginTracker = loadLoginTracker();
        const today = new Date().toISOString().split("T")[0];
        const lastLogin = loginTracker.luka?.lastLoginDate || "1970-01-01";

        if (lastLogin !== today) {
            message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
            loginTracker.luka = { lastLoginDate: today };
            saveLoginTracker(loginTracker);
        }
    }

    res.json({ success: true, motivationalMessage: message });
});

// Preuzimanje svih stavki
app.get("/items", (req, res) => res.json({ success: true, items: loadItems() }));

// Dodavanje nove stavke u items.json
app.post("/add", (req, res) => {
    const { item, category } = req.body;
    if (!item || !category) return res.status(400).json({ success: false, message: "Item i kategorija ne mogu biti prazni" });

    const items = loadItems();
    if (items.some(i => i.name === item && i.category === category)) {
        return res.status(409).json({ success: false, message: "Stavka sa tim nazivom već postoji u toj kategoriji" });
    }

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

// Endpoint to get notepad content
app.get("/notepad", (req, res) => {
    const notepad = loadNotepad();
    res.json({ success: true, content: notepad.content });
});

// Endpoint to save notepad content
app.post("/notepad", (req, res) => {
    const { content } = req.body;
    if (content === undefined) return res.status(400).json({ success: false, message: "Sadržaj je obavezan" });

    const notepad = { content };
    fs.writeFileSync(notepadFilePath, JSON.stringify(notepad, null, 2));
    res.json({ success: true, content });
});

// Pokretanje servera
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));
