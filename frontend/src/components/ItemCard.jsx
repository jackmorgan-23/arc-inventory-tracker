import React from 'react';
import * as Icons from 'lucide-react';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const rarityColors = {
  common: "border-zinc-500/30",
  uncommon: "border-cyan-400/50",
  rare: "border-fuchsia-500/50",
  elite: "border-yellow-400/60"
};

const rarityBGs = {
  common: "bg-zinc-500",
  uncommon: "bg-[#00d0ff]",
  rare: "bg-[#f514b8]",
  elite: "bg-[#ffd500]"
};

export function ItemCard({ item, isDragging }) {
  if (!item) return null;

  const IconComponent = Icons[item.icon] || Icons.Box;

  // We map rarity to roman numerals based on typical game tiers
  const tierBadges = {
    common: "I",
    uncommon: "II",
    rare: "III",
    elite: "IV",
    legendary: "V"
  };

  return (
    <div
      className={cn(
        "relative rounded-[4px] overflow-hidden flex flex-col h-full w-full transition-all duration-200 z-0",
        "bg-gradient-to-br from-white/10 to-transparent",
        isDragging ? "opacity-30 scale-[0.98]" : "hover:brightness-125 cursor-grab active:cursor-grabbing"
      )}
    >
      {/* Rarity Sweep Background */}
      <div 
        className={cn("absolute -bottom-4 -left-4 w-16 h-16 blur-xl", rarityBGs[item.rarity || 'common'])}
      />
      <div 
        className={cn("absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-40", rarityBGs[item.rarity || 'common'])}
      />

      {/* Rarity Corner Sweep */}
      <div 
        className={cn("absolute top-0 left-0 w-8 h-8 opacity-90", rarityBGs[item.rarity || 'common'])}
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      
      {/* Centered Item Icon (no text name) */}
      <div className="flex-1 flex items-center justify-center p-2 relative z-10 w-full h-full">
        {item.iconUrl ? (
          <img 
            src={item.iconUrl} 
            alt={item.name} 
            className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]" 
          />
        ) : (
          <IconComponent className="w-[60%] h-[60%] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" strokeWidth={1} style={{maxHeight:'60px'}} />
        )}
      </div>

      {/* Footer Info Bars */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between items-end p-1 z-10">
         <div className="flex items-center gap-1">
           {item.type === 'weapon' && (
             <div className="flex items-center gap-[1.5px] bg-[#0a0d14]/80 px-1.5 py-0.5 rounded-[2px] border border-white/5">
               <div className="w-[3px] h-[7px] bg-white" />
               <div className="w-[3px] h-[7px] bg-white" />
               <div className="w-[3px] h-[7px] bg-white" />
               <div className="w-[3px] h-[7px] bg-white/30" />
             </div>
           )}
           {item.quantity && (
             <div className="bg-[#0a0d14]/80 px-1.5 py-[2px] rounded-[2px] flex items-center gap-1 text-[9px] font-mono text-white font-bold border border-white/5">
               ×{item.quantity}
             </div>
           )}
         </div>
         
         {/* Tier Badge & Durability */}
         <div className="flex items-center gap-1">
           {item.type === 'weapon' && item.durability && (
             <span className="text-[10px] bg-[#0a0d14]/80 text-white px-1 py-[2px] rounded-[2px] flex items-center gap-0.5 border border-white/5">
               <Icons.Wrench className="w-2.5 h-2.5" />
             </span>
           )}
           <span className="text-[10px] font-serif font-bold text-white bg-white/10 px-1.5 py-[2px] rounded-[2px] backdrop-blur-md shadow-sm">
             {tierBadges[item.rarity || 'common']}
           </span>
         </div>
      </div>
      
      {/* Base border indicator */}
      <div className={cn("absolute bottom-0 left-0 w-full h-[3px] opacity-100", rarityBGs[item.rarity || 'common'])} />
    </div>
  );
}
