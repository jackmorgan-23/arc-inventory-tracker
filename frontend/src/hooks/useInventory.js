import { useState, useCallback, useMemo } from 'react';

export const BASE_CONFIG = {
  equipment: 2,
  weapon: 2,
};

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
        total += instance.item.weight;
      }
      if (instance?.equippedMods) {
        Object.values(instance.equippedMods).forEach(modInst => {
          if (modInst?.item?.weight) total += modInst.item.weight;
        });
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
      if (instance?.equippedMods) {
        Object.values(instance.equippedMods).forEach(modInst => {
          if (modInst?.item?.value) total += modInst.item.value;
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
        const allowedEquipmentTypes = ['augment', 'shield', 'equipment'];
        if (targetSlot.startsWith('equipment') && !allowedEquipmentTypes.includes(targetItemType)) {
          console.warn('Only augments or shields can be placed in equipment slots.');
          return prev;
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
        item: activeItemData,
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
