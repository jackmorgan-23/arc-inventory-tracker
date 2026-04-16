import React, { useEffect, useState, useMemo } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { fetchItems } from '../lib/items';
import { ItemCard } from './ItemCard';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Trash2, Search } from 'lucide-react';
import { ItemHoverCard } from './ItemHoverCard';

function DraggableItemBrowserCard({ item }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browser-${item.id}`,
    data: { item, sourceSlot: null },
  });

  return (
    <ItemHoverCard item={item}>
      <div ref={setNodeRef} {...listeners} {...attributes} className="h-28 mb-3 last:mb-0 relative cursor-grab active:cursor-grabbing transition-transform">
        <ItemCard item={item} isDragging={isDragging} />
      </div>
    </ItemHoverCard>
  );
}

export function ItemBrowser() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setNodeRef, isOver } = useDroppable({ id: 'browser-dropzone' });

  useEffect(() => {
    fetchItems().then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(lowerQuery));
  }, [items, searchQuery]);

  return (
    <div 
      ref={setNodeRef}
      className={`w-[340px] border-r border-white/5 flex flex-col z-20 backdrop-blur-3xl transition-colors ${isOver ? 'bg-red-950/90 border-red-500/50' : 'bg-[#05030a]/95'}`}
    >
      <div className="p-5 border-b border-white/5 relative overflow-hidden shrink-0">
        {/* Glow effect on hover/drop */}
        {isOver && <div className="absolute inset-0 bg-red-500/10 mix-blend-screen" />}
        <div className="flex justify-between items-center relative z-10 mb-5">
          <div>
            <h2 className="text-lg tracking-[0.2em] font-semibold text-white/90">DATABASE</h2>
            <p className="text-xs text-muted-foreground mt-1 tracking-wider">AVAILABLE POOL</p>
          </div>
          {isOver && <Trash2 className="w-6 h-6 text-red-400 animate-pulse" />}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search Database..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0 p-5">
        <div className="flex flex-col">
          {filteredItems.map(item => (
            <DraggableItemBrowserCard key={item.id} item={item} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
