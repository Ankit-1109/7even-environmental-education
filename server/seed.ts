import { db } from "./db";
import { lessons, missions, guilds, type InsertLesson, type InsertMission, type InsertGuild } from "@shared/schema";

const sampleLessons: InsertLesson[] = [
  // EcoExplorer Track
  {
    title: "Understanding Ecosystems",
    description: "Learn about the interconnected web of life and how organisms depend on each other.",
    content: "Ecosystems are complex networks where every organism plays a vital role. From producers to decomposers, each level of the food chain contributes to the balance of nature.",
    track: "EcoExplorer",
    difficulty: "beginner",
    xpReward: 100,
    estimatedMinutes: 15,
    order: 1,
  },
  {
    title: "Biodiversity Hotspots",
    description: "Explore the world's most biodiverse regions and understand why they need protection.",
    content: "Biodiversity hotspots contain exceptional levels of plant and animal species that are found nowhere else on Earth. These areas face severe threats from human activities.",
    track: "EcoExplorer",
    difficulty: "intermediate",
    xpReward: 150,
    estimatedMinutes: 20,
    order: 2,
  },
  {
    title: "Marine Conservation",
    description: "Discover the importance of protecting our oceans and marine life.",
    content: "Our oceans cover 71% of the Earth's surface and contain 99% of the living space on our planet. Marine ecosystems face threats from pollution, overfishing, and climate change.",
    track: "EcoExplorer",
    difficulty: "advanced",
    xpReward: 200,
    estimatedMinutes: 25,
    order: 3,
  },

  // ClimateChampion Track
  {
    title: "Climate Science Basics",
    description: "Understand the greenhouse effect and how human activities influence climate.",
    content: "The greenhouse effect is a natural process that keeps Earth warm enough to support life. However, human activities have intensified this effect, leading to climate change.",
    track: "ClimateChampion",
    difficulty: "beginner",
    xpReward: 100,
    estimatedMinutes: 18,
    order: 1,
  },
  {
    title: "Renewable Energy Solutions",
    description: "Learn about clean energy technologies and their role in fighting climate change.",
    content: "Renewable energy sources like solar, wind, and hydroelectric power offer sustainable alternatives to fossil fuels, reducing greenhouse gas emissions.",
    track: "ClimateChampion",
    difficulty: "intermediate",
    xpReward: 150,
    estimatedMinutes: 22,
    order: 2,
  },
  {
    title: "Carbon Footprint Reduction",
    description: "Discover practical ways to reduce your personal carbon footprint.",
    content: "Every action has a carbon footprint. Learn how transportation choices, energy use, and consumption habits contribute to greenhouse gas emissions.",
    track: "ClimateChampion",
    difficulty: "intermediate",
    xpReward: 150,
    estimatedMinutes: 20,
    order: 3,
  },

  // WasteWarrior Track
  {
    title: "The 3 R's: Reduce, Reuse, Recycle",
    description: "Master the fundamental principles of waste reduction.",
    content: "The waste hierarchy prioritizes reducing consumption first, then reusing items, and finally recycling materials. This approach minimizes environmental impact.",
    track: "WasteWarrior",
    difficulty: "beginner",
    xpReward: 100,
    estimatedMinutes: 12,
    order: 1,
  },
  {
    title: "Composting and Organic Waste",
    description: "Learn how to turn food scraps into valuable compost.",
    content: "Composting is nature's way of recycling organic matter. It reduces methane emissions from landfills and creates nutrient-rich soil amendment.",
    track: "WasteWarrior",
    difficulty: "beginner",
    xpReward: 120,
    estimatedMinutes: 15,
    order: 2,
  },
  {
    title: "Zero Waste Lifestyle",
    description: "Explore strategies for minimizing waste in daily life.",
    content: "Zero waste is a philosophy that encourages redesigning resource use to reduce waste to zero. It involves refusing, reducing, reusing, recycling, and composting.",
    track: "WasteWarrior",
    difficulty: "advanced",
    xpReward: 200,
    estimatedMinutes: 30,
    order: 3,
  },

  // GreenInnovator Track
  {
    title: "Sustainable Technology",
    description: "Discover how technology can solve environmental challenges.",
    content: "Green technology encompasses innovations that reduce environmental impact, from electric vehicles to smart grid systems and green building technologies.",
    track: "GreenInnovator",
    difficulty: "intermediate",
    xpReward: 150,
    estimatedMinutes: 25,
    order: 1,
  },
  {
    title: "Circular Economy Principles",
    description: "Learn about designing out waste and keeping materials in use.",
    content: "The circular economy is a model that designs out waste and pollution, keeps products and materials in use, and regenerates natural systems.",
    track: "GreenInnovator",
    difficulty: "advanced",
    xpReward: 180,
    estimatedMinutes: 28,
    order: 2,
  },
  {
    title: "Environmental Entrepreneurship",
    description: "Explore how to build businesses that benefit the planet.",
    content: "Environmental entrepreneurship involves creating businesses that generate profit while solving environmental problems and creating positive impact.",
    track: "GreenInnovator",
    difficulty: "advanced",
    xpReward: 220,
    estimatedMinutes: 35,
    order: 3,
  },
];

