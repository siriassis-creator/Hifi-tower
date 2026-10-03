import { getHomeContent, imageBackground, safeHref } from "../lib/content";

export const revalidate = 60;

export default async function Home() {
  const { settings: home, brands, categories, navigation } = await getHomeContent();
  return (
    <main>
      <header>
        <a className="logo" href="#"><span>▥</span><b>HIFI TOWER</b><small>BANGKOK</small></a>
        <nav>{navigation.map(item => <a key={item.slug} className={item.slug === "home" ? "active" : undefined} href={safeHref(item.href)}>{item.label}</a>)}</nav>
        <div className="icons">⌕　♙　▱　 <small>TH | EN</small></div>
      </header>
      <section className="hero">
        <div className="heroPhoto" style={{ backgroundImage: `linear-gradient(90deg,#090603 0%,transparent 28%,transparent 82%,#080604 100%),${imageBackground(home.hero_image_url) || "none"}` }} />
        <div className="veil" />
        <div className="copy">
          <p className="eyebrow">{home.hero_eyebrow}</p>
          <h1>{home.hero_title.map((line, index) => <span key={index}>{index === home.hero_title.length - 1 ? <em>{line}</em> : line}{index < home.hero_title.length - 1 && <br />}</span>)}</h1>
          <div className="line" />
          <p>{home.hero_description.split("\n").map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>)}<br /><strong>{home.hero_tagline}</strong></p>
          <a className="outline" href={safeHref(home.hero_cta_url)}>{home.hero_cta_label}　→</a>
        </div>
        <aside><b>{home.featured_brand}</b><span>{home.featured_series}</span><a href={safeHref(home.featured_url)}><u>Discover　→</u></a></aside>
      </section>
      <section className="brandbar" id="brands">{brands.map(brand => <strong key={brand.slug}>{brand.name}</strong>)}</section>
      <section className="cards" id="products" aria-label="Product categories">{categories.map(category => (
        <div key={category.slug} className="card" role="img" aria-label={`${category.name}: ${category.description}`}>
          <div className="pic" style={{ backgroundImage: imageBackground(category.image_url) }} />
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
