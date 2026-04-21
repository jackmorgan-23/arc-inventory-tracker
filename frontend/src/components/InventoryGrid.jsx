import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { ItemCard } from './ItemCard';
import { cn } from '../lib/utils';
import { Shield } from 'lucide-react';
import { ItemHoverCard } from './ItemHoverCard';

function InventorySlot({ id, instance, className }) {
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id });

  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: instance?.instanceId || `empty-${id}`,
    data: { item: instance?.item, sourceSlot: id },
    disabled: !instance,
  });

  return (
    <div 
      ref={setDroppableRef} 
      className={cn(
        "relative rounded-md border border-white/5 bg-[#0a0d14] overflow-hidden flex items-center justify-center transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]",
        isOver && "border-cyan-400/60 ring-1 ring-cyan-400/30",
        className
      )}
    >
      {/* Small corner detail */}
      <div className="absolute top-0 right-0 w-[5px] h-[5px] border-t border-r border-white/20 opacity-50 z-10" />
      
      {instance ? (
        <ItemHoverCard item={instance.item} equippedMods={instance.equippedMods} zoomCompact={true}>
          <div ref={setDraggableRef} {...listeners} {...attributes} className="absolute inset-0 cursor-grab active:cursor-grabbing hover:brightness-110">
            <ItemCard item={instance.item} isDragging={isDragging} equippedMods={instance.equippedMods} zoomCompact={true} />
          </div>
        </ItemHoverCard>
      ) : null}
    </div>
  );
}

function SectionHeader({ title, count, total }) {
  return (
    <div className="mb-3 flex items-end justify-between border-b border-white/10 pb-1.5">
      <div className="flex items-center gap-6 w-full">
          <h3 className="text-[12px] font-bold tracking-[0.1em] text-white uppercase">{title}</h3>
          {count !== undefined && (
            <span className="text-[12px] font-bold text-white/90 tracking-widest">
              {count}{total ? `/${total}` : ''}
            </span>
          )}
      </div>
    </div>
  );
}

