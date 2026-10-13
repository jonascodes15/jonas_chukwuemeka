import { caseStudies } from "./caseStudies";
import type { DataProject, Screenshot } from "./types";

/**
 * Data engineering and research projects for the Data section.
 * Every data project must have a GitHub link, and screenshots or an architecture diagram.
 * To add one (for example a health data or EHR project), append an object to this array.
 * Only use real, verifiable numbers in `metrics`.
 */

const shot = (
  dir: string,
  name: string,
  width: number,
  height: number,
  alt: string,
  caption: string,
): Screenshot => {
  const widths = [400, 560, 800, 1024, 1440].filter((w) => w < width);
  return { dir, name, widths: [...widths, width], width, height, alt, caption, device: "desktop" };
};

export const dataProjects: DataProject[] = [
  {
    slug: "biostreamer",
    name: "BioStreamer",
    featured: true,
    tagline: "My own peer-reviewed anaerobic digestion research, turned into a hybrid data platform.",
    summary:
      "BioStreamer models daily bioreactor telemetry (pH, volatile fatty acids, alkalinity and biogas yield) for 100 simulated reactor lines, grounded in the co-digestion study I co-authored. Structured data and research literature flow through separate pipelines and meet in one API.",
    highlights: [
      "Structured track: telemetry lands as Parquet in MinIO, then loads into PostgreSQL.",
      "Unstructured track: research literature is chunked, embedded and searchable through a RAG layer on Qdrant.",
      "Airflow DAGs orchestrate both tracks, with validation gates that fail closed unless reference reactors reproduce the study's published yields.",
      "A FastAPI hybrid endpoint combines SQL aggregates with vector search, explored in a Streamlit dashboard, and degrades gracefully when no language model key is set.",
    ],
    // TODO: the fleet-overview screenshot reads 0.029 ml/day and 266 soured reactor-days, while the README
    // says 0.042 ml/day and 361. The README figure is used here; retake the screenshot from the same run.
    // TODO: ~27,000 rows/s comes from the CV and is not in the README. Confirm it.
    metrics: [
      {
        value: 0.042,
        decimals: 3,
        suffix: " ml/day",
        label: "Maximum deviation from the paper's published yields",
      },
      { value: 27000, prefix: "~", suffix: " rows/s", label: "Pipeline throughput on ~3,700 rows" },
      { value: 100, label: "Simulated bioreactor lines" },
    ],
    stack: [
      "Python",
      "Airflow",
      "PostgreSQL",
      "MinIO",
      "Parquet",
      "Qdrant",
      "FastAPI",
      "Streamlit",
      "Docker",
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/jonascodes15/biostreamer", kind: "github" },
      { label: "Read the paper", href: "https://doi.org/10.30574/gscbps.2024.29.2.0423", kind: "paper" },
    ],
    screenshots: [
      shot(
        "/projects/biostreamer",
        "fleet-overview",
        1600,
        1000,
        "BioStreamer's fleet overview: simulated yields for 36 reference reactors next to the paper's published Table 2",
        "Fleet overview: the reference cohort checked cell by cell against the published Table 2.",
      ),
      shot(
        "/projects/biostreamer",
        "reactor-explorer",
        1600,
        1000,
        "BioStreamer's reactor explorer: cumulative and daily biogas yield over 30 days for reactor R001",
        "Reactor explorer: daily and cumulative yield for a single reactor line.",
      ),
      // From the repo's docs/screenshots. Shown on the case study only (the homepage card shows two).
      shot(
        "/projects/biostreamer",
        "research-chat",
        1600,
        1000,
        "BioStreamer's research chat reporting a failed language model call and returning its retrieval trace anyway",
        "Research chat: with the API key out of credit, it reports the error and still returns the retrieval trace.",
      ),
    ],
    architecture: {
      cols: 2,
      nodes: [
        {
          id: "airflow",
          label: "Apache Airflow",
          detail: "Validates both tracks against the paper",
          kind: "orchestrate",
          col: 1,
          row: 1,
          colSpan: 2,
        },
        {
          id: "sim",
          label: "Telemetry simulator",
          detail: "100 reactors × 37 days",
          kind: "source",
          col: 1,
          row: 2,
        },
        {
          id: "corpus",
          label: "Literature corpus",
          detail: "Paper text and domain notes",
          kind: "source",
          col: 2,
          row: 2,
        },
        { id: "minio", label: "MinIO lake", detail: "Parquet, bronze layer", kind: "store", col: 1, row: 3 },
        {
          id: "embed",
          label: "Chunk and embed",
          detail: "512/64 chunks, 384-d vectors",
          kind: "compute",
          col: 2,
          row: 3,
        },
        {
          id: "pg",
          label: "PostgreSQL",
          detail: "Reactor config and telemetry",
          kind: "store",
          col: 1,
          row: 4,
        },
        { id: "qdrant", label: "Qdrant", detail: "Cosine vector index", kind: "store", col: 2, row: 4 },
        {
          id: "api",
          label: "FastAPI hybrid RAG",
          detail: "SQL aggregates + ranked passages",
          kind: "serve",
          col: 1,
          row: 5,
          colSpan: 2,
        },
        {
          id: "ui",
          label: "Streamlit UI",
          detail: "Fleet, reactors, research chat",
          kind: "serve",
          col: 1,
          row: 6,
          colSpan: 2,
        },
      ],
      edges: [
        { from: "airflow", to: "sim", control: true },
        { from: "airflow", to: "corpus", control: true },
        { from: "sim", to: "minio", label: "Parquet" },
        { from: "minio", to: "pg", label: "load" },
        { from: "corpus", to: "embed", label: "split" },
        { from: "embed", to: "qdrant", label: "upsert" },
        { from: "pg", to: "api", label: "SQL" },
        { from: "qdrant", to: "api", label: "vectors" },
        { from: "api", to: "ui", label: "/chat" },
      ],
    },
    caseStudy: caseStudies.biostreamer,
  },
  {
    slug: "agropulse",
    name: "AgroPulse",
    tagline: "A precision agriculture data platform, from sensor stream to dashboard.",
    summary:
      "Streams simulated soil moisture, canopy temperature, nitrogen and irrigation readings through Kafka (Redpanda) into TimescaleDB for real-time and historical analysis, with a nightly Airflow DAG that recomputes yield forecasts.",
    highlights: [
      "Nightly Airflow DAG recomputes yield forecasts from accumulated sensor data, with no manual runs.",
      // The README's roadmap says the UI still runs on mock data, so "live" is left out here.
      "FastAPI serves the latest readings and yield forecasts; the React and TypeScript UI is built with Recharts.",
      "All five backend services run with Docker Compose, so the whole stack starts with one command.",
    ],
    stack: [
      "Python",
      "Kafka (Redpanda)",
      "Airflow",
      "TimescaleDB",
      "FastAPI",
      "React",
      "TypeScript",
      "Docker",
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/jonascodes15/agropulse", kind: "github" },
      { label: "Live site", href: "https://agropulsehq.netlify.app", kind: "live" },
    ],
    screenshots: [
      shot(
        "/projects/agropulse",
        "hero",
        1874,
        844,
        "AgroPulse's landing page with a live sensor card streaming soil moisture, canopy temperature, nitrogen and irrigation readings",
        "A live field card streaming four sensor readings.",
      ),
      shot(
        "/projects/agropulse",
        "soil-analytics",
        1872,
        874,
        "AgroPulse's soil analytics view: a field grid coloured healthy, watch or stressed",
        "Soil analytics: every block of a field coloured by stress level.",
      ),
      shot(
        "/projects/agropulse",
        "roi-calculator",
        1852,
        868,
        "AgroPulse's ROI calculator estimating water saved, cost savings and yield uplift from farm size and crop type",
        "An ROI estimate from farm size and crop type.",
      ),
    ],
    architecture: {
      cols: 3,
      nodes: [
        { id: "sensors", label: "Sensor simulator", kind: "source", col: 1, row: 1 },
        { id: "ui", label: "React dashboard", kind: "serve", col: 3, row: 1 },
        { id: "kafka", label: "Kafka topic", detail: "field.readings", kind: "stream", col: 1, row: 2 },
        { id: "api", label: "FastAPI", kind: "serve", col: 3, row: 2 },
        { id: "etl", label: "ETL consumer", detail: "Clean and transform", kind: "compute", col: 1, row: 3 },
        { id: "airflow", label: "Airflow", detail: "Nightly recompute", kind: "orchestrate", col: 2, row: 3 },
        { id: "db", label: "TimescaleDB", kind: "store", col: 1, row: 4, colSpan: 3 },
      ],
      edges: [
        { from: "sensors", to: "kafka", label: "JSON" },
        { from: "kafka", to: "etl", label: "stream" },
        { from: "etl", to: "db", label: "write" },
        { from: "airflow", to: "db", control: true },
        { from: "ui", to: "api", label: "GET" },
        { from: "api", to: "db", label: "SQL" },
      ],
    },
    caseStudy: caseStudies.agropulse,
  },
  {
    slug: "bioflow-iot",
    name: "BioFlow IoT",
    tagline: "A real-time bioreactor telemetry pipeline.",
    summary:
      "Streams flow rate, temperature and pH readings from a Python simulator through Kafka into PostgreSQL with timestamp indexing, served by FastAPI to a React dashboard that polls every 1.5 seconds.",
    highlights: [
      "Timestamp-indexed PostgreSQL schema for efficient range queries.",
      "FastAPI endpoints for the 50 most recent records and the latest reading.",
      // Per the README, only Kafka and PostgreSQL run in Docker Compose; the rest are Python processes.
      "Kafka and PostgreSQL start with Docker Compose; the simulator, consumer and API run as separate Python services.",
    ],
    stack: ["Python", "Kafka", "PostgreSQL", "FastAPI", "React", "Docker"],
    links: [{ label: "View on GitHub", href: "https://github.com/jonascodes15/bioflow_iot", kind: "github" }],
    // From the repo's docs/dashboard-screenshot.png, with the browser's address bar cropped off.
    screenshots: [
      shot(
        "/projects/bioflow-iot",
        "dashboard",
        1750,
        568,
        "The BioFlow IoT dashboard streaming flow rate, temperature and pH readings",
        "The live dashboard: flow rate, temperature and pH, refreshed every 1.5 seconds.",
      ),
    ],
    architecture: {
      cols: 2,
      nodes: [
        { id: "sim", label: "Bio-sensor simulator", kind: "source", col: 1, row: 1 },
        { id: "ui", label: "React dashboard", kind: "serve", col: 2, row: 1 },
        { id: "kafka", label: "Kafka broker", kind: "stream", col: 1, row: 2 },
        { id: "api", label: "FastAPI", kind: "serve", col: 2, row: 2 },
        { id: "consumer", label: "DB consumer", kind: "compute", col: 1, row: 3 },
        { id: "pg", label: "PostgreSQL", kind: "store", col: 1, row: 4, colSpan: 2 },
      ],
      edges: [
        { from: "sim", to: "kafka", label: "JSON" },
        { from: "kafka", to: "consumer", label: "stream" },
        { from: "consumer", to: "pg", label: "write" },
        { from: "ui", to: "api", label: "poll 1.5s" },
        { from: "api", to: "pg", label: "SQL" },
      ],
    },
    caseStudy: caseStudies["bioflow-iot"],
  },
  {
    slug: "api-to-sql-etl",
    name: "API to SQL ETL Pipeline",
    tagline: "An idempotent, containerised ETL pipeline from a live REST API to SQL.",
    summary:
      "Extracts user profiles from a live REST API, flattens deeply nested JSON, standardises field formatting and loads clean records into a SQLite warehouse.",
    highlights: [
      "UPSERT logic (ON CONFLICT DO UPDATE) makes repeated runs safe, with no duplicate records.",
      "Three separate phases (extract, transform, load), each in its own module, run in order from one entry point.",
    ],
    stack: ["Python", "SQLite", "Docker"],
    links: [
      {
        label: "View on GitHub",
        href: "https://github.com/jonascodes15/api-to-sql-etl-pipeline",
        kind: "github",
      },
    ],
    screenshots: [],
    architecture: {
      cols: 3,
      nodes: [
        { id: "rest", label: "REST API", kind: "source", col: 1, row: 1 },
        { id: "extract", label: "Extract", kind: "compute", col: 2, row: 1 },
        { id: "transform", label: "Transform", detail: "Flatten JSON", kind: "compute", col: 3, row: 1 },
        { id: "sqlite", label: "SQLite", kind: "store", col: 2, row: 2 },
        { id: "load", label: "Load", detail: "UPSERT", kind: "compute", col: 3, row: 2 },
      ],
      edges: [
        { from: "rest", to: "extract" },
        { from: "extract", to: "transform" },
        { from: "transform", to: "load" },
        { from: "load", to: "sqlite" },
      ],
    },
    caseStudy: caseStudies["api-to-sql-etl"],
  },
];

export function getDataProject(slug: string) {
  return dataProjects.find((p) => p.slug === slug);
}
