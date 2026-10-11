// All career content lives here so it can be tested without a database.
const skills = [
  // Technology
  ['Programming Fundamentals & OOP', 'Technology'], ['Data Structures & Algorithms', 'Technology'],
  ['HTML & CSS', 'Technology'], ['JavaScript', 'Technology'], ['TypeScript', 'Technology'],
  ['React', 'Technology'], ['Node.js & Backend', 'Technology'], ['REST API Design', 'Technology'],
  ['Git', 'Technology'], ['Linux & Command Line', 'Technology'], ['Operating Systems', 'Technology'],
  ['Computer Networks', 'Technology'], ['System Design', 'Technology'], ['Testing & Debugging', 'Technology'],
  ['Docker & Containers', 'Technology'], ['CI/CD', 'Technology'], ['Cloud Basics', 'Technology'],
  ['Security Basics', 'Technology'], ['Clean Code & Design Patterns', 'Technology'],
  ['Database Design & NoSQL', 'Technology'],
  // Data
  ['SQL', 'Data'], ['Python', 'Data'], ['Statistics', 'Data'], ['Data Visualization', 'Data'],
  ['Excel & Spreadsheets', 'Data'], ['Data Cleaning & Wrangling', 'Data'],
  ['BI Tools (Power BI / Tableau)', 'Data'], ['Data Modeling & Warehousing', 'Data'],
  ['ETL & Data Pipelines', 'Data'], ['A/B Testing & Experimentation', 'Data'],
  ['Machine Learning Basics', 'Data'], ['Data Privacy & Ethics', 'Data'],
  // Design
  ['UX Research', 'Design'], ['Wireframing', 'Design'],
  // General
  ['Communication', 'General'], ['Agile & Teamwork', 'General'],
  ['Business Acumen', 'General'], ['Critical Thinking', 'General'],
];

// reqs: [skill, requiredLevel (1-5), importance (1-3)]
const careers = [
  { slug: 'software-engineer', title: 'Software Engineer', field: 'Technology',
    description: 'Designs, builds, tests and ships software, from web apps to back-end services.',
    education_path: 'Degree in computer science or a related field, or a bootcamp plus a strong portfolio.',
    reqs: [
      ['Programming Fundamentals & OOP', 4, 3], ['Data Structures & Algorithms', 4, 3],
      ['JavaScript', 3, 2], ['TypeScript', 3, 1], ['HTML & CSS', 2, 1], ['React', 3, 2],
      ['Node.js & Backend', 3, 2], ['REST API Design', 3, 2], ['SQL', 3, 2],
      ['Database Design & NoSQL', 3, 2], ['Git', 4, 2], ['Linux & Command Line', 3, 2],
      ['Operating Systems', 3, 1], ['Computer Networks', 3, 1], ['System Design', 3, 2],
      ['Testing & Debugging', 3, 2], ['Docker & Containers', 3, 1], ['CI/CD', 2, 1],
      ['Cloud Basics', 2, 1], ['Security Basics', 3, 2], ['Clean Code & Design Patterns', 3, 2],
      ['Agile & Teamwork', 3, 1], ['Communication', 3, 1],
    ] },
  { slug: 'data-analyst', title: 'Data Analyst', field: 'Data',
    description: 'Turns raw data into insight with queries, statistics, dashboards and clear recommendations.',
    education_path: 'Degree in statistics, economics, IT or similar; certificates and projects also count.',
    reqs: [
      ['Excel & Spreadsheets', 4, 2], ['SQL', 4, 3], ['Python', 3, 2], ['Data Cleaning & Wrangling', 4, 3],
      ['Statistics', 4, 3], ['Data Visualization', 4, 2], ['BI Tools (Power BI / Tableau)', 3, 3],
      ['Data Modeling & Warehousing', 3, 1], ['ETL & Data Pipelines', 2, 1],
      ['A/B Testing & Experimentation', 3, 2], ['Machine Learning Basics', 2, 1],
      ['Business Acumen', 3, 2], ['Critical Thinking', 3, 2], ['Data Privacy & Ethics', 2, 1],
      ['Git', 2, 1], ['Communication', 4, 2],
    ] },
  { slug: 'ux-designer', title: 'UX Designer', field: 'Design',
    description: 'Researches user needs and designs usable, accessible digital products.',
    education_path: 'Design, psychology or HCI degree, or a portfolio-based route.',
    reqs: [['UX Research', 4, 3], ['Wireframing', 4, 3], ['Communication', 4, 2], ['HTML & CSS', 2, 1], ['Data Visualization', 2, 1]] },
  { slug: 'coding-interview-prep', title: 'Coding Interview Prep (DSA)', field: 'Technology',
    description: 'Build strong data structures and algorithms skills for interviews and contests, using LeetCode and CodeChef practice.',
    education_path: 'No degree required. Consistent daily problem solving matters most.',
    reqs: [['Data Structures & Algorithms', 5, 3], ['Communication', 2, 1]] },
];

