import { validateVehicleSearchRequest, VehicleSearchResponseRow } from "@/app/validators/vehicle";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";

const relevantColumns = [
  'baseModel',
  'comb08U', // Unrounded combined MPG for fuel type 1
  // 'combA08U', // Unrounded combined MPG for fuel type 2
  'combE', // KwH/100 miles for electric vehicles
  'cylinders',
  'displ', // Engine displacement in liters
  'drive',
  'fuelType',
  'make',
  'model',
  'trany', // Transmission
  'year',
];

interface DataRow {
  make: string;
  model: string;
  year: number;
  fuelType: string;
  efficiency: number;
  cylinders: number;
  liters: number;
  drive: string;
  transmission: string;
}

const dataPromise = readFile('data/vehicles.csv', 'utf-8').then((data) => {
  const lines = data.split('\n');
  const headers = lines[0].split(',');
  const makeColumnIndex = headers.indexOf('make');
  const modelColumnIndex = headers.indexOf('model');
  const yearColumnIndex = headers.indexOf('year');
  const fuelTypeColumnIndex = headers.indexOf('fuelType');
  const gasEfficiencyColumnIndex = headers.indexOf('comb08U');
  const electricEfficiencyColumnIndex = headers.indexOf('combE');
  const cylindersColumnIndex = headers.indexOf('cylinders');
  const litersColumnIndex = headers.indexOf('displ');
  const driveColumnIndex = headers.indexOf('drive');
  const transmissionColumnIndex = headers.indexOf('trany');

  const epaRecords: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '') continue;
    const values = parseCSVLine(lines[i]);
    const make = values[makeColumnIndex];
    if (make === undefined) throw new Error(`Missing make on line ${i}`);
    const model = values[modelColumnIndex];
    if (model === undefined) throw new Error(`Missing model on line ${i}`);
    const year = parseInt(values[yearColumnIndex]);
    if (isNaN(year)) throw new Error(`Invalid year on line ${i}: ${values[yearColumnIndex]}`);
    const fuelType = values[fuelTypeColumnIndex];
    if (fuelType === undefined) throw new Error(`Missing fuelType on line ${i}`);
    const gasEfficiency = parseFloat(values[gasEfficiencyColumnIndex]);
    if (isNaN(gasEfficiency)) throw new Error(`Invalid gas efficiency on line ${i}: ${values[gasEfficiencyColumnIndex]}`);
    const electricEfficiency = parseFloat(values[electricEfficiencyColumnIndex]);
    if (isNaN(electricEfficiency)) throw new Error(`Invalid electric efficiency on line ${i}: ${values[electricEfficiencyColumnIndex]}`);
    const efficiency = fuelType === 'Electricity' ? electricEfficiency : gasEfficiency;
    const cylindersValue = values[cylindersColumnIndex];
    const cylinders = cylindersValue === '' || cylindersValue === 'NA' ? 0 : parseInt(cylindersValue);
    if (isNaN(cylinders)) throw new Error(`Invalid cylinders on line ${i}: ${values[cylindersColumnIndex]}`);
    const litersValue = values[litersColumnIndex];
    const liters = litersValue === '' || litersValue === 'NA' ? 0 : parseFloat(litersValue);
    if (isNaN(liters)) throw new Error(`Invalid liters on line ${i}: ${values[litersColumnIndex]}`);
    const drive = values[driveColumnIndex];
    if (drive === undefined) throw new Error(`Missing drive on line ${i}`);
    const transmission = values[transmissionColumnIndex];
    if (transmission === undefined) throw new Error(`Missing transmission on line ${i}`);

    epaRecords.push({ make, model, year, fuelType, efficiency, cylinders, liters, drive, transmission });
  }

  return epaRecords;
});

export async function POST(request: Request) {
  const vehicles = await dataPromise;
  const searchData: unknown = await request.json();
  if (!validateVehicleSearchRequest(searchData)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { make, model, year } = searchData;
  console.log(searchData)
  const results: VehicleSearchResponseRow[] = [];
  for (const vehicle of vehicles) {
    try {
    const makeDistance = make === undefined ? undefined : levenshteinDistance(make, vehicle.make);
    const modelDistance = model === undefined ? undefined : levenshteinDistance(model, vehicle.model);
    const yearDistance = year === undefined ? undefined : Math.abs(year - vehicle.year);
    const totalScore = (makeDistance ?? 0) + (modelDistance ?? 0) + (yearDistance ?? 0);
    const factors = [make, model, year].filter(x => x !== undefined).length;
    const score = totalScore / factors;
    results.push({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      efficiency: vehicle.efficiency,
      cylinders: vehicle.cylinders,
      liters: vehicle.liters,
      drive: vehicle.drive,
      transmission: vehicle.transmission,
      score,
    });
    } catch (e) {
      console.log(vehicle);
      console.error(e);
      break;
    }
  }
  return NextResponse.json(results.sort((a, b) => a.score - b.score).slice(0, 10));
}

function levenshteinDistance(s: string, t: string) {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
}

function parseCSVLine(line: string, delimiter = ',') {
  const values = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuote = !inQuote;
    } else if (char === delimiter && !inQuote) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}