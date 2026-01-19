import appCache from "./cache";

export const trackSearchDemand = (from :string, to :string) => {
    const fromKey = String(from).toLowerCase();
    const toKey = String(to).toLowerCase();
    const key = `demand_${fromKey}_${toKey}`;
    const currentCount = appCache.get<number>(key) || 0;
    appCache.set(key, currentCount + 1, 3600);
    console.log(`📈 Demand for Route ${fromKey}->${toKey}: ${currentCount + 1} searches`);
};

export const getDynamicMultiplier = (from:string, to:string) => {
    const fromKey = String(from).toLowerCase();
    const toKey = String(to).toLowerCase();
    const key = `demand_${fromKey}_${toKey}`;
    const searchCount = appCache.get<number>(key) || 0;

    if (searchCount > 10){
        return 1.25;
    }else if (searchCount > 5){
        return 1.10;
    }else if (searchCount <= 2) { 
        return 0.90; 
    }

    return 1.0;
}
export const getDateMultiplier = (dateInput: string | Date): number => {
    const date = new Date(dateInput);
    const day = date.getDay(); 

    if (day === 0 || day === 5 || day === 6) {
        return 1.15; 
    }
   
    const month = date.getMonth(); 
    const dateNum = date.getDate();
    
    if (month === 0 && dateNum === 1) {
        return 1.20; 
    }

    // Normal Weekday (Mon-Thu)
    return 1.0;
};

const TIER_1_CITIES = ['bangalore', 'chennai', 'hyderabad', 'mumbai', 'delhi', 'coimbatore'];

export const getLocationMultiplier = (from: string, to: string): number => {
    const fromCity = String(from).toLowerCase().trim();
    const toCity = String(to).toLowerCase().trim();

    const isFromTier1 = TIER_1_CITIES.some(city => fromCity.includes(city));
    const isToTier1 = TIER_1_CITIES.some(city => toCity.includes(city));

    if (isFromTier1 || isToTier1) {
        return 1.05; 
    }

    return 1.0;
};