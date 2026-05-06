import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import './Carousel.css';

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

function CarouselItem({ item, index, itemWidth, trackItemOffset, x, transition }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const rotateY = useTransform(x, range, [90, 0, -90], { clamp: false });

  return (
    <motion.div
      className="carousel-item"
      style={{ width: itemWidth, height: '100%', rotateY }}
      transition={transition}
    >
      {item.image ? (
        <div className="relative h-36 w-full overflow-hidden">
          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="carousel-item-header">
          {item.icon && <span className="carousel-icon-container">{item.icon}</span>}
        </div>
      )}
      <div className="carousel-item-content">
        <div className="carousel-item-title">{item.title}</div>
        {item.description && <p className="carousel-item-description">{item.description}</p>}
        {item.meta && <p className="mt-2 text-xs text-indigo-400">{item.meta}</p>}
      </div>
    </motion.div>
  );
}

export default function Carousel({
  items = [],
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const itemsForRender = useMemo(() => {
    if (!loop || items.length === 0) return items;
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const enter = () => setIsHovered(true);
    const leave = () => setIsHovered(false);
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); };
  }, []);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1 || (pauseOnHover && isHovered)) return;
    const t = setInterval(() => setPosition(p => Math.min(p + 1, itemsForRender.length - 1)), autoplayDelay);
    return () => clearInterval(t);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

  useEffect(() => {
    setPosition(loop ? 1 : 0);
    x.set(-(loop ? 1 : 0) * trackItemOffset);
  }, [items.length, loop, trackItemOffset, x]);

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) { setIsAnimating(false); return; }
    const last = itemsForRender.length - 1;
    if (position === last) {
      setIsJumping(true); setPosition(1); x.set(-trackItemOffset);
      requestAnimationFrame(() => { setIsJumping(false); setIsAnimating(false); });
    } else if (position === 0) {
      setIsJumping(true); const t = items.length; setPosition(t); x.set(-t * trackItemOffset);
      requestAnimationFrame(() => { setIsJumping(false); setIsAnimating(false); });
    } else { setIsAnimating(false); }
  };

  const handleDragEnd = (_, info) => {
    const dir = info.offset.x < -DRAG_BUFFER || info.velocity.x < -VELOCITY_THRESHOLD ? 1
      : info.offset.x > DRAG_BUFFER || info.velocity.x > VELOCITY_THRESHOLD ? -1 : 0;
    if (!dir) return;
    setPosition(p => Math.max(0, Math.min(p + dir, itemsForRender.length - 1)));
  };

  const dragProps = loop ? {} : {
    dragConstraints: { left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0), right: 0 }
  };

  const activeIndex = items.length === 0 ? 0
    : loop ? (position - 1 + items.length) % items.length
    : Math.min(position, items.length - 1);

  return (
    <div ref={containerRef} className="carousel-container" style={{ width: `${baseWidth}px` }}>
      <motion.div
        className="carousel-track"
        drag={isAnimating ? false : 'x'}
        {...dragProps}
        style={{
          width: itemWidth, gap: `${GAP}px`, perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`, x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem key={`${item?.id ?? index}-${index}`} item={item} index={index}
            itemWidth={itemWidth} trackItemOffset={trackItemOffset} x={x} transition={effectiveTransition} />
        ))}
      </motion.div>
      <div className="carousel-indicators-container">
        <div className="carousel-indicators">
          {items.map((_, i) => (
            <motion.div key={i}
              className={`carousel-indicator ${activeIndex === i ? 'active' : 'inactive'}`}
              animate={{ scale: activeIndex === i ? 1.2 : 1 }}
              onClick={() => setPosition(loop ? i + 1 : i)}
              transition={{ duration: 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
