import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Download, FileText, Settings as SettingsIcon, TrendingUp, Loader2, Edit2, X, Check, Truck, Sparkles, Lock, LogOut, Eye, EyeOff, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ===== SUPABASE =====
const SUPABASE_URL = 'https://lpzwnbrjpayjhlwjmuda.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== CONSTANTES =====
const PAYMENT_METHODS = ['Efectivo', 'Zelle', 'Tarjeta crédito', 'Cheque'];
const METHOD_STYLES = {
  'Efectivo':       { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  'Zelle':          { bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' },
  'Tarjeta crédito':{ bg: '#e0f2fe', text: '#075985', dot: '#0284c7' },
  'Cheque':         { bg: '#fef3c7', text: '#854d0e', dot: '#d97706' },
};
const DEFAULT_VANS = [
  { id: 'van-1', name: 'Van 1', groomer: 'Luis',    pin: '1111', commissionPct: 45 },
  { id: 'van-2', name: 'Van 2', groomer: 'David',   pin: '2222', commissionPct: 45 },
  { id: 'van-3', name: 'Van 3', groomer: 'Valeria', pin: '3333', commissionPct: 45 },
  { id: 'van-4', name: 'Van 4', groomer: 'Stefi',   pin: '4444', commissionPct: 45 },
  { id: 'van-5', name: 'Van 5', groomer: 'Gina',    pin: '5555', commissionPct: 45 },
];
const DEFAULT_ADMIN_PIN = '9999';
const DEFAULT_CATEGORIES = ['Gasolina', 'Shampoo', 'Colonias', 'Materiales', 'Mantenimiento', 'Otros'];

// ===== HELPERS =====
const todayISO = () => { const d = new Date(); const tz = d.getTimezoneOffset() * 60000; return new Date(d - tz).toISOString().slice(0, 10); };
const fmt = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const getWeekRange = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  const diffToMonday = (d.getDay() + 6) % 7;
  const monday = new Date(d); monday.setDate(d.getDate() - diffToMonday);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const toISO = (x) => { const tz = x.getTimezoneOffset() * 60000; return new Date(x - tz).toISOString().slice(0, 10); };
  return { start: toISO(monday), end: toISO(sunday) };
};
const inRange = (dateStr, start, end) => dateStr >= start && dateStr <= end;
const formatDateNice = (dateStr) => new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

// ===== SUPABASE HELPERS =====
const loadSession = () => { try { const v = localStorage.getItem('gv:session'); return v ? JSON.parse(v) : null; } catch { return null; } };
const saveSession = (s) => { try { if (s === null) localStorage.removeItem('gv:session'); else localStorage.setItem('gv:session', JSON.stringify(s)); } catch(e) { console.error(e); } };

const loadVans = async () => {
  const { data, error } = await supabase.from('vans').select('*').order('id');
  if (error) { console.error(error); return DEFAULT_VANS; }
  return (data || DEFAULT_VANS).map(v => ({
    id: v.id, name: v.name, groomer: v.groomer || '', pin: v.pin,
    commissionPct: parseFloat(v.commission_pct) || 45,
  }));
};
const saveVan = async (van) => {
  const { error } = await supabase.from('vans').upsert({
    id: van.id, name: van.name, groomer: van.groomer || '', pin: van.pin,
    commission_pct: van.commissionPct || 45,
  });
  if (error) console.error(error);
};
const loadServices = async () => {
  const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(s => ({
    id: s.id, date: s.date, vanId: s.van_id,
    client: s.client, pet: s.pet || '', service: s.service || '',
    method: s.method, amount: parseFloat(s.amount) || 0,
    tip: parseFloat(s.tip) || 0, cardFee: parseFloat(s.card_fee) || 0,
    createdAt: new Date(s.created_at).getTime(),
  }));
};
const saveService = async (service) => {
  const { error } = await supabase.from('services').upsert({
    id: service.id, date: service.date, van_id: service.vanId,
    client: service.client, pet: service.pet || '', service: service.service || '',
    method: service.method, amount: service.amount, tip: service.tip || 0,
    card_fee: service.cardFee || 0,
  });
  if (error) console.error(error);
};
const deleteService = async (id) => { await supabase.from('services').delete().eq('id', id); };
const clearAllServices = async () => { await supabase.from('services').delete().neq('id', '__never__'); };

const loadSettings = async () => {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) return { commissionPct: 45, tipsToGroomer: 100, adminPin: DEFAULT_ADMIN_PIN, cardFeePct: 5.5, gasFee: 7.00 };
  return {
    commissionPct: parseFloat(data.commission_pct) || 45,
    tipsToGroomer: parseFloat(data.tips_to_groomer) || 100,
    adminPin: data.admin_pin || DEFAULT_ADMIN_PIN,
    cardFeePct: parseFloat(data.card_fee_pct) || 5.5,
    gasFee: parseFloat(data.gas_fee) || 7.00,
  };
};
const saveSettings = async (s) => {
  await supabase.from('settings').upsert({
    id: 1, commission_pct: s.commissionPct, tips_to_groomer: s.tipsToGroomer,
    admin_pin: s.adminPin, card_fee_pct: s.cardFeePct, gas_fee: s.gasFee,
  });
};

const loadExpenses = async () => {
  const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(e => ({
    id: e.id, date: e.date, vanId: e.van_id,
    category: e.category, description: e.description || '',
    amount: parseFloat(e.amount) || 0,
    createdAt: new Date(e.created_at).getTime(),
  }));
};
const saveExpense = async (expense) => {
  await supabase.from('expenses').upsert({
    id: expense.id, date: expense.date, van_id: expense.vanId,
    category: expense.category, description: expense.description || '', amount: expense.amount,
  });
};
const deleteExpense = async (id) => { await supabase.from('expenses').delete().eq('id', id); };

const loadCategories = async () => {
  const { data, error } = await supabase.from('expense_categories').select('*').order('name');
  if (error || !data?.length) return DEFAULT_CATEGORIES;
  return data.map(c => c.name);
};
const saveCategory = async (name) => { await supabase.from('expense_categories').upsert({ name }); };
const deleteCategoryDB = async (name) => { await supabase.from('expense_categories').delete().eq('name', name); };

