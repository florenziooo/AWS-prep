STRATUS.lecture({
  id: 'm1', num: 1, minutes: 35,
  tagline: 'What the cloud actually is, why companies move to it, and the vocabulary every other module builds on.',
  subtitle: 'This module builds the mental model for the whole exam: cloud computing as <b>renting IT on demand</b> instead of owning it. You will learn the six advantages AWS repeats everywhere, the service models (IaaS / PaaS / SaaS), the deployment models (cloud, hybrid, on-premises), a first look at the global infrastructure and shared responsibility, and how organisations plan a migration with the AWS Cloud Adoption Framework.',
  objectives: [
    'Define cloud computing and its five essential characteristics.',
    'Compare on-premises IT with cloud computing (CapEx vs OpEx, capacity, speed).',
    'Recall the six advantages of cloud computing and match them to scenarios.',
    'Distinguish IaaS, PaaS and SaaS and how control and responsibility shift between them.',
    'Identify cloud, hybrid and on-premises (private cloud) deployment models.',
    'Describe AWS Regions, Availability Zones and edge locations at a high level.',
    'Outline the shared responsibility model and the AWS CAF perspectives and migration strategies.'
  ],
  why: '<p>Domain 1 (Cloud Concepts) is <b>24 %</b> of the scored exam, and many questions are simply “which benefit of the cloud is this?”. Getting this vocabulary exact — <i>elasticity</i> vs <i>scalability</i>, <i>agility</i> vs <i>economies of scale</i> — earns easy points and makes every later module easier.</p>',
  sections: [
    { id: 'eli5', title: 'Cloud computing, explained simply', level: 'b', tags: 'definition cloud computing on-demand pay-as-you-go',
      html: `${K.eli5('<p>Imagine you need electricity. You <i>could</i> build a power plant in your backyard — buy generators, hire engineers, fix them when they break, and size them for the hottest day of the year. Or you plug into the wall and pay the electric company for exactly what you use.</p><p><b>Cloud computing is plugging into the wall for IT.</b> Servers, storage, databases and software are delivered over the internet, ready in minutes, and you pay only for what you consume.</p>')}
      <p>AWS's official definition: <b>cloud computing is the on-demand delivery of compute power, database, storage, applications and other IT resources over the internet with pay-as-you-go pricing.</b> Every word of that definition is testable:</p>
      <ul><li><b>On-demand</b> — you get resources when you ask, without ordering hardware.</li><li><b>Over the internet</b> — accessed through the console, CLI, SDKs or APIs.</li><li><b>Pay-as-you-go</b> — no large upfront payment; billed per second, hour, GB or request.</li></ul>
      <p>Your CSIT341 notes add the core mindset: <b>infrastructure as software</b>. Servers become temporary and disposable — you launch them from code, throw them away when finished, and launch identical ones again.</p>
      ${K.recall('In one sentence, how does AWS define cloud computing?', 'The on-demand delivery of compute power, databases, storage, applications and other IT resources over the internet with pay-as-you-go pricing.')}` },
    { id: 'characteristics', title: 'Five essential characteristics (NIST)', level: 'b', tags: 'characteristics self-service broad network access resource pooling rapid elasticity measured service',
      html: `<p>The widely used NIST definition lists five characteristics. If a service lacks them, it is not really “cloud”.</p>
      ${K.table(['Characteristic', 'Meaning', 'AWS example'], [
        ['On-demand self-service', 'Provision resources yourself, without a human at the provider', 'Launching an EC2 instance from the console in 60 seconds'],
        ['Broad network access', 'Available over the network from many device types', 'Console, CLI, SDKs, mobile app'],
        ['Resource pooling', 'Provider serves many customers from shared, multi-tenant hardware', 'Many accounts share AWS data centers, isolated by the hypervisor'],
        ['Rapid elasticity', 'Capacity grows and shrinks quickly, often automatically', 'EC2 Auto Scaling adding instances at peak'],
        ['Measured service', 'Usage is metered and billed', 'Per-second EC2 billing, per-GB S3 billing']
      ])}
      ${K.hook('<b>“SBR-EM”</b> — <b>S</b>elf-service, <b>B</b>road access, <b>R</b>esource pooling, <b>E</b>lasticity, <b>M</b>easured. Say it as “Sober ‘em”.')}` },
    { id: 'onprem-vs-cloud', title: 'On-premises vs cloud computing', level: 'b', tags: 'on-premises capex opex capital variable expense',
      html: `${K.story('The bakery website', '<p>Maria runs an online bakery. On-premises, she must buy servers big enough for Valentine\'s Day — the busiest day of the year. For the other 364 days, most of that hardware sits idle, still costing power, cooling, space and staff time. Ordering more takes weeks.</p><p>In the cloud, she runs two small servers normally and lets AWS add twenty more on February 14th, paying for them for one day.</p>')}
      ${K.table(['', 'On-premises', 'Cloud (AWS)'], [
        ['Spending model', 'Capital expenditure (CapEx) — buy hardware up front', 'Operational / variable expenditure (OpEx) — pay as you go'],
        ['Capacity', 'Guess and over-provision for peak', 'Scale to actual demand'],
        ['Time to get a server', 'Weeks to months (procure, rack, cable)', 'Minutes'],
        ['Maintenance', 'You patch hardware, replace disks, run the facility', 'AWS runs the data centers'],
        ['Global reach', 'Build or rent new data centers', 'Deploy to another Region in minutes'],
        ['Failure handling', 'Your problem, often a single site', 'Design across multiple Availability Zones']
      ])}
      ${K.recall('Why does on-premises infrastructure usually waste money for a business with spiky traffic?', 'Because capacity must be bought for the peak in advance (CapEx). Most of the time that capacity is idle but still paid for; in the cloud you pay only for what you use and scale with demand.')}` },
    { id: 'six-advantages', title: 'The six advantages of cloud computing', level: 'i', tags: 'six advantages benefits economies of scale stop guessing capacity agility global trade capital expense data centers',
      html: `<p>AWS lists six advantages. Exam questions describe one in plain language and ask you to name it — learn the exact phrasing.</p>
      ${K.table(['Advantage', 'What it means', 'Scenario keyword'], [
        ['1. Trade fixed (capital) expense for variable expense', 'Pay only when you consume, instead of investing in data centers before you know how you will use them', '“avoid large upfront hardware purchases”'],
        ['2. Benefit from massive economies of scale', 'AWS aggregates usage from hundreds of thousands of customers, so its per-unit costs — and your prices — are lower', '“lower pay-as-you-go prices because of AWS\'s size”'],
        ['3. Stop guessing capacity', 'Scale up or down as needed instead of over- or under-provisioning', '“no longer need to predict traffic”'],
        ['4. Increase speed and agility', 'New resources are a click away, so experiments take minutes, not weeks', '“developers can experiment quickly”, “reduce time to market”'],
        ['5. Stop spending money running and maintaining data centers', 'Focus on customers and products instead of racking, stacking and powering servers', '“focus on the business, not infrastructure”'],
        ['6. Go global in minutes', 'Deploy in multiple Regions for low latency to users worldwide', '“serve customers on another continent with low latency”']
      ])}
      ${K.hook('<b>“Very Easy Guessing Speeds Data Globally”</b> → <b>V</b>ariable expense · <b>E</b>conomies of scale · stop <b>G</b>uessing capacity · <b>S</b>peed & agility · stop running <b>D</b>ata centers · go <b>G</b>lobal.')}
      ${K.trap('<b>Economies of scale</b> is about AWS\'s <i>size lowering prices</i>. <b>Trade CapEx for variable expense</b> is about <i>when and how you pay</i>. A question that says “pay only for what you use with no upfront investment” is the variable-expense advantage, not economies of scale.')}
      ${K.recall('A startup can launch a test environment in minutes and delete it after an hour of experimenting. Which advantage is this?', 'Increase speed and agility.')}` },
    { id: 'elasticity-terms', title: 'Elasticity, scalability, agility — precise vocabulary', level: 'i', tags: 'elasticity scalability agility high availability fault tolerance',
      html: `${K.table(['Term', 'Definition', 'Example'], [
        ['Scalability', 'Ability to handle growth by adding resources (scale up = bigger; scale out = more)', 'Adding a larger database instance as data grows'],
        ['Elasticity', 'Automatically adding <i>and removing</i> resources to match demand in near real time', 'Auto Scaling grows from 2 to 10 instances at lunch and back to 2 at night'],
        ['Agility', 'Speed at which you can experiment, build and deliver', 'Launching a new environment in minutes'],
        ['High availability', 'System stays accessible with minimal downtime', 'Running in two Availability Zones'],
        ['Fault tolerance', 'System keeps working <i>correctly</i> even when components fail', 'Aurora keeps six copies of data across three AZs']
      ])}
      ${K.tip('If the scenario says <b>“automatically matches demand, up and down”</b>, the answer is <b>elasticity</b>. If it only says <b>“handle growth”</b>, it is <b>scalability</b>. (Module 2 goes deeper.)')}` },
    { id: 'service-models', title: 'Service models: IaaS, PaaS, SaaS', level: 'i', tags: 'iaas paas saas service models infrastructure platform software',
      html: `${K.eli5('<p>Think of pizza. <b>On-premises</b> is making pizza at home from scratch. <b>IaaS</b> is renting a fully equipped kitchen — you still cook. <b>PaaS</b> is a pizza place where you just choose toppings and they bake it. <b>SaaS</b> is having the finished pizza delivered — you just eat.</p>')}
      ${K.spectrum([
        ['On-premises', 'You manage everything: facility, hardware, network, OS, runtime, app, data.'],
        ['IaaS', 'Provider: facility, hardware, virtualization. You: OS, patches, runtime, app, data. <br><b>AWS: Amazon EC2, Amazon VPC, Amazon EBS</b>'],
        ['PaaS', 'Provider also manages OS and runtime. You: code and data. <br><b>AWS: Elastic Beanstalk, Amazon RDS, AWS Lambda*</b>'],
        ['SaaS', 'Provider manages the whole application. You: use it, manage your users/data. <br><b>Examples: Amazon WorkMail, Amazon Chime, Gmail</b>']
      ], ['More control · more responsibility', 'Less control · less responsibility'], '*Lambda is often called FaaS / serverless, a form of PaaS.')}
      <p>Your CSIT341 notes summarise it: IaaS gives the <b>highest flexibility and control</b> over networking, servers and operating systems; PaaS <b>removes the need to manage the underlying infrastructure</b> (hardware and OS); SaaS is the <b>end-user application</b>.</p>
      ${K.recall('Which service model gives the customer the most control over servers and operating systems, and which AWS service is the classic example?', 'IaaS — for example Amazon EC2, where you manage the guest operating system, patches, and everything above it.')}` },
    { id: 'deployment-models', title: 'Deployment models: cloud, hybrid, on-premises', level: 'i', tags: 'deployment models cloud hybrid on-premises private cloud outposts',
      html: `${K.table(['Model', 'Description', 'Typical reason'], [
        ['Cloud (cloud-native / all-in)', 'All parts of the application run in the cloud', 'New applications; migrating everything to reduce data-center costs'],
        ['Hybrid', 'Connects existing on-premises infrastructure and applications to cloud resources', 'Legacy systems that must stay on-premises, regulations, gradual migration'],
        ['On-premises (private cloud)', 'Resources deployed in your own data center using virtualization and resource-management tools', 'Dedicated resources, strict control; AWS Outposts brings AWS hardware on-site']
      ])}
      ${K.story('A hospital network', '<p>A hospital keeps patient-record systems in its own data center for regulatory reasons, but runs its new appointment-booking app on AWS and connects the two with AWS Direct Connect. That is a <b>hybrid</b> deployment.</p>')}
      ${K.trap('“Hybrid” does <i>not</i> mean “using two AWS Regions” or “using two cloud providers”. It specifically means <b>on-premises + cloud connected together</b>.')}` },
    { id: 'global-intro', title: 'First look: Regions, Availability Zones, edge locations', level: 'b', tags: 'regions availability zones edge locations global infrastructure',
      html: `${K.diagram(K.nest('region', 'AWS Region (e.g. Asia Pacific — Singapore)', K.row(K.nest('az', 'Availability Zone A', K.box('Data center') + '<div style="height:6px"></div>' + K.box('Data center')), K.nest('az', 'Availability Zone B', K.box('Data center')), K.nest('az', 'Availability Zone C', K.box('Data center') + '<div style="height:6px"></div>' + K.box('Data center')))) + '<div style="height:12px"></div>' + K.row(K.box('Edge location (CloudFront / Route 53)', true), K.box('Edge location', true), K.box('Regional edge cache', true)), 'A Region contains multiple isolated AZs; each AZ is one or more data centers. Edge locations sit outside Regions, close to users.')}
      <ul><li><b>Region</b> — a physical geographic area containing multiple Availability Zones. You choose where your data lives.</li><li><b>Availability Zone (AZ)</b> — one or more discrete data centers with redundant power, networking and connectivity, isolated from other AZs.</li><li><b>Edge location</b> — a site that caches content (Amazon CloudFront) and answers DNS (Amazon Route 53) close to users.</li></ul>
      <p>Module 2 covers these in depth, including how to choose a Region.</p>` },
    { id: 'shared-intro', title: 'First look: the shared responsibility model', level: 'b', tags: 'shared responsibility model security of in the cloud',
      html: `${K.analogy('<p>Renting an apartment: the landlord secures the building — main door, structure, fire systems. <b>You lock your own door</b> and decide who gets a key.</p>')}
      ${K.stack([['Customer data · IAM · encryption choices', 'you'], ['Operating system, network & firewall configuration (security groups)', 'you'], ['Patch management, configuration, awareness & training', 'shared'], ['Compute, storage, database, networking software', 'aws'], ['Regions · Availability Zones · edge locations · physical data centers', 'aws']], 'AWS: security OF the cloud. Customer: security IN the cloud.')}
      <p><b>AWS = security <i>of</i> the cloud</b> (physical facilities, hardware, global network, virtualization). <b>Customer = security <i>in</i> the cloud</b> (data, identities, OS patching on EC2, security groups, encryption choices). Module 7 goes deep.</p>` },
    { id: 'access-methods', title: 'How you interact with AWS', level: 'i', tags: 'management console cli sdk api infrastructure as code access methods',
      html: `${K.table(['Method', 'Best for', 'Notes'], [
        ['AWS Management Console', 'Visual, one-off tasks, learning, exploring', 'Web UI; console mobile app for monitoring'],
        ['AWS CLI', 'Scripting and automating repeatable tasks from a terminal', 'Uses access keys (programmatic access)'],
        ['AWS SDKs', 'Calling AWS from application code (Python, Java, JavaScript…)', 'Wrap the AWS APIs'],
        ['Infrastructure as code (AWS CloudFormation, AWS CDK)', 'Repeatable, version-controlled environments', 'Same template → identical stacks in any Region']
      ])}
      ${K.tip('Exam skill 3.1: “one-time operation” → console is fine. “Repeatable, consistent, automated across environments” → <b>infrastructure as code</b> (CloudFormation) or CLI/SDK scripts.')}` },
    { id: 'caf-migration', title: 'Migration: AWS CAF and the 7 Rs', level: 'a', tags: 'cloud adoption framework caf perspectives migration 7 rs rehost replatform refactor snow family dms',
      html: `<p>The <b>AWS Cloud Adoption Framework (AWS CAF)</b> organises migration guidance into <b>six perspectives</b> (your CSIT341 notes list them):</p>
      ${K.table(['Perspective', 'Capability group', 'Typical stakeholders / focus'], [
        ['Business', 'Business', 'CEO, CFO — cloud investments drive business outcomes'],
        ['People', 'Business', 'HR, leaders — culture, skills, training, organisational change'],
        ['Governance', 'Business', 'CFO, risk — orchestrate initiatives, manage risk, maximise benefits'],
        ['Platform', 'Technical', 'CTO, architects — build an enterprise-grade, scalable hybrid cloud platform'],
        ['Security', 'Technical', 'CISO — confidentiality, integrity, availability of data and workloads'],
        ['Operations', 'Technical', 'IT ops — deliver cloud services at agreed service levels']
      ])}
      ${K.hook('<b>“BPG + PSO”</b> — business side: <b>B</b>usiness, <b>P</b>eople, <b>G</b>overnance; technical side: <b>P</b>latform, <b>S</b>ecurity, <b>O</b>perations.')}
      <h3>The 7 Rs of migration</h3>
      ${K.table(['Strategy', 'Meaning'], [
        ['Retire', 'Turn off applications nobody needs'], ['Retain', 'Keep on-premises for now'], ['Rehost (“lift and shift”)', 'Move as-is to EC2, e.g. with AWS Application Migration Service'],
        ['Relocate', 'Move a virtualised environment (e.g. VMware Cloud on AWS) without changes'], ['Repurchase (“drop and shop”)', 'Switch to a SaaS product'], ['Replatform (“lift, tinker and shift”)', 'Small optimisations, e.g. move the database to Amazon RDS'],
        ['Refactor / re-architect', 'Redesign for cloud-native features (serverless, microservices)']
      ])}
      <p>Migration tools you may see on the exam: <b>AWS Database Migration Service (DMS)</b> and <b>AWS Schema Conversion Tool (SCT)</b> for databases, <b>AWS Application Migration Service</b> for servers, and the <b>AWS Snow Family</b> (Snowball Edge devices) for moving huge data sets offline when the network is too slow.</p>
      ${K.recall('A company moves its on-premises VMs to EC2 without changing the application. Which migration strategy is this?', 'Rehost (“lift and shift”).')}` }
  ],
  terms: [
    ['Cloud computing', 'On-demand delivery of IT resources over the internet with pay-as-you-go pricing', 'Plugging into the IT power grid'],
    ['CapEx / OpEx', 'Capital (upfront) vs operational (ongoing, variable) expense', 'Buy the car vs ride a taxi'],
    ['IaaS', 'Virtual servers, storage, networking — you manage the OS up (EC2)', 'Rented kitchen'],
    ['PaaS', 'Managed platform — you bring code and data (Elastic Beanstalk, RDS)', 'Pizza place'],
    ['SaaS', 'Complete application delivered over the internet', 'Pizza delivered'],
    ['Hybrid deployment', 'On-premises connected to cloud resources', 'Two houses joined by a hallway'],
    ['Region / AZ / edge location', 'Geographic area / isolated data center group / content cache near users', 'Country / city district / corner shop'],
    ['AWS CAF', 'Framework of six perspectives for planning cloud adoption', 'Moving-house checklist'],
    ['AWS Snow Family', 'Physical devices to move large data sets offline into AWS', 'Shipping hard drives by courier'],
    ['AWS DMS', 'Migrates databases to AWS with minimal downtime', 'Moving van for databases']
  ],
  hooks: [
    '<b>Six advantages = “Very Easy Guessing Speeds Data Globally”.</b>',
    '<b>Pizza-as-a-Service:</b> homemade → rented kitchen (IaaS) → pizza place (PaaS) → delivery (SaaS).',
    '<b>Hybrid = “half at home, half in the cloud”.</b>',
    '<b>OF vs IN:</b> AWS secures the hotel; you lock your room.'
  ],
  tips: [
    'Keywords → advantage: “no upfront investment” = <b>variable expense</b>; “lower prices due to AWS\'s scale” = <b>economies of scale</b>; “no need to predict demand” = <b>stop guessing capacity</b>; “experiment fast” = <b>speed and agility</b>; “focus on customers” = <b>stop running data centers</b>; “low latency worldwide” = <b>go global in minutes</b>.',
    'If a question asks which model gives the <b>most control</b>, answer IaaS. If it asks which requires the <b>least management</b>, answer SaaS.',
    'CAF question about “training and organisational change” → <b>People</b>. About “risk and portfolio management” → <b>Governance</b>. About “architecture and engineering of the cloud platform” → <b>Platform</b>.',
    'Moving petabytes with limited bandwidth → <b>AWS Snowball Edge</b> (Snow Family), not Direct Connect.'
  ],
  traps: [
    '“The cloud is always cheaper.” Not automatically — savings come from paying for what you use, right-sizing and using the right pricing model.',
    'Elasticity ≠ scalability: elasticity includes <i>shrinking</i> automatically.',
    'Lambda and RDS are not IaaS — you do not manage an operating system.',
    'A private cloud is an <b>on-premises</b> deployment model, not an AWS Region.',
    'Inbound data transfer is generally free; outbound is charged — do not assume “everything costs money”.'
  ],
  checks: [
    ['A company no longer needs to buy servers for peak demand months in advance. Which advantage is this?', 'Stop guessing capacity', 'Benefit from massive economies of scale', 'Go global in minutes', 'Increase security', 'Scaling to real demand instead of predicting it is “stop guessing capacity”.'],
    ['Which deployment model connects existing on-premises systems to AWS resources?', 'Hybrid', 'Cloud-native', 'Multi-Region', 'Private cloud only', 'Hybrid = on-premises infrastructure connected to cloud resources.'],
    ['Which is an example of PaaS on AWS?', 'AWS Elastic Beanstalk', 'Amazon EC2', 'An on-premises VMware cluster', 'Amazon VPC', 'Elastic Beanstalk manages the platform (provisioning, OS, runtime); you upload code.'],
    ['Which AWS CAF perspective focuses on skills, training and organisational change?', 'People', 'Platform', 'Operations', 'Governance', 'The People perspective covers culture, skills and change management.']
  ],
  summary: '<p>Cloud computing replaces owning IT with renting it on demand. AWS frames its value as six advantages, offers services across the IaaS → PaaS → SaaS spectrum (more managed = less control and less responsibility), and supports cloud, hybrid and on-premises deployment models. Resources live in Regions made of isolated Availability Zones, with edge locations close to users, and security is shared: AWS secures the cloud, you secure what you put in it. Migrations are planned with the six AWS CAF perspectives and executed with strategies such as rehost, replatform and refactor.</p>',
  takeaways: [
    'Definition: on-demand IT resources over the internet with pay-as-you-go pricing.',
    'Six advantages: variable expense, economies of scale, stop guessing capacity, speed & agility, stop running data centers, go global in minutes.',
    'IaaS = most control (EC2); PaaS = manage code and data (Beanstalk, RDS); SaaS = use the app.',
    'Hybrid = on-premises + cloud connected.',
    'AWS secures OF the cloud; customers secure IN the cloud.',
    'AWS CAF perspectives: Business, People, Governance, Platform, Security, Operations.'
  ],
  sources: [
    ['Overview of Amazon Web Services — Six advantages of cloud computing (AWS whitepaper)', 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html'],
    ['Types of cloud computing (AWS)', 'https://aws.amazon.com/types-of-cloud-computing/'],
    ['AWS Cloud Adoption Framework', 'https://aws.amazon.com/cloud-adoption-framework/'],
    ['NIST SP 800-145 — The NIST Definition of Cloud Computing', 'https://csrc.nist.gov/publications/detail/sp/800-145/final'],
    ['CLF-C02 Exam Guide — Domain 1', 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02-domain1.html']
  ]
});
