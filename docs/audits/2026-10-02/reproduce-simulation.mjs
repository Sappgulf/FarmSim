// Audit probe: executes copies of the current TypeScript simulation, without changing game files.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
const evidenceDirectory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(evidenceDirectory, '../../..');
const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'farmsim-simulation-audit-'));
for (const name of ['data', 'state', 'selectors', 'storage']) {
 const source = await fs.readFile(path.join(repository, `web/src/${name}.ts`), 'utf8');
 const output = stripTypeScriptTypes(source)
  .replace(/from ['"]\.\/(data|state|selectors)['"]/g, "from './$1.mjs'");
 await fs.writeFile(path.join(temporaryDirectory, `${name}.mjs`), output);
}
const {initialFarmState,cropOptions} = await import(pathToFileURL(path.join(temporaryDirectory,'data.mjs')));
const {farmReducer} = await import(pathToFileURL(path.join(temporaryDirectory,'state.mjs')));
const {loadFarmState} = await import(pathToFileURL(path.join(temporaryDirectory,'storage.mjs')));
const seed=()=>structuredClone(initialFarmState);
const observations=[];
const shipped=farmReducer(seed(),{type:'SHIP_GOODS',orderId:'wheat-order',quantity:5});
observations.push({id:'wheat-price',displayedTotal:5*initialFarmState.sellOrders[0].price,actualPayout:shipped.money-initialFarmState.money});
const fraction=farmReducer(seed(),{type:'SHIP_GOODS',orderId:'wheat-order',quantity:0.5});
observations.push({id:'fractional-shipment',accepted:fraction.inventory.wheat===59.5,inventory:fraction.inventory.wheat});
const nan=farmReducer(seed(),{type:'SHIP_GOODS',orderId:'wheat-order',quantity:NaN});
observations.push({id:'nan-shipment',accepted:nan.money!==initialFarmState.money,moneyIsNaN:Number.isNaN(nan.money),inventoryIsNaN:Number.isNaN(nan.inventory.wheat)});
let long=seed(); for(let i=0;i<100;i++) long=farmReducer(long,{type:'ADVANCE_DAY'});
observations.push({id:'season-progression',day:long.day,season:long.season});
let exhausted=seed(); let harvests=0;
for(const crop of cropOptions){
 while(exhausted.seedStock[crop.key]>0){
  exhausted={...exhausted,selectedPlotIds:[6]};
  exhausted=farmReducer(exhausted,{type:'PLANT_SELECTED_PLOTS',crop:crop.key});
  for(let i=0;i<crop.growthDays;i++){
   exhausted=farmReducer(exhausted,{type:'WATER_PLOTS'});
   exhausted=farmReducer(exhausted,{type:'ADVANCE_DAY'});
  }
  exhausted=farmReducer(exhausted,{type:'HARVEST_PLOTS'}); harvests++;
 }
}
observations.push({id:'seed-exhaustion',harvests,day:exhausted.day,seedStock:exhausted.seedStock});
let orders=seed();for(const order of initialFarmState.sellOrders) orders=farmReducer(orders,{type:'SHIP_GOODS',orderId:order.id,quantity:order.amount});
for(let i=0;i<30;i++)orders=farmReducer(orders,{type:'ADVANCE_DAY'});
observations.push({id:'order-exhaustion',remainingOrders:orders.sellOrders.length,day:orders.day});
const before=seed();const started=farmReducer(before,{type:'START_PRODUCTION',recipe:'cheese'});const job=started.productionQueue.at(-1);
const canceled=farmReducer(started,{type:'CANCEL_PRODUCTION',id:job.id});
observations.push({id:'cancel-input-loss',milkBefore:before.inventory.milk,milkAfterCancel:canceled.inventory.milk});
const corrupt={schemaVersion:2,farm:{money:-50,day:-3,seedStock:{wheat:-8},inventory:{eggs:-4},selectedPlotIds:[999]}};
const storage={getItem:()=>JSON.stringify(corrupt)};
const loaded=loadFarmState(storage);
observations.push({id:'save-validation',money:loaded.money,day:loaded.day,wheatSeeds:loaded.seedStock.wheat,eggs:loaded.inventory.eggs,selectedPlots:loaded.selectedPlotIds});
const future=loadFarmState({getItem:()=>JSON.stringify({schemaVersion:999,farm:{money:99999}})});
observations.push({id:'future-save-envelope',loadedMoney:future.money,returnedStarterFarm:future.money===initialFarmState.money});
const errors=[];
try{loadFarmState({getItem:()=>JSON.stringify({schemaVersion:2,farm:{plots:{6:{crop:'alien-crop',growthDays:-30}}}})});}catch(e){errors.push(String(e));}
const alien=loadFarmState({getItem:()=>JSON.stringify({schemaVersion:2,farm:{plots:{6:{crop:'alien-crop',growthDays:-30}}}})});
observations.push({id:'unknown-crop-save',plot:alien.plots[6],loadErrors:errors});
await fs.writeFile(path.join(evidenceDirectory,'simulation-observations.json'),JSON.stringify(observations,null,2)+'\n');
console.log(JSON.stringify(observations,null,2));
await fs.rm(temporaryDirectory,{recursive:true,force:true});
const storageGetterObservations=[];
globalThis.window={get localStorage(){throw new Error('Simulated storage access denied');}};
try{loadFarmState();storageGetterObservations.push({id:'storage-getter',throws:false});}catch(error){storageGetterObservations.push({id:'storage-getter',throws:true,message:error.message});}
delete globalThis.window;
const recorded=JSON.parse(await fs.readFile(path.join(evidenceDirectory,'simulation-observations.json'),'utf8'));
await fs.writeFile(path.join(evidenceDirectory,'simulation-observations.json'),JSON.stringify([...recorded,...storageGetterObservations],null,2)+'\n');
console.log(JSON.stringify(storageGetterObservations));
