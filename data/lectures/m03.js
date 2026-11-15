STRATUS.lecture({
  id: 'm3', num: 3, minutes: 40,
  tagline: 'Virtual servers, containers and serverless functions, and how load balancing and Auto Scaling keep them right-sized.',
  subtitle: 'Compute is the engine of every application. This module covers <b>Amazon EC2</b> (instance types, AMIs, purchasing options), <b>containers</b> (ECS, EKS, Fargate), <b>serverless</b> compute (AWS Lambda), simpler platforms (Elastic Beanstalk, Lightsail), and the pair that makes compute elastic: <b>Elastic Load Balancing</b> and <b>Amazon EC2 Auto Scaling</b>.',
  objectives: [
    'Describe Amazon EC2, AMIs and the main instance families.',
    'Compare On-Demand, Savings Plans, Reserved Instances, Spot Instances and Dedicated Hosts.',
    'Distinguish containers (ECS, EKS, Fargate) from virtual machines and from serverless functions.',
    'Explain when to use AWS Lambda and its key limits.',
    'Describe Elastic Load Balancing types and how Auto Scaling achieves elasticity.',
    'Recognise Elastic Beanstalk, Lightsail and AWS Batch use cases.'
  ],
  why: '<p>Compute questions appear across task statement 3.3 (compute services) and 4.1 (pricing models). The exam loves scenarios like “interruptible batch job, lowest cost” (Spot) or “run code without managing servers” (Lambda).</p>',
  sections: [
    { id: 'eli5', title: 'Compute, explained simply', level: 'b', tags: 'compute explained analogy',
      html: `${K.eli5('<p>Imagine you need transport. <b>Amazon EC2</b> is renting a car: you choose the model, you drive, you fill the tank. <b>Containers</b> are like shipping boxes: you pack your app once and it fits on any truck. <b>AWS Lambda</b> is a taxi: you only say where you want to go, pay per ride, and never think about the vehicle.</p>')}
      ${K.spectrum([
        ['Amazon EC2', 'Virtual machines. You manage the OS, patches and scaling rules.'],
        ['Containers (ECS / EKS)', 'Package app + dependencies. Run on EC2 you manage or on Fargate (serverless).'],
        ['AWS Fargate', 'Serverless containers: no instances to manage.'],
        ['AWS Lambda', 'Run functions in response to events. No servers; pay per request and duration.']
      ], ['More control', 'Less to manage'])}
      ${K.recall('Which compute option requires you to patch the operating system yourself?', 'Amazon EC2. You manage the guest OS on EC2 instances.')}` },
    { id: 'ec2', title: 'Amazon EC2: instances, AMIs and instance types', level: 'b', tags: 'ec2 ami instance type general purpose compute optimized memory optimized storage optimized accelerated',
      html: `<p><b>Amazon Elastic Compute Cloud (EC2)</b> provides resizable virtual servers called <b>instances</b>. You launch an instance from an <b>Amazon Machine Image (AMI)</b>, a template containing the OS and software, so you can launch identical servers repeatedly.</p>
      ${K.table(['Family', 'Optimised for', 'Example use', 'Example types'], [
        ['General purpose', 'Balanced CPU, memory, network', 'Web servers, code repositories', 'M, T'],
        ['Compute optimized', 'High-performance processors', 'Batch processing, gaming servers, scientific modelling', 'C'],
        ['Memory optimized', 'Large in-memory data sets', 'In-memory databases, real-time big-data analytics', 'R, X'],
        ['Storage optimized', 'High sequential read/write to local storage', 'Data warehousing, OLTP, distributed file systems', 'I, D'],
        ['Accelerated computing', 'GPUs or custom chips', 'Machine learning, graphics rendering', 'P, G, Inf, Trn']
      ])}
      ${K.hook('<b>“Many Cats Run In Packs”</b>: <b>M</b> general purpose, <b>C</b> compute, <b>R</b> RAM (memory), <b>I</b> I/O (storage), <b>P</b> parallel GPUs (accelerated).')}
      ${K.tip('EC2 is IaaS: you are responsible for the guest OS, patches, installed software and security group rules.')}` },
    { id: 'pricing', title: 'EC2 purchasing options', level: 'i', tags: 'on-demand reserved instances savings plans spot dedicated hosts dedicated instances capacity reservations',
      html: `${K.table(['Option', 'How it works', 'Best for', 'Discount vs On-Demand'], [
        ['On-Demand', 'Pay by the second (Linux) or hour, no commitment', 'Short-term, spiky or unpredictable workloads; testing', 'None'],
        ['Savings Plans', 'Commit to a $/hour spend for 1 or 3 years', 'Steady usage that may change instance type, Region, or move to Lambda/Fargate', 'Up to 72 %'],
        ['Reserved Instances', 'Commit to an instance configuration for 1 or 3 years', 'Steady-state workloads such as a database server', 'Up to 72 %'],
        ['Spot Instances', 'Use spare EC2 capacity; AWS can reclaim it with a 2-minute warning', 'Fault-tolerant, flexible, interruptible jobs (batch, CI, rendering)', 'Up to 90 %'],
        ['Dedicated Hosts', 'A physical server fully dedicated to you', 'Server-bound software licences (BYOL), compliance', 'Most expensive'],
        ['Dedicated Instances', 'Instances on hardware not shared with other customers', 'Compliance needing single-tenant hardware', 'Premium'],
        ['On-Demand Capacity Reservations', 'Reserve capacity in a specific AZ, any duration', 'Guaranteed capacity for a known event', 'None by itself']
      ])}
      ${K.fix('<p>Older notes say Spot runs “while your bid is above the Spot price”. AWS removed bidding in 2017: you pay the current Spot price and can optionally set a maximum price. <b>Scheduled Reserved Instances</b> are no longer offered, and the maximum RI/Savings Plans discount is quoted as <b>up to 72 %</b>.</p>')}
      ${K.story('Three workloads, three prices', '<p>A university runs its student portal 24/7 all year → <b>Savings Plan</b> or <b>Reserved Instance</b>. It renders lecture videos overnight, and a stopped job can simply restart → <b>Spot</b>. It hosts a one-week coding competition with unknown traffic → <b>On-Demand</b>.</p>')}
      ${K.recall('Which purchasing option is best for a batch job that can be interrupted and restarted, at the lowest cost?', 'Spot Instances (up to 90 % off On-Demand).')}` },
    { id: 'containers', title: 'Containers: ECS, EKS, Fargate and ECR', level: 'i', tags: 'containers docker ecs eks fargate ecr kubernetes',
      html: `<p>A <b>container</b> packages an application with its libraries and settings so it runs the same everywhere. Containers share the host OS kernel, so they start faster and are lighter than virtual machines.</p>
      ${K.table(['Service', 'What it does'], [
        ['Amazon ECS (Elastic Container Service)', 'AWS\'s own container orchestration service: runs and scales Docker containers'],
        ['Amazon EKS (Elastic Kubernetes Service)', 'Managed Kubernetes; choose it when you already use Kubernetes'],
        ['AWS Fargate', 'Serverless compute engine for ECS and EKS: no EC2 instances to provision or patch'],
        ['Amazon ECR (Elastic Container Registry)', 'Stores and versions container images']
      ])}
      ${K.trap('Fargate is not an orchestrator. ECS and EKS <i>orchestrate</i> containers; Fargate is <i>where</i> they run when you do not want to manage servers.')}` },
    { id: 'lambda', title: 'Serverless compute with AWS Lambda', level: 'i', tags: 'lambda serverless event-driven function timeout memory pay per request',
      html: `<p><b>AWS Lambda</b> runs your code in response to events, such as a file uploaded to S3, an API call through API Gateway, or a schedule, without provisioning servers. You pay for the number of requests and the compute time in milliseconds.</p>
      ${K.diagram(K.flow(['Photo uploaded|to S3', '*Lambda function|resize image', 'Thumbnail saved|to S3']), 'A classic event-driven pattern: S3 triggers Lambda.')}
      ${K.fix('<p>Older notes list a maximum of 3,008 MB memory. Lambda now supports up to <b>10,240 MB (10 GB)</b>. The maximum run time per invocation is still <b>15 minutes</b>.</p>')}
      ${K.tip('“Run code without provisioning or managing servers”, “event-driven”, “pay only when code runs” → <b>Lambda</b>. A job that runs for hours does not fit Lambda\'s 15-minute limit; use EC2, Fargate or AWS Batch.')}
      ${K.recall('What is the maximum duration of a single Lambda invocation?', '15 minutes.')}` },
    { id: 'other-compute', title: 'Elastic Beanstalk, Lightsail, Batch and Outposts', level: 'i', tags: 'elastic beanstalk lightsail aws batch app runner',
      html: `${K.table(['Service', 'Use it when'], [
        ['AWS Elastic Beanstalk', 'You want to upload code and let AWS handle capacity, load balancing, scaling and health monitoring (PaaS). You still have access to the underlying resources.'],
        ['Amazon Lightsail', 'You need a simple virtual private server with a predictable monthly price, for example a small website or blog.'],
        ['AWS Batch', 'You need to run hundreds of thousands of batch computing jobs; Batch provisions the right compute automatically.'],
        ['AWS App Runner', 'You want to deploy a containerised web app or API from source or an image with no infrastructure decisions.']
      ])}
      ${K.trap('Elastic Beanstalk itself is free; you pay for the EC2 instances, load balancers and other resources it creates.')}` },
    { id: 'elb-asg', title: 'Elastic Load Balancing and EC2 Auto Scaling', level: 'a', tags: 'elastic load balancing alb nlb gateway load balancer auto scaling group minimum maximum desired health check scaling policy',
      html: `<p><b>Elastic Load Balancing (ELB)</b> spreads incoming traffic across healthy targets in multiple AZs. <b>Amazon EC2 Auto Scaling</b> adds or removes instances to match demand. Together they deliver elasticity and high availability.</p>
      ${K.table(['Load balancer', 'Layer', 'Best for'], [
        ['Application Load Balancer (ALB)', '7 (HTTP/HTTPS)', 'Web apps, path- and host-based routing, microservices'],
        ['Network Load Balancer (NLB)', '4 (TCP/UDP/TLS)', 'Millions of requests per second, ultra-low latency, static IP'],
        ['Gateway Load Balancer (GWLB)', '3 (IP packets)', 'Deploying third-party virtual appliances such as firewalls'],
        ['Classic Load Balancer', '4 and 7', 'Legacy; previous generation']
      ])}
      ${K.diagram(K.flow(['Users', '*Application Load Balancer', 'Auto Scaling group|min 2 · desired 4 · max 10', 'CloudWatch alarm|CPU &gt; 70 %']), 'CloudWatch metrics trigger the scaling policy; the load balancer registers new instances automatically.')}
      <ul><li><b>Minimum capacity</b>: never fewer instances than this.</li><li><b>Desired capacity</b>: the number Auto Scaling tries to keep right now.</li><li><b>Maximum capacity</b>: a ceiling that caps cost.</li></ul>
      ${K.table(['Scaling approach', 'How it decides'], [
        ['Target tracking', 'Keep a metric at a target, e.g. average CPU 50 %'],
        ['Step / simple scaling', 'Add or remove a set number of instances when an alarm fires'],
        ['Scheduled scaling', 'Change capacity at known times, e.g. every Monday 8 AM'],
        ['Predictive scaling', 'Uses machine learning on history to scale before demand arrives']
      ])}
      ${K.recall('An Auto Scaling group has min 2, desired 2, max 6. Traffic triples. What happens, and what is the upper limit?', 'A scaling policy raises desired capacity and launches more instances, up to the maximum of 6.')}` }
  ],
  terms: [
    ['Amazon EC2', 'Resizable virtual servers (IaaS)', 'Renting a car'],
    ['AMI', 'Template with OS and software used to launch instances', 'A cookie cutter'],
    ['Spot Instance', 'Spare capacity, up to 90 % off, can be interrupted with 2 minutes\' notice', 'Standby airline seat'],
    ['Savings Plan', '1- or 3-year $/hour commitment for up to 72 % off', 'Phone contract'],
    ['Dedicated Host', 'Whole physical server for you; helps with server-bound licences', 'Renting the whole house'],
    ['Container', 'App + dependencies packaged to run anywhere', 'Shipping container'],
    ['AWS Fargate', 'Serverless engine for running containers', 'Valet parking for containers'],
    ['AWS Lambda', 'Event-driven functions, no servers, 15-minute max', 'Taxi ride'],
    ['Elastic Load Balancing', 'Distributes traffic across healthy targets in multiple AZs', 'Restaurant host seating guests'],
    ['EC2 Auto Scaling', 'Adds and removes instances to match demand', 'Opening more checkout lanes']
  ],
  hooks: [
    '<b>Instance families: “Many Cats Run In Packs”</b> (general, compute, RAM, I/O, parallel GPU).',
    '<b>Spot = Standby seat</b>: cheap, but you can be bumped.',
    '<b>Car → shipping box → taxi</b>: EC2 → containers → Lambda.',
    '<b>ELB spreads, Auto Scaling sizes.</b>'
  ],
  tips: [
    '“Interruptible / fault-tolerant / flexible start time / lowest cost” → Spot Instances.',
    '“Steady, predictable, 1–3 years” → Reserved Instances or Savings Plans (Savings Plans if flexibility across instance families, Regions, Lambda or Fargate matters).',
    '“Bring your own server-bound licence” or “visibility of sockets and cores” → Dedicated Hosts.',
    '“Already use Kubernetes” → Amazon EKS. “Containers without managing servers” → AWS Fargate.',
    '“Upload code, AWS handles deployment, capacity and scaling” → Elastic Beanstalk.'
  ],
  traps: [
    'Spot Instances no longer use bidding, and they can be stopped by AWS at short notice; never use them for work that cannot be interrupted.',
    'Lambda is limited to 15 minutes per run and up to 10 GB memory.',
    'Auto Scaling does not distribute traffic; Elastic Load Balancing does.',
    'Elastic Beanstalk is free; the underlying resources are not.',
    'Dedicated Instances ≠ Dedicated Hosts: only Hosts give you control over the physical server for licensing.'
  ],
  checks: [
    ['Which EC2 purchasing option gives the largest discount for workloads that can be interrupted?', 'Spot Instances', 'Reserved Instances', 'Dedicated Hosts', 'On-Demand Instances', 'Spot uses spare capacity at up to 90 % off but can be reclaimed with a 2-minute warning.'],
    ['Which service runs code in response to events without provisioning servers?', 'AWS Lambda', 'Amazon EC2', 'Amazon Lightsail', 'AWS Outposts', 'Lambda is event-driven serverless compute billed per request and duration.'],
    ['Which service lets you run containers on ECS or EKS without managing EC2 instances?', 'AWS Fargate', 'Amazon ECR', 'AWS Batch', 'Elastic Load Balancing', 'Fargate is the serverless compute engine for containers.'],
    ['Which load balancer is best for HTTP/HTTPS traffic with path-based routing?', 'Application Load Balancer', 'Network Load Balancer', 'Gateway Load Balancer', 'Classic Load Balancer', 'ALB works at layer 7 and supports content-based routing.']
  ],
  summary: '<p>AWS compute ranges from <b>EC2</b> virtual machines (most control, you manage the OS) through <b>containers</b> on ECS or EKS (optionally serverless with Fargate) to <b>Lambda</b> functions (no servers, event-driven, 15-minute limit). EC2 cost depends on the purchasing option: On-Demand for flexibility, Savings Plans and Reserved Instances for steady use (up to 72 % off), Spot for interruptible work (up to 90 % off), and Dedicated Hosts for licensing or compliance. <b>Elastic Load Balancing</b> spreads traffic across AZs while <b>EC2 Auto Scaling</b> adjusts capacity between a minimum and maximum, giving applications elasticity and high availability.</p>',
  takeaways: [
    'EC2 = IaaS virtual servers launched from AMIs; pick an instance family for the workload.',
    'Pricing: On-Demand, Savings Plans / RIs (≤ 72 %), Spot (≤ 90 %), Dedicated Hosts.',
    'ECS = AWS orchestrator, EKS = Kubernetes, Fargate = serverless containers, ECR = image registry.',
    'Lambda: event-driven, pay per request and ms, max 15 min, up to 10 GB memory.',
    'ALB (layer 7), NLB (layer 4), GWLB (appliances).',
    'Auto Scaling keeps capacity between min and max using target tracking, step, scheduled or predictive scaling.'
  ],
  sources: [
    ['Amazon EC2 instance types', 'https://aws.amazon.com/ec2/instance-types/'],
    ['Amazon EC2 pricing and purchasing options', 'https://aws.amazon.com/ec2/pricing/'],
    ['AWS Lambda quotas', 'https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html'],
    ['Elastic Load Balancing features', 'https://aws.amazon.com/elasticloadbalancing/features/'],
    ['Amazon EC2 Auto Scaling', 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html'],
    ['Containers on AWS', 'https://aws.amazon.com/containers/']
  ]
});
