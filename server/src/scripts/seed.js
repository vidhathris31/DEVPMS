/**
 * Seeds MongoDB with demo data equivalent to the original in-memory mock
 * fixtures, plus a demo admin account. Run with: npm run seed
 */
import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Settings from "../models/Settings.js";

const EMPLOYEES = [
  { key: 1, name: "Aryan Mehta", role: "Tech Lead", dept: "Engineering", status: "active", avatar: "AM", email: "aryan@devpms.io", joined: "2019-03-12", skills: ["System Design", "Rust", "Security", "Go"], workload: 85 },
  { key: 2, name: "Priya Nair", role: "Backend Engineer", dept: "Engineering", status: "active", avatar: "PN", email: "priya@devpms.io", joined: "2021-07-01", skills: ["Node.js", "PostgreSQL", "Cryptography", "gRPC"], workload: 72 },
  { key: 3, name: "Siddharth V", role: "DevOps Engineer", dept: "Platform", status: "active", avatar: "SV", email: "sid@devpms.io", joined: "2020-01-15", skills: ["Kubernetes", "Terraform", "CI/CD", "AWS"], workload: 60 },
  { key: 4, name: "Kavya Rao", role: "Frontend Lead", dept: "Product", status: "active", avatar: "KR", email: "kavya@devpms.io", joined: "2022-04-20", skills: ["React", "TypeScript", "WebGL", "Performance"], workload: 90 },
  { key: 5, name: "Rohan Das", role: "ML Engineer", dept: "AI/ML", status: "active", avatar: "RD", email: "rohan@devpms.io", joined: "2021-11-03", skills: ["PyTorch", "LLMs", "MLOps", "Python"], workload: 55 },
  { key: 6, name: "Anita S", role: "UI/UX Designer", dept: "Design", status: "active", avatar: "AS", email: "anita@devpms.io", joined: "2018-06-10", skills: ["Figma", "Design Systems", "Framer", "Prototyping"], workload: 45 },
  { key: 7, name: "Deepa R", role: "Backend Lead", dept: "Engineering", status: "active", avatar: "DR", email: "deepa@devpms.io", joined: "2023-02-14", skills: ["Go", "Kafka", "Distributed Systems", "Fintech"], workload: 78 },
];

