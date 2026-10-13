import type { CaseStudy } from "./types";

/**
 * Case-study copy for /work/[slug], keyed by project slug.
 *
 * Sources: Weblanda from the brief, LinkedIn and weblanda.com's own screen captions (its code is
 * private). Every other project from its public GitHub README. Nothing here goes beyond those.
 * TODO (Jay): the "What I learned" lines are written in your voice from what each README says.
 * Read them and change anything that doesn't sound like you.
 */
export const caseStudies: Record<string, CaseStudy> = {
  weblanda: {
    facts: [
      { label: "Role", value: "Founder, solo build" },
      { label: "Type", value: "Multi-tenant SaaS e-commerce" },
      { label: "Since", value: "July 2026" },
      { label: "Company", value: "Weblanda Technologies Ltd" },
    ],
    problem: [
      "A small business that wants to sell online needs more than a catalogue. It needs a checkout that actually takes payment, a way to get orders delivered, and one place to keep track of products, stock and customers.",
      "Weblanda is built for owners who run their business from a phone, so every one of those jobs has to work on a phone screen, not only on a laptop.",
      "Then there is the money. When a customer pays, the seller should be paid, without waiting for a platform to pass the money on and without giving up a share of every sale.",
    ],
    builtIntro:
      "Weblanda gives each business its own online store on its own subdomain, with real checkout, delivery and a seller dashboard. I built the whole platform alone: product, engineering, payments, brand and content.",
    built: [
      {
        title: "A store in minutes",
        body: "A seller picks a name and the shop is live, free for the first 14 days.",
      },
      {
        title: "Products from a phone",
        body: "A photo, a name and a price is all it takes to add a product to the shop.",
      },
      {
        title: "Orders, stock and customers",
        body: "See who bought what and which orders are paid. Stock updates as items sell, low items are flagged before they run out, and every customer's spend and last order are on record.",
      },
      {
        title: "Paid directly",
        body: "Checkout runs on Paystack, and every payment settles into the seller's own Paystack subaccount. Money never passes through Weblanda, and Weblanda takes no cut of sales.",
      },
      {
        title: "Analytics",
        body: "Sales, orders, products, customers and marketing on one date range, on a desktop or a phone.",
      },
      {
        title: "Its own address",
        body: "Every store runs on its own subdomain, such as veek3footies.weblanda.shop, with its own checkout and dashboard.",
      },
    ],
    howItWorks: [
      {
        title: "The seller sets up",
        body: "From the dashboard on their phone, the seller names the shop and adds products. The shop goes live on its own subdomain.",
      },
      {
        title: "Each address finds its store",
        body: "One Next.js app on Vercel serves every store. Wildcard subdomain routing reads the address a visitor arrived on and loads that store.",
      },
      {
        title: "A shopper checks out",
        body: "The shopper pays through Paystack. The payment settles into the seller's own subaccount, not into a Weblanda account.",
      },
      {
        title: "The seller fulfils the order",
        body: "The order lands in the seller's dashboard marked as paid, and stock updates on its own.",
      },
    ],
    architecture: {
      cols: 2,
      nodes: [
        {
          id: "seller",
          label: "Seller dashboard",
          detail: "On the seller's phone",
          kind: "serve",
          col: 1,
          row: 1,
        },
        { id: "shopper", label: "Shopper", detail: "yourshop.weblanda.shop", kind: "serve", col: 2, row: 1 },
        {
          id: "app",
          label: "Next.js on Vercel",
          detail: "Wildcard subdomain routing",
          kind: "compute",
          col: 1,
          row: 2,
          colSpan: 2,
        },
        { id: "db", label: "Supabase", detail: "PostgreSQL", kind: "store", col: 1, row: 3 },
        {
          id: "paystack",
          label: "Paystack checkout",
          detail: "Per-seller subaccounts",
          kind: "compute",
          col: 2,
          row: 3,
        },
        {
          id: "bank",
          label: "Seller's account",
          detail: "Paid directly, no cut",
          kind: "store",
          col: 2,
          row: 4,
        },
      ],
      edges: [
        { from: "seller", to: "app", label: "manage" },
        { from: "shopper", to: "app", label: "browse, buy" },
        { from: "app", to: "db", label: "SQL" },
        { from: "app", to: "paystack", label: "checkout" },
        { from: "paystack", to: "bank", label: "settles" },
      ],
    },
    stackWhy: [
      { tech: "Next.js (App Router)", why: "One app serves every storefront and every seller dashboard." },
      {
        tech: "Supabase (PostgreSQL)",
        why: "The database behind every shop's products, orders, stock and customers.",
      },
      {
        tech: "Vercel with wildcard subdomains",
        why: "Any subdomain reaches the same app, so a new shop gets its own address with no change to the infrastructure.",
      },
      {
        tech: "Paystack subaccounts",
        why: "Each seller has their own subaccount, which is what lets every payment go straight to the seller.",
      },
    ],
    challenges: [
      {
        title: "Many stores, one codebase",
        body: "Every shop needed its own address, checkout and dashboard without a separate deployment for each one. Wildcard subdomain routing lets a single Next.js app serve them all, so opening a new shop never touches the infrastructure.",
      },
      {
        title: "Never holding sellers' money",
        body: "Weblanda is designed so it never holds a seller's money. With Paystack subaccounts, each payment settles straight into the seller's own account, so there are no payouts to run and no cut to explain.",
      },
      {
        title: "A dashboard that fits a phone",
        body: "Everything a seller does had to work on a phone screen. Each dashboard screen focuses on one job: adding a product, checking orders, watching stock or seeing who buys.",
      },
      {
        title: "Building the business, not just the code",
        body: "Beyond the software, I registered the company as Weblanda Technologies Ltd, onboarded the first sellers across fashion, handmade accessories, furniture and gadgets, and set up their storefronts myself.",
      },
    ],
    learned: [
      "Deciding early that sellers are paid directly shaped checkout, payouts and onboarding across the whole platform.",
      "Setting up real sellers' storefronts myself showed me what a seller actually needs from a dashboard, and what they never touch.",
    ],
    galleryNote:
      "Every screen shows a demo shop with demo figures, not a real seller's business. Customer contact details are blurred.",
  },

  formtified: {
    facts: [
      { label: "Type", value: "AI SaaS web app" },
      { label: "Status", value: "Live at formtified.com" },
      { label: "Code", value: "Public on GitHub" },
      { label: "Built with", value: "Next.js 16 and Neon Postgres" },
    ],
    problem: [
      "Before a freelancer can quote a job or start work, they need the client's requirements in writing, and most of that comes from an intake questionnaire.",
      "Writing a fresh questionnaire for every kind of project is slow, and a generic one misses the details that matter for that particular job. Formtified's promise is its headline: know exactly what your client wants to build.",
    ],
    builtIntro:
      "Formtified turns one sentence about a client's project into a complete onboarding form with a share link. The client fills it in on their phone, and every response lands in the creator's dashboard.",
    built: [
      {
        title: "AI form generator",
        body: "The creator describes the project. The AI asks up to four quick clarifying questions, which can be skipped, then builds a tailored form.",
      },
      {
        title: "Share it anywhere",
        body: "Every form gets its own link, with sharing built for WhatsApp.",
      },
      {
        title: "A full form editor",
        body: "Reorder questions, change their type, mark them as required and add options.",
      },
      {
        title: "A form clients finish",
        body: "The client form works on a phone, with a progress bar that tracks the required answers.",
      },
      {
        title: "Responses and alerts",
        body: "Responses arrive in the creator's account with an in-app notification, an optional email alert and CSV export.",
      },
      {
        title: "Admin dashboard",
        body: "Users, subscribers, forms, site visits, announcements and an activity log of every admin change.",
      },
    ],
    howItWorks: [
      { title: "Describe", body: "The creator writes a sentence about the client's project." },
      {
        title: "Clarify",
        body: "A first AI call returns up to four clarifying questions, capped at 900 tokens.",
      },
      {
        title: "Generate",
        body: "A second call returns the form as compact JSON, capped at 4,000 tokens. The server expands and validates every field before saving it.",
      },
      {
        title: "Share",
        body: "The form gets a public link, ready to send to the client on WhatsApp or anywhere else.",
      },
      {
        title: "Collect",
        body: "The client submits, the answers are saved to Postgres, and the creator is notified in the app and, optionally, by email.",
      },
    ],
    architecture: {
      cols: 3,
      nodes: [
        { id: "creator", label: "Creator", detail: "Generator and editor", kind: "serve", col: 1, row: 1 },
        { id: "client", label: "Client", detail: "Public form link", kind: "serve", col: 3, row: 1 },
        {
          id: "app",
          label: "Next.js 16 on Vercel",
          detail: "Pages and API routes",
          kind: "compute",
          col: 1,
          row: 2,
          colSpan: 3,
        },
        { id: "ai", label: "AI provider", detail: "OpenAI-compatible", kind: "compute", col: 1, row: 3 },
        { id: "db", label: "Neon Postgres", detail: "Forms, responses", kind: "store", col: 2, row: 3 },
        { id: "email", label: "Resend", detail: "New response alert", kind: "serve", col: 3, row: 3 },
      ],
      edges: [
        { from: "creator", to: "app", label: "describe" },
        { from: "client", to: "app", label: "submit" },
        { from: "app", to: "ai", label: "2 calls" },
        { from: "app", to: "db", label: "SQL" },
        { from: "app", to: "email", label: "alert" },
      ],
    },
    stackWhy: [
      {
        tech: "Next.js 16 and TypeScript",
        why: "One project for the interface and the API routes, deployed to Vercel with no extra configuration.",
      },
      {
        tech: "Neon Postgres",
        why: "Plain SQL that can be read and run in Neon's SQL editor. The HTTP driver needs no connection pool, which suits serverless functions.",
      },
      {
        tech: "OpenAI-compatible AI API",
        why: "The AI code works with any OpenAI-compatible provider. Switching provider means changing three environment variables, not the code.",
      },
      {
        tech: "Email and password auth",
        why: "bcrypt for passwords and a signed session cookie (jose), so nobody needs a third-party account to sign in.",
      },
      {
        tech: "Resend",
        why: "Emails the creator when a client submits. It's optional: without it, in-app notifications still work.",
      },
      {
        tech: "Tailwind CSS v4",
        why: "Colours and fonts live in one file, so the whole look can change in one place.",
      },
    ],
    challenges: [
      {
        title: "Keeping AI costs down",
        body: "Each form uses two small AI calls with hard token caps. The model replies in JSON with one-letter keys, which cuts the output by about a third, and a low reasoning effort stops it spending tokens on thinking. Every call is logged with its tokens and time.",
      },
      {
        title: "Not trusting the model's output",
        body: "Nothing the model returns is saved as it comes back. The server expands the compact keys and validates every field first.",
      },
      {
        title: "Fair use before payments",
        body: "Each AI-generated form costs one credit, refunded automatically if generation fails, and a per-user hourly cap stops runaway use. Payments for credit packs are next.",
      },
      {
        title: "Counting visitors without cookies",
        body: "Site visits are counted with no cookies and no third-party tracker. A visitor is a daily hash of the date, IP address and browser, which can't be turned back into an IP.",
      },
    ],
    learned: [
      "Two small, structured AI calls are cheaper, faster and easier to check than one large open-ended prompt.",
      "Model output should be treated like user input: validated before it gets anywhere near the database.",
    ],
    scope:
      "Not in version one yet: payments for credit packs, password reset by email, file uploads in forms, and custom branding on public forms.",
    galleryNote: "All names, emails and figures in these screens are fictional demo data.",
  },

  biostreamer: {
    facts: [
      { label: "Type", value: "Hybrid data platform" },
      { label: "Grounded in", value: "My 2024 co-authored paper" },
      { label: "Scale", value: "100 reactors × 37 days" },
      { label: "Code", value: "Public on GitHub" },
    ],
    problem: [
      "A 36-digester anaerobic digestion study, observed daily for 37 days, needs more than 1,300 manual water-displacement readings. Each one is read off a calibrated cylinder and typed into a spreadsheet by hand.",
      "That logging burden, not the number of digesters, is what limits how large a study a small lab can run. The study BioStreamer is built on is one I co-authored on co-digesting bean and plantain peels, published in GSC Biological and Pharmaceutical Sciences in 2024.",
      "BioStreamer asks what that research looks like when collecting and interpreting the data is automated for a fleet an order of magnitude larger, while staying accountable to the published results.",
    ],
    builtIntro:
      "BioStreamer simulates, stores and reasons over daily telemetry for 100 bioreactor lines: pH, volatile fatty acids, alkalinity and biogas yield. A retrieval layer over the research literature sits beside it, so numbers and explanations both come from verified sources, never from a language model's memory.",
    built: [
      {
        title: "Mechanistic simulator",
        body: "A coupled acidogenesis and methanogenesis model generates 37 days of telemetry for 100 reactors, across a continuous range of bean to plantain ratios at 5 to 25% total solids.",
      },
      {
        title: "Two ingestion tracks",
        body: "Telemetry lands as Parquet in a MinIO lake and loads into PostgreSQL. Research text is chunked, embedded and indexed in Qdrant.",
      },
      {
        title: "Validation gates",
        body: "Airflow refuses to load a dataset unless the 36 reference reactors reproduce the paper's published yields, and won't mark indexing complete unless retrieval probes return the right source type.",
      },
      {
        title: "Hybrid answers",
        body: "A FastAPI /chat endpoint combines exact SQL aggregates with ranked literature passages, then asks the language model to compose an answer from both.",
      },
      {
        title: "Traceable claims",
        body: "Every answer ships with its retrieval trace. Each passage is tagged as a published finding from the paper or as general domain context, so a claim can't be mistaken for a result the study didn't report.",
      },
      {
        title: "Streamlit dashboard",
        body: "A fleet overview, a reactor explorer and a research chat that shows its retrieval trace.",
      },
    ],
    howItWorks: [
      {
        title: "Simulate",
        body: "A seeded simulator produces 100 reactors × 37 days of telemetry. A mechanistic pass sets the shape of each reactor's daily output, then a second pass calibrates the 36 reference reactors to the paper's Table 2 means.",
      },
      {
        title: "Validate, then load",
        body: "Airflow compares the reference cohort with all twelve cells of Table 2. Only if it passes does the data land in MinIO as Parquet and load into PostgreSQL.",
      },
      {
        title: "Index the literature",
        body: "A second DAG splits the paper and domain notes into chunks of 512 with an overlap of 64, embeds them as 384-dimension vectors and indexes them in Qdrant.",
      },
      {
        title: "Answer",
        body: "Every /chat question runs both retrievals: SQL for exact numbers, vector search for mechanism. The model composes the answer from that labelled context instead of doing the arithmetic itself.",
      },
      {
        title: "Explore",
        body: "Streamlit shows the fleet, any single reactor and the research chat. With no language model key set, /chat still returns the retrieved passages and aggregates.",
      },
    ],
    stackWhy: [
      {
        tech: "PostgreSQL 15",
        why: "Reactor config and daily telemetry, with CHECK constraints that encode the scientific envelope.",
      },
      {
        tech: "Qdrant",
        why: "The literature's vector store: cosine distance over 384-dimension embeddings.",
      },
      { tech: "MinIO", why: "An S3-compatible landing zone for raw telemetry Parquet, the bronze layer." },
      { tech: "Apache Airflow 2.8", why: "Two DAGs, each with a validation task in its critical path." },
      {
        tech: "all-MiniLM-L6-v2",
        why: "An embedding model that runs on a CPU, at roughly 16 ms per query once loaded.",
      },
      { tech: "FastAPI", why: "Structured endpoints plus the hybrid /chat route." },
      {
        tech: "Anthropic Claude",
        why: "Synthesis only. It never sees a question without grounding, and the platform works without it.",
      },
      { tech: "Streamlit and Plotly", why: "The fleet overview, reactor explorer and research chat." },
      { tech: "NumPy and pandas", why: "The kinetic model, with a modified Gompertz envelope." },
    ],
    challenges: [
      {
        title: "Hybrid, not vector-only",
        body: "A vector store can find a passage that discusses yields, but it can't compute a mean over 3,700 telemetry rows. SQL returns exact numbers with no explanation. Running both and labelling the context lets the model explain without doing the arithmetic.",
      },
      {
        title: "Failing closed",
        body: "A pipeline that quietly drifts from the ground truth is worse than one that stops. Both DAGs fail closed: no load unless the reference cohort matches the paper, and no finished index unless retrieval returns the right provenance.",
      },
      {
        title: "Being precise about what matches",
        body: "The 36 reference reactors match the paper's yields largely by construction, because they are calibrated to it. The leftover gap, at most 0.042 ml/day across twelve cells, measures calibration precision, not predictive accuracy. What the model decides on its own is which reactors sour and when: 361 soured reactor-days above roughly 20% total solids, and none inside the published range.",
      },
      {
        title: "Degrading gracefully",
        body: "In testing, an exhausted API key made the language model call fail. /chat reported the billing error and still returned the full retrieval context, instead of failing the request.",
      },
    ],
    learned: [
      "Ground truth belongs inside the pipeline. A validation gate in the DAG catches drift that a one-off check would miss.",
      "Be precise about what a number proves. Calibration precision and predictive accuracy are different claims, and the page should say which one it's making.",
    ],
    galleryNote:
      "These screenshots come from a different simulation run, so a few figures differ slightly from the ones quoted above.",
  },

  agropulse: {
    facts: [
      { label: "Type", value: "Streaming and batch pipeline" },
      { label: "Data", value: "Simulated field sensors" },
      { label: "Landing page", value: "Live on Netlify" },
      { label: "Code", value: "Public on GitHub" },
    ],
    problem: [
      "A commercial farm operator wants one live picture of a field instead of separate spreadsheets, gut instinct and a walk along the fence line.",
      "Sensor gateways can report soil moisture, canopy temperature, nitrogen and irrigation draw in near real time. That data has two jobs: an operational dashboard for reacting to today, and a forecast that projects the season's yield from what has built up so far.",
    ],
    builtIntro:
      "AgroPulse started as a landing page for a fictional precision agriculture company and grew into a working demo of the full data path behind it, on simulated sensor data.",
    built: [
      {
        title: "Sensor simulator",
        body: "Sends JSON readings for soil moisture, canopy temperature, nitrogen and irrigation to a Kafka topic, a new reading every few seconds.",
      },
      {
        title: "ETL consumer",
        body: "Subscribes to the topic, cleans and transforms each reading, and writes it to TimescaleDB.",
      },
      {
        title: "Nightly forecast",
        body: "An Airflow DAG recomputes yield forecasts every night from the readings collected so far.",
      },
      {
        title: "Serving layer",
        body: "FastAPI endpoints for each field's latest readings and its yield forecast.",
      },
      {
        title: "Product UI",
        body: "A React 19 and TypeScript landing page with a field card, soil analytics and an ROI calculator, built with Tailwind CSS v4, Framer Motion and Recharts.",
      },
    ],
    howItWorks: [
      {
        title: "Ingest",
        body: "The simulator publishes readings to the field.readings topic on Kafka (Redpanda).",
      },
      { title: "Process", body: "The ETL consumer cleans each reading and writes it to TimescaleDB." },
      {
        title: "Recompute",
        body: "Airflow runs a nightly batch job that updates each field's yield forecast.",
      },
      {
        title: "Serve",
        body: "FastAPI reads TimescaleDB and returns the latest readings and forecasts over HTTP.",
      },
      {
        title: "Run anywhere",
        body: "Each stage runs in its own container, wired together with Docker Compose, and the repo opens in GitHub Codespaces with everything installed.",
      },
    ],
    stackWhy: [
      { tech: "Kafka (Redpanda)", why: "The message broker between the sensors and processing." },
      { tech: "TimescaleDB", why: "Postgres with time-series support, for live and historical queries." },
      { tech: "Apache Airflow", why: "Runs the nightly forecast recompute, in standalone mode." },
      { tech: "FastAPI", why: "Serves latest readings and yield forecasts." },
      {
        tech: "React 19, Vite and Tailwind CSS v4",
        why: "The product UI, with Framer Motion for animation and Recharts for charts.",
      },
      {
        tech: "Docker Compose and Codespaces",
        why: "Every service in its own container, and a devcontainer that installs Node, Python and Docker.",
      },
    ],
    challenges: [
      {
        title: "Five services on a free Codespace",
        body: "Running all five backend services and the frontend at once is memory-heavy on a free Codespace. I built and checked each stage only against what it directly depends on, and brought the whole stack up together only for the final end-to-end test.",
      },
      {
        title: "Checking every hop",
        body: "Each stage has its own check: watching messages arrive on the topic, querying what landed in TimescaleDB, calling the API, and triggering the DAG by hand instead of waiting for its schedule.",
      },
    ],
    learned: [
      "Build a pipeline one hop at a time. A failure in one stage is far easier to read than a failure somewhere in five.",
    ],
    scope:
      "A working demo of the ingestion, ETL, storage, batch and serving pattern on simulated data. It isn't a production SaaS: there's no real hardware, no multi-tenancy, no billing, and the forecast is a simple heuristic rather than a trained model. The landing page still runs on mock data; wiring it to the live API is next.",
  },

  "bioflow-iot": {
    facts: [
      { label: "Type", value: "Real-time streaming pipeline" },
      { label: "Data", value: "Simulated bioreactor sensors" },
      { label: "Dashboard refresh", value: "Every 1.5 seconds" },
      { label: "Code", value: "Public on GitHub" },
    ],
    problem: [
      "A lab or bioreactor operator needs to watch flow rate, temperature and pH continuously instead of checking readings by hand at intervals.",
      "Missing a drift in those values, even for a short window, can mean a failed batch or an unsafe condition that nobody notices.",
    ],
    builtIntro:
      "BioFlow IoT simulates that monitoring problem end to end: readings are generated continuously, streamed through Kafka, stored in PostgreSQL for history, and served to a live dashboard.",
    built: [
      {
        title: "Bio-sensor simulator",
        body: "A Python service that generates flow rate, temperature and pH readings, mocking real bioreactor fluctuation.",
      },
      {
        title: "Event streaming",
        body: "Readings travel as JSON packets through a Kafka broker.",
      },
      {
        title: "Database consumer",
        body: "Subscribes to the stream and writes every reading to PostgreSQL, with timestamp indexes.",
      },
      {
        title: "API bridge",
        body: "FastAPI endpoints for the 50 most recent records and the single latest reading, with interactive Swagger docs.",
      },
      {
        title: "Live dashboard",
        body: "A React and Tailwind CSS v4 dashboard that polls the API every 1.5 seconds.",
      },
    ],
    howItWorks: [
      { title: "Generate", body: "The simulator produces a new reading of flow rate, temperature and pH." },
      { title: "Stream", body: "Each reading goes to Kafka as a JSON packet." },
      { title: "Persist", body: "The consumer subscribes and writes each reading to PostgreSQL." },
      { title: "Serve", body: "FastAPI queries PostgreSQL for the latest and recent readings." },
      { title: "Watch", body: "The dashboard polls the API every 1.5 seconds and updates the metrics." },
    ],
    stackWhy: [
      { tech: "Python", why: "The sensor simulator and the database consumer." },
      { tech: "Apache Kafka", why: "Event streaming between the simulator and storage." },
      { tech: "PostgreSQL", why: "Relational storage with timestamp indexes." },
      { tech: "FastAPI", why: "Fast, self-documenting endpoints between the database and the UI." },
      { tech: "React and Tailwind CSS v4", why: "A responsive dashboard that polls for new metrics." },
      { tech: "Docker Compose", why: "Starts Kafka and PostgreSQL with one command." },
    ],
    challenges: [
      {
        title: "Keeping operators away from the plumbing",
        body: "Operators watch the dashboard without access to the database or the sensors. The API bridge is the only part that reads PostgreSQL.",
      },
      {
        title: "Quick reads as the data grows",
        body: "Readings are stored with timestamp indexes, so fetching the latest record and recent history stays fast as the table grows.",
      },
    ],
    learned: [
      "Separating producing, storing and serving data into their own services makes each one simple to run, watch and replace.",
    ],
    scope:
      "A working demonstration of the ingestion, streaming, storage and serving pattern a real lab monitoring system would use, on simulated data. There's no real hardware, no authentication on the API, no alerting and no validation beyond basic type checks.",
  },

  "api-to-sql-etl": {
    facts: [
      { label: "Type", value: "Batch ETL pipeline" },
      { label: "Source", value: "RandomUser.me API" },
      { label: "Runs in", value: "Docker" },
      { label: "Milestone", value: "My first data engineering project" },
    ],
    problem: [
      "Raw data from external APIs is rarely ready to use. It arrives nested, inconsistently formatted and full of fields nobody needs.",
      "This project takes on a common early data engineering task: turning an unreliable external source into records a database and its users can rely on, on a repeatable basis rather than as a one-off script.",
    ],
    builtIntro:
      "A containerised pipeline that pulls user profiles from a live public API, cleans and standardises them with Python, and loads them into a local SQL warehouse with an idempotent load.",
    built: [
      {
        title: "Extract",
        body: "Pulls 10 raw user profiles per run from the RandomUser.me API and saves the untouched payload to a landing zone.",
      },
      {
        title: "Transform",
        body: "Flattens the nested JSON, drops fields that aren't needed, lowercases emails and capitalises names.",
      },
      {
        title: "Load",
        body: "Writes to a users table in SQLite with UPSERT, so a rerun updates records instead of duplicating them.",
      },
      {
        title: "One entry point",
        body: "A single main.py runs the three steps in order, inside a Docker container.",
      },
    ],
    howItWorks: [
      {
        title: "Request",
        body: "extract.py calls the API over HTTP and writes raw_users.json to the data folder.",
      },
      { title: "Clean", body: "transform.py reads the raw file and produces flat, standardised records." },
      { title: "Upsert", body: "load.py writes them to SQLite with ON CONFLICT DO UPDATE." },
      {
        title: "Persist",
        body: "A volume mount keeps the database file on the host after the container exits.",
      },
    ],
    stackWhy: [
      { tech: "Python", why: "Extraction and transformation logic." },
      { tech: "Requests", why: "HTTP calls to the API." },
      { tech: "SQLite", why: "A lightweight relational database for the local warehouse." },
      { tech: "Docker", why: "Runs the same way on any machine." },
    ],
    challenges: [
      {
        title: "Messy nested JSON",
        body: "The API returns nested objects, so names and other fields have to be pulled out and flattened before they fit a relational table.",
      },
      {
        title: "Safe reruns",
        body: "Running the pipeline twice shouldn't create duplicates or crash. UPSERT makes every run idempotent, the same pattern production pipelines rely on.",
      },
    ],
    learned: [
      "Keeping the raw data in its own landing zone, apart from processed records, makes every run easy to inspect and repeat.",
      "Idempotency matters from the very first pipeline, not only in production.",
    ],
    scope:
      "A learning project, not a production system. Next on the list: scheduling with Airflow, PostgreSQL in place of SQLite, unit tests for the transform step and structured logging.",
  },
};
