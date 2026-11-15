STRATUS.lecture({
  id: 'm2', num: 2, minutes: 35,
  tagline: 'Where AWS physically lives, how to pick a location, and the six pillars that define a well-built workload.',
  subtitle: 'AWS runs on a worldwide footprint of <b>Regions</b>, <b>Availability Zones</b> and <b>edge locations</b>. This module explains each layer, how to choose a Region, how to design for high availability and disaster recovery, and the <b>AWS Well-Architected Framework</b> that AWS uses to judge whether an architecture is good.',
  objectives: [
    'Describe Regions, Availability Zones, edge locations, Local Zones, Wavelength Zones and Outposts.',
    'Choose a Region using compliance, latency, service availability and pricing.',
    'Explain how multiple AZs and multiple Regions deliver high availability and disaster recovery.',
    'Compare the four disaster recovery strategies by cost and recovery time.',
    'Name the six pillars of the AWS Well-Architected Framework and match scenarios to them.',
    'Apply cloud architecture design principles: design for failure, decouple, automate, scale horizontally.'
  ],
  why: '<p>Global infrastructure is task statement 3.2 and the Well-Architected Framework is task statement 1.2. Expect several questions that describe a goal (“survive a data-center outage”, “keep data in Germany”, “reduce latency for users in Brazil”) and ask which layer or pillar solves it.</p>',
  sections: [
    { id: 'eli5', title: 'Global infrastructure, explained simply', level: 'b', tags: 'region availability zone edge location explained',
      html: `${K.eli5('<p>Think of a pizza chain. Each <b>country</b> it operates in is a Region. In every country it runs <b>several kitchens</b> in different neighbourhoods, each with its own power and staff, so if one kitchen floods the others keep cooking: those are Availability Zones. And on busy street corners it parks <b>small pickup counters</b> with ready-made slices, so customers do not wait for the main kitchen: those are edge locations.</p>')}
      <p>Every AWS resource you create lives somewhere specific. Choosing <i>where</i> affects speed for your users, which laws apply to your data, which services you can use, and how much you pay.</p>
      ${K.recall('In the pizza-chain analogy, what do the separate neighbourhood kitchens represent, and why are there several?', 'Availability Zones. There are several so that a failure in one (power, flood, network) does not take down the whole Region.')}` },
    { id: 'regions', title: 'Regions and how to choose one', level: 'b', tags: 'region choose compliance latency pricing service availability data residency',
      html: `<p>An <b>AWS Region</b> is a physical geographic area that contains multiple, isolated Availability Zones. Regions are independent of each other: <b>data does not leave a Region unless you move or replicate it</b>. This is what makes data-residency rules possible.</p>
      ${K.table(['Factor', 'Question to ask', 'Example'], [
        ['Compliance / data governance', 'Does a law or contract require data to stay in a country?', 'EU patient data must stay in the EU → eu-central-1 (Frankfurt)'],
        ['Proximity / latency', 'Where are most of my users?', 'Users in Manila → ap-southeast-1 (Singapore) is closer than us-east-1'],
        ['Service availability', 'Is the service I need offered there?', 'New services usually launch in a few Regions first'],
        ['Pricing', 'Is the same workload cheaper in another Region?', 'Prices differ by Region because of local costs and taxes']
      ])}
      ${K.hook('<b>“Can Lucy Select Prices?”</b> → <b>C</b>ompliance, <b>L</b>atency, <b>S</b>ervice availability, <b>P</b>ricing. Compliance comes first: if the law says the data stays in a country, the other three do not matter.')}
      ${K.trap('Regions are <b>not</b> automatically replicated to each other. If a question asks how to protect against a whole-Region outage, the answer involves <i>you</i> deploying or replicating to a second Region (for example S3 Cross-Region Replication).')}` },
    { id: 'azs', title: 'Availability Zones', level: 'b', tags: 'availability zone data center redundant power isolation multi-az',
      html: `<p>An <b>Availability Zone (AZ)</b> is one or more discrete data centers with redundant power, networking and connectivity. Each Region has <b>at least three</b> AZs. AZs in a Region are connected with high-bandwidth, low-latency private fiber, so you can replicate data between them synchronously.</p>
      ${K.fix('<p>Older course notes say AZs are “at least 100 km apart”. AWS actually states that AZs are separated by a meaningful distance from each other but are all <b>within 100 km (60 miles)</b> of each other, close enough for synchronous replication and far enough that a flood or fire is unlikely to hit two.</p>')}
      ${K.diagram(K.nest('region', 'Region', K.row(K.nest('az', 'AZ a', K.box('Web server', true) + '<div style="height:6px"></div>' + K.box('DB primary')), K.nest('az', 'AZ b', K.box('Web server', true) + '<div style="height:6px"></div>' + K.box('DB standby')), K.nest('az', 'AZ c', K.box('Web server', true)))), 'Spreading copies of each tier across AZs means losing one data center does not take the application down.')}
      ${K.tip('“Highly available” on the exam almost always means <b>deploy across multiple Availability Zones</b>. “Survive a Regional disaster” means <b>multiple Regions</b>.')}
      ${K.recall('What is the minimum number of AZs in an AWS Region, and how far apart are they?', 'At least three AZs, physically separated by a meaningful distance but all within 100 km (60 miles) of each other.')}` },
    { id: 'edge', title: 'Edge locations, Local Zones, Wavelength and Outposts', level: 'i', tags: 'edge location cloudfront route 53 local zones wavelength outposts regional edge cache',
      html: `${K.table(['Infrastructure', 'What it is', 'Use when'], [
        ['Edge location (Point of Presence)', 'Site in a major city that caches content and answers DNS', 'Amazon CloudFront, Route 53, AWS Global Accelerator, AWS WAF / Shield at the edge'],
        ['Regional edge cache', 'Bigger cache between edge locations and the origin', 'Content not popular enough to stay at every edge'],
        ['Local Zone', 'Extension of a Region placed in a large metro area', 'Single-digit-millisecond latency for users in that city (gaming, media rendering)'],
        ['Wavelength Zone', 'AWS compute embedded in a telecom 5G network', 'Ultra-low latency for mobile devices on 5G'],
        ['AWS Outposts', 'AWS-managed racks installed in your own data center', 'Run AWS services on-premises for latency or data-residency needs (hybrid)']
      ])}
      ${K.story('A game launch', '<p>A studio in Seoul launches a multiplayer game. Its servers run in ap-northeast-2 across three AZs. Game downloads and images are cached by <b>CloudFront edge locations</b> worldwide. Players in Los Angeles, far from Seoul, get a dedicated game server in the <b>Los Angeles Local Zone</b>. A telecom partner hosts a 5G mobile version in a <b>Wavelength Zone</b>.</p>')}
      ${K.trap('Edge locations are <b>not</b> where you launch EC2 instances or databases. They cache and route. Many more edge locations exist than Regions.')}` },
    { id: 'ha-dr', title: 'High availability and disaster recovery', level: 'i', tags: 'high availability fault tolerance disaster recovery rto rpo backup restore pilot light warm standby multi-site',
      html: `<p>Two numbers drive every disaster recovery (DR) decision:</p>
      <ul><li><b>RTO (Recovery Time Objective)</b>: how long you can be down.</li><li><b>RPO (Recovery Point Objective)</b>: how much data (measured in time) you can afford to lose.</li></ul>
      ${K.spectrum([
        ['Backup & restore', 'Back up data to S3 / AWS Backup; rebuild everything after a disaster. Hours of RTO. Cheapest.'],
        ['Pilot light', 'Core pieces (database replica) always running in the DR Region; servers off until needed. Tens of minutes.'],
        ['Warm standby', 'A scaled-down but fully working copy always running; scale it up in a disaster. Minutes.'],
        ['Multi-site active/active', 'Full production in two or more Regions serving traffic. Near-zero RTO. Most expensive.']
      ], ['Lower cost · longer recovery', 'Higher cost · faster recovery'], 'The four DR strategies from the AWS disaster-recovery whitepaper.')}
      ${K.hook('<b>“Back up the Pilot, Warm the Multi-site”</b>: Backup & restore → Pilot light → Warm standby → Multi-site, each step costs more and recovers faster.')}
      ${K.recall('A company can tolerate several hours of downtime and wants the lowest-cost DR plan. Which strategy fits?', 'Backup and restore.')}` },
    { id: 'well-architected', title: 'The AWS Well-Architected Framework: six pillars', level: 'i', tags: 'well-architected framework pillars operational excellence security reliability performance efficiency cost optimization sustainability',
      html: `${K.fix('<p>Some CSIT341 slides list <b>five</b> pillars. AWS added the <b>Sustainability</b> pillar in December 2021, so there are now <b>six</b>.</p>')}
      ${K.table(['Pillar', 'Focus', 'Scenario keywords'], [
        ['Operational excellence', 'Run and monitor systems; improve processes; operations as code', '“automate deployments”, “runbooks”, “small reversible changes”, “learn from failures”'],
        ['Security', 'Protect data, systems and assets', '“least privilege”, “traceability”, “encrypt at rest and in transit”'],
        ['Reliability', 'Recover from failures and meet demand', '“automatically recover”, “multi-AZ”, “test recovery procedures”'],
        ['Performance efficiency', 'Use resources efficiently as demand and technology change', '“right instance type”, “serverless”, “go global in minutes”, “experiment more often”'],
        ['Cost optimization', 'Avoid unnecessary cost', '“pay only for what you use”, “right-size”, “measure efficiency”'],
        ['Sustainability', 'Minimise environmental impact', '“maximise utilisation”, “reduce energy”, “managed services”, “shared responsibility for sustainability”']
      ])}
      ${K.hook('<b>“CRISP-S”</b> → <b>C</b>ost optimization, <b>R</b>eliability, operational excellence (<b>I</b>mprovement), <b>S</b>ecurity, <b>P</b>erformance efficiency, <b>S</b>ustainability. Or: <b>“Only Smart Robots Prefer Cheap Sunshine.”</b>')}
      <p>The free <b>AWS Well-Architected Tool</b> in the console lets you answer questions about a workload and returns a list of high- and medium-risk issues with improvement plans.</p>
      ${K.trap('Reliability vs performance efficiency: “recover from failure” is <b>reliability</b>; “choose the right resource type and size for the load” is <b>performance efficiency</b>.')}` },
    { id: 'design-principles', title: 'Cloud architecture design principles', level: 'a', tags: 'design principles design for failure decouple loose coupling horizontal scaling automation disposable resources',
      html: `${K.table(['Principle', 'Meaning', 'AWS building block'], [
        ['Design for failure', 'Assume everything fails; remove single points of failure', 'Multi-AZ, Elastic Load Balancing, Auto Scaling'],
        ['Decouple components', 'Components talk through queues or events so one failure or slowdown does not cascade', 'Amazon SQS, Amazon SNS, Amazon EventBridge'],
        ['Scale horizontally', 'Add more small resources instead of one bigger one', 'EC2 Auto Scaling groups'],
        ['Treat servers as disposable', 'Replace, do not repair; build from templates and images', 'AMIs, CloudFormation'],
        ['Automate', 'Respond to events and deploy with code, not manual steps', 'CloudWatch alarms, Systems Manager, CodePipeline'],
        ['Use managed services', 'Let AWS run undifferentiated work', 'Amazon RDS, Lambda, DynamoDB'],
        ['Think parallel and use caching', 'Spread work; keep hot data close', 'CloudFront, ElastiCache']
      ])}
      ${K.diagram(K.flow(['Users', '*Load balancer|spans AZs', 'Web tier|Auto Scaling', '*SQS queue|decouples', 'Worker tier', 'Database|Multi-AZ']), 'A loosely coupled, multi-AZ design: every layer can fail or scale without breaking the others.')}
      ${K.recall('An order system loses orders whenever the payment service is slow. Which design principle and AWS service fix this?', 'Decouple the components with a queue: Amazon SQS holds orders until the payment service can process them.')}` }
  ],
  terms: [
    ['Region', 'Geographic area with multiple isolated AZs; data stays unless you move it', 'A country'],
    ['Availability Zone', 'One or more data centers with independent power and networking', 'A kitchen in a separate neighbourhood'],
    ['Edge location', 'Cache and DNS site close to users (CloudFront, Route 53)', 'Street-corner pickup counter'],
    ['Local Zone', 'Region extension in a metro area for single-digit ms latency', 'A branch kitchen in a big city'],
    ['AWS Outposts', 'AWS racks in your own data center', 'A franchise kitchen inside your building'],
    ['RTO / RPO', 'Maximum downtime / maximum data loss you accept', 'How long closed / how many orders lost'],
    ['Well-Architected Framework', 'Six-pillar best-practice framework for workloads', 'Building inspection checklist'],
    ['Well-Architected Tool', 'Console tool that reviews a workload against the pillars', 'The inspector\'s clipboard']
  ],
  hooks: [
    '<b>Choosing a Region: “Can Lucy Select Prices?”</b> Compliance, Latency, Service availability, Pricing.',
    '<b>Six pillars: “Only Smart Robots Prefer Cheap Sunshine.”</b> Operational excellence, Security, Reliability, Performance efficiency, Cost optimization, Sustainability.',
    '<b>DR ladder:</b> Backup → Pilot light → Warm standby → Multi-site.',
    '<b>Multi-AZ = high availability; multi-Region = disaster recovery.</b>'
  ],
  tips: [
    '“Data must remain in country X” → choose the Region in that country. Data never leaves a Region on its own.',
    '“Lowest latency for global users of static content” → Amazon CloudFront (edge locations).',
    '“AWS services in our own data center” → AWS Outposts. “Ultra-low latency on 5G” → Wavelength.',
    'If an option says “deploy in a single AZ” for a high-availability requirement, eliminate it.',
    'A question naming “reviewing a workload against best practices” is the AWS Well-Architected Tool.'
  ],
  traps: [
    'There are <b>six</b> Well-Architected pillars, not five. Sustainability is the sixth.',
    'AZs are within 100 km of each other, not “at least 100 km apart”.',
    'Edge locations do not run EC2 instances; Local Zones and Outposts do.',
    'Multiple AZs do not protect against the loss of a whole Region.',
    '“Pilot light” keeps only the core (usually data) running; “warm standby” keeps a small full copy running.'
  ],
  checks: [
    ['A company must keep customer data inside Germany. What is the most important factor when choosing its Region?', 'Compliance and data residency requirements', 'Lowest price per instance-hour', 'Number of edge locations nearby', 'The newest services available', 'Legal and compliance requirements come first; data stays in the Region you choose.'],
    ['What is an Availability Zone?', 'One or more discrete data centers with redundant power, networking and connectivity within a Region', 'A content cache close to end users', 'A group of Regions on one continent', 'An AWS rack installed in a customer data center', 'An AZ is one or more isolated data centers inside a Region.'],
    ['Which Well-Architected pillar focuses on recovering from failures and meeting demand?', 'Reliability', 'Performance efficiency', 'Operational excellence', 'Sustainability', 'Reliability covers recovery from disruption and dynamically acquiring resources to meet demand.'],
    ['Which disaster recovery strategy runs a full production copy in two Regions at the same time?', 'Multi-site active/active', 'Pilot light', 'Backup and restore', 'Warm standby', 'Multi-site runs full capacity in multiple Regions for near-zero recovery time.']
  ],
  summary: '<p>AWS infrastructure is layered: <b>Regions</b> (isolated geographic areas you choose by compliance, latency, service availability and price) contain at least three <b>Availability Zones</b> (separate data centers within 100 km of each other), while <b>edge locations</b> cache content and answer DNS near users. Local Zones, Wavelength Zones and Outposts push AWS closer to users or into your own building. High availability comes from spreading across AZs; disaster recovery across Regions uses one of four strategies trading cost for recovery speed. The <b>Well-Architected Framework</b> judges designs by six pillars, supported by principles such as design for failure, decoupling and automation.</p>',
  takeaways: [
    'Region = geography; AZ = isolated data center group; edge location = cache/DNS near users.',
    'Choose a Region by compliance, latency, service availability and pricing.',
    'Multi-AZ for high availability; multi-Region for disaster recovery.',
    'DR strategies: backup & restore, pilot light, warm standby, multi-site.',
    'Six pillars: operational excellence, security, reliability, performance efficiency, cost optimization, sustainability.',
    'Design for failure, decouple with queues, scale horizontally, automate.'
  ],
  sources: [
    ['AWS Global Infrastructure', 'https://aws.amazon.com/about-aws/global-infrastructure/'],
    ['Regions and Availability Zones', 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/'],
    ['AWS Well-Architected Framework', 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html'],
    ['Disaster Recovery of Workloads on AWS (whitepaper)', 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html'],
    ['CLF-C02 Exam Guide — Task statements 1.2 and 3.2', 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html']
  ]
});
