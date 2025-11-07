import { auth } from "../app/lib/auth.server";

async function seed() {
  console.log("Seeding database with example users...");

  try {
    // Create admin user using better-auth API
    const adminRequest = new Request("http://localhost:5173/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
      }),
    });

    await auth.api.signUpEmail({
      body: {
        email: "admin@example.com",
        password: "admin123",
        name: "Admin User",
      },
    });

    console.log("✅ Admin user created:");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");

    // Create regular user using better-auth API
    await auth.api.signUpEmail({
      body: {
        email: "user@example.com",
        password: "user123",
        name: "Regular User",
      },
    });

    console.log("✅ Regular user created:");
    console.log("   Email: user@example.com");
    console.log("   Password: user123");

    console.log("\n✅ Database seeded successfully!");
    console.log("\nNote: You may need to manually update user roles in the database.");
    console.log("To make admin@example.com an admin, run:");
    console.log('  UPDATE user SET role = "admin" WHERE email = "admin@example.com";');
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
