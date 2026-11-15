# Stratus — Source Inventory, Curriculum Map & Implementation Plan

Prepared 2026-11-04 for the AWS Certified Cloud Practitioner (CLF-C02) study app.

---

## 1. Source inventory

### 1.1 Local materials (AWS CSIT341 folder — every file was opened and read)

| # | File | Format | What it contains | How it is used |
|---|------|--------|------------------|----------------|
| L1 | `01 Introduction to Cloud Computing.md` | Markdown | Cloud definition, IaaS/PaaS/SaaS, deployment models, AWS CAF six perspectives | Lecture M1 |
| L2 | `02 Cloud Economics and Billing.md` | Markdown | Cost drivers, pay-as-you-go / reserve / volume, Free Tier, TCO + Delaware North case, Organizations, Billing tools, Support | Lectures M9, M7 (Organizations) |
| L3 | `03 AWS Global Infrastructure Overview.md` | Markdown | Regions, AZs, data centers, PoPs, HA/FT/elasticity, service-category overview | Lectures M1, M2 |
| L4 | `04 AWS Cloud Security.md` | Markdown | Shared responsibility (OF/IN), service-type split, IAM users/groups/roles/policies, policy evaluation | Lecture M7 |
| L5 | `05 Network and Content Delivery.md` | Markdown | Networking basics, CIDR, OSI, VPC, subnets, ENI/EIP, route tables, IGW, NAT, peering, Direct Connect, endpoints, Transit Gateway, SG vs NACL, Route 53 routing, CloudFront | Lecture M5 |
| L6 | `06 Compute.md` | Markdown | EC2 overview, 9 launch decisions, instance families, pricing models, 4 cost-optimisation pillars, containers, ECS/EKS/Fargate/ECR, Lambda, Beanstalk | Lecture M3, M9 |
| L7 | `07 Storage.md` | Markdown | EBS, S3, lifecycle, pricing, EFS, Glacier, vaults, quiz study notes | Lecture M4 |
| L8 | `08 Databases.md` | Markdown | RDS managed vs unmanaged, Multi-AZ, read replicas, billing, DynamoDB, Redshift, Aurora | Lecture M6 |
| L9 | `09 Cloud Architecture.md` | Markdown | Well-Architected Framework pillars + design principles, reliability/availability, Trusted Advisor | Lectures M2, M8 |
| L10 | `10 Automatic Scaling and Monitoring.md` | Markdown | ELB types, CloudWatch, EC2 Auto Scaling | Lectures M3, M8 |
| L11 | `AWS Practice Exam — Clean Notes.md` | Markdown (Obsidian callouts) | **50 MCQs**, Modules 1–10, with answers and short explanations | Section A quiz (all 50) |
| L12 | `AWS-Practice-Exam-Answer-Key.md` | Markdown | The same 50 questions as L11, answer key only | Cross-checked against L11 — identical keys |
| L13 | `AWS Practice Quiz.html` | HTML/JS | The same 50 questions as L11 packaged as a quiz (50 items in `Q` array) | Cross-checked — no extra questions |
| L14 | `Knowledge Check/04 AWS Cloud Security.md` | Markdown | 10 questions (MCQ, choose-two, true/false; Q7 has mis-pasted options) | Section B |
| L15 | `Knowledge Check/05 Networking and Content Delivery.md` | Markdown | 10 questions (CIDR sizes, NAT, NACL, reserved IPs…) | Section B |
| L16 | `Knowledge Check/06 Compute.md` | Markdown | 10 questions (pricing, AMI, tenancy, Lambda, containers…) | Section B |
| L17 | `Knowledge Check/07 Storage.md` | Markdown | 10 questions (S3, EBS, EFS, Glacier; several choose-two/three, T/F) | Section B |
| L18 | `Slido/06 Compute — RECAP.md` | Markdown | 5 scenario MCQs (AMI, user data, instance families, right-sizing, Lambda pricing) | Section B |

No PDFs, Office files or images with question content were found (the only other file is `.DS_Store`).
Knowledge Check folders exist only for Modules 4–7 and Slido only for Module 6 — the app does not invent KC/Slido items for the other modules.

### 1.2 External / official references