// Four resources per skill, one per level 1-4: [url, [title L1, L2, L3, L4]].
// Links go to general learning hubs. Verify them and swap in courses you have reviewed.
const resourceSets = {
  'Programming Fundamentals & OOP': ['https://cs50.harvard.edu/x/', ['Variables, loops and functions', 'Data types and error handling', 'Object-oriented programming: classes and inheritance', 'Build a command-line application']],
  'HTML & CSS': ['https://developer.mozilla.org/en-US/docs/Learn_web_development', ['HTML basics: structure and semantics', 'CSS layout: flexbox and grid', 'Responsive design and accessibility', 'Build and deploy a multi-page site']],
  'JavaScript': ['https://javascript.info', ['JavaScript fundamentals', 'Functions, arrays and objects', 'Async JavaScript and the DOM', 'Build an interactive web app']],
  'TypeScript': ['https://www.typescriptlang.org/docs/', ['TypeScript basics and types', 'Interfaces, generics and unions', 'TypeScript with a framework', 'Migrate a JavaScript project to TypeScript']],
  'React': ['https://react.dev/learn', ['React components and JSX', 'State, props and hooks', 'Routing, forms and data fetching', 'Build and deploy a React app']],
  'Node.js & Backend': ['https://nodejs.org/en/learn', ['Node.js basics and modules', 'Build a server with Express', 'Authentication and databases', 'Build a secure REST backend']],
  'REST API Design': ['https://restfulapi.net', ['HTTP and REST fundamentals', 'Designing endpoints and status codes', 'Validation, pagination and versioning', 'Design and document an API']],
  'Git': ['https://git-scm.com/book/en/v2', ['Git basics: commit and history', 'Branching and merging', 'Collaboration with pull requests', 'Resolve conflicts on a team project']],
  'Linux & Command Line': ['https://linuxjourney.com', ['Navigating the shell', 'Files, permissions and processes', 'Shell scripting basics', 'Automate tasks on a Linux server']],
  'Operating Systems': ['https://pages.cs.wisc.edu/~remzi/OSTEP/', ['Processes and threads', 'Memory management', 'Concurrency and synchronisation', 'File systems and I/O']],
  'Computer Networks': ['https://www.cloudflare.com/learning/', ['How the internet works', 'TCP/IP and DNS', 'HTTP, HTTPS and TLS', 'Debug network problems']],
  'System Design': ['https://github.com/donnemartin/system-design-primer', ['Scalability and latency basics', 'Caching, queues and load balancing', 'Database scaling and partitioning', 'Design a full system end to end']],
  'Testing & Debugging': ['https://jestjs.io/docs/getting-started', ['Debugging with logs and breakpoints', 'Unit testing', 'Integration and end-to-end testing', 'Test-driven development project']],
  'Docker & Containers': ['https://docs.docker.com/get-started/', ['Containers and images', 'Dockerfiles and volumes', 'Docker Compose for multi-service apps', 'Deploy a containerised app']],
  'CI/CD': ['https://docs.github.com/en/actions', ['Version control workflows', 'Automated builds and tests', 'Deployment pipelines', 'Build a full CI/CD pipeline']],
  'Cloud Basics': ['https://aws.amazon.com/getting-started/', ['Cloud concepts and pricing', 'Compute, storage and networking services', 'Databases and serverless', 'Deploy an app to the cloud']],
  'Security Basics': ['https://owasp.org/www-project-top-ten/', ['Common web vulnerabilities (OWASP Top 10)', 'Authentication and password storage', 'Secure coding practices', 'Run a security review of an app']],
  'Clean Code & Design Patterns': ['https://refactoring.guru/design-patterns', ['Naming and readable functions', 'Refactoring techniques', 'Common design patterns', 'Review and refactor a real codebase']],
  'Database Design & NoSQL': ['https://www.mongodb.com/docs/manual/', ['Tables, keys and relationships', 'Normalisation and indexing', 'NoSQL data models', 'Design a schema for a real app']],
  'SQL': ['https://sqlbolt.com', ['SELECT queries and filtering', 'Joins and aggregation', 'Subqueries and window functions', 'Analyse a real dataset end to end']],
  'Python': ['https://docs.python.org/3/tutorial/', ['Python syntax and data types', 'Functions and modules', 'Data analysis with pandas', 'Clean and analyse a messy dataset']],
  'Statistics': ['https://www.khanacademy.org/math/statistics-probability', ['Descriptive statistics', 'Probability and distributions', 'Hypothesis testing', 'Design and analyse an A/B test']],
  'Data Visualization': ['https://www.data-to-viz.com', ['Choosing the right chart', 'Design principles for clear charts', 'Build a dashboard', 'Tell a story with data']],
  'Excel & Spreadsheets': ['https://support.microsoft.com/en-us/excel', ['Formulas and functions', 'Lookups, pivot tables and charts', 'Data cleaning and validation in Excel', 'Build an automated analysis workbook']],
  'Data Cleaning & Wrangling': ['https://pandas.pydata.org/docs/getting_started/', ['Inspecting and profiling data', 'Handling missing values and duplicates', 'Reshaping, merging and grouping with pandas', 'Clean a messy real-world dataset']],
  'BI Tools (Power BI / Tableau)': ['https://learn.microsoft.com/en-us/power-bi/', ['Connecting to data and building visuals', 'Data modelling and relationships', 'Measures and calculations (DAX or calculated fields)', 'Publish an interactive dashboard']],
  'Data Modeling & Warehousing': ['https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/', ['Relational modelling basics', 'Star and snowflake schemas', 'Dimensional modelling in practice', 'Design a warehouse for a business case']],
  'ETL & Data Pipelines': ['https://airflow.apache.org/docs/', ['ETL and ELT concepts', 'Building a simple pipeline', 'Scheduling and monitoring jobs', 'Build a reliable end-to-end pipeline']],
  'A/B Testing & Experimentation': ['https://www.evanmiller.org/ab-testing/', ['Experiment design basics', 'Sample size and significance', 'Analysing and interpreting results', 'Run and report a full experiment']],
  'Machine Learning Basics': ['https://scikit-learn.org/stable/tutorial/', ['What machine learning is', 'Regression and classification', 'Model evaluation and overfitting', 'Build and evaluate a model']],
  'Data Privacy & Ethics': ['https://gdpr.eu', ['Why data privacy matters', 'GDPR and data protection basics', 'Bias and fairness in data', 'Apply privacy and ethics to a project']],
  'UX Research': ['https://www.nngroup.com/articles/', ['UX research fundamentals', 'User interviews and surveys', 'Usability testing', 'Run a full research study']],
  'Wireframing': ['https://www.figma.com/resource-library/', ['Sketching and low-fidelity wireframes', 'Information architecture', 'Interactive prototypes', 'Design a complete app flow']],
  'Communication': ['https://www.coursera.org/browse/personal-development', ['Clear writing at work', 'Presenting ideas', 'Giving and receiving feedback', 'Lead a stakeholder meeting']],
  'Agile & Teamwork': ['https://agilemanifesto.org', ['Agile and Scrum basics', 'Working in sprints', 'Code review and collaboration', 'Lead a sprint retrospective']],
  'Business Acumen': ['https://www.coursera.org/browse/business', ['How businesses make money', 'Metrics and KPIs', 'Turning data into recommendations', 'Present a business case']],
  'Critical Thinking': ['https://www.khanacademy.org', ['Spotting fallacies and bias', 'Correlation vs causation', 'Structuring problems', 'Evaluate a real analysis critically']],
};
const hours = [3, 5, 6, 8];
const types = ['course', 'course', 'article', 'project'];

