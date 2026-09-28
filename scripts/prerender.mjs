import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "vite";

import { render } from "../dist/server/entry-server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, "../dist");

const templatePath = path.join(distPath, "index.html");

const template = fs.readFileSync(templatePath, "utf-8");

// Load VITE_API_BASE_URL from .env
const env = loadEnv("production", process.cwd(), "");

const API_BASE_URL = env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is missing. Add it to your .env file."
  );
}

console.log("API:", API_BASE_URL);


// --------------------------------------------------
// Create product slug
// --------------------------------------------------

function createProductSlug(product) {
  return (product.name || product.title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


// --------------------------------------------------
// Static routes
// --------------------------------------------------

const routes = [
  "/",
  "/About_Us",
  "/Contact_Us",
  "/Zyora_Category",
];


// --------------------------------------------------
// Get output path
// --------------------------------------------------

function getOutputPath(route) {
  if (route === "/") {
    return path.join(distPath, "index.html");
  }

  return path.join(
    distPath,
    route.replace(/^\//, ""),
    "index.html"
  );
}


// --------------------------------------------------
// Fetch products
// --------------------------------------------------

async function getProducts() {
  console.log("Fetching products...");

  const response = await fetch(
    `${API_BASE_URL}/api/products/get_products`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products: ${response.status} ${response.statusText}`
    );
  }

  const products = await response.json();

  if (!Array.isArray(products)) {
    throw new Error("Products API did not return an array.");
  }

  console.log(`Found ${products.length} products.`);

  return products;
}


// --------------------------------------------------
// Render route
// --------------------------------------------------

function writeRoute(route, products = null) {
  console.log(`Prerendering: ${route}`);

  const { html, helmet } = render(route, products);

  let finalHtml = template;

  finalHtml = finalHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${html}</div>`
  );

  finalHtml = finalHtml.replace(
    /<title>.*?<\/title>/i,
    ""
  );

  finalHtml = finalHtml.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    ""
  );

  finalHtml = finalHtml.replace(
    /<link\s+rel=["']canonical["'][^>]*>/i,
    ""
  );

  const helmetTags = helmet
    ? `
      ${helmet.title?.toString() || ""}
      ${helmet.meta?.toString() || ""}
      ${helmet.link?.toString() || ""}
    `
    : "";

  finalHtml = finalHtml.replace(
    "</head>",
    `${helmetTags}</head>`
  );

  const outputPath = getOutputPath(route);

  const outputDirectory = path.dirname(outputPath);

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  fs.writeFileSync(
    outputPath,
    finalHtml,
    "utf-8"
  );

  console.log(`Created: ${outputPath}`);
}


// --------------------------------------------------
// Main SSG process
// --------------------------------------------------

async function prerender() {

  // Static pages
  for (const route of routes) {
    writeRoute(route);
  }


  // Fetch products
  const products = await getProducts();


  // Product pages
  for (const product of products) {

    const productId = product.id || product._id;

    const slug = createProductSlug(product);

    if (!productId || !slug) {
      console.warn(
        "Skipping product because ID or slug is missing:",
        product
      );

      continue;
    }

    const route =
      `/Zyora_Category/product/${productId}/${slug}`;

    writeRoute(route, products);
  }

  console.log("✅ SSG prerendering completed.");
}

prerender().catch((error) => {
  console.error("❌ SSG prerendering failed:");
  console.error(error);

  process.exit(1);
});