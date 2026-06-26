import "dotenv/config"; // Load environment variables from .env
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  const email = "mia@bles.com";
  
  // Clean up any existing user with this email first
  await prisma.user.deleteMany({
    where: { email }
  });

  const passwordHash = await bcrypt.hash("Admin1234", 10);
  const pinHash = await bcrypt.hash("123456", 10); // Default test pin: 123456

  // Full permissions for admin
  const adminPermissions = {
    p: [1, 2, 3, 4, 5],    // Patient: Create(1), Read(2), Update(3), Write(4), Delete(5)
    pr: [1, 2, 3, 4, 5],   // Programs: Create(1), Read(2), Update(3), Write(4), Delete(5)
    cn: [1, 2, 3, 4, 5],   // Clinic Notes: Create(1), Read(2), Update(3), Write(4), Delete(5)
    s: [1, 2, 3, 4, 5],    // Staff: Create(1), Read(2), Update(3), Write(4), Delete(5)
    b: [1, 2, 3, 4, 5],    // Billing: Create(1), Read(2), Update(3), Write(4), Delete(5)
    c: [1, 2, 3, 4, 5],    // Compliance: Create(1), Read(2), Update(3), Write(4), Delete(5)
    al: [1, 2, 3, 4, 5]    // Audit Log: Create(1), Read(2), Update(3), Write(4), Delete(5)
  };

  const mia = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      pin: pinHash,
      twoFactorEnabled: true,
      staffId: "EMP-00001",
      firstname: "Mia",
      lastname: "Bles",
      sex: "Female",
      dateofbirth: new Date("1995-04-12"),
      role: 1,
      status: "Active",
      permissions: adminPermissions,
      extendedInfo: {
        title: "Clinical Director",
        department: "Administration"
      }
    }
  });

  console.log("✅ Seeded Admin User:");
  console.log(`   Email: ${mia.email}`);
  console.log(`   Password: Admin1234`);
  console.log(`   PIN: 123456`);

  // Seed default clinical templates
  const templates = [
    {
      name: "SOAP Note",
      description: "Subjective, Objective, Assessment, Plan",
      structure: `# SOAP Note\n\n### Subjective (S)\n- [Insert subjective report here]\n\n### Objective (O)\n- [Insert clinical observations here]\n\n### Assessment (A)\n- [Insert evaluation & clinical impression here]\n\n### Plan (P)\n- [Insert follow-up actions here]`,
      prompt: "Draft a professional clinical SOAP note. Group statements describing the patient's thoughts, feelings, and self-reported issues under Subjective. Put clinical observations, behavior, and status exams under Objective. Provide clinical reasoning and diagnosis evaluation under Assessment. Outline future treatments and interventions under Plan."
    },
    {
      name: "BIRP Note",
      description: "Behavior, Intervention, Response, Plan",
      structure: `# BIRP Note\n\n### Behavior (B)\n- [Insert behavior description here]\n\n### Intervention (I)\n- [Insert clinician interventions here]\n\n### Response (R)\n- [Insert patient response here]\n\n### Plan (P)\n- [Insert clinical plan here]`,
      prompt: "Draft a professional clinical BIRP note. Under Behavior, document how the patient behaved and presented. Under Intervention, specify what clinical techniques or guidance was given. Under Response, explain the patient's reaction to those techniques. Under Plan, define the treatment path and schedule."
    },
    {
      name: "DAP Note",
      description: "Data, Assessment, Plan",
      structure: `# DAP Note\n\n### Data (D)\n- [Insert session data and observations here]\n\n### Assessment (A)\n- [Insert progress evaluation here]\n\n### Plan (P)\n- [Insert next steps here]`,
      prompt: "Draft a professional clinical DAP note. Under Data, compile both subjective client statements and objective clinical observations from the session. Under Assessment, analyze the data to evaluate progress and diagnosis alignment. Under Plan, document follow-ups, homework, and appointment targets."
    }
  ];

  for (const t of templates) {
    await prisma.clinicalTemplate.upsert({
      where: { name: t.name },
      update: {
        description: t.description,
        structure: t.structure,
        prompt: t.prompt
      },
      create: t
    });
  }
  console.log("✅ Seeded Clinical Templates");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