// ===== APP =====
export default function App() {
  const [tab, setTab] = useState('registro');
  const [loading, setLoading] = useState(true);
  const [vans, setVans] = useState(DEFAULT_VANS);
  const [services, setServices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState({ commissionPct: 45, tipsToGroomer: 100, adminPin: DEFAULT_ADMIN_PIN, cardFeePct: 5.5, gasFee: 7.00 });
  const [session, setSession] = useState(null);

  useEffect(() => {
    (async () => {
      const [v, s, st, ex, cats] = await Promise.all([loadVans(), loadServices(), loadSettings(), loadExpenses(), loadCategories()]);
      setVans(v); setServices(s); setSettings(st); setExpenses(ex); setCategories(cats);
      setSession(loadSession());
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) saveSession(session); }, [session, loading]);

  useEffect(() => {
    if (loading || !session) return;
    const interval = setInterval(async () => {
      const [freshS, freshE] = await Promise.all([loadServices(), loadExpenses()]);
      setServices(freshS); setExpenses(freshE);
    }, 15000);
    return () => clearInterval(interval);
  }, [loading, session]);

  useEffect(() => {
    if (session?.type === 'van') setTab('registro');
    if (session?.type === 'admin') setTab('cierre');
  }, [session?.type]);

  const updateVans = async (newVans) => { setVans(newVans); for (const v of newVans) await saveVan(v); };
  const addService = async (service) => { setServices(prev => [service, ...prev]); await saveService(service); };
  const updateService = async (service) => { setServices(prev => prev.map(s => s.id === service.id ? service : s)); await saveService(service); };
  const removeService = async (id) => { setServices(prev => prev.filter(s => s.id !== id)); await deleteService(id); };
  const clearServices = async () => { setServices([]); await clearAllServices(); };
  const updateSettings = async (newSettings) => { setSettings(newSettings); await saveSettings(newSettings); };
  const addExpense = async (expense) => { setExpenses(prev => [expense, ...prev]); await saveExpense(expense); };
  const removeExpense = async (id) => { setExpenses(prev => prev.filter(e => e.id !== id)); await deleteExpense(id); };
  const addCategory = async (name) => { setCategories(prev => [...prev, name].sort()); await saveCategory(name); };
  const removeCategory = async (name) => { setCategories(prev => prev.filter(c => c !== name)); await deleteCategoryDB(name); };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#0f766e' }} />
        <p style={{ marginTop: 12, color: '#475569', fontFamily: 'Manrope, sans-serif' }}>Cargando...</p>
      </div>
    );
  }

  if (!session) return <LoginScreen vans={vans} adminPin={settings.adminPin} onLogin={setSession} />;

  const isAdmin = session.type === 'admin';
  const currentVan = !isAdmin ? vans.find(v => v.id === session.vanId) : null;
  const visibleServices = isAdmin ? services : services.filter(s => s.vanId === session.vanId);
  const visibleExpenses = isAdmin ? expenses : expenses.filter(e => e.vanId === session.vanId);
  const visibleVans = isAdmin ? vans : vans.filter(v => v.id === session.vanId);

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
        input:focus, select:focus { outline: 2px solid #0f766e; outline-offset: 1px; }
        button { font-family: 'Manrope', sans-serif; }
        .row-hover:hover { background: #f8fafc !important; }
        .suggestion-hover:hover { background: #f0fdfa !important; }
        .pin-btn:hover { background: #f0fdfa !important; border-color: #0f766e !important; color: #0f766e !important; }
        .pin-btn:active { transform: scale(0.94); }
        .van-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(15,118,110,0.25) !important; border-color: #0f766e !important; }
      `}</style>
      <Header tab={tab} setTab={setTab} isAdmin={isAdmin} currentVan={currentVan} onLogout={() => setSession(null)} />
      <main style={styles.main}>
        {tab === 'registro' && (
          <RegistroTab
            vans={visibleVans} services={visibleServices} addService={addService}
            updateService={updateService} removeService={removeService}
            fixedVanId={isAdmin ? null : session.vanId} settings={settings}
            expenses={visibleExpenses} addExpense={addExpense} removeExpense={removeExpense}
            categories={categories}
          />
        )}
        {tab === 'cierre' && <CierreTab vans={visibleVans} services={visibleServices} expenses={visibleExpenses} isAdmin={isAdmin} settings={settings} />}
        {tab === 'semana' && isAdmin && <SemanaTab vans={vans} services={services} expenses={expenses} settings={settings} />}
        {tab === 'config' && isAdmin && (
          <ConfigTab vans={vans} updateVans={updateVans} settings={settings} updateSettings={updateSettings}
            services={services} clearServices={clearServices} categories={categories}
            addCategory={addCategory} removeCategory={removeCategory} />
        )}
      </main>
      <footer style={styles.footer}><Sparkles size={12} /> El Pet Wash · Cierre Diario</footer>
    </div>
  );
}

// ===== LOGIN =====
function LoginScreen({ vans, adminPin, onLogin }) {
  const [step, setStep] = useState('select');
  const [selectedVan, setSelectedVan] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSelectVan = (van) => { setSelectedVan(van); setIsAdminMode(false); setStep('pin'); setPinInput(''); setError(false); };
  const handleSelectAdmin = () => { setSelectedVan(null); setIsAdminMode(true); setStep('pin'); setPinInput(''); setError(false); };
  const handleDigit = (d) => {
    if (pinInput.length >= 4) return;
    const newPin = pinInput + d;
    setPinInput(newPin); setError(false);
    if (newPin.length === 4) setTimeout(() => tryLogin(newPin), 150);
  };
  const handleDelete = () => { setPinInput(pinInput.slice(0, -1)); setError(false); };
  const tryLogin = (pin) => {
    const correct = isAdminMode ? pin === adminPin : pin === selectedVan?.pin;
    if (correct) onLogin(isAdminMode ? { type: 'admin' } : { type: 'van', vanId: selectedVan.id });
    else { setError(true); setTimeout(() => { setPinInput(''); setError(false); }, 600); }
  };
  const goBack = () => { setStep('select'); setPinInput(''); setError(false); };

  return (
    <div style={styles.loginScreen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        * { box-sizing: border-box; } body { margin: 0; } button { font-family: 'Manrope', sans-serif; }
        .pin-btn:hover { background: #f0fdfa !important; border-color: #0f766e !important; color: #0f766e !important; }
        .pin-btn:active { transform: scale(0.94); }
        .van-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(15,118,110,0.25) !important; border-color: #0f766e !important; }
      `}</style>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <div style={styles.logoBox}><Truck size={20} color="#fff" /></div>
          <div>
            <h1 style={styles.title}>El Pet Wash</h1>
            <p style={styles.subtitle}>{step === 'select' ? 'Selecciona tu van' : isAdminMode ? 'Acceso administrador' : `Hola ${selectedVan?.groomer || selectedVan?.name}`}</p>
          </div>
        </div>
        {step === 'select' ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={styles.vanTilesGrid}>
              {vans.map(v => (
                <button key={v.id} onClick={() => handleSelectVan(v)} className="van-tile" style={styles.vanTile}>
                  <div style={styles.vanTileIcon}><Truck size={22} color="#0f766e" /></div>
                  <div style={styles.vanTileName}>{v.groomer || v.name}</div>
                  <div style={styles.vanTileSub}>{v.groomer ? v.name : 'Sin asignar'}</div>
                </button>
              ))}
            </div>
            <div style={styles.loginDivider}><span>o</span></div>
            <button onClick={handleSelectAdmin} style={styles.adminAccessBtn}><Lock size={15} />Acceso administrador</button>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <p style={styles.pinPrompt}>Ingresa tu PIN de 4 dígitos</p>
            <div style={{ ...styles.pinDots, animation: error ? 'shake 0.4s' : 'none' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ ...styles.pinDot, ...(i < pinInput.length ? styles.pinDotFilled : {}), ...(error ? styles.pinDotError : {}) }}>
                  {showPin && i < pinInput.length ? pinInput[i] : ''}
                </div>
              ))}
            </div>
            {error && <p style={styles.pinError}>PIN incorrecto, intenta de nuevo</p>}
            <div style={styles.pinPad}>
              {['1','2','3','4','5','6','7','8','9'].map(d => (
                <button key={d} onClick={() => handleDigit(d)} className="pin-btn" style={styles.pinBtn}>{d}</button>
              ))}
              <button onClick={() => setShowPin(!showPin)} className="pin-btn" style={styles.pinBtn}>
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <button onClick={() => handleDigit('0')} className="pin-btn" style={styles.pinBtn}>0</button>
              <button onClick={handleDelete} className="pin-btn" style={styles.pinBtn}>⌫</button>
            </div>
            <button onClick={goBack} style={styles.pinBackBtn}>← Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== HEADER =====
function Header({ tab, setTab, isAdmin, currentVan, onLogout }) {
  const tabs = isAdmin ? [
    { id: 'registro', label: 'Registro', icon: Plus },
    { id: 'cierre', label: 'Cierre Diario', icon: FileText },
    { id: 'semana', label: 'Reporte Semanal', icon: TrendingUp },
    { id: 'config', label: 'Configuración', icon: SettingsIcon },
  ] : [
    { id: 'registro', label: 'Servicios', icon: Plus },
    { id: 'cierre', label: 'Mi Cierre', icon: FileText },
  ];
  return (
    <header style={styles.header}>
      <div style={styles.headerTop}>
        <div style={styles.brand}>
          <div style={styles.logoBox}><Truck size={20} color="#fff" /></div>
          <div>
            <h1 style={styles.title}>El Pet Wash</h1>
            <p style={styles.subtitle}>{isAdmin ? 'Panel de administración' : `${currentVan?.name} · ${currentVan?.groomer || ''}`}</p>
          </div>
        </div>
        <div style={styles.userBadgeWrap}>
          <div style={isAdmin ? styles.adminBadge : styles.userBadge}>
            {isAdmin ? <Lock size={12} /> : <Truck size={12} />}
            {isAdmin ? 'Administrador' : (currentVan?.groomer || currentVan?.name)}
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}><LogOut size={15} /></button>
        </div>
      </div>
      <nav style={styles.nav}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ ...styles.tabBtn, ...(active ? styles.tabBtnActive : {}) }}>
              <Icon size={15} /><span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

// ===== REGISTRO TAB =====
function RegistroTab({ vans, services, addService, updateService, removeService, fixedVanId, settings, expenses, addExpense, removeExpense, categories }) {
  const [activeSection, setActiveSection] = useState('servicios');
  const [date, setDate] = useState(todayISO());
  const [vanId, setVanId] = useState(fixedVanId || vans[0]?.id || '');
  const [form, setForm] = useState({ client: '', pet: '', service: '', method: 'Efectivo', amount: '', tip: '' });
  const [editingId, setEditingId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: categories[0] || 'Gasolina', description: '', amount: '' });

  useEffect(() => { if (fixedVanId) setVanId(fixedVanId); }, [fixedVanId]);

  // Calcular totales del servicio con fees
  const calcTotal = (base, tip, method) => {
    const baseAmt = parseFloat(base) || 0;
    const tipAmt = parseFloat(tip) || 0;
    const gasFee = settings?.gasFee || 7;
    const cardFee = method === 'Tarjeta crédito' ? ((baseAmt + tipAmt) * ((settings?.cardFeePct || 5.5) / 100)) : 0;
    return { baseAmt, tipAmt, gasFee, cardFee, total: baseAmt + tipAmt + gasFee + cardFee };
  };

  const currentCalc = calcTotal(form.amount, form.tip, form.method);

  // Autocompletado
  const knownClients = useMemo(() => {
    const map = new Map();
    [...services].sort((a, b) => a.createdAt - b.createdAt).forEach(s => {
      if (!s.client) return;
      const key = s.client.trim().toLowerCase();
      const prev = map.get(key) || { count: 0 };
      map.set(key, { client: s.client.trim(), pet: s.pet?.trim() || prev.pet || '', lastService: s.service?.trim() || prev.lastService || '', lastAmount: s.amount || prev.lastAmount || 0, count: prev.count + 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [services]);

  const clientSuggestions = useMemo(() => {
    const q = form.client.trim().toLowerCase();
    if (q.length < 1) return [];
    return knownClients.filter(c => c.client.toLowerCase().includes(q)).slice(0, 6);
  }, [form.client, knownClients]);

  const selectClient = (c) => {
    setForm(f => ({ ...f, client: c.client, pet: f.pet || c.pet, service: f.service || c.lastService, amount: f.amount || (c.lastAmount ? String(c.lastAmount) : '') }));
    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (!form.client.trim() || !form.amount) { alert('Completa al menos cliente y monto'); return; }
    const calc = calcTotal(form.amount, form.tip, form.method);
    if (editingId) {
      const existing = services.find(s => s.id === editingId);
      if (existing) updateService({ ...existing, ...form, amount: calc.baseAmt, tip: calc.tipAmt, cardFee: calc.cardFee, vanId, date });
      setEditingId(null);
    } else {
      addService({ id: uid(), date, vanId, client: form.client.trim(), pet: form.pet.trim(), service: form.service.trim(), method: form.method, amount: calc.baseAmt, tip: calc.tipAmt, cardFee: calc.cardFee, createdAt: Date.now() });
    }
    setForm({ client: '', pet: '', service: '', method: 'Efectivo', amount: '', tip: '' });
  };

  const handleEdit = (s) => {
    setForm({ client: s.client, pet: s.pet, service: s.service, method: s.method, amount: String(s.amount), tip: String(s.tip || '') });
    setEditingId(s.id); setActiveSection('servicios');
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este servicio?')) {
      removeService(id);
      if (editingId === id) { setEditingId(null); setForm({ client: '', pet: '', service: '', method: 'Efectivo', amount: '', tip: '' }); }
    }
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount) { alert('Ingresa el monto del gasto'); return; }
    addExpense({ id: uid(), date, vanId, category: expenseForm.category, description: expenseForm.description.trim(), amount: parseFloat(expenseForm.amount) || 0, createdAt: Date.now() });
    setExpenseForm({ category: categories[0] || 'Gasolina', description: '', amount: '' });
  };

  const dayServices = useMemo(() => services.filter(s => s.date === date && s.vanId === vanId).sort((a, b) => b.createdAt - a.createdAt), [services, date, vanId]);
  const dayExpenses = useMemo(() => expenses.filter(e => e.date === date && e.vanId === vanId).sort((a, b) => b.createdAt - a.createdAt), [expenses, date, vanId]);
  const dayTotal = dayServices.reduce((sum, s) => sum + s.amount, 0);
  const dayTips = dayServices.reduce((sum, s) => sum + (s.tip || 0), 0);
  const dayExpTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currentVan = vans.find(v => v.id === vanId);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Registro del día" title={formatDateNice(todayISO())} />

      {/* Selector de sección */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
        <button onClick={() => setActiveSection('servicios')} style={{
          flex: 1, padding: '8px 12px', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: activeSection === 'servicios' ? '#fff' : 'transparent',
          color: activeSection === 'servicios' ? '#0f766e' : '#64748b',
          boxShadow: activeSection === 'servicios' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}>💼 Servicios</button>
        <button onClick={() => setActiveSection('gastos')} style={{
          flex: 1, padding: '8px 12px', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: activeSection === 'gastos' ? '#fff' : 'transparent',
          color: activeSection === 'gastos' ? '#dc2626' : '#64748b',
          boxShadow: activeSection === 'gastos' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}>⛽ Gastos del día</button>
      </div>

      {activeSection === 'gastos' ? (
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardH3}>Registrar gasto</h3>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={styles.lbl}>Fecha</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
              </div>
              {!fixedVanId && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={styles.lbl}>Van</label>
                  <select value={vanId} onChange={e => setVanId(e.target.value)} style={styles.input}>
                    {vans.map(v => <option key={v.id} value={v.id}>{v.name}{v.groomer ? ` — ${v.groomer}` : ''}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.lbl}>Categoría</label>
                <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} style={styles.input}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.lbl}>Descripción (opcional)</label>
                <input value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} style={styles.input} placeholder="Ej: Shell en Brickell" />
              </div>
              <div>
                <label style={styles.lbl}>Monto *</label>
                <input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} style={styles.input} placeholder="0.00" />
              </div>
            </div>
            <div style={styles.formActions}>
              <button onClick={handleAddExpense} style={styles.btnDanger}>
                <Plus size={15} /> Registrar gasto
              </button>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <SectionTitle
              eyebrow={`${currentVan?.name || 'Van'} · ${formatDateNice(date)}`}
              title={`${dayExpenses.length} gasto${dayExpenses.length === 1 ? '' : 's'} — Total: ${fmt(dayExpTotal)}`}
            />
            {dayExpenses.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>Sin gastos registrados</p>
                <p style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>Agrega gasolina, materiales u otros gastos del día</p>
              </div>
            ) : (
              <div style={styles.card}>
                {dayExpenses.map(e => (
                  <div key={e.id} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{e.category}</div>
                      {e.description && <div style={{ fontSize: 12, color: '#64748b' }}>{e.description}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>{fmt(e.amount)}</span>
                      <button onClick={() => { if (confirm('¿Eliminar este gasto?')) removeExpense(e.id); }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={styles.card}>
            <div style={styles.selectorRow}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={styles.lbl}>Fecha</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
              </div>
              {!fixedVanId && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={styles.lbl}>Van</label>
                  <select value={vanId} onChange={e => setVanId(e.target.value)} style={styles.input}>
                    {vans.map(v => <option key={v.id} value={v.id}>{v.name}{v.groomer ? ` — ${v.groomer}` : ''}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={styles.divider} />
            <div style={styles.formGrid}>
              <div style={{ position: 'relative' }}>
                <label style={styles.lbl}>
                  Cliente *
                  {knownClients.length > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: '#0f766e', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                      · {knownClients.length} guardado{knownClients.length === 1 ? '' : 's'}
                    </span>
                  )}
                </label>
                <input value={form.client} onChange={e => { setForm({ ...form, client: e.target.value }); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  style={styles.input} placeholder="Nombre del cliente" autoComplete="off" />
                {showSuggestions && clientSuggestions.length > 0 && (
                  <div style={styles.suggestionsBox}>
                    <div style={styles.suggestionsHeader}>Clientes encontrados · toca para autocompletar</div>
                    {clientSuggestions.map((c, i) => (
                      <button key={i} onMouseDown={e => { e.preventDefault(); selectClient(c); }} className="suggestion-hover" style={styles.suggestionItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{c.client}</div>
                            {(c.pet || c.lastService) && (
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                {c.pet && <span>🐾 {c.pet}</span>}
                                {c.pet && c.lastService && <span style={{ margin: '0 6px', color: '#cbd5e1' }}>·</span>}
                                {c.lastService && <span>{c.lastService}</span>}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {c.lastAmount > 0 && <div style={{ fontWeight: 600, color: '#0f766e', fontSize: 13 }}>{fmt(c.lastAmount)}</div>}
                            <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{c.count} visita{c.count === 1 ? '' : 's'}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={styles.lbl}>Mascota</label>
                <input value={form.pet} onChange={e => setForm({ ...form, pet: e.target.value })} style={styles.input} placeholder="Nombre y raza" />
              </div>
              <div>
                <label style={styles.lbl}>Servicio</label>
                <input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={styles.input} placeholder="Ej: Full Groom" />
              </div>
              <div>
                <label style={styles.lbl}>Método de pago</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} style={styles.input}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.lbl}>Monto del servicio *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={styles.input} placeholder="0.00" />
              </div>
              <div>
                <label style={styles.lbl}>Propina (opcional)</label>
                <input type="number" step="0.01" value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value })} style={styles.input} placeholder="0.00" />
              </div>
            </div>

            {/* Resumen de cobro */}
            {(form.amount || form.tip) && (
              <div style={{ marginTop: 14, padding: 14, background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Total al cliente</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {form.amount && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}><span>Servicio</span><span>{fmt(form.amount)}</span></div>}
                  {form.tip && parseFloat(form.tip) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}><span>Propina</span><span>{fmt(form.tip)}</span></div>}
                  {currentCalc.cardFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7c3aed' }}><span>Fee tarjeta ({settings?.cardFeePct || 5.5}%)</span><span>{fmt(currentCalc.cardFee)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}><span>Fee gasolina</span><span>{fmt(currentCalc.gasFee)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#0f172a', paddingTop: 6, borderTop: '1px solid #ccfbf1', marginTop: 2 }}><span>TOTAL</span><span>{fmt(currentCalc.total)}</span></div>
                </div>
              </div>
            )}

            <div style={styles.formActions}>
              {editingId && (
                <button onClick={() => { setEditingId(null); setForm({ client: '', pet: '', service: '', method: 'Efectivo', amount: '', tip: '' }); }} style={styles.btnSecondary}>
                  <X size={15} /> Cancelar
                </button>
              )}
              <button onClick={handleSubmit} style={styles.btnPrimary}>
                {editingId ? <><Check size={15} /> Guardar cambios</> : <><Plus size={15} /> Agregar servicio</>}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <SectionTitle
              eyebrow={`${currentVan?.name || 'Van'} · ${formatDateNice(date)}`}
              title={`${dayServices.length} servicio${dayServices.length === 1 ? '' : 's'} registrado${dayServices.length === 1 ? '' : 's'}`}
              right={
                <div style={styles.miniStats}>
                  <div><span style={styles.miniLbl}>Ventas</span><span style={styles.miniVal}>{fmt(dayTotal)}</span></div>
                  {dayTips > 0 && <div><span style={styles.miniLbl}>Propinas</span><span style={styles.miniVal}>{fmt(dayTips)}</span></div>}
                  {dayExpTotal > 0 && <div><span style={styles.miniLbl}>Gastos</span><span style={{ ...styles.miniVal, color: '#dc2626' }}>{fmt(dayExpTotal)}</span></div>}
                </div>
              }
            />
            {dayServices.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>Sin servicios todavía</p>
                <p style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>Agrega el primer servicio del día arriba</p>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Cliente</th>
                        <th style={styles.th}>Mascota</th>
                        <th style={styles.th}>Servicio</th>
                        <th style={styles.th}>Pago</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Monto</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Propina</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Fee</th>
                        <th style={styles.th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayServices.map(s => (
                        <tr key={s.id} className="row-hover" style={styles.tr}>
                          <td style={styles.td}><strong>{s.client}</strong></td>
                          <td style={{ ...styles.td, color: '#64748b' }}>{s.pet || '—'}</td>
                          <td style={{ ...styles.td, color: '#64748b' }}>{s.service || '—'}</td>
                          <td style={styles.td}><MethodChip method={s.method} /></td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>{fmt(s.amount)}</td>
                          <td style={{ ...styles.td, textAlign: 'right', color: '#64748b' }}>{s.tip > 0 ? fmt(s.tip) : '—'}</td>
                          <td style={{ ...styles.td, textAlign: 'right', color: '#7c3aed', fontSize: 12 }}>
                            {s.cardFee > 0 ? fmt(s.cardFee) : '—'}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button onClick={() => handleEdit(s)} style={styles.iconBtn}><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(s.id)} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CIERRE DIARIO =====
function CierreTab({ vans, services, expenses, isAdmin, settings }) {
  const [date, setDate] = useState(todayISO());
  const breakdown = useMemo(() => {
    return vans.map(van => {
      const items = services.filter(s => s.date === date && s.vanId === van.id);
      const vanExpenses = expenses.filter(e => e.date === date && e.vanId === van.id);
      const byMethod = PAYMENT_METHODS.reduce((acc, m) => {
        const list = items.filter(i => i.method === m);
        acc[m] = { count: list.length, amount: list.reduce((sum, i) => sum + i.amount, 0), tips: list.reduce((sum, i) => sum + (i.tip || 0), 0) };
        return acc;
      }, {});
      const total = items.reduce((sum, i) => sum + i.amount, 0);
      const tips = items.reduce((sum, i) => sum + (i.tip || 0), 0);
      const cardFees = items.reduce((sum, i) => sum + (i.cardFee || 0), 0);
      const gasFees = items.length * (settings?.gasFee || 7);
      const expTotal = vanExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { van, items, byMethod, total, tips, cardFees, gasFees, expTotal, count: items.length, expenses: vanExpenses };
    });
  }, [vans, services, expenses, date, settings]);

  const grandTotal = breakdown.reduce((sum, b) => sum + b.total, 0);
  const grandTips = breakdown.reduce((sum, b) => sum + b.tips, 0);
  const grandCount = breakdown.reduce((sum, b) => sum + b.count, 0);
  const grandCardFees = breakdown.reduce((sum, b) => sum + b.cardFees, 0);
  const grandByMethod = PAYMENT_METHODS.reduce((acc, m) => { acc[m] = breakdown.reduce((sum, b) => sum + b.byMethod[m].amount, 0); return acc; }, {});

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Cierre Diario" title={formatDateNice(date)} />
      <div style={styles.card}>
        <label style={styles.lbl}>Fecha del cierre</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...styles.input, maxWidth: 240 }} />
      </div>
      <div style={styles.kpiGrid}>
        <KpiCard label="Servicios" value={grandCount} />
        <KpiCard label="Total ventas" value={fmt(grandTotal)} highlight />
        {grandTips > 0 && <KpiCard label="Propinas" value={fmt(grandTips)} />}
        {grandCardFees > 0 && <KpiCard label="Fees tarjeta" value={fmt(grandCardFees)} />}
      </div>
      {grandTotal > 0 && (
        <div style={{ ...styles.card, marginTop: 16 }}>
          <h3 style={styles.cardH3}>Por método de pago</h3>
          <div style={styles.methodGrid}>
            {PAYMENT_METHODS.map(m => (
              <div key={m} style={styles.methodCell}>
                <MethodChip method={m} />
                <div style={styles.methodAmount}>{fmt(grandByMethod[m])}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isAdmin && (
        <div style={{ marginTop: 28 }}>
          <SectionTitle eyebrow="Por Van" title="Desglose individual" />
          <div style={styles.vanGrid}>
            {breakdown.map(b => (
              <div key={b.van.id} style={styles.vanCard}>
                <div style={styles.vanCardHead}>
                  <div>
                    <div style={styles.vanCardName}>{b.van.name}</div>
                    {b.van.groomer && <div style={styles.vanCardGroomer}>{b.van.groomer}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>{b.count} serv.</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600 }}>{fmt(b.total)}</div>
                  </div>
                </div>
                {b.total === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Sin servicios</div>
                ) : (
                  <>
                    <div style={styles.vanMethods}>
                      {PAYMENT_METHODS.map(m => {
                        const v = b.byMethod[m];
                        if (v.count === 0) return null;
                        return (
                          <div key={m} style={styles.vanMethodRow}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ ...styles.dot, background: METHOD_STYLES[m].dot }} />
                              <span style={{ fontSize: 13, color: '#475569' }}>{m}</span>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>({v.count})</span>
                            </div>
                            <span style={{ fontWeight: 600 }}>{fmt(v.amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                    {(b.tips > 0 || b.cardFees > 0 || b.expTotal > 0) && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                        {b.tips > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Propinas</span><span style={{ color: '#0f766e', fontWeight: 600 }}>{fmt(b.tips)}</span></div>}
                        {b.cardFees > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Fees tarjeta</span><span style={{ color: '#7c3aed', fontWeight: 600 }}>{fmt(b.cardFees)}</span></div>}
                        {b.expTotal > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Gastos</span><span style={{ color: '#dc2626', fontWeight: 600 }}>-{fmt(b.expTotal)}</span></div>}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== REPORTE SEMANAL =====
function SemanaTab({ vans, services, expenses, settings }) {
  const [refDate, setRefDate] = useState(todayISO());
  const { start, end } = getWeekRange(refDate);

  const report = useMemo(() => {
    const weekServices = services.filter(s => inRange(s.date, start, end));
    const weekExpenses = expenses.filter(e => inRange(e.date, start, end));
    return vans.map(van => {
      const items = weekServices.filter(s => s.vanId === van.id);
      const vanExpenses = weekExpenses.filter(e => e.vanId === van.id);
      const vanCommission = van.commissionPct || settings.commissionPct || 45;
      const sales = items.reduce((sum, i) => sum + i.amount, 0);
      const tips = items.reduce((sum, i) => sum + (i.tip || 0), 0);
      const cardFees = items.reduce((sum, i) => sum + (i.cardFee || 0), 0);
      const gasFees = items.length * (settings.gasFee || 7);
      const expTotal = vanExpenses.reduce((sum, e) => sum + e.amount, 0);
      const commission = sales * (vanCommission / 100);
      const tipShare = tips * (settings.tipsToGroomer / 100);
      const totalPay = commission + tipShare - gasFees - expTotal;
      const byMethod = PAYMENT_METHODS.reduce((acc, m) => { acc[m] = items.filter(i => i.method === m).reduce((sum, i) => sum + i.amount, 0); return acc; }, {});
      return { van, count: items.length, sales, tips, cardFees, gasFees, expTotal, commission, tipShare, totalPay, byMethod, vanCommission };
    });
  }, [vans, services, expenses, start, end, settings]);

  const totals = report.reduce((acc, r) => ({
    sales: acc.sales + r.sales, tips: acc.tips + r.tips, cardFees: acc.cardFees + r.cardFees,
    gasFees: acc.gasFees + r.gasFees, expTotal: acc.expTotal + r.expTotal,
    commission: acc.commission + r.commission, tipShare: acc.tipShare + r.tipShare,
    totalPay: acc.totalPay + r.totalPay, count: acc.count + r.count,
  }), { sales: 0, tips: 0, cardFees: 0, gasFees: 0, expTotal: 0, commission: 0, tipShare: 0, totalPay: 0, count: 0 });

  const exportCSV = () => {
    const rows = [
      ['Reporte Semanal El Pet Wash'],
      [`Semana: ${start} a ${end}`],
      [`Comisión: ${settings.commissionPct}% · Propinas: ${settings.tipsToGroomer}% · Fee gasolina: $${settings.gasFee} · Fee tarjeta: ${settings.cardFeePct}%`],
      [],
      ['Van','Groomer','Servicios','Ventas','Efectivo','Zelle','Tarjeta','Cheque','Propinas','Fee Tarjeta','Fee Gasolina','Gastos','Comisión','+ Propinas','- Gasolina','- Gastos','A PAGAR'],
    ];
    report.forEach(r => rows.push([
      r.van.name, r.van.groomer||'', r.count, r.sales.toFixed(2),
      r.byMethod['Efectivo'].toFixed(2), r.byMethod['Zelle'].toFixed(2),
      r.byMethod['Tarjeta crédito'].toFixed(2), r.byMethod['Cheque'].toFixed(2),
      r.tips.toFixed(2), r.cardFees.toFixed(2), r.gasFees.toFixed(2), r.expTotal.toFixed(2),
      r.commission.toFixed(2), r.tipShare.toFixed(2), (-r.gasFees).toFixed(2), (-r.expTotal).toFixed(2), r.totalPay.toFixed(2),
    ]));
    rows.push([]);
    rows.push(['TOTAL','',totals.count,totals.sales.toFixed(2),'','','','',totals.tips.toFixed(2),totals.cardFees.toFixed(2),totals.gasFees.toFixed(2),totals.expTotal.toFixed(2),totals.commission.toFixed(2),totals.tipShare.toFixed(2),'','',totals.totalPay.toFixed(2)]);
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `reporte-${start}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Reporte Semanal" title={`${formatDateNice(start)} — ${formatDateNice(end)}`} />
      <div style={styles.card}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={styles.lbl}>Cualquier día de la semana</label>
            <input type="date" value={refDate} onChange={e => setRefDate(e.target.value)} style={styles.input} />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>Lunes a domingo</p>
          </div>
          <button onClick={exportCSV} style={styles.btnPrimary}><Download size={15} /> Exportar CSV</button>
        </div>
      </div>
      <div style={styles.kpiGrid}>
        <KpiCard label="Servicios" value={totals.count} />
        <KpiCard label="Ventas totales" value={fmt(totals.sales)} highlight />
        <KpiCard label="Fees tarjeta" value={fmt(totals.cardFees)} />
        <KpiCard label="Gastos totales" value={fmt(totals.expTotal + totals.gasFees)} />
        <KpiCard label="Total a pagar" value={fmt(totals.totalPay)} highlight accent />
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionTitle eyebrow="Pago a Groomers" title="Desglose por van" />
        <div style={styles.card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Van</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Serv.</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Ventas</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Propinas</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Comisión %</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>+ Propinas</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>- Gas. (${settings.gasFee}×)</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>- Gastos</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#0f766e' }}>A PAGAR</th>
                </tr>
              </thead>
              <tbody>
                {report.map(r => (
                  <tr key={r.van.id} className="row-hover" style={styles.tr}>
                    <td style={styles.td}><strong>{r.van.name}</strong>{r.van.groomer && <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.van.groomer}</div>}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{r.count}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{fmt(r.sales)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#64748b' }}>{fmt(r.tips)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div>{fmt(r.commission)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.vanCommission}%</div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#64748b' }}>{fmt(r.tipShare)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#dc2626' }}>-{fmt(r.gasFees)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#dc2626' }}>{r.expTotal > 0 ? `-${fmt(r.expTotal)}` : '—'}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#0f766e', fontFamily: 'Fraunces, serif', fontSize: 16 }}>{fmt(r.totalPay)}</td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                  <td style={{ ...styles.td, fontWeight: 700 }}>TOTAL</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{totals.count}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{fmt(totals.sales)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{fmt(totals.tips)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{fmt(totals.commission)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{fmt(totals.tipShare)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>-{fmt(totals.gasFees)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>{totals.expTotal > 0 ? `-${fmt(totals.expTotal)}` : '—'}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800, color: '#0f766e', fontFamily: 'Fraunces, serif', fontSize: 17 }}>{fmt(totals.totalPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CONFIG TAB =====
function ConfigTab({ vans, updateVans, settings, updateSettings, services, clearServices, categories, addCategory, removeCategory }) {
  const [editVan, setEditVan] = useState({});
  const [newCategory, setNewCategory] = useState('');

  const startEdit = (v) => setEditVan({ ...editVan, [v.id]: { name: v.name, groomer: v.groomer || '', pin: v.pin || '', commissionPct: v.commissionPct || 45 } });
  const cancelEdit = (id) => { const copy = { ...editVan }; delete copy[id]; setEditVan(copy); };
  const saveEdit = (id) => {
    const e = editVan[id];
    if (!e.name.trim()) { alert('El nombre no puede estar vacío'); return; }
    if (!/^\d{4}$/.test(e.pin)) { alert('El PIN debe ser de exactamente 4 dígitos'); return; }
    updateVans(vans.map(v => v.id === id ? { ...v, name: e.name.trim(), groomer: e.groomer.trim(), pin: e.pin, commissionPct: parseFloat(e.commissionPct) || 45 } : v));
    cancelEdit(id);
  };
  const clearAll = () => {
    if (confirm('¿Borrar TODOS los servicios? No se puede deshacer.')) {
      if (confirm('Confirma: ¿borrar todo el historial?')) clearServices();
    }
  };
  const handleAddCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    if (categories.includes(name)) { alert('Esa categoría ya existe'); return; }
    addCategory(name); setNewCategory('');
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Configuración" title="Ajustes generales" />

      {/* Comisiones y fees */}
      <div style={styles.card}>
        <h3 style={styles.cardH3}>Comisiones, propinas y fees</h3>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.lbl}>% Comisión sobre ventas</label>
            <div style={{ position: 'relative' }}>
              <input type="number" min="0" max="100" step="1" value={settings.commissionPct}
                onChange={e => updateSettings({ ...settings, commissionPct: parseFloat(e.target.value) || 0 })}
                style={{ ...styles.input, paddingRight: 32 }} />
              <span style={{ position: 'absolute', right: 12, top: 11, color: '#94a3b8' }}>%</span>
            </div>
          </div>
          <div>
            <label style={styles.lbl}>% Propinas al groomer</label>
            <div style={{ position: 'relative' }}>
              <input type="number" min="0" max="100" step="1" value={settings.tipsToGroomer}
                onChange={e => updateSettings({ ...settings, tipsToGroomer: parseFloat(e.target.value) || 0 })}
                style={{ ...styles.input, paddingRight: 32 }} />
              <span style={{ position: 'absolute', right: 12, top: 11, color: '#94a3b8' }}>%</span>
            </div>
          </div>
          <div>
            <label style={styles.lbl}>Fee tarjeta crédito</label>
            <div style={{ position: 'relative' }}>
              <input type="number" min="0" max="100" step="0.1" value={settings.cardFeePct}
                onChange={e => updateSettings({ ...settings, cardFeePct: parseFloat(e.target.value) || 0 })}
                style={{ ...styles.input, paddingRight: 32 }} />
              <span style={{ position: 'absolute', right: 12, top: 11, color: '#94a3b8' }}>%</span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>Solo se suma cuando pagan con tarjeta</p>
          </div>
          <div>
            <label style={styles.lbl}>Fee de gasolina (por servicio)</label>
            <div style={{ position: 'relative' }}>
              <input type="number" min="0" step="0.50" value={settings.gasFee}
                onChange={e => updateSettings({ ...settings, gasFee: parseFloat(e.target.value) || 0 })}
                style={{ ...styles.input, paddingLeft: 24 }} />
              <span style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }}>$</span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>Se cobra en todos los métodos de pago. Actualizar cuando cambie la gasolina</p>
          </div>
        </div>
      </div>

      {/* PIN admin */}
      <div style={{ ...styles.card, marginTop: 16 }}>
        <h3 style={styles.cardH3}>🔒 PIN de administrador</h3>
        <div style={{ maxWidth: 200 }}>
          <label style={styles.lbl}>PIN admin (4 dígitos)</label>
          <input type="text" maxLength="4" value={settings.adminPin}
            onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); updateSettings({ ...settings, adminPin: v }); }}
            style={{ ...styles.input, fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.3em', textAlign: 'center' }}
            placeholder="0000" />
        </div>
      </div>

      {/* Categorías de gastos */}
      <div style={{ ...styles.card, marginTop: 16 }}>
        <h3 style={styles.cardH3}>⛽ Categorías de gastos</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>Los groomers usan estas categorías al registrar sus gastos</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <div key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 999, fontSize: 13 }}>
              <span style={{ color: '#0f766e', fontWeight: 500 }}>{c}</span>
              {!['Gasolina','Shampoo','Colonias','Materiales','Mantenimiento','Otros'].includes(c) && (
                <button onClick={() => { if (confirm(`¿Eliminar la categoría "${c}"?`)) removeCategory(c); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8', display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            style={{ ...styles.input, flex: 1 }} placeholder="Nueva categoría..." />
          <button onClick={handleAddCategory} style={styles.btnPrimary}><Plus size={15} /> Agregar</button>
        </div>
      </div>

      {/* Vans y PINs */}
      <div style={{ ...styles.card, marginTop: 16 }}>
        <h3 style={styles.cardH3}>Vans, groomers y PINs</h3>
        <div style={styles.vanList}>
          {vans.map(v => {
            const editing = editVan[v.id];
            return (
              <div key={v.id} style={styles.vanRow}>
                {editing ? (
                  <>
                    <input value={editing.name} onChange={e => setEditVan({ ...editVan, [v.id]: { ...editing, name: e.target.value } })}
                      placeholder="Van" style={{ ...styles.input, flex: '0 0 80px' }} />
                    <input value={editing.groomer} onChange={e => setEditVan({ ...editVan, [v.id]: { ...editing, groomer: e.target.value } })}
                      placeholder="Groomer" style={{ ...styles.input, flex: 1, minWidth: 100 }} />
                    <input type="text" maxLength="4" value={editing.pin}
                      onChange={e => setEditVan({ ...editVan, [v.id]: { ...editing, pin: e.target.value.replace(/\D/g, '').slice(0, 4) } })}
                      placeholder="PIN" style={{ ...styles.input, flex: '0 0 80px', fontFamily: 'monospace', letterSpacing: '0.2em', textAlign: 'center' }} />
                    <div style={{ position: 'relative', flex: '0 0 90px' }}>
                      <input type="number" min="0" max="100" step="1" value={editing.commissionPct}
                        onChange={e => setEditVan({ ...editVan, [v.id]: { ...editing, commissionPct: e.target.value } })}
                        style={{ ...styles.input, paddingRight: 24 }} />
                      <span style={{ position: 'absolute', right: 8, top: 11, fontSize: 12, color: '#94a3b8' }}>%</span>
                    </div>
                    <button onClick={() => saveEdit(v.id)} style={styles.iconBtnGreen}><Check size={16} /></button>
                    <button onClick={() => cancelEdit(v.id)} style={styles.iconBtn}><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: '0 0 80px', fontWeight: 600 }}>{v.name}</div>
                    <div style={{ flex: 1, minWidth: 100, color: v.groomer ? '#0f172a' : '#94a3b8' }}>{v.groomer || 'Sin groomer'}</div>
                    <div style={{ flex: '0 0 80px', fontFamily: 'monospace', textAlign: 'center', background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', letterSpacing: '0.15em', color: '#475569' }}>
                      {v.pin || '----'}
                    </div>
                    <div style={{ flex: '0 0 70px', textAlign: 'center', background: '#f0fdfa', padding: '6px 10px', borderRadius: 6, border: '1px solid #ccfbf1', color: '#0f766e', fontWeight: 700, fontSize: 13 }}>
                      {v.commissionPct || 45}%
                    </div>
                    <button onClick={() => startEdit(v)} style={styles.iconBtn}><Edit2 size={15} /></button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zona peligrosa */}
      <div style={{ ...styles.card, marginTop: 16, borderColor: '#fecaca' }}>
        <h3 style={{ ...styles.cardH3, color: '#991b1b' }}>Zona peligrosa</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>Hay {services.length} servicio{services.length === 1 ? '' : 's'} registrado{services.length === 1 ? '' : 's'} en total.</p>
        <button onClick={clearAll} style={styles.btnDanger}><Trash2 size={15} /> Borrar todo el historial</button>
      </div>
    </div>
  );
}

// ===== COMPONENTES UI =====
function SectionTitle({ eyebrow, title, right }) {
  return (
    <div style={styles.sectionTitle}>
      <div>
        {eyebrow && <div style={styles.eyebrow}>{eyebrow}</div>}
        <h2 style={styles.h2}>{title}</h2>
      </div>
      {right}
    </div>
  );
}
function MethodChip({ method }) {
  const s = METHOD_STYLES[method] || METHOD_STYLES['Efectivo'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.text, fontSize: 12, fontWeight: 600 }}>
      <span style={{ ...styles.dot, background: s.dot }} />{method}
    </span>
  );
}
function KpiCard({ label, value, highlight, accent }) {
  return (
    <div style={{ ...styles.kpiCard, ...(highlight ? { background: '#fff' } : {}), ...(accent ? { background: '#0f766e', borderColor: '#0f766e' } : {}) }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: accent ? 'rgba(255,255,255,0.75)' : '#64748b', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, marginTop: 6, color: accent ? '#fff' : '#0f172a', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

// ===== STYLES =====
const styles = {
  loadingScreen: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafaf7' },
  app: { minHeight: '100vh', background: '#fafaf7', fontFamily: 'Manrope, -apple-system, sans-serif', color: '#0f172a' },
  loginScreen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fafaf7', fontFamily: 'Manrope, -apple-system, sans-serif' },
  loginCard: { width: '100%', maxWidth: 480, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 32, boxShadow: '0 20px 50px -20px rgba(15,23,42,0.15)' },
  loginHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 },
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 28px 0' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 },
  brand: { display: 'flex', alignItems: 'center', gap: 14 },
  logoBox: { width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(15,118,110,0.25)' },
  title: { fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#0f172a' },
  subtitle: { margin: '2px 0 0', fontSize: 13, color: '#64748b' },
  userBadgeWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  userBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0fdfa', color: '#0f766e', border: '1px solid #ccfbf1', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  adminBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#0f172a', color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  logoutBtn: { display: 'inline-flex', alignItems: 'center', padding: '7px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#64748b', cursor: 'pointer' },
  nav: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', background: 'transparent', border: 'none', fontSize: 14, fontWeight: 500, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent' },
  tabBtnActive: { color: '#0f766e', borderBottomColor: '#0f766e', fontWeight: 600 },
  main: { padding: '32px 28px 80px', maxWidth: 1280, margin: '0 auto' },
  footer: { textAlign: 'center', padding: '20px', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  sectionTitle: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, gap: 16, flexWrap: 'wrap' },
  eyebrow: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#0f766e', fontWeight: 700, marginBottom: 4 },
  h2: { fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: '-0.02em', color: '#0f172a' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 22 },
  cardH3: { fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, margin: '0 0 14px', color: '#0f172a' },
  selectorRow: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  divider: { height: 1, background: '#e2e8f0', margin: '20px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 },
  lbl: { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontFamily: 'Manrope, sans-serif', background: '#fff', color: '#0f172a' },
  formActions: { marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10 },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSecondary: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnDanger: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, marginLeft: 4, color: '#64748b', borderRadius: 6 },
  iconBtnGreen: { background: '#0f766e', border: 'none', cursor: 'pointer', padding: 6, marginLeft: 4, color: '#fff', borderRadius: 6 },
  miniStats: { display: 'flex', gap: 18 },
  miniLbl: { display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 },
  miniVal: { display: 'block', fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#0f172a' },
  empty: { background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 16, padding: 40, textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 12px', fontSize: 14, color: '#0f172a' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 20 },
  kpiCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 },
  methodGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  methodCell: { padding: '14px 16px', background: '#fafaf7', borderRadius: 10, border: '1px solid #f1f5f9' },
  methodAmount: { fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, marginTop: 8, color: '#0f172a' },
  vanGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 },
  vanCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 },
  vanCardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 14, borderBottom: '1px solid #f1f5f9' },
  vanCardName: { fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#0f172a' },
  vanCardGroomer: { fontSize: 13, color: '#64748b', marginTop: 2 },
  vanMethods: { marginTop: 12 },
  vanMethodRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: 14 },
  dot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },
  vanList: { display: 'flex', flexDirection: 'column', gap: 10 },
  vanRow: { display: 'flex', gap: 10, alignItems: 'center', padding: 10, background: '#fafaf7', borderRadius: 10 },
  suggestionsBox: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, boxShadow: '0 10px 30px -8px rgba(15,23,42,0.18)', zIndex: 50, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' },
  suggestionsHeader: { padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f766e', background: '#f0fdfa', borderBottom: '1px solid #ccfbf1' },
  suggestionItem: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: '#fff', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' },
  vanTilesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 },
  vanTile: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s' },
  vanTileIcon: { width: 44, height: 44, borderRadius: 12, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  vanTileName: { fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#0f172a' },
  vanTileSub: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 },
  loginDivider: { display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0 16px', color: '#cbd5e1', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 },
  adminAccessBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  pinPrompt: { textAlign: 'center', color: '#64748b', fontSize: 14, margin: '0 0 20px' },
  pinDots: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 },
  pinDot: { width: 46, height: 54, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fafaf7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#0f172a' },
  pinDotFilled: { border: '1.5px solid #0f766e', background: '#f0fdfa' },
  pinDotError: { border: '1.5px solid #dc2626', background: '#fef2f2' },
  pinError: { textAlign: 'center', color: '#dc2626', fontSize: 13, fontWeight: 600, margin: '0 0 16px' },
  pinPad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxWidth: 280, margin: '0 auto' },
  pinBtn: { height: 60, background: '#fafaf7', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 22, fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pinBackBtn: { display: 'block', margin: '20px auto 0', background: 'transparent', border: 'none', fontSize: 13, color: '#64748b', fontWeight: 600, cursor: 'pointer', padding: 8 },
};
