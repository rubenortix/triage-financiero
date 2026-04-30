import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";

const path = "C:/Users/User/Downloads/Triage_Mapa_Diagnostico.xlsx";
const buf = readFileSync(path);
const wb = XLSX.read(buf, { type: "buffer" });

for (const name of wb.SheetNames) {
  console.log("===== SHEET:", name, "=====");
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
  console.log(`Rows: ${rows.length}`);
  for (let i = 0; i < rows.length; i++) {
    console.log(`R${i}: ${JSON.stringify(rows[i])}`);
  }
  console.log();
}
