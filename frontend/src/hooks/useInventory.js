import { useState, useCallback, useMemo } from 'react';

export const BASE_CONFIG = {
  equipment: 2,
  weapon: 2,
};

// Augment stats mapped by item id
export const AUGMENT_STATS = {
  "combat_mk1": { backpack: 16, quickUse: 4, safePocket: 1, wlimit: 45.0, name: "Combat Mk. 1" },
  "looting_mk1": { backpack: 18, quickUse: 4, safePocket: 1, wlimit: 50.0, name: "Looting Mk. 1" },
  "tactical_mk1": { backpack: 15, quickUse: 5, safePocket: 1, wlimit: 40.0, name: "Tactical Mk. 1" },
  "free_loadout_augment": { backpack: 14, quickUse: 4, safePocket: 0, wlimit: 35.0, name: "Free Loadout Augment" },
  "default": { backpack: 14, quickUse: 4, safePocket: 0, wlimit: 35.0, name: "Naked Backpack" }
};

export function useInventory() {
  const [slots, setSlots] = useState({});
  const [activeItem, setActiveItem] = useState(null);

  const calculateWeight = useCallback(() => {
    let total = 0;
    Object.values(slots).forEach((instance) => {
      if (instance && instance.item && instance.item.weight) {
        total += instance.item.weight;
      }
    });
    return total.toFixed(1);
  }, [slots]);

  const calculateCost = useCallback(() => {
    let total = 0;
    Object.values(slots).forEach((instance) => {
      if (instance && instance.item && instance.item.value) {
        total += instance.item.value;
      }
    });
    return total;
  }, [slots]);

  const augmentItem = [slots['equipment-0'], slots['equipment-1']].find(s => s?.item?.type === 'augment')?.item;
  const augmentStats = (augmentItem && AUGMENT_STATS[augmentItem.id]) || AUGMENT_STATS.default;

  const config = useMemo(() => ({
    ...BASE_CONFIG,
    backpack: augmentStats.backpack,
    quickUse: augmentStats.quickUse,
    safePocket: augmentStats.safePocket,
    wlimit: augmentStats.wlimit
  }), [augmentStats]);

  const handleDragStart = (event) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.item) {
      setActiveItem({
        instanceId: active.id,
        item: activeData.item,
        fromSlot: activeData.sourceSlot,
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);

    const sourceSlot = active.data.current?.sourceSlot;

    if (!over || String(over.id).startsWith('browser')) {
      if (sourceSlot) {
        setSlots((prev) => {
          const newSlots = { ...prev };
          delete newSlots[sourceSlot];
          return newSlots;
        });
      }
      return;
    }

    const targetSlot = over.id;

    if (!sourceSlot && targetSlot.startsWith('browser')) {
      return;
    }

    const targetItemType = active.data.current.item?.type;
    
    if (targetSlot.startsWith('weapon') && targetItemType !== 'weapon') {
      console.warn('Only weapons can be placed in weapon slots.');
      return;
    }
    const allowedEquipmentTypes = ['augment', 'shield', 'equipment'];
    if (targetSlot.startsWith('equipment') && !allowedEquipmentTypes.includes(targetItemType)) {
      console.warn('Only augments or shields can be placed in equipment slots.');
      return;
    }

    setSlots((prev) => {
      const newSlots = { ...prev };
      const itemToMove = sourceSlot ? prev[sourceSlot] : {
        instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        item: active.data.current.item
      };

      const targetItem = newSlots[targetSlot];

      if (sourceSlot) {
        newSlots[targetSlot] = itemToMove;
        newSlots[sourceSlot] = targetItem || undefined;
      } else {
        newSlots[targetSlot] = itemToMove;
      }
      
      const newAugItem = [newSlots['equipment-0'], newSlots['equipment-1']].find(s => s?.item?.type === 'augment')?.item;
      const newAugStats = (newAugItem && AUGMENT_STATS[newAugItem.id]) || AUGMENT_STATS.default;
      
      const limitChecks = [
        { prefix: 'backpack-', limit: newAugStats.backpack },
        { prefix: 'quickUse-', limit: newAugStats.quickUse },
        { prefix: 'safePocket-', limit: newAugStats.safePocket }
      ];

      // Clean up undefined keys and enforce boundary limits
      Object.keys(newSlots).forEach(key => {
         if (!newSlots[key]) {
           delete newSlots[key];
           return;
         }
         for (const {prefix, limit} of limitChecks) {
           if (key.startsWith(prefix)) {
             const idx = parseInt(key.split('-')[1], 10);
             if (idx >= limit) {
               delete newSlots[key]; // Evict overflowing item
             }
           }
         }
      });

      return newSlots;
    });
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  const clearInventory = () => {
    setSlots({});
  };

  return {
    slots,
    config,
    activeItem,
    totalWeight: calculateWeight(),
    totalCost: calculateCost(),
    maxWeight: config.wlimit.toFixed(1),
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    clearInventory,
  };
}
