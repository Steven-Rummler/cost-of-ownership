'use client';

import { useState } from "react";

interface CarProfile {
  name: string;
  fuel: 'gas' | 'electric';
  year: number;
  vehicleListPrice: number;
  miles: number;
  fuelPer100Miles: number;
  annualMiles?: number;
  lifespanMiles?: number;
  annualInsuranceRate?: number;
  salesTaxRate?: number;
  bullcrapDealerFees?: number;
  registrationCost?: number;
  extraMaintenancePerMilePerYear?: number;
  extraMaintenancePerMilePer50000Miles?: number;
  gasBaseMaintenance?: number;
  gasPrice?: number;
  chargerInstallCost?: number;
  evBaseMaintenance?: number;
  electricityPrice?: number;
}

const defaultProfile: Required<CarProfile> = {
  name: 'Default',
  fuel: 'electric',
  year: 2018,
  vehicleListPrice: 15000,
  miles: 22567,
  fuelPer100Miles: 28,
  annualMiles: 8000,
  lifespanMiles: 160000,
  annualInsuranceRate: 0.0333,
  salesTaxRate: 0.0725,
  bullcrapDealerFees: 0,
  registrationCost: 0,
  extraMaintenancePerMilePerYear: 0.00167,
  extraMaintenancePerMilePer50000Miles: .005,
  gasBaseMaintenance: .06,
  gasPrice: 3.6,
  chargerInstallCost: 2000,
  evBaseMaintenance: .03,
  electricityPrice: .15
};

const profiles: CarProfile[] = [
  {
    name: 'Chevy Bolt',
    fuel: 'electric',
    year: 2018,
    vehicleListPrice: 15000,
    miles: 22567,
    fuelPer100Miles: 28,
    lifespanMiles: 160000
  }, {
    name: 'Clifford',
    fuel: 'gas',
    year: 2023,
    vehicleListPrice: 30000,
    miles: 0,
    fuelPer100Miles: 4,
    lifespanMiles: 200000
  }
];


