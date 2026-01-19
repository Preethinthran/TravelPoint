import NodeCache from "node-cache";

// stdTTL: "Standard Time To Live"
// The cache will automatically delete data after 3600 seconds (1 Hour).
// checkperiod: How often the cache checks for expired data (120 seconds).
const appCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

export default appCache;