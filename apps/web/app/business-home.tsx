"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Business = { id: string; name: string; default_currency: string; locale: string; time_zone: string };
type CatalogItem = { id: string; name: string; category: string; stock_quantity: number | null; unit: string; unit_price_minor: number; currency: string };
type Sale = { id: string; customer_name: string; item_summary: string; total_minor: number; currency: string; status: "paid" | "pending"; occurred_at: string };

const money = (minor: number, currency: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(minor / 100);
const dateInBusinessZone = (value: string | Date, locale: string, timeZone: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone }).format(new Date(value));

export default function BusinessHome({ business, email, supabase, onSignOut }: { business: Business; email: string; supabase: SupabaseClient; onSignOut: () => void }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [saleFormOpen, setSaleFormOpen] = useState(false);

  const loadRecords = useCallback(async () => {
    setBusy(true);
    const [itemResult, saleResult] = await Promise.all([
      supabase.from("catalog_items").select("id,name,category,stock_quantity,unit,unit_price_minor,currency").eq("business_id", business.id).eq("active", true).order("created_at", { ascending: false }),
      supabase.from("sales").select("id,customer_name,item_summary,total_minor,currency,status,occurred_at").eq("business_id", business.id).order("occurred_at", { ascending: false }).limit(20),
    ]);
    const loadError = itemResult.error ?? saleResult.error;
    if (loadError) {
      setMessage(loadError.code === "42P01" || loadError.code === "PGRST205"
        ? "Business record tables are not set up yet. Apply the catalog and sales migration from the project repository in Supabase."
        : `Could not load business records: ${loadError.message}`);
    }
    else {
      setItems((itemResult.data ?? []) as CatalogItem[]);
      setSales((saleResult.data ?? []) as Sale[]);
      setMessage("");
    }
    setBusy(false);
  }, [business.id, supabase]);

  useEffect(() => { void loadRecords(); }, [loadRecords]);

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") ?? "").trim();
    const category = String(form.get("category") ?? "Other").trim();
    const stock = Number(form.get("stock"));
    const price = Number(form.get("price"));
    if (!name || !category || !Number.isInteger(stock) || stock < 0 || !Number.isFinite(price) || price <= 0) return;

    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("catalog_items").insert({
      business_id: business.id,
      name,
      category,
      stock_quantity: stock,
      unit: "item",
      unit_price_minor: Math.round(price * 100),
      currency: business.default_currency,
    });
    setSaving(false);
    if (error) { setMessage(`Could not add product: ${error.message}`); return; }
    formElement.reset();
    setProductFormOpen(false);
    setMessage("Product added to your business workspace.");
    await loadRecords();
  }

  async function addSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const customerName = String(form.get("customer") ?? "").trim() || "Walk-in customer";
    const itemSummary = String(form.get("item") ?? "").trim();
    const amount = Number(form.get("amount"));
    const status = form.get("status") === "pending" ? "pending" : "paid";
    if (!itemSummary || !Number.isFinite(amount) || amount <= 0) return;

    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("sales").insert({
      business_id: business.id,
      customer_name: customerName,
      item_summary: itemSummary,
      total_minor: Math.round(amount * 100),
      currency: business.default_currency,
      status,
    });
    setSaving(false);
    if (error) { setMessage(`Could not record sale: ${error.message}`); return; }
    formElement.reset();
    setSaleFormOpen(false);
    setMessage("Sale recorded in your business workspace.");
    await loadRecords();
  }

  const today = dateInBusinessZone(new Date(), business.locale, business.time_zone);
  const todayTotal = sales.filter((sale) => dateInBusinessZone(sale.occurred_at, business.locale, business.time_zone) === today).reduce((sum, sale) => sum + sale.total_minor, 0);
  const pendingTotal = sales.filter((sale) => sale.status === "pending").reduce((sum, sale) => sum + sale.total_minor, 0);

  return <main className="business-home">
    <header className="home-top"><a className="brand" href="#workspace"><span className="brand-mark">d</span><span>Dukaan<span className="brand-light">Flow</span></span></a><button className="button button-quiet" onClick={onSignOut}>Sign out</button></header>
    <section className="home-content">
      <span className="eyebrow">YOUR BUSINESS WORKSPACE</span>
      <h1>{business.name}</h1>
      <p className="home-subtitle">Your business records are private to this workspace. Add products and record sales to get started.</p>
      <div className="home-meta"><span>{business.default_currency}</span><span>{business.locale}</span><span>{business.time_zone}</span><span>{email}</span></div>

      <section className="business-metrics" aria-label="Business summary">
        <article><span>Sales today</span><strong>{money(todayTotal, business.default_currency)}</strong></article>
        <article><span>Recent sales</span><strong>{sales.length}</strong></article>
        <article><span>Pending in recent sales</span><strong>{money(pendingTotal, business.default_currency)}</strong></article>
        <article><span>Active products</span><strong>{items.length}</strong></article>
      </section>

      <div className="business-actions">
        <h2>Your business records</h2>
        <div><button className="button button-outline" onClick={() => { setSaleFormOpen(!saleFormOpen); setProductFormOpen(false); }}>＋ Record a sale</button><button className="button button-primary" onClick={() => { setProductFormOpen(!productFormOpen); setSaleFormOpen(false); }}>＋ Add product</button></div>
      </div>

      {productFormOpen && <form className="record-form" onSubmit={addProduct}>
        <h3>Add a product or service</h3>
        <div className="record-form-grid"><label>Name<input name="name" maxLength={160} required placeholder="e.g. Everyday Runner" /></label><label>Category<input name="category" maxLength={120} required placeholder="e.g. Footwear · Casual" /></label><label>Quantity<input name="stock" type="number" min="0" step="1" required placeholder="0" /></label><label>Price ({business.default_currency})<input name="price" type="number" min="0.01" step="0.01" required placeholder="0.00" /></label></div>
        <div className="record-form-footer"><button type="button" className="button button-quiet" onClick={() => setProductFormOpen(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save product"}</button></div>
      </form>}

      {saleFormOpen && <form className="record-form" onSubmit={addSale}>
        <h3>Record a sale</h3>
        <div className="record-form-grid"><label>Customer <span className="optional">(optional)</span><input name="customer" maxLength={160} placeholder="Walk-in customer" /></label><label>Product or service<input name="item" maxLength={240} required placeholder="e.g. Everyday Runner · 1 item" /></label><label>Amount ({business.default_currency})<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></label><label>Payment status<select name="status" defaultValue="paid"><option value="paid">Paid</option><option value="pending">Pending</option></select></label></div>
        <div className="record-form-footer"><button type="button" className="button button-quiet" onClick={() => setSaleFormOpen(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Record sale"}</button></div>
      </form>}

      {message && <p className="business-message" role="status">{message}</p>}
      <div className="business-records-grid">
        <section className="business-record-card"><div className="business-record-heading"><div><h2>Products & services</h2><p>Catalog for this business</p></div><span>{items.length}</span></div>
          {busy ? <p className="business-empty">Loading products…</p> : items.length === 0 ? <p className="business-empty">No products yet. Add your first product or service.</p> : <div className="business-record-list">{items.map((item) => <article key={item.id}><div><strong>{item.name}</strong><span>{item.category}</span></div><div className="business-record-value"><strong>{money(item.unit_price_minor, item.currency)}</strong><span>{item.stock_quantity === null ? "Service" : `${item.stock_quantity} ${item.unit}${item.stock_quantity === 1 ? "" : "s"} in stock`}</span></div></article>)}</div>}
        </section>
        <section className="business-record-card"><div className="business-record-heading"><div><h2>Recent sales</h2><p>Latest transactions</p></div><span>{sales.length}</span></div>
          {busy ? <p className="business-empty">Loading sales…</p> : sales.length === 0 ? <p className="business-empty">No sales yet. Record your first transaction.</p> : <div className="business-record-list">{sales.slice(0, 8).map((sale) => <article key={sale.id}><div><strong>{sale.customer_name}</strong><span>{sale.item_summary} · {dateInBusinessZone(sale.occurred_at, business.locale, business.time_zone)}</span></div><div className="business-record-value"><strong>{money(sale.total_minor, sale.currency)}</strong><span className={`status ${sale.status === "paid" ? "paid" : "pending"}`}><i />{sale.status === "paid" ? "Paid" : "Pending"}</span></div></article>)}</div>}
        </section>
      </div>
      <p className="business-footnote">Tenant-scoped records · Changes are saved to Supabase</p>
    </section>
  </main>;
}
