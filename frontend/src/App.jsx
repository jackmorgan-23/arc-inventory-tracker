import React from 'react';
// Triggering Vite to re-resolve imports!
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useInventory } from './hooks/useInventory';
import { useAuth } from './hooks/useAuth';
import { useLoadouts } from './hooks/useLoadouts';
import { ItemBrowser } from './components/ItemBrowser';
import { InventoryGrid } from './components/InventoryGrid';
import { ItemCard } from './components/ItemCard';
import { LoginDialog } from './components/LoginDialog';
import NeonBackground from './components/NeonBackground';
import { Shield, LogIn, Lock, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip';

import { snapCenterToCursor } from '@dnd-kit/modifiers';

function App() {
  const auth = useAuth();
  const loadoutsMgr = useLoadouts({
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
  });
  const [activeLoadoutIndex, setActiveLoadoutIndex] = React.useState(0);

  const initialSlots = loadoutsMgr.loadouts[activeLoadoutIndex] || {};
  const inventory = useInventory(initialSlots, (slotsData) => {
    loadoutsMgr.saveLoadout(activeLoadoutIndex, slotsData);
  });

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
            <header className="h-16 flex items-center justify-between px-10 bg-[#0a0d14]/60 backdrop-blur-md border-b border-white/5 z-10 sticky top-0">
              <div className="flex items-center gap-10">
                {['Loadout 1', 'Loadout 2', 'Loadout 3'].map((label, i) => {
                  const isLocked = !auth.isAuthenticated && i !== 0;
                  const isActive = activeLoadoutIndex === i;
                  
                  const button = (
                    <button
                      onClick={() => !isLocked && setActiveLoadoutIndex(i)}
                      disabled={isLocked}
                      className={`tracking-[0.2em] py-5 text-sm uppercase transition-colors ${
                        isLocked
                          ? 'text-white/20 flex items-center gap-1.5'
                          : isActive
                            ? 'text-white font-bold border-b-2 border-white'
                            : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {isLocked && <Lock className="w-3 h-3" />}
                      {label}
                    </button>
                  );

                  return isLocked ? (
                    <Tooltip key={label} delayDuration={100}>
                      <TooltipTrigger>
                        <span className="cursor-not-allowed flex items-center gap-1.5 py-5 text-sm uppercase text-white/20 tracking-[0.2em]">
                          <Lock className="w-3 h-3" />
                          {label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black/90 border border-white/10 text-white shadow-2xl backdrop-blur-md">
                        <p>Login to use this feature</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <React.Fragment key={label}>
                      {button}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="flex items-center font-sans">
                {loadoutsMgr.isLoading && <Loader2 className="w-4 h-4 mr-4 animate-spin text-white/50" />}
                {loadoutsMgr.isSaving && <span className="text-white/30 text-xs mr-4">Saving...</span>}
                {!loadoutsMgr.isSaving && loadoutsMgr.saveError && (
                  <span className="text-red-300/80 text-xs mr-4">{loadoutsMgr.saveError}</span>
                )}
                {!loadoutsMgr.isLoading && loadoutsMgr.loadError && (
                  <span className="text-amber-200/80 text-xs mr-4">{loadoutsMgr.loadError}</span>
                )}
                {/* Login / Logout */}
                {auth.isAuthenticated ? (
                  <button
                    onClick={auth.logout}
                    className="text-white/50 hover:text-white transition-colors tracking-[0.15em] text-xs uppercase"
                  >
                    Log Out
                  </button>
                ) : (
                  <button
                    onClick={auth.openLoginDialog}
                    className="flex items-center gap-2 text-cyan-400/80 hover:text-cyan-400 transition-colors tracking-[0.15em] text-xs uppercase"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Log In
                  </button>
                )}
              </div>
            </header>

            <InventoryGrid
              slots={inventory.slots}
              config={inventory.config}
              totalWeight={inventory.totalWeight}
              maxWeight={inventory.maxWeight}
              totalCost={inventory.totalCost}
              updateQuantity={inventory.updateQuantity}
              removeItem={inventory.removeItem}
              activeLoadoutIndex={activeLoadoutIndex}
            />
          </div>
        </div>

        <LoginDialog
          open={auth.showLoginDialog}
          onOpenChange={auth.setShowLoginDialog}
          onLoginWithToken={auth.loginWithToken}
          isLoading={auth.isLoading}
        />
      </NeonBackground>

      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {inventory.activeItem ? (
          <div className="w-[85px] h-[110px] opacity-90 pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-200">
            <div className="w-full h-full transform rotate-2 scale-105">
              <ItemCard item={inventory.activeItem.item} isDragging={false} />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
