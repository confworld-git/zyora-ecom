import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { render } from "../dist/server/entry-server.js";
import {
  createProductPath,
  createProductSlug,
  createProductUrl,
  getProductId,
  PRODUCT_ROUTE_BASE,
} from "../src/utils/productSlug.js";
import { createProductSeoTitle } from "../src/utils/productSeo.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const distDirectory = path.join(projectDirectory, "dist");
const templatePath = path.join(distDirectory, "index.html");
const productionEnv = loadEnv("production", projectDirectory, "");

const requiredUrl = (value, variableName) => {
  if (!value) {
    throw new Error(`${variableName} is missing from the production environment.`);
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL.`);
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${variableName} must be an HTTPS URL without credentials.`);
  }

  return url;
};

const apiBaseUrl = requiredUrl(
  productionEnv.VITE_API_BASE_URL,
  "VITE_API_BASE_URL",
);
if (apiBaseUrl.hostname !== "backend.zyoraecom.in") {
  throw new Error(
    "VITE_API_BASE_URL must point to the configured ZYORA backend API.",
  );
}

const siteUrl = requiredUrl(
  productionEnv.VITE_API_DOMAIN || "https://zyoraecom.in",
  "VITE_API_DOMAIN",
);
if (siteUrl.hostname !== "zyoraecom.in") {
  throw new Error("VITE_API_DOMAIN must point to the ZYORA frontend domain.");
}
siteUrl.pathname = "/";
siteUrl.search = "";
siteUrl.hash = "";
const canonicalSiteUrl = siteUrl.origin;

const staticRoutes = [
  "/",
  "/About_Us",
  "/Contact_Us",
  "/Zyora_Category",
  "/Jewellery",
  "/policies",
];
const productsEndpoint = new URL(
  "/api/products/get_products",
  apiBaseUrl.origin,
);
const productRoutePattern = new RegExp(
  `^${PRODUCT_ROUTE_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/([^/]+)/([a-z0-9]+(?:-[a-z0-9]+)*)$`,
);

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getOutputPath = (route) => {
  if (!route.startsWith("/") || route.includes("?") || route.includes("#")) {
    throw new Error(`Invalid prerender route: ${route}`);
  }

  let segments;
  try {
    segments = route
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
  } catch {
    throw new Error(`Invalid encoded path segment in prerender route: ${route}`);
  }

  if (
    segments.some(
      (segment) =>
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment.includes("\0"),
    )
  ) {
    throw new Error(`Unsafe path segment in prerender route: ${route}`);
  }

  const outputPath = path.resolve(distDirectory, ...segments, "index.html");
  const outputPrefix = `${distDirectory}${path.sep}`;
  if (
    outputPath !== path.join(distDirectory, "index.html") &&
    !outputPath.startsWith(outputPrefix)
  ) {
    throw new Error(`Prerender route resolves outside dist: ${route}`);
  }

  return outputPath;
};