export default function Calculator() {
  const [fuel, setFuel] = useState<'gas' | 'electric'>('electric');
  const [year, setYear] = useState(2018);
  const [vehicleListPrice, setVehicleListPrice] = useState(15000);
  const [miles, setMiles] = useState(22567);
  const [fuelPer100Miles, setFuelPer100Miles] = useState(28);

  const [annualMiles, setAnnualMiles] = useState(8000);
  const [lifespanMiles, setLifespanMiles] = useState(200000);

  const [annualInsuranceRate, setAnnualInsuranceRate] = useState(0.0333);
  const [salesTaxRate, setSalesTaxRate] = useState(0.0725);
  const [bullcrapDealerFees, setBullcrapDealerFees] = useState(0);
  const [registrationCost, setRegistrationCost] = useState(0);

  const [extraMaintenancePerMilePerYear, setExtraMaintenancePerMilePerYear] = useState(0.00167);
  const [extraMaintenancePerMilePer50000Miles, setExtraMaintenancePerMilePer50000Miles] = useState(.005);

  const [gasBaseMaintenance, setGasBaseMaintenance] = useState(.06);
  const [gasPrice, setGasPrice] = useState(3.6);

  const [chargerInstallCost, setChargerInstallCost] = useState(2000);
  const [evBaseMaintenance, setEvBaseMaintenance] = useState(.03);
  const [electricityPrice, setElectricityPrice] = useState(.15);

  const remainingMiles = lifespanMiles - miles;

  const totalSalePrice = vehicleListPrice * (1 + salesTaxRate) + bullcrapDealerFees + registrationCost;
  const salePricePerRemainingMile = totalSalePrice / remainingMiles;

  const fuelPerMile = fuelPer100Miles / 100;
  const fuelCostPerMile = fuelPerMile * (fuel === 'gas' ? gasPrice : electricityPrice);

  // Year manufactured (e.g. 2020 if the model year is 2021)
  const yearManufactured = year - 1;
  // Current year (.e.g. 2021.5 if it's halfway through 2021)
  const currentYear = new Date().getFullYear() + (new Date().getMonth() / 12);
  const age = currentYear - yearManufactured;
  const maintenanceCostPerMile = (fuel === 'gas' ? gasBaseMaintenance : evBaseMaintenance) +
    (extraMaintenancePerMilePerYear * age) +
    (extraMaintenancePerMilePer50000Miles * miles / 50_000);

  const insuranceCostPerMile = vehicleListPrice * annualInsuranceRate / annualMiles;

  const chargerInstallCostPerMile = chargerInstallCost / remainingMiles;

  const remainingYears = remainingMiles / annualMiles;

  const totalCostPerMile = salePricePerRemainingMile + fuelCostPerMile + maintenanceCostPerMile + insuranceCostPerMile +
    (fuel === 'gas' ? 0 : (chargerInstallCostPerMile));

  function setProfile(name: string) {
    // Set the values to the profile values, or the default values if the profile values are not set
    const profile = profiles.find(p => p.name === name) ?? defaultProfile;
    setFuel(profile.fuel);
    setYear(profile.year);
    setVehicleListPrice(profile.vehicleListPrice);
    setMiles(profile.miles);
    setFuelPer100Miles(profile.fuelPer100Miles);
    setAnnualMiles(profile.annualMiles ?? defaultProfile.annualMiles);
    setLifespanMiles(profile.lifespanMiles ?? defaultProfile.lifespanMiles);
    setAnnualInsuranceRate(profile.annualInsuranceRate ?? defaultProfile.annualInsuranceRate);
    setSalesTaxRate(profile.salesTaxRate ?? defaultProfile.salesTaxRate);
    setBullcrapDealerFees(profile.bullcrapDealerFees ?? defaultProfile.bullcrapDealerFees);
    setRegistrationCost(profile.registrationCost ?? defaultProfile.registrationCost);
    setExtraMaintenancePerMilePerYear(profile.extraMaintenancePerMilePerYear ?? defaultProfile.extraMaintenancePerMilePerYear);
    setExtraMaintenancePerMilePer50000Miles(profile.extraMaintenancePerMilePer50000Miles ?? defaultProfile.extraMaintenancePerMilePer50000Miles);
    setGasBaseMaintenance(profile.gasBaseMaintenance ?? defaultProfile.gasBaseMaintenance);
    setGasPrice(profile.gasPrice ?? defaultProfile.gasPrice);
    setChargerInstallCost(profile.chargerInstallCost ?? defaultProfile.chargerInstallCost);
    setEvBaseMaintenance(profile.evBaseMaintenance ?? defaultProfile.evBaseMaintenance);
    setElectricityPrice(profile.electricityPrice ?? defaultProfile.electricityPrice);
  }

  return (
    <div className='flex gap-4'>
      <div className='p-8'>
        <div className='flex gap-1 flex-wrap'>
          {profiles.map(p => <button key={p.name} className='px-2 rounded border border-gray-500' onClick={() => setProfile(p.name)}>{p.name}</button>)}
          <button className='px-2 rounded border border-gray-500' onClick={() => setProfile('Default')}>Reset to Default</button>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='col-span-2 font-bold'>Car Profile</div>
          <label>Fuel type</label>
          <select value={fuel} onChange={e => setFuel(e.target.value as 'gas' | 'electric')}>
            <option value="gas">Gas</option>
            <option value="electric">Electric</option>
          </select>
          <label>Vehicle Year</label>
          <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} />
          <label>Price</label>
          <input type="number" value={vehicleListPrice} onChange={e => setVehicleListPrice(parseInt(e.target.value))} />
          <label>Miles</label>
          <input type="number" value={miles} onChange={e => setMiles(parseInt(e.target.value))} />
          <label>Fuel per 100 miles</label>
          <input type="number" value={fuelPer100Miles} onChange={e => setFuelPer100Miles(parseInt(e.target.value))} />
          <label>Lifespan miles</label>
          <input type="number" value={lifespanMiles} onChange={e => setLifespanMiles(parseInt(e.target.value))} />
          <div className='col-span-2 font-bold'>Assumptions</div>
          <label>Annual miles</label>
          <input type="number" value={annualMiles} onChange={e => setAnnualMiles(parseInt(e.target.value))} />
          <label>Annual insurance rate</label>
          <input type="number" value={annualInsuranceRate} onChange={e => setAnnualInsuranceRate(parseFloat(e.target.value))} />
          <label>Sales tax rate</label>
          <input type="number" value={salesTaxRate} onChange={e => setSalesTaxRate(parseFloat(e.target.value))} />
          <label>Dealer fees</label>
          <input type="number" value={bullcrapDealerFees} onChange={e => setBullcrapDealerFees(parseInt(e.target.value))} />
          <label>Registration cost</label>
          <input type="number" value={registrationCost} onChange={e => setRegistrationCost(parseInt(e.target.value))} />
          <label>Extra maintenance per mile per year</label>
          <input type="number" value={extraMaintenancePerMilePerYear} onChange={e => setExtraMaintenancePerMilePerYear(parseFloat(e.target.value))} />
          <label>Extra maintenance per mile per 50,000 miles</label>
          <input type="number" value={extraMaintenancePerMilePer50000Miles} onChange={e => setExtraMaintenancePerMilePer50000Miles(parseFloat(e.target.value))} />
          <label>Gas base maintenance</label>
          <input type="number" value={gasBaseMaintenance} onChange={e => setGasBaseMaintenance(parseFloat(e.target.value))} />
          <label>Gas price</label>
          <input type="number" value={gasPrice} onChange={e => setGasPrice(parseFloat(e.target.value))} />
          <label>Charger install cost</label>
          <input type="number" value={chargerInstallCost} onChange={e => setChargerInstallCost(parseInt(e.target.value))} />
          <label>EV base maintenance</label>
          <input type="number" value={evBaseMaintenance} onChange={e => setEvBaseMaintenance(parseFloat(e.target.value))} />
          <label>Electricity price</label>
          <input type="number" value={electricityPrice} onChange={e => setElectricityPrice(parseFloat(e.target.value))} />
        </div>
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