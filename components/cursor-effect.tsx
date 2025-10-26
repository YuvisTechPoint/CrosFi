"use client"

import { useEffect, useRef } from 'react'

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0
    let isMouseMoving = false
    let time = 0

    // Create trail elements with water flow effect
    const createTrail = () => {
      for (let i = 0; i < 12; i++) {
        const trail = document.createElement('div')
        trail.className = 'cursor-trail'
        trail.style.cssText = `
          position: fixed;
          width: ${25 - i * 1.5}px;
          height: ${25 - i * 1.5}px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: screen;
          transition: all 0.05s ease-out;
          opacity: ${0.9 - i * 0.07};
          transform: scale(${1 - i * 0.08});
        `
        document.body.appendChild(trail)
        trailRefs.current[i] = trail
      }
    }

    createTrail()

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      isMouseMoving = true
    }

    const animateCursor = () => {
      time += 0.016
      
      // Smooth cursor movement with water-like flow
      cursorX += (mouseX - cursorX) * 0.12
      cursorY += (mouseY - cursorY) * 0.12

      if (cursor) {
        cursor.style.left = `${cursorX}px`
        cursor.style.top = `${cursorY}px`
        
        // Add subtle pulsing effect
        const pulse = 1 + Math.sin(time * 3) * 0.1
        cursor.style.transform = `scale(${pulse})`
      }

      // Animate trail elements with flowing water effect
      trailRefs.current.forEach((trail, index) => {
        if (trail) {
          const delay = index * 0.015
          const waveOffset = Math.sin(time * 2 + index * 0.5) * 2
          const flowOffset = Math.cos(time * 1.5 + index * 0.3) * 1.5
          
          // Water flow calculation
          const flowX = (mouseX - cursorX) * (0.08 + index * 0.03) + waveOffset
          const flowY = (mouseY - cursorY) * (0.08 + index * 0.03) + flowOffset
          
          trail.style.left = `${cursorX + flowX}px`
          trail.style.top = `${cursorY + flowY}px`
          
          // Dynamic scaling and rotation for water effect
          const scale = (1 - index * 0.08) + Math.sin(time * 2 + index) * 0.05
          const rotation = Math.sin(time * 1.5 + index * 0.4) * 5
          trail.style.transform = `scale(${scale}) rotate(${rotation}deg)`
          
          // Dynamic opacity for flowing effect
          const opacity = (0.9 - index * 0.07) + Math.sin(time * 3 + index * 0.6) * 0.1
          trail.style.opacity = Math.max(0.1, opacity)
        }
      })

      animationRef.current = requestAnimationFrame(animateCursor)
    }

    const handleMouseEnter = () => {
      if (cursor) {
        cursor.style.opacity = '1'
        cursor.style.transform = 'scale(1)'
      }
    }

    const handleMouseLeave = () => {
      if (cursor) {
        cursor.style.opacity = '0'
        cursor.style.transform = 'scale(0.3)'
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    animateCursor()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Clean up trail elements
      trailRefs.current.forEach(trail => {
        if (trail && trail.parentNode) {
          trail.parentNode.removeChild(trail)
        }
      })
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="cursor-main"
        style={{
          position: 'fixed',
          width: '35px',
          height: '35px',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: 0,
          transform: 'scale(0.3)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          left: '-50px',
          top: '-50px',
        }}
      />
      <style jsx>{`
        .cursor-main {
          background: linear-gradient(135deg, 
            #ff0080 0%, 
            #00ff80 33%, 
            #8000ff 66%,
            #ff8000 100%
          );
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          box-shadow: 
            0 0 25px rgba(255, 0, 128, 0.8),
            0 0 50px rgba(0, 255, 128, 0.6),
            0 0 75px rgba(128, 0, 255, 0.4),
            inset 0 0 20px rgba(255, 255, 255, 0.2);
          filter: blur(0.8px) brightness(1.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .cursor-trail {
          background: linear-gradient(135deg, 
            rgba(255, 0, 128, 0.9) 0%, 
            rgba(0, 255, 128, 0.7) 33%, 
            rgba(128, 0, 255, 0.5) 66%,
            rgba(255, 128, 0, 0.3) 100%
          );
          background-size: 200% 200%;
          animation: gradientShift 2s ease infinite;
          box-shadow: 
            0 0 15px rgba(255, 0, 128, 0.6),
            0 0 30px rgba(0, 255, 128, 0.4),
            0 0 45px rgba(128, 0, 255, 0.3);
          filter: blur(1.2px) brightness(1.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Hide default cursor on interactive elements */
        * {
          cursor: none !important;
        }

        /* Show default cursor on text inputs and textareas */
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"],
        textarea {
          cursor: text !important;
        }

        /* Show pointer cursor on buttons and links */
        button,
        a,
        [role="button"],
        [onclick] {
          cursor: pointer !important;
        }

        /* Special hover effects for interactive elements */
        button:hover,
        a:hover,
        [role="button"]:hover {
          cursor: pointer !important;
        }
      `}</style>
    </>
  )
}
