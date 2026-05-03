
"use client"

import React, { useEffect, useRef, useState } from 'react'
import { loadingManager, onSceneReady, isSceneReady } from '@/lib/loaderManager'
import { GooeyLoader } from '@/components/ui/loader-10'
import { fetchUserProfile } from '@/lib/services/user'
import { getAuthToken, logout } from '@/lib/services/auth'

export default function Overlay({
  isChatOpen,
  setIsChatOpen,
  isModelsOpen,
  setIsModelsOpen
}: {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isModelsOpen: boolean;
  setIsModelsOpen: (open: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const grainCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollProgressRef = useRef(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const rafRef = useRef<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [managerLoaded, setManagerLoaded] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Fetch user profile on mount
  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (token) {
        try {
          const userProfile = await fetchUserProfile(token);
          setUser(userProfile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setUser(null);
        }
      }
      setLoadingUser(false);
    }
    loadUser();
  }, []);

  // Update scrollProgressRef on scroll
  useEffect(() => {
    function onScroll() {
      scrollProgressRef.current = Math.max(0, window.scrollY / (window.innerHeight || 1))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // rAF loop to sync scrollProgress into state for rendering
  useEffect(() => {
    function tick() {
      setScrollProgress(scrollProgressRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Film-grain canvas drawing (animated)
  useEffect(() => {
    const canvas = grainCanvasRef.current
    if (!(canvas instanceof HTMLCanvasElement)) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = 0
    let h = 0
    let raf: number | null = null
    const canvasEl = canvas as HTMLCanvasElement

    function resize() {
      const ratio = window.devicePixelRatio || 1
      w = canvasEl.clientWidth * ratio
      h = canvasEl.clientHeight * ratio
      canvasEl.width = w
      canvasEl.height = h
    }

    function draw() {
      if (!ctx) return
      const imageData = ctx.createImageData(w, h)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 12 // low alpha for subtle grain
      }
      ctx.putImageData(imageData, 0, 0)
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [])

  // Subscribe to shared loading manager to show GooeyLoader while assets load
  useEffect(() => {
    const lm: any = loadingManager
    const onStart = (_url: string, itemsLoaded: number, itemsTotal: number) => {
      setIsLoading(true)
      setProgress(itemsLoaded / Math.max(1, itemsTotal))
    }
    const onProgress = (_url: string, itemsLoaded: number, itemsTotal: number) => {
      setProgress(itemsLoaded / Math.max(1, itemsTotal))
    }
    const onLoad = () => {
      setProgress(1)
      setManagerLoaded(true)
    }
    const onError = (url: string) => {
      console.warn('Loading error:', url)
      setIsLoading(false)
    }

    lm.onStart = onStart
    lm.onProgress = onProgress
    lm.onLoad = onLoad
    lm.onError = onError

    // If nothing was loading by the time we mounted, mark manager loaded after a tiny delay
    const t = setTimeout(() => {
      if (lm.itemsLoaded === lm.itemsTotal) setManagerLoaded(true)
    }, 200)

    return () => {
      clearTimeout(t)
      lm.onStart = null
      lm.onProgress = null
      lm.onLoad = null
      lm.onError = null
    }
  }, [])

  // listen for scene-ready
  useEffect(() => {
    const off = onSceneReady(() => setSceneReady(true))
    // if already ready, set immediately
    if (isSceneReady()) setSceneReady(true)
    return off
  }, [])

  // hide loader only when both the manager reported loaded and the scene signalled ready
  useEffect(() => {
    if (managerLoaded && sceneReady) {
      // small delay for smooth fade
      setTimeout(() => setIsLoading(false), 220)
    }
  }, [managerLoaded, sceneReady])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: 'transparent', position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {/* Global loader (centered) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: isLoading ? 'auto' : 'none',
        transition: 'opacity 320ms ease, background 320ms ease',
        opacity: isLoading ? 1 : 0,
        background: isLoading ? '#000' : 'transparent'
      }}>
        <div style={{ transition: 'opacity 320ms ease', opacity: isLoading ? 1 : 0 }}>
          <GooeyLoader primaryColor="#8b5cf6" secondaryColor="#60a5fa" borderColor="#0f172a" />
        </div>
      </div>
      {/* Navigation*/}
      <nav 
        className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 py-4 flex justify-between items-center bg-black/20 pointer-events-auto"
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#000'
          }} />
        </div>

        <div className="hidden md:flex gap-8 font-sans text-[11px] font-medium tracking-[1px] uppercase items-center">
          <a href="#" className="text-white/90 no-underline hover:text-white transition-colors">
            Creative Journey
          </a>
          <a href="#" className="hidden md:inline-block text-white/90 no-underline hover:text-white transition-colors">
            About
          </a>
          <a href="#" className="hidden md:inline-block text-white/90 no-underline hover:text-white transition-colors">
            Sound
          </a>
          <button
            onClick={() => setIsModelsOpen(true)}
            className="hidden md:inline-block text-white/90 hover:text-white transition-colors bg-transparent border-none cursor-pointer font-inherit text-inherit uppercase p-0"
          >
            AI Models
          </button>
          <button
            onClick={() => setIsChatOpen(true)}
            className="inline-block text-white/90 hover:text-white transition-colors bg-transparent border-none cursor-pointer font-inherit text-inherit uppercase p-0"
          >
            Chat
          </button>
        </div>

        {!loadingUser && (
          user ? (
            // Authenticated user menu
            <div className="flex items-center gap-3">
              <span className="font-sans text-[11px] font-medium text-white tracking-[1px] uppercase hidden md:inline-block">
                {user.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  setUser(null);
                  window.location.reload();
                }}
                className="font-sans text-[11px] font-medium text-white tracking-[1px] uppercase no-underline px-4 py-2 bg-red-500/15 border border-red-500/30 rounded-md transition-all duration-300 backdrop-blur-md cursor-pointer hover:bg-red-500/25 hover:border-red-500/50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            // Not authenticated - show Sign In link
            <a
              href="/signin"
              className="font-sans text-[11px] font-medium text-white tracking-[1px] uppercase no-underline px-4 py-2 bg-violet-500/15 border border-violet-500/30 rounded-md transition-all duration-300 backdrop-blur-md cursor-pointer hover:bg-violet-500/25 hover:border-violet-500/50 flex-shrink-0"
            >
              Sign In
            </a>
          )
        )}
      </nav>

      {/* Large text*/}
      <div style={{
        position: 'fixed',
        bottom: '15%',
        left: 0,
        right: 0,
        zIndex: 50,
        transform: `translateY(${scrollProgress * 100}px)`,
        opacity: Math.max(0, 1 - scrollProgress * 1.5),
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none'
      }}>
        <div style={{
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: 'clamp(4rem, 15vw, 12rem)',
          fontWeight: '900',
          color: 'white',
          textAlign: 'center',
          lineHeight: 0.8,
          letterSpacing: '-0.02em',
          textShadow: '0 0 50px rgba(255, 255, 255, 0.3)',
          filter: 'contrast(1.2)'
        }}>
          LUMINA
        </div>
      </div>

      {/* Left side text */}
      <div 
        className="hidden md:block"
        style={{
          position: 'fixed',
          left: '2rem',
          top: '40%',
          zIndex: 50,
          transform: `translateX(${-scrollProgress * 200}px)`,
          opacity: Math.max(0, 1 - scrollProgress * 2),
          transition: 'transform 0.1s ease-out',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          color: 'white',
          lineHeight: 1.4,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          opacity: 0.8,
          maxWidth: '150px'
        }}>
          In the dark<br />
          is where<br />
          light takes form<br />
          <br />
        </div>
      </div>

      {/* Right side text */}
      <div 
        className="hidden md:block"
        style={{
          position: 'fixed',
          right: '2rem',
          top: '40%',
          zIndex: 50,
          transform: `translateX(${scrollProgress * 200}px)`,
          opacity: Math.max(0, 1 - scrollProgress * 2),
          transition: 'transform 0.1s ease-out',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          color: 'white',
          lineHeight: 1.4,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          opacity: 0.8,
          maxWidth: '150px',
          textAlign: 'right'
        }}>
          In emptiness<br />
          we find<br />
          true happiness

        </div>
      </div>

      {/* Bottom text*/}
      <div style={{
        position: 'fixed',
        bottom: '8%',
        left: '2rem',
        zIndex: 50,
        transform: `translateY(${scrollProgress * 50}px)`,
        opacity: Math.max(0, 1 - scrollProgress * 1.5),
        transition: 'transform 0.1s ease-out',
        pointerEvents: 'none'
      }}>
        <div style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          color: 'white',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          opacity: 0.7
        }}>
        </div>
      </div>

      {/* Canvas Container */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', pointerEvents: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent'
          }}
        />
        {/* Film Grain Overlay Canvas */}
        <canvas
          ref={grainCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            opacity: 0.6
          }}
        />
      </div>

      {/* CSS for exact styling and animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        
        @keyframes grainMove {
          0% { 
            background-position: 0px 0px, 0px 0px, 0px 0px;
          }
          10% { 
            background-position: -5px -10px, 10px -15px, -10px 5px;
          }
          20% { 
            background-position: -10px 5px, -5px 10px, 15px -10px;
          }
          30% { 
            background-position: 15px -5px, -10px 5px, -5px 15px;
          }
          40% { 
            background-position: 5px 10px, 15px -10px, 10px -5px;
          }
          50% { 
            background-position: -15px 10px, 5px 15px, -10px -15px;
          }
          60% { 
            background-position: 10px -15px, -15px -5px, 15px 10px;
          }
          70% { 
            background-position: -5px 15px, 10px -10px, -15px 5px;
          }
          80% { 
            background-position: 15px 5px, -5px -15px, 5px -10px;
          }
          90% { 
            background-position: -10px -5px, 15px 10px, 10px 15px;
          }
          100% { 
            background-position: 0px 0px, 0px 0px, 0px 0px;
          }
        }
        
        a:hover {
          opacity: 1 !important;
          transition: opacity 0.2s ease;
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
