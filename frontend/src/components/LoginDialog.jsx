import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '610891863720-762ompnl3j4m0futovafbn0keapech1k.apps.googleusercontent.com';

// Discord icon SVG
function DiscordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5">
      <path
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LoginDialog({ open, onOpenChange, onLoginWithToken, isLoading }) {
  const googleButtonRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = React.useState(!!window.google?.accounts?.id);
  const [initError, setInitError] = React.useState(null);

  // Check if script is loaded
  useEffect(() => {
    if (isScriptLoaded) return;

    const checkScript = () => {
      if (window.google?.accounts?.id) {
        setIsScriptLoaded(true);
        return true;
      }
      return false;
    };

    if (checkScript()) return;

    const interval = setInterval(() => {
      if (checkScript()) clearInterval(interval);
    }, 500);

    // Timeout after 10s
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.google?.accounts?.id) {
        setInitError("Google Sign-In failed to load. Please check your internet connection or ad-blocker.");
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isScriptLoaded]);

  useEffect(() => {
    if (open && isScriptLoaded && !initError) {
      try {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            console.log("GSI: Credential received");
            onLoginWithToken(response.credential);
          },
          auto_select: false, // Don't auto-login, let user choose
        });

        // Use a longer delay and multiple attempts to find the container
        let attempts = 0;
        const tryRender = () => {
          const container = document.getElementById('google-signin-button');
          if (container) {
            container.innerHTML = '';
            window.google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              width: 350,
              text: 'continue_with',
              shape: 'rectangular',
            });
            console.log("GSI: Button rendered");
            // Also trigger the "One Tap" prompt like in Lab 7
            window.google.accounts.id.prompt();
          } else if (attempts < 10) {
            attempts++;
            setTimeout(tryRender, 150);
          } else {
            setInitError("Login button container not found.");
          }
        };

        setTimeout(tryRender, 150);
      } catch (err) {
        console.error("GSI: Init error:", err);
        setInitError("Failed to initialize Google login.");
      }
    }
  }, [open, isScriptLoaded, onLoginWithToken, initError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-white/10 bg-[#0c0f18]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(56,149,255,0.08)] sm:max-w-[400px]"
        showCloseButton={true}
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-bold tracking-wide text-white">
            Sign In
          </DialogTitle>
          <DialogDescription className="text-white/50 text-sm">
            Save your loadouts and access them from any device
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 pt-4 w-full min-h-[60px]">
          {initError ? (
            <div className="text-red-400 text-xs text-center p-3 bg-red-500/10 rounded border border-red-500/20 w-full">
              {initError}
            </div>
          ) : isScriptLoaded ? (
            <div id="google-signin-button" className="w-full flex justify-center min-h-[40px]" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40 text-sm py-2">
              <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
              <span className="tracking-widest uppercase text-[10px] font-bold">Connecting to Google...</span>
            </div>
          )}

          <div className="relative flex items-center py-1 w-full">
            <div className="flex-grow border-t border-white/10" />
            <span className="mx-3 text-xs text-white/30 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <Button
            variant="outline"
            className="h-11 w-full gap-3 border-white/10 bg-white/5 text-[#7289da] hover:bg-[#7289da]/10 hover:text-[#7289da] transition-all cursor-pointer"
            onClick={() => alert('Discord login coming soon!')}
            disabled={isLoading}
          >
            <DiscordIcon />
            Continue with Discord
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center pt-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
