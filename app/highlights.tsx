"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { MarketingCard } from "../lib/content-types";

export default function Highlights({ items }: { items: MarketingCard[] }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const movement = useRef(0);
  const step = useRef(300);

  useEffect(() => {
    const viewport = windowRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let offset = 0;
    let loopWidth = 0;
    let viewportWidth = 0;
    let cards: { element: HTMLElement; left: number; width: number }[] = [];
    let previous = 0;
    let frame = 0;
    function measure() {
      loopWidth = (track!.firstElementChild as HTMLElement)?.offsetWidth ?? 0;
      viewportWidth = viewport!.clientWidth;
      cards = Array.from(track!.querySelectorAll<HTMLElement>(".highlight-card")).map(element => ({ element, left: element.offsetLeft, width: element.offsetWidth }));
      step.current = (cards[0]?.width ?? 284) + 16;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    function animate(now: number) {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      if (loopWidth) {
        if (!paused.current && !reducedMotion.matches) offset += loopWidth / 48000 * elapsed;
        if (Math.abs(movement.current) > .1) {
          const advance = reducedMotion.matches ? movement.current : movement.current * (1 - Math.exp(-elapsed / 100));
          offset += advance;
          movement.current -= advance;
        }
        offset = ((offset % loopWidth) + loopWidth) % loopWidth;
        track!.style.transform = `translate3d(${-offset}px,0,0)`;
        const spread = Math.max(viewportWidth * .22, 120);
        for (const card of cards) {
          const distance = Math.abs(card.left + card.width / 2 - offset - viewportWidth / 2);
          const light = Math.exp(-Math.pow(distance / spread, 4) * 2.2);
          card.element.style.setProperty("--spotlight", light.toFixed(3));
        }
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [items.length]);

  return <section className="marketing-section highlights" id="highlights" aria-labelledby="highlight-heading">
    <div className="section-heading highlight-heading"><div><h2 id="highlight-heading">Product <span>Highlight</span></h2><p>Our HiFi Tower product highlight</p></div></div>
    <div className="highlight-stage">
      <div className="product-spotlight" aria-hidden="true"><div className="spotlight-fixture" /><div className="spotlight-beam" /><div className="spotlight-pool" /></div>
      <div ref={windowRef} className="highlight-window" tabIndex={0} onMouseEnter={() => {paused.current = true;}} onMouseLeave={() => {paused.current = false;}} onFocus={() => {paused.current = true;}} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) paused.current = false;}} aria-label="สินค้าแนะนำ เลื่อนอัตโนมัติ วางเมาส์หรือโฟกัสเพื่อหยุด">
        <div ref={trackRef} className="highlight-track">{[0, 1].map(copy => <div className="highlight-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{items.map(item => <article className="highlight-card" key={item.slug}><div className="highlight-image"><Image unoptimized src={item.image_url} alt={copy === 0 ? item.name : ""} loading="lazy" width="600" height="600" /></div><div className="highlight-copy"><p className="highlight-brand">{item.brand}</p><h3>{item.name}</h3><p>{item.description}</p></div></article>)}</div>)}</div>
      </div>
      <button className="highlight-arrow highlight-arrow-left" aria-label="เลื่อนสินค้าไปทางซ้าย" onClick={() => {movement.current -= step.current;}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg></button>
      <button className="highlight-arrow highlight-arrow-right" aria-label="เลื่อนสินค้าไปทางขวา" onClick={() => {movement.current += step.current;}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></button>
    </div>
  </section>;
}
