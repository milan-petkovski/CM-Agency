const fs = require("fs");

const loadCategories = () => {
  try {
    return JSON.parse(fs.readFileSync("kategorije.json", "utf8"));
  } catch (error) {
    console.error("Greška pri učitavanju kategorije.json:", error);
    return [];
  }
};

const loadItems = () => {
  try {
    return JSON.parse(fs.readFileSync("items.json", "utf8"));
  } catch (error) {
    console.error("Greška pri učitavanju items.json:", error);
    return [];
  }
};

const categories = loadCategories();
let items = loadItems();

items = items.map((x) => {
  const categoryId = categories.find((c) => c.name === x.category)?.id;
  delete x.count;
  delete x.category;
  x.categoryId = categoryId;
  return x;
});

fs.writeFileSync("items.json", JSON.stringify(items));
