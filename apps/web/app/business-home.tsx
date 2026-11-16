"use client";

type Business = { id: string; name: string; default_currency: string; locale: string; time_zone: string };

export default function BusinessHome({ business, email, onSignOut }: { business: Business; email: string; onSignOut: () => void }) {
  const sections = [
    ["Sales", "Record sales, orders, and payments."],
    ["Customers", "Keep customer and supplier details together."],
    ["Products & services", "Build the catalog for your business."],
    ["Inventory", "Track stock and spot items running low."],
    ["Team & tasks", "Organize people and day-to-day work."],
    ["Dukaan AI", "Ask questions about your business data."],
  ];
  return <main className="business-home">
    <header className="home-top"><a className="brand" href="#workspace"><span className="brand-mark">d</span><span>Dukaan<span className="brand-light">Flow</span></span></a><button className="button button-quiet" onClick={onSignOut}>Sign out</button></header>
    <section className="home-content">
      <span className="eyebrow">YOUR BUSINESS WORKSPACE</span>
      <h1>Welcome to {business.name}</h1>
      <p className="home-subtitle">Your workspace is ready. Start with a section below; your business data is private to your account.</p>
      <div className="home-meta"><span>{business.default_currency}</span><span>{business.locale}</span><span>{business.time_zone}</span><span>{email}</span></div>
      <div className="home-empty"><div className="home-empty-icon">✳</div><div><strong>Your business starts here</strong><p>There are no records yet. Add a customer, product, or first sale to begin.</p></div></div>
      <div className="home-sections">{sections.map(([title, description]) => <article className="home-section" key={title}><span className="home-section-icon">{title === "Dukaan AI" ? "✳" : "→"}</span><strong>{title}</strong><span>{description}</span></article>)}</div>
    </section>
  </main>;
}
