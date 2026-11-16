"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import ConnectedWorkspace from "./connected-workspace";
import { getSupabaseClient } from "../lib/supabase";

type Sale = { id: string; customer: string; item: string; amount: number; status: "Paid" | "Pending" };
type Product = { name: string; category: string; stock: number; price: number; status: "In stock" | "Low stock" };

const initialSales: Sale[] = [
  { id: "DF-2048", customer: "Aarav Mehta", item: "Everyday Runner · 1 item", amount: 2499, status: "Paid" },
  { id: "DF-2047", customer: "Priya Sharma", item: "Classic Leather · 2 items", amount: 5198, status: "Pending" },
  { id: "DF-2046", customer: "Kabir Retail", item: "Canvas Low · 6 items", amount: 8994, status: "Paid" },
  { id: "DF-2045", customer: "Ananya Rao", item: "Sport Flex · 1 item", amount: 3299, status: "Paid" },
];

const initialProducts: Product[] = [
  { name: "Everyday Runner", category: "Footwear · Sneakers", stock: 24, price: 2499, status: "In stock" },
  { name: "Classic Leather", category: "Footwear · Formal", stock: 8, price: 2599, status: "Low stock" },
  { name: "Canvas Low", category: "Footwear · Casual", stock: 42, price: 1499, status: "In stock" },
  { name: "Sport Flex", category: "Footwear · Sports", stock: 3, price: 3299, status: "Low stock" },
  { name: "Monsoon Trek", category: "Footwear · Outdoor", stock: 16, price: 3899, status: "In stock" },
];

const navItems = ["Overview", "Sales", "Inventory", "Customers", "Dukaan AI", "Reports"];
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const todayLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date());

export default function HomePage() {
  const [showDemo, setShowDemo] = useState(false);
  const supabase = getSupabaseClient();
  if (supabase && !showDemo) return <ConnectedWorkspace supabase={supabase} onViewDemo={() => setShowDemo(true)} />;
  return <DemoWorkspace onBackToAccount={supabase ? () => setShowDemo(false) : undefined} />;
}

