import React, { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard, Sprout, Handshake, ChartNoAxesCombined, CloudSun,
  BookOpen, MessageCircle, UserRound, Settings, Bell, Search, Plus,
  ChevronDown, MapPin, ArrowUpRight, Wheat, Coffee, Leaf, Menu, X,
  SlidersHorizontal, Eye, Send, CheckCircle2, CircleDollarSign, Package,
  CalendarDays, ImagePlus, TrendingUp, ShieldCheck, ShoppingBasket, Loader2
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend
} from "recharts";
import * as api from "./api";

// Demo/Fallback data
const demoCrops = [
  { id: 1, name: "Teff", am: "ጤፍ", price: 3800, unit: "quintal", region: "Haramaya, Oromia", qty: 50, seller: "Tewodros Fikadu", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=85", tag: "Popular" },
  { id: 2, name: "Coffee", am: "ቡና", price: 12500, unit: "quintal", region: "Yirgacheffe, Sidama", qty: 20, seller: "Selam Tesfaye", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85", tag: "High demand" },
  { id: 3, name: "Maize", am: "በቆሎ", price: 1850, unit: "quintal", region: "Dire Dawa", qty: 100, seller: "Mohammed Ali", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&q=80", tag: "Fresh" },
  { id: 4, name: "Wheat", am: "ስንዴ", price: 2200, unit: "quintal", region: "Addis Ababa", qty: 30, seller: "Kebede Tadesse", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=85", tag: "New harvest" },
  { id: 5, name: "Tomatoes", am: "ቲማቲም", price: 1450, unit: "quintal", region: "Bishoftu, Oromia", qty: 18, seller: "Hana Bekele", image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85", tag: "Fresh" },
  { id: 6, name: "Haricot beans", am: "ባቄላ", price: 4200, unit: "quintal", region: "Arba Minch", qty: 40, seller: "Abebe Girma", image: "https://images.unsplash.com/photo-1596097639314-43b1d99b0b13?w=900&q=80", tag: "Quality" }
];

const trendData = [
  { date: "Apr 20", Haramaya: 3400, Harar: 3050, "Dire Dawa": 2800, Merkato: 2900 },
  { date: "Apr 21", Haramaya: 3300, Harar: 3000, "Dire Dawa": 2750, Merkato: 2850 },
  { date: "Apr 22", Haramaya: 3500, Harar: 3150, "Dire Dawa": 2850, Merkato: 2900 },
  { date: "Apr 23", Haramaya: 3550, Harar: 3200, "Dire Dawa": 2900, Merkato: 2950 },
  { date: "Apr 24", Haramaya: 3800, Harar: 3400, "Dire Dawa": 3100, Merkato: 3000 },
  { date: "Apr 25", Haramaya: 3850, Harar: 3500, "Dire Dawa": 3200, Merkato: 2950 },
  { date: "Apr 26", Haramaya: 3900, Harar: 3550, "Dire Dawa": 3250, Merkato: 3000 }
];

const navItems = [
  ["Dashboard", LayoutDashboard], ["My Listings", Sprout], ["Marketplace", ShoppingBasket],
  ["Inquiries", Handshake], ["Market Prices", ChartNoAxesCombined], ["Weather", CloudSun],
  ["Advisory", BookOpen], ["Messages", MessageCircle], ["Profile", UserRound], ["Settings", Settings]
];

function money(n) { return `ETB ${Number(n).toLocaleString("en-US")}`; }

// Helper to map API data to UI format
function mapListingToUI(listing) {
  return {
    id: listing.id,
    name: listing.crop_name,
    am: listing.crop_name_am || "",
    price: listing.price_per_unit,
    unit: listing.unit,
    region: listing.region,
    qty: listing.quantity,
    seller: listing.seller_name,
    image: listing.image_url || demoCrops[0].image,
    tag: listing.quality_grade === 'premium' ? 'Premium' : 'Quality'
  };
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All crops");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [selected, setSelected] = useState(demoCrops[0]);
  const [notice, setNotice] = useState("");
  const [listing, setListing] = useState({ crop: "", region: "", quantity: "", unit: "quintal", price: "", title: "", description: "" });
  
  // API State
  const [apiListings, setApiListings] = useState([]);
  const [apiInquiries, setApiInquiries] = useState([]);
  const [apiStats, setApiStats] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Check API health
        const health = await api.checkHealth();
        setApiConnected(health.success);
        
        // Load listings
        const listingsRes = await api.getListings({ status: 'active' });
        if (listingsRes.data && listingsRes.data.length > 0) {
          setApiListings(listingsRes.data.map(mapListingToUI));
        }
        
        // Load inquiries
        const inquiriesRes = await api.getInquiries({ sellerId: 1 });
        if (inquiriesRes.data) {
          setApiInquiries(inquiriesRes.data.map(inq => ({
            id: `INQ-${inq.id}`,
            crop: inq.crop_name,
            qty: `${inq.quantity} quintal`,
            buyer: inq.buyer_name,
            location: inq.buyer_region,
            price: `ETB ${Number(inq.offered_price || 0).toLocaleString()}`,
            status: inq.status.charAt(0).toUpperCase() + inq.status.slice(1),
            date: new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          })));
        }
        
        // Load stats
        const statsRes = await api.getStats();
        if (statsRes.data) {
          setApiStats(statsRes.data);
        }
        
      } catch (error) {
        console.error('API Error:', error);
        setApiConnected(false);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Use API data if available, otherwise demo data
  const crops = apiListings.length > 0 ? apiListings : demoCrops;
  const inquiries = apiInquiries.length > 0 ? apiInquiries : [
    { id: "INQ-104", crop: "Teff", qty: "10 quintal", buyer: "Abebe Girma", location: "Addis Ababa", price: "ETB 3,600", status: "Pending", date: "Apr 26, 2025" },
    { id: "INQ-103", crop: "Coffee", qty: "5 quintal", buyer: "Selam Tesfaye", location: "Dire Dawa", price: "ETB 12,000", status: "Accepted", date: "Apr 25, 2025" },
  ];

  const filteredCrops = useMemo(() => crops.filter(c =>
    (cropFilter === "All crops" || c.name === cropFilter) &&
    (regionFilter === "All regions" || c.region.includes(regionFilter)) &&
    `${c.name} ${c.region} ${c.seller}`.toLowerCase().includes(search.toLowerCase())
  ), [crops, search, cropFilter, regionFilter]);

  function go(next) { setPage(next); setMobileNav(false); setNotice(""); }
  
  async function submitListing(e) {
    e.preventDefault();
    try {
      await api.createListing({
        sellerId: 1,
        cropName: listing.crop,
        quantity: parseFloat(listing.quantity),
        unit: listing.unit,
        pricePerUnit: parseFloat(listing.price),
        region: listing.region,
        title: listing.title,
        description: listing.description
      });
      setNotice("Listing created successfully!");
      // Refresh listings
      const res = await api.getListings({ status: 'active' });
      setApiListings(res.data.map(mapListingToUI));
      go("My Listings");
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
  }
  
  async function updateInquiry(id, status) {
    try {
      const numId = parseInt(id.replace('INQ-', ''));
      await api.updateInquiryStatus(numId, status.toLowerCase());
      setNotice(`Inquiry ${status.toLowerCase()} successfully!`);
      // Refresh inquiries
      const res = await api.getInquiries({ sellerId: 1 });
      setApiInquiries(res.data.map(inq => ({
        id: `INQ-${inq.id}`,
        crop: inq.crop_name,
        qty: `${inq.quantity} quintal`,
        buyer: inq.buyer_name,
        location: inq.buyer_region,
        price: `ETB ${Number(inq.offered_price || 0).toLocaleString()}`,
        status: inq.status.charAt(0).toUpperCase() + inq.status.slice(1),
        date: new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      })));
    } catch (error) {
      setNotice(`Error: ${error.message}`);
    }
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
        <div className="sidebar-footer">
          <span className={`status-dot ${apiConnected ? '' : 'offline'}`}></span> 
          {apiConnected ? 'Connected to API' : 'Using demo data'}
        </div>
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
        {loading && <div className="loading-overlay"><Loader2 className="spin" size={40}/><p>Loading data...</p></div>}
        {page === "Dashboard" && <Dashboard go={go} setSelected={setSelected} setPage={setPage} crops={crops} stats={apiStats} apiConnected={apiConnected} />}
        {page === "Marketplace" && <Marketplace crops={filteredCrops} cropFilter={cropFilter} setCropFilter={setCropFilter} regionFilter={regionFilter} setRegionFilter={setRegionFilter} onSelect={c => { setSelected(c); go("Product Details"); }} go={go} allCrops={crops} />}
        {page === "Product Details" && <ProductDetails crop={selected} go={go} setNotice={setNotice} />}
        {page === "Market Prices" && <MarketPrices />}
        {page === "My Listings" && <MyListings go={go} crops={crops} />}
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

// Components remain the same but with crops passed as props
function PageHeading({ eyebrow, title, subtitle, action, onAction }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action && <button className="button-primary" onClick={onAction}><Plus size={17}/>{action}</button>}</div>;
}

function Metric({ icon: Icon, label, value, trend, tint = "green" }) {
  return <div className="metric-card"><div className={`metric-icon ${tint}`}><Icon size={19}/></div><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small className="trend"><TrendingUp size={13}/>{trend}</small></div></div>;
}

function Dashboard({ go, setSelected, crops, stats, apiConnected }) {
  const activeListings = stats?.activeListings || crops.length;
  const pendingInquiries = stats?.pendingInquiries || 14;
  
  return <>
    <PageHeading eyebrow="FARM OVERVIEW" title="Good morning, Tewodros! 👋" subtitle="Here's what's happening with your farm and market today." action="Create listing" onAction={() => go("Create Listing")} />
    <div className="metric-grid">
      <Metric icon={Package} label="Active listings" value={activeListings} trend="+2 this week"/>
      <Metric icon={Handshake} label="Buyer inquiries" value={pendingInquiries} trend="+5 this week" tint="blue"/>
      <Metric icon={CircleDollarSign} label="Completed sales" value="2" trend="+1 this week" tint="gold"/>
      <Metric icon={ChartNoAxesCombined} label="Sales value" value="ETB 48,000" trend="+12% this week" tint="purple"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel crop-overview"><div className="panel-head"><div><h2>Crop price overview</h2><p>{apiConnected ? 'Current marketplace listings' : 'Sample asking prices'}</p></div><button className="text-button" onClick={() => go("Market Prices")}>View prices <ArrowUpRight size={15}/></button></div>
        <div className="price-crop-grid">{crops.slice(0,4).map(c => <button className="price-crop" key={c.id} onClick={() => { setSelected(c); go("Product Details"); }}><img src={c.image} alt={c.name}/><div className="price-crop-info"><b>{c.name}</b><strong>{money(c.price)} <small>/ {c.unit}</small></strong><span><TrendingUp size={12}/> {apiConnected ? 'Live' : 'Sample'}</span></div></button>)}</div>
      </section>
      <section className="panel weather-panel"><div className="panel-head"><div><h2>Weather conditions</h2><p>Haramaya · sample conditions</p></div><div className="weather-sun"><CloudSun size={23}/></div></div><div className="weather-temp">24°<span>C</span></div><div className="weather-desc">Partly cloudy</div><div className="weather-stats"><div><span>Humidity</span><b>63%</b></div><div><span>Wind speed</span><b>9 km/h</b></div><div><span>Rain chance</span><b>12%</b></div></div></section>
      <section className="panel listings-panel"><div className="panel-head"><div><h2>Recent listings</h2><p>Your latest produce listings</p></div><button className="text-button" onClick={() => go("My Listings")}>See all <ArrowUpRight size={15}/></button></div>
        <div className="table-wrap"><table><thead><tr><th>Crop</th><th>Quantity</th><th>Price</th><th>Location</th><th>Status</th></tr></thead><tbody>{crops.slice(0,4).map((c,i)=><tr key={c.id}><td><span className="table-crop"><img src={c.image} alt=""/>{c.name}</span></td><td>{c.qty} {c.unit}</td><td>{money(c.price)}</td><td>{c.region.split(",")[0]}</td><td><span className="status active">{i === 3 ? "Draft" : "Active"}</span></td></tr>)}</tbody></table></div>
      </section>
      <section className="panel quick-panel"><div className="panel-head"><div><h2>Quick actions</h2><p>Keep your farm moving</p></div></div><button className="quick-action" onClick={() => go("Create Listing")}><span className="quick-icon"><Plus size={18}/></span><span><b>List your produce</b><small>Reach buyers across Ethiopia</small></span><ArrowUpRight size={17}/></button><button className="quick-action" onClick={() => go("Inquiries")}><span className="quick-icon blue"><MessageCircle size={18}/></span><span><b>Respond to buyers</b><small>Review and manage inquiries</small></span><ArrowUpRight size={17}/></button><div className="tip-box"><Leaf size={17}/><span><b>Farmer tip</b><small>Include clear photos and harvest dates to build buyer confidence.</small></span></div></section>
    </div>
    <p className="demo-note">{apiConnected ? 'Data from database · updated in real-time' : 'Demo interface · figures and prices are illustrative'}</p>
  </>;
}

function Marketplace({ crops: items, cropFilter, setCropFilter, regionFilter, setRegionFilter, onSelect, go, allCrops }) {
  return <>
    <PageHeading eyebrow="BUY & SELL PRODUCE" title="Marketplace" subtitle="Discover agricultural produce offered by farmers across Ethiopia." action="Sell produce" onAction={() => go("Create Listing")}/>
    <div className="filter-bar"><div className="filter-title"><SlidersHorizontal size={17}/> Filters</div><label>Crop<select value={cropFilter} onChange={e=>setCropFilter(e.target.value)}><option>All crops</option>{allCrops.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label>Region<select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}><option>All regions</option><option>Oromia</option><option>Sidama</option><option>Dire Dawa</option><option>Addis Ababa</option></select></label><button className="button-quiet" onClick={()=>{setCropFilter("All crops");setRegionFilter("All regions");}}>Clear filters</button><span className="results-count">{items.length} products</span></div>
    {items.length ? <div className="market-grid">{items.map(c=><article className="product-card" key={c.id}><div className="product-image"><img src={c.image} alt={c.name}/><span className="product-tag">{c.tag}</span><button className="favorite" aria-label={`Save ${c.name}`} onClick={e=>e.currentTarget.classList.toggle("saved")}>♡</button></div><div className="product-body"><div className="product-category">GRAINS & PRODUCE</div><h3>{c.name} <span>{c.am}</span></h3><div className="product-location"><MapPin size={14}/>{c.region}</div><div className="product-qty"><Package size={14}/> {c.qty} {c.unit} available</div><div className="product-price"><strong>{money(c.price)}</strong><span>/ {c.unit}</span></div><div className="product-footer"><span className="seller-dot">{c.seller.split(" ").map(x=>x[0]).join("").slice(0,2)}</span><span className="seller-name">{c.seller}</span><span className="verified"><ShieldCheck size={14}/> Listed</span></div><button className="button-primary full" onClick={()=>onSelect(c)}>View details <ArrowUpRight size={15}/></button></div></article>)}</div> : <div className="empty-state"><ShoppingBasket size={35}/><h3>No matching produce</h3><p>Try changing your crop or region filters.</p></div>}
  </>;
}

function ProductDetails({ crop, go, setNotice }) {
  return <><button className="back-link" onClick={()=>go("Marketplace")}>← Back to marketplace</button><PageHeading eyebrow="PRODUCE DETAILS" title={crop.name} subtitle={`Fresh agricultural produce offered by ${crop.seller}.`}/><div className="detail-layout"><section className="panel detail-main"><img className="detail-image" src={crop.image} alt={crop.name}/><div className="detail-copy"><span className="verified"><ShieldCheck size={15}/> Farmer-listed product</span><h2>{crop.name} <span>{crop.am}</span></h2><p>Quality produce prepared for buyers. Contact the seller to confirm grade, current availability, delivery options, and final price before making a purchase.</p><div className="detail-pills"><span><Leaf size={14}/> Farm produce</span><span><Package size={14}/> {crop.qty} {crop.unit}</span><span><MapPin size={14}/> {crop.region}</span></div><h3>About this listing</h3><p>This is demonstration content. Replace it with the farmer's real description, harvest date, and quality information when backend integration is added.</p></div></section><aside className="panel seller-panel"><span className="product-category">ASKING PRICE</span><div className="detail-price">{money(crop.price)}<small> / {crop.unit}</small></div><div className="price-note">Sample price · confirm with seller</div><div className="detail-fact"><span>Crop</span><b>{crop.name}</b></div><div className="detail-fact"><span>Quantity</span><b>{crop.qty} {crop.unit}</b></div><div className="detail-fact"><span>Seller</span><b>{crop.seller}</b></div><div className="detail-fact"><span>Location</span><b>{crop.region}</b></div><button className="button-primary full" onClick={()=>setNotice("Inquiry action selected. Secure inquiry submission will be connected to the backend in a later step.")}><Send size={16}/> Send inquiry</button><button className="button-outline full" onClick={()=>setNotice("Contact details should only appear after the seller has chosen to share them.")}>Contact seller</button><div className="seller-trust"><ShieldCheck size={17}/><span><b>Trade safely</b><small>Confirm quality, quantity, and payment terms before sending money.</small></span></div></aside></div></>;
}

function MarketPrices() {
  return <><PageHeading eyebrow="MARKET INTELLIGENCE" title="Market prices" subtitle="Compare illustrative crop-price trends across selected Ethiopian markets."/><div className="price-summary-grid"><div className="panel price-summary"><span>Selected crop</span><b><Wheat size={18}/> Teff</b><small>Price unit: ETB / quintal</small></div><div className="panel price-summary"><span>Latest sample value</span><b>ETB 3,900</b><small className="trend"><TrendingUp size={13}/> Illustrative only</small></div><div className="panel price-summary"><span>Market coverage</span><b>4 markets</b><small>Haramaya, Harar, Dire Dawa, Merkato</small></div></div><section className="panel chart-panel"><div className="panel-head"><div><h2>Teff price trend</h2><p>Example values for interface demonstration only</p></div><span className="status warning">Sample data</span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData} margin={{top:12,right:20,left:4,bottom:4}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9efeb"/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:"#718078",fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#718078",fontSize:12}}/><Tooltip formatter={(v)=>[`ETB ${v.toLocaleString()}`, "Sample price"]}/><Legend/><Line type="monotone" dataKey="Haramaya" stroke="#078345" strokeWidth={3} dot={{r:3}}/><Line type="monotone" dataKey="Harar" stroke="#3289e8" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="Dire Dawa" stroke="#e9a23b" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="Merkato" stroke="#9465d5" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></section><section className="panel latest-prices"><div className="panel-head"><div><h2>Latest sample prices</h2><p>Illustrative values only — verify locally before trading</p></div></div><div className="table-wrap"><table><thead><tr><th>Market</th><th>Crop</th><th>Price (ETB / quintal)</th><th>Data status</th></tr></thead><tbody>{[["Haramaya","Teff","3,900"],["Harar","Teff","3,550"],["Dire Dawa","Teff","3,250"],["Merkato","Teff","3,000"]].map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td><b>{r[2]}</b></td><td><span className="status warning">Demonstration</span></td></tr>)}</tbody></table></div></section></>;
}

function MyListings({ go, crops }) {
  return <><PageHeading eyebrow="YOUR FARM" title="My listings" subtitle="Review your produce listings and manage availability." action="Create listing" onAction={()=>go("Create Listing")}/><section className="panel"><div className="panel-head"><div><h2>All produce listings</h2><p>Your active marketplace listings</p></div><span className="status active">{crops.length} listings</span></div><div className="table-wrap"><table><thead><tr><th>Produce</th><th>Quantity</th><th>Asking price</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{crops.map(c=><tr key={c.id}><td><span className="table-crop"><img src={c.image} alt=""/><b>{c.name}</b></span></td><td>{c.qty} {c.unit}</td><td>{money(c.price)}</td><td>{c.region}</td><td><span className="status active">Active</span></td><td><button className="table-action" onClick={()=>go("Marketplace")}><Eye size={14}/> Preview</button></td></tr>)}</tbody></table></div></section></>;
}

function CreateListing({ listing, setListing, submitListing, go }) {
  const set=(key,value)=>setListing(old=>({...old,[key]:value}));
  return <><PageHeading eyebrow="SELL YOUR PRODUCE" title="Create new listing" subtitle="Share accurate details so buyers can find and evaluate your produce."/><div className="stepper"><div className="step active"><span>1</span><b>Basic information</b></div><i></i><div className="step"><span>2</span><b>Details & quality</b></div><i></i><div className="step"><span>3</span><b>Photos</b></div></div><form className="panel listing-form" onSubmit={submitListing}><div className="form-heading"><div><h2>Produce information</h2><p>Fields marked with * are required.</p></div><span className="required-note">* Required</span></div><div className="form-grid"><label>Crop *<select required value={listing.crop} onChange={e=>set("crop",e.target.value)}><option value="">Select crop</option>{demoCrops.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label>Region *<select required value={listing.region} onChange={e=>set("region",e.target.value)}><option value="">Select region</option>{["Oromia","Harari","Dire Dawa","Addis Ababa","Amhara","Sidama","South Ethiopia"].map(r=><option key={r}>{r}</option>)}</select></label><label>Quantity *<input required type="number" min="0.1" step="0.1" placeholder="Enter quantity" value={listing.quantity} onChange={e=>set("quantity",e.target.value)}/></label><label>Unit *<select value={listing.unit} onChange={e=>set("unit",e.target.value)}><option>quintal</option><option>kg</option><option>ton</option><option>piece</option></select></label><label>Price per unit (ETB) *<input required type="number" min="0.01" step="0.01" placeholder="Enter asking price" value={listing.price} onChange={e=>set("price",e.target.value)}/></label><label>Listing title *<input required maxLength="200" placeholder="e.g. Fresh Teff — 2026 harvest" value={listing.title} onChange={e=>set("title",e.target.value)}/></label><label className="span-two">Location details<input placeholder="e.g. Near main road, kebele, or collection point"/></label><label className="span-two">Description<textarea rows="4" placeholder="Describe the quality, harvest date, storage, and delivery options." value={listing.description} onChange={e=>set("description",e.target.value)}/></label></div><div className="upload-box"><div className="upload-icon"><ImagePlus size={23}/></div><div><b>Add produce photos</b><p>Photo upload will be wired to secure file storage in a later milestone.</p></div><button type="button" className="button-outline" onClick={()=>alert("Image upload is planned for the next implementation step.")}>Choose photos</button></div><div className="form-actions"><button type="button" className="button-outline" onClick={()=>go("My Listings")}>Cancel</button><button type="button" className="button-quiet" onClick={()=>setListing({...listing})}>Save draft locally</button><button type="submit" className="button-primary">Create listing <ArrowUpRight size={16}/></button></div></form></>;
}

function Inquiries({ inquiries, updateInquiry, setNotice }) {
  const [filter,setFilter]=useState("All");
  const shown=inquiries.filter(i=>filter==="All"||i.status===filter);
  return <><PageHeading eyebrow="BUYER RELATIONSHIPS" title="Buyer inquiries" subtitle="Review offers, respond to buyers, and keep your trading activity organized."/><div className="tabs">{["All","Pending","Accepted","Rejected"].map(t=><button key={t} className={filter===t?"selected":""} onClick={()=>setFilter(t)}>{t}<span>{t==="All"?inquiries.length:inquiries.filter(i=>i.status===t).length}</span></button>)}</div><section className="panel"><div className="panel-head"><div><h2>Inquiry inbox</h2><p>Manage buyer requests and offers</p></div><span className="status active">{inquiries.length} inquiries</span></div><div className="table-wrap"><table><thead><tr><th>Crop / quantity</th><th>Buyer</th><th>Offered price</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{shown.map(i=><tr key={i.id}><td><b>{i.crop}</b><small className="cell-sub">{i.qty}</small></td><td><b>{i.buyer}</b><small className="cell-sub">{i.location}</small></td><td>{i.price}</td><td>{i.date}</td><td><span className={`status ${i.status.toLowerCase()}`}>{i.status}</span></td><td><div className="table-actions">{i.status==="Pending"?<><button className="accept-btn" onClick={()=>{updateInquiry(i.id,"Accepted");setNotice("Inquiry marked accepted!")}}>Accept</button><button className="reject-btn" onClick={()=>{updateInquiry(i.id,"Rejected");setNotice("Inquiry declined.")}}>Decline</button></>:<button className="table-action" onClick={()=>setNotice(`Selected ${i.id}. Messaging will be connected later.`)}><Eye size={14}/> View</button>}</div></td></tr>)}</tbody></table></div>{shown.length===0&&<div className="empty-state">No inquiries in this category.</div>}</section></>;
}

function Messages({setNotice}) {
  return <><PageHeading eyebrow="COMMUNICATION" title="Messages" subtitle="Keep buyer and farmer conversations in one place."/><div className="panel message-empty"><div className="message-illustration"><MessageCircle size={30}/></div><h2>Your conversations will appear here</h2><p>Messaging is part of the next backend milestone. When enabled, use it to confirm quantity, quality, collection, and delivery details.</p><button className="button-primary" onClick={()=>setNotice("Messaging interface is planned; no message has been sent.")}><MessageCircle size={16}/> Start a conversation</button></div></>;
}

function SimplePage({title,subtitle,icon:Icon}) {
  return <><PageHeading eyebrow="AGRICULTURE TOOLS" title={title} subtitle={subtitle}/><div className="panel coming-soon"><div className="coming-icon"><Icon size={29}/></div><h2>Building this module step by step</h2><p>This screen is part of the AgriConnect roadmap. We'll connect it to reliable data sources and the backend after the core marketplace, listings, and inquiries are working.</p><div className="coming-points"><span><CheckCircle2 size={16}/> Shared application layout</span><span><CheckCircle2 size={16}/> Responsive design</span><span><CheckCircle2 size={16}/> Ready for API integration</span></div></div></>;
}
