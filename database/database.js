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

export const getMenuItemsByCategory = async (categories) => {
  try {
    if (!categories || categories.length === 0) {
      return await getMenuItems();
    }

    const placeholders = categories.map(() => "?").join(",");
    const query = `SELECT * FROM menu WHERE category IN (${placeholders})`;
    return await db.getAllAsync(query, categories);
  } catch (error) {
    console.error("Error getting menu items by category:", error);
    throw error;
  }
};
export const searchMenuItems = async (searchText, categories = []) => {
  try {
    let query = "SELECT * FROM menu WHERE name LIKE ?";
    const params = [`%${searchText}%`];

    if (categories.length > 0) {
      const placeholders = categories.map(() => "?").join(",");
      query += ` AND category IN (${placeholders})`;
      params.push(...categories);
    }

    return await db.getAllAsync(query, params);
  } catch (error) {
    console.error("Error searching menu items:", error);
    throw error;
  }
};

export { initDatabase, db };
