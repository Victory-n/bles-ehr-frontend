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
      structure: JSON.stringify({
        specialty: "psychiatry",
        sections: [
          {
            id: "s_1",
            type: "TEXT_FIELD",
            sectionName: "Subjective",
            style: "bullet points",
            instructions: "Record client's self-reported feelings, thoughts, and symptoms during the session."
          },
          {
            id: "s_2",
            type: "TEXT_FIELD",
            sectionName: "Objective",
            style: "flow text",
            instructions: "Record clinical observations, physical symptoms, appearance, and mental status exam results."
          },
          {
            id: "s_3",
            type: "TEXT_FIELD",
            sectionName: "Assessment",
            style: "flow text",
            instructions: "Provide diagnostic assessment, clinical reasoning, and progress towards goals."
          },
          {
            id: "s_4",
            type: "TEXT_FIELD",
            sectionName: "Plan",
            style: "bullet points",
            instructions: "Detail future treatment interventions, homework assigned, and next scheduled sessions."
          }
        ]
      }, null, 2),
      prompt: "Draft a professional clinical SOAP note. Group statements describing the patient's thoughts, feelings, and self-reported issues under Subjective. Put clinical observations, behavior, and status exams under Objective. Provide clinical reasoning and diagnosis evaluation under Assessment. Outline future treatments and interventions under Plan."
    },
    {
      name: "BIRP Note",
      description: "Behavior, Intervention, Response, Plan",
      structure: JSON.stringify({
        specialty: "psychology",
        sections: [
          {
            id: "b_1",
            type: "TEXT_FIELD",
            sectionName: "Behavior",
            style: "flow text",
            instructions: "Describe patient behavior, clinical presentation, and symptoms observed."
          },
          {
            id: "b_2",
            type: "TEXT_FIELD",
            sectionName: "Intervention",
            style: "bullet points",
            instructions: "Document therapeutic interventions used by the clinician during the session."
          },
          {
            id: "b_3",
            type: "TEXT_FIELD",
            sectionName: "Response",
            style: "flow text",
            instructions: "Document patient response to interventions and active participation in the session."
          },
          {
            id: "b_4",
            type: "TEXT_FIELD",
            sectionName: "Plan",
            style: "bullet points",
            instructions: "Outline treatment plan, homework, and next session focus."
          }
        ]
      }, null, 2),
      prompt: "Draft a professional clinical BIRP note. Under Behavior, document how the patient behaved and presented. Under Intervention, specify what clinical techniques or guidance was given. Under Response, explain the patient's reaction to those techniques. Under Plan, define the treatment path and schedule."
    },
    {
      name: "DAP Note",
      description: "Data, Assessment, Plan",
      structure: JSON.stringify({
        specialty: "clinical psychology",
        sections: [
          {
            id: "d_1",
            type: "TEXT_FIELD",
            sectionName: "Data",
            style: "flow text",
            instructions: "Combine subjective client statements and objective clinical observations from the session."
          },
          {
            id: "d_2",
            type: "TEXT_FIELD",
            sectionName: "Assessment",
            style: "flow text",
            instructions: "Analyze session data, evaluate progress, and note alignment with treatment goals."
          },
          {
            id: "d_3",
            type: "TEXT_FIELD",
            sectionName: "Plan",
            style: "bullet points",
            instructions: "Record follow-ups, scheduled appointments, and next steps."
          }
        ]
      }, null, 2),
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
