import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchItems } from '../lib/items';
import { ItemCard } from './ItemCard';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Trash2, Search } from 'lucide-react';
import { ItemHoverCard } from './ItemHoverCard';

function DraggableItemBrowserCard({ item, virtualStyle }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `browser-${item.id}`,
    data: { item, sourceSlot: null },
  });

  return (
    <div
      style={virtualStyle}
      className="pb-3" // Adds the gap between cards
    >
      <ItemHoverCard item={item}>
        <div ref={setNodeRef} {...listeners} {...attributes} className="h-full w-full relative cursor-grab active:cursor-grabbing transition-transform">
          <ItemCard item={item} isDragging={isDragging} />
        </div>
      </ItemHoverCard>
    </div>
  );
}

export function ItemBrowser() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'browser-dropzone' });
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchItems().then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(lowerQuery));
  }, [items, searchQuery]);

  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 124, // 112px height (h-28) + 12px margin (pb-3)
    overscan: 5,
  });

  return (
    <div 
      ref={setDropRef}
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

      <ScrollArea viewportRef={scrollRef} className="flex-1 min-h-0 p-5 pr-4 overflow-y-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = filteredItems[virtualItem.index];
            return (
              <DraggableItemBrowserCard 
                key={item.id} 
                item={item} 
                virtualStyle={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
