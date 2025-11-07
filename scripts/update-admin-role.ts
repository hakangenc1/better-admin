import Database from "better-sqlite3";

const db = new Database(process.env.DATABASE_URL || "./data/auth.db");

try {
  console.log("Updating admin user role...");

  const result = db
    .prepare('UPDATE user SET role = ? WHERE email = ?')
    .run("admin", "admin@example.com");

  if (result.changes > 0) {
    console.log("✅ Admin role updated successfully!");
    console.log("   Email: admin@example.com");
    console.log("   Role: admin");
  } else {
    console.log("⚠️  No user found with email: admin@example.com");
  }
} catch (error) {
  console.error("❌ Error updating admin role:", error);
  throw error;
} finally {
  db.close();
}
