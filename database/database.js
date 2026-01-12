import * as SQLite from "expo-sqlite";

let db;

const openDatabase = async () => {
  const database = await SQLite.openDatabaseAsync("little_lemon.db");
  return database;
};

const initDatabase = async () => {
  try {
    db = await openDatabase();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        category TEXT NOT NULL
      );
    `);

    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const saveMenuItems = async (items) => {
  try {
    await db.execAsync("BEGIN TRANSACTION");

    await db.runAsync("DELETE FROM menu");

    const insertQuery = `
      INSERT INTO menu (name, price, description, image, category)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      await db.runAsync(insertQuery, [
        item.name,
        item.price,
        item.description,
        item.image,
        item.category,
      ]);
    }

    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Error saving menu items:", error);
    throw error;
  }
};

export const getMenuItems = async () => {
  try {
    const results = await db.getAllAsync("SELECT * FROM menu");
    return results;
  } catch (error) {
    console.error("Error getting menu items:", error);
    throw error;
  }
};

export { initDatabase, db };
