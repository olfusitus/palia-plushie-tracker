export function migratePaliaData() {
    const OLD_KEY = 'palia_ore_tracker_data';
    const NEW_KEY = 'palia_tracker_ores_gold';
    const TARGET_VERSION = 2;
  
    const oldDataRaw = localStorage.getItem(OLD_KEY);
  //  const newDataRaw = localStorage.getItem(NEW_KEY);
  
  
    if (oldDataRaw) {
      try {
        const oldArray = JSON.parse(oldDataRaw);
  
        if (Array.isArray(oldArray)) {
          const newArray = oldArray.map(entry => ({
            timestamp: entry.timestamp,
            type: entry.type,
            rareDrops: entry.gold
          }));
  
          localStorage.setItem(NEW_KEY, JSON.stringify({
            version: TARGET_VERSION,
            data: newArray
          }));
  
          localStorage.removeItem(OLD_KEY);
        }
      } catch {
        localStorage.removeItem(OLD_KEY);
      }
    }
  }