import { db } from "./index";
import { eq } from "drizzle-orm";
import { roles, permissions, permissionGroups, rolePermissions, users, colleges } from "./schema";
import { hashPassword } from "../auth/password";

async function main() {
  console.log("Seeding database...");
  
  // 0. Create Colleges
  await db.insert(colleges).values([
    { name: "College of Information and Communication Technologies", shortName: "CoICT" },
    { name: "University of Dar es Salaam Business School", shortName: "UDBS" },
    { name: "College of Social Sciences", shortName: "CoSS" },
    { name: "College of Natural and Applied Sciences", shortName: "CoNAS" },
    { name: "College of Humanities", shortName: "CoHU" },
    { name: "College of Agriculture and Food Sciences", shortName: "CoAF" },
    { name: "College of Engineering and Technology", shortName: "CoET" }
  ]).onConflictDoNothing({ target: colleges.shortName });

  console.log("✅ Colleges created/skipped");

  // 1. Create Default Roles
  await db.insert(roles).values([
    { name: "admin", description: "System Administrator with full access" },
    { name: "student", description: "Student user" },
    { name: "staff", description: "University staff member" },
    { name: "lecturer", description: "University lecturer" },
    { name: "class_representative", description: "Class representative" }
  ]).onConflictDoNothing({ target: roles.name });
  
  // Get admin role ID for later use
  const adminRoleResult = await db.select().from(roles).where(eq(roles.name, "admin")).limit(1);
  const adminRole = adminRoleResult[0];
  
  console.log("✅ Roles created/skipped");

  // 2. Create Permission Groups
  await db.insert(permissionGroups).values([
    { name: "Users", description: "User management permissions" },
    { name: "Roles", description: "Role management permissions" },
    { name: "Permissions", description: "Permission management permissions" },
    { name: "Audit", description: "Audit log permissions" }
  ]).onConflictDoNothing({ target: permissionGroups.name });

  const userGroupResult = await db.select().from(permissionGroups).where(eq(permissionGroups.name, "Users")).limit(1);
  const userGroup = userGroupResult[0];

  console.log("✅ Permission groups created/skipped");

  // 3. Create Permissions
  await db.insert(permissions).values([
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
    { name: "audit.read", description: "Read audit logs" },

    // Colleges
    { name: "college.read", description: "Read colleges" },
    { name: "college.manage", description: "Manage colleges" },

    // Programmes
    { name: "programme.manage", description: "Manage programmes" },

    // Academic Years
    { name: "academic_year.manage", description: "Manage academic years" },

    // Assignments
    { name: "assignment.manage", description: "Manage lecturer and CR assignments" }
  ]).onConflictDoNothing({ target: permissions.name });

  const createdPermissions = await db.select().from(permissions);

  console.log("✅ Permissions created/skipped");

  // 4. Assign all permissions to Admin role
  const rolePermissionAssignments = createdPermissions.map(p => ({
    roleId: adminRole.id,
    permissionId: p.id,
  }));
  
  await db.insert(rolePermissions).values(rolePermissionAssignments)
    .onConflictDoNothing({ target: [rolePermissions.roleId, rolePermissions.permissionId] });
  
  console.log("✅ Admin role permissions assigned/skipped");

  // 5. Setup a default Admin User
  const hashedPassword = await hashPassword("rut4shell");
  
  await db.insert(users).values({
    fullName: "Super Admin",
    registrationNumber: "ADMIN001",
    sex: "MALE",
    email: "admin@udsminfo.com",
    password: hashedPassword,
    roleId: adminRole.id,
    isActive: true,
  }).onConflictDoNothing({ target: users.email });

  console.log("✅ Default admin user created/skipped");
  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