// DSA practice tasks: [level, title, url, type, hours]. You solve the problems on LeetCode or CodeChef, then tick the task.
const LC = (slug) => 'https://leetcode.com/problems/' + slug + '/';
const dsaResources = [
  [1, 'Concept: Big-O, arrays and strings (NeetCode roadmap)', 'https://neetcode.io/roadmap', 'article', 3],
  [1, 'LeetCode: Two Sum', LC('two-sum'), 'practice', 1],
  [1, 'LeetCode: Contains Duplicate', LC('contains-duplicate'), 'practice', 1],
  [1, 'LeetCode: Valid Parentheses', LC('valid-parentheses'), 'practice', 1],
  [1, 'LeetCode: Best Time to Buy and Sell Stock', LC('best-time-to-buy-and-sell-stock'), 'practice', 1],
  [2, 'LeetCode: Group Anagrams', LC('group-anagrams'), 'practice', 2],
  [2, 'LeetCode: Longest Substring Without Repeating Characters', LC('longest-substring-without-repeating-characters'), 'practice', 2],
  [2, 'LeetCode: Reverse Linked List', LC('reverse-linked-list'), 'practice', 1],
  [2, 'LeetCode: Merge Two Sorted Lists', LC('merge-two-sorted-lists'), 'practice', 1],
  [2, 'LeetCode: Binary Search', LC('binary-search'), 'practice', 1],
  [2, 'CodeChef: Solve 3 beginner-rated problems', 'https://www.codechef.com/practice', 'practice', 3],
  [3, 'LeetCode: Maximum Depth of Binary Tree', LC('maximum-depth-of-binary-tree'), 'practice', 1],
  [3, 'LeetCode: Validate Binary Search Tree', LC('validate-binary-search-tree'), 'practice', 2],
  [3, 'LeetCode: Binary Tree Level Order Traversal', LC('binary-tree-level-order-traversal'), 'practice', 2],
  [3, 'LeetCode: Number of Islands', LC('number-of-islands'), 'practice', 2],
  [3, 'LeetCode: Merge Intervals', LC('merge-intervals'), 'practice', 2],
  [4, 'LeetCode: Climbing Stairs', LC('climbing-stairs'), 'practice', 1],
  [4, 'LeetCode: House Robber', LC('house-robber'), 'practice', 2],
  [4, 'LeetCode: Coin Change', LC('coin-change'), 'practice', 3],
  [4, 'LeetCode: Course Schedule', LC('course-schedule'), 'practice', 3],
  [4, 'LeetCode: Top K Frequent Elements', LC('top-k-frequent-elements'), 'practice', 2],
  [4, 'CodeChef: Solve 3 medium-rated problems', 'https://www.codechef.com/practice', 'practice', 4],
  [5, 'LeetCode: LRU Cache', LC('lru-cache'), 'practice', 3],
  [5, 'LeetCode: Merge k Sorted Lists', LC('merge-k-sorted-lists'), 'practice', 3],
  [5, 'LeetCode: Longest Increasing Subsequence', LC('longest-increasing-subsequence'), 'practice', 3],
  [5, 'LeetCode: Trapping Rain Water', LC('trapping-rain-water'), 'practice', 4],
  [5, 'CodeChef: Take part in a rated contest', 'https://www.codechef.com/contests', 'project', 4],
];

