import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../lib/utils';

const rarityTopGlows = {
  common:    "bg-[radial-gradient(ellipse_at_top,rgba(220,220,230,0.22)_0%,rgba(220,220,230,0)_75%)] group-hover:bg-[radial-gradient(ellipse_at_top,rgba(220,220,230,0.38)_0%,rgba(220,220,230,0)_75%)]",
  uncommon:  "bg-[radial-gradient(ellipse_at_top,rgba(34,220,90,0.30)_0%,rgba(34,220,90,0)_75%)] group-hover:bg-[radial-gradient(ellipse_at_top,rgba(34,220,90,0.50)_0%,rgba(34,220,90,0)_75%)]",
  rare:      "bg-[radial-gradient(ellipse_at_top,rgba(56,145,255,0.30)_0%,rgba(56,145,255,0)_75%)] group-hover:bg-[radial-gradient(ellipse_at_top,rgba(56,145,255,0.52)_0%,rgba(56,145,255,0)_75%)]",
  epic:      "bg-[radial-gradient(ellipse_at_top,rgba(180,60,255,0.32)_0%,rgba(180,60,255,0)_75%)] group-hover:bg-[radial-gradient(ellipse_at_top,rgba(180,60,255,0.55)_0%,rgba(180,60,255,0)_75%)]",
  elite:     "bg-[radial-gradient(ellipse_at_top,rgba(180,60,255,0.32)_0%,rgba(180,60,255,0)_75%)] group-hover:bg-[radial-gradient(ellipse_at_top,rgba(180,60,255,0.55)_0%,rgba(180,60,255,0)_75%)]",
  legendary: "bg-[radial-gradient(ellipse_at_top,rgba(255,120,20,0.34)_0%,rgba(255,120,20,0)_75%)] group-hover:bg-[radial-gradient(ellipse_at_top,rgba(255,120,20,0.58)_0%,rgba(255,120,20,0)_75%)]"
};

const rarityBorders = {
  common:    "border-white/15 hover:border-white/40",
  uncommon:  "border-green-400/35 hover:border-green-300/65",
  rare:      "border-blue-400/35 hover:border-blue-300/65",
  epic:      "border-purple-400/40 hover:border-purple-300/70",
  elite:     "border-purple-400/40 hover:border-purple-300/70",
  legendary: "border-orange-400/40 hover:border-orange-300/70"
};

const AmmoIcon = ({ type }) => {
  const baseClasses = "w-[15px] h-[15px] text-zinc-300 mr-[4px]";
  const normalized = type?.toLowerCase() || 'default';
  
  if (normalized.includes('light')) {
       return (
         <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
           <path d="M5,4 L6.5,4 L6.5,18 L5,18 Z M5,4 L5.75,2 L6.5,4 Z" />
           <path d="M9,4 L10.5,4 L10.5,18 L9,18 Z M9,4 L9.75,2 L10.5,4 Z" />
           <path d="M13,4 L14.5,4 L14.5,18 L13,18 Z M13,4 L13.75,2 L14.5,4 Z" />
           <path d="M17,4 L18.5,4 L18.5,18 L17,18 Z M17,4 L17.75,2 L18.5,4 Z" />
         </svg>
       );
  }
  if (normalized.includes('medium')) {
       return (
         <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
           <path d="M5,4 L7,4 L7,18 L5,18 Z M5,4 L6,2 L7,4 Z" />
           <path d="M9,4 L11,4 L11,18 L9,18 Z M9,4 L10,2 L11,4 Z" />
           <path d="M13,4 L15,4 L15,18 L13,18 Z M13,4 L14,2 L15,4 Z" />
           <path d="M17,4 L19,4 L19,18 L17,18 Z M17,4 L18,2 L19,4 Z" />
         </svg>
       );
  }
  if (normalized.includes('heavy')) {
       return (
         <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
           <path d="M6,5 L10,5 L10,19 L6,19 Z M6,5 L8,2 L10,5 Z" />
           <path d="M14,5 L18,5 L18,19 L14,19 Z M14,5 L16,2 L18,5 Z" />
         </svg>
       );
  }
  if (normalized.includes('shotgun')) {
       return (
         <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
           <rect x="6" y="4" width="4" height="15" />
           <rect x="5" y="16" width="6" height="3" fill="#080b0e" />
           <rect x="14" y="4" width="4" height="15" />
           <rect x="13" y="16" width="6" height="3" fill="#080b0e" />
           <path d="M6,4 L10,4 L10,2 L6,2 Z M14,4 L18,4 L18,2 L14,2 Z" fill="currentColor"/>
         </svg>
       );
  }
  if (normalized.includes('launcher')) {
       return (
         <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
           <path d="M10,8 L14,8 L14,20 L10,20 Z M10,8 L12,2 L14,8 Z M8,17 L10,17 L10,20 L8,20 Z M14,17 L16,17 L16,20 L14,20 Z" />
         </svg>
       );
  }
  if (normalized.includes('energy')) {
       return (
         <svg viewBox="0 0 24 24" fill="currentColor" className={baseClasses}>
           <path d="M13,3 L4,14 L12,14 L11,22 L20,11 L12,11 L13,3 Z" />
         </svg>
       );
  }
  
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn(baseClasses, "transform -rotate-[40deg]")}>
       <path d="M7,2 L17,2 L17,14 L12,22 L7,14 Z" />
    </svg>
  );
}

