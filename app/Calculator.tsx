'use client';

import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { validateVehicleSearchResponse } from "./validators/vehicle";

interface Car {
  name: string;
  make: string;
  model: string
  year: number;
  fuelPer100Miles: number;
  fuel: 'gas' | 'electric';
  vehicleListPrice: number;
  miles: number;
}

interface Assumptions {
  // Miles
  annualMiles: number;
  gasLifespanMiles: number;
  evLifespanMiles: number;
  // Upfront Costs
  salesTaxRate: number;
  chargerInstallCost: number;
  // Fuel
  gasPrice: number;
  electricityPrice: number;
  // Insurance
  annualInsuranceRate: number;
  // Maintenance
  gasBaseMaintenance: number;
  evBaseMaintenance: number;
  extraMaintenancePerMilePerYear: number;
  extraMaintenancePerMilePer50000Miles: number;
}

const cars: Car[] = [{
  name: '2018 Chevy Bolt',
  make: 'Chevrolet',
  model: 'Bolt',
  year: 2018,
  fuel: 'electric',
  vehicleListPrice: 15000,
  miles: 22567,
  fuelPer100Miles: 28
}, {
  name: '2023 Mazda CX-5',
  make: 'Mazda',
  model: 'CX-5',
  year: 2023,
  fuel: 'gas',
  vehicleListPrice: 30000,
  miles: 0,
  fuelPer100Miles: 4
}, {
  name: '2014 Nissan Leaf',
  make: 'Nissan',
  model: 'Leaf',
  year: 2014,
  fuel: 'electric',
  vehicleListPrice: 5788,
  miles: 66082,
  fuelPer100Miles: 30
}, {
  name: '2018 Toyota Corolla',
  make: 'Toyota',
  model: 'Corolla',
  year: 2018,
  fuel: 'gas',
  vehicleListPrice: 12800,
  miles: 13300,
  fuelPer100Miles: 3.1
}, {
  name: '2020 Tesla Model 3',
  make: 'Tesla',
  model: 'Model 3',
  year: 2020,
  fuel: 'electric',
  vehicleListPrice: 19986,
  miles: 46129,
  fuelPer100Miles: 26
}];

const defaultAssumptions: Assumptions = {
  // Miles
  annualMiles: 8000,
  gasLifespanMiles: 200000,
  evLifespanMiles: 180000,
  // Upfront Costs
  salesTaxRate: 0.0725,
  chargerInstallCost: 2000,
  // Fuel
  gasPrice: 3.6,
  electricityPrice: .15,
  // Insurance
  annualInsuranceRate: 0.0333,
  // Maintenance
  gasBaseMaintenance: .06,
  evBaseMaintenance: .03,
  extraMaintenancePerMilePerYear: 0.00167,
  extraMaintenancePerMilePer50000Miles: .005,
};

const queryClient = new QueryClient();

export default function Calculator() {
  return <QueryClientProvider client={queryClient}>
    <CalculatorContent />
  </QueryClientProvider>
}