function projectsSeed(idOf) {
  return [
    {
      name: "NebulaCore Platform", repo: "org/nebulacore", type: "Backend", status: "active",
      priority: "critical", budget: 4200000, spent: 2646000, start: "2025-01-15", deadline: "2025-12-31", progress: 62,
      stack: ["Node.js", "PostgreSQL", "Redis", "Docker", "K8s"],
      team: [
        { name: "Aryan Mehta", role: "Tech Lead", avatar: "AM", employee: idOf(1) },
        { name: "Priya Nair", role: "Backend Dev", avatar: "PN", employee: idOf(2) },
        { name: "Sid V", role: "DevOps", avatar: "SV", employee: idOf(3) },
      ],
      tasks: [
        { title: "Microservice architecture design", status: "done", assignee: "AM", due: "2025-02-15", points: 8 },
        { title: "Auth service + JWT implementation", status: "done", assignee: "PN", due: "2025-03-20", points: 13 },
        { title: "API gateway + rate limiting", status: "active", assignee: "SV", due: "2025-09-01", points: 8 },
        { title: "Redis caching layer", status: "todo", assignee: "PN", due: "2025-10-15", points: 5 },
        { title: "Load testing & perf benchmarks", status: "todo", assignee: "AM", due: "2025-12-01", points: 8 },
      ],
      prs: [
        { title: "feat: rate limiter middleware", author: "SV", status: "open", comments: 3, changed: "+284 -12", time: "2h ago" },
        { title: "fix: JWT refresh token race", author: "PN", status: "merged", comments: 7, changed: "+45 -88", time: "6h ago" },
        { title: "chore: upgrade pg to v16", author: "AM", status: "merged", comments: 1, changed: "+12 -10", time: "1d ago" },
      ],
      deploys: [
        { env: "production", version: "v2.4.1", status: "live", time: "3d ago" },
        { env: "staging", version: "v2.5.0-rc2", status: "live", time: "4h ago" },
        { env: "dev", version: "v2.5.0-alpha", status: "live", time: "30m ago" },
      ],
      milestones: [
        { pct: 25, label: "Architecture", done: true },
        { pct: 50, label: "Core Services", done: true },
        { pct: 75, label: "API Gateway", done: false },
        { pct: 100, label: "Prod Launch", done: false },
      ],
      velocity: [21, 34, 28, 42, 38, 29, 45],
      budgetHistory: [
        { m: "Jan", v: 180000 }, { m: "Feb", v: 290000 }, { m: "Mar", v: 340000 },
        { m: "Apr", v: 510000 }, { m: "May", v: 380000 }, { m: "Jun", v: 420000 },
      ],
      notes: "Targeting 99.99% uptime SLA. K8s migration in Q4. Service mesh (Istio) under eval.",
    },
    {
      name: "Helix AI Dashboard", repo: "org/helix-dash", type: "Full-Stack", status: "active",
      priority: "high", budget: 8750000, spent: 2975000, start: "2024-09-01", deadline: "2026-03-15", progress: 34,
      stack: ["React 18", "TypeScript", "FastAPI", "PyTorch", "LangChain"],
      team: [
        { name: "Kavya Rao", role: "Frontend Lead", avatar: "KR", employee: idOf(4) },
        { name: "Rohan Das", role: "ML Engineer", avatar: "RD", employee: idOf(5) },
        { name: "Anita S", role: "UI/UX", avatar: "AS", employee: idOf(6) },
      ],
      tasks: [
        { title: "Design system & component lib", status: "done", assignee: "AS", due: "2024-10-01", points: 13 },
        { title: "ML inference API integration", status: "done", assignee: "RD", due: "2024-12-15", points: 8 },
        { title: "Real-time WebSocket pipeline", status: "active", assignee: "KR", due: "2025-08-01", points: 13 },
        { title: "Dashboard widget framework", status: "todo", assignee: "KR", due: "2025-11-01", points: 8 },
        { title: "Model explainability module", status: "todo", assignee: "RD", due: "2026-01-01", points: 13 },
      ],
      prs: [
        { title: "feat: streaming chart component", author: "KR", status: "open", comments: 5, changed: "+612 -34", time: "1h ago" },
        { title: "fix: tensor memory leak on unmount", author: "RD", status: "review", comments: 9, changed: "+23 -156", time: "5h ago" },
      ],
      deploys: [
        { env: "production", version: "v1.2.3", status: "live", time: "1w ago" },
        { env: "staging", version: "v1.3.0-beta", status: "deploying", time: "10m ago" },
      ],
      milestones: [
        { pct: 20, label: "Design System", done: true },
        { pct: 40, label: "Core Pipeline", done: false },
        { pct: 70, label: "Dashboard MVP", done: false },
        { pct: 100, label: "Public Beta", done: false },
      ],
      velocity: [12, 18, 22, 17, 25, 31, 28],
      budgetHistory: [
        { m: "Sep", v: 320000 }, { m: "Oct", v: 480000 }, { m: "Nov", v: 540000 },
        { m: "Dec", v: 610000 }, { m: "Jan", v: 520000 }, { m: "Feb", v: 505000 },
      ],
      notes: "LLM integration via groq API. Sub-200ms inference SLA target.",
    },
    {
      name: "PayStream Gateway", repo: "org/paystream", type: "Fintech", status: "active",
      priority: "high", budget: 1850000, spent: 1443000, start: "2025-03-01", deadline: "2025-10-30", progress: 78,
      stack: ["Go", "gRPC", "Kafka", "K8s", "Vault"],
      team: [
        { name: "Deepa R", role: "Backend Lead", avatar: "DR", employee: idOf(7) },
        { name: "Nikhil T", role: "Security Eng", avatar: "NT", employee: idOf(1) },
      ],
      tasks: [
        { title: "PCI-DSS compliance audit", status: "done", assignee: "NT", due: "2025-05-01", points: 21 },
        { title: "Payment processor integration", status: "done", assignee: "DR", due: "2025-06-15", points: 13 },
        { title: "Fraud detection ML module", status: "active", assignee: "DR", due: "2025-09-01", points: 13 },
        { title: "Settlement reporting UI", status: "todo", assignee: "NT", due: "2025-10-15", points: 5 },
      ],
      prs: [{ title: "feat: Razorpay webhook handler", author: "DR", status: "merged", comments: 4, changed: "+187 -9", time: "1d ago" }],
      deploys: [
        { env: "production", version: "v3.1.0", status: "live", time: "5d ago" },
        { env: "staging", version: "v3.2.0-rc1", status: "live", time: "2d ago" },
      ],
      milestones: [
        { pct: 50, label: "PCI Certified", done: true },
        { pct: 80, label: "Fraud Detection", done: false },
        { pct: 100, label: "GA Launch", done: false },
      ],
      velocity: [28, 35, 29, 41, 38, 44, 40],
      budgetHistory: [
        { m: "Mar", v: 210000 }, { m: "Apr", v: 310000 }, { m: "May", v: 290000 },
        { m: "Jun", v: 260000 }, { m: "Jul", v: 230000 }, { m: "Aug", v: 143000 },
      ],
      notes: "RBI sandbox testing scheduled. 99.999% uptime req. Vault for secrets management.",
    },
    {
      name: "Orbital CDN", repo: "org/orbital-cdn", type: "Infrastructure", status: "shipped",
      priority: "low", budget: 3100000, spent: 2987000, start: "2024-02-01", deadline: "2024-11-30", progress: 100,
      stack: ["Rust", "Nginx", "Terraform", "AWS", "Cloudflare"],
      team: [{ name: "Kiran M", role: "Infra Lead", avatar: "KM", employee: idOf(2) }],
      tasks: [
        { title: "Edge node deployment (12 regions)", status: "done", assignee: "KM", due: "2024-08-01", points: 34 },
        { title: "CDN cache invalidation API", status: "done", assignee: "KM", due: "2024-11-01", points: 13 },
      ],
      prs: [],
      deploys: [{ env: "production", version: "v1.0.0", status: "live", time: "7mo ago" }],
      milestones: [{ pct: 100, label: "All edge nodes live", done: true }],
      velocity: [40, 38, 45, 42, 48, 44, 41],
      budgetHistory: [
        { m: "Feb", v: 400000 }, { m: "Mar", v: 520000 }, { m: "Apr", v: 490000 },
        { m: "May", v: 510000 }, { m: "Jun", v: 580000 }, { m: "Jul", v: 487000 },
      ],
      notes: "Shipped 3 weeks early. 2.4B req/day at peak. p99 latency: 18ms globally.",
    },
    {
      name: "Vortex Data Lake", repo: "org/vortex-lake", type: "Data", status: "paused",
      priority: "low", budget: 2200000, spent: 396000, start: "2024-06-01", deadline: "2025-05-30", progress: 18,
      stack: ["Spark", "Delta Lake", "dbt", "Snowflake", "Airflow"],
      team: [{ name: "Mohan K", role: "Data Eng", avatar: "MK", employee: idOf(3) }],
      tasks: [
        { title: "Schema design & governance", status: "done", assignee: "MK", due: "2024-07-01", points: 13 },
        { title: "Ingestion pipelines — S3/GCS", status: "active", assignee: "MK", due: "2024-09-01", points: 21 },
      ],
      prs: [], deploys: [],
      milestones: [
        { pct: 18, label: "Schema approved", done: true },
        { pct: 100, label: "Pipeline live", done: false },
      ],
      velocity: [8, 12, 9, 0, 0, 0, 0],
      budgetHistory: [{ m: "Jun", v: 120000 }, { m: "Jul", v: 160000 }, { m: "Aug", v: 116000 }],
      notes: "On hold — data retention policy alignment needed. Resume Q1 2026.",
    },
    {
      name: "Quantum Auth SDK", repo: "org/q-auth", type: "Security", status: "active",
      priority: "critical", budget: 12400000, spent: 4340000, start: "2024-11-01", deadline: "2026-10-31", progress: 35,
      stack: ["Rust", "WebAuthn", "FIDO2", "WASM", "Zero Trust"],
      team: [
        { name: "Aryan Mehta", role: "Security Arch", avatar: "AM", employee: idOf(1) },
        { name: "Priya Nair", role: "Crypto Eng", avatar: "PN", employee: idOf(2) },
        { name: "Kavya Rao", role: "SDK Dev", avatar: "KR", employee: idOf(4) },
      ],
      tasks: [
        { title: "Threat model & RFC draft", status: "done", assignee: "AM", due: "2024-12-01", points: 13 },
        { title: "FIDO2 authenticator core", status: "done", assignee: "PN", due: "2025-02-01", points: 21 },
        { title: "WebAuthn browser bindings", status: "active", assignee: "KR", due: "2025-08-01", points: 21 },
        { title: "Attestation verification", status: "todo", assignee: "PN", due: "2025-12-01", points: 13 },
        { title: "SDK docs & developer portal", status: "todo", assignee: "KR", due: "2026-04-01", points: 8 },
        { title: "Penetration test & CVE audit", status: "todo", assignee: "AM", due: "2026-09-01", points: 21 },
      ],
      prs: [
        { title: "feat: WASM attestation module", author: "KR", status: "open", comments: 11, changed: "+1240 -88", time: "3h ago" },
        { title: "fix: timing side-channel in HMAC", author: "PN", status: "review", comments: 6, changed: "+18 -34", time: "1d ago" },
      ],
      deploys: [{ env: "dev", version: "v0.4.2-alpha", status: "live", time: "2d ago" }],
      milestones: [
        { pct: 20, label: "RFC approved", done: true },
        { pct: 40, label: "Crypto core", done: false },
        { pct: 65, label: "Browser support", done: false },
        { pct: 85, label: "Audit cleared", done: false },
        { pct: 100, label: "v1.0 Release", done: false },
      ],
      velocity: [15, 18, 22, 19, 28, 25, 31],
      budgetHistory: [
        { m: "Nov", v: 380000 }, { m: "Dec", v: 560000 }, { m: "Jan", v: 710000 },
        { m: "Feb", v: 820000 }, { m: "Mar", v: 940000 }, { m: "Apr", v: 930000 },
      ],
      notes: "Post-quantum (CRYSTALS-Kyber) eval in progress. NIST PQC finalist under review.",
    },
  ];
}

async function seed() {
  await connectDB();

  console.log("[seed] clearing existing demo collections...");
  await Promise.all([Project.deleteMany({}), Employee.deleteMany({})]);

  console.log("[seed] inserting employees...");
  const insertedEmployees = await Employee.insertMany(
    EMPLOYEES.map(({ key, ...rest }) => rest)
  );
  const idByKey = new Map(EMPLOYEES.map((e, i) => [e.key, insertedEmployees[i]._id]));
  const idOf = (key) => idByKey.get(key);

  console.log("[seed] inserting projects...");
  await Project.insertMany(projectsSeed(idOf));

  const adminEmail = "admin@devpms.io";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    console.log("[seed] creating demo admin user (admin@devpms.io / password123)...");
    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: "password123",
      role: "admin",
    });
    await Settings.create({ user: admin._id });
  } else {
    console.log("[seed] demo admin user already exists, skipping.");
  }

  console.log("[seed] done.");
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
