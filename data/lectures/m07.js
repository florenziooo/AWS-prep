STRATUS.lecture({
  id: 'm7', num: 7, minutes: 45,
  tagline: 'Who is responsible for what, how identities and permissions work, and which AWS security service solves which problem.',
  subtitle: 'Security and Compliance is the <b>largest exam domain (30 %)</b>. This module goes deep on the <b>shared responsibility model</b>, <b>AWS IAM</b> (root user, users, groups, roles, policies, MFA, least privilege), multi-account governance with <b>AWS Organizations</b>, data protection with <b>AWS KMS</b> and encryption, the threat-detection and protection services (<b>Shield, WAF, GuardDuty, Inspector, Macie, Security Hub, Detective</b>), and where to find compliance evidence (<b>AWS Artifact</b>).',
  objectives: [
    'Apply the shared responsibility model to IaaS, PaaS and managed services.',
    'Protect the root user and list the tasks only the root user can perform.',
    'Distinguish IAM users, groups, roles and policies, and apply least privilege and MFA.',
    'Explain AWS Organizations, service control policies and IAM Identity Center.',
    'Describe encryption at rest and in transit with AWS KMS, CloudHSM and AWS Certificate Manager.',
    'Match AWS security services to threats: Shield, WAF, GuardDuty, Inspector, Macie, Security Hub, Detective.',
    'Find compliance reports with AWS Artifact and identify other security resources.'
  ],
  why: '<p>Domain 2 is <b>30 %</b> of the scored exam. Questions range from “who patches the guest OS on EC2?” to “which service detects malicious activity from CloudTrail and VPC Flow Logs?”. Learning one keyword per service wins most of these points.</p>',
  sections: [
    { id: 'eli5', title: 'Cloud security, explained simply', level: 'b', tags: 'security explained apartment landlord shared responsibility',
      html: `${K.eli5('<p>Renting a flat in a secure building: the <b>landlord (AWS)</b> guards the front entrance, maintains the walls, the wiring and the lifts. <b>You</b> decide who gets a key to your flat, lock your door, and keep your valuables in a safe. If you leave your door wide open, the landlord\'s security guard cannot help you.</p>')}
      ${K.recall('In one phrase each, what does AWS secure and what does the customer secure?', 'AWS secures the cloud itself (security OF the cloud); the customer secures what they put in it (security IN the cloud).')}` },
    { id: 'shared', title: 'The shared responsibility model in depth', level: 'b', tags: 'shared responsibility model of in customer aws inherited shared controls patch',
      html: `${K.stack([
        ['Customer data', 'you'], ['Platform, applications, identity & access management', 'you'], ['Operating system, network and firewall configuration', 'you', 'Customer (on EC2)'],
        ['Client-side encryption, server-side encryption, network traffic protection', 'you'],
        ['Compute · Storage · Database · Networking software', 'aws'], ['Hardware / AWS Global Infrastructure: Regions, AZs, edge locations', 'aws']
      ], 'The line moves up as services become more managed.')}
      ${K.table(['Service', 'AWS handles', 'Customer handles'], [
        ['Amazon EC2 (IaaS)', 'Hardware, hypervisor, physical security', 'Guest OS patches, installed software, security groups, data, IAM'],
        ['Amazon RDS (managed)', 'Hardware, OS, database engine patching, backups infrastructure', 'Database users and permissions, network access rules, data, encryption choice'],
        ['AWS Lambda / Amazon S3 (serverless)', 'Everything below your code or objects', 'Your code, IAM permissions, bucket policies, data classification']
      ])}
      <p><b>Shared controls</b> apply to both, in their own context: patch management (AWS patches infrastructure, you patch guest OS and apps), configuration management, and awareness and training. <b>Inherited controls</b> are fully AWS\'s, such as physical and environmental controls.</p>
      ${K.trap('“Who is responsible for patching the operating system of an EC2 instance?” → <b>the customer</b>. “…of an RDS database host?” → <b>AWS</b>.')}
      ${K.recall('Give one example of a shared control.', 'Patch management (or configuration management, or awareness and training): each party does it for its own layer.')}` },
    { id: 'root', title: 'Protecting the root user', level: 'b', tags: 'root user mfa access keys root-only tasks close account change support plan',
      html: `<p>The <b>root user</b> is the email address used to create the account and has <b>complete, unrestricted access</b>. Best practices:</p>
      <ul><li>Enable <b>MFA</b> on the root user immediately.</li><li>Do <b>not</b> create root access keys; delete any that exist.</li><li>Create administrative users (preferably through IAM Identity Center) for daily work and lock the root credentials away.</li></ul>
      ${K.table(['Tasks that require the root user (examples)'], [
        ['Change account settings such as the account name, email address and root password'], ['Close the AWS account'], ['Restore IAM user permissions if the only administrator locks themselves out'],
        ['Sign up for AWS GovCloud (US)'], ['Register as a seller in the Reserved Instance Marketplace'], ['Configure an S3 bucket to enable MFA Delete']
      ])}
      ${K.story('The leaked key', '<p>A student pushes code to a public Git repository with the root user\'s access key inside. Within an hour, bots launch dozens of crypto-mining instances. Had they used a least-privilege IAM role and no root keys, the damage would have been limited or impossible.</p>')}` },
    { id: 'iam', title: 'AWS IAM: users, groups, roles and policies', level: 'i', tags: 'iam user group role policy json least privilege mfa access keys password policy temporary credentials',
      html: `${K.table(['IAM element', 'What it is', 'Use for'], [
        ['User', 'An identity for one person or application with long-term credentials', 'Legacy or specific cases; prefer federation for people'],
        ['Group', 'A collection of users; attach policies once', 'Give all developers the same permissions'],
        ['Role', 'An identity with permissions that is <b>assumed</b> and gives <b>temporary credentials</b>', 'EC2 instances or Lambda calling AWS APIs; cross-account access; federated users'],
        ['Policy', 'JSON document that allows or denies actions on resources', 'Defining permissions; explicit deny always wins']
      ])}
      ${K.diagram(K.flow(['Request|“s3:GetObject”', 'Explicit Deny?|→ denied', '*Explicit Allow?|→ allowed', 'Otherwise|implicit deny']), 'IAM policy evaluation: an explicit deny always wins; without an explicit allow, access is denied by default.')}
      ${K.hook('<b>Users are people, groups are teams, roles are hats you put on for a while, policies are the rules written on the hat.</b>')}
      ${K.tip('Never store access keys on an EC2 instance. Attach an <b>IAM role</b> (instance profile) so the instance gets automatically rotated temporary credentials.')}
      <p><b>Least privilege</b>: grant only the permissions needed for the task. Tools that help: <b>IAM Access Analyzer</b> (finds resources shared outside your account and generates least-privilege policies) and the <b>IAM credential report</b> (lists users and the status of their passwords, access keys and MFA).</p>` },
    { id: 'multi-account', title: 'AWS Organizations, SCPs and IAM Identity Center', level: 'i', tags: 'organizations service control policy scp consolidated billing organizational unit iam identity center sso control tower',
      html: `${K.diagram(K.nest('region', 'AWS Organizations · management account', K.row(K.nest('az', 'OU: Production', K.box('Account: shop-prod') + '<div style="height:6px"></div>' + K.box('Account: data-prod')), K.nest('az', 'OU: Development', K.box('Account: dev-team-a') + '<div style="height:6px"></div>' + K.box('Account: sandbox', true)))), 'Accounts are grouped into organizational units (OUs); SCPs attached to an OU limit every account inside it.')}
      ${K.table(['Feature', 'Purpose'], [
        ['AWS Organizations', 'Centrally manage multiple accounts; consolidated billing; group accounts into OUs'],
        ['Service control policies (SCPs)', 'Set the <b>maximum</b> permissions for accounts in an OU (e.g. deny use of certain Regions). SCPs do not grant permissions.'],
        ['AWS IAM Identity Center', 'Single sign-on for workforce users across all accounts and business apps; connects to external identity providers'],
        ['AWS Control Tower', 'Sets up and governs a secure multi-account landing zone with guardrails'],
        ['Amazon Cognito', 'Sign-up and sign-in for <b>customers</b> of your web and mobile apps']
      ])}
      ${K.trap('SCPs restrict even the account\'s administrators (except the management account), but they never <i>grant</i> anything; IAM policies are still needed to allow actions.')}` },
    { id: 'encryption', title: 'Data protection and encryption', level: 'i', tags: 'kms cloudhsm encryption at rest in transit tls certificate manager secrets manager parameter store',
      html: `${K.table(['Service', 'Purpose'], [
        ['AWS Key Management Service (KMS)', 'Create and control encryption keys; integrated with S3, EBS, RDS and many more. Every key use can be logged by CloudTrail.'],
        ['AWS CloudHSM', 'Dedicated, single-tenant hardware security modules you control (FIPS 140 Level 3)'],
        ['AWS Certificate Manager (ACM)', 'Provision and renew TLS/SSL certificates for encryption in transit (load balancers, CloudFront)'],
        ['AWS Secrets Manager', 'Store and automatically rotate secrets such as database passwords and API keys'],
        ['AWS Systems Manager Parameter Store', 'Store configuration values and secrets (no built-in automatic rotation)']
      ])}
      <ul><li><b>Encryption at rest</b>: data stored on disk (S3 objects, EBS volumes, RDS storage), usually with KMS keys.</li><li><b>Encryption in transit</b>: data moving over the network, protected with TLS (HTTPS), VPN or MACsec.</li></ul>
      ${K.recall('Which service rotates a database password automatically?', 'AWS Secrets Manager.')}` },
    { id: 'detection', title: 'Threat protection and detection services', level: 'a', tags: 'shield waf guardduty inspector macie security hub detective firewall manager network firewall ddos',
      html: `${K.table(['Service', 'One-line job', 'Keyword'], [
        ['AWS Shield Standard', 'Automatic, free protection against common network-layer DDoS attacks', '“DDoS, no extra cost”'],
        ['AWS Shield Advanced', 'Paid enhanced DDoS protection, 24/7 Shield Response Team, cost protection', '“DDoS response team, cost protection”'],
        ['AWS WAF', 'Web application firewall filtering HTTP(S) requests (SQL injection, XSS, IP rate limits)', '“layer 7, SQL injection, cross-site scripting”'],
        ['Amazon GuardDuty', 'Intelligent threat detection from CloudTrail, VPC Flow Logs and DNS logs using ML', '“detect malicious activity, compromised instances”'],
        ['Amazon Inspector', 'Automated vulnerability scanning of EC2, container images and Lambda', '“CVEs, software vulnerabilities, network exposure”'],
        ['Amazon Macie', 'Discovers and protects sensitive data (PII) in S3 using ML', '“PII in S3 buckets”'],
        ['AWS Security Hub', 'Central dashboard aggregating findings and running best-practice checks', '“single view of security posture”'],
        ['Amazon Detective', 'Investigates and visualises the root cause of findings', '“investigate, root cause”'],
        ['AWS Firewall Manager', 'Centrally manage WAF, Shield and security group rules across accounts', '“manage firewall rules across the organization”'],
        ['AWS Network Firewall', 'Managed stateful network firewall for VPCs', '“filter VPC traffic, intrusion prevention”']
      ])}
      ${K.hook('<b>Guard-Duty is on guard duty</b> (watching logs for threats). <b>Inspector inspects</b> your software for holes. <b>Macie minds the PII.</b> <b>Detective investigates</b> after the alarm. <b>Shield blocks floods (DDoS); WAF filters web requests.</b>')}
      ${K.story('One incident, four services', '<p><b>GuardDuty</b> flags an EC2 instance talking to a known crypto-mining server. <b>Security Hub</b> shows the finding alongside others. The analyst opens <b>Detective</b> to trace which IAM role launched the instance. Afterwards, <b>Inspector</b> reveals the unpatched library the attacker exploited.</p>')}` },
    { id: 'compliance', title: 'Compliance and security resources', level: 'i', tags: 'artifact compliance reports soc pci iso hipaa audit manager config trust center knowledge center',
      html: `${K.table(['Resource', 'What you get'], [
        ['AWS Artifact', 'On-demand access to AWS compliance reports (SOC, PCI, ISO) and agreements such as the BAA'],
        ['AWS Audit Manager', 'Continuously collects evidence from your AWS usage to prepare for audits'],
        ['AWS Config', 'Records resource configurations and checks compliance against rules'],
        ['AWS Compliance Programs / Customer Compliance Center', 'Which programs AWS participates in and how customers achieve compliance'],
        ['AWS Security Blog, Knowledge Center, Trust & Safety team', 'Guidance; report abuse of AWS resources to the AWS Trust & Safety team'],
        ['AWS Marketplace', 'Third-party security products (firewalls, endpoint protection) you can buy and deploy']
      ])}
      ${K.tip('“Download AWS\'s SOC 2 or PCI DSS report for an auditor” → <b>AWS Artifact</b>.')}` }
  ],
  terms: [
    ['Shared responsibility model', 'AWS secures OF the cloud; customers secure IN the cloud', 'Landlord and tenant'],
    ['Root user', 'Account owner identity with unrestricted access', 'Master key to the building'],
    ['IAM role', 'Assumable identity giving temporary credentials', 'A hat you wear for a job'],
    ['IAM policy', 'JSON permissions; explicit deny wins', 'Rule book'],
    ['Least privilege', 'Grant only what is needed', 'Need-to-know'],
    ['MFA', 'Second factor on top of a password', 'Key plus fingerprint'],
    ['Service control policy', 'Maximum permissions for accounts in an OU', 'Company-wide rule that no manager can override'],
    ['IAM Identity Center', 'Workforce single sign-on across accounts', 'One badge for every building'],
    ['AWS KMS', 'Managed encryption keys', 'Key cabinet'],
    ['AWS Shield / WAF', 'DDoS protection / web request filtering', 'Flood wall / bouncer'],
    ['Amazon GuardDuty', 'Threat detection from logs', 'Security camera with AI'],
    ['AWS Artifact', 'AWS compliance reports on demand', 'Certificate filing cabinet']
  ],
  hooks: [
    '<b>OF vs IN</b>: AWS secures the hotel, you lock your room.',
    '<b>Users = people, groups = teams, roles = temporary hats, policies = rules.</b>',
    '<b>Guard-Duty guards, Inspector inspects, Macie minds PII, Detective investigates.</b>',
    '<b>Shield floods, WAF web.</b>'
  ],
  tips: [
    'Root user: enable MFA, no access keys, use only for root-only tasks such as closing the account.',
    'Applications on EC2 or Lambda calling AWS → IAM role, never embedded access keys.',
    '“Restrict which services or Regions any account in the organization can use” → SCP in AWS Organizations.',
    '“SQL injection / cross-site scripting” → AWS WAF. “DDoS” → AWS Shield.',
    '“Compliance report for auditors” → AWS Artifact. “Track configuration changes for compliance” → AWS Config.'
  ],
  traps: [
    'The customer patches the guest OS on EC2; AWS patches the host OS on RDS.',
    'Security groups and NACLs are configured by the customer even though AWS provides them.',
    'SCPs do not grant permissions.',
    'Shield Standard is free and automatic; Shield Advanced costs extra.',
    'Inspector finds vulnerabilities; GuardDuty finds threats in activity logs. Do not swap them.',
    'Cognito is for app customers; IAM Identity Center is for employees.'
  ],
  checks: [
    ['Under the shared responsibility model, who patches the guest operating system on an Amazon EC2 instance?', 'The customer', 'AWS', 'Both equally on alternating months', 'The internet service provider', 'EC2 is IaaS; the guest OS is the customer\'s responsibility.'],
    ['What should an EC2 application use to access S3 securely without stored credentials?', 'An IAM role', 'The root user access key', 'An IAM group', 'A security group', 'Roles provide temporary, automatically rotated credentials.'],
    ['Which service detects threats by analysing CloudTrail, VPC Flow Logs and DNS logs?', 'Amazon GuardDuty', 'Amazon Inspector', 'AWS Artifact', 'Amazon Macie', 'GuardDuty performs intelligent threat detection on account activity.'],
    ['Where can a customer download AWS SOC and PCI compliance reports?', 'AWS Artifact', 'AWS Config', 'AWS Trusted Advisor', 'Amazon Detective', 'Artifact provides on-demand access to AWS compliance reports.']
  ],
  summary: '<p>Security on AWS starts with the <b>shared responsibility model</b>: AWS secures the physical infrastructure and managed layers; customers secure their data, identities and configuration, with the boundary moving as services become more managed. Protect the <b>root user</b> with MFA and no access keys. Use <b>IAM</b> users, groups, roles and JSON policies to apply least privilege, with roles for temporary credentials. Govern many accounts with <b>Organizations</b> and SCPs, and give staff single sign-on with <b>IAM Identity Center</b>. Encrypt data with <b>KMS</b>, ACM and Secrets Manager. Defend and detect with <b>Shield</b> (DDoS), <b>WAF</b> (web attacks), <b>GuardDuty</b> (threats), <b>Inspector</b> (vulnerabilities), <b>Macie</b> (sensitive data), <b>Security Hub</b> (central view) and <b>Detective</b> (investigation), and prove compliance with <b>AWS Artifact</b>.</p>',
  takeaways: [
    'AWS: security OF the cloud. Customer: security IN the cloud. EC2 guest OS = customer.',
    'Root user: MFA on, no access keys, root-only tasks only.',
    'IAM: users, groups, roles (temporary credentials), policies (explicit deny wins), least privilege.',
    'Organizations + SCPs set guardrails; IAM Identity Center provides workforce SSO.',
    'KMS for keys, ACM for TLS certificates, Secrets Manager for rotating secrets.',
    'Shield, WAF, GuardDuty, Inspector, Macie, Security Hub, Detective; Artifact for compliance reports.'
  ],
  sources: [
    ['Shared Responsibility Model', 'https://aws.amazon.com/compliance/shared-responsibility-model/'],
    ['Tasks that require root user credentials', 'https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-tasks.html'],
    ['Security best practices in IAM', 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html'],
    ['Service control policies', 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html'],
    ['AWS security services', 'https://aws.amazon.com/products/security/'],
    ['AWS Artifact', 'https://aws.amazon.com/artifact/']
  ]
});
