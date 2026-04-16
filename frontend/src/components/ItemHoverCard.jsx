import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Tag, MapPin, Briefcase, Coins, Recycle } from 'lucide-react';
import { cn } from './ItemCard';

const rarityColors = {
  common: "bg-zinc-600/20 text-zinc-300 border-zinc-500/30",
  uncommon: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50",
  rare: "bg-indigo-500/20 text-indigo-300 border-indigo-400/50",
  elite: "bg-yellow-500/20 text-yellow-300 border-yellow-400/50",
  legendary: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50"
};

export function ItemHoverCard({ item, children }) {
  if (!item) return <>{children}</>;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      {/* 
        We use portal=false or adjust positioning context so dnd-kit doesn't drag it. 
        Actually, shadcn handles portals well. 
      */}
      <HoverCardContent 
        side="right" 
        align="start" 
        className="w-80 bg-[#12141a]/95 backdrop-blur-xl border-white/10 text-white shadow-2xl z-50 p-0 overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-md bg-black/40 border border-white/10 flex items-center justify-center p-2 shrink-0">
              {item.iconUrl ? (
                <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
              ) : (
                <div className="w-8 h-8 bg-zinc-700 rounded-sm" />
              )}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <h4 className="font-bold text-lg leading-none tracking-wide text-zinc-100">{item.name}</h4>
              <span className={cn(
                "w-fit px-2 py-0.5 rounded textxs font-semibold border backdrop-blur-sm uppercase tracking-wider text-[10px]",
                rarityColors[item.rarity || 'common']
              )}>
                {item.rarity || 'Common'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {item.description && (
            <p className="text-sm italic text-zinc-400">
              "{item.description}"
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-500">Type:</span>
              <span className="text-xs font-semibold text-zinc-200 capitalize truncate">{item.subType || item.type}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-500">Location:</span>
              <span className="text-xs font-semibold text-zinc-200 capitalize truncate">{item.foundIn?.join(', ') || 'Anywhere'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-500">Weight:</span>
              <span className="text-xs font-semibold text-zinc-200 capitalize truncate">{item.weight ? `${item.weight} kg` : '--'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-500">Price:</span>
              <span className="text-xs font-semibold text-zinc-200 capitalize truncate">{item.value ? item.value.toLocaleString() : '0'}</span>
            </div>
          </div>
          
          <div className="mt-2 pt-4 border-t border-white/5 flex items-start gap-2">
            <Recycle className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-300">Recycling Available</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Can be recycled or salvaged</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