const getProducts = async () => {
  console.log("Fetching products from the configured backend API...");

  let response;
  try {
    response = await fetch(productsEndpoint, {
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new Error(`Products API request failed: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(
      `Products API returned HTTP ${response.status} ${response.statusText}.`,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`Products API returned invalid JSON: ${error.message}`);
  }

  const products = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.products)
      ? payload.products
      : null;
  if (!products) {
    throw new Error(
      "Products API response must be an array or an object containing a products array.",
    );
  }

  const productIds = new Set();
  products.forEach((product, index) => {
    const productId = getProductId(product);
    const productName = product?.name || product?.title;

    if (
      !product ||
      typeof product !== "object" ||
      (typeof productId !== "string" && typeof productId !== "number") ||
      String(productId).trim() === "" ||
      typeof productName !== "string" ||
      productName.trim() === ""
    ) {
      throw new Error(
        `Products API returned an invalid product at array index ${index}: each product needs an id or _id and a name or title.`,
      );
    }

    const productKey = String(productId);
    const route = createProductPath(product);
    let decodedId;
    try {
      decodedId = decodeURIComponent(route.match(productRoutePattern)?.[1] || "");
    } catch {
      throw new Error(
        `Products API returned an invalid product ID at array index ${index}.`,
      );
    }
    if (
      !route ||
      !productRoutePattern.test(route) ||
      decodedId !== productKey ||
      !route.endsWith(`/${createProductSlug(product)}`)
    ) {
      throw new Error(
        `Products API returned an invalid product route at array index ${index}: ${route}.`,
      );
    }
    if (productIds.has(productKey)) {
      throw new Error(`Products API returned duplicate product ID: ${productKey}`);
    }
    productIds.add(productKey);
  });

  console.log(`Validated ${products.length} products.`);
  return products;
};

const removeTemplateSeo = (html) =>
  html
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(
      /<meta\b(?=[^>]*\b(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'])[^>]*>\s*/gi,
      "",
    )
    .replace(
      /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi,
      "",
    );

const serializeProducts = (products) =>
  JSON.stringify(products)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const writeRoute = (route, products, template) => {
  console.log(`Prerendering ${route}`);

  const { html, head, helmet } = render(route, products);

  let outputHtml = removeTemplateSeo(template);
  const rootPattern = /<div id="root">\s*<\/div>/;
  if (!rootPattern.test(outputHtml)) {
    throw new Error("Production HTML template is missing an empty #root element.");
  }
  outputHtml = outputHtml.replace(
    rootPattern,
    `<div id="root">${html}</div>`,
  );

  const helmetTags = [
    head,
    helmet?.title?.toString(),
    helmet?.meta?.toString(),
    helmet?.link?.toString(),
    helmet?.script?.toString(),
  ]
    .filter(Boolean)
    .join("\n");
  if (!/<title\b/i.test(helmetTags)) {
    throw new Error(`Title metadata was not rendered for route ${route}.`);
  }
  if (!/<\/head>/i.test(outputHtml)) {
    throw new Error("Production HTML template is missing </head>.");
  }
  outputHtml = outputHtml.replace(
    /<\/head>/i,
    `${helmetTags}\n</head>`,
  );

  const initialProductsScript = `<script>window.__ZYORA_INITIAL_PRODUCTS__=${serializeProducts(
    products,
  )};</script>`;
  if (!/<\/body>/i.test(outputHtml)) {
    throw new Error("Production HTML template is missing </body>.");
  }
  outputHtml = outputHtml.replace(
    /<\/body>/i,
    `${initialProductsScript}\n</body>`,
  );

  const outputPath = getOutputPath(route);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, outputHtml, "utf8");
  console.log(`Generated ${path.relative(distDirectory, outputPath)}`);

  return fs.readFileSync(outputPath, "utf8");
};

const escapeRegularExpression = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const decodeHtmlEntities = (value) =>
  value
    .replace(/&#(x[\da-f]+|\d+);/gi, (entity, code) => {
      const codePoint = code[0].toLowerCase() === "x"
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : entity;
    })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");

const getAttribute = (tag, name) =>
  tag?.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2];

const inspectProductPage = (
  product,
  products,
  route,
  html,
  expectedCanonical,
) => {
  const titleTags = [
    ...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi),
  ];
  const title = titleTags[0]
    ? decodeHtmlEntities(titleTags[0][1].trim())
    : "";
  const canonicalTags = [
    ...html.matchAll(/<link\b[^>]*>/gi),
  ].filter((match) => {
    const tag = match[0];
    const rel = getAttribute(tag, "rel");
    return rel?.toLowerCase().split(/\s+/).includes("canonical");
  });
  const canonical = canonicalTags[0]
    ? decodeHtmlEntities(getAttribute(canonicalTags[0][0], "href") || "")
    : "";
  let validCanonicalUrl = false;
  try {
    const parsedCanonical = new URL(canonical);
    validCanonicalUrl =
      parsedCanonical.protocol === "https:" &&
      parsedCanonical.href === expectedCanonical &&
      !parsedCanonical.search &&
      !parsedCanonical.hash;
  } catch {
    validCanonicalUrl = false;
  }

  const brandNames = new Set(["ZYORA"]);
  if (product.brand) brandNames.add(String(product.brand).trim());
  const hasDuplicateBrand = [...brandNames].some((brand) => {
    if (!brand) return false;
    const expression = new RegExp(
      `(^|[^\\p{L}\\p{N}])${escapeRegularExpression(brand)}(?=$|[^\\p{L}\\p{N}])`,
      "giu",
    );
    return [...title.matchAll(expression)].length > 1;
  });
  const expectedTitle = createProductSeoTitle(product, products);
  const jsonLdScripts = [
    ...html.matchAll(
      /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  let productJsonLd;
  let breadcrumbJsonLd;
  let jsonLdValid = false;

  for (const [, json] of jsonLdScripts) {
    try {
      const parsed = JSON.parse(decodeHtmlEntities(json));
      const nodes = Array.isArray(parsed["@graph"])
        ? parsed["@graph"]
        : [parsed];
      productJsonLd ||= nodes.find((node) => node["@type"] === "Product");
      breadcrumbJsonLd ||= nodes.find(
        (node) => node["@type"] === "BreadcrumbList",
      );
    } catch {
      continue;
    }
  }

  const offerUrls = Array.isArray(productJsonLd?.offers)
    ? productJsonLd.offers.map((offer) => offer.url)
    : productJsonLd?.offers?.url
      ? [productJsonLd.offers.url]
      : [];
  const breadcrumbItems = breadcrumbJsonLd?.itemListElement || [];
  const breadcrumbUrl =
    breadcrumbItems.at(-1)?.item?.["@id"] ||
    breadcrumbItems.at(-1)?.item ||
    "";
  jsonLdValid =
    productJsonLd?.url === expectedCanonical &&
    offerUrls.every((url) => url === expectedCanonical) &&
    breadcrumbUrl === expectedCanonical;

  return {
    route,
    title,
    titleTagCount: titleTags.length,
    titleCorrect: titleTags.length === 1 && title === expectedTitle,
    hasDuplicateBrand,
    canonical,
    canonicalCount: canonicalTags.length,
    canonicalCorrect:
      canonicalTags.length === 1 &&
      canonical === expectedCanonical &&
      validCanonicalUrl &&
      canonical !== `${canonicalSiteUrl}/`,
    jsonLdValid,
    expectedCanonical,
  };
};

const writeSitemap = (productPages) => {
  const urls = [
    ...staticRoutes.map((route) => `${canonicalSiteUrl}${route}`),
    ...productPages.map(({ canonical }) => canonical),
  ];
  if (new Set(urls).size !== urls.length) {
    throw new Error("Generated sitemap URLs contain duplicates.");
  }
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(distDirectory, "sitemap.xml"), sitemap, "utf8");
  const writtenUrls = [
    ...fs
      .readFileSync(path.join(distDirectory, "sitemap.xml"), "utf8")
      .matchAll(/<loc>(.*?)<\/loc>/g),
  ].map(([, url]) => decodeHtmlEntities(url));
  if (
    writtenUrls.length !== urls.length ||
    writtenUrls.some((url, index) => url !== urls[index])
  ) {
    throw new Error("Generated sitemap URLs do not match page canonical URLs.");
  }
  console.log(`Generated sitemap.xml with ${urls.length} unique URLs.`);
};

const prerender = async () => {
  if (!fs.existsSync(templatePath)) {
    throw new Error("Production HTML template is missing. Run npm run build first.");
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const products = await getProducts();
  const productPages = products.map((product) => {
    const route = createProductPath(product);
    if (!route) {
      throw new Error(
        `Unable to generate a product route for product ID ${String(getProductId(product))}.`,
      );
    }
    return {
      product,
      route,
      canonical: createProductUrl(product, canonicalSiteUrl),
    };
  });

  const validationResults = [];
  for (const route of staticRoutes) {
    const html = writeRoute(route, products, template);
    const titleTags = [
      ...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi),
    ];
    const canonicalTags = [
      ...html.matchAll(/<link\b[^>]*>/gi),
    ].filter((match) =>
      getAttribute(match[0], "rel")
        ?.toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    );
    const canonical = canonicalTags[0]
      ? decodeHtmlEntities(getAttribute(canonicalTags[0][0], "href") || "")
      : "";
    validationResults.push({
      route,
      title: titleTags[0]
        ? decodeHtmlEntities(titleTags[0][1].trim())
        : "",
      titleTagCount: titleTags.length,
      titleCorrect:
        titleTags.length === 1 &&
        Boolean(titleTags[0][1].trim()) &&
        !/^ZYORA$/i.test(titleTags[0][1].trim()),
      hasDuplicateBrand: false,
      canonical,
      canonicalCount: canonicalTags.length,
      canonicalCorrect:
        canonicalTags.length === 1 &&
        canonical === `${canonicalSiteUrl}${route}`,
      jsonLdValid: true,
    });
  }
  for (const { product, route, canonical } of productPages) {
    const html = writeRoute(route, products, template);
    validationResults.push(
      inspectProductPage(product, products, route, html, canonical),
    );
  }

  const pagesByTitle = new Map();
  for (const result of validationResults) {
    if (!result.title) continue;
    const pages = pagesByTitle.get(result.title) || [];
    pages.push(result.route);
    pagesByTitle.set(result.title, pages);
  }
  const duplicateTitles = [...pagesByTitle]
    .filter(([, routes]) => routes.length > 1)
    .map(([title, routes]) => ({ title, routes }));
  const duplicatePageTitles = duplicateTitles.reduce(
    (count, duplicate) => count + duplicate.routes.length,
    0,
  );
  const productResults = validationResults.slice(staticRoutes.length);
  const report = {
    totalProductPagesChecked: productResults.length,
    productPagesWithCorrectCanonicalTags: productResults.filter(
      (result) => result.canonicalCorrect,
    ).length,
    productPagesWithMissingCanonicalTags: productResults.filter(
      (result) => result.canonicalCount === 0,
    ).length,
    productPagesWithDuplicateCanonicalTags: productResults.filter(
      (result) => result.canonicalCount > 1,
    ).length,
    productPagesWithIncorrectCanonicalUrls: productResults.filter(
      (result) => result.canonicalCount > 0 && !result.canonicalCorrect,
    ).length,
    productPagesWithCorrectTitles: productResults.filter(
      (result) => result.titleCorrect,
    ).length,
    productPagesWithDuplicateBrandNames: productResults.filter(
      (result) => result.hasDuplicateBrand,
    ).length,
    productPagesWithDuplicateTitleTags: productResults.filter(
      (result) => result.titleTagCount > 1,
    ).length,
    productPagesWithMissingTitleTags: productResults.filter(
      (result) => result.titleTagCount === 0,
    ).length,
    productPagesWithIncorrectTitles: productResults.filter(
      (result) => !result.titleCorrect,
    ).length,
    productPagesWithIncorrectProductJsonLdUrls: productResults.filter(
      (result) => !result.jsonLdValid,
    ).length,
    duplicateTitlesAcrossGeneratedPages: duplicatePageTitles,
    duplicatePageTitleGroups: duplicateTitles.length,
    publicStaticPagesChecked: staticRoutes.length,
    publicStaticPagesWithCorrectCanonicalTags: validationResults
      .slice(0, staticRoutes.length)
      .filter((result) => result.canonicalCorrect).length,
  };
  console.log("Generated page SEO validation report:");
  console.log(JSON.stringify(report, null, 2));
  writeSitemap(productPages);

  const failedPages = validationResults.filter(
    (result) =>
      !result.canonicalCorrect ||
      !result.titleCorrect ||
      result.hasDuplicateBrand ||
      !result.jsonLdValid,
  );
  if (failedPages.length || duplicatePageTitles) {
    console.error(
      "SEO validation failures:",
      JSON.stringify(
        {
          pages: failedPages.map((result) => ({
          route: result.route,
          title: result.title,
          expectedCanonical: result.expectedCanonical,
          canonical: result.canonical,
          canonicalCount: result.canonicalCount,
          titleTagCount: result.titleTagCount,
          titleCorrect: result.titleCorrect,
          hasDuplicateBrand: result.hasDuplicateBrand,
          jsonLdValid: result.jsonLdValid,
          })),
          duplicateTitles,
        },
        null,
        2,
      ),
    );
    throw new Error(
      `SEO validation failed for ${failedPages.length} generated pages; duplicate page titles: ${duplicatePageTitles}.`,
    );
  }
  console.log(
    `Prerendering completed: ${staticRoutes.length} static routes and ${productPages.length} products.`,
  );
};

prerender().catch((error) => {
  console.error("Prerendering failed:");
  console.error(error);
  process.exitCode = 1;
});
