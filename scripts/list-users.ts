import Database from "better-sqlite3";

const db = new Database(process.env.DATABASE_URL || "./data/auth.db");

try {
  console.log("Current users in database:\n");

  const users = db.prepare('SELECT id, email, name, role, emailVerified FROM user').all();

  if (users.length === 0) {
    console.log("No users found in database.");
  } else {
    users.forEach((user: any) => {
      console.log(`📧 ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log("");
    });
  }
} catch (error) {
  console.error("❌ Error listing users:", error);
  throw error;
} finally {
  db.close();
}
