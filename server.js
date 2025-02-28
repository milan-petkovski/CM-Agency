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

// Provera da li server radi
app.get("/", (req, res) => {
    const items = loadItems();
    const serverInfo = {
        status: "Server radi!",
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        itemsCount: items.length,
        uptime: (process.uptime() / 60).toFixed(2) + " minuta", // Pretvorili smo sekunde u minute
        memoryUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB",
        endpoints: {
            login: "/login (POST) - Prijava korisnika",
            items: "/items (GET) - Preuzimanje svih stavki",
            add: "/add (POST) - Dodavanje nove stavke",
            delete: "/delete/:item (DELETE) - Brisanje stavke",
            download: "/download (GET) - Preuzimanje liste kao tekstualnog fajla"
        },
        serverPort: PORT
    };

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CM Agency Server Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #1c1c1c, #383838);
            color: #fff;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            max-width: 600px;
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
        }
        h1 {
            font-family: 'Source Sans Pro', sans-serif;
            font-size: 2.4rem;
            color: #de201d;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: linear-gradient(to bottom, #de201d 50%, transparent 50%);
            -webkit-background-clip: text;
            background-clip: text;
            text-shadow: 2px 2px 0 #ffffff, 3px 3px 0 #de201d;
        }
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
            h1 {
                font-size: 2rem;
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
        <h1>CM Agency Server Status</h1>
        <div class="info"><strong>Status:</strong> ${serverInfo.status}</div>
        <div class="info"><strong>Vreme:</strong> ${new Date(serverInfo.timestamp).toLocaleString()}</div>
        <div class="info"><strong>Verzija:</strong> ${serverInfo.version}</div>
        <div class="info"><strong>Broj stavki:</strong> ${serverInfo.itemsCount}</div>
        <div class="info"><strong>Vreme rada:</strong> ${serverInfo.uptime}</div>
        <div class="info"><strong>Memorijska upotreba:</strong> ${serverInfo.memoryUsage}</div>
        <div class="info"><strong>Port:</strong> ${serverInfo.serverPort}</div>
        <div class="endpoints">
            <h2>Dostupni endpointovi</h2>
            <ul>
                <li>${serverInfo.endpoints.login}</li>
                <li>${serverInfo.endpoints.items}</li>
                <li>${serverInfo.endpoints.add}</li>
                <li>${serverInfo.endpoints.delete}</li>
                <li>${serverInfo.endpoints.download}</li>
            </ul>
        </div>
    </div>
</body>
</html>
    `;
    res.send(html);
});

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
    return user && bcrypt.compareSync(password, user.password)
        ? res.json({ success: true })
        : res.status(401).json({ success: false, message: "Pogrešno korisničko ime ili lozinka" });
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

// Pokretanje servera
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));
