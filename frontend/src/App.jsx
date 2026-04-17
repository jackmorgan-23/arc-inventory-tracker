import React from 'react';
// Triggering Vite to re-resolve imports!
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useInventory } from './hooks/useInventory';
import { ItemBrowser } from './components/ItemBrowser';
import { InventoryGrid } from './components/InventoryGrid';
import { ItemCard } from './components/ItemCard';
import NeonBackground from './components/NeonBackground';
import { Shield } from 'lucide-react';

function App() {
  const inventory = useInventory();

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={inventory.handleDragStart} 
      onDragEnd={inventory.handleDragEnd} 
      onDragCancel={inventory.handleDragCancel}
    >
      <NeonBackground>
        <div className="flex h-screen w-full text-foreground overflow-hidden">
        
        <ItemBrowser />
        
        <div className="flex-1 flex flex-col relative z-20 bg-[#05030a]/20 shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] border-l border-white/5">
          {/* Top Game Navbar */}
          <header className="h-16 flex items-center justify-between px-10 bg-transparent border-b border-white/5 z-10 sticky top-0">
            <div className="flex items-center gap-10">
              <button className="text-white font-bold tracking-[0.2em] border-b-2 border-white py-5 text-sm">INVENTORY</button>
              <button className="text-white/50 hover:text-white transition-colors tracking-[0.2em] py-5 text-sm uppercase">Logbook</button>
              <button className="text-white/50 hover:text-white transition-colors tracking-[0.2em] py-5 text-sm uppercase">System</button>
            </div>
            <div className="flex items-center gap-8 font-mono text-sm tracking-wider">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white rounded-full flex items-center justify-center text-[8px] text-white/50" />
                <span className="text-white">6,283,768</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 flex items-center justify-center text-[8px] text-black">
                  <div className="w-2 rounded-sm h-[1px] bg-black"/>
                </div>
                <span className="text-cyan-400 tracking-wider">4,153<span className="text-cyan-400/50">/800</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-sm skew-x-[-15deg] flex gap-[1px] justify-center items-center overflow-hidden">
                   <div className="w-[1px] h-3 bg-black transform rotate-12" />
                   <div className="w-[1px] h-3 bg-black transform rotate-12" />
                </div>
                <span className="text-yellow-500">2,450</span>
              </div>
            </div>
          </header>

          <InventoryGrid 
            slots={inventory.slots} 
            config={inventory.config}
            totalWeight={inventory.totalWeight} 
            maxWeight={inventory.maxWeight}
            totalCost={inventory.totalCost}
          />
        </div>
      </div>
      </NeonBackground>

      <DragOverlay dropAnimation={null}>
        {inventory.activeItem ? (
          <div className="w-48 h-32 opacity-90 scale-105 pointer-events-none drop-shadow-2xl">
            <ItemCard item={inventory.activeItem.item} isDragging={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
