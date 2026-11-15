STRATUS.lecture({
  id: 'm8', num: 8, minutes: 35,
  tagline: 'Watching, auditing, automating and governing your AWS environment, and the developer tools that ship code to it.',
  subtitle: 'Once workloads run, you must <b>observe</b> them (Amazon CloudWatch, AWS X-Ray), <b>audit</b> who did what (AWS CloudTrail) and what changed (AWS Config), <b>operate</b> fleets (AWS Systems Manager), <b>provision</b> consistently (AWS CloudFormation, AWS CDK), get <b>advice</b> (AWS Trusted Advisor, AWS Health Dashboard, Compute Optimizer), and <b>govern</b> many accounts (AWS Control Tower, Service Catalog, License Manager). The module ends with the CI/CD developer tools.',
  objectives: [
    'Distinguish CloudWatch (performance), CloudTrail (API activity) and Config (configuration history).',
    'Describe CloudWatch metrics, alarms, logs and dashboards.',
    'Explain AWS Systems Manager capabilities such as Session Manager and Patch Manager.',
    'Describe infrastructure as code with CloudFormation and AWS CDK.',
    'Identify Trusted Advisor check categories and the AWS Health Dashboard.',
    'Recognise governance services (Control Tower, Service Catalog, License Manager) and developer tools (CodeBuild, CodePipeline, CodeDeploy, X-Ray).'
  ],
  why: '<p>These services appear in task 2.2 (governance and auditing), 3.1 (deployment and operations) and 4.3 (Trusted Advisor). The classic trap is mixing up <b>CloudWatch</b>, <b>CloudTrail</b> and <b>Config</b>, which the exam tests repeatedly.</p>',
  sections: [
    { id: 'eli5', title: 'Monitoring and auditing, explained simply', level: 'b', tags: 'monitoring auditing explained analogy',
      html: `${K.eli5('<p>Imagine running a shop. <b>CloudWatch</b> is the dashboard of gauges: how many customers, how warm the freezer is, with an alarm bell if it gets too warm. <b>CloudTrail</b> is the CCTV recording of who opened which door and when. <b>Config</b> is the inventory notebook recording what the shop looked like each day, so you can say “the alarm system was switched off on Tuesday”.</p>')}
      ${K.table(['Service', 'Answers the question', 'Example'], [
        ['Amazon CloudWatch', '“How is it performing?”', 'CPU at 90 %, alarm triggers scaling'],
        ['AWS CloudTrail', '“Who did what, when, from where?”', 'User alice deleted bucket X at 14:02 from IP 1.2.3.4'],
        ['AWS Config', '“What did my resource look like, and is it compliant?”', 'Security group opened port 22 to the world on Tuesday; flagged as non-compliant']
      ])}
      ${K.hook('<b>Watch, Trail, Config</b>: Cloud<b>Watch</b> watches performance; Cloud<b>Trail</b> follows the trail of API calls (users); <b>Config</b> keeps the configuration history (resources).')}
      ${K.recall('Which service tells you which IAM user terminated an EC2 instance?', 'AWS CloudTrail.')}` },
    { id: 'cloudwatch', title: 'Amazon CloudWatch', level: 'b', tags: 'cloudwatch metrics alarms logs dashboards events application signals',
      html: `<ul><li><b>Metrics</b>: numerical data points over time, such as EC2 CPUUtilization or S3 bucket size. Custom metrics can come from your app.</li><li><b>Alarms</b>: watch a metric and act when it crosses a threshold: send an SNS notification, trigger Auto Scaling, or stop/reboot an instance.</li><li><b>Logs</b>: collect, search and retain logs from applications, Lambda, VPC Flow Logs and more.</li><li><b>Dashboards</b>: custom visual views of metrics across Regions.</li></ul>
      ${K.diagram(K.flow(['EC2 CPU metric', '*CloudWatch alarm|CPU &gt; 80 % for 5 min', 'SNS email to on-call|+ Auto Scaling adds instance']), 'A metric breaches its threshold; the alarm notifies people and triggers automation.')}
      ${K.tip('Memory usage and disk space inside an EC2 instance are <b>not</b> default metrics; install the CloudWatch agent to collect them.')}
      ${K.tip('Billing alarms are CloudWatch alarms on the estimated-charges metric; AWS Budgets is the more flexible tool (Module 9).')}` },
    { id: 'audit', title: 'AWS CloudTrail and AWS Config', level: 'i', tags: 'cloudtrail api calls event history trail s3 config rules conformance packs compliance configuration history',
      html: `${K.table(['', 'AWS CloudTrail', 'AWS Config'], [
        ['Records', 'API calls and account activity (console, CLI, SDK)', 'Resource configurations and their changes over time'],
        ['Focus', 'Who, what, when, where', 'What state a resource was in, and whether it complies with rules'],
        ['Default', 'Event history of the last 90 days of management events, on by default', 'Must be turned on; pay per configuration item and rule evaluation'],
        ['Long-term', 'Create a trail to deliver logs to S3 (and CloudWatch Logs)', 'Configuration history in S3; managed and custom rules; conformance packs'],
        ['Typical question', '“Find who deleted the database”', '“Ensure all S3 buckets stay encrypted; alert when one is not”']
      ])}
      ${K.story('The open port', '<p>On Wednesday the security team sees an alert: a security group allows SSH from anywhere. <b>AWS Config</b> shows the rule changed on Tuesday at 18:40 and marks it non-compliant. <b>CloudTrail</b> shows the change was made by the role used by a contractor\'s script. <b>CloudWatch</b> shows CPU spiked on the instance soon after. Three services, three different answers.</p>')}
      ${K.trap('CloudTrail is not a performance monitor, and CloudWatch is not an audit log of user actions.')}` },
    { id: 'ssm', title: 'AWS Systems Manager', level: 'i', tags: 'systems manager session manager patch manager run command parameter store inventory automation',
      html: `<p><b>AWS Systems Manager</b> is an operations hub for managing EC2 instances and on-premises servers at scale.</p>
      ${K.table(['Capability', 'What it does'], [
        ['Session Manager', 'Secure shell or PowerShell access to instances through the console, with no open inbound ports, bastion hosts or SSH keys, and full logging'],
        ['Patch Manager', 'Automates OS and software patching across fleets'],
        ['Run Command', 'Run scripts or commands on many instances at once'],
        ['Parameter Store', 'Store configuration data and secrets hierarchically'],
        ['Inventory', 'Collect software and configuration information from managed nodes'],
        ['Automation', 'Runbooks for common maintenance and remediation tasks']
      ])}
      ${K.recall('Which capability gives administrators shell access to instances without opening port 22?', 'Systems Manager Session Manager.')}` },
    { id: 'iac', title: 'Provisioning: CloudFormation, CDK and Elastic Beanstalk', level: 'i', tags: 'cloudformation template stack cdk infrastructure as code',
      html: `${K.table(['Tool', 'How you describe infrastructure', 'Use when'], [
        ['AWS CloudFormation', 'JSON or YAML templates create <b>stacks</b> of resources', 'Repeatable, version-controlled environments in any Region or account'],
        ['AWS CDK (Cloud Development Kit)', 'Familiar programming languages (TypeScript, Python, Java…) that synthesise CloudFormation', 'Developers who prefer code and loops to YAML'],
        ['AWS Elastic Beanstalk', 'Upload app code; Beanstalk provisions the stack', 'Simple web apps, PaaS experience']
      ])}
      ${K.diagram(K.flow(['template.yaml|in Git', '*CloudFormation', 'Stack: VPC + ALB + EC2 + RDS|dev', 'Same stack|prod, other Region']), 'Infrastructure as code: one template, identical environments everywhere.')}
      ${K.tip('“Deploy identical environments repeatedly and consistently” or “treat infrastructure as code” → <b>CloudFormation</b>.')}` },
    { id: 'advice', title: 'Advice and health: Trusted Advisor, Health Dashboard, Compute Optimizer', level: 'i', tags: 'trusted advisor checks cost optimization performance security fault tolerance service limits operational excellence health dashboard compute optimizer',
      html: `<p><b>AWS Trusted Advisor</b> inspects your account and recommends improvements in categories:</p>
      ${K.table(['Category', 'Example check'], [
        ['Cost optimization', 'Idle load balancers, underused EC2 instances, unassociated Elastic IPs'],
        ['Performance', 'Over-utilised instances, CloudFront configuration'],
        ['Security', 'Root MFA off, S3 buckets with open access, security groups with unrestricted ports'],
        ['Fault tolerance', 'EBS snapshots missing, single-AZ resources'],
        ['Service quotas (limits)', 'Usage above 80 % of a service quota'],
        ['Operational excellence', 'Operational best practices']
      ])}
      ${K.fix('<p>Basic and Developer support customers get a limited set of core Trusted Advisor checks (security and service quotas). The full set of checks comes with Business-level support and above (Module 9).</p>')}
      ${K.table(['Service', 'Purpose'], [
        ['AWS Health Dashboard', 'Shows the status of AWS services and, in your account view, events that affect <b>your</b> resources (e.g. scheduled maintenance). It replaces the former Service Health Dashboard and Personal Health Dashboard.'],
        ['AWS Compute Optimizer', 'Uses machine learning on utilisation metrics to recommend right-sized EC2, EBS, Lambda and more']
      ])}
      ${K.hook('<b>Trusted Advisor checks “Cheap, Speedy, Safe, Sturdy, Scaled, Smooth”</b>: cost, performance, security, fault tolerance, service quotas, operational excellence.')}` },
    { id: 'governance-dev', title: 'Governance at scale and developer tools', level: 'a', tags: 'control tower landing zone service catalog license manager resource groups tags codecommit codebuild codedeploy codepipeline x-ray cloud9 cloudshell',
      html: `${K.table(['Governance service', 'Purpose'], [
        ['AWS Control Tower', 'Set up and govern a secure multi-account environment (landing zone) with preventive and detective guardrails'],
        ['AWS Service Catalog', 'Publish approved, pre-configured products (CloudFormation templates) that users can launch self-service'],
        ['AWS License Manager', 'Track and enforce software licence usage (Microsoft, Oracle…) across AWS and on-premises'],
        ['Tags and Resource Groups', 'Label resources (owner, project, environment) for organisation, automation and cost allocation'],
        ['AWS Resource Access Manager (RAM)', 'Share resources such as subnets or Transit Gateways across accounts']
      ])}
      ${K.table(['Developer tool', 'Stage of CI/CD'], [
        ['AWS CodeBuild', '<b>Build</b> and test code (compiles, runs tests, produces artifacts)'],
        ['AWS CodeDeploy', '<b>Deploy</b> to EC2, on-premises servers, Lambda or ECS'],
        ['AWS CodePipeline', '<b>Orchestrate</b> the whole release pipeline: source → build → test → deploy'],
        ['AWS CodeArtifact', 'Store software packages'],
        ['AWS X-Ray', '<b>Trace</b> requests through distributed applications to find bottlenecks and errors'],
        ['AWS CloudShell', 'Browser-based shell with the AWS CLI pre-authenticated']
      ])}
      ${K.diagram(K.flow(['Git push|source', '*CodePipeline', 'CodeBuild|build & test', 'CodeDeploy|release', 'X-Ray|trace in production']), 'A CI/CD pipeline on AWS.')}
      ${K.recall('Which service publishes a catalogue of approved CloudFormation-based products that employees can launch themselves?', 'AWS Service Catalog.')}` }
  ],
  terms: [
    ['Amazon CloudWatch', 'Metrics, alarms, logs and dashboards', 'Car dashboard'],
    ['AWS CloudTrail', 'Record of API calls: who did what, when', 'CCTV recording'],
    ['AWS Config', 'Configuration history and compliance rules', 'Daily inventory notebook'],
    ['AWS Systems Manager', 'Operate fleets: Session Manager, Patch Manager, Run Command', 'Remote control'],
    ['AWS CloudFormation', 'Infrastructure as code with templates and stacks', 'Blueprint'],
    ['AWS CDK', 'Infrastructure as code in programming languages', 'Blueprint written in code'],
    ['AWS Trusted Advisor', 'Best-practice checks across cost, performance, security, fault tolerance, quotas', 'Home inspector'],
    ['AWS Health Dashboard', 'AWS service status and events affecting your resources', 'Weather alerts for your street'],
    ['AWS Control Tower', 'Multi-account landing zone with guardrails', 'Air-traffic control'],
    ['AWS Service Catalog', 'Approved products for self-service', 'Company app store'],
    ['AWS X-Ray', 'Distributed tracing', 'GPS tracker for each request']
  ],
  hooks: [
    '<b>CloudWatch = performance; CloudTrail = people\'s actions; Config = configuration.</b>',
    '<b>Session Manager = SSH without the open door.</b>',
    '<b>CodeBuild builds, CodeDeploy deploys, CodePipeline pipes them together.</b>',
    '<b>Trusted Advisor: Cost, Performance, Security, Fault tolerance, Quotas, Ops.</b>'
  ],
  tips: [
    '“Who made this API call?” → CloudTrail. “Alert when CPU exceeds 80 %” → CloudWatch alarm. “Was this resource compliant last week?” → Config.',
    '“Repeatable infrastructure from a template” → CloudFormation.',
    '“Is an AWS outage affecting my resources?” → AWS Health Dashboard.',
    '“Recommendations to reduce cost and improve security across the account” → Trusted Advisor.',
    '“Set up a governed multi-account environment quickly” → Control Tower.'
  ],
  traps: [
    'CloudTrail event history covers 90 days of management events; for longer retention create a trail to S3.',
    'EC2 memory utilisation needs the CloudWatch agent.',
    'Config is not on by default and is not free.',
    'Trusted Advisor gives advice; it does not change resources for you.',
    'The old “Service Health Dashboard” and “Personal Health Dashboard” are now the AWS Health Dashboard.'
  ],
  checks: [
    ['Which service records API calls made in an AWS account for auditing?', 'AWS CloudTrail', 'Amazon CloudWatch', 'AWS Config', 'AWS X-Ray', 'CloudTrail logs who made which API call, when and from where.'],
    ['Which service triggers an alarm when EC2 CPU utilisation exceeds a threshold?', 'Amazon CloudWatch', 'AWS CloudTrail', 'AWS Artifact', 'AWS Service Catalog', 'CloudWatch alarms watch metrics and act on thresholds.'],
    ['Which service provisions resources from JSON or YAML templates?', 'AWS CloudFormation', 'AWS Config', 'AWS Systems Manager Session Manager', 'AWS Health Dashboard', 'CloudFormation implements infrastructure as code with templates and stacks.'],
    ['Which service gives recommendations across cost optimization, security, performance, fault tolerance and service quotas?', 'AWS Trusted Advisor', 'Amazon Inspector', 'AWS CodePipeline', 'AWS License Manager', 'Trusted Advisor runs best-practice checks across these categories.']
  ],
  summary: '<p>Operating on AWS means <b>observing</b> with CloudWatch (metrics, alarms, logs, dashboards) and X-Ray (traces), <b>auditing</b> with CloudTrail (API activity) and Config (configuration history and compliance), and <b>operating</b> fleets with Systems Manager. <b>CloudFormation</b> and the <b>CDK</b> turn infrastructure into repeatable code. <b>Trusted Advisor</b>, the <b>AWS Health Dashboard</b> and <b>Compute Optimizer</b> give advice and status. At scale, <b>Control Tower</b>, <b>Service Catalog</b>, <b>License Manager</b> and tagging enforce governance, while <b>CodeBuild</b>, <b>CodeDeploy</b> and <b>CodePipeline</b> automate releases.</p>',
  takeaways: [
    'CloudWatch = metrics, alarms, logs, dashboards.',
    'CloudTrail = API activity log; Config = configuration history and rules.',
    'Systems Manager = Session Manager, Patch Manager, Run Command, Parameter Store.',
    'CloudFormation / CDK = infrastructure as code.',
    'Trusted Advisor = best-practice checks; Health Dashboard = AWS events affecting you.',
    'Control Tower, Service Catalog, License Manager for governance; CodePipeline/Build/Deploy for CI/CD.'
  ],
  sources: [
    ['Amazon CloudWatch', 'https://aws.amazon.com/cloudwatch/'],
    ['AWS CloudTrail', 'https://aws.amazon.com/cloudtrail/'],
    ['AWS Config', 'https://aws.amazon.com/config/'],
    ['AWS Systems Manager', 'https://aws.amazon.com/systems-manager/'],
    ['AWS Trusted Advisor checks', 'https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html'],
    ['AWS Health Dashboard', 'https://docs.aws.amazon.com/health/latest/ug/aws-health-dashboard-status.html'],
    ['AWS Control Tower', 'https://aws.amazon.com/controltower/']
  ]
});
