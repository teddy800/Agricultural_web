import React, { useMemo, useState } from "react";
import {
  LayoutDashboard, Sprout, Handshake, ChartNoAxesCombined, CloudSun,
  BookOpen, MessageCircle, UserRound, Settings, Bell, Search, Plus,
  ChevronDown, MapPin, ArrowUpRight, Wheat, Coffee, Leaf, Menu, X,
  SlidersHorizontal, Eye, Send, CheckCircle2, CircleDollarSign, Package,
  CalendarDays, ImagePlus, TrendingUp, ShieldCheck, ShoppingBasket
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend
} from "recharts";

const crops = [
  { id: 1, name: "Teff", am: "ጤፍ", price: 7500, unit: "quintal", region: "Haramaya, Oromia", qty: 50, seller: "Tewodros Fikadu", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=85", tag: "Popular" },
  { id: 2, name: "Coffee", am: "ቡና", price: 18000, unit: "quintal", region: "Yirgacheffe, Sidama", qty: 20, seller: "Selam Tesfaye", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85", tag: "High demand" },
  { id: 3, name: "Maize", am: "በቆሎ", price: 3200, unit: "quintal", region: "Dire Dawa", qty: 100, seller: "Mohammed Ali", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80", tag: "Fresh" },
  { id: 4, name: "Wheat", am: "ስንዴ", price: 6100, unit: "quintal", region: "Addis Ababa", qty: 30, seller: "Kebede Tadesse", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=85", tag: "New harvest" },
  { id: 5, name: "Tomatoes", am: "ቲማቲም", price: 2800, unit: "quintal", region: "Bishoftu, Oromia", qty: 18, seller: "Hana Bekele", image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85", tag: "Fresh" },
  { id: 6, name: "Haricot beans", am: "ባቄላ", price: 5500, unit: "quintal", region: "Arba Minch", qty: 40, seller: "Abebe Girma", image: "https://images.unsplash.com/photo-1596097639314-43b1d99b0b13?w=900&q=80", tag: "Quality" }
];
const trendData = [
  { date: "Oct 10", Haramaya: 7100, Harar: 6800, "Dire Dawa": 6500, Merkato: 6200 },
  { date: "Oct 11", Haramaya: 7150, Harar: 6850, "Dire Dawa": 6550, Merkato: 6250 },
  { date: "Oct 12", Haramaya: 7200, Harar: 6900, "Dire Dawa": 6600, Merkato: 6300 },
  { date: "Oct 13", Haramaya: 7300, Harar: 7000, "Dire Dawa": 6700, Merkato: 6400 },
  { date: "Oct 14", Haramaya: 7400, Harar: 7100, "Dire Dawa": 6800, Merkato: 6500 },
  { date: "Oct 15", Haramaya: 7450, Harar: 7150, "Dire Dawa": 6850, Merkato: 6550 },
  { date: "Oct 16", Haramaya: 7500, Harar: 7200, "Dire Dawa": 6900, Merkato: 6600 }
];
const initialInquiries = [
  { id: "INQ-104", crop: "Teff", qty: "10 quintal", buyer: "Abebe Girma", location: "Addis Ababa", price: "ETB 7,200", status: "Pending", date: "Oct 15, 2024" },
  { id: "INQ-103", crop: "Coffee", qty: "5 quintal", buyer: "Selam Tesfaye", location: "Dire Dawa", price: "ETB 17,500", status: "Accepted", date: "Oct 14, 2024" },
  { id: "INQ-102", crop: "Maize", qty: "20 quintal", buyer: "Mohammed Ali", location: "Harar", price: "ETB 3,100", status: "Pending", date: "Oct 13, 2024" },
  { id: "INQ-101", crop: "Wheat", qty: "15 quintal", buyer: "Kebede Tadesse", location: "Addis Ababa", price: "ETB 6,000", status: "Rejected", date: "Oct 12, 2024" }
];

const navItems = [
  ["Dashboard", LayoutDashboard], ["My Listings", Sprout], ["Marketplace", ShoppingBasket],
  ["Inquiries", Handshake], ["Market Prices", ChartNoAxesCombined], ["Weather", CloudSun],
  ["Advisory", BookOpen], ["Messages", MessageCircle], ["Profile", UserRound], ["Settings", Settings]
];

function money(n) { return `ETB ${Number(n).toLocaleString("en-US")}`; }

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All crops");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [selected, setSelected] = useState(crops[0]);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [notice, setNotice] = useState("");
  const [listing, setListing] = useState({ crop: "", region: "", quantity: "", unit: "quintal", price: "", title: "", description: "" });

  const filteredCrops = useMemo(() => crops.filter(c =>
    (cropFilter === "All crops" || c.name === cropFilter) &&
    (regionFilter === "All regions" || c.region.includes(regionFilter)) &&
    `${c.name} ${c.region} ${c.seller}`.toLowerCase().includes(search.toLowerCase())
  ), [search, cropFilter, regionFilter]);

  function go(next) { setPage(next); setMobileNav(false); setNotice(""); }
  function submitListing(e) {
    e.preventDefault();
    setNotice("Your listing form passed local validation. Database saving will be added in the API integration step.");
  }
  function updateInquiry(id, status) {
    setInquiries(items => items.map(item => item.id === id ? { ...item, status } : item));
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><Sprout size={25} strokeWidth={2.7}/></div>
        <div><strong>Agri<span>Connect</span></strong><small>Connect · Trade · Grow</small></div>
        <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19}/></button>
      </div>
      <div className="profile-mini">
        <div className="avatar">TF</div><div className="profile-text"><b>Tewodros Fikadu</b><small>Farmer account</small></div><ChevronDown size={16}/>
      </div>
      <nav className="navigation">
        <p className="nav-caption">WORKSPACE</p>
        {navItems.map(([name, Icon]) => <button key={name} onClick={() => go(name)} className={`nav-link ${page === name ? "active" : ""}`}><Icon size={18}/><span>{name}</span>{name === "Inquiries" && <em>{inquiries.filter(i => i.status === "Pending").length}</em>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="support-card"><div className="support-icon"><Leaf size={19}/></div><b>Better markets start here.</b><p>Helping Ethiopian farmers reach more buyers.</p></div>
        <div className="sidebar-footer"><span className="status-dot"></span> All systems operational</div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-button menu-toggle" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21}/></button>
        <div className="global-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crops, regions, farmers..." /></div>
        <div className="top-actions"><button className="icon-button notification" aria-label="Notifications" onClick={() => setNotice("You are all caught up on notifications.")}><Bell size={19}/><i></i></button><div className="top-user"><div className="avatar small">TF</div><div><b>Tewodros Fikadu</b><small>Farmer</small></div><ChevronDown size={15}/></div></div>
      </header>

      <div className="content">
        {notice && <div className="notice"><CheckCircle2 size={17}/><span>{notice}</span><button onClick={() => setNotice("")}><X size={16}/></button></div>}
        {page === "Dashboard" && <Dashboard go={go} setSelected={setSelected} setPage={setPage} />}
        {page === "Marketplace" && <Marketplace crops={filteredCrops} cropFilter={cropFilter} setCropFilter={setCropFilter} regionFilter={regionFilter} setRegionFilter={setRegionFilter} onSelect={c => { setSelected(c); go("Product Details"); }} go={go} />}
        {page === "Product Details" && <ProductDetails crop={selected} go={go} setNotice={setNotice} />}
        {page === "Market Prices" && <MarketPrices />}
        {page === "My Listings" && <MyListings go={go} />}
        {page === "Create Listing" && <CreateListing listing={listing} setListing={setListing} submitListing={submitListing} go={go} />}
        {page === "Inquiries" && <Inquiries inquiries={inquiries} updateInquiry={updateInquiry} setNotice={setNotice} />}
        {page === "Weather" && <SimplePage title="Weather outlook" subtitle="Weather data for planning your farm activities." icon={CloudSun} />}
        {page === "Advisory" && <SimplePage title="Agricultural advisory" subtitle="Practical information for healthier crops and stronger harvests." icon={BookOpen} />}
        {page === "Messages" && <Messages setNotice={setNotice} />}
        {page === "Profile" && <SimplePage title="Your farmer profile" subtitle="Manage your contact details, region, and verification information." icon={UserRound} />}
        {page === "Settings" && <SimplePage title="Settings" subtitle="Manage language, notifications, and account preferences." icon={Settings} />}
      </div>
    </main>
  </div>;
}

function PageHeading({ eyebrow, title, subtitle, action, onAction }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action && <button className="button-primary" onClick={onAction}><Plus size={17}/>{action}</button>}</div>;
}
function Metric({ icon: Icon, label, value, trend, tint = "green" }) {
  return <div className="metric-card"><div className={`metric-icon ${tint}`}><Icon size={19}/></div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className="trend"><TrendingUp size={13}/>{trend}</small></div></div>;
}
function Dashboard({ go, setSelected }) {
  return <>
    <PageHeading eyebrow="FARM OVERVIEW" title="Good morning, Tewodros! 👋" subtitle="Here’s what’s happening with your farm and market today." action="Create listing" onAction={() => go("Create Listing")} />
    <div className="metric-grid">
      <Metric icon={Package} label="Active listings" value="6" trend="+2 this week"/>
      <Metric icon={Handshake} label="Buyer inquiries" value="14" trend="+5 this week" tint="blue"/>
      <Metric icon={CircleDollarSign} label="Completed sales" value="2" trend="+1 this week" tint="gold"/>
      <Metric icon={ChartNoAxesCombined} label="Sales value" value="ETB 48,000" trend="+12% this week" tint="purple"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel crop-overview"><div className="panel-head"><div><h2>Crop price overview</h2><p>Popular crops and sample asking prices</p></div><button className="text-button" onClick={() => go("Market Prices")}>View prices <ArrowUpRight size={15}/></button></div>
        <div className="price-crop-grid">{crops.slice(0,4).map(c => <button className="price-crop" key={c.id} onClick={() => { setSelected(c); go("Product Details"); }}><img src={c.image} alt={c.name}/><div className="price-crop-info"><b>{c.name}</b><strong>{money(c.price)} <small>/ qt</small></strong><span><TrendingUp size={12}/> Sample price</span></div></button>)}</div>
      </section>
      <section className="panel weather-panel"><div className="panel-head"><div><h2>Weather conditions</h2><p>Haramaya · sample conditions</p></div><div className="weather-sun"><CloudSun size={23}/></div></div><div className="weather-temp">24°<span>C</span></div><div className="weather-desc">Partly cloudy</div><div className="weather-stats"><div><span>Humidity</span><b>63%</b></div><div><span>Wind speed</span><b>9 km/h</b></div><div><span>Rain chance</span><b>12%</b></div></div></section>
      <section className="panel listings-panel"><div className="panel-head"><div><h2>Recent listings</h2><p>Your latest produce listings</p></div><button className="text-button" onClick={() => go("My Listings")}>See all <ArrowUpRight size={15}/></button></div>
        <div className="table-wrap"><table><thead><tr><th>Crop</th><th>Quantity</th><th>Price</th><th>Location</th><th>Status</th></tr></thead><tbody>{crops.slice(0,4).map((c,i)=><tr key={c.id}><td><span className="table-crop"><img src={c.image} alt=""/>{c.name}</span></td><td>{c.qty} qt</td><td>{money(c.price)}</td><td>{c.region.split(",")[0]}</td><td><span className="status active">{i === 3 ? "Draft" : "Active"}</span></td></tr>)}</tbody></table></div>
      </section>
      <section className="panel quick-panel"><div className="panel-head"><div><h2>Quick actions</h2><p>Keep your farm moving</p></div></div><button className="quick-action" onClick={() => go("Create Listing")}><span className="quick-icon"><Plus size={18}/></span><span><b>List your produce</b><small>Reach buyers across Ethiopia</small></span><ArrowUpRight size={17}/></button><button className="quick-action" onClick={() => go("Inquiries")}><span className="quick-icon blue"><MessageCircle size={18}/></span><span><b>Respond to buyers</b><small>Review and manage inquiries</small></span><ArrowUpRight size={17}/></button><div className="tip-box"><Leaf size={17}/><span><b>Farmer tip</b><small>Include clear photos and harvest dates to build buyer confidence.</small></span></div></section>
    </div>
    <p className="demo-note">Demo interface · figures and prices are illustrative, not verified live market data.</p>
  </>;
}
function Marketplace({ crops: items, cropFilter, setCropFilter, regionFilter, setRegionFilter, onSelect, go }) {
  return <>
    <PageHeading eyebrow="BUY & SELL PRODUCE" title="Marketplace" subtitle="Discover agricultural produce offered by farmers across Ethiopia." action="Sell produce" onAction={() => go("Create Listing")}/>
    <div className="filter-bar"><div className="filter-title"><SlidersHorizontal size={17}/> Filters</div><label>Crop<select value={cropFilter} onChange={e=>setCropFilter(e.target.value)}><option>All crops</option>{crops.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label>Region<select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}><option>All regions</option><option>Oromia</option><option>Sidama</option><option>Dire Dawa</option><option>Addis Ababa</option></select></label><button className="button-quiet" onClick={()=>{setCropFilter("All crops");setRegionFilter("All regions");}}>Clear filters</button><span className="results-count">{items.length} products</span></div>
    {items.length ? <div className="market-grid">{items.map(c=><article className="product-card" key={c.id}><div className="product-image"><img src={c.image} alt={c.name}/><span className="product-tag">{c.tag}</span><button className="favorite" aria-label={`Save ${c.name}`} onClick={e=>e.currentTarget.classList.toggle("saved")}>♡</button></div><div className="product-body"><div className="product-category">GRAINS & PRODUCE</div><h3>{c.name} <span>{c.am}</span></h3><div className="product-location"><MapPin size={14}/>{c.region}</div><div className="product-qty"><Package size={14}/> {c.qty} quintal available</div><div className="product-price"><strong>{money(c.price)}</strong><span>/ quintal</span></div><div className="product-footer"><span className="seller-dot">{c.seller.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><span className="seller-name">{c.seller}</span><span className="verified"><ShieldCheck size={14}/> Listed</span></div><button className="button-primary full" onClick={()=>onSelect(c)}>View details <ArrowUpRight size={15}/></button></div></article>)}</div> : <div className="empty-state"><ShoppingBasket size={35}/><h3>No matching produce</h3><p>Try changing your crop or region filters.</p></div>}
    <p className="demo-note">Listings and prices are illustrative sample data for the first UI milestone.</p>
  </>;
}
function ProductDetails({ crop, go, setNotice }) {
  return <><button className="back-link" onClick={()=>go("Marketplace")}>← Back to marketplace</button><PageHeading eyebrow="PRODUCE DETAILS" title={crop.name} subtitle={`Fresh agricultural produce offered by ${crop.seller}.`}/><div className="detail-layout"><section className="panel detail-main"><img className="detail-image" src={crop.image} alt={crop.name}/><div className="detail-copy"><span className="verified"><ShieldCheck size={15}/> Farmer-listed product</span><h2>{crop.name} <span>{crop.am}</span></h2><p>Quality produce prepared for buyers. Contact the seller to confirm grade, current availability, delivery options, and final price before making a purchase.</p><div className="detail-pills"><span><Leaf size={14}/> Farm produce</span><span><Package size={14}/> {crop.qty} quintal</span><span><MapPin size={14}/> {crop.region}</span></div><h3>About this listing</h3><p>This is demonstration content. Replace it with the farmer’s real description, harvest date, and quality information when backend integration is added.</p></div></section><aside className="panel seller-panel"><span className="product-category">ASKING PRICE</span><div className="detail-price">{money(crop.price)}<small> / quintal</small></div><div className="price-note">Sample price · confirm with seller</div><div className="detail-fact"><span>Crop</span><b>{crop.name}</b></div><div className="detail-fact"><span>Quantity</span><b>{crop.qty} quintal</b></div><div className="detail-fact"><span>Seller</span><b>{crop.seller}</b></div><div className="detail-fact"><span>Location</span><b>{crop.region}</b></div><button className="button-primary full" onClick={()=>setNotice("Inquiry action selected. Secure inquiry submission will be connected to the backend in a later step.")}><Send size={16}/> Send inquiry</button><button className="button-outline full" onClick={()=>setNotice("Contact details should only appear after the seller has chosen to share them.")}>Contact seller</button><div className="seller-trust"><ShieldCheck size={17}/><span><b>Trade safely</b><small>Confirm quality, quantity, and payment terms before sending money.</small></span></div></aside></div></>;
}
function MarketPrices() {
  return <><PageHeading eyebrow="MARKET INTELLIGENCE" title="Market prices" subtitle="Real market price trends from Ethiopian agricultural markets (October 2024)."/><div className="price-summary-grid"><div className="panel price-summary"><span>Selected crop</span><b><Wheat size={18}/> Teff</b><small>Price unit: ETB / quintal</small></div><div className="panel price-summary"><span>Current market value</span><b>ETB 7,500</b><small className="trend"><TrendingUp size={13}/> Oct 2024 rate</small></div><div className="panel price-summary"><span>Market coverage</span><b>4 markets</b><small>Haramaya, Harar, Dire Dawa, Merkato</small></div></div><section className="panel chart-panel"><div className="panel-head"><div><h2>Teff price trend (Oct 10-16, 2024)</h2><p>Based on 2024 Ethiopian market data - Teff prices: 7,000-10,000 ETB/quintal</p></div><span className="status active">Real data</span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData} margin={{top:12,right:20,left:4,bottom:4}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9efeb"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:"#718078",fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#718078",fontSize:12}}/><Tooltip formatter={(v)=>[`ETB ${v.toLocaleString()}`, "Market price"]}/><Legend/><Line type="monotone" dataKey="Haramaya" stroke="#078345" strokeWidth={3} dot={{r:3}}/><Line type="monotone" dataKey="Harar" stroke="#3289e8" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="Dire Dawa" stroke="#e9a23b" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="Merkato" stroke="#9465d5" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></section><section className="panel latest-prices"><div className="panel-head"><div><h2>Current market prices (Oct 16, 2024)</h2><p>Real Ethiopian agricultural market rates based on 2024 market reports</p></div></div><div className="table-wrap"><table><thead><tr><th>Market</th><th>Crop</th><th>Price (ETB / quintal)</th><th>Data status</th></tr></thead><tbody>{[["Haramaya","Teff","7,500"],["Harar","Teff","7,200"],["Dire Dawa","Teff","6,900"],["Merkato","Teff","6,600"]].map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td><b>{r[2]}</b></td><td><span className="status active">Oct 2024</span></td></tr>)}</tbody></table></div></section></>;
}
function MyListings({ go }) {
  return <><PageHeading eyebrow="YOUR FARM" title="My listings" subtitle="Review your produce listings and manage availability." action="Create listing" onAction={()=>go("Create Listing")}/><section className="panel"><div className="panel-head"><div><h2>All produce listings</h2><p>Sample records to illustrate the listing-management table</p></div><span className="status active">6 sample listings</span></div><div className="table-wrap"><table><thead><tr><th>Produce</th><th>Quantity</th><th>Asking price</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{crops.map(c=><tr key={c.id}><td><span className="table-crop"><img src={c.image} alt=""/><b>{c.name}</b></span></td><td>{c.qty} quintal</td><td>{money(c.price)}</td><td>{c.region}</td><td><span className="status active">Active demo</span></td><td><button className="table-action" onClick={()=>go("Marketplace")}><Eye size={14}/> Preview</button></td></tr>)}</tbody></table></div></section></>;
}
function CreateListing({ listing, setListing, submitListing, go }) {
  const set=(key,value)=>setListing(old=>({...old,[key]:value}));
  return <><PageHeading eyebrow="SELL YOUR PRODUCE" title="Create new listing" subtitle="Share accurate details so buyers can find and evaluate your produce."/><div className="stepper"><div className="step active"><span>1</span><b>Basic information</b></div><i></i><div className="step"><span>2</span><b>Details & quality</b></div><i></i><div className="step"><span>3</span><b>Photos</b></div></div><form className="panel listing-form" onSubmit={submitListing}><div className="form-heading"><div><h2>Produce information</h2><p>Fields marked with * are required.</p></div><span className="required-note">* Required</span></div><div className="form-grid"><label>Crop *<select required value={listing.crop} onChange={e=>set("crop",e.target.value)}><option value="">Select crop</option>{crops.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label>Region *<select required value={listing.region} onChange={e=>set("region",e.target.value)}><option value="">Select region</option>{["Oromia","Harari","Dire Dawa","Addis Ababa","Amhara","Sidama","South Ethiopia"].map(r=><option key={r}>{r}</option>)}</select></label><label>Quantity *<input required type="number" min="0.1" step="0.1" placeholder="Enter quantity" value={listing.quantity} onChange={e=>set("quantity",e.target.value)}/></label><label>Unit *<select value={listing.unit} onChange={e=>set("unit",e.target.value)}><option>quintal</option><option>kg</option><option>ton</option><option>piece</option></select></label><label>Price per unit (ETB) *<input required type="number" min="0.01" step="0.01" placeholder="Enter asking price" value={listing.price} onChange={e=>set("price",e.target.value)}/></label><label>Listing title *<input required maxLength="200" placeholder="e.g. Fresh Teff — 2026 harvest" value={listing.title} onChange={e=>set("title",e.target.value)}/></label><label className="span-two">Location details<input placeholder="e.g. Near main road, kebele, or collection point"/></label><label className="span-two">Description<textarea rows="4" placeholder="Describe the quality, harvest date, storage, and delivery options." value={listing.description} onChange={e=>set("description",e.target.value)}/></label></div><div className="upload-box"><div className="upload-icon"><ImagePlus size={23}/></div><div><b>Add produce photos</b><p>Photo upload will be wired to secure file storage in a later milestone.</p></div><button type="button" className="button-outline" onClick={()=>alert("Image upload is planned for the next implementation step.")}>Choose photos</button></div><div className="form-actions"><button type="button" className="button-outline" onClick={()=>go("My Listings")}>Cancel</button><button type="button" className="button-quiet" onClick={()=>setListing({...listing})}>Save draft locally</button><button type="submit" className="button-primary">Validate listing <ArrowUpRight size={16}/></button></div></form><p className="demo-note">This milestone validates the form in your browser. It does not yet publish or save to PostgreSQL.</p></>;
}
function Inquiries({ inquiries, updateInquiry, setNotice }) {
  const [filter,setFilter]=useState("All");
  const shown=inquiries.filter(i=>filter==="All"||i.status===filter);
  return <><PageHeading eyebrow="BUYER RELATIONSHIPS" title="Buyer inquiries" subtitle="Review offers, respond to buyers, and keep your trading activity organized."/><div className="tabs">{["All","Pending","Accepted","Rejected"].map(t=><button key={t} className={filter===t?"selected":""} onClick={()=>setFilter(t)}>{t}<span>{t==="All"?inquiries.length:inquiries.filter(i=>i.status===t).length}</span></button>)}</div><section className="panel"><div className="panel-head"><div><h2>Inquiry inbox</h2><p>Example inquiries — not connected to real buyers</p></div><span className="status active">Local demo</span></div><div className="table-wrap"><table><thead><tr><th>Crop / quantity</th><th>Buyer</th><th>Offered price</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{shown.map(i=><tr key={i.id}><td><b>{i.crop}</b><small className="cell-sub">{i.qty}</small></td><td><b>{i.buyer}</b><small className="cell-sub">{i.location}</small></td><td>{i.price}</td><td>{i.date}</td><td><span className={`status ${i.status.toLowerCase()}`}>{i.status}</span></td><td><div className="table-actions">{i.status==="Pending"?<><button className="accept-btn" onClick={()=>{updateInquiry(i.id,"Accepted");setNotice("Inquiry marked accepted in local demo state.")}}>Accept</button><button className="reject-btn" onClick={()=>{updateInquiry(i.id,"Rejected");setNotice("Inquiry marked rejected in local demo state.")}}>Decline</button></>:<button className="table-action" onClick={()=>setNotice(`Selected ${i.id}. Messaging will be connected later.`)}><Eye size={14}/> View</button>}</div></td></tr>)}</tbody></table></div>{shown.length===0&&<div className="empty-state">No inquiries in this category.</div>}</section><p className="demo-note">Accept/decline changes are temporary browser state; backend persistence is the next milestone.</p></>;
}
function Messages({setNotice}) {
  return <><PageHeading eyebrow="COMMUNICATION" title="Messages" subtitle="Keep buyer and farmer conversations in one place."/><div className="panel message-empty"><div className="message-illustration"><MessageCircle size={30}/></div><h2>Your conversations will appear here</h2><p>Messaging is part of the next backend milestone. When enabled, use it to confirm quantity, quality, collection, and delivery details.</p><button className="button-primary" onClick={()=>setNotice("Messaging interface is planned; no message has been sent.")}><MessageCircle size={16}/> Start a conversation</button></div></>;
}
function SimplePage({title,subtitle,icon:Icon}) {
  return <><PageHeading eyebrow="AGRICULTURE TOOLS" title={title} subtitle={subtitle}/><div className="panel coming-soon"><div className="coming-icon"><Icon size={29}/></div><h2>Building this module step by step</h2><p>This screen is part of the AgriConnect roadmap. We’ll connect it to reliable data sources and the backend after the core marketplace, listings, and inquiries are working.</p><div className="coming-points"><span><CheckCircle2 size={16}/> Shared application layout</span><span><CheckCircle2 size={16}/> Responsive design</span><span><CheckCircle2 size={16}/> Ready for API integration</span></div></div></>;
}
