require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sectors = ["Roads & Highways","Railways","Irrigation & Water Resources","Urban Development","Power & Energy","Healthcare Infrastructure","Education","Ports, Shipping & Logistics"];
const ministries = ["Ministry of Road Transport & Highways","Ministry of Railways","Ministry of Jal Shakti","Ministry of Housing & Urban Affairs","Ministry of Petroleum & Natural Gas","Ministry of Health & Family Welfare","Ministry of Education","Ministry of Ports, Shipping & Waterways"];
const states = [
  {name:"Uttarakhand", lat:30.32, lng:78.03},
  {name:"Bihar", lat:25.09, lng:85.31},
  {name:"Maharashtra", lat:19.75, lng:75.71},
  {name:"Andhra Pradesh", lat:15.91, lng:79.74},
  {name:"Karnataka", lat:15.31, lng:75.71},
  {name:"West Bengal", lat:22.98, lng:87.85},
  {name:"Assam", lat:26.20, lng:92.93},
  {name:"Rajasthan", lat:27.02, lng:74.21},
  {name:"Gujarat", lat:22.25, lng:71.19},
  {name:"Madhya Pradesh", lat:22.97, lng:78.65},
  {name:"Jammu & Kashmir", lat:33.77, lng:76.57},
  {name:"Odisha", lat:20.95, lng:85.09},
  {name:"Kerala", lat:10.85, lng:76.27},
  {name:"Delhi / NCR", lat:28.61, lng:77.20},
];

function randomBetween(min, max) { return Math.random() * (max - min) + min; }
function randomInt(min, max) { return Math.floor(randomBetween(min, max + 1)); }
function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(randomBetween(start, end));
}
function randomCauses() {
  let vals = Array.from({length: 6}, () => Math.random());
  const sum = vals.reduce((a,b) => a+b, 0);
  vals = vals.map(v => Math.round((v/sum) * 100));
  let diff = 100 - vals.reduce((a,b)=>a+b,0);
  vals[0] += diff;
  return vals;
}
const projectNames = [
  "Highway Widening Project","Metro Rail Extension","Irrigation Canal Modernisation",
  "Coastal Road Development","River Interlink Scheme","Urban Water Supply Upgrade",
  "Rural Electrification Phase","Port Connectivity Corridor","District Hospital Expansion",
  "Smart City Infrastructure","Railway Line Doubling","Solar Power Grid Integration",
  "Flood Protection Embankment","University Campus Development","Logistics Park Development",
  "Bridge Construction Project","Sewage Treatment Cluster","Rural Road Connectivity Scheme",
  "Airport Terminal Expansion","Water Metro Extension","Gas Pipeline Network",
  "Slum Rehabilitation Project","Tunnel Access Road","Dam Rehabilitation Scheme",
  "Freight Corridor Extension","Skill Development Institute","Renewable Energy Park",
  "Coastal Protection Wall","Rural Health Centre Network","City Bus Rapid Transit"
];

async function seed() {
  console.log("Starting seed...");
  const client = await pool.connect();
  try {
    for (let i = 0; i < 40; i++) {
      const state = states[randomInt(0, states.length - 1)];
      const sectorIndex = randomInt(0, sectors.length - 1);
      const sector = sectors[sectorIndex];
      const ministry = ministries[sectorIndex];
      const name = `${state.name} ${projectNames[randomInt(0, projectNames.length - 1)]}`;

      const budget = randomInt(50, 5000);
      const utilized = Math.round(budget * randomBetween(0.2, 0.95));
      const startDate = randomDate(2019, 2023);
      const plannedCompletion = new Date(startDate.getTime() + randomInt(365, 1825) * 86400000);
      const percentComplete = randomInt(10, 98);
      const delayPercent = randomInt(5, 75);
      const riskScore = Math.min(100, Math.round(delayPercent * 0.7 + (100 - percentComplete) * 0.2 + randomInt(0,10)));

      const projResult = await client.query(
        `INSERT INTO projects
          (name, sector, ministry, state, lat, lng, budget_cr, utilized_cr, start_date, planned_completion, percent_complete, delay_percent, risk_score)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING id`,
        [name, sector, ministry, state.name,
         state.lat + randomBetween(-0.5, 0.5), state.lng + randomBetween(-0.5, 0.5),
         budget, utilized, startDate, plannedCompletion, percentComplete, delayPercent, riskScore]
      );
      const projectId = projResult.rows[0].id;

      const [physical, financial, geographical, manpower, bureaucratic, other] = randomCauses();

      await client.query(
        `INSERT INTO delay_causes
          (project_id, physical_pct, financial_pct, geographical_pct, manpower_pct, bureaucratic_pct, other_pct)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [projectId, physical, financial, geographical, manpower, bureaucratic, other]
      );

      console.log(`Inserted ${i + 1}/40: ${name}`);
    }
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();