| # | Source | Used for |
|---|--------|----------|
| R1 | [CLF-C02 Exam Guide (AWS docs)](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html) | Format (50 scored + 15 unscored, 100–1000 scale, 700 to pass, compensatory scoring), domain weightings |
| R2 | [CLF-C02 Domain 3 task statements](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02-domain3.html) | AI/ML + analytics (SageMaker AI, Lex, Athena, Kinesis, Glue, Amazon Quick), other in-scope categories (Connect, SES, AppStream 2.0, WorkSpaces, Amplify, IoT Core, CodeBuild, CodePipeline, X-Ray) |
| R3 | [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) | Six pillars (Sustainability added 2021) |
| R4 | [AWS Global Infrastructure — Regions & AZs](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/) | AZ definition, "within 100 km of each other" |
| R5 | [Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) | Security OF / IN the cloud, shared controls |
| R6 | [New and enhanced AWS Support plans (AWS News Blog, Dec 2025)](https://aws.amazon.com/blogs/aws/new-and-enhanced-aws-support-plans-add-ai-capabilities-to-expert-guidance) | Business Support+, Enterprise Support, Unified Operations; legacy plans end 1 Jan 2027 |
| R7 | [AWS Free Tier update (What's New, Jul 2025)](https://aws.amazon.com/about-aws/whats-new/2025/07/aws-free-tier-credits-month-free-plan/) | Up to $200 credits, 6-month free plan for accounts created on/after 15 Jul 2025 |
| R8 | [EC2 purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html) | On-Demand, Savings Plans, RIs, Spot, Dedicated, Capacity Reservations; Scheduled RIs no longer sold |
| R9 | [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) | 10,240 MB memory, 15-minute timeout |
| R10 | [S3 storage classes](https://aws.amazon.com/s3/storage-classes/) | Class characteristics, retrieval times |
| R11 | [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) / [root-user tasks](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html#root-user-tasks) | Least privilege, MFA, root-only tasks |
| R12 | [Amazon VPC user guide](https://docs.aws.amazon.com/vpc/latest/userguide/) | Subnet sizes (/16–/28), 5 reserved IPs, SG vs NACL |
| R13 | [Amazon Aurora overview](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.html) | 6 copies / 3 AZs, storage up to 128 TiB |
| R14 | [AWS Cloud Adoption Framework](https://aws.amazon.com/cloud-adoption-framework/) | Six perspectives |
| R15 | [AWS Health Dashboard](https://docs.aws.amazon.com/health/latest/ug/aws-health-dashboard-status.html) | Service Health Dashboard merged into AWS Health Dashboard |

### 1.3 Corrections applied to the course material (outdated or inaccurate in local notes)

| Local note says | Current / correct fact | Where fixed |
|---|---|---|
| Well-Architected has **5** pillars (L9 objectives) | **6** pillars — Sustainability added Dec 2021 | Lecture M2, quizzes |
| AZs are "**at least** 100 km apart" (L3) | AZs are separated by a meaningful distance but are all **within 100 km (60 mi)** of each other | Lecture M2 |
| Lambda max memory **3,008 MB** (L6) | **10,240 MB** (10 GB); 15-min max timeout unchanged | Lecture M3 |
| Spot runs while "**your bid** is above the Spot price" (L6) | No bidding since 2017 — you pay the current Spot price; optional max price | Lecture M3, M9 |
| Scheduled Reserved Instances available (L6, KC-06 Q2) | No longer sold; use On-Demand Capacity Reservations + Savings Plans | Lecture M9, KC-06 Q2 rewritten |
| RIs save up to 75% (L2) | AWS states up to **72%** for RIs/Savings Plans, up to **90%** for Spot | Lecture M9 |
| Free Tier = "free for 1 year" (L2) | Accounts created on/after 15 Jul 2025: up to $200 credits, Free plan for 6 months; Always-Free offers continue; older accounts keep legacy 12-month offers | Lecture M9 |
| Aurora storage up to **64 TB** (L8) | Up to **128 TiB** | Lecture M6 |
| DynamoDB "replicates tables automatically across your choice of Regions" (L8) | Only if you enable **Global Tables**; by default data is replicated across AZs in one Region | Lecture M6 |
| RDS has "six" engines (L8) | Aurora (MySQL/PostgreSQL), MySQL, MariaDB, PostgreSQL, Oracle, SQL Server, **Db2** | Lecture M6 |
| Support plans: Basic/Developer/Business/Enterprise On-Ramp/Enterprise (L2, Clean Notes Q9) | Dec 2025: Basic, **Business Support+**, **Enterprise Support**, **Unified Operations**; legacy plans run until 1 Jan 2027. The exam may still use legacy names — both are taught | Lecture M9, Clean Notes Q9 note |
| "AWS Service Health Dashboard" | Merged into the **AWS Health Dashboard** | Lecture M8 |
| Amazon QuickSight | Now presented as **Amazon Quick** (Quick Sight) in the exam guide | Lecture M6 |
| KC-04 Q7 options mis-pasted (duplicated Q3) | Rebuilt with proper options; answer = close the account (root-only); original key "Change support plan" noted | Section B |

---

## 2. Curriculum mapping (10 modules ↔ CLF-C02 domains ↔ CSIT341 notes)

| Module | Title | CLF-C02 task statements | CSIT341 source |
|---|---|---|---|
| M1 | Cloud Computing & AWS Fundamentals | 1.1 benefits, 1.3 migration & CAF, 1.4 economics concepts, 3.1 deployment models, 2.1 intro | L1, L3 |
| M2 | Global Infrastructure & Architecture | 3.2 global infra, 1.2 Well-Architected, DR strategies | L3, L9 |
| M3 | Compute | 3.3 compute, containers, serverless, ELB, Auto Scaling | L6, L10 |
| M4 | Storage | 3.6 storage (S3 classes, lifecycle, EBS, instance store, EFS, FSx, Storage Gateway, Backup, Snow Family) | L7 |
| M5 | Networking & Content Delivery | 3.5 network, 3.2 edge | L5 |
| M6 | Databases, Analytics, AI/ML & App Integration | 3.4 databases + DMS/SCT, 3.7 AI/ML & analytics, 3.8 SQS/SNS/EventBridge/Step Functions | L8 |
| M7 | Security, Identity & Compliance | 2.1–2.4 (shared responsibility, IAM, Organizations, KMS, Shield, WAF, GuardDuty, Inspector, Security Hub, Macie, Detective, Artifact, Cognito, IAM Identity Center) | L4, L2 |
| M8 | Monitoring, Management & Governance | 3.1 access methods/IaC, 2.2 governance (CloudTrail, Config, CloudWatch), Systems Manager, Trusted Advisor, Health, Control Tower, developer tools (CodeBuild, CodePipeline, X-Ray) | L9, L10 |
| M9 | Cloud Economics, Pricing & Support | 4.1–4.3, 1.4 | L2, L6 |
| M10 | Exam Review & Real-World Scenarios | All domains + 3.8 other categories (Connect, SES, WorkSpaces, AppStream 2.0, Amplify, IoT Core) | All |

Coverage check — every task statement in R1/R2 is owned by at least one module (see table). Domain weightings are mirrored in the Final Boss blueprint: D1 ≈ 24%, D2 ≈ 30%, D3 ≈ 34%, D4 ≈ 12%.

---

## 3. Implementation plan

**Architecture** — static site, vanilla HTML/CSS/JS, no build step, opens directly from `index.html` (file://).
Content is stored as JavaScript data modules in `data/` (not `.json`) because browsers block `fetch()` of local JSON files on `file://`; each data file registers its content on a global `STRATUS` object, keeping content separate from logic.

**Question schema** (expanded at load by `js/questions.js`):
`id, bank, module, domain, topic, category (definition|situational), difficulty (1–3), question, options[4], correctAnswer (index), explanation, distractorExplanations{index: text}, source, learningObjective`.
Options are shuffled with a seeded shuffle per question id, so letters are stable for a given question but answer position does not leak.

**Phases**
1. Shell + design system (desktop-first dark charcoal, orange glow, pill controls — from the reference mock-up), router, storage.
2. Engines: quiz engine (practice / exam-sim), SM-2-inspired SRS, XP/streak/badges, analytics.
3. Content: 10 lectures; 10 × 30 module questions (15 D + 15 S); Final Boss 120 (60 D + 60 S); Section A (50); Section B (45).
4. QA: automated count/schema validator (`tools/validate.html` + node script), browser functional pass.