export function InventoryGrid({ slots, config, totalWeight, maxWeight, totalCost }) {
  const backpackCount = Object.keys(slots).filter(k => k.startsWith('backpack')).length;
  const quickUseCount = Object.keys(slots).filter(k => k.startsWith('quickUse')).length;
  const safePocketCount = Object.keys(slots).filter(k => k.startsWith('safePocket')).length;

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-transparent">
      
      <div className="max-w-[1500px] mx-auto flex flex-col xl:flex-row gap-8 xl:gap-14 justify-center">
        
        {/* LEFT COLUMN: Equipment & Weapons */}
        <div className="flex flex-col gap-6 w-[340px] shrink-0 pt-2">
          
          <div className="flex items-start gap-4 mb-2">
            <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center relative bg-cyan-950/20">
               <Shield className="w-6 h-6 text-cyan-400" />
               <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
              <h1 className="text-xl font-bold tracking-[0.2em] font-sans text-white mb-0 leading-none">LOADOUT</h1>
              <div className="flex items-center gap-4">
                <span className={`text-[12px] font-bold tracking-widest ${Number(totalWeight) > Number(maxWeight) ? "text-red-500" : "text-green-500"} flex items-center gap-1`}>
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2L6 22h12L12 2z"/></svg>
                  {totalWeight}/{maxWeight}
                </span>
                <span className="text-[12px] text-white/90 tracking-widest flex items-center gap-1">
                  <span className="w-3 h-3 border border-white/50 text-[7px] flex items-center justify-center rounded-sm text-white/50 pb-[1px]">C</span>
                  {totalCost ? totalCost.toLocaleString() : "0"}
                </span>
              </div>
            </div>
          </div>

          <div>
             <SectionHeader title="Equipment" />
             <div className="flex gap-3">
               <InventorySlot id="equipment-0" instance={slots['equipment-0']} className="h-[90px] flex-1 border-pink-500/20" />
               <InventorySlot id="equipment-1" instance={slots['equipment-1']} className="h-[90px] flex-1 border-green-500/20" />
             </div>
          </div>
          <div>
             <div className="flex flex-col gap-3">
               <div className="bg-[#121620]/60 rounded-xl p-3 border border-white/5 relative">
                 <InventorySlot id="weapon-0" instance={slots['weapon-0']} className="h-[130px] w-full border-pink-500/20 bg-transparent rounded-lg mb-3" />
                 <div className="flex gap-2 justify-start px-2 min-h-[40px]">
                   {slots['weapon-0']?.item?.modSlots && Object.keys(slots['weapon-0'].item.modSlots).map((modKey) => (
                     <InventorySlot 
                       key={`w0-att-${modKey}`} 
                       id={`weapon-0-att-${modKey}`} 
                       instance={slots['weapon-0']?.equippedMods?.[modKey]} 
                       className="w-10 h-10 border border-white/10 rounded-sm bg-[#0a0d14] flex items-center justify-center relative shadow-inner" 
                     />
                   ))}
                 </div>
               </div>
               
                 <div className="bg-[#121620]/60 rounded-xl p-3 border border-white/5 relative">
                 <InventorySlot id="weapon-1" instance={slots['weapon-1']} className="h-[130px] w-full border-pink-500/20 bg-transparent rounded-lg mb-3" />
                 <div className="flex gap-2 justify-start px-2 min-h-[40px]">
                   {slots['weapon-1']?.item?.modSlots && Object.keys(slots['weapon-1'].item.modSlots).map((modKey) => (
                     <InventorySlot 
                       key={`w1-att-${modKey}`} 
                       id={`weapon-1-att-${modKey}`} 
                       instance={slots['weapon-1']?.equippedMods?.[modKey]} 
                       className="w-10 h-10 border border-white/10 rounded-sm bg-[#0a0d14] flex items-center justify-center relative shadow-inner" 
                     />
                   ))}
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Backpack */}
        <div className="flex flex-col w-auto shrink-0 pt-2">
          <SectionHeader title="Backpack" count={backpackCount} total={config.backpack} />
          <div className="bg-[#121620]/80 rounded-xl p-3 border border-white/5 shadow-lg backdrop-blur-md">
            <div className="grid grid-cols-4 gap-[4px] auto-rows-[110px]">
              {[...Array(config.backpack)].map((_, i) => (
                 <InventorySlot key={`backpack-${i}`} id={`backpack-${i}`} instance={slots[`backpack-${i}`]} className="w-[85px]" />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Use, Augmented, Safe Pocket */}
        <div className="flex flex-col gap-8 w-[280px] shrink-0 pt-2">
          <div>
            <SectionHeader title="Quick Use" count={quickUseCount} total={config.quickUse} />
            <div className="bg-[#121620]/80 rounded-xl p-3 border border-white/5 shadow-lg backdrop-blur-md w-fit">
              <div className="flex flex-wrap gap-[6px]">
                 {[...Array(config.quickUse || 0)].map((_, i) => (
                   <InventorySlot key={`quickUse-${i}`} id={`quickUse-${i}`} instance={slots[`quickUse-${i}`]} className="w-[88px] h-20" />
                 ))}
              </div>
            </div>
          </div>
          
          <div>
            <SectionHeader title="Safe Pocket" count={safePocketCount} total={config.safePocket} />
            <div className="bg-[#121620]/80 rounded-xl p-3 border border-white/5 shadow-lg backdrop-blur-md w-fit">
              <div className="flex gap-[6px] flex-wrap max-w-xs">
                 {[...Array(config.safePocket || 0)].map((_, i) => (
                   <InventorySlot key={`safePocket-${i}`} id={`safePocket-${i}`} instance={slots[`safePocket-${i}`]} className="w-[100px] h-20" />
                 ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
