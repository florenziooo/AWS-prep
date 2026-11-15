STRATUS.lecture({
  id: 'm5', num: 5, minutes: 40,
  tagline: 'Your private network in the cloud, how traffic gets in and out safely, and how content reaches users fast.',
  subtitle: 'Every AWS workload sits on a network. This module covers <b>Amazon VPC</b> (subnets, route tables, gateways), the two firewalls (<b>security groups</b> and <b>network ACLs</b>), ways to connect on-premises networks (<b>Site-to-Site VPN</b>, <b>Direct Connect</b>, <b>Transit Gateway</b>), and the services that deliver content and route users globally: <b>Route 53</b>, <b>CloudFront</b> and <b>Global Accelerator</b>.',
  objectives: [
    'Describe a VPC, public and private subnets, route tables and gateways.',
    'Compare security groups (stateful, instance level) with network ACLs (stateless, subnet level).',
    'Choose between Site-to-Site VPN, Client VPN, Direct Connect and Transit Gateway.',
    'Explain Amazon Route 53 and its routing policies.',
    'Explain how Amazon CloudFront and AWS Global Accelerator improve performance.',
    'Recognise VPC endpoints and VPC peering use cases.'
  ],
  why: '<p>Networking is task statement 3.5, and security groups versus network ACLs is one of the most frequently tested comparisons (task 2.4 as well). Expect scenarios about private connections from a data center, DNS, and lowering global latency.</p>',
  sections: [
    { id: 'eli5', title: 'Networking, explained simply', level: 'b', tags: 'networking explained analogy',
      html: `${K.eli5('<p>A <b>VPC</b> is your own gated neighbourhood inside the AWS city. <b>Subnets</b> are streets: some face the main road (public), some are quiet back streets with no outside entrance (private). The <b>internet gateway</b> is the main gate. <b>Security groups</b> are the locks on each house\'s door; <b>network ACLs</b> are the guards at the entrance of each street.</p>')}
      ${K.recall('In the neighbourhood analogy, what is a private subnet?', 'A back street with no direct route to or from the internet: resources there are not reachable from the internet.')}` },
    { id: 'vpc', title: 'Amazon VPC building blocks', level: 'b', tags: 'vpc subnet public private route table internet gateway nat gateway cidr',
      html: `<p><b>Amazon Virtual Private Cloud (VPC)</b> is a logically isolated section of the AWS Cloud where you launch resources in a network you define (IP range, subnets, routing, gateways). A VPC spans all AZs in one Region; each <b>subnet</b> lives in exactly one AZ.</p>
      ${K.table(['Component', 'Purpose'], [
        ['Subnet', 'A range of IP addresses in one AZ'],
        ['Public subnet', 'Has a route to an internet gateway; for load balancers, bastion hosts, public web servers'],
        ['Private subnet', 'No direct route to the internet; for databases and application servers'],
        ['Route table', 'Rules that decide where network traffic from a subnet is sent'],
        ['Internet gateway (IGW)', 'Lets resources in public subnets reach and be reached from the internet'],
        ['NAT gateway', 'Lets instances in private subnets start outbound connections (e.g. updates) while blocking inbound connections from the internet'],
        ['Virtual private gateway', 'The VPN endpoint on the AWS side of a Site-to-Site VPN']
      ])}
      ${K.diagram(K.nest('region', 'VPC 10.0.0.0/16 (one Region)', K.row(K.nest('az', 'AZ a', K.box('Public subnet · load balancer', true) + '<div style="height:6px"></div>' + K.box('Private subnet · app + DB')), K.nest('az', 'AZ b', K.box('Public subnet · NAT gateway', true) + '<div style="height:6px"></div>' + K.box('Private subnet · app + DB')))) + '<div style="height:10px"></div>' + K.row(K.box('Internet gateway', true)), 'A classic two-tier VPC: public subnets face the internet; private subnets reach out only through the NAT gateway.')}
      ${K.trap('A NAT gateway allows <b>outbound</b> internet access from private subnets. It does not make private instances reachable from the internet.')}` },
    { id: 'sg-nacl', title: 'Security groups vs network ACLs', level: 'i', tags: 'security group network acl nacl stateful stateless allow deny instance subnet',
      html: `${K.table(['', 'Security group', 'Network ACL'], [
        ['Applies to', 'Instance (elastic network interface)', 'Subnet'],
        ['State', '<b>Stateful</b>: return traffic is automatically allowed', '<b>Stateless</b>: return traffic must be explicitly allowed'],
        ['Rules', 'Allow rules only', 'Allow and deny rules'],
        ['Evaluation', 'All rules evaluated together', 'Rules evaluated in number order, first match wins'],
        ['Default', 'Denies all inbound, allows all outbound', 'Default NACL allows all inbound and outbound']
      ])}
      ${K.hook('<b>“Security groups Stay, NACLs Need”</b>: security groups are <b>S</b>tateful and remember replies; NACLs are stateless and <b>N</b>eed a rule for the return trip. And: <b>only a NACL can say “Deny”</b>.')}
      ${K.story('Blocking a bad IP', '<p>A web shop sees a flood of requests from one IP address. Security groups cannot say “deny”, so the engineer adds a <b>deny rule in the network ACL</b> of the public subnet to block that address. (For application-layer attacks, AWS WAF would be the next step.)</p>')}
      ${K.recall('You need to explicitly block traffic from a specific IP range to a whole subnet. Which control do you use?', 'A network ACL deny rule. Security groups only support allow rules.')}` },
    { id: 'hybrid', title: 'Connecting to on-premises and other VPCs', level: 'i', tags: 'site-to-site vpn client vpn direct connect transit gateway vpc peering privatelink endpoint',
      html: `${K.table(['Option', 'What it is', 'Pick it when'], [
        ['AWS Site-to-Site VPN', 'Encrypted IPsec tunnel over the public internet between your network and a VPC', 'Quick, low-cost, encrypted hybrid link'],
        ['AWS Client VPN', 'Managed VPN for individual users\' devices', 'Remote employees need secure access to AWS or on-premises'],
        ['AWS Direct Connect', 'Dedicated private physical connection from your data center to AWS', 'Consistent performance, high bandwidth, lower data-transfer cost, not over the internet'],
        ['VPC peering', 'Private connection between two VPCs', 'A few VPCs need to talk directly (not transitive)'],
        ['AWS Transit Gateway', 'A central hub connecting many VPCs and on-premises networks', 'Dozens of VPCs and VPNs; avoid a mesh of peerings'],
        ['VPC endpoints / AWS PrivateLink', 'Private access to AWS services (e.g. S3, DynamoDB) or partner services without the internet', 'Traffic must not leave the AWS network']
      ])}
      ${K.tip('“Dedicated”, “private”, “consistent network performance” → <b>Direct Connect</b>. “Encrypted over the internet, set up quickly” → <b>Site-to-Site VPN</b>. Many companies use VPN as a backup for Direct Connect.')}
      ${K.trap('Direct Connect is private but <b>not encrypted by default</b>. If encryption is required, run a VPN over it or use MACsec.')}` },
    { id: 'route53', title: 'Amazon Route 53 (DNS)', level: 'i', tags: 'route 53 dns domain registration routing policy latency geolocation failover weighted health check',
      html: `<p><b>Amazon Route 53</b> is a highly available, scalable DNS service. It registers domain names, translates names such as <code>example.com</code> into IP addresses, and checks the health of endpoints.</p>
      ${K.table(['Routing policy', 'Behaviour', 'Example'], [
        ['Simple', 'One record, one resource', 'A single web server'],
        ['Weighted', 'Split traffic by percentages', 'Send 10 % to a new version (canary)'],
        ['Latency-based', 'Send users to the Region with the lowest latency for them', 'Global app in three Regions'],
        ['Failover', 'Route to a standby when health checks fail', 'Active-passive DR'],
        ['Geolocation', 'Route by the user\'s location (country/continent)', 'Show German content to users in Germany'],
        ['Geoproximity', 'Route by distance, with adjustable bias', 'Shift more traffic to one Region'],
        ['Multivalue answer', 'Return several healthy records', 'Simple client-side load spreading']
      ])}
      ${K.recall('Which Route 53 routing policy sends users to a standby site only when the primary fails its health check?', 'Failover routing.')}` },
    { id: 'edge-delivery', title: 'CloudFront and Global Accelerator', level: 'a', tags: 'cloudfront cdn edge cache origin global accelerator anycast static ip',
      html: `${K.diagram(K.flow(['User in Paris', '*CloudFront edge|Paris (cache hit?)', 'Regional edge cache', 'Origin|S3 or ALB in us-east-1']), 'CloudFront serves cached copies from the nearest edge; only cache misses travel to the origin.')}
      ${K.table(['', 'Amazon CloudFront', 'AWS Global Accelerator'], [
        ['What', 'Content delivery network (CDN) that caches content at edge locations', 'Routes traffic over the AWS global network using two static anycast IP addresses'],
        ['Best for', 'Websites, images, video, APIs, downloads (HTTP/HTTPS)', 'TCP/UDP apps such as gaming, IoT, VoIP; fast Regional failover'],
        ['Caching', 'Yes', 'No: it optimises the path, it does not cache'],
        ['Security', 'Integrates with AWS WAF, Shield and TLS certificates', 'Integrates with Shield']
      ])}
      ${K.tip('“Cache static and dynamic content close to users worldwide” → <b>CloudFront</b>. “Static IP addresses and fast failover for a non-HTTP global app” → <b>Global Accelerator</b>.')}` }
  ],
  terms: [
    ['Amazon VPC', 'Logically isolated virtual network in one Region', 'Gated neighbourhood'],
    ['Subnet', 'IP range within one AZ; public or private', 'A street'],
    ['Internet gateway', 'Connects a VPC to the internet', 'Main gate'],
    ['NAT gateway', 'Outbound-only internet for private subnets', 'One-way door'],
    ['Security group', 'Stateful instance-level firewall, allow rules only', 'Lock on your front door'],
    ['Network ACL', 'Stateless subnet-level firewall with allow and deny', 'Guard at the street entrance'],
    ['Direct Connect', 'Dedicated private line from your data center to AWS', 'Private road'],
    ['Site-to-Site VPN', 'Encrypted tunnel over the internet', 'Armoured car on a public road'],
    ['Transit Gateway', 'Hub connecting many VPCs and networks', 'Airport hub'],
    ['Route 53', 'DNS, domain registration and health checks', 'Phone book'],
    ['CloudFront', 'CDN caching content at edge locations', 'Local warehouse'],
    ['Global Accelerator', 'Static anycast IPs routed over the AWS backbone', 'Express lane']
  ],
  hooks: [
    '<b>Security groups Stay (stateful); NACLs Need return rules (stateless).</b>',
    '<b>Only NACLs can Deny.</b>',
    '<b>Direct Connect = Dedicated; VPN = Virtual (over the internet).</b>',
    '<b>CloudFront caches; Global Accelerator accelerates.</b>'
  ],
  tips: [
    'Databases belong in <b>private subnets</b>; load balancers in public subnets.',
    '“Private instances need to download patches but must not be reachable” → NAT gateway.',
    '“Connect 50 VPCs and on-premises networks” → Transit Gateway.',
    '“Access S3 from a VPC without using the internet” → VPC gateway endpoint.',
    '“Route users to the Region that gives them the lowest latency” → Route 53 latency-based routing.'
  ],
  traps: [
    'Security groups have no deny rules.',
    'NACLs are stateless: allowing inbound port 443 is not enough; the outbound ephemeral-port response must also be allowed.',
    'VPC peering is not transitive: A↔B and B↔C does not give A↔C.',
    'Direct Connect is not encrypted by default.',
    'A VPC belongs to one Region; subnets belong to one AZ.'
  ],
  checks: [
    ['Which firewall is stateful and applied at the instance level?', 'Security group', 'Network ACL', 'Route table', 'Internet gateway', 'Security groups are stateful and attach to instances (network interfaces).'],
    ['Which service gives a dedicated, private network connection from a data center to AWS?', 'AWS Direct Connect', 'AWS Site-to-Site VPN', 'Amazon CloudFront', 'Internet gateway', 'Direct Connect is a dedicated private connection that does not traverse the internet.'],
    ['What lets instances in a private subnet download software updates from the internet without being reachable from it?', 'NAT gateway', 'Internet gateway attached to the private subnet', 'VPC peering', 'Amazon Route 53', 'A NAT gateway allows outbound-only connections.'],
    ['Which service is a content delivery network that caches content at edge locations?', 'Amazon CloudFront', 'AWS Global Accelerator', 'AWS Transit Gateway', 'Amazon VPC', 'CloudFront is AWS\'s CDN.']
  ],
  summary: '<p>An <b>Amazon VPC</b> is your isolated network in a Region, divided into public subnets (routed to an internet gateway) and private subnets (outbound only through a NAT gateway). Two firewalls protect it: stateful, allow-only <b>security groups</b> at the instance and stateless, allow-and-deny <b>network ACLs</b> at the subnet. On-premises networks connect over an encrypted <b>Site-to-Site VPN</b> or a dedicated <b>Direct Connect</b> line, and many networks join through a <b>Transit Gateway</b>. <b>Route 53</b> provides DNS with routing policies and health checks, <b>CloudFront</b> caches content at the edge, and <b>Global Accelerator</b> speeds traffic over the AWS backbone.</p>',
  takeaways: [
    'VPC = one Region; subnet = one AZ; public subnets route to an IGW.',
    'NAT gateway = outbound-only internet for private subnets.',
    'Security groups: stateful, instance level, allow only. NACLs: stateless, subnet level, allow and deny.',
    'VPN = encrypted over the internet; Direct Connect = dedicated private line; Transit Gateway = hub.',
    'Route 53 routing: simple, weighted, latency, failover, geolocation, geoproximity, multivalue.',
    'CloudFront caches content; Global Accelerator routes over the AWS network with static IPs.'
  ],
  sources: [
    ['What is Amazon VPC?', 'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html'],
    ['Compare security groups and network ACLs', 'https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html'],
    ['AWS Direct Connect', 'https://aws.amazon.com/directconnect/'],
    ['Amazon Route 53 routing policies', 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html'],
    ['Amazon CloudFront', 'https://aws.amazon.com/cloudfront/'],
    ['AWS Global Accelerator', 'https://aws.amazon.com/global-accelerator/']
  ]
});
