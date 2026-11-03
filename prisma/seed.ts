import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ASSUMPTION: all tax rates, prices and addresses below are invented sample data.
const ROAD_TAX_PCT: Record<string, number> = { Lucknow: 9.0, Kanpur: 8.5 };

async function main() {
  // Clean in dependency order so the seed can be re-run safely
  await prisma.testDrive.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.assignmentRule.deleteMany();
  await prisma.demoCar.deleteMany();
  await prisma.usedCar.deleteMany();
  await prisma.priceRule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.showroom.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.carModel.deleteMany();
  await prisma.city.deleteMany();

  // Cities
  const lucknow = await prisma.city.create({ data: { name: "Lucknow", state: "Uttar Pradesh" } });
  const kanpur = await prisma.city.create({ data: { name: "Kanpur", state: "Uttar Pradesh" } });

  // Showrooms
  const gomti = await prisma.showroom.create({
    data: { name: "Gomti Nagar Showroom", slug: "gomti-nagar", address: "Vibhuti Khand, Gomti Nagar, Lucknow", phone: "0522-4000001", cityId: lucknow.id },
  });
  const kanpurRoad = await prisma.showroom.create({
    data: { name: "Kanpur Road Showroom", slug: "kanpur-road", address: "Kanpur Road, Lucknow", phone: "0522-4000002", cityId: lucknow.id },
  });
  const civilLines = await prisma.showroom.create({
    data: { name: "Civil Lines Showroom", slug: "civil-lines", address: "Civil Lines, Kanpur", phone: "0512-4000003", cityId: kanpur.id },
  });

  // Models and variants
  await prisma.carModel.create({
    data: {
      name: "Model H", slug: "model-h", bodyType: "Hatchback", tagline: "Compact, smart and easy to park.",
      variants: {
        create: [
          { name: "ZX Automatic", slug: "model-h-zx-automatic", fuel: "PETROL", transmission: "AUTOMATIC", exShowroomPrice: 1245000, engine: "1.2L petrol", powerBhp: 88, mileageKmpl: 19.5, seats: 5, colours: ["Pearl White", "Graphite Grey", "Ruby Red"] },
          { name: "VX Manual", slug: "model-h-vx-manual", fuel: "PETROL", transmission: "MANUAL", exShowroomPrice: 989000, engine: "1.2L petrol", powerBhp: 88, mileageKmpl: 21.0, seats: 5, colours: ["Pearl White", "Graphite Grey"] },
        ],
      },
    },
  });
  await prisma.carModel.create({
    data: {
      name: "Model C", slug: "model-c", bodyType: "Sedan", tagline: "Refined comfort for the long road.",
      variants: {
        create: [
          { name: "VX Diesel", slug: "model-c-vx-diesel", fuel: "DIESEL", transmission: "MANUAL", exShowroomPrice: 1385000, engine: "1.5L diesel", powerBhp: 113, mileageKmpl: 23.0, seats: 5, colours: ["Silver", "Midnight Blue", "Pearl White"] },
          { name: "LX Petrol", slug: "model-c-lx-petrol", fuel: "PETROL", transmission: "AUTOMATIC", exShowroomPrice: 1295000, engine: "1.5L petrol", powerBhp: 121, mileageKmpl: 17.8, seats: 5, colours: ["Silver", "Pearl White"] },
        ],
      },
    },
  });
  await prisma.carModel.create({
    data: {
      name: "Model S", slug: "model-s", bodyType: "SUV", tagline: "Space for the whole family.",
      variants: {
        create: [
          { name: "LX Petrol", slug: "model-s-lx-petrol", fuel: "PETROL", transmission: "MANUAL", exShowroomPrice: 1175000, engine: "1.5L petrol", powerBhp: 108, mileageKmpl: 16.5, seats: 7, colours: ["Forest Green", "Pearl White", "Graphite Grey"] },
          { name: "ZX Diesel", slug: "model-s-zx-diesel", fuel: "DIESEL", transmission: "AUTOMATIC", exShowroomPrice: 1625000, engine: "2.0L diesel", powerBhp: 148, mileageKmpl: 15.2, seats: 7, colours: ["Forest Green", "Pearl White"] },
        ],
      },
    },
  });

  const variants = await prisma.variant.findMany();
  const models = await prisma.carModel.findMany();
  const vId = (slug: string) => variants.find((v) => v.slug === slug)!.id;
  const mId = (slug: string) => models.find((m) => m.slug === slug)!.id;

  // Price rules: one per variant per city
  for (const v of variants) {
    for (const city of [lucknow, kanpur]) {
      await prisma.priceRule.create({
        data: {
          variantId: v.id,
          cityId: city.id,
          roadTaxPct: ROAD_TAX_PCT[city.name],
          insurance: Math.round(v.exShowroomPrice * 0.032),
          accessories: 25000,
          otherCharges: 15000,
          validUntil: new Date("2026-12-31"),
        },
      });
    }
  }

  // Users (demo password for all: Demo@12345)
  const passwordHash = await bcrypt.hash("Demo@12345", 10);
  await prisma.user.create({ data: { name: "Admin User", email: "admin@dealership.example", passwordHash, role: "ADMIN" } });
  const aman = await prisma.user.create({ data: { name: "Aman Verma", email: "aman@dealership.example", passwordHash, role: "CONSULTANT", showroomId: gomti.id } });
  const neha = await prisma.user.create({ data: { name: "Neha Singh", email: "neha@dealership.example", passwordHash, role: "CONSULTANT", showroomId: gomti.id } });
  const rahul = await prisma.user.create({ data: { name: "Rahul Mishra", email: "rahul@dealership.example", passwordHash, role: "CONSULTANT", showroomId: kanpurRoad.id } });
  const sana = await prisma.user.create({ data: { name: "Sana Khan", email: "sana@dealership.example", passwordHash, role: "CONSULTANT", showroomId: civilLines.id } });

  // Lead assignment rules (by showroom and model; no model = handles all)
  await prisma.assignmentRule.createMany({
    data: [
      { showroomId: gomti.id, carModelId: mId("model-h"), consultantId: aman.id },
      { showroomId: gomti.id, carModelId: mId("model-c"), consultantId: aman.id },
      { showroomId: gomti.id, carModelId: mId("model-s"), consultantId: neha.id },
      { showroomId: kanpurRoad.id, carModelId: null, consultantId: rahul.id },
      { showroomId: civilLines.id, carModelId: null, consultantId: sana.id },
    ],
  });

  // Demo cars for test drives
  await prisma.demoCar.createMany({
    data: [
      { label: "Model H ZX Automatic (Demo)", variantId: vId("model-h-zx-automatic"), showroomId: gomti.id },
      { label: "Model C VX Diesel (Demo)", variantId: vId("model-c-vx-diesel"), showroomId: gomti.id },
      { label: "Model H VX Manual (Demo)", variantId: vId("model-h-vx-manual"), showroomId: kanpurRoad.id },
      { label: "Model S LX Petrol (Demo)", variantId: vId("model-s-lx-petrol"), showroomId: civilLines.id },
    ],
  });

  // Certified used cars (registration numbers are masked)
  await prisma.usedCar.createMany({
    data: [
      { stockId: "UC-1182", modelName: "Model C", variantName: "VX", fuel: "DIESEL", transmission: "MANUAL", year: 2022, kmDriven: 41200, owners: 1, registrationMasked: "UP32 ** ****", colour: "Silver", price: 845000, status: "AVAILABLE", inspectionScore: 92, inspectionNotes: "Single owner, full service history. Minor scratch on rear bumper.", showroomId: gomti.id },
      { stockId: "UC-1190", modelName: "Model S", variantName: "LX", fuel: "PETROL", transmission: "MANUAL", year: 2021, kmDriven: 58600, owners: 2, registrationMasked: "UP78 ** ****", colour: "Pearl White", price: 512000, status: "BOOKED", inspectionScore: 88, inspectionNotes: "Two owners. Tyres replaced at 50,000 km.", showroomId: civilLines.id },
      { stockId: "UC-1204", modelName: "Model H", variantName: "ZX", fuel: "PETROL", transmission: "AUTOMATIC", year: 2023, kmDriven: 18900, owners: 1, registrationMasked: "UP32 ** ****", colour: "Ruby Red", price: 965000, status: "AVAILABLE", inspectionScore: 96, inspectionNotes: "Like new. Under brand warranty until 2028.", showroomId: gomti.id },
      { stockId: "UC-1211", modelName: "Model C", variantName: "LX", fuel: "PETROL", transmission: "AUTOMATIC", year: 2020, kmDriven: 72400, owners: 2, registrationMasked: "UP80 ** ****", colour: "Midnight Blue", price: 698000, status: "AVAILABLE", inspectionScore: 84, inspectionNotes: "Two owners. Battery replaced in 2025.", showroomId: kanpurRoad.id },
      { stockId: "UC-1219", modelName: "Model S", variantName: "ZX", fuel: "DIESEL", transmission: "AUTOMATIC", year: 2022, kmDriven: 49800, owners: 1, registrationMasked: "UP78 ** ****", colour: "Forest Green", price: 1295000, status: "AVAILABLE", inspectionScore: 90, inspectionNotes: "Single owner, serviced at authorised workshop.", showroomId: civilLines.id },
      { stockId: "UC-1226", modelName: "Model H", variantName: "VX", fuel: "PETROL", transmission: "MANUAL", year: 2019, kmDriven: 86300, owners: 3, registrationMasked: "UP32 ** ****", colour: "Graphite Grey", price: 389000, status: "SOLD", inspectionScore: 78, inspectionNotes: "Three owners. Clutch replaced in 2024.", showroomId: gomti.id },
    ],
  });

  // A few sample leads so the inbox is never empty
  const now = Date.now();
  const minutes = (n: number) => new Date(now - n * 60 * 1000);
  const dueIn5 = (created: Date) => new Date(created.getTime() + 5 * 60 * 1000);
  const c1 = minutes(2);
  const c2 = minutes(45);
  const c3 = minutes(300);
  await prisma.lead.createMany({
    data: [
      { name: "Ritika Agarwal", phone: "9000000001", email: "ritika@example.com", message: "Interested in Model H automatic. What is the on-road price in Lucknow?", source: "WEBSITE", status: "NEW", consent: true, createdAt: c1, respondBy: dueIn5(c1), showroomId: gomti.id, assignedToId: aman.id, variantId: vId("model-h-zx-automatic") },
      { name: "Imran Qureshi", phone: "9000000002", message: "Want to test drive Model S this weekend.", source: "TEST_DRIVE", status: "NEW", consent: true, createdAt: c2, respondBy: dueIn5(c2), showroomId: civilLines.id, assignedToId: sana.id, variantId: vId("model-s-lx-petrol") },
      { name: "Deepak Tiwari", phone: "9000000003", email: "deepak@example.com", message: "Is the Model C diesel still available?", source: "PORTAL", status: "CONTACTED", consent: true, createdAt: c3, respondBy: dueIn5(c3), firstResponseAt: new Date(c3.getTime() + 3 * 60 * 1000), showroomId: gomti.id, assignedToId: aman.id, variantId: vId("model-c-vx-diesel") },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());