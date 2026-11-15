STRATUS.lecture({
  id: 'm4', num: 4, minutes: 35,
  tagline: 'Object, block and file storage on AWS, plus the tools for backup, hybrid storage and moving huge data sets.',
  subtitle: 'AWS offers three kinds of storage: <b>object</b> (Amazon S3), <b>block</b> (Amazon EBS and instance store) and <b>file</b> (Amazon EFS and Amazon FSx). This module explains each, the S3 storage classes and lifecycle rules that cut cost, and the supporting services: <b>AWS Storage Gateway</b>, <b>AWS Backup</b> and the <b>AWS Snow Family</b>.',
  objectives: [
    'Distinguish object, block and file storage.',
    'Describe Amazon S3 buckets, objects, durability and key features (versioning, replication, encryption).',
    'Choose the right S3 storage class and use lifecycle policies to move data automatically.',
    'Compare Amazon EBS with EC2 instance store, and describe EBS snapshots.',
    'Describe Amazon EFS and Amazon FSx use cases.',
    'Explain AWS Storage Gateway, AWS Backup and the AWS Snow Family.'
  ],
  why: '<p>Storage is task statement 3.6. Typical questions: “cheapest storage for data accessed once a year”, “shared file system for many Linux instances”, “block storage that persists after an instance stops”, or “move 500 TB with a slow internet connection”.</p>',
  sections: [
    { id: 'eli5', title: 'Storage types, explained simply', level: 'b', tags: 'object block file storage explained',
      html: `${K.eli5('<p><b>Block storage</b> is like a hard drive inside your computer: fast, and attached to one machine. <b>File storage</b> is like a shared network folder in an office: many people open the same files. <b>Object storage</b> is like a giant coat-check: you hand over a whole item, get a ticket (the key), and can retrieve it from anywhere, but you replace the whole coat rather than editing a sleeve.</p>')}
      ${K.table(['Type', 'AWS services', 'Access', 'Typical use'], [
        ['Block', 'Amazon EBS, instance store', 'Attached to an EC2 instance like a disk', 'Operating systems, databases'],
        ['File', 'Amazon EFS, Amazon FSx', 'Shared by many instances over a network file protocol', 'Shared content, home directories, lift-and-shift apps'],
        ['Object', 'Amazon S3, S3 Glacier storage classes', 'Over HTTP(S) via API, URL or console', 'Backups, media, static websites, data lakes']
      ])}
      ${K.recall('An application needs a disk for its operating system and database on one EC2 instance. Which storage type is that?', 'Block storage, for example an Amazon EBS volume.')}` },
    { id: 's3', title: 'Amazon S3 fundamentals', level: 'b', tags: 's3 bucket object key durability 11 nines versioning static website encryption replication',
      html: `<p><b>Amazon Simple Storage Service (S3)</b> stores <b>objects</b> (files plus metadata) in <b>buckets</b>. Bucket names are globally unique; each bucket lives in one Region you choose. A single object can be up to <b>5 TB</b>, and total storage is virtually unlimited.</p>
      <ul><li><b>Durability</b>: designed for <b>99.999999999 % (11 nines)</b>, because objects are stored redundantly across multiple AZs (for most classes).</li><li><b>Versioning</b>: keeps every version of an object, protecting against accidental overwrite or deletion.</li><li><b>Replication</b>: Cross-Region Replication (CRR) or Same-Region Replication (SRR) copies objects automatically.</li><li><b>Encryption</b>: new objects are encrypted at rest by default (SSE-S3); you can choose SSE-KMS.</li><li><b>Access control</b>: buckets are private by default; use bucket policies, IAM policies and S3 Block Public Access.</li><li><b>Static website hosting</b>: serve HTML, CSS and images directly from a bucket.</li></ul>
      ${K.trap('Durability (not losing data) is not the same as availability (being able to reach it right now). S3 Standard is designed for 11 nines durability and 99.99 % availability.')}
      ${K.recall('What protects S3 objects against accidental deletion or overwriting?', 'S3 Versioning (optionally with MFA Delete).')}` },
    { id: 's3-classes', title: 'S3 storage classes and lifecycle policies', level: 'i', tags: 's3 standard intelligent-tiering standard-ia one zone-ia glacier instant retrieval flexible retrieval deep archive lifecycle',
      html: `${K.table(['Storage class', 'Use when', 'Retrieval'], [
        ['S3 Standard', 'Frequently accessed data', 'Milliseconds'],
        ['S3 Intelligent-Tiering', 'Unknown or changing access patterns; S3 moves objects between tiers automatically', 'Milliseconds (frequent/infrequent tiers)'],
        ['S3 Standard-IA', 'Infrequently accessed but needs fast access when requested', 'Milliseconds, per-GB retrieval fee'],
        ['S3 One Zone-IA', 'Infrequent, re-creatable data; stored in one AZ only (cheaper, less resilient)', 'Milliseconds'],
        ['S3 Glacier Instant Retrieval', 'Archive accessed about once a quarter, needs instant access', 'Milliseconds'],
        ['S3 Glacier Flexible Retrieval', 'Archives accessed once or twice a year', 'Minutes to 12 hours'],
        ['S3 Glacier Deep Archive', 'Long-term retention (7–10 years) for compliance; cheapest', 'Within 12–48 hours'],
        ['S3 Express One Zone', 'Highest performance, single-digit-ms latency, one AZ', 'Single-digit milliseconds']
      ])}
      ${K.spectrum([
        ['Standard', 'Hot data'], ['Standard-IA', 'Warm'], ['Glacier Instant', 'Cool'], ['Glacier Flexible', 'Cold'], ['Deep Archive', 'Frozen']
      ], ['Higher storage price · cheap access', 'Lowest storage price · slow, costly access'])}
      <p>An <b>S3 Lifecycle policy</b> moves objects between classes or deletes them on a schedule, for example: Standard → Standard-IA after 30 days → Glacier Flexible Retrieval after 90 days → delete after 7 years.</p>
      ${K.tip('“Access pattern unknown or unpredictable” → <b>S3 Intelligent-Tiering</b>. “Rarely accessed, retrieval within hours is fine, cheapest” → <b>Glacier Deep Archive</b>.')}` },
    { id: 'ebs', title: 'Amazon EBS and instance store', level: 'i', tags: 'ebs volume snapshot instance store ephemeral ssd hdd persistent',
      html: `${K.table(['', 'Amazon EBS', 'Instance store'], [
        ['What', 'Network-attached block volume', 'Disks physically attached to the host'],
        ['Persistence', 'Persists independently of the instance\'s life', 'Data lost when the instance stops, hibernates or terminates'],
        ['Scope', 'Lives in one AZ; attach to instances in that AZ', 'Tied to that specific host'],
        ['Backups', 'Point-in-time <b>snapshots</b> stored in S3 (incremental)', 'None built in'],
        ['Best for', 'Boot volumes, databases, anything that must survive', 'Temporary buffers, caches, scratch data']
      ])}
      <p>EBS volume types include SSD-backed <b>gp3/gp2</b> (general purpose) and <b>io2/io1</b> (provisioned IOPS for demanding databases), and HDD-backed <b>st1</b> (throughput) and <b>sc1</b> (cold).</p>
      ${K.story('The disappearing cache', '<p>An intern stores a team\'s only copy of test results on an instance store volume, then stops the instance to save money over the weekend. On Monday the data is gone. If it had been on EBS, or backed up to S3, it would still be there.</p>')}
      ${K.trap('EBS snapshots can be copied to other Regions, but an EBS <i>volume</i> itself is tied to one Availability Zone.')}` },
    { id: 'file', title: 'File storage: Amazon EFS and Amazon FSx', level: 'i', tags: 'efs elastic file system nfs linux fsx windows file server lustre netapp ontap openzfs',
      html: `${K.table(['Service', 'Protocol / OS', 'Use case'], [
        ['Amazon EFS', 'NFS, Linux', 'Serverless, elastic shared file system for many EC2 instances, containers and Lambda across AZs'],
        ['Amazon FSx for Windows File Server', 'SMB, Windows, Active Directory integration', 'Shared drives for Windows applications'],
        ['Amazon FSx for Lustre', 'Lustre', 'High-performance computing and machine learning'],
        ['Amazon FSx for NetApp ONTAP / OpenZFS', 'NFS, SMB, iSCSI', 'Moving existing NetApp or ZFS workloads to AWS']
      ])}
      ${K.hook('<b>EFS = “Every Flavour of linux Shares”.</b> <b>FSx = “File Server, eXtra flavours”</b> (Windows, Lustre, ONTAP, OpenZFS).')}` },
    { id: 'hybrid-backup', title: 'Hybrid storage, backup and data transfer', level: 'a', tags: 'storage gateway file gateway volume gateway tape gateway aws backup snowball snowcone datasync transfer family',
      html: `${K.table(['Service', 'What it does'], [
        ['AWS Storage Gateway', 'Hybrid storage that gives on-premises applications access to cloud storage: S3 File Gateway, FSx File Gateway, Volume Gateway, Tape Gateway (virtual tape library)'],
        ['AWS Backup', 'Centrally manage and automate backups across EBS, RDS, DynamoDB, EFS, FSx, S3 and more with backup plans and policies'],
        ['AWS DataSync', 'Online transfer that automates and accelerates moving data between on-premises storage and AWS'],
        ['AWS Snow Family (Snowball Edge)', 'Rugged physical devices shipped to you for offline transfer of terabytes to petabytes, and edge computing'],
        ['AWS Transfer Family', 'Managed SFTP, FTPS and FTP into S3 or EFS'],
        ['Amazon S3 Transfer Acceleration', 'Faster uploads to S3 over long distances using edge locations']
      ])}
      ${K.diagram(K.flow(['On-premises servers', '*Storage Gateway|local cache', 'Amazon S3|durable copy', 'Glacier|lifecycle archive']), 'Storage Gateway lets on-premises apps keep using files or tapes while the data lands in AWS.')}
      ${K.tip('Rule of thumb: if sending the data over your network would take more than about a week, ship it with a <b>Snowball Edge</b> device. If the network is fine and you need ongoing sync, use <b>DataSync</b>.')}
      ${K.recall('A company wants to replace its physical tape backups with cloud storage without changing its backup software. Which service helps?', 'AWS Storage Gateway, Tape Gateway (a virtual tape library backed by S3 and Glacier).')}` }
  ],
  terms: [
    ['Amazon S3', 'Object storage with 11 nines durability; buckets and objects', 'Coat-check with tickets'],
    ['S3 Intelligent-Tiering', 'Moves objects between tiers automatically by access pattern', 'Self-organising wardrobe'],
    ['S3 Glacier Deep Archive', 'Cheapest class, retrieval within 12–48 hours', 'Deep-freeze storage'],
    ['Lifecycle policy', 'Rules that transition or expire objects over time', 'Auto-moving boxes to the attic'],
    ['Amazon EBS', 'Persistent block volume in one AZ, snapshots to S3', 'External hard drive'],
    ['Instance store', 'Temporary block storage on the host; lost when stopped', 'Whiteboard wiped each night'],
    ['Amazon EFS', 'Elastic shared NFS file system for Linux', 'Shared office drive'],
    ['Amazon FSx', 'Managed Windows, Lustre, ONTAP and OpenZFS file systems', 'Specialised shared drives'],
    ['AWS Storage Gateway', 'Hybrid link from on-premises apps to cloud storage', 'A bridge to the cloud'],
    ['AWS Snowball Edge', 'Physical device for offline petabyte-scale transfer', 'Moving truck for data']
  ],
  hooks: [
    '<b>Block = hard drive, File = shared folder, Object = coat-check.</b>',
    '<b>Storage-class ladder: Hot → Warm → Cool → Cold → Frozen</b> (Standard → IA → Glacier Instant → Glacier Flexible → Deep Archive).',
    '<b>Instance store is “instant, then gone”.</b>',
    '<b>Too slow to send? Ship it with Snow.</b>'
  ],
  tips: [
    '“Static website”, “media files”, “data lake”, “backup target” → Amazon S3.',
    '“Shared file system for many Linux instances” → Amazon EFS. Windows shares → FSx for Windows File Server.',
    '“Survives instance stop” → EBS, not instance store.',
    '“Automate backups across many AWS services from one place” → AWS Backup.',
    '“Infrequently accessed, can be recreated, lowest cost with fast access” → S3 One Zone-IA.'
  ],
  traps: [
    'S3 is not a file system you mount for an OS; it is object storage accessed via API.',
    'One Zone-IA stores data in a single AZ, so an AZ loss can lose that data.',
    'Glacier Flexible Retrieval and Deep Archive are not instant; Glacier Instant Retrieval is.',
    'An EBS volume can only attach to instances in the same AZ (snapshots can be copied anywhere).',
    'Snowball is for moving data offline; Direct Connect is a network link, not a migration device.'
  ],
  checks: [
    ['Which storage service is object storage designed for 99.999999999 % durability?', 'Amazon S3', 'Amazon EBS', 'Instance store', 'Amazon EFS', 'S3 stores objects redundantly across multiple AZs for 11 nines of durability.'],
    ['Which S3 storage class is best when access patterns are unknown or change over time?', 'S3 Intelligent-Tiering', 'S3 Glacier Deep Archive', 'S3 One Zone-IA', 'S3 Standard only', 'Intelligent-Tiering moves objects between access tiers automatically.'],
    ['What happens to data on an EC2 instance store volume when the instance is stopped?', 'It is lost', 'It is moved to S3 automatically', 'It is kept for 30 days', 'It is copied to EBS', 'Instance store is temporary storage tied to the host.'],
    ['Which service provides a shared NFS file system for many Linux EC2 instances?', 'Amazon EFS', 'Amazon EBS', 'Amazon S3 Glacier', 'AWS Storage Gateway Tape Gateway', 'EFS is an elastic, shared file system accessed over NFS.']
  ],
  summary: '<p>AWS storage comes in three shapes. <b>Block</b> storage (EBS, persistent and snapshot-able; instance store, fast but temporary) acts as a disk for one instance. <b>File</b> storage (EFS for Linux, FSx for Windows and specialised workloads) is shared by many instances. <b>Object</b> storage (S3) holds unlimited objects with 11 nines durability, and its storage classes trade storage price against access speed, from Standard down to Glacier Deep Archive, with Lifecycle policies and Intelligent-Tiering moving data automatically. Storage Gateway connects on-premises apps to AWS storage, AWS Backup centralises backups, and DataSync or the Snow Family move data in.</p>',
  takeaways: [
    'Block (EBS, instance store), file (EFS, FSx), object (S3).',
    'S3: buckets in a Region, objects up to 5 TB, 11 nines durability, versioning, replication, encryption by default.',
    'Storage classes: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant / Flexible / Deep Archive.',
    'EBS persists and snapshots to S3; instance store is lost on stop or terminate.',
    'Storage Gateway = hybrid; AWS Backup = central backups; Snow Family = offline bulk transfer.'
  ],
  sources: [
    ['Amazon S3 storage classes', 'https://aws.amazon.com/s3/storage-classes/'],
    ['Amazon S3 data durability and protection', 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html'],
    ['Amazon EBS volume types', 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html'],
    ['Amazon EC2 instance store', 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html'],
    ['AWS Storage Gateway', 'https://aws.amazon.com/storagegateway/'],
    ['AWS Snow Family', 'https://aws.amazon.com/snow/']
  ]
});
