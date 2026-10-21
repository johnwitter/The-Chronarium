#!/usr/bin/env node
/* Checks every question file in questions/ against the format in CONTENT_GUIDE.md.
   Run from the repository root:  node tools/check-questions.js
   Exits with code 1 if anything is wrong. Not needed to run the site. */
const fs = require("fs"), path = require("path"), vm = require("vm");

const ROOT = path.join(__dirname, "..");
const COURSES = { world:"W", euro:"E" }, UNIT_COUNT = 9, MAX_ITEMS = 26;
const errors = [], warnings = [];
const isStr = x => typeof x === "string" && x.trim() !== "";
const html = fs.readFileSync(path.join(ROOT, "history-arcade.html"), "utf8");
let itemCount = 0;

function checkItem(it, where){
  if (!Array.isArray(it)) return errors.push(`${where}: item is not an array`);
  const [type, q] = it;
  if (!isStr(q)) errors.push(`${where}: question text is missing`);
  if (type === "mc"){
    const [, , opts, ans, why] = it;
    if (it.length !== 5) errors.push(`${where}: "mc" needs 5 parts, has ${it.length}`);
    if (!Array.isArray(opts) || opts.length < 2 || !opts.every(isStr)) errors.push(`${where}: options must be a list of 2 or more strings`);
    else {
      if (new Set(opts).size !== opts.length) errors.push(`${where}: two options are identical`);
      if (!Number.isInteger(ans) || ans < 0 || ans >= opts.length) errors.push(`${where}: correct index ${ans} is not 0 to ${opts.length-1}`);
    }
    if (!isStr(why)) errors.push(`${where}: explanation is missing`);
  } else if (type === "sort"){
    const [, , cats, rows, why] = it;
    if (it.length !== 5) errors.push(`${where}: "sort" needs 5 parts, has ${it.length}`);
    if (!Array.isArray(cats) || cats.length < 2 || !cats.every(isStr)) errors.push(`${where}: categories must be a list of 2 or more strings`);
    else if (!Array.isArray(rows) || rows.length < 2) errors.push(`${where}: needs 2 or more items to sort`);
    else rows.forEach((r, k) => {
      if (!Array.isArray(r) || r.length !== 2 || !isStr(r[0]) || !Number.isInteger(r[1]) || r[1] < 0 || r[1] >= cats.length)
        errors.push(`${where}: sort row ${k+1} must be ["text", category index 0 to ${cats.length-1}]`);
    });
    if (Array.isArray(cats) && Array.isArray(rows)) cats.forEach((c, ci) => { if (!rows.some(r => Array.isArray(r) && r[1] === ci)) warnings.push(`${where}: no items in category "${c}"`); });
    if (!isStr(why)) errors.push(`${where}: explanation is missing`);
  } else if (type === "seq"){
    const [, , order, why] = it;
    if (it.length !== 4) errors.push(`${where}: "seq" needs 4 parts, has ${it.length}`);
    if (!Array.isArray(order) || order.length < 2 || !order.every(isStr)) errors.push(`${where}: sequence must be a list of 2 or more strings`);
    else if (new Set(order).size !== order.length) errors.push(`${where}: two sequence items are identical`);
    if (!isStr(why)) errors.push(`${where}: explanation is missing`);
  } else errors.push(`${where}: unknown type ${JSON.stringify(type)} (use "mc", "sort", or "seq")`);
}

for (const [course, code] of Object.entries(COURSES)){
  for (let n = 1; n <= UNIT_COUNT; n++){
    const rel = `questions/${course}/unit${n}.js`, file = path.join(ROOT, rel);
    if (!html.includes(`<script src="${rel}"></script>`)) errors.push(`${rel}: no script tag for it in history-arcade.html`);
    if (!fs.existsSync(file)){ errors.push(`${rel}: file is missing`); continue; }
    const calls = [];
    try { vm.runInNewContext(fs.readFileSync(file, "utf8"), { addUnit:(...a) => calls.push(a) }, { filename:rel }); }
    catch (e){ errors.push(`${rel}: JavaScript error: ${e.message}`); continue; }
    if (calls.length !== 1){ errors.push(`${rel}: must call addUnit exactly once (found ${calls.length})`); continue; }
    const [c, num, unit] = calls[0];
    if (c !== course || num !== n){ errors.push(`${rel}: calls addUnit(${JSON.stringify(c)}, ${JSON.stringify(num)}) but should call addUnit("${course}", ${n})`); continue; }
    if (!unit || !isStr(unit.title)) errors.push(`${rel}: title is missing`);
    if (!unit || !Array.isArray(unit.topics)){ errors.push(`${rel}: topics must be a list`); continue; }
    const seen = new Set();
    unit.topics.forEach((tp, ti) => {
      const where = `${rel} topic ${tp && tp.n ? tp.n : "#"+(ti+1)}`;
      if (!tp || typeof tp !== "object") return errors.push(`${where}: topic is not an object`);
      if (!(typeof tp.n === "string" && new RegExp(`^${n}\\.\\d+$`).test(tp.n))) errors.push(`${where}: n must look like "${n}.1"`);
      if (seen.has(tp.n)) errors.push(`${where}: topic number used twice`); seen.add(tp.n);
      if (!isStr(tp.t)) errors.push(`${where}: topic title t is missing`);
      if (!Array.isArray(tp.items) || tp.items.length < 3 || tp.items.length > MAX_ITEMS) return errors.push(`${where}: needs 3 to ${MAX_ITEMS} items`);
      tp.items.forEach((it, k) => { itemCount++; checkItem(it, `${where} item ${k+1} (${code}${tp.n}-${"abcdefghijklmnopqrstuvwxyz"[k]})`); });
    });
  }
}

warnings.forEach(w => console.log("warning: " + w));
errors.forEach(e => console.log("ERROR: " + e));
console.log(errors.length ? `\n${errors.length} problem(s) found.` : `All question files OK (${itemCount} items).`);
process.exit(errors.length ? 1 : 0);
