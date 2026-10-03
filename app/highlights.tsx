"use client";

import Image from "next/image";
import { useState } from "react";
import type { MarketingCard } from "../lib/content-types";

export default function Highlights({ items }: { items: MarketingCard[] }) {
  const [paused, setPaused] = useState(false);
  return <section className="marketing-section highlights" id="highlights" aria-labelledby="highlight-heading">
    <div className="section-heading highlight-heading"><div><h2 id="highlight-heading">Product <span>Highlight</span></h2><p>Our HiFi Tower product highlight</p></div><button className="scroll-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "เลื่อนต่อ" : "หยุดเลื่อน"}</button></div>
    <div className={`highlight-window${paused ? " is-paused" : ""}`} tabIndex={0} aria-label="สินค้าแนะนำ เลื่อนอัตโนมัติ วางเมาส์หรือโฟกัสเพื่อหยุด">
      <div className="highlight-track">{[0, 1].map(copy => <div className="highlight-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{items.map(item => <article className="highlight-card" key={item.slug}><div className="highlight-image"><Image unoptimized src={item.image_url} alt={copy === 0 ? item.name : ""} loading="lazy" width="600" height="600" /></div><div className="highlight-copy"><p className="highlight-brand">{item.brand}</p><h3>{item.name}</h3><p>{item.description}</p></div></article>)}</div>)}</div>
    </div>
  </section>;
}