// q(skill, level, prompt, rightAnswer, ...wrongAnswers): options are shuffled when the seed runs.
const rawQuestions = [];
const q = (skill, level, prompt, right, ...wrong) => rawQuestions.push({ skill, level, prompt, right, wrong });

q('Programming Fundamentals & OOP', 1, 'Which OOP principle hides internal details behind a public interface?', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Recursion');
q('Programming Fundamentals & OOP', 2, 'A function that calls itself is called:', 'Recursive', 'Static', 'Abstract', 'Overloaded');
q('Data Structures & Algorithms', 1, 'What is the time complexity of reading an array element by its index?', 'O(1)', 'O(n)', 'O(log n)', 'O(n^2)');
q('Data Structures & Algorithms', 1, 'Which data structure follows last-in, first-out order?', 'Stack', 'Queue', 'Heap', 'Graph');
q('Data Structures & Algorithms', 2, 'Binary search requires the input to be:', 'Sorted', 'Unique', 'All positive', 'A linked list');
q('Data Structures & Algorithms', 2, 'What is the average time for a hash map lookup?', 'O(1)', 'O(n)', 'O(log n)', 'O(n log n)');
q('Data Structures & Algorithms', 3, 'Which traversal visits a tree level by level?', 'BFS', 'Inorder DFS', 'Preorder DFS', 'Postorder DFS');
q('Data Structures & Algorithms', 3, 'What is the worst-case time complexity of merge sort?', 'O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)');
q('Data Structures & Algorithms', 4, 'Dynamic programming fits problems that have:', 'Overlapping subproblems and optimal substructure', 'Only sorted input', 'No possible recursion', 'A unique answer');
q('Data Structures & Algorithms', 4, 'Which structure best tracks the k-th largest element in a stream?', 'Min-heap of size k', 'Stack', 'Queue', 'Hash set');
q('HTML & CSS', 1, 'Which HTML element defines the most important heading?', '<h1>', '<h6>', '<head>', '<header>');
q('HTML & CSS', 2, "Which CSS property adds space outside an element's border?", 'margin', 'padding', 'border-spacing', 'line-height');
q('JavaScript', 1, 'Which keyword declares a block-scoped variable that can be reassigned?', 'let', 'var', 'const', 'static');
q('JavaScript', 2, 'What does Array.prototype.map return?', 'A new array with each item transformed', 'The original array, modified', 'A single value', 'undefined');
q('TypeScript', 1, 'What does TypeScript add to JavaScript?', 'Static typing', 'A new runtime', 'A database', 'CSS support');
q('TypeScript', 2, 'Which type is safer than any when a value type is not known yet?', 'unknown', 'object', 'void', 'never');
q('React', 1, 'What do React components return?', 'JSX describing the UI', 'SQL queries', 'CSS files', 'HTTP responses');
q('React', 2, 'Which hook stores state in a function component?', 'useState', 'useRoute', 'useQuery', 'useStyle');
q('Node.js & Backend', 1, 'What is Node.js?', 'A JavaScript runtime outside the browser', 'A CSS framework', 'A database', 'A web browser');
q('Node.js & Backend', 2, 'In Express, what does middleware do?', 'Runs between the request and the final handler', 'Stores files', 'Compiles CSS', 'Replaces the database');
q('REST API Design', 1, 'Which HTTP method is normally used to create a resource?', 'POST', 'GET', 'DELETE', 'HEAD');
q('REST API Design', 2, 'Which status code means a resource was not found?', '404', '200', '301', '500');
q('Git', 1, 'Which command records staged changes as a commit?', 'git commit', 'git push', 'git add', 'git clone');
q('Git', 2, 'Which command creates and switches to a new branch?', 'git checkout -b x', 'git branch -d x', 'git merge x', 'git stash x');
q('Linux & Command Line', 1, 'Which command lists files in a directory?', 'ls', 'cd', 'rm', 'mkdir');
q('Linux & Command Line', 2, 'Which command prints the current directory path?', 'pwd', 'mv', 'chmod', 'grep');
q('Operating Systems', 1, 'What does the OS scheduler decide?', 'Which process runs on the CPU next', 'Which website loads', 'Which file is largest', 'Which user is admin');
q('Operating Systems', 2, 'What is a deadlock?', 'Processes waiting on each other forever', 'A crashed disk', 'A slow network', 'A full cache');
q('Computer Networks', 1, 'What does DNS do?', 'Translates domain names to IP addresses', 'Encrypts traffic', 'Stores files', 'Assigns passwords');
q('Computer Networks', 2, 'Which protocol provides reliable, ordered delivery?', 'TCP', 'UDP', 'ICMP', 'ARP');
q('System Design', 1, 'What does a load balancer do?', 'Spreads requests across servers', 'Compresses images', 'Stores passwords', 'Compiles code');
q('System Design', 2, 'What is the main purpose of a cache?', 'Serve frequently used data faster', 'Replace the database permanently', 'Encrypt data', 'Schedule jobs');
q('Testing & Debugging', 1, 'What does a unit test check?', 'One small piece of code in isolation', 'The whole system in production', 'Server hardware', 'Network speed');
q('Testing & Debugging', 2, 'What is a good first step when debugging?', 'Reproduce the bug reliably', 'Rewrite everything', 'Ignore the logs', 'Add new features');
q('Docker & Containers', 1, 'What is a Docker image?', 'A read-only template for creating containers', 'A running virtual machine', 'A database backup', 'A network cable');
q('Docker & Containers', 2, 'Which file defines how to build an image?', 'Dockerfile', 'package.json', '.env', 'README.md');
q('CI/CD', 1, 'What does continuous integration do?', 'Automatically builds and tests code on every change', 'Deploys without testing', 'Writes code for you', 'Reviews designs');
q('CI/CD', 2, 'What usually happens in the deploy stage of a pipeline?', 'The tested build is released to an environment', 'Requirements are gathered', 'Code is written', 'Bugs are ignored');
q('Cloud Basics', 1, 'What does IaaS provide?', 'Virtualised computing infrastructure', 'Ready-made apps only', 'Only email', 'Printers');
q('Cloud Basics', 2, 'Why use object storage such as S3?', 'Store large amounts of unstructured files durably', 'Run SQL joins', 'Render web pages', 'Compile code');
q('Security Basics', 1, 'What does SQL injection exploit?', 'Unsanitised input placed in queries', 'Weak Wi-Fi', 'Slow servers', 'Old monitors');
q('Security Basics', 2, 'How should passwords be stored?', 'Hashed with a salt', 'In plain text', 'Base64 encoded', 'Reversed');
q('Clean Code & Design Patterns', 1, 'Which naming style makes code easier to read?', 'Descriptive names that show intent', 'Single letters everywhere', 'Random words', 'Long unrelated names');
q('Clean Code & Design Patterns', 2, 'Which pattern ensures a class has only one instance?', 'Singleton', 'Observer', 'Factory', 'Adapter');
q('Database Design & NoSQL', 1, 'What does a primary key do?', 'Uniquely identifies each row', 'Sorts the table', 'Encrypts data', 'Deletes duplicates');
q('Database Design & NoSQL', 2, 'Which of these is a document database?', 'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite');
q('SQL', 1, 'Which clause filters rows before grouping?', 'WHERE', 'HAVING', 'ORDER BY', 'LIMIT');
q('SQL', 2, 'Which join keeps every row from the left table even without a match?', 'LEFT JOIN', 'INNER JOIN', 'CROSS JOIN', 'NATURAL JOIN');
q('Python', 1, 'Which structure is an ordered, changeable collection?', 'list', 'tuple', 'set', 'frozenset');
q('Python', 2, 'What does len([1, 2, 3]) return?', '3', '2', '4', 'An error');
q('Statistics', 1, 'Which measure is least affected by extreme outliers?', 'Median', 'Mean', 'Range', 'Sum');
q('Statistics', 2, 'A p-value below the chosen significance level usually means:', 'The null hypothesis is rejected', 'The effect is large', 'The data is biased', 'The sample is too small');
q('Data Visualization', 1, 'Which chart is best for showing change over time?', 'Line chart', 'Pie chart', 'Venn diagram', 'Word cloud');
q('Data Visualization', 2, "Why should a bar chart's axis start at zero?", 'Bar length encodes value, so truncating exaggerates differences', 'It looks neater', 'Libraries require it', 'It fits more labels');
q('Excel & Spreadsheets', 1, 'Which function adds up a range of numbers?', 'SUM', 'COUNTIF', 'VLOOKUP', 'CONCAT');
q('Excel & Spreadsheets', 2, 'What does VLOOKUP do?', 'Finds a value in the first column and returns a value from the same row', 'Sorts a column', 'Draws a chart', 'Removes duplicates');
q('Data Cleaning & Wrangling', 1, 'What is a sensible first step with missing values?', 'Find out how many there are and why', 'Delete the whole dataset', 'Fill them with random numbers', 'Ignore them');
q('Data Cleaning & Wrangling', 2, 'What does removing duplicate rows help prevent?', 'Double counting in results', 'Slow typing', 'Missing columns', 'Wrong chart colours');
q('BI Tools (Power BI / Tableau)', 1, 'What is a dashboard?', 'A single view of key metrics', 'A database table', 'A programming language', 'A backup file');
q('BI Tools (Power BI / Tableau)', 2, 'What is a measure in Power BI?', 'A calculation such as a sum or average over data', 'A table border', 'A theme colour', 'A user account');
q('Data Modeling & Warehousing', 1, 'In a star schema, what sits at the centre?', 'The fact table', 'The dimension table', 'The index', 'The view');
q('Data Modeling & Warehousing', 2, 'What does a data warehouse mainly support?', 'Analysis and reporting across history', 'Fast single-row updates', 'Email', 'Image editing');
q('ETL & Data Pipelines', 1, 'What does ETL stand for?', 'Extract, Transform, Load', 'Evaluate, Test, Launch', 'Edit, Table, Link', 'Export, Trim, Log');
q('ETL & Data Pipelines', 2, 'Why make a pipeline idempotent?', 'Re-running it gives the same result without duplicates', 'It always runs faster', 'It needs no data', 'It avoids logging');
q('A/B Testing & Experimentation', 1, 'What is the control group in an A/B test?', 'The group that sees the existing version', 'The group with no users', 'The group that pays', 'The largest group');
q('A/B Testing & Experimentation', 2, 'Why decide the sample size before the test?', 'To avoid stopping early on chance results', 'To save disk space', 'To make charts bigger', 'To skip statistics');
q('Machine Learning Basics', 1, 'What is supervised learning?', 'Learning from labelled examples', 'Learning with no data', 'Learning only from images', 'Writing rules by hand');
q('Machine Learning Basics', 2, 'What is overfitting?', 'A model that memorises training data and generalises poorly', 'A model that is too simple', 'A slow computer', 'A missing label');
q('Data Privacy & Ethics', 1, 'What is personally identifiable information (PII)?', 'Data that can identify a person', 'Any numeric column', 'Public weather data', 'Company logos');
q('Data Privacy & Ethics', 2, 'What is data anonymisation for?', 'Removing identifying details so people cannot be traced', 'Making data bigger', 'Speeding up queries', 'Sorting rows');
q('UX Research', 1, 'Which method observes users completing tasks with a prototype?', 'Usability testing', 'A/B pricing', 'Card sorting', 'Market sizing');
q('UX Research', 2, 'User interviews are best for understanding:', 'Why users behave as they do', 'How many users clicked a button', 'Server load', 'Page speed');
q('Wireframing', 1, 'A wireframe mainly communicates:', 'Layout and structure', 'Final colours and brand', 'Database design', 'Marketing copy');
q('Wireframing', 2, 'A benefit of low-fidelity wireframes is:', 'They are fast and cheap to change', 'They are pixel-perfect', 'They are production-ready', 'They replace research');
q('Communication', 1, 'In a stakeholder update, what usually comes first?', 'The key conclusion or request', 'Detailed methodology', 'Apologies', 'The appendix');
q('Communication', 2, 'Active listening includes:', 'Paraphrasing to confirm understanding', 'Interrupting with solutions', 'Multitasking', 'Planning your reply while they talk');
q('Agile & Teamwork', 1, 'What is a sprint in Scrum?', 'A short fixed period of work toward a goal', 'A bug', 'A meeting room', 'A code branch');
q('Agile & Teamwork', 2, 'What is the purpose of a daily stand-up?', 'Share progress and blockers quickly', 'Review salaries', 'Write documentation', 'Deploy code');
q('Business Acumen', 1, 'What does KPI stand for?', 'Key Performance Indicator', 'Key Process Input', 'Known Product Index', 'Keyword Price Index');
q('Business Acumen', 2, 'Which question best links analysis to business value?', 'What decision will this change?', 'How many columns are there?', 'Which chart is prettiest?', 'How big is the file?');
q('Critical Thinking', 1, 'Correlation between two things means:', 'They move together, not necessarily one causing the other', 'One causes the other', 'They are unrelated', 'They are identical');
q('Critical Thinking', 2, 'What is confirmation bias?', 'Favouring evidence that supports what you already believe', 'Checking every source', 'Ignoring all data', 'Using a random sample');

// Shuffle answer order so the right answer is not always in the same position.
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildQuestions() {
  return rawQuestions.map((x) => {
    const options = shuffled([x.right, ...x.wrong]);
    return { skill: x.skill, level: x.level, prompt: x.prompt, options, correct: options.indexOf(x.right) };
  });
}

module.exports = { skills, careers, resourceSets, hours, types, dsaResources, rawQuestions, buildQuestions };