function DemoWorkspace({ onBackToAccount }: { onBackToAccount?: () => void }) {
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [sales, setSales] = useState(initialSales);
  const [products, setProducts] = useState(initialProducts);
  const [ready, setReady] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())), [products, query]);
  const heading = active === "Overview" ? "Good morning, Aditi" : active;
  const subheading = active === "Overview" ? "Here’s what’s happening with your business today." : `Your ${active.toLowerCase()} workspace, all in one place.`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("dukaanflow-prototype-v1");
      if (saved) {
        const data = JSON.parse(saved) as { sales?: Sale[]; products?: Product[] };
        if (Array.isArray(data.sales)) setSales(data.sales);
        if (Array.isArray(data.products)) setProducts(data.products);
      }
    } catch { /* Keep the sample workspace if browser storage is unavailable. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem("dukaanflow-prototype-v1", JSON.stringify({ sales, products }));
  }, [ready, sales, products]);

  function createSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const customer = String(data.get("customer") || "Walk-in customer").trim();
    const item = String(data.get("item") || "New sale").trim();
    const amount = Number(data.get("amount"));
    if (!amount || amount <= 0) return;
    setSales((current) => [{ id: `DF-${2049 + current.length - initialSales.length}`, customer, item, amount, status: "Paid" }, ...current]);
    setSaleOpen(false);
    setNotice("Sale added to this demo workspace");
    window.setTimeout(() => setNotice(""), 2600);
  }

  function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("product") || "").trim();
    const category = String(data.get("category") || "Other").trim();
    const stock = Number(data.get("stock"));
    const price = Number(data.get("price"));
    if (!name || stock < 0 || price <= 0) return;
    setProducts((current) => [{ name, category, stock, price, status: stock <= 8 ? "Low stock" : "In stock" }, ...current]);
    setProductOpen(false);
    setNotice("Product saved in this browser");
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setActive("Overview")}><span className="brand-mark">d</span><span>Dukaan<span className="brand-light">Flow</span></span></a>
        <div className="business-switch"><div className="business-avatar">SS</div><div className="business-copy"><strong>Step & Style</strong><span>Retail · Mumbai</span></div><span className="chevron">⌄</span></div>
        <p className="nav-label">WORKSPACE</p>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item, index) => <button key={item} className={`nav-item ${active === item ? "selected" : ""}`} onClick={() => setActive(item)}><span className="nav-icon">{["⌂", "↗", "▦", "♙", "✳", "▤"][index]}</span><span>{item}</span>{item === "Dukaan AI" && <span className="ai-tag">AI</span>}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><span className="help-spark">✳</span><strong>Your business, a little easier.</strong><p>Ask Dukaan AI to find a record or prepare a quick update.</p><button onClick={() => setActive("Dukaan AI")}>Meet your assistant <span>→</span></button></div><button className="profile"><span className="profile-avatar">AS</span><span className="profile-copy"><strong>Aditi Shah</strong><small>Business owner</small></span><span className="more">···</span></button></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="breadcrumb">Step & Style <span>/</span> {active}</div><div className="top-actions"><span className="today-label">{todayLabel}</span>{onBackToAccount && <button className="button button-quiet" onClick={onBackToAccount}>Back to sign in</button>}<button className="icon-button" aria-label="Notifications" onClick={() => setNotice("You’re all caught up")}>♧<i /></button><button className="top-avatar">AS</button></div></header>
        <div className="content">
          <section className="welcome-row"><div><div className="eyebrow">YOUR BUSINESS AT A GLANCE</div><h1>{heading}<span className="wave">✦</span></h1><p>{subheading}</p></div><div className="welcome-actions"><button className="button button-quiet" onClick={() => setNotice("Your report is being prepared")}>↓ <span>Export</span></button><button className="button button-primary" onClick={() => setSaleOpen(true)}><span className="plus">＋</span> Add a sale</button></div></section>

          {active === "Dukaan AI" ? <section className="ai-panel"><div className="ai-orb">✳</div><div className="ai-copy"><span className="eyebrow">DUKAAN AI · PREVIEW</span><h2>How can I help with your business?</h2><p>Try “Show me low stock items” or “What payments are pending?”</p><div className="suggestions"><button onClick={() => { setActive("Inventory"); setQuery(""); }}>Show low stock items <span>→</span></button><button onClick={() => setNotice("There is 1 pending payment in the sample data")}>Find pending payments <span>→</span></button></div><div className="ai-input"><input aria-label="Ask Dukaan AI" placeholder="Ask anything about your business…" /><button onClick={() => setNotice("AI conversations will connect after backend setup")}>↑</button></div><small>AI preview · Actions require your confirmation</small></div></section> : <>
            <section className="metric-grid" aria-label="Business summary"><Metric label="Today’s sales" value={money(28450)} change="↑ 12.8%" note="vs. yesterday" icon="↗" tone="violet"/><Metric label="Orders today" value="18" change="↑ 4" note="vs. yesterday" icon="▣" tone="mint"/><Metric label="Pending payments" value={money(12480)} change="3 customers" note="to follow up" icon="◷" tone="amber"/><Metric label="Low stock items" value="5" change="Needs attention" note="across 2 categories" icon="▧" tone="rose"/></section>
            <section className="section-grid">
              <article className="card sales-card"><div className="card-heading"><div><h2>Recent sales</h2><p>Your latest transactions</p></div><button className="text-link" onClick={() => setActive("Sales")}>View all <span>→</span></button></div><div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{sales.slice(0, 4).map((sale) => <tr key={sale.id}><td className="order-id">{sale.id}</td><td><strong className="customer-name">{sale.customer}</strong><small className="item-name">{sale.item}</small></td><td className="amount">{money(sale.amount)}</td><td><span className={`status ${sale.status === "Paid" ? "paid" : "pending"}`}><i />{sale.status}</span></td></tr>)}</tbody></table></div><button className="mobile-view-all" onClick={() => setActive("Sales")}>View all sales →</button></article>
              <article className="card stock-card"><div className="card-heading"><div><h2>Stock to watch</h2><p>Keep your bestsellers ready</p></div><button className="more-button" onClick={() => setActive("Inventory")}>···</button></div><div className="stock-list">{products.filter((product) => product.status === "Low stock").slice(0, 3).map((product) => <div className="stock-item" key={product.name}><div className="product-symbol">{product.name.slice(0, 1)}</div><div className="stock-product"><strong>{product.name}</strong><span>{product.category.split(" · ")[1]}</span></div><div className="stock-count"><strong>{product.stock}</strong><span>left</span></div></div>)}</div><button className="stock-link" onClick={() => setActive("Inventory")}>Manage inventory <span>→</span></button></article>
            </section>
            <section className="card inventory-card"><div className="card-heading inventory-heading"><div><h2>Products & inventory</h2><p>Your catalog, across every business line</p></div><div className="inventory-actions"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></label><button className="button button-outline" onClick={() => setProductOpen(true)}>＋ <span>Add product</span></button></div></div><div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>IN STOCK</th><th>PRICE</th><th>STATUS</th></tr></thead><tbody>{filteredProducts.slice(0, 4).map((product) => <tr key={product.name}><td><div className="product-cell"><span className="product-thumb">{product.name.slice(0, 1)}</span><strong>{product.name}</strong></div></td><td className="muted-cell">{product.category}</td><td className="stock-number">{product.stock} pairs</td><td className="amount">{money(product.price)}</td><td><span className={`status ${product.status === "In stock" ? "paid" : "pending"}`}><i />{product.status}</span></td></tr>)}</tbody></table>{filteredProducts.length === 0 && <div className="empty-state">No products match “{query}”</div>}</div></section>
          </>}
          <footer className="page-footer"><span>Built for the way Indian businesses work.</span><span>Prototype workspace <b>·</b> Sample data</span></footer>
        </div>
      </section>

      {saleOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSaleOpen(false); }}><form className="sale-modal" onSubmit={createSale}><button type="button" className="modal-close" onClick={() => setSaleOpen(false)}>×</button><span className="eyebrow">NEW TRANSACTION</span><h2>Add a sale</h2><p>Record a sale in your Step & Style workspace.</p><label>Customer<input name="customer" placeholder="Customer name" /></label><label>Product or service<input name="item" placeholder="e.g. Everyday Runner · 1 item" required /></label><label>Amount (₹)<input name="amount" type="number" min="1" placeholder="0" required /></label><div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setSaleOpen(false)}>Cancel</button><button className="button button-primary" type="submit">Save sale</button></div></form></div>}
      {productOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProductOpen(false); }}><form className="sale-modal" onSubmit={createProduct}><button type="button" className="modal-close" onClick={() => setProductOpen(false)}>×</button><span className="eyebrow">INVENTORY</span><h2>Add a product</h2><p>Product changes are saved in this browser for the prototype.</p><label>Product name<input name="product" required placeholder="Product name" /></label><label>Category<input name="category" required placeholder="e.g. Footwear · Casual" /></label><label>Quantity in stock<input name="stock" type="number" min="0" required placeholder="0" /></label><label>Price (₹)<input name="price" type="number" min="1" required placeholder="0" /></label><div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setProductOpen(false)}>Cancel</button><button className="button button-primary" type="submit">Save product</button></div></form></div>}
      {notice && <div className="toast" role="status">✓ <span>{notice}</span></div>}
    </main>
  );
}

function Metric({ label, value, change, note, icon, tone }: { label: string; value: string; change: string; note: string; icon: string; tone: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div><strong className="metric-value">{value}</strong><div className="metric-note"><b className={tone === "violet" || tone === "mint" ? "positive" : "neutral"}>{change}</b><span>{note}</span></div></article>;
}
