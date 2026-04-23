import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const PLACEMENT_OPPOSITE = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function getArrowStyles(placement) {
  const base = 'absolute w-2 h-2 bg-gray-900/90 rotate-45 border border-white/10 pointer-events-none';
  switch (placement) {
    case 'top':
      return `${base} bottom-[-4px] left-1/2 -translate-x-1/2 border-t-0 border-l-0`;
    case 'bottom':
      return `${base} top-[-4px] left-1/2 -translate-x-1/2 border-b-0 border-r-0`;
    case 'left':
      return `${base} right-[-4px] top-1/2 -translate-y-1/2 border-t-0 border-r-0`;
    case 'right':
      return `${base} left-[-4px] top-1/2 -translate-y-1/2 border-b-0 border-l-0`;
    default:
      return `${base} bottom-[-4px] left-1/2 -translate-x-1/2 border-t-0 border-l-0`;
  }
}

function getPositionStyles(placement, rect, gap = 8) {
  const scrollX = window.scrollX || 0;
  const scrollY = window.scrollY || 0;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = rect.top + scrollY - gap;
      left = rect.left + scrollX + rect.width / 2;
      break;
    case 'bottom':
      top = rect.bottom + scrollY + gap;
      left = rect.left + scrollX + rect.width / 2;
      break;
    case 'left':
      top = rect.top + scrollY + rect.height / 2;
      left = rect.left + scrollX - gap;
      break;
    case 'right':
      top = rect.top + scrollY + rect.height / 2;
      left = rect.right + scrollX + gap;
      break;
    default:
      top = rect.top + scrollY - gap;
      left = rect.left + scrollX + rect.width / 2;
  }

  return { top, left };
}

function getTransformOrigin(placement) {
  switch (placement) {
    case 'top':
      return 'bottom center';
    case 'bottom':
      return 'top center';
    case 'left':
      return 'center right';
    case 'right':
      return 'center left';
    default:
      return 'bottom center';
  }
}

function getTransform(placement, isVisible) {
  const offset = isVisible ? 0 : 6;
  switch (placement) {
    case 'top':
      return `translate(-50%, -100%) translateY(${isVisible ? 0 : offset}px)`;
    case 'bottom':
      return `translate(-50%, 0%) translateY(${isVisible ? 0 : -offset}px)`;
    case 'left':
      return `translate(-100%, -50%) translateX(${isVisible ? 0 : offset}px)`;
    case 'right':
      return `translate(0%, -50%) translateX(${isVisible ? 0 : -offset}px)`;
    default:
      return `translate(-50%, -100%) translateY(${isVisible ? 0 : offset}px)`;
  }
}

/**
 * Tooltip - Accessible, portal-based tooltip with smooth animations.
 *
 * Props:
 * - children: trigger element
 * - content: tooltip text (string or React node)
 * - placement: 'top' | 'bottom' | 'left' | 'right' (default 'top')
 * - delay: hover delay in ms (default 150)
 * - className: extra classes on the tooltip bubble
 */
const Tooltip = memo(function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 150,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition(getPositionStyles(placement, rect));
  }, [placement]);

  const show = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    showTimerRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  }, [delay, updatePosition]);

  const hide = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 50);
  }, []);

  const handleFocus = useCallback(() => {
    updatePosition();
    setIsVisible(true);
  }, [updatePosition]);

  const handleBlur = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    const onScrollOrResize = () => {
      if (isVisible) updatePosition();
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const transitionStyle = reducedMotion
    ? { transition: 'none' }
    : {
        transitionProperty: 'opacity, transform',
        transitionDuration: '200ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      };

  const transformOrigin = getTransformOrigin(placement);
  const transform = getTransform(placement, isVisible);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
      </span>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={`fixed z-[100] pointer-events-none ${className}`}
            style={{
              top: position.top,
              left: position.left,
              transform,
              transformOrigin,
              opacity: isVisible ? 1 : 0,
              ...transitionStyle,
            }}
          >
            <div
              className="relative max-w-[240px] rounded-xl px-3 py-2 text-xs text-white shadow-xl
                         bg-gray-900/90 backdrop-blur-md border border-white/10"
            >
              {content}
              <div className={getArrowStyles(placement)} aria-hidden="true" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

export default Tooltip;
