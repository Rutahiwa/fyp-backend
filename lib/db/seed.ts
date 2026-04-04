import { db } from "./index";
import { roles, permissions, permissionGroups, rolePermissions, users } from "./schema";
import { hashPassword } from "../auth/password";

async function main() {
  console.log("Seeding database...");

  // 1. Create Default Roles
  const [adminRole] = await db.insert(roles).values([
    { name: "admin", description: "System Administrator with full access" },
    { name: "student", description: "Student user" },
    { name: "staff", description: "University staff member" }
  ]).returning();
  
  console.log("✅ Roles created");

  // 2. Create Permission Groups
  const [userGroup] = await db.insert(permissionGroups).values([
    { name: "Users", description: "User management permissions" },
    { name: "Roles", description: "Role management permissions" },
    { name: "Permissions", description: "Permission management permissions" },
    { name: "Audit", description: "Audit log permissions" }
  ]).returning();

  console.log("✅ Permission groups created");

  // 3. Create Permissions
  const createdPermissions = await db.insert(permissions).values([
    // User permissions
    { name: "user.create", description: "Create users", groupId: userGroup.id },
    { name: "user.read", description: "Read users", groupId: userGroup.id },
    { name: "user.update", description: "Update users", groupId: userGroup.id },
    { name: "user.delete", description: "Delete users", groupId: userGroup.id },
    
    // Role permissions
    { name: "role.create", description: "Create roles" }, // without group
    { name: "role.read", description: "Read roles" },
    { name: "role.update", description: "Update roles" },
    { name: "role.delete", description: "Delete roles" },
    
    // System
    { name: "permission.read", description: "Read permissions" },
    { name: "audit.read", description: "Read audit logs" }
  ]).returning();

  console.log("✅ Permissions created");

  // 4. Assign all permissions to Admin role
  const rolePermissionAssignments = createdPermissions.map(p => ({
    roleId: adminRole.id,
    permissionId: p.id,
  }));
  
  await db.insert(rolePermissions).values(rolePermissionAssignments);
  
  console.log("✅ Admin role permissions assigned");

  // 5. Setup a default Admin User
  // IMPORTANT: For seeding, normally we would import from a real crypto utility.
  // For the sake of this phase, we use a simple placeholder password hash logic
  // since `lib/auth/password.ts` isn't fully implemented yet.
  
  await db.insert(users).values({
    fullName: "Super Admin",
    registrationNumber: "ADMIN001",
    course: "System Administration",
    sex: "MALE",
    email: "admin@udsm.ac.tz",
    password: "placeholder-hash-until-phase-2",
    roleId: adminRole.id,
    isActive: true,
  });

  console.log("✅ Default admin user created");
  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
