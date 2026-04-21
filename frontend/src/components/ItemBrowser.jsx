import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchItems } from '../lib/items';
import { ItemCard } from './ItemCard';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Trash2, Search } from 'lucide-react';
import { ItemHoverCard } from './ItemHoverCard';
import { cn } from '../lib/utils';

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
  const [activeCategory, setActiveCategory] = useState('all');
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'browser-dropzone' });
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchItems().then(setItems);
  }, []);

  const categories = [
    { id: 'all', label: 'ALL' },
    { id: 'weapon', label: 'WEAPONS' },
    { id: 'material', label: 'MATERIALS' },
    { id: 'consumable', label: 'CONSUMABLES' },
    { id: 'augment', label: 'AUGMENTS' },
    { id: 'shield', label: 'SHIELDS' },
  ];

  const filteredItems = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();

    return items.filter(item => {
      // Category Filter
      if (activeCategory !== 'all') {
        const matchesCategory =
          (activeCategory === 'weapon' && item.type === 'weapon') ||
          (activeCategory === 'material' && item.type === 'material') ||
          (activeCategory === 'consumable' && item.type === 'consumable') ||
          (activeCategory === 'augment' && item.type === 'augment') ||
          (activeCategory === 'shield' && item.type === 'shield');

        if (!matchesCategory) return false;
      }

      // Search Filter
      if (!lowerQuery) return true;
      return (
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.subType?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [items, searchQuery, activeCategory]);

  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 124,
    overscan: 5,
  });

  return (
    <div
      ref={setDropRef}
      className={`w-[340px] border-r border-white/5 flex flex-col z-20 backdrop-blur-3xl transition-colors ${isOver ? 'bg-red-950/90 border-red-500/50' : 'bg-[#05030a]/95'}`}
    >
      <div className="p-5 border-b border-white/5 relative overflow-hidden shrink-0">
        {isOver && <div className="absolute inset-0 bg-red-500/10 mix-blend-screen" />}
        <div className="flex justify-between items-center relative z-10 mb-5">
          <div>
            <h2 className="text-lg tracking-[0.2em] font-semibold text-white/90 uppercase">Browse Items</h2>
            <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">{filteredItems.length} Items Listed</p>
          </div>
          {isOver && <Trash2 className="w-6 h-6 text-red-400 animate-pulse" />}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-black/40 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all whitespace-nowrap border",
                activeCategory === cat.id
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                  : "bg-white/5 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
              )}
            >
              {cat.label}
            </button>
          ))}
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
