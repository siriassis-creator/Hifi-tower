import { getHomeContent, imageBackground, safeHref } from "../lib/content";

export const revalidate = 60;

export default async function Home() {
  const { settings: home, categories, navigation } = await getHomeContent();
  return (
    <main>
      <header>
        <a className="logo" href="#"><span>▥</span><b>HIFI TOWER</b><small>BANGKOK</small></a>
        <nav>{navigation.map(item => <a key={item.slug} className={item.slug === "home" ? "active" : undefined} href={safeHref(item.href)}>{item.label}</a>)}</nav>
        <div className="icons">⌕　♙　▱　 <small>TH | EN</small></div>
      </header>
      <section className="hero">
        <div className="heroPhoto" style={{ backgroundImage: imageBackground(home.hero_image_url) }} aria-hidden="true" />
        <svg className="hero-waves" viewBox="0 0 1676 939" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs><radialGradient id="sound-glow"><stop offset="0" stopColor="#f5bc60" stopOpacity=".35" /><stop offset="1" stopColor="#d59a43" stopOpacity="0" /></radialGradient></defs>
          {[{ x: 1190, y: 434 }, { x: 1295, y: 430 }].map((speaker, index) => (
            <g key={index}>
              <circle className="speaker-glow" cx={speaker.x} cy={speaker.y} r="145" fill="url(#sound-glow)" />
              {[0, 1, 2].map(ring => <circle key={ring} className="sound-ring" cx={speaker.x} cy={speaker.y} r="42" style={{ animationDelay: `${ring * 2 + index * .6}s` }} />)}
            </g>
          ))}
        </svg>
        <div className="showroom-light" aria-hidden="true" />
        <div className="veil" />
        <div className="copy">
          <p className="eyebrow">{home.hero_eyebrow}</p>
          <h1>{home.hero_title.map((line, index) => <span key={index}>{index === home.hero_title.length - 1 ? <em>{line}</em> : line}{index < home.hero_title.length - 1 && <br />}</span>)}</h1>
          <div className="line" />
          <p>{home.hero_description.split("\n").map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>)}<br /><strong>{home.hero_tagline}</strong></p>
          <div className="hero-identity"><a className="featured-title" href={safeHref(home.featured_url)}>{home.featured_brand}</a><p>{home.featured_series}</p></div>
        </div>
      </section>
      <section className="category-intro" id="brands" aria-labelledby="category-heading"><h2 id="category-heading">Product <span>by Category</span></h2><p>We offer a variety of <span>products and services</span> to our clients including</p></section>
      <section className="cards" id="products" aria-label="Product categories">{categories.map(category => (
        <div key={category.slug} className="card">
          <div className="pic" aria-hidden="true" style={{ backgroundImage: imageBackground(category.image_url) }} />
          <h3 className="category-label">{category.name}</h3>
        </div>
      ))}</section>
      <section className="about" id="about">
        <p className="eyebrow">{home.about_eyebrow}</p>
        <h2>{home.about_title}<br /><em>{home.about_highlight}</em></h2>
        <p>{home.about_description}</p>
        <a className="outline" href={safeHref(home.about_cta_url)}>{home.about_cta_label}　→</a>
      </section>
    </main>
  );
}
