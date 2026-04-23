import { useState, useCallback, useMemo } from 'react';

export const BASE_CONFIG = {
  equipment: 2,
  weapon: 2,
};

const QUICK_USE_ITEMS = [
  "Agave", "Bandage", "Defibrillator", "Integrated Defibrillator", "Expired Pasta",
  "Fabric", "Fruit Mix", "Herbal Bandage", "Moss", "Mushroom", "Resin",
  "Sterilized Bandage", "Vita Shot", "Vita Spray",
  "ARC Powercell", "Integrated Shield Recharger", "Shield Recharger", "Surge Shield Recharger",
  "Adrenaline Shot", "Agave Juice", "Apricot", "Bloated Tuna Can", "Lemon", "Olives", "Prickly Pear",
  "Barricade Kit", "Door Blocker", "Fireworks Box", "Remote Raider Flare", "Zipline", "Surge Coil",
  "Binoculars", "Flame Spray", "Acoustic Guitar", "Integrated Binoculars", "Noisemaker",
  "Photoelectric Cloak", "Recorder", "Shaker", "Snap Hook",
  "Light Impact Grenade", "Heavy Fuze Grenade", "Blaze Grenade", "Gas Grenade", "Showstopper",
  "Snap Blast Grenade", "Seeker Grenade", "Shrapnel Grenade", "Trigger 'Nade", "Trailblazer",
  "Wolfpack", "Lure Grenade", "Li'l Smoke Grenade", "Smoke Grenade", "Tagging Grenade",
  "Green Light Stick", "Yellow Light Stick", "Red Light Stick", "Blue Light Stick", "Firecracker",
  "Blaze Grenade Trap", "Gas Grenade Trap", "Lure Grenade Trap", "Smoke Grenade Trap",
  "Explosive Mine", "Gas Mine", "Jolt Mine", "Pulse Mine", "Deadline"
];

// Default stats for when no augment is equipped
export const DEFAULT_AUGMENT_STATS = {
  backpack: 14,
  quickUse: 4,
  safePocket: 0,
  wlimit: 35.0,
  name: "Naked Backpack"
};