function CalculatorContent() {
  // Car Info
  const [make, setMake] = useState(cars[0].make);
  const [model, setModel] = useState(cars[0].model);
  const [fuel, setFuel] = useState<'gas' | 'electric'>(cars[0].fuel);
  const [year, setYear] = useState(cars[0].year);
  const [vehicleListPrice, setVehicleListPrice] = useState(cars[0].vehicleListPrice);
  const [miles, setMiles] = useState(cars[0].miles);
  const [fuelPer100Miles, setFuelPer100Miles] = useState(cars[0].fuelPer100Miles);

  // Search Data
  const { data: searchData } = useQuery({
    queryKey: ['vehicle', { make, model, year }],
    queryFn: () => fetch('/api/vehicle', { method: 'POST', body: JSON.stringify({ make, model, year }) })
      .then(res => res.json())
      .then(data => validateVehicleSearchResponse(data) ? data : Promise.reject('Invalid response'))
  })
  // console.log(searchData?.map(vehicle => `${vehicle.year} ${vehicle.make} ${vehicle.model}`).join(', '));
  // console.log(searchData?.[0]);

  // Miles
  const [annualMiles, setAnnualMiles] = useState(8000);
  const [gasLifespanMiles, setGasLifespanMiles] = useState(200000);
  const [evLifespanMiles, setEvLifespanMiles] = useState(180000);
  const lifespanMiles = fuel === 'gas' ? gasLifespanMiles : evLifespanMiles;
  const remainingMiles = lifespanMiles - miles;

  // Upfront Costs
  const [salesTaxRate, setSalesTaxRate] = useState(0.0725);
  const totalSalePrice = vehicleListPrice * (1 + salesTaxRate);
  const salePricePerRemainingMile = totalSalePrice / remainingMiles;
  const [chargerInstallCost, setChargerInstallCost] = useState(2000);
  const chargerInstallCostPerMile = chargerInstallCost / remainingMiles;

  // Fuel
  const [gasPrice, setGasPrice] = useState(3.6);
  const [electricityPrice, setElectricityPrice] = useState(.15);
  const fuelPrice = fuel === 'gas' ? gasPrice : electricityPrice;
  const fuelPerMile = fuelPer100Miles / 100;
  const fuelCostPerMile = fuelPerMile * (fuel === 'gas' ? gasPrice : electricityPrice);

  // Insurance
  const [annualInsuranceRate, setAnnualInsuranceRate] = useState(0.0333);
  const insuranceCostPerMile = vehicleListPrice * annualInsuranceRate / annualMiles;

  // Maintenance
  const [gasBaseMaintenance, setGasBaseMaintenance] = useState(.06);
  const [evBaseMaintenance, setEvBaseMaintenance] = useState(.03);
  const [extraMaintenancePerMilePerYear, setExtraMaintenancePerMilePerYear] = useState(0.00167);
  const [extraMaintenancePerMilePer50000Miles, setExtraMaintenancePerMilePer50000Miles] = useState(.005);
  const yearManufactured = year - 1; // Year manufactured (e.g. 2020 if the model year is 2021)
  const currentYear = new Date().getFullYear() + (new Date().getMonth() / 12); // Current year (.e.g. 2021.5 if it's halfway through 2021)
  const age = currentYear - yearManufactured;
  const maintenanceCostPerMile = (fuel === 'gas' ? gasBaseMaintenance : evBaseMaintenance) +
    (extraMaintenancePerMilePerYear * age) +
    (extraMaintenancePerMilePer50000Miles * miles / 50_000);

  // Final Calculations  
  const remainingYears = remainingMiles / annualMiles;
  const totalCostPerMile = salePricePerRemainingMile + fuelCostPerMile + maintenanceCostPerMile + insuranceCostPerMile +
    (fuel === 'gas' ? 0 : (chargerInstallCostPerMile));

  function setCarInfo(name: string) {
    const car = cars.find(c => c.name === name);
    if (!car) return;
    setFuel(car.fuel);
    setYear(car.year);
    setVehicleListPrice(car.vehicleListPrice);
    setMiles(car.miles);
    setFuelPer100Miles(car.fuelPer100Miles);
  }

  function resetAssumptions() {
    setGasLifespanMiles(defaultAssumptions.gasLifespanMiles);
    setEvLifespanMiles(defaultAssumptions.evLifespanMiles);
    setAnnualMiles(defaultAssumptions.annualMiles);
    setAnnualInsuranceRate(defaultAssumptions.annualInsuranceRate);
    setSalesTaxRate(defaultAssumptions.salesTaxRate);
    setExtraMaintenancePerMilePerYear(defaultAssumptions.extraMaintenancePerMilePerYear);
    setExtraMaintenancePerMilePer50000Miles(defaultAssumptions.extraMaintenancePerMilePer50000Miles);
    setGasBaseMaintenance(defaultAssumptions.gasBaseMaintenance);
    setGasPrice(defaultAssumptions.gasPrice);
    setChargerInstallCost(defaultAssumptions.chargerInstallCost);
    setEvBaseMaintenance(defaultAssumptions.evBaseMaintenance);
    setElectricityPrice(defaultAssumptions.electricityPrice);
  }

  return (
    <div className='lg:flex gap-4'>
      <div className='p-8 grid grid-cols-2 gap-2'>
        <div className='col-span-2 font-bold'>Car Info</div>
        <div className='col-span-2 flex gap-1 flex-wrap'>
          {cars.map(car => <button key={car.name} className='px-2 rounded border border-gray-500' onClick={() => setCarInfo(car.name)}>{car.name}</button>)}
        </div>
        <label>Make</label>
        <input value={make} onChange={e => setMake(e.target.value)} />
        <label>Model</label>
        <input value={model} onChange={e => setModel(e.target.value)} />
        <label>Vehicle Year</label>
        <input type="number" value={year} onChange={e => setYear(parseFloat(e.target.value))} />
        <label>Fuel type</label>
        <select value={fuel} onChange={e => setFuel(e.target.value as 'gas' | 'electric')}>
          <option value="gas">Gas</option>
          <option value="electric">Electric</option>
        </select>
        <label>Price</label>
        <input type="number" value={vehicleListPrice} onChange={e => setVehicleListPrice(parseFloat(e.target.value))} />
        <label>Miles</label>
        <input type="number" value={miles} onChange={e => setMiles(parseInt(e.target.value))} />
        <label>Fuel per 100 Miles</label>
        <input type="number" value={fuelPer100Miles} onChange={e => setFuelPer100Miles(parseFloat(e.target.value))} />
        <div className='col-span-2 h-8'></div>
        <div className='col-span-2 font-bold'>Assumptions</div>
        <div className='col-span-2 flex gap-1 flex-wrap'>
          <button className='px-2 rounded border border-gray-500' onClick={resetAssumptions}>Reset to Default</button>
        </div>
        <div className='col-span-2 font-bold'>Miles</div>
        <label>Annual Miles</label>
        <input type="number" value={annualMiles} onChange={e => setAnnualMiles(parseFloat(e.target.value))} />
        <label>Gas Lifespan Miles</label>
        <input type="number" value={gasLifespanMiles} onChange={e => setGasLifespanMiles(parseFloat(e.target.value))} />
        <label>EV Lifespan Miles</label>
        <input type="number" value={evLifespanMiles} onChange={e => setEvLifespanMiles(parseFloat(e.target.value))} />
        <div className='col-span-2 font-bold'>Upfront Costs</div>
        <label>Sales Tax Rate</label>
        <input type="number" value={salesTaxRate} onChange={e => setSalesTaxRate(parseFloat(e.target.value))} />
        <label>Charger Install Cost</label>
        <input type="number" value={chargerInstallCost} onChange={e => setChargerInstallCost(parseFloat(e.target.value))} />
        <div className='col-span-2 font-bold'>Fuel</div>
        <label>Gas Price</label>
        <input type="number" value={gasPrice} onChange={e => setGasPrice(parseFloat(e.target.value))} />
        <label>Electricity Price</label>
        <input type="number" value={electricityPrice} onChange={e => setElectricityPrice(parseFloat(e.target.value))} />
        <div className='col-span-2 font-bold'>Insurance</div>
        <label>Annual Insurance Rate</label>
        <input type="number" value={annualInsuranceRate} onChange={e => setAnnualInsuranceRate(parseFloat(e.target.value))} />
        <div className='col-span-2 font-bold'>Maintenance</div>
        <label>Gas Base Maintenance</label>
        <input type="number" value={gasBaseMaintenance} onChange={e => setGasBaseMaintenance(parseFloat(e.target.value))} />
        <label>EV Base Maintenance</label>
        <input type="number" value={evBaseMaintenance} onChange={e => setEvBaseMaintenance(parseFloat(e.target.value))} />
        <label>Extra Maintenance Per Mile Per Year</label>
        <input type="number" value={extraMaintenancePerMilePerYear} onChange={e => setExtraMaintenancePerMilePerYear(parseFloat(e.target.value))} />
        <label>Extra Maintenance Per Mile Per 50,000 Miles</label>
        <input type="number" value={extraMaintenancePerMilePer50000Miles} onChange={e => setExtraMaintenancePerMilePer50000Miles(parseFloat(e.target.value))} />
      </div>
      <div className='p-8'>
        <h1>Cost per Mile: {currencySig3(totalCostPerMile)}</h1>
        <h2>Annual Cost: {currencySig3(totalCostPerMile * annualMiles)}</h2>
        <h2>Remaining Miles: {sig3(remainingMiles)}</h2>
        <h2>Remaining Lifespan: {sig3(remainingYears)} years</h2>
        <h2>Annual Breakdown:</h2>
        <ul className="pl-4">
          <li>Sale: {currencySig3(salePricePerRemainingMile * annualMiles)}</li>
          <li>Fuel: {currencySig3(fuelCostPerMile * annualMiles)}</li>
          <li>Maintenance: {currencySig3(maintenanceCostPerMile * annualMiles)}</li>
          <li>Insurance: {currencySig3(insuranceCostPerMile * annualMiles)}</li>
          {fuel === 'electric' && <li>Charger: {currencySig3(chargerInstallCostPerMile * annualMiles)}</li>}
        </ul>
      </div>
    </div >
  );
}

const sig3 = Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format;
const currencySig3 = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format;