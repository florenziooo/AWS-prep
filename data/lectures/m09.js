STRATUS.lecture({
  id: 'm9', num: 9, minutes: 40,
  tagline: 'How AWS charges, how to estimate and control the bill, and which support plan and resources to use for help.',
  subtitle: 'Domain 4 is about money and help. This module covers the <b>pricing fundamentals</b> (pay-as-you-go, save when you commit, pay less by using more), compute pricing models, data-transfer charges, the <b>AWS Free Tier</b>, <b>total cost of ownership</b>, the billing tools (<b>Pricing Calculator, Billing and Cost Management, Cost Explorer, AWS Budgets, Cost and Usage Reports, cost allocation tags</b>), <b>AWS Organizations consolidated billing</b>, and the <b>AWS Support plans</b> and other support resources.',
  objectives: [
    'Explain the three AWS pricing fundamentals and the cost drivers of compute, storage and data transfer.',
    'Choose between On-Demand, Savings Plans, Reserved Instances, Spot and Dedicated options for cost.',
    'Describe the current AWS Free Tier and the elements of total cost of ownership (TCO).',
    'Match billing tools (Pricing Calculator, Cost Explorer, Budgets, CUR, cost allocation tags) to tasks.',
    'Explain consolidated billing in AWS Organizations.',
    'Compare AWS Support plans and identify other support resources (re:Post, Knowledge Center, Marketplace, Partner Network, Professional Services, IQ).'
  ],
  why: '<p>Domain 4 is <b>12 %</b> of the scored exam (about 6 questions) and many are direct: “Which tool forecasts costs?”, “Which plan includes a Technical Account Manager?”, “Which tool estimates the cost of a new architecture?”. Precise tool names win these points.</p>',
  sections: [
    { id: 'eli5', title: 'AWS pricing, explained simply', level: 'b', tags: 'pricing fundamentals pay as you go save when you commit pay less by using more explained',
      html: `${K.eli5('<p>AWS pricing works like a utility plus a gym. Like <b>electricity</b>, you pay for what you use. Like a <b>gym membership</b>, if you promise to come for a year or three, you get a cheaper rate. And like <b>buying in bulk</b>, the more storage you use, the cheaper each gigabyte gets.</p>')}
      ${K.table(['Fundamental', 'Meaning', 'Example'], [
        ['Pay as you go', 'Pay only for what you use, no long-term contract', 'On-Demand EC2 billed per second'],
        ['Save when you commit', 'Commit to usage for 1 or 3 years for lower rates', 'Savings Plans, Reserved Instances'],
        ['Pay less by using more', 'Tiered volume discounts', 'S3 per-GB price drops at higher tiers'],
        ['(also) Pay less as AWS grows', 'Economies of scale lead to price reductions over time', 'AWS has reduced prices many times']
      ])}
      ${K.recall('Which pricing principle describes S3 getting cheaper per GB as you store more?', 'Pay less by using more (tiered volume pricing).')}` },
    { id: 'drivers', title: 'Cost drivers: compute, storage and data transfer', level: 'b', tags: 'cost drivers data transfer inbound outbound free between regions availability zones',
      html: `${K.table(['Resource', 'You pay for'], [
        ['Compute (EC2, Lambda, Fargate)', 'Time running (per second/hour), instance type, Region, purchasing option; Lambda: requests and duration'],
        ['Storage (S3, EBS)', 'GB stored per month, storage class, requests, retrievals; EBS: provisioned GB (and IOPS)'],
        ['Data transfer', 'Data <b>out</b> to the internet, between Regions, and between AZs']
      ])}
      ${K.table(['Data transfer type', 'Typical charge'], [
        ['Into AWS from the internet', '<b>Free</b>'],
        ['Out from AWS to the internet', 'Charged per GB (first 100 GB/month free across services)'],
        ['Between Regions', 'Charged'],
        ['Between AZs in the same Region', 'Charged (small amount) in each direction'],
        ['Within the same AZ using private IPs', 'Free'],
        ['From AWS to Amazon CloudFront origins', 'Free from AWS origins to CloudFront']
      ])}
      ${K.hook('<b>“In is free, out costs dough.”</b>')}
      ${K.trap('Stopped EC2 instances stop compute charges, but their <b>EBS volumes</b> and <b>Elastic IP addresses</b> can still cost money.')}` },
    { id: 'pricing-models', title: 'Choosing a compute pricing model', level: 'i', tags: 'on-demand savings plans reserved instances spot dedicated hosts capacity reservations all upfront partial upfront no upfront',
      html: `${K.spectrum([
        ['On-Demand', 'No commitment. Highest rate. Short-term, spiky, unknown.'],
        ['Savings Plans', '1 or 3 years, $/hour commitment, up to 72 % off, flexible across families, Regions, Fargate, Lambda.'],
        ['Reserved Instances', '1 or 3 years for a specific configuration, up to 72 % off. Standard or Convertible.'],
        ['Spot', 'Up to 90 % off, interruptible with a 2-minute warning.']
      ], ['Flexibility', 'Lowest price'])}
      <p>Reserved Instances and Savings Plans can be paid <b>All Upfront</b> (biggest discount), <b>Partial Upfront</b>, or <b>No Upfront</b>. A 3-year term saves more than a 1-year term.</p>
      ${K.fix('<p>Older material quotes RI savings of “up to 75 %” and mentions Scheduled Reserved Instances. AWS now states <b>up to 72 %</b> for Savings Plans and RIs, and <b>Scheduled RIs are no longer available</b>; use On-Demand Capacity Reservations with Savings Plans instead.</p>')}
      ${K.story('Mixing models', '<p>A media company covers its always-on baseline of 20 instances with a <b>Compute Savings Plan</b>, scales its web tier above that with <b>On-Demand</b>, and transcodes video overnight on <b>Spot</b>. Its bill drops by more than half without any loss of reliability.</p>')}` },
    { id: 'free-tier-tco', title: 'AWS Free Tier and total cost of ownership', level: 'i', tags: 'free tier credits always free trials tco total cost of ownership migration evaluator',
      html: `${K.fix('<p>Older notes describe the Free Tier as “free for 12 months”. For AWS accounts created <b>on or after 15 July 2025</b>, new customers receive up to <b>$200 in credits</b> and can choose a <b>free plan</b> (lasting up to 6 months or until credits run out) or a paid plan. <b>Always Free</b> offers continue (for example, a monthly allowance of Lambda requests and DynamoDB storage). Accounts created before that date keep the legacy 12-month offers.</p>')}
      ${K.table(['Free Tier type', 'Example'], [
        ['Always Free', 'AWS Lambda 1 million requests per month; Amazon DynamoDB 25 GB storage'],
        ['Credits-based free plan (new accounts)', 'Up to $200 of credits to use across eligible services'],
        ['Short-term trials', 'Free trial periods for specific services']
      ])}
      <p><b>Total cost of ownership (TCO)</b> compares the full cost of running on-premises with running on AWS. On-premises TCO includes servers, storage, networking, <b>software licences</b>, data-center space, <b>power and cooling</b>, physical security, and <b>staff time</b> to maintain it all. Many of these costs are hidden or indirect.</p>
      ${K.tip('Migration Evaluator (formerly TSO Logic) builds a data-driven business case for migrating on-premises workloads. The AWS Pricing Calculator estimates the cost of a planned AWS architecture.')}` },
    { id: 'billing-tools', title: 'Billing and cost management tools', level: 'i', tags: 'pricing calculator billing dashboard cost explorer budgets cost and usage report cur data exports cost allocation tags anomaly detection',
      html: `${K.table(['Tool', 'Job', 'Keyword in questions'], [
        ['AWS Pricing Calculator', 'Estimate the cost of AWS services <b>before</b> you build', '“estimate”, “planned architecture”'],
        ['AWS Billing and Cost Management console', 'View bills, payment methods, credits, Free Tier usage', '“view the current bill”'],
        ['AWS Cost Explorer', 'Visualise and analyse past cost and usage; <b>forecast</b> future spend', '“visualise”, “trend”, “forecast”'],
        ['AWS Budgets', 'Set custom cost, usage, RI or Savings Plans budgets and <b>alert</b> when actual or forecast spend exceeds them', '“alert when spending exceeds”'],
        ['AWS Cost and Usage Report (CUR) / Data Exports', 'The <b>most detailed</b> line-item cost and usage data delivered to S3', '“most granular”, “hourly line items”, “analyse in Athena”'],
        ['Cost allocation tags', 'Tag resources (e.g. project=alpha) and break down costs by tag', '“costs per department or project”'],
        ['AWS Cost Anomaly Detection', 'Machine learning that flags unusual spend', '“unexpected spike in spending”']
      ])}
      ${K.hook('<b>Calculator predicts, Explorer explains, Budgets barks, CUR counts everything.</b>')}
      ${K.trap('<b>Cost Explorer</b> shows and forecasts costs but does not send threshold alerts on its own; <b>AWS Budgets</b> sends alerts.')}
      ${K.recall('A finance team wants an email when monthly spend is forecast to exceed $5,000. Which tool?', 'AWS Budgets.')}` },
    { id: 'consolidated', title: 'Consolidated billing with AWS Organizations', level: 'i', tags: 'consolidated billing organizations management account volume discount reserved instance sharing',
      html: `${K.diagram(K.nest('region', 'Management (payer) account · one bill', K.row(K.box('Account A · 4 TB S3'), K.box('Account B · 6 TB S3'), K.box('Account C · 2 TB S3'))) , 'Usage is combined: 12 TB total reaches cheaper S3 tiers than any account alone.')}
      <ul><li><b>One bill</b> for all accounts in the organization, paid by the management account.</li><li><b>Combined usage</b> for volume pricing tiers, so everyone pays less.</li><li><b>Sharing</b> of Reserved Instance and Savings Plans discounts across accounts (can be turned off).</li><li>Consolidated billing itself is <b>free</b>.</li></ul>` },
    { id: 'support', title: 'AWS Support plans and resources', level: 'a', tags: 'support plans basic developer business enterprise on-ramp enterprise tam business support+ unified operations re:post knowledge center marketplace partner network professional services',
      html: `${K.fix('<p>In December 2025 AWS introduced new plans: <b>Basic</b>, <b>Business Support+</b>, <b>Enterprise Support</b> (with a designated Technical Account Manager) and <b>Unified Operations</b>. The legacy <b>Developer</b>, <b>Business</b> and <b>Enterprise On-Ramp</b> plans run until <b>1 January 2027</b>. Exam questions may still use the legacy names, so both are taught here.</p>')}
      ${K.table(['Legacy plan', 'Key features', 'Fastest response (legacy)'], [
        ['Basic (free)', 'Customer service, documentation, re:Post, AWS Health Dashboard, core Trusted Advisor checks', 'No technical support cases'],
        ['Developer', 'Business-hours email access to cloud support associates; for testing and development', 'General guidance &lt; 24 h; system impaired &lt; 12 h'],
        ['Business', '24/7 phone, chat and email; full Trusted Advisor checks; AWS Health API', 'Production system down &lt; 1 h'],
        ['Enterprise On-Ramp', 'Pool of Technical Account Managers; Concierge Support team', 'Business-critical system down &lt; 30 min'],
        ['Enterprise', '<b>Designated Technical Account Manager (TAM)</b>, Concierge Support team, Infrastructure Event Management', 'Business-critical system down &lt; 15 min']
      ])}
      ${K.hook('<b>“Fifteen for the Enterprise”</b>: the fastest response time and the designated TAM belong to the top plan.')}
      ${K.table(['Resource', 'Use it for'], [
        ['AWS re:Post', 'Community Q&A forum moderated with AWS experts'],
        ['AWS Knowledge Center', 'Answers to the most common support questions'],
        ['AWS Trust & Safety team', 'Report abuse of AWS resources (spam, attacks from AWS IPs)'],
        ['AWS Marketplace', 'Buy third-party software, data and services billed through AWS'],
        ['AWS Partner Network (APN)', 'Find consulting and technology partners'],
        ['AWS Professional Services', 'AWS\'s own experts for large engagements'],
        ['AWS IQ', 'Hire AWS-certified freelancers for projects'],
        ['AWS Managed Services (AMS)', 'AWS operates your infrastructure for you']
      ])}
      ${K.recall('Which legacy support plan is the lowest-cost plan that offers 24/7 phone support and all Trusted Advisor checks?', 'Business Support.')}` }
  ],
  terms: [
    ['Pay as you go', 'Pay only for what you use', 'Electricity meter'],
    ['Savings Plan / RI', '1–3 year commitment for up to 72 % off', 'Gym membership'],
    ['Spot Instance', 'Spare capacity up to 90 % off, interruptible', 'Standby ticket'],
    ['TCO', 'Full cost of ownership incl. hidden costs (power, staff, space)', 'True cost of owning a car'],
    ['AWS Pricing Calculator', 'Estimate cost before building', 'Quote from a builder'],
    ['AWS Cost Explorer', 'Visualise and forecast spend', 'Bank statement graphs'],
    ['AWS Budgets', 'Alerts when cost or usage exceeds thresholds', 'Spending alarm'],
    ['Cost and Usage Report', 'Most detailed billing data', 'Itemised receipt'],
    ['Cost allocation tags', 'Labels that split cost by project or team', 'Coloured stickers on receipts'],
    ['Consolidated billing', 'One bill and combined volume discounts across accounts', 'Family phone plan'],
    ['Technical Account Manager', 'Designated AWS technical contact (Enterprise)', 'Personal advisor'],
    ['AWS re:Post', 'Community Q&A for AWS', 'Help forum']
  ],
  hooks: [
    '<b>Pay as you go · Save when you commit · Pay less by using more.</b>',
    '<b>In is free, out costs dough.</b>',
    '<b>Calculator predicts, Explorer explains, Budgets barks, CUR counts everything.</b>',
    '<b>Fifteen for the Enterprise</b> (15-minute response, designated TAM).'
  ],
  tips: [
    '“Estimate cost of a new workload” → Pricing Calculator. “Analyse and forecast spending” → Cost Explorer. “Alert on spending” → Budgets. “Most detailed data” → CUR.',
    '“Track costs by department” → cost allocation tags (activated in the Billing console).',
    '“Single bill and volume discounts across accounts” → consolidated billing in AWS Organizations.',
    '“Designated TAM” → Enterprise. “24/7 phone support at lowest cost” → Business (legacy).',
    '“Third-party software billed through AWS” → AWS Marketplace.'
  ],
  traps: [
    'Data transfer into AWS is free; out to the internet is not.',
    'Cost Explorer does not alert; Budgets does.',
    'RI/Savings Plans discounts are up to 72 %, not 75 %; Spot is up to 90 %.',
    'Basic support does not include technical support cases.',
    'The Free Tier changed for accounts created on or after 15 July 2025 (credits-based).',
    'Consolidated billing is free and does not merge security permissions.'
  ],
  checks: [
    ['Which tool estimates the monthly cost of an architecture before it is deployed?', 'AWS Pricing Calculator', 'AWS Cost Explorer', 'AWS Budgets', 'AWS Cost and Usage Report', 'The Pricing Calculator estimates costs for planned workloads.'],
    ['Which tool sends alerts when actual or forecast spending exceeds a threshold?', 'AWS Budgets', 'AWS Cost Explorer', 'AWS Pricing Calculator', 'AWS Artifact', 'Budgets supports threshold alerts on actual and forecast costs.'],
    ['Which support plan includes a designated Technical Account Manager?', 'Enterprise Support', 'Developer Support', 'Basic Support', 'Business Support (legacy)', 'A designated TAM is part of Enterprise Support.'],
    ['Which type of data transfer is generally free?', 'Data transferred into AWS from the internet', 'Data transferred out to the internet', 'Data transferred between Regions', 'Data transferred between AZs', 'Inbound data transfer is free; outbound and inter-Region transfers are charged.']
  ],
  summary: '<p>AWS pricing rests on three ideas: <b>pay as you go</b>, <b>save when you commit</b> (Savings Plans and Reserved Instances, up to 72 %), and <b>pay less by using more</b>; Spot offers up to 90 % off for interruptible work. Costs come from compute, storage and especially <b>outbound data transfer</b> (inbound is free). New accounts get a credits-based <b>Free Tier</b>, and <b>TCO</b> comparisons reveal hidden on-premises costs. Use the <b>Pricing Calculator</b> to estimate, <b>Cost Explorer</b> to analyse and forecast, <b>Budgets</b> to alert, the <b>Cost and Usage Report</b> for detail and <b>cost allocation tags</b> to split costs; <b>consolidated billing</b> combines accounts for one bill and volume discounts. <b>AWS Support plans</b> scale from Basic to Enterprise (designated TAM), complemented by re:Post, the Knowledge Center, Marketplace, partners and Professional Services.</p>',
  takeaways: [
    'Pay as you go; save when you commit; pay less by using more.',
    'Inbound transfer free; outbound and inter-Region charged.',
    'Savings Plans / RIs up to 72 %; Spot up to 90 %; All Upfront + 3 years = biggest discount.',
    'Pricing Calculator (estimate), Cost Explorer (analyse/forecast), Budgets (alert), CUR (detail), tags (allocate).',
    'Consolidated billing: one bill, combined tiers, shared discounts, free.',
    'Support: Basic → Developer → Business → Enterprise On-Ramp → Enterprise (legacy); new: Basic, Business Support+, Enterprise, Unified Operations.'
  ],
  sources: [
    ['How AWS Pricing Works (whitepaper)', 'https://docs.aws.amazon.com/whitepapers/latest/how-aws-pricing-works/welcome.html'],
    ['AWS Free Tier', 'https://aws.amazon.com/free/'],
    ['AWS Cost Management tools', 'https://aws.amazon.com/aws-cost-management/'],
    ['Consolidated billing for AWS Organizations', 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html'],
    ['Compare AWS Support plans', 'https://aws.amazon.com/premiumsupport/plans/'],
    ['New and enhanced AWS Support plans (AWS News Blog, Dec 2025)', 'https://aws.amazon.com/blogs/aws/new-and-enhanced-aws-support-plans-add-ai-capabilities-to-expert-guidance']
  ]
});
