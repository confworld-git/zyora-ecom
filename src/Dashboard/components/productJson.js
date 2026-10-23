// Reads JSON or a JavaScript/MongoDB-style object (unquoted keys, single quotes,
// trailing commas, NumberInt('5'), ObjectId('..'), ISODate('..')). It never runs the text as code.
function parseLooseJson(text) {
  const src = String(text).trim().replace(/;\s*$/, "");
  let i = 0;

  const fail = (message) => {
    throw new Error(`${message} (near character ${i + 1})`);
  };

  const skipSpace = () => {
    while (i < src.length) {
      if (/\s/.test(src[i])) {
        i++;
      } else if (src.startsWith("//", i)) {
        while (i < src.length && src[i] !== "\n") i++;
      } else if (src.startsWith("/*", i)) {
        const end = src.indexOf("*/", i + 2);
        i = end === -1 ? src.length : end + 2;
      } else {
        break;
      }
    }
  };

  const parseString = () => {
    const quote = src[i++];
    const escapes = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" };
    let out = "";
    while (i < src.length && src[i] !== quote) {
      if (src[i] === "\\") {
        i++;
        const c = src[i++];
        if (c === "u") {
          out += String.fromCharCode(parseInt(src.slice(i, i + 4), 16));
          i += 4;
        } else {
          out += escapes[c] ?? c;
        }
      } else {
        out += src[i++];
      }
    }
    if (src[i] !== quote) fail("A text value is missing its closing quote");
    i++;
    return out;
  };

  const parseWord = () => {
    const match = /^[A-Za-z_$][\w$]*/.exec(src.slice(i));
    if (!match) fail("Unexpected character");
    i += match[0].length;
    return match[0];
  };

  const parseValue = () => {
    skipSpace();
    const c = src[i];
    if (c === undefined) fail("The text ended too early");
    if (c === "{") return parseObject();
    if (c === "[") return parseArray();
    if (c === "'" || c === '"' || c === "`") return parseString();

    if (c === "-" || /\d/.test(c)) {
      const match = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(src.slice(i));
      if (!match) fail("Invalid number");
      i += match[0].length;
      return Number(match[0]);
    }

    const word = parseWord();
    if (word === "true") return true;
    if (word === "false") return false;
    if (word === "null" || word === "undefined") return null;

    skipSpace();
    if (src[i] === "(") {
      i++;
      skipSpace();
      const arg = src[i] === ")" ? null : parseValue();
      skipSpace();
      if (src[i] !== ")") fail("Expected a closing )");
      i++;
      return [
        "NumberInt",
        "NumberLong",
        "NumberDecimal",
        "Int32",
        "Double",
      ].includes(word)
        ? Number(arg)
        : arg;
    }

    return fail(`Unexpected value "${word}"`);
  };

  function parseObject() {
    const result = {};
    i++; // {
    for (;;) {
      skipSpace();
      if (src[i] === "}") {
        i++;
        return result;
      }
      const key =
        src[i] === "'" || src[i] === '"' ? parseString() : parseWord();
      skipSpace();
      if (src[i] !== ":") fail(`Expected ":" after "${key}"`);
      i++;
      result[key] = parseValue();
      skipSpace();
      if (src[i] === ",") i++;
      else if (src[i] !== "}") fail('Expected "," or "}"');
    }
  }

  function parseArray() {
    const result = [];
    i++; // [
    for (;;) {
      skipSpace();
      if (src[i] === "]") {
        i++;
        return result;
      }
      result.push(parseValue());
      skipSpace();
      if (src[i] === ",") i++;
      else if (src[i] !== "]") fail('Expected "," or "]"');
    }
  }

  const value = parseValue();
  skipSpace();
  if (i < src.length) fail("There is extra text after the product object");
  return value;
}

const cleanText = (value) => (value == null ? "" : String(value).trim());

const toList = (value) => {
  const list = Array.isArray(value) ? value.map(cleanText).filter(Boolean) : [];
  return list.length ? list : [""];
};

const toKeyValueRows = (value) => {
  const rows =
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.entries(value).map(([key, val]) => ({
          key: key.trim(),
          value: cleanText(val),
        }))
      : [];
  return rows.length ? rows : [{ key: "", value: "" }];
};

const matchCategory = (value, categories) => {
  const wanted = cleanText(value).toLowerCase();
  if (!wanted) return "";
  return (
    categories.find((c) => c.toLowerCase() === wanted) ||
    categories.find(
      (c) =>
        c.toLowerCase().includes(wanted) || wanted.includes(c.toLowerCase()),
    ) ||
    ""
  );
};

const isTrue = (value) => value === true || value === "true";

// Turns the parsed product into form-state fields (images and video are never touched)
function productJsonToFormFields(data, categories) {
  const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const price = obj(data.price);
  const rating = obj(data.rating);
  const stock = obj(data.stock);
  const info = obj(data.product_information);
  const variants = obj(data.variants);
  const next = {};

  for (const key of ["id", "name", "title", "brand"]) {
    if (data[key] !== undefined) next[key] = cleanText(data[key]);
  }
  if (data.category !== undefined)
    next.category = matchCategory(data.category, categories);

  if (price.mrp !== undefined) next.mrp = cleanText(price.mrp);
  if (price.selling_price !== undefined)
    next.selling_price = cleanText(price.selling_price);

  if (rating.average !== undefined)
    next.ratingAverage = cleanText(rating.average);
  if (rating.count !== undefined) next.ratingCount = cleanText(rating.count);

  if (data.about_this_item !== undefined)
    next.about_this_item = toList(data.about_this_item);

  for (const section of [
    "features_specs",
    "style",
    "measurements",
    "materials_care",
    "item_details",
  ]) {
    if (info[section] !== undefined)
      next[section] = toKeyValueRows(info[section]);
  }

  if (variants.colours !== undefined) next.colours = toList(variants.colours);
  if (variants.sizes !== undefined) next.sizes = toList(variants.sizes);

  if (variants.colours !== undefined || variants.colorStock !== undefined) {
    const colorStock = Array.isArray(variants.colorStock)
      ? variants.colorStock
      : [];
    const colours =
      next.colours || toList(colorStock.map((item) => item?.color));
    const byColor = new Map(
      colorStock
        .filter((item) => item && typeof item === "object")
        .map((item) => [cleanText(item.color).toLowerCase(), item]),
    );
    next.colours = colours;
    next.colorQuantities = colours.map((color, index) => {
      const item = byColor.get(color.toLowerCase());
      return cleanText(
        item?.quantity ?? (index === 0 ? (stock.quantity ?? "") : "0"),
      );
    });
    next.colorEnabled = colours.map((color) => {
      const item = byColor.get(color.toLowerCase());
      return item ? item.enabled !== false : stock.in_stock !== false;
    });
  }

  if (stock.in_stock !== undefined) next.in_stock = isTrue(stock.in_stock);
  if (stock.quantity !== undefined) next.quantity = cleanText(stock.quantity);
  if (data.is_best_seller !== undefined)
    next.is_best_seller = isTrue(data.is_best_seller);

  return next;
}

export { parseLooseJson, productJsonToFormFields };