const sampleMissions: InsertMission[] = [
  {
    title: "Tree Planting Challenge",
    description: "Plant 5 trees in your community and document the process with photos.",
    type: "action",
    xpReward: 500,
    ecoCreditsReward: 50,
    requirementType: "photo_upload",
    requirementValue: "5",
    isActive: true,
  },
  {
    title: "Plastic-Free Week",
    description: "Go an entire week without using single-use plastics. Track your alternatives.",
    type: "challenge",
    xpReward: 300,
    ecoCreditsReward: 30,
    requirementType: "duration",
    requirementValue: "7",
    isActive: true,
  },
  {
    title: "Energy Audit Master",
    description: "Complete energy audits of 3 different buildings and suggest improvements.",
    type: "research",
    xpReward: 400,
    ecoCreditsReward: 40,
    requirementType: "report",
    requirementValue: "3",
    isActive: true,
  },
  {
    title: "Community Clean-Up Leader",
    description: "Organize and lead a community clean-up event with at least 10 participants.",
    type: "community",
    xpReward: 600,
    ecoCreditsReward: 60,
    requirementType: "event",
    requirementValue: "10",
    isActive: true,
  },
  {
    title: "Sustainable Transport Champion",
    description: "Use only sustainable transportation (walking, cycling, public transport) for 2 weeks.",
    type: "challenge",
    xpReward: 350,
    ecoCreditsReward: 35,
    requirementType: "duration",
    requirementValue: "14",
    isActive: true,
  },
  {
    title: "Water Conservation Expert",
    description: "Implement 5 water-saving measures at home and track your water usage reduction.",
    type: "action",
    xpReward: 250,
    ecoCreditsReward: 25,
    requirementType: "measurement",
    requirementValue: "5",
    isActive: true,
  },
];

const sampleGuilds: InsertGuild[] = [
  {
    id: "eco-warriors",
    name: "Eco Warriors",
    description: "A guild for passionate environmental activists working to protect our planet through direct action and advocacy.",
    memberCount: 42,
    currentChallenge: "Plant 1000 trees by end of month",
    challengeProgress: 487,
    challengeTarget: 1000,
  },
  {
    id: "green-innovators",
    name: "Green Innovators",
    description: "Focused on developing and promoting sustainable technologies and innovative solutions to environmental challenges.",
    memberCount: 38,
    currentChallenge: "Develop 5 green tech prototypes",
    challengeProgress: 3,
    challengeTarget: 5,
  },
  {
    id: "climate-defenders",
    name: "Climate Defenders",
    description: "Dedicated to climate action, renewable energy advocacy, and reducing carbon footprints in our communities.",
    memberCount: 55,
    currentChallenge: "Reduce guild carbon footprint by 20%",
    challengeProgress: 14,
    challengeTarget: 20,
  },
  {
    id: "waste-eliminators",
    name: "Waste Eliminators",
    description: "Specialists in waste reduction, recycling initiatives, and promoting circular economy principles.",
    memberCount: 31,
    currentChallenge: "Achieve zero waste lifestyle for 100 days",
    challengeProgress: 67,
    challengeTarget: 100,
  },
];

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed lessons
    console.log("📚 Seeding lessons...");
    await db.insert(lessons).values(sampleLessons).onConflictDoNothing();

    // Seed missions
    console.log("🎯 Seeding missions...");
    await db.insert(missions).values(sampleMissions).onConflictDoNothing();

    // Seed guilds
    console.log("🏛️ Seeding guilds...");
    await db.insert(guilds).values(sampleGuilds).onConflictDoNothing();

    console.log("✅ Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return false;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}