export function ItemCard({ item, isDragging, equippedMods, zoomCompact = false }) {
  if (!item) return null;

  const itemType = item.type?.toLowerCase() || '';
  const isBlueprint = item.subType === 'Blueprint';
  const isWeapon = item.isWeapon === true || itemType === 'weapon';
  const IconComponent = Icons[item.icon] || Icons.Box;

  // Extract the weapon level / tier from the end of the item name (e.g. "Anvil II" -> "II")
  const tierMatch = item.name.match(/\s(I|II|III|IV|V)$/);
  const itemTier = tierMatch ? tierMatch[1] : null;
  
  const ammoType = item.effects?.["Ammo Type"]?.value;
  let magSize = parseInt(item.effects?.["Magazine Size"]?.value || '0', 10);

  let hasMagAugment = false;
  if (equippedMods) {
    Object.values(equippedMods).forEach(mod => {
      const effectValue = mod?.item?.effects?.["Magazine Size"]?.value;
      if (effectValue) {
        hasMagAugment = true;
        if (typeof effectValue === 'string' && effectValue.startsWith('+')) {
          magSize += parseInt(effectValue.substring(1), 10);
        } else if (typeof effectValue === 'string' && effectValue.startsWith('-')) {
          magSize -= parseInt(effectValue.substring(1), 10);
        } else if (!isNaN(parseInt(effectValue))) {
          magSize += parseInt(effectValue);
        }
      }
    });
  }

  const isCompact = zoomCompact && ["augment", "shield", "consumable", "material", "key"].includes(itemType);

  return (
    <div
      className={cn(
        "group relative rounded-[8px] overflow-hidden rounded-clip-fix flex flex-col h-full w-full transition-all duration-150 z-0 border shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
        isBlueprint ? "blueprint-grid" : "bg-gradient-to-b from-[#212936] to-[#11161d]",
        isDragging ? "opacity-30 scale-[0.98]" : "cursor-grab active:cursor-grabbing",
        isBlueprint ? "border-transparent" : rarityBorders[item.rarity || 'common']
      )}
    >
      {/* Interactive hover overlay - blueprint uses grid intensify, normal uses white wash */}
      {isBlueprint ? (
        <div className="blueprint-grid-overlay absolute inset-0 z-20 pointer-events-none transition-all duration-200" />
      ) : (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200 z-20 pointer-events-none" />
      )}

      {/* Top Edge Rarity Spotlight (non-blueprint only) */}
      {!isBlueprint && (
        <div 
          className={cn(
            "absolute inset-0 z-0 pointer-events-none transition-all duration-300",
            rarityTopGlows[item.rarity || 'common']
          )}
        />
      )}

      {/* Centered Item Icon & Glow */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center z-10 pointer-events-none",
        isCompact ? "p-2 pb-[26px]" : "p-3 pb-[28px]"
      )}>
        {item.iconUrl ? (
          <img 
            src={item.iconUrl} 
            alt={item.name} 
            className={cn(
              "w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] transition-transform duration-300 relative z-10",
              isCompact 
                ? "scale-[1.15] group-hover:scale-[1.22]" 
                : "group-hover:scale-[1.03]"
            )}
            fetchpriority="high"
          />
        ) : (
          <IconComponent 
            className={cn(
              "text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-300 relative z-10",
              isCompact ? "w-[80%] h-[80%] group-hover:scale-[1.05]" : "w-[60%] h-[60%] group-hover:scale-[1.03]"
            )} 
            strokeWidth={1} 
            style={{maxHeight: isCompact ? '80px' : '60px'}} 
          />
        )}
      </div>

      {/* Solid Black Footer Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[24px] bg-[#080b0e] flex items-center justify-between px-1.5 z-20 border-t border-white/5 rounded-b-[inherit]">
         
         {/* Left Side: Ammo or Quantity */}
         <div className="flex items-center">
           {isWeapon ? (
             <>
               <AmmoIcon type={ammoType} />
               <span className={cn("text-[11px] font-semibold leading-none mt-[1px]", hasMagAugment ? "text-cyan-400" : "text-zinc-200")}>
                 0/{magSize}
               </span>
             </>
           ) : item.quantity !== undefined ? (
             <span className="text-[11px] font-semibold text-zinc-200 leading-none mt-[1px]">×{item.quantity}</span>
           ) : null}
         </div>
         
         {/* Right Side: Durability & Tier Badge */}
         <div className="flex items-center gap-[6px]">
           {isWeapon && (
             <span className="text-[10px] text-zinc-400 font-sans tracking-wide leading-none mt-[1px]">
               100/100
             </span>
           )}
           {itemTier && (
             <span className="text-[12px] font-serif tracking-widest text-zinc-500 font-bold leading-none mt-[1px]">
               {itemTier}
             </span>
           )}
         </div>

      </div>
    </div>
  );
}