export function useInventory() {
  const [slots, setSlots] = useState({});
  const [activeItem, setActiveItem] = useState(null);

  const calculateWeight = useCallback(() => {
    let total = 0;
    Object.values(slots).forEach((instance) => {
      if (instance && instance.item && instance.item.weight) {
        total += instance.item.weight * (instance.item.quantity || 1);
      }
      if (instance?.equippedMods) {
        Object.values(instance.equippedMods).forEach(modInst => {
          if (modInst?.item?.weight) total += modInst.item.weight * (modInst.item.quantity || 1);
        });
      }
    });
    return total.toFixed(1);
  }, [slots]);

  const calculateCost = useCallback(() => {
    let total = 0;
    Object.values(slots).forEach((instance) => {
      if (instance && instance.item && instance.item.value) {
        total += instance.item.value * (instance.item.quantity || 1);
      }
      if (instance?.equippedMods) {
        Object.values(instance.equippedMods).forEach(modInst => {
          if (modInst?.item?.value) total += modInst.item.value * (modInst.item.quantity || 1);
        });
      }
    });
    return total;
  }, [slots]);

  const augmentItem = [slots['equipment-0'], slots['equipment-1']].find(s => s?.item?.type === 'augment')?.item;
  const augmentStats = augmentItem?.augmentStats || DEFAULT_AUGMENT_STATS;

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
          if (sourceSlot.includes('-att-')) {
            const [parentId, modKey] = sourceSlot.split('-att-');
            if (newSlots[parentId]) {
              const newParent = { ...newSlots[parentId] };
              newParent.equippedMods = { ...newParent.equippedMods };
              delete newParent.equippedMods[modKey];
              newSlots[parentId] = newParent;
            }
          } else {
            delete newSlots[sourceSlot];
          }
          return newSlots;
        });
      }
      return;
    }

    const targetSlot = over.id;

    if (!sourceSlot && targetSlot.startsWith('browser')) {
      return;
    }

    setSlots((prev) => {
      const activeItemData = active.data.current.item;
      const targetItemType = activeItemData?.type;
      const targetItemSubType = activeItemData?.subType;
      
      if (targetSlot.includes('-att-')) {
        const isMod = targetItemType === 'material' || targetItemType === 'mod' || targetItemSubType === 'Modification' || targetItemSubType === 'Attachment';
        if (!isMod) {
          console.warn('Only modifications can be placed in attachment slots.');
          return prev;
        }
        const [parentId, modKey] = targetSlot.split('-att-');
        const parentInstance = prev[parentId];
        if (!parentInstance || !parentInstance.item?.modSlots) return prev;
        
        const allowedMods = parentInstance.item.modSlots[modKey] || [];
        if (!allowedMods.includes(activeItemData.id)) {
          console.warn(`Mod not compatible with ${modKey} slot of this weapon.`);
          return prev;
        }
      } else {
        if (targetSlot.startsWith('weapon') && targetItemType !== 'weapon') {
          console.warn('Only weapons can be placed in weapon slots.');
          return prev;
        }
        if (targetSlot === 'equipment-0' && targetItemType !== 'augment') {
          console.warn('Only augments can be placed in the augment slot.');
          return prev;
        }
        if (targetSlot === 'equipment-1' && targetItemType !== 'shield') {
          console.warn('Only shields can be placed in the shield slot.');
          return prev;
        }

        if (targetSlot.startsWith('quickUse')) {
          const itemName = activeItemData?.name;
          const isAllowed = QUICK_USE_ITEMS.some(name => itemName === name || itemName?.startsWith(name));
          
          if (!isAllowed) {
            console.warn(`Item "${itemName}" cannot be placed in Quick Use slots.`);
            return prev;
          }

          // Augment specific cases
          const equippedAugment = [prev['equipment-0'], prev['equipment-1']].find(s => s?.item?.type === 'augment')?.item?.name;

          if (itemName === "Integrated Defibrillator" && equippedAugment !== "Tactical Mk. 3 (Revival)") {
            console.warn('Integrated Defibrillator requires Tactical Mk. 3 (Revival) augment.');
            return prev;
          }
          if (itemName === "Integrated Shield Recharger" && equippedAugment !== "Tactical Mk. 3 (Defensive)") {
            console.warn('Integrated Shield Recharger requires Tactical Mk. 3 (Defensive) augment.');
            return prev;
          }
          if (itemName === "Integrated Binoculars" && equippedAugment !== "Looting Mk. 3 (Cautious)") {
            console.warn('Integrated Binoculars requires Looting Mk. 3 (Cautious) augment.');
            return prev;
          }
        }
      }

      const newSlots = { ...prev };
      
      const getItemBySlotId = (id) => {
        if (!id) return null;
        if (id.includes('-att-')) {
          const [parentId, modKey] = id.split('-att-');
          return newSlots[parentId]?.equippedMods?.[modKey] || null;
        }
        return newSlots[id] || null;
      };

      const setItemBySlotId = (id, instance) => {
        if (id.includes('-att-')) {
          const [parentId, modKey] = id.split('-att-');
          if (newSlots[parentId]) {
            const newParent = { ...newSlots[parentId] };
            newParent.equippedMods = { ...(newParent.equippedMods || {}) };
            if (instance) {
              newParent.equippedMods[modKey] = instance;
            } else {
              delete newParent.equippedMods[modKey];
            }
            newSlots[parentId] = newParent;
          }
        } else {
          if (instance) {
             newSlots[id] = instance;
             // If a weapon with attachments is overwritten by another item, 
             // its attachments are implicitly destroyed here because the instance is overwritten.
          } else {
             delete newSlots[id];
          }
        }
      };

      const itemToMove = sourceSlot ? getItemBySlotId(sourceSlot) : {
        instanceId: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        item: { ...activeItemData, quantity: activeItemData.stackLimit || 1 },
        equippedMods: {}
      };

      if (!itemToMove) return prev;

      const targetItem = getItemBySlotId(targetSlot);

      if (sourceSlot) {
        setItemBySlotId(targetSlot, itemToMove);
        setItemBySlotId(sourceSlot, targetItem || undefined);
      } else {
        setItemBySlotId(targetSlot, itemToMove);
      }
      
      const newAugItem = [newSlots['equipment-0'], newSlots['equipment-1']].find(s => s?.item?.type === 'augment')?.item;
      const newAugStats = newAugItem?.augmentStats || DEFAULT_AUGMENT_STATS;
      
      const limitChecks = [
        { prefix: 'backpack-', limit: newAugStats.backpack },
        { prefix: 'quickUse-', limit: newAugStats.quickUse },
        { prefix: 'safePocket-', limit: newAugStats.safePocket }
      ];

      // Clean up undefined keys and enforce boundary limits
      Object.keys(newSlots).forEach(key => {
         for (const {prefix, limit} of limitChecks) {
           if (key.startsWith(prefix)) {
             const idx = parseInt(key.split('-')[1], 10);
             if (idx >= limit) {
               // Evict overflowing item. For a more complete game we would drop them to ground, here we just delete.
               delete newSlots[key]; 
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

  const updateQuantity = useCallback((slotId, delta, overrideQuantity = null) => {
    setSlots(prev => {
      const instance = prev[slotId];
      if (!instance) return prev;
      
      const currentQty = instance.item.quantity || 1;
      const newQuantity = overrideQuantity !== null ? overrideQuantity : currentQty + delta;
      
      const stackLimit = instance.item.stackLimit || 1;
      const clampedQuantity = Math.max(0, Math.min(newQuantity, stackLimit));
      
      if (clampedQuantity <= 0) {
        const newSlots = { ...prev };
        delete newSlots[slotId];
        return newSlots;
      }
      
      return {
        ...prev,
        [slotId]: {
          ...instance,
          item: {
            ...instance.item,
            quantity: clampedQuantity
          }
        }
      };
    });
  }, []);

  const removeItem = useCallback((slotId) => {
    setSlots(prev => {
      const newSlots = { ...prev };
      delete newSlots[slotId];
      return newSlots;
    });
  }, []);

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
    updateQuantity,
    removeItem,
  };
}
