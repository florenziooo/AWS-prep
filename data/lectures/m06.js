STRATUS.lecture({
  id: 'm6', num: 6, minutes: 40,
  tagline: 'Picking the right database, the analytics and AI services built on top of data, and the glue that connects applications.',
  subtitle: 'AWS follows a “purpose-built database” philosophy: use the engine that fits the data. This module covers <b>relational</b> databases (Amazon RDS, Aurora), <b>NoSQL</b> (DynamoDB, DocumentDB, Neptune), in-memory caching (ElastiCache), data warehousing (Redshift), database migration (DMS, SCT), the main <b>analytics</b> and <b>AI/ML</b> services, and <b>application integration</b> (SQS, SNS, EventBridge, Step Functions).',
  objectives: [
    'Compare self-managed databases on EC2 with managed databases on AWS.',
    'Describe Amazon RDS, Multi-AZ deployments, read replicas and Amazon Aurora.',
    'Explain Amazon DynamoDB and when to choose NoSQL over relational.',
    'Match purpose-built databases (Redshift, ElastiCache, DocumentDB, Neptune, Timestream) to use cases.',
    'Identify analytics services (Athena, Glue, EMR, Kinesis, Quick) and AI/ML services (SageMaker AI, Bedrock, Rekognition, Comprehend, Polly, Transcribe, Translate, Lex, Textract).',
    'Explain SQS, SNS, EventBridge and Step Functions for decoupling applications.'
  ],
  why: '<p>Task statements 3.4 (databases), 3.7 (AI/ML and analytics) and 3.8 (application integration) together produce many “which service?” questions. The trick is reading the keyword: <i>relational</i>, <i>key-value</i>, <i>graph</i>, <i>data warehouse</i>, <i>queue</i>, <i>publish/subscribe</i>, <i>image analysis</i>.</p>',
  sections: [
    { id: 'eli5', title: 'Databases, explained simply', level: 'b', tags: 'databases explained analogy relational nosql',
      html: `${K.eli5('<p>A <b>relational database</b> is like a set of linked spreadsheets with strict columns: a Customers sheet, an Orders sheet, and rules that connect them. A <b>NoSQL key-value database</b> is like a giant coat-check: give it a ticket number (key) and it instantly hands back whatever is stored (value), whatever its shape. A <b>graph database</b> is like a map of friendships: it is fastest at answering “who knows whom?”.</p>')}
      ${K.table(['', 'Relational (SQL)', 'NoSQL (non-relational)'], [
        ['Structure', 'Fixed schema: tables, rows, columns', 'Flexible schema: key-value, document, graph'],
        ['Query', 'SQL with joins', 'Simple lookups by key; API calls'],
        ['Scale', 'Usually scale up (bigger instance) and read replicas', 'Scale out horizontally almost without limit'],
        ['AWS examples', 'Amazon RDS, Amazon Aurora', 'Amazon DynamoDB, DocumentDB, Neptune']
      ])}
      ${K.recall('Which kind of database uses fixed tables and SQL joins?', 'A relational database, such as Amazon RDS or Aurora.')}` },
    { id: 'managed', title: 'Self-managed vs managed databases', level: 'b', tags: 'managed database ec2 rds shared responsibility patching backups',
      html: `${K.stack([['Schema, queries, data, access', 'you'], ['Performance tuning', 'you'], ['Backups, patching, high availability, scaling', 'aws', 'AWS (with RDS)'], ['OS install and patching', 'aws', 'AWS (with RDS)'], ['Hardware and data center', 'aws']], 'With Amazon RDS, AWS takes over the undifferentiated work; with a database on EC2, the middle layers are yours.')}
      ${K.tip('If a question says “reduce operational overhead such as patching and backups for a relational database”, the answer is a managed service such as <b>Amazon RDS</b>, not a database installed on EC2.')}` },
    { id: 'rds-aurora', title: 'Amazon RDS and Amazon Aurora', level: 'i', tags: 'rds multi-az read replica aurora engines mysql postgresql mariadb oracle sql server db2 backups',
      html: `<p><b>Amazon Relational Database Service (RDS)</b> runs relational engines for you: provisioning, patching, automated backups and point-in-time recovery.</p>
      ${K.fix('<p>Older notes list six RDS engines. Today RDS supports <b>Amazon Aurora (MySQL- and PostgreSQL-compatible), MySQL, MariaDB, PostgreSQL, Oracle, Microsoft SQL Server and IBM Db2</b>. Aurora storage now scales up to <b>128 TiB</b> (not 64 TB).</p>')}
      ${K.table(['Feature', 'Purpose', 'Remember'], [
        ['Multi-AZ deployment', 'Synchronous standby in another AZ; automatic failover', '<b>High availability</b> (the standby does not serve reads in the classic setup)'],
        ['Read replicas', 'Asynchronous copies that serve read traffic', '<b>Read scaling</b> (can be in another Region)'],
        ['Automated backups', 'Daily snapshots plus transaction logs', 'Point-in-time recovery within the retention period']
      ])}
      <p><b>Amazon Aurora</b> is AWS\'s cloud-native relational database, compatible with MySQL and PostgreSQL, with up to 5× the throughput of standard MySQL and 3× PostgreSQL. It keeps <b>six copies of data across three AZs</b>. <b>Aurora Serverless</b> scales capacity automatically.</p>
      ${K.hook('<b>Multi-AZ = “Maybe Accidents”</b> (failover for disasters). <b>Read replicas = “Readers”</b> (more people reading).')}` },
    { id: 'nosql', title: 'DynamoDB and other purpose-built databases', level: 'i', tags: 'dynamodb nosql key-value global tables dax elasticache redshift documentdb neptune timestream keyspaces memorydb',
      html: `<p><b>Amazon DynamoDB</b> is a fully managed, serverless key-value and document database that delivers single-digit-millisecond performance at any scale. Data is replicated across multiple AZs in a Region automatically.</p>
      ${K.fix('<p>Some notes say DynamoDB “replicates tables automatically across your choice of Regions”. By default it replicates across <b>AZs within one Region</b>; multi-Region replication happens only when you enable <b>DynamoDB Global Tables</b>.</p>')}
      ${K.table(['Service', 'Type', 'Use case keyword'], [
        ['Amazon DynamoDB', 'Key-value / document, serverless', '“millisecond latency at any scale”, gaming, shopping carts, IoT'],
        ['Amazon ElastiCache (Redis OSS, Valkey, Memcached)', 'In-memory cache', '“microsecond reads”, session store, cache database queries'],
        ['Amazon MemoryDB', 'Durable in-memory database', 'Redis-compatible primary database'],
        ['Amazon Redshift', 'Data warehouse (columnar)', '“analytics on petabytes”, business intelligence, OLAP'],
        ['Amazon DocumentDB', 'Document (MongoDB-compatible)', 'JSON documents, content catalogues'],
        ['Amazon Neptune', 'Graph', '“relationships”, social networks, fraud detection, recommendations'],
        ['Amazon Timestream', 'Time series', 'IoT sensor readings, metrics over time'],
        ['Amazon Keyspaces', 'Wide-column (Apache Cassandra-compatible)', 'Moving Cassandra workloads']
      ])}
      ${K.trap('OLTP (many small transactions) → RDS / Aurora / DynamoDB. OLAP (complex analytics over huge history) → <b>Redshift</b>.')}` },
    { id: 'migration', title: 'Database migration: DMS and SCT', level: 'i', tags: 'dms schema conversion tool homogeneous heterogeneous migration',
      html: `${K.diagram(K.flow(['On-premises Oracle', '*AWS SCT|convert schema', '*AWS DMS|move data, keep in sync', 'Amazon Aurora PostgreSQL']), 'Heterogeneous migration: SCT converts the schema and code; DMS migrates the data with minimal downtime.')}
      <ul><li><b>AWS Database Migration Service (DMS)</b> migrates data to AWS while the source stays operational, supporting homogeneous (Oracle → Oracle) and heterogeneous (Oracle → Aurora) migrations, plus continuous replication.</li><li><b>AWS Schema Conversion Tool (SCT)</b> converts schemas and stored code from one engine to another (also available as DMS Schema Conversion).</li></ul>
      ${K.story('Leaving a licence behind', '<p>A retailer pays heavily for commercial database licences. It uses <b>SCT</b> to convert its schema to Aurora PostgreSQL and <b>DMS</b> to copy the data while the old database keeps taking orders, then switches over with only minutes of downtime.</p>')}` },
    { id: 'analytics-ai', title: 'Analytics and AI/ML services', level: 'a', tags: 'athena glue emr kinesis quick sight opensearch sagemaker bedrock rekognition comprehend polly transcribe translate lex textract kendra q',
      html: `${K.table(['Analytics service', 'What it does'], [
        ['Amazon Athena', 'Query data in S3 with standard SQL, serverless, pay per query'],
        ['AWS Glue', 'Serverless data integration: ETL jobs and the Data Catalog'],
        ['Amazon EMR', 'Managed big-data frameworks such as Apache Spark and Hadoop'],
        ['Amazon Kinesis (Data Streams, Data Firehose)', 'Collect and process real-time streaming data'],
        ['Amazon Quick (Quick Sight)', 'Business intelligence dashboards and visualisations (formerly Amazon QuickSight)'],
        ['Amazon OpenSearch Service', 'Search and log analytics']
      ])}
      ${K.table(['AI / ML service', 'Keyword'], [
        ['Amazon SageMaker AI', 'Build, train and deploy your own ML models'],
        ['Amazon Bedrock', 'Build generative AI apps using foundation models through an API'],
        ['Amazon Q', 'Generative AI assistant for business and developers'],
        ['Amazon Rekognition', 'Image and video analysis (faces, objects, content moderation)'],
        ['Amazon Comprehend', 'Natural language processing: sentiment, entities, key phrases'],
        ['Amazon Polly', 'Text to speech'],
        ['Amazon Transcribe', 'Speech to text'],
        ['Amazon Translate', 'Language translation'],
        ['Amazon Lex', 'Conversational chatbots (voice and text)'],
        ['Amazon Textract', 'Extract text and data from scanned documents and forms'],
        ['Amazon Kendra', 'Intelligent enterprise search']
      ])}
      ${K.hook('<b>Polly Parrot speaks</b> (text → speech). <b>Transcribe writes down</b> what you say (speech → text). <b>Rekognition Recognises faces.</b> <b>Comprehend Comprehends feelings</b> (sentiment). <b>Textract eXTRACTs text</b> from forms.')}
      ${K.recall('A company wants to analyse customer reviews to find out whether they are positive or negative. Which service?', 'Amazon Comprehend (sentiment analysis).')}` },
    { id: 'integration', title: 'Application integration: SQS, SNS, EventBridge, Step Functions', level: 'a', tags: 'sqs sns eventbridge step functions decouple queue pub sub fan-out workflow mq',
      html: `${K.table(['Service', 'Pattern', 'Use it when'], [
        ['Amazon SQS', 'Message <b>queue</b> (pull)', 'Decouple producers and consumers; buffer work so nothing is lost when consumers are slow'],
        ['Amazon SNS', 'Publish/subscribe (<b>push</b>)', 'Send one message to many subscribers: email, SMS, Lambda, SQS (fan-out)'],
        ['Amazon EventBridge', 'Event bus', 'Route events between AWS services, SaaS apps and your apps using rules; schedules'],
        ['AWS Step Functions', 'Workflow orchestration', 'Coordinate multiple steps (Lambda functions, services) with visual state machines'],
        ['Amazon MQ', 'Managed message broker', 'Migrate apps that use ActiveMQ or RabbitMQ protocols']
      ])}
      ${K.diagram(K.flow(['Order placed', '*SNS topic|fan-out', 'Subscribers|SQS → billing · SQS → shipping · email']), 'SNS pushes one event to many subscribers; each SQS queue buffers work for its consumer.')}
      ${K.hook('<b>SQS = Queue (it waits); SNS = Notification (it shouts).</b>')}` }
  ],
  terms: [
    ['Amazon RDS', 'Managed relational database (7 engine families incl. Aurora and Db2)', 'Hired DBA'],
    ['Multi-AZ', 'Synchronous standby in another AZ for automatic failover', 'Understudy actor'],
    ['Read replica', 'Async copy that serves reads', 'Photocopies for readers'],
    ['Amazon Aurora', 'Cloud-native MySQL/PostgreSQL, 6 copies in 3 AZs, up to 128 TiB', 'Sports-car database'],
    ['Amazon DynamoDB', 'Serverless key-value NoSQL, ms latency at any scale', 'Coat-check'],
    ['Amazon Redshift', 'Petabyte-scale data warehouse', 'Library archive for analysis'],
    ['Amazon ElastiCache', 'In-memory cache', 'Sticky notes on your desk'],
    ['Amazon Neptune', 'Graph database', 'Friendship map'],
    ['AWS DMS / SCT', 'Migrate data / convert schemas', 'Moving van / translator'],
    ['Amazon SQS', 'Message queue for decoupling', 'Ticket queue at a deli'],
    ['Amazon SNS', 'Pub/sub notifications', 'Megaphone'],
    ['Amazon Bedrock', 'Generative AI with foundation models via API', 'AI model buffet']
  ],
  hooks: [
    '<b>Multi-AZ = disasters; read replicas = readers.</b>',
    '<b>OLTP → RDS/DynamoDB; OLAP → Redshift.</b>',
    '<b>SQS waits, SNS shouts.</b>',
    '<b>Polly speaks, Transcribe writes, Translate converts, Comprehend feels, Rekognition sees, Textract reads forms.</b>'
  ],
  tips: [
    '“Relational, managed, less admin” → RDS. “MySQL/PostgreSQL compatible, highest performance and availability” → Aurora.',
    '“Key-value”, “serverless”, “single-digit millisecond at any scale” → DynamoDB.',
    '“Query S3 data with SQL without loading it” → Athena.',
    '“Build your own model” → SageMaker AI. “Use foundation models for generative AI” → Bedrock.',
    '“One event, many destinations” → SNS (or EventBridge). “Buffer messages between components” → SQS.'
  ],
  traps: [
    'RDS Multi-AZ is for availability, not for scaling reads (use read replicas).',
    'DynamoDB is multi-AZ by default but multi-Region only with Global Tables.',
    'Redshift is not for transactional workloads.',
    'You cannot SSH into the host OS of an RDS instance; AWS manages it.',
    'Transcribe (speech → text) and Polly (text → speech) are easy to swap by mistake.'
  ],
  checks: [
    ['Which RDS feature provides automatic failover to a standby in another AZ?', 'Multi-AZ deployment', 'Read replicas', 'Automated backups', 'Aurora Serverless', 'Multi-AZ keeps a synchronous standby and fails over automatically.'],
    ['Which service is a serverless key-value NoSQL database with single-digit-millisecond latency?', 'Amazon DynamoDB', 'Amazon Redshift', 'Amazon RDS for MySQL', 'Amazon Neptune', 'DynamoDB is AWS\'s serverless key-value and document database.'],
    ['Which service decouples application components with a message queue?', 'Amazon SQS', 'Amazon SNS', 'Amazon Athena', 'AWS Glue', 'SQS stores messages until consumers process them.'],
    ['Which service converts text into lifelike speech?', 'Amazon Polly', 'Amazon Transcribe', 'Amazon Comprehend', 'Amazon Lex', 'Polly is text-to-speech.']
  ],
  summary: '<p>AWS offers a <b>purpose-built database</b> for each data shape. <b>Amazon RDS</b> runs managed relational engines (with <b>Multi-AZ</b> for availability and <b>read replicas</b> for read scaling) and <b>Aurora</b> is the cloud-native, high-performance option. <b>DynamoDB</b> is serverless key-value NoSQL; <b>Redshift</b> is the data warehouse; ElastiCache, DocumentDB, Neptune and Timestream cover caching, documents, graphs and time series. <b>DMS</b> and <b>SCT</b> migrate databases. Analytics services (Athena, Glue, EMR, Kinesis, Quick) and AI/ML services (SageMaker AI, Bedrock, Rekognition, Comprehend, Polly, Transcribe, Translate, Lex, Textract) build on that data, while <b>SQS, SNS, EventBridge and Step Functions</b> connect applications in a loosely coupled way.</p>',
  takeaways: [
    'Managed databases shift patching, backups and HA to AWS.',
    'RDS: Multi-AZ = HA; read replicas = read scale. Aurora: 6 copies, 3 AZs, up to 128 TiB.',
    'DynamoDB: serverless key-value; Global Tables for multi-Region.',
    'Redshift = data warehouse; ElastiCache = cache; Neptune = graph; DocumentDB = MongoDB-compatible.',
    'DMS moves data, SCT converts schemas.',
    'SQS queue, SNS pub/sub, EventBridge event bus, Step Functions workflows.'
  ],
  sources: [
    ['Purpose-built databases on AWS', 'https://aws.amazon.com/products/databases/'],
    ['Amazon RDS Multi-AZ and read replicas', 'https://aws.amazon.com/rds/features/multi-az/'],
    ['Amazon Aurora FAQs', 'https://aws.amazon.com/rds/aurora/faqs/'],
    ['Amazon DynamoDB Global Tables', 'https://aws.amazon.com/dynamodb/global-tables/'],
    ['AWS Database Migration Service', 'https://aws.amazon.com/dms/'],
    ['Machine learning on AWS', 'https://aws.amazon.com/ai/'],
    ['Application integration on AWS', 'https://aws.amazon.com/products/application-integration/']
  ]
});
