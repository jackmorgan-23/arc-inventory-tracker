import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Tag, MapPin, Briefcase, Coins, Recycle, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const rarityColors = {
  common: "bg-zinc-600/20 text-zinc-300 border-zinc-500/30",
  uncommon: "bg-green-500/20 text-green-300 border-green-400/50",
  rare: "bg-blue-500/20 text-blue-300 border-blue-400/50",
  epic: "bg-purple-500/20 text-purple-300 border-purple-400/50",
  elite: "bg-purple-500/20 text-purple-300 border-purple-400/50",
  legendary: "bg-orange-500/20 text-orange-300 border-orange-400/50"
};

export function ItemHoverCard({ item, children, equippedMods, zoomCompact = false }) {
  if (!item) return <>{children}</>;

  let totalWeight = item.weight || 0;
  let totalValue = item.value || 0;

  if (equippedMods) {
    Object.values(equippedMods).forEach(mod => {
      if (mod?.item?.weight) totalWeight += mod.item.weight;
      if (mod?.item?.value) totalValue += mod.item.value;
    });
  }

  const stats = [];
  if (totalWeight > 0) {
    const isAugmented = totalWeight !== item.weight;
    stats.push({ 
      label: 'Weight', 
      value: isAugmented ? `${item.weight} kg (+${(totalWeight - item.weight).toFixed(2)})` : `${item.weight} kg`, 
      icon: Briefcase 
    });
  }
  if (totalValue > 0) {
    const isAugmented = totalValue !== item.value;
    stats.push({ 
      label: 'Value', 
      value: isAugmented ? `${item.value.toLocaleString()} (+${(totalValue - item.value).toLocaleString()})` : item.value.toLocaleString(), 
      icon: Coins 
    });
  }
  
  // Dynamic stats from effects/augmentStats
  if (item.augmentStats) {
    const s = item.augmentStats;
    stats.push({ label: 'Backpack', value: `${s.backpack} Slots`, icon: Tag });
    stats.push({ label: 'Quick Use', value: `${s.quickUse} Slots`, icon: Tag });
    stats.push({ label: 'Limit', value: `${s.wlimit} kg`, icon: Briefcase });
  }

  const isWeapon = item.isWeapon === true || item.type?.toLowerCase() === 'weapon';
  if (isWeapon) {
    stats.push({
      label: 'Durability',
      value: '100/100',
      icon: Shield
    });
  }

  const isCompact = zoomCompact && ["augment", "shield", "consumable", "material", "key"].includes(item.type?.toLowerCase());

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start" 
        className="w-80 bg-[#12141a]/95 backdrop-blur-xl border-white/10 text-white shadow-2xl z-50 p-0 overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-[8px] bg-black/40 border border-white/10 flex items-center justify-center p-2 shrink-0 overflow-hidden rounded-clip-fix">
              {item.iconUrl ? (
                <img 
                  src={item.iconUrl} 
                  alt={item.name} 
                  className={cn(
                    "w-full h-full object-contain drop-shadow-md transition-transform duration-300",
                    isCompact ? "scale-[1.3]" : "scale-100"
                  )} 
                />
              ) : (
                <div className="w-8 h-8 bg-zinc-700 rounded-sm" />
              )}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <h4 className="font-bold text-lg leading-none tracking-wide text-zinc-100">{item.name}</h4>
              <span className={cn(
                "w-fit px-2 py-0.5 rounded text-[10px] font-semibold border backdrop-blur-sm uppercase tracking-wider",
                rarityColors[item.rarity || 'common']
              )}>
                {item.rarity || 'Common'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {item.description && (
            <p className="text-xs italic text-zinc-400 leading-relaxed">
              "{item.description}"
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-[11px] text-zinc-500">Type:</span>
              <span className="text-[11px] font-semibold text-zinc-200 capitalize truncate">{item.subType || item.type}</span>
            </div>
            
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <stat.icon className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-[11px] text-zinc-500">{stat.label}:</span>
                <span className="text-[11px] font-semibold text-zinc-200 truncate">{stat.value}</span>
              </div>
            ))}
          </div>

          {item.modSlots && (
            <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2">
               <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">Available Slots</span>
               <div className="flex flex-wrap gap-2">
                 {Object.keys(item.modSlots).map(slot => (
                   <span key={slot} className="px-2 py-0.5 rounded bg-cyan-950/30 border border-cyan-500/20 text-[9px] text-cyan-300 uppercase font-bold">
                     {slot}
                   </span>
                 ))}
               </div>
            </div>
          )}
          
          <div className="mt-2 pt-4 border-t border-white/5 flex items-start gap-2">
            <Recycle className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-zinc-300">Materials & Crafting</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Component of higher-tier recipes</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
