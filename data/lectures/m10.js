STRATUS.lecture({
  id: 'm10', num: 10, minutes: 35,
  tagline: 'How the CLF-C02 exam works, how to read a question, the remaining service categories, and end-to-end scenarios that tie every module together.',
  subtitle: 'This final module prepares you for exam day. It explains the <b>exam format and scoring</b>, a repeatable <b>question-solving method</b>, the <b>other service categories</b> in the exam guide (end-user computing, front-end and mobile, IoT, business applications, customer engagement), a <b>keyword → service</b> cheat sheet, and three <b>real-world scenarios</b> that combine services from every domain.',
  objectives: [
    'Describe the CLF-C02 exam format, domain weightings and scoring.',
    'Apply an elimination strategy to multiple-choice and multiple-response questions.',
    'Identify end-user computing, front-end/mobile, IoT, business application and customer engagement services.',
    'Map common scenario keywords to the correct AWS service.',
    'Design simple end-to-end solutions that combine compute, storage, networking, security and cost choices.'
  ],
  why: '<p>Most failed attempts come from misreading questions, not from missing knowledge. A disciplined method plus a keyword map turns the content of Modules 1–9 into points.</p>',
  sections: [
    { id: 'eli5', title: 'The exam, explained simply', level: 'b', tags: 'exam format explained',
      html: `${K.eli5('<p>The exam is like a driving theory test for the cloud. It does not ask you to build anything. It describes a situation (“a company wants…”) and asks which tool, rule or benefit fits best. If you know what each tool is <i>for</i>, you can pass.</p>')}
      ${K.table(['Item', 'CLF-C02 detail'], [
        ['Questions', '65 total: <b>50 scored + 15 unscored</b> (unscored ones are not identified)'],
        ['Types', 'Multiple choice (1 correct of 4) and multiple response (2 or more correct of 5+)'],
        ['Time', '90 minutes'],
        ['Score', 'Scaled 100–1,000; <b>passing score 700</b>; compensatory scoring (no per-domain pass needed)'],
        ['Guessing', 'No penalty for wrong answers, so never leave a question blank'],
        ['Domains', 'Cloud Concepts 24 % · Security and Compliance 30 % · Cloud Technology and Services 34 % · Billing, Pricing and Support 12 %']
      ])}
      ${K.note('<p>Stratus\'s Exam Simulation reports a <b>simulated</b> scaled score (100 + 900 × percent correct). Real AWS scaling uses statistical equating across exam forms, so treat the simulated number as a guide, not a prediction.</p>')}
      ${K.recall('How many questions on the CLF-C02 exam are scored, and what is the passing score?', '50 scored questions (plus 15 unscored); the passing scaled score is 700 out of 1,000.')}` },
    { id: 'method', title: 'A method for every question', level: 'b', tags: 'strategy elimination keywords read the question',
      html: `${K.diagram(K.flow(['1. Read the last line|what is asked?', '2. Underline keywords|cheapest, most secure, least effort', '*3. Eliminate|wrong category, wrong scope', '4. Choose the best fit|not just a possible fit', '5. Flag and move on|if unsure']), 'Five steps, about 80 seconds per question.')}
      ${K.table(['Qualifier in the question', 'What it usually rewards'], [
        ['“Most cost-effective”', 'Managed/serverless, right pricing model (Spot for interruptible, Savings Plans for steady)'],
        ['“Least operational overhead”', 'Fully managed or serverless services (Lambda, DynamoDB, RDS, Fargate)'],
        ['“Highly available”', 'Multiple Availability Zones'],
        ['“Disaster recovery”', 'Multiple Regions, backups, DR strategy'],
        ['“Most secure”', 'Least privilege, IAM roles, MFA, encryption, private subnets'],
        ['“Global users, low latency”', 'CloudFront, Route 53 latency routing, Global Accelerator']
      ])}
      ${K.tip('For multiple-response questions, the question tells you how many to choose (“Choose TWO”). Evaluate every option independently as true or false.')}` },
    { id: 'other-services', title: 'Other service categories in the exam guide', level: 'i', tags: 'workspaces appstream amplify appsync api gateway device farm iot core connect ses simple email service end user computing',
      html: `${K.table(['Category', 'Service', 'What it does'], [
        ['End-user computing', 'Amazon WorkSpaces', 'Managed virtual desktops (Windows or Linux) for employees'],
        ['End-user computing', 'Amazon AppStream 2.0', 'Stream desktop applications to a browser'],
        ['End-user computing', 'Amazon WorkSpaces Secure Browser', 'Secure browser access to internal websites'],
        ['Front-end web & mobile', 'AWS Amplify', 'Build, deploy and host full-stack web and mobile apps quickly'],
        ['Front-end web & mobile', 'AWS AppSync', 'Managed GraphQL APIs'],
        ['Front-end web & mobile', 'Amazon API Gateway', 'Create, publish and secure REST, HTTP and WebSocket APIs at any scale'],
        ['Front-end web & mobile', 'AWS Device Farm', 'Test apps on real mobile devices and browsers in the cloud'],
        ['Internet of Things', 'AWS IoT Core', 'Securely connect billions of IoT devices to the cloud'],
        ['Internet of Things', 'AWS IoT Greengrass', 'Run local compute and ML on edge devices'],
        ['Customer engagement', 'Amazon Connect', 'Cloud contact center (phone and chat)'],
        ['Business applications', 'Amazon Simple Email Service (SES)', 'Send transactional and marketing email at scale']
      ])}
      ${K.hook('<b>WorkSpaces = whole desktop; AppStream = just the app streamed.</b> <b>Connect connects callers; SES sends emails.</b>')}` },
    { id: 'cheatsheet', title: 'Keyword → service cheat sheet', level: 'i', tags: 'cheat sheet keywords mapping review',
      html: `${K.table(['If the question says…', 'Think…'], [
        ['“run code without servers”, “event-driven”', 'AWS Lambda'],
        ['“interruptible”, “lowest compute cost”', 'EC2 Spot Instances'],
        ['“upload code, AWS handles the rest”', 'AWS Elastic Beanstalk'],
        ['“object storage”, “static website”, “11 nines”', 'Amazon S3'],
        ['“archive for years, cheapest”', 'S3 Glacier Deep Archive'],
        ['“shared file system for Linux”', 'Amazon EFS'],
        ['“move petabytes offline”', 'AWS Snowball Edge'],
        ['“isolated network”', 'Amazon VPC'],
        ['“dedicated private connection”', 'AWS Direct Connect'],
        ['“DNS”, “domain registration”', 'Amazon Route 53'],
        ['“cache content at the edge”', 'Amazon CloudFront'],
        ['“managed relational database”', 'Amazon RDS / Aurora'],
        ['“key-value, millisecond, serverless”', 'Amazon DynamoDB'],
        ['“data warehouse”', 'Amazon Redshift'],
        ['“decouple with a queue”', 'Amazon SQS'],
        ['“who made this API call”', 'AWS CloudTrail'],
        ['“metrics and alarms”', 'Amazon CloudWatch'],
        ['“configuration history and compliance”', 'AWS Config'],
        ['“threat detection”', 'Amazon GuardDuty'],
        ['“SQL injection, XSS”', 'AWS WAF'],
        ['“DDoS”', 'AWS Shield'],
        ['“compliance reports”', 'AWS Artifact'],
        ['“estimate cost”', 'AWS Pricing Calculator'],
        ['“alert on spend”', 'AWS Budgets'],
        ['“best-practice checks across cost, security, quotas”', 'AWS Trusted Advisor'],
        ['“designated TAM”', 'Enterprise Support']
      ])}` },
    { id: 'scenario-startup', title: 'Scenario 1: a serverless startup', level: 'a', tags: 'scenario serverless startup api gateway lambda dynamodb s3 cloudfront cognito',
      html: `${K.story('A recipe-sharing app', '<p>Two founders want to launch a recipe app with almost no budget and no operations staff. Traffic is unknown; it may be tiny or go viral.</p>')}
      ${K.diagram(K.flow(['Users', '*CloudFront|+ S3 static front end', 'API Gateway', '*Lambda', 'DynamoDB'], ), 'Every layer is serverless: nothing to patch, scales to zero, pay per request.')}
      <ul><li><b>Cognito</b> handles sign-up and sign-in for app users.</li><li>Uploaded photos go to <b>S3</b>; an S3 event triggers <b>Lambda</b> to create thumbnails; <b>Rekognition</b> can flag inappropriate images.</li><li><b>CloudWatch</b> alarms and <b>AWS Budgets</b> warn the founders about errors and spend.</li><li>Domain 1 benefits illustrated: <b>stop guessing capacity</b>, <b>trade fixed for variable expense</b>, <b>speed and agility</b>.</li></ul>
      ${K.recall('Why is this design cost-effective for unknown traffic?', 'All services are serverless and billed per use, so there is no idle capacity to pay for, and they scale automatically if traffic grows.')}` },
    { id: 'scenario-enterprise', title: 'Scenario 2: an enterprise migration', level: 'a', tags: 'scenario migration enterprise direct connect dms organizations control tower multi-az',
      html: `${K.story('A retailer leaves its data center', '<p>A retailer with 300 servers and an Oracle database must exit its data center within 18 months. It needs strict governance across teams, a private link during migration, and high availability.</p>')}
      ${K.table(['Need', 'AWS answer', 'Module'], [
        ['Plan the migration', 'AWS CAF perspectives; 7 Rs (rehost most servers, replatform the database)', 'M1'],
        ['Governed multi-account setup', 'AWS Control Tower + AWS Organizations with SCPs; IAM Identity Center for staff', 'M7, M8'],
        ['Private, consistent connectivity', 'AWS Direct Connect, with Site-to-Site VPN as backup', 'M5'],
        ['Move servers', 'AWS Application Migration Service (rehost)', 'M1'],
        ['Move the database', 'AWS SCT + AWS DMS to Aurora PostgreSQL (Multi-AZ)', 'M6'],
        ['Move 400 TB of file archives', 'AWS Snowball Edge, then S3 lifecycle to Glacier', 'M4'],
        ['High availability', 'Auto Scaling groups across three AZs behind an ALB', 'M2, M3'],
        ['Control cost', 'Compute Savings Plans for the baseline; Cost Explorer and cost allocation tags per team', 'M9'],
        ['Audit and compliance', 'CloudTrail organization trail, AWS Config rules, AWS Artifact for PCI reports', 'M7, M8']
      ])}` },
    { id: 'scenario-security', title: 'Scenario 3: responding to a security incident', level: 'a', tags: 'scenario incident response guardduty security hub detective cloudtrail inspector',
      html: `${K.story('A leaked access key', '<p>A developer accidentally commits an IAM access key to a public repository. Within an hour, unusual EC2 instances appear in an unused Region.</p>')}
      ${K.diagram(K.flow(['GuardDuty|detects unusual API calls', '*Security Hub|central finding', 'CloudTrail + Detective|who, what, when', 'Respond|deactivate key, terminate instances', 'Prevent|SCP denies unused Regions; roles not keys']), 'Detect → investigate → respond → prevent.')}
      ${K.tip('After an incident, the long-term fix is almost always <b>least privilege</b>, <b>IAM roles instead of long-term keys</b>, <b>MFA</b>, and <b>SCP guardrails</b>.')}` }
  ],
  terms: [
    ['Scaled score', '100–1,000 scale; 700 passes', 'Converted grade'],
    ['Unscored questions', '15 questions used to evaluate future items', 'Practice questions hidden in the test'],
    ['Amazon WorkSpaces', 'Managed virtual desktops', 'A desk in the cloud'],
    ['Amazon AppStream 2.0', 'Stream individual applications', 'App on a video stream'],
    ['AWS Amplify', 'Build and host full-stack web/mobile apps', 'App starter kit'],
    ['Amazon API Gateway', 'Create and secure APIs', 'Front door for your backend'],
    ['AWS IoT Core', 'Connect IoT devices to AWS', 'Switchboard for smart devices'],
    ['Amazon Connect', 'Cloud contact center', 'Call center in a box'],
    ['Amazon SES', 'Send email at scale', 'Post office'],
    ['AWS Device Farm', 'Test on real mobile devices', 'Phone testing lab']
  ],
  hooks: [
    '<b>65 questions, 90 minutes, 700 to pass, no penalty for guessing.</b>',
    '<b>Domain weights 24 / 30 / 34 / 12</b>: “Concepts, Security, Technology, Billing”.',
    '<b>WorkSpaces = whole desktop; AppStream = one app.</b>',
    '<b>Read the last line first; then hunt for the qualifier.</b>'
  ],
  tips: [
    'Answer every question; there is no penalty for wrong answers.',
    'Flag uncertain questions and come back; later questions sometimes jog your memory.',
    'Eliminate options from the wrong category first (a database offered for a networking question).',
    'Prefer managed and serverless answers when the question stresses less operational overhead.',
    'Watch absolute words such as “always”, “never”, “guarantees 100 %”: they are usually wrong.'
  ],
  traps: [
    'Picking an answer that works but is not the <i>best</i> fit for the qualifier (cheapest, least effort, most secure).',
    'Confusing similar names: CloudTrail vs CloudWatch vs Config; Inspector vs GuardDuty; Polly vs Transcribe.',
    'Assuming multi-AZ protects against Region failure.',
    'Forgetting the customer\'s share of security on managed services (data, IAM, encryption choices).',
    'Using outdated facts: five pillars, 12-month Free Tier for new accounts, Spot bidding.'
  ],
  checks: [
    ['What is the passing scaled score for the AWS Certified Cloud Practitioner exam?', '700', '650', '750', '800', 'Scores range from 100 to 1,000 and 700 is required to pass.'],
    ['Which service provides managed virtual desktops for employees?', 'Amazon WorkSpaces', 'Amazon AppStream 2.0', 'AWS Amplify', 'Amazon Connect', 'WorkSpaces delivers full Windows or Linux desktops.'],
    ['Which service would you use to build a cloud-based contact center?', 'Amazon Connect', 'Amazon SES', 'Amazon SNS', 'AWS IoT Core', 'Amazon Connect is a cloud contact center service.'],
    ['A question asks for the solution with the “least operational overhead”. Which type of answer is usually best?', 'A fully managed or serverless service', 'Self-managed software on EC2', 'An on-premises server', 'A Dedicated Host', 'Managed and serverless services shift operational work to AWS.']
  ],
  summary: '<p>The CLF-C02 exam has 65 questions (50 scored) in 90 minutes, scored from 100 to 1,000 with 700 to pass and no guessing penalty, weighted 24 / 30 / 34 / 12 % across the four domains. A five-step method (read the ask, find the qualifier, eliminate, choose the best fit, flag and move on) turns knowledge into points. The exam guide also covers end-user computing (WorkSpaces, AppStream 2.0), front-end and mobile (Amplify, AppSync, API Gateway, Device Farm), IoT (IoT Core, Greengrass), and business and customer engagement services (SES, Connect). Real-world scenarios combine everything: serverless stacks for unknown traffic, governed enterprise migrations, and detect-investigate-respond-prevent security workflows.</p>',
  takeaways: [
    '65 questions (50 scored + 15 unscored), 90 minutes, 700 / 1,000 to pass.',
    'Domains: 24 % concepts, 30 % security, 34 % technology, 12 % billing.',
    'Read the qualifier: cheapest, least overhead, most secure, highly available.',
    'WorkSpaces, AppStream 2.0, Amplify, API Gateway, IoT Core, Connect, SES.',
    'Combine services into solutions: serverless startup, enterprise migration, incident response.'
  ],
  sources: [
    ['AWS Certified Cloud Practitioner (CLF-C02) exam guide', 'https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html'],
    ['AWS Certified Cloud Practitioner', 'https://aws.amazon.com/certification/certified-cloud-practitioner/'],
    ['Amazon WorkSpaces', 'https://aws.amazon.com/workspaces/'],
    ['AWS Amplify', 'https://aws.amazon.com/amplify/'],
    ['AWS IoT Core', 'https://aws.amazon.com/iot-core/'],
    ['Amazon Connect', 'https://aws.amazon.com/connect/']
  ]
});
