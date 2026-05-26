import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Download, FileText, Settings as SettingsIcon, TrendingUp, Loader2, Edit2, X, Check, Truck, Sparkles, Lock, LogOut, Eye, EyeOff, DollarSign, AlertTriangle, MapPin } from 'lucide-react';
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

// ===== RAZAS POPULARES =====
const DOG_BREEDS = [
  'Affenpinscher','Afghan Hound','Airedale Terrier','Akita','Alaskan Malamute',
  'American Bulldog','American Eskimo Dog','American Staffordshire Terrier',
  'Australian Shepherd','Basenji','Basset Hound','Beagle','Bichon Frise',
  'Border Collie','Boston Terrier','Boxer','Bulldog','Bullmastiff',
  'Cairn Terrier','Cavalier King Charles Spaniel','Chihuahua','Chow Chow',
  'Cocker Spaniel','Dachshund','Dalmatian','Doberman Pinscher',
  'English Springer Spaniel','French Bulldog','German Shepherd',
  'German Shorthaired Pointer','Golden Retriever','Great Dane','Greyhound',
  'Havanese','Irish Setter','Jack Russell Terrier','Labrador Retriever',
  'Lhasa Apso','Maltese','Miniature Pinscher','Miniature Schnauzer',
  'Newfoundland','Pekingese','Pembroke Welsh Corgi','Pit Bull','Pointer',
  'Pomeranian','Poodle (Miniature)','Poodle (Standard)','Poodle (Toy)',
  'Portuguese Water Dog','Pug','Rottweiler','Saint Bernard',
  'Samoyed','Schnauzer','Shetland Sheepdog','Shih Tzu','Siberian Husky',
  'Staffordshire Bull Terrier','Vizsla','Weimaraner','West Highland White Terrier',
  'Whippet','Yorkshire Terrier','Goldendoodle','Labradoodle','Cockapoo',
  'Maltipoo','Morkie','Pomsky','Schnoodle','Sheepadoodle','Teddy Bear',
  'Bernedoodle','Aussiedoodle','Cavapoo','Belgian Malinois','Doberman',
  'Abyssinian','Persian','Siamese','Mixed Breed','Mestizo',
];

// ===== PRECIO AUTOMÁTICO POR PESO =====
const getSizeByWeight = (weight) => {
  const w = parseFloat(weight) || 0;
  if (w <= 0) return '';
  if (w <= 20) return 'Small (1-20 lbs)';
  if (w <= 40) return 'Medium (21-40 lbs)';
  if (w <= 60) return 'Large (41-60 lbs)';
  if (w <= 80) return 'Big (61-80 lbs)';
  if (w <= 100) return 'Extra Large (81-100 lbs)';
  if (w <= 120) return 'Giant (100-120 lbs)';
  return 'Extra Giant (+120 lbs)';
};

const getAutoPrice = (servicePrices, category, size, hairType) => {
  if (!servicePrices || !category || !size || !hairType) return null;
  return servicePrices.find(p =>
    p.category === category &&
    p.size === size &&
    p.hair_type === hairType
  ) || null;
};

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
const saveSessionLocal = (s) => { try { if (s === null) localStorage.removeItem('gv:session'); else localStorage.setItem('gv:session', JSON.stringify(s)); } catch(e) { console.error(e); } };

const loadUsers = async () => {
  const { data, error } = await supabase.from('users').select('*').order('role').order('name');
  if (error) { console.error(error); return []; }
  return data || [];
};

const saveUser = async (user) => {
  const { error } = await supabase.from('users').upsert({
    id: user.id, name: user.name, role: user.role, pin: user.pin,
    van_id: user.van_id || null, active: user.active !== false,
    can_create_clients: user.can_create_clients ?? true,
    can_view_clients: user.can_view_clients ?? false,
    can_schedule: user.can_schedule ?? true,
    can_view_all_schedule: user.can_view_all_schedule ?? false,
    can_view_finances: user.can_view_finances ?? false,
    can_view_reports: user.can_view_reports ?? false,
    can_edit_config: user.can_edit_config ?? false,
  });
  if (error) console.error(error);
  return !error;
};

const deactivateUser = async (id) => {
  const { error } = await supabase.from('users').update({ active: false }).eq('id', id);
  if (error) console.error(error);
};

const saveAuditLog = async (session, action, description, entity = null, entityId = null) => {
  if (!session) return;
  try {
    await supabase.from('audit_log').insert({
      id: uid(), user_id: session.userId, user_name: session.userName,
      user_role: session.role, action, entity, entity_id: entityId, description,
    });
  } catch(e) { console.error('Audit log error:', e); }
};

// ===== CLIENTES =====
const loadClients = async () => {
  const { data, error } = await supabase.from('clients').select('*').eq('active', true).order('name');
  if (error) { console.error(error); return []; }
  return data || [];
};

const loadServicePrices = async () => {
  const { data, error } = await supabase.from('service_prices').select('*').eq('active', true).order('sort_order');
  if (error) { console.error(error); return []; }
  return data || [];
};

const saveServicePrice = async (price) => {
  const { error } = await supabase.from('service_prices').upsert({
    id: price.id, category: price.category, name: price.name,
    size: price.size || '', hair_type: price.hair_type || '',
    price: price.price, duration_minutes: price.duration_minutes || 60,
    active: price.active !== false, sort_order: price.sort_order || 0,
  });
  if (error) console.error(error);
  return !error;
};
const saveClient = async (client) => {
  const { error } = await supabase.from('clients').upsert({
    id: client.id, name: client.name, phone: client.phone || '',
    email: client.email || '', address: client.address || '',
    notes: client.notes || '', active: client.active !== false,
  });
  if (error) console.error(error);
  return !error;
};

// ===== MASCOTAS =====
const loadPets = async () => {
  const { data, error } = await supabase.from('pets').select('*').order('name');
  if (error) { console.error(error); return []; }
  return data || [];
};
const savePet = async (pet) => {
  const { error } = await supabase.from('pets').upsert({
    id: pet.id, client_id: pet.clientId, name: pet.name, breed: pet.breed || '',
    size: pet.size || '', hair_type: pet.hairType || '', weight: pet.weight || 0,
    color: pet.color || '', age: pet.age || '', allergies: pet.allergies || '',
    medical_notes: pet.medicalNotes || '', behavior_notes: pet.behaviorNotes || '',
    last_blade: pet.lastBlade || '', last_combo: pet.lastCombo || '',
  });
  if (error) console.error(error);
  return !error;
};

// ===== CITAS =====
const loadAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`*, appointment_pets(*, pets(*)), clients(*)`)
    .order('date').order('time_start');
  if (error) { console.error(error); return []; }
  return (data || []).map(a => ({
    id: a.id, date: a.date, timeStart: a.time_start, timeEnd: a.time_end || '',
    vanId: a.van_id, clientId: a.client_id, status: a.status || 'unconfirmed',
    notes: a.notes || '', alertNotes: a.alert_notes || '',
    agreementSigned: a.agreement_signed || false,
    client: a.clients ? { id: a.clients.id, name: a.clients.name, phone: a.clients.phone, address: a.clients.address } : null,
    pets: (a.appointment_pets || []).map(ap => ({
      id: ap.id, petId: ap.pet_id, service: ap.service || '', amount: parseFloat(ap.amount) || 0,
      tip: parseFloat(ap.tip) || 0, cardFee: parseFloat(ap.card_fee) || 0,
      method: ap.method || 'Efectivo', status: ap.status || 'pending',
      checkinTime: ap.checkin_time || '', checkoutTime: ap.checkout_time || '',
      pet: ap.pets ? { id: ap.pets.id, name: ap.pets.name, breed: ap.pets.breed, size: ap.pets.size, lastBlade: ap.pets.last_blade, lastCombo: ap.pets.last_combo } : null,
    })),
    createdAt: new Date(a.created_at).getTime(),
  }));
};
const saveAppointment = async (appt) => {
  const { error } = await supabase.from('appointments').upsert({
    id: appt.id, date: appt.date, time_start: appt.timeStart, time_end: appt.timeEnd || '',
    van_id: appt.vanId, client_id: appt.clientId, status: appt.status || 'unconfirmed',
    notes: appt.notes || '', alert_notes: appt.alertNotes || '',
    agreement_signed: appt.agreementSigned || false,
  });
  if (error) console.error(error);
  return !error;
};
const updateAppointmentStatus = async (id, status) => {
  await supabase.from('appointments').update({ status }).eq('id', id);
};
const saveAppointmentPet = async (ap) => {
  const { error } = await supabase.from('appointment_pets').upsert({
    id: ap.id, appointment_id: ap.appointmentId, pet_id: ap.petId,
    service: ap.service || '', amount: ap.amount || 0, tip: ap.tip || 0,
    card_fee: ap.cardFee || 0, method: ap.method || 'Efectivo',
    status: ap.status || 'pending', checkin_time: ap.checkinTime || '',
    checkout_time: ap.checkoutTime || '',
  });
  if (error) console.error(error);
};

// ===== FICHA DE GROOMING =====
const saveGroomingRecord = async (record) => {
  const { error } = await supabase.from('grooming_records').upsert({
    id: record.id, appointment_id: record.appointmentId, pet_id: record.petId,
    van_id: record.vanId, date: record.date, blade: record.blade || '',
    combo: record.combo || '', head: record.head || '', ears: record.ears || '',
    body: record.body || '', legs: record.legs || '', tail: record.tail || '',
    notes: record.notes || '', health_skin: record.healthSkin || '',
    health_ears: record.healthEars || '', health_nails: record.healthNails || '',
    health_behavior: record.healthBehavior || '',
  });
  if (error) console.error(error);
  return !error;
};
const loadGroomingRecords = async (petId) => {
  const { data, error } = await supabase.from('grooming_records')
    .select('*').eq('pet_id', petId).order('date', { ascending: false }).limit(5);
  if (error) { console.error(error); return []; }
  return data || [];
};

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
    receiptUrl: e.receipt_url || null,
    createdAt: new Date(e.created_at).getTime(),
  }));
};
const uploadReceipt = async (file, expenseId) => {
  try {
    const ext = file.name.split('.').pop();
    const path = `${expenseId}.${ext}`;
    const { error } = await supabase.storage.from('receipts').upload(path, file, { upsert: true });
    if (error) { console.error('Upload error:', error); return null; }
    const { data } = supabase.storage.from('receipts').getPublicUrl(path);
    return data.publicUrl;
  } catch(e) { console.error(e); return null; }
};

const saveExpense = async (expense) => {
  await supabase.from('expenses').upsert({
    id: expense.id, date: expense.date, van_id: expense.vanId,
    category: expense.category, description: expense.description || '',
    amount: expense.amount, receipt_url: expense.receiptUrl || null,
  });
};
const deleteExpense = async (id) => {
  // Borrar foto del storage también
  try { await supabase.storage.from('receipts').remove([`${id}.jpg`, `${id}.jpeg`, `${id}.png`, `${id}.webp`]); } catch(e) {}
  await supabase.from('expenses').delete().eq('id', id);
};

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
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [servicePrices, setServicePrices] = useState([]);

  useEffect(() => {
    (async () => {
      const [v, s, st, ex, cats, us, appts, cls, pts, svc] = await Promise.all([
        loadVans(), loadServices(), loadSettings(), loadExpenses(),
        loadCategories(), loadUsers(), loadAppointments(), loadClients(), loadPets(),
        loadServicePrices()
      ]);
      setVans(v); setServices(s); setSettings(st); setExpenses(ex);
      setCategories(cats); setUsers(us); setAppointments(appts);
      setClients(cls); setPets(pts); setServicePrices(svc);
      setSession(loadSession());
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) saveSessionLocal(session); }, [session, loading]);

  useEffect(() => {
    if (loading || !session) return;
    const interval = setInterval(async () => {
      const [freshS, freshE] = await Promise.all([loadServices(), loadExpenses()]);
      setServices(freshS); setExpenses(freshE);
    }, 15000);
    return () => clearInterval(interval);
  }, [loading, session]);

  useEffect(() => {
    if (!session) return;
    if (session.role === 'groomer') setTab('registro');
    if (session.role === 'admin' || session.role === 'manager') setTab('registro');
  }, [session?.role]);

  const updateVans = async (newVans) => { setVans(newVans); for (const v of newVans) await saveVan(v); };
  const addService = async (service) => { setServices(prev => [service, ...prev]); await saveService(service); };
  const updateService = async (service) => { setServices(prev => prev.map(s => s.id === service.id ? service : s)); await saveService(service); };
  const removeService = async (id) => { setServices(prev => prev.filter(s => s.id !== id)); await deleteService(id); };
  const clearServices = async () => { setServices([]); await clearAllServices(); };
  const updateSettings = async (newSettings) => { setSettings(newSettings); await saveSettings(newSettings); };
  const addExpense = async (expense, receiptFile = null) => {
    const newExp = { ...expense, receiptUrl: null };
    setExpenses(prev => [newExp, ...prev]);
    if (receiptFile) {
      const url = await uploadReceipt(receiptFile, expense.id);
      newExp.receiptUrl = url;
    }
    await saveExpense(newExp);
    if (receiptFile) setExpenses(prev => prev.map(e => e.id === expense.id ? { ...e, receiptUrl: newExp.receiptUrl } : e));
  };
  const removeExpense = async (id) => { setExpenses(prev => prev.filter(e => e.id !== id)); await deleteExpense(id); };
  const addCategory = async (name) => { setCategories(prev => [...prev, name].sort()); await saveCategory(name); };
  const removeCategory = async (name) => { setCategories(prev => prev.filter(c => c !== name)); await deleteCategoryDB(name); };

  const addUser = async (user) => {
    const ok = await saveUser(user);
    if (ok) setUsers(prev => [...prev, user].sort((a,b) => a.role.localeCompare(b.role)));
    return ok;
  };
  const updateUser = async (user) => {
    const ok = await saveUser(user);
    if (ok) setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    return ok;
  };
  const toggleUserActive = async (id, active) => {
    if (!active && !confirm('¿Desactivar este usuario? No podrá entrar al sistema pero su historial se conserva.')) return;
    await supabase.from('users').update({ active }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active } : u));
  };

  // Citas
  const addAppointment = async (appt) => {
    setAppointments(prev => [...prev, appt]);
    await saveAppointment(appt);
  };
  const updateServicePrice = async (price) => {
    setServicePrices(prev => prev.map(p => p.id === price.id ? price : p));
    await saveServicePrice(price);
  };
  const addServicePrice = async (price) => {
    const ok = await saveServicePrice(price);
    if (ok) setServicePrices(prev => [...prev, price].sort((a,b) => a.sort_order - b.sort_order));
    return ok;
  };
  const updateApptStatus = async (id, status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    await updateAppointmentStatus(id, status);
  };
  const deleteAppt = async (id) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    await supabase.from('appointment_pets').delete().eq('appointment_id', id);
    await supabase.from('appointments').delete().eq('id', id);
  };
  const refreshAppointments = async () => {
    const appts = await loadAppointments();
    setAppointments(appts);
  };

  // Clientes
  const addClient = async (client) => {
    const ok = await saveClient(client);
    if (ok) setClients(prev => [...prev, client].sort((a,b) => a.name.localeCompare(b.name)));
    return ok;
  };
  const updateClient = async (client) => {
    const ok = await saveClient(client);
    if (ok) setClients(prev => prev.map(c => c.id === client.id ? client : c));
    return ok;
  };
  const removeClient = async (id) => {
    const client = clients.find(c => c.id === id);
    const clientAppts = appointments.filter(a => a.clientId === id);
    const clientPetsList = pets.filter(p => p.client_id === id);

    const msg = `⚠️ ¿Borrar a ${client?.name}?\n\nEsto eliminará permanentemente:\n• ${clientPetsList.length} mascota(s)\n• ${clientAppts.length} cita(s)\n• Todas las fichas de grooming\n\nNo se puede deshacer.`;
    if (!confirm(msg)) return;

    // Borrar estado local
    setClients(prev => prev.filter(c => c.id !== id));
    setPets(prev => prev.filter(p => p.client_id !== id));
    setAppointments(prev => prev.filter(a => a.clientId !== id));

    // Borrar en Supabase en cascada
    for (const appt of clientAppts) {
      await supabase.from('grooming_records').delete().eq('appointment_id', appt.id);
      await supabase.from('appointment_pets').delete().eq('appointment_id', appt.id);
    }
    await supabase.from('appointments').delete().eq('client_id', id);
    await supabase.from('pets').delete().eq('client_id', id);
    await supabase.from('clients').delete().eq('id', id);
  };

  // Mascotas
  const addPet = async (pet) => {
    const ok = await savePet(pet);
    if (ok) setPets(prev => [...prev, pet]);
    return ok;
  };
  const updatePet = async (pet) => {
    const ok = await savePet(pet);
    if (ok) setPets(prev => prev.map(p => p.id === pet.id ? pet : p));
    return ok;
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#0f766e' }} />
        <p style={{ marginTop: 12, color: '#475569', fontFamily: 'Manrope, sans-serif' }}>Cargando...</p>
      </div>
    );
  }

  if (!session) return <LoginScreen users={users} vans={vans} onLogin={setSession} loadingUsers={loading} />;

  const isAdmin = session.role === 'admin';
  const isManager = session.role === 'manager';
  const isGroomer = session.role === 'groomer';
  const canViewFinances = session.permissions?.can_view_finances || isAdmin;
  const canViewReports = session.permissions?.can_view_reports || isAdmin;
  const canEditConfig = session.permissions?.can_edit_config || isAdmin;
  const canViewAllSchedule = session.permissions?.can_view_all_schedule || isAdmin;

  const currentVan = isGroomer ? vans.find(v => v.id === session.vanId) : null;
  const visibleServices = canViewAllSchedule ? services : services.filter(s => s.vanId === session.vanId);
  const visibleExpenses = canViewAllSchedule ? expenses : expenses.filter(e => e.vanId === session.vanId);
  const visibleVans = canViewAllSchedule ? vans : (currentVan ? [currentVan] : vans);

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
      <Header tab={tab} setTab={setTab} session={session} currentVan={currentVan}
        canViewFinances={canViewFinances} canViewReports={canViewReports} canEditConfig={canEditConfig}
        onLogout={() => setSession(null)} />
      <main style={styles.main}>
        {tab === 'citas' && (
          <CitasTab
            appointments={appointments} vans={visibleVans} clients={clients} pets={pets}
            session={session} settings={settings} isAdmin={isAdmin || session?.role === 'manager'}
            canViewAllSchedule={canViewAllSchedule} updateApptStatus={updateApptStatus}
            addAppointment={addAppointment} addClient={addClient} addPet={addPet}
            refreshAppointments={refreshAppointments} deleteAppt={deleteAppt}
            servicePrices={servicePrices}
          />
        )}
        {tab === 'clientes' && (
          <ClientesTab
            clients={clients} pets={pets} appointments={appointments}
            session={session} isAdmin={isAdmin || session?.role === 'manager'}
            addClient={addClient} updateClient={updateClient} removeClient={removeClient}
            addPet={addPet} updatePet={updatePet}
            servicePrices={servicePrices} addAppointment={addAppointment} vans={visibleVans}
            settings={settings} refreshAppointments={refreshAppointments}
          />
        )}
        {tab === 'razas' && <RazasTab session={session} />}
        {tab === 'registro' && (
          <RegistroTab
            vans={visibleVans} services={visibleServices} addService={addService}
            updateService={updateService} removeService={removeService}
            fixedVanId={isGroomer ? session.vanId : null} settings={settings}
            expenses={visibleExpenses} addExpense={addExpense} removeExpense={removeExpense}
            categories={categories}
          />
        )}
        {tab === 'cierre' && <CierreTab vans={visibleVans} services={visibleServices} expenses={visibleExpenses} isAdmin={canViewAllSchedule} settings={settings} />}
        {tab === 'semana' && canViewReports && <SemanaTab vans={vans} services={services} expenses={expenses} settings={settings} />}
        {tab === 'config' && canEditConfig && (
          <ConfigTab vans={vans} updateVans={updateVans} settings={settings} updateSettings={updateSettings}
            services={services} clearServices={clearServices} categories={categories}
            addCategory={addCategory} removeCategory={removeCategory} expenses={expenses}
            users={users} addUser={addUser} updateUser={updateUser} toggleUserActive={toggleUserActive}
            servicePrices={servicePrices} updateServicePrice={updateServicePrice} addServicePrice={addServicePrice} />
        )}
        {tab === 'auditoria' && isAdmin && <AuditoriaTab />}
      </main>
      <footer style={styles.footer}><Sparkles size={12} /> El Pet Wash · Cierre Diario</footer>
    </div>
  );
}

// ===== LOGIN =====
function LoginScreen({ users, vans, onLogin, loadingUsers }) {
  const [step, setStep] = useState('select');
  const [selectedUser, setSelectedUser] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const admins = users.filter(u => u.role === 'admin');
  const managers = users.filter(u => u.role === 'manager');
  const groomers = users.filter(u => u.role === 'groomer');

  const handleSelect = (user) => {
    setSelectedUser(user); setStep('pin'); setPinInput(''); setError(false);
  };

  const handleDigit = (d) => {
    if (pinInput.length >= 4) return;
    const newPin = pinInput + d;
    setPinInput(newPin); setError(false);
    if (newPin.length === 4) setTimeout(() => tryLogin(newPin), 150);
  };

  const handleDelete = () => { setPinInput(pinInput.slice(0, -1)); setError(false); };

  const tryLogin = (pin) => {
    if (pin === selectedUser.pin) {
      onLogin({
        userId: selectedUser.id,
        userName: selectedUser.name,
        role: selectedUser.role,
        vanId: selectedUser.van_id,
        permissions: {
          can_create_clients: selectedUser.can_create_clients,
          can_view_clients: selectedUser.can_view_clients,
          can_schedule: selectedUser.can_schedule,
          can_view_all_schedule: selectedUser.can_view_all_schedule,
          can_view_finances: selectedUser.can_view_finances,
          can_view_reports: selectedUser.can_view_reports,
          can_edit_config: selectedUser.can_edit_config,
        }
      });
    } else {
      setError(true);
      setTimeout(() => { setPinInput(''); setError(false); }, 600);
    }
  };

  const getRoleLabel = (role) => ({ admin: 'Administrador', manager: 'Administradora', groomer: 'Groomer' }[role] || role);
  const getRoleColor = (role) => ({ admin: '#0f172a', manager: '#7c3aed', groomer: '#0f766e' }[role] || '#64748b');
  const getRoleIcon = (role) => ({ admin: '👑', manager: '📋', groomer: '🚐' }[role] || '👤');

  return (
    <div style={styles.loginScreen}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; } body { margin: 0; } button { font-family: 'Manrope', sans-serif; }
        .pin-btn:hover { background: #f0fdfa !important; border-color: #0f766e !important; color: #0f766e !important; }
        .pin-btn:active { transform: scale(0.94); }
        .user-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(0,0,0,0.15) !important; }
      `}</style>
      <div style={{ ...styles.loginCard, maxWidth: step === 'select' ? 560 : 400 }}>
        <div style={styles.loginHeader}>
          <div style={styles.logoBox}><Truck size={20} color="#fff" /></div>
          <div>
            <h1 style={styles.title}>El Pet Wash</h1>
            <p style={styles.subtitle}>{step === 'select' ? 'Selecciona tu usuario' : `Hola, ${selectedUser?.name}`}</p>
          </div>
        </div>

        {step === 'select' ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Admin */}
            {admins.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Administración</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {admins.map(u => (
                    <button key={u.id} onClick={() => handleSelect(u)} className="user-tile"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👑</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Acceso total al sistema</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Administradoras */}
            {managers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Administradoras</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {managers.map(u => (
                    <button key={u.id} onClick={() => handleSelect(u)} className="user-tile"
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Administradora</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Groomers */}
            {groomers.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Groomers</div>
                <div style={styles.vanTilesGrid}>
                  {groomers.map(u => (
                    <button key={u.id} onClick={() => handleSelect(u)} className="user-tile"
                      style={{ ...styles.vanTile }}>
                      <div style={{ ...styles.vanTileIcon }}><Truck size={20} color="#0f766e" /></div>
                      <div style={styles.vanTileName}>{u.name}</div>
                      <div style={styles.vanTileSub}>{vans.find ? (vans.find(v => v.id === u.van_id)?.name || 'Groomer') : 'Groomer'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {users.length === 0 && !loadingUsers && (
              // Fallback con vans si Supabase no carga los usuarios
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Groomers</div>
                <div style={styles.vanTilesGrid}>
                  {vans.map(v => (
                    <button key={v.id} onClick={() => handleSelect({
                      id: v.id, name: v.groomer || v.name, role: 'groomer', pin: v.pin, van_id: v.id,
                      can_create_clients: true, can_view_clients: false, can_schedule: true,
                      can_view_all_schedule: false, can_view_finances: false, can_view_reports: false, can_edit_config: false,
                    })} className="user-tile" style={styles.vanTile}>
                      <div style={styles.vanTileIcon}><Truck size={20} color="#0f766e" /></div>
                      <div style={styles.vanTileName}>{v.groomer || v.name}</div>
                      <div style={styles.vanTileSub}>{v.name}</div>
                    </button>
                  ))}
                </div>
                <div style={styles.loginDivider}><span>o</span></div>
                <button onClick={() => handleSelect({
                  id: 'admin', name: 'Admin', role: 'admin', pin: '2019', van_id: null,
                  can_create_clients: true, can_view_clients: true, can_schedule: true,
                  can_view_all_schedule: true, can_view_finances: true, can_view_reports: true, can_edit_config: true,
                })} style={styles.adminAccessBtn}><Lock size={15} />Acceso administrador</button>
              </div>
            )}
            {loadingUsers && (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#0f766e', display: 'block', margin: '0 auto 12px' }} />
                Cargando usuarios...
              </div>
            )}
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>{getRoleIcon(selectedUser?.role)}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: getRoleColor(selectedUser?.role) }}>{getRoleLabel(selectedUser?.role)}</div>
            </div>
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
            <button onClick={() => { setStep('select'); setPinInput(''); setError(false); }} style={styles.pinBackBtn}>← Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== HEADER =====
function Header({ tab, setTab, session, currentVan, canViewFinances, canViewReports, canEditConfig, onLogout }) {
  const isAdmin = session?.role === 'admin';
  const isManager = session?.role === 'manager';
  const isGroomer = session?.role === 'groomer';

  const tabs = [
    { id: 'citas', label: 'Mis Citas', icon: Plus, show: true },
    { id: 'clientes', label: 'Clientes', icon: Plus, show: true },
    { id: 'razas', label: 'IA Razas', icon: Sparkles, show: true },
    { id: 'cierre', label: isGroomer ? 'Mi Cierre' : 'Cierre Diario', icon: FileText, show: true },
    { id: 'semana', label: 'Reporte Semanal', icon: TrendingUp, show: canViewReports },
    { id: 'auditoria', label: 'Auditoría', icon: FileText, show: isAdmin },
    { id: 'config', label: 'Configuración', icon: SettingsIcon, show: canEditConfig },
  ].filter(t => t.show);

  const roleColors = { admin: '#0f172a', manager: '#7c3aed', groomer: '#0f766e' };
  const roleLabels = { admin: 'Administrador', manager: 'Administradora', groomer: 'Groomer' };
  const roleIcons = { admin: '👑', manager: '📋', groomer: '🚐' };

  return (
    <header style={styles.header}>
      <div style={styles.headerTop}>
        <div style={styles.brand}>
          <div style={styles.logoBox}><Truck size={20} color="#fff" /></div>
          <div>
            <h1 style={styles.title}>El Pet Wash</h1>
            <p style={styles.subtitle}>
              {isGroomer ? `${currentVan?.name} · ${session?.userName}` : roleLabels[session?.role] || ''}
            </p>
          </div>
        </div>
        <div style={styles.userBadgeWrap}>
          <div style={{ ...styles.userBadge, background: roleColors[session?.role] + '15', color: roleColors[session?.role], borderColor: roleColors[session?.role] + '30' }}>
            <span>{roleIcons[session?.role]}</span>
            {session?.userName}
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
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

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

  const handleAddExpense = async () => {
    if (!expenseForm.amount) { alert('Ingresa el monto del gasto'); return; }
    setUploadingReceipt(true);
    await addExpense(
      { id: uid(), date, vanId, category: expenseForm.category, description: expenseForm.description.trim(), amount: parseFloat(expenseForm.amount) || 0, createdAt: Date.now() },
      receiptFile
    );
    setExpenseForm({ category: categories[0] || 'Gasolina', description: '', amount: '' });
    setReceiptFile(null);
    setReceiptPreview(null);
    setUploadingReceipt(false);
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
              <div>
                <label style={styles.lbl}>📷 Foto de factura (opcional)</label>
                <input type="file" accept="image/*" capture="environment" onChange={handleReceiptChange}
                  style={{ ...styles.input, padding: '7px 12px', fontSize: 13 }} />
              </div>
            </div>

            {/* Preview de la foto */}
            {receiptPreview && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={receiptPreview} alt="Factura" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0f766e' }}>✅ Foto lista para subir</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{receiptFile?.name}</div>
                  <button onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                    style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
                    Quitar foto
                  </button>
                </div>
              </div>
            )}

            <div style={styles.formActions}>
              <button onClick={handleAddExpense} style={styles.btnDanger} disabled={uploadingReceipt}>
                {uploadingReceipt ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
                {uploadingReceipt ? 'Subiendo...' : 'Registrar gasto'}
              </button>
            </div>
          </div>

          {/* Modal para ver foto */}
          {viewingReceipt && (
            <div onClick={() => setViewingReceipt(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <img src={viewingReceipt} alt="Factura" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: 20, right: 20, color: '#fff', fontSize: 13, fontWeight: 600 }}>Toca para cerrar</div>
            </div>
          )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Miniatura de factura */}
                      {e.receiptUrl ? (
                        <img src={e.receiptUrl} alt="Factura" onClick={() => setViewingReceipt(e.receiptUrl)}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 18 }}>🧾</span>
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.category}</div>
                        {e.description && <div style={{ fontSize: 12, color: '#64748b' }}>{e.description}</div>}
                        {e.receiptUrl && <div style={{ fontSize: 10, color: '#0f766e', fontWeight: 600 }}>📷 Factura adjunta</div>}
                      </div>
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
// ===== CITAS TAB =====
const BLADES = ['#3F','#4F','#5F','#7F','#10','#15','#30','#40','#50'];
const COMBOS = ['#0 (5/8")','#1 (1/2")','#2 (3/8")','#4 (1/4")','#5 (1/8")','#A (3/4")','#C (7/8")','#E (1")'];
const SIZES = ['Small (1-20 lbs)','Medium (21-40 lbs)','Large (41-60 lbs)','Big (61-80 lbs)','Extra Large (81-100 lbs)','Giant (100-120 lbs)','Extra Giant (+120 lbs)'];
const HAIR_TYPES = ['Short Hair','Long Hair'];
const STATUS_LABELS = { unconfirmed: 'Por confirmar', confirmed: 'Confirmada', in_progress: 'En progreso', completed: 'Completada', cancelled: 'Cancelada' };
const STATUS_COLORS = { unconfirmed: { bg: '#FAEEDA', text: '#633806', border: '#BA7517' }, confirmed: { bg: '#EAF3DE', text: '#27500A', border: '#3B6D11' }, in_progress: { bg: '#E6F1FB', text: '#0C447C', border: '#185FA5' }, completed: { bg: '#F1EFE8', text: '#5F5E5A', border: '#888780' }, cancelled: { bg: '#FCEBEB', text: '#791F1F', border: '#A32D2D' } };

function CitasTab({ appointments, vans, clients, pets, session, settings, isAdmin, canViewAllSchedule, updateApptStatus, addAppointment, addClient, addPet, refreshAppointments, deleteAppt, servicePrices }) {
  const [date, setDate] = useState(todayISO());
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showGroomingForm, setShowGroomingForm] = useState(null);
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groomingRecord, setGroomingRecord] = useState({
    headTool: '', headNotes: '',
    earsTool: '', earsNotes: '',
    bodyTool: '', bodyNotes: '',
    legsTool: '', legsNotes: '',
    tailTool: '', tailNotes: '',
    notes: '', healthSkin: 'ok', healthEars: 'ok', healthNails: 'ok', healthBehavior: 'calm'
  });
  const [newApptForm, setNewApptForm] = useState({ clientId: '', vanId: session?.vanId || vans[0]?.id || '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '', petIds: [], serviceId: '', serviceName: '', servicePrice: 0, discountPct: 0, addons: [] });
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', address: '', email: '' });
  const [newPetForm, setNewPetForm] = useState({ name: '', breed: '', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', allergies: '' });
  const [addingPet, setAddingPet] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const [showCobroForm, setShowCobroForm] = useState(null);
  const [cobroForm, setCobroForm] = useState({ method: 'Efectivo', tip: '' });
  const [viewMode, setViewMode] = useState('lista');
  const [selectedRutaVan, setSelectedRutaVan] = useState(null);
  const [filterVanId, setFilterVanId] = useState('todos');

  const isGroomer = session?.role === 'groomer';
  const myVanId = session?.vanId;

  // Colores por van
  const VAN_COLORS = [
    { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', dot: '#3B82F6' },
    { bg: '#F0FDF4', border: '#22C55E', text: '#15803D', dot: '#22C55E' },
    { bg: '#FFF7ED', border: '#F97316', text: '#C2410C', dot: '#F97316' },
    { bg: '#FDF4FF', border: '#A855F7', text: '#7E22CE', dot: '#A855F7' },
    { bg: '#FFF1F2', border: '#F43F5E', text: '#BE123C', dot: '#F43F5E' },
    { bg: '#F0FDFA', border: '#14B8A6', text: '#0F766E', dot: '#14B8A6' },
    { bg: '#FFFBEB', border: '#EAB308', text: '#92400E', dot: '#EAB308' },
  ];

  const getVanColor = (vanId) => {
    const idx = vans.findIndex(v => v.id === vanId);
    return VAN_COLORS[idx % VAN_COLORS.length] || VAN_COLORS[0];
  };

  const dayAppts = useMemo(() => {
    let list = appointments.filter(a => a.date === date);
    if (isGroomer) list = list.filter(a => a.vanId === myVanId);
    else if (filterVanId !== 'todos') list = list.filter(a => a.vanId === filterVanId);
    return list.sort((a,b) => a.timeStart.localeCompare(b.timeStart));
  }, [appointments, date, isGroomer, myVanId, filterVanId]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 8);
    return clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 8);
  }, [clients, clientSearch]);

  const clientPets = useMemo(() => {
    if (!newApptForm.clientId) return [];
    return pets.filter(p => p.client_id === newApptForm.clientId);
  }, [pets, newApptForm.clientId]);

  const handleCheckin = async (apptId) => {
    await updateApptStatus(apptId, 'in_progress');
    await refreshAppointments();
  };

  const handleComplete = (appt) => {
    setShowCobroForm(appt);
    setCobroForm({ method: 'Efectivo', tip: '' });
  };

  const handleConfirmarCobro = async () => {
    if (!showCobroForm) return;
    setSaving(true);
    const appt = showCobroForm;
    const tip = parseFloat(cobroForm.tip) || 0;
    const cardFeePct = settings?.cardFeePct || 5.5;
    const gasFee = settings?.gasFee || 7;
    const method = cobroForm.method;

    // Registrar cada mascota como servicio en el cierre diario
    for (const ap of (appt.pets || [])) {
      const amount = ap.amount || appt.servicePrice || 0;
      const cardFee = method === 'Tarjeta crédito' ? parseFloat(((amount + tip) * cardFeePct / 100).toFixed(2)) : 0;
      await supabase.from('services').insert({
        id: uid(), date: appt.date, van_id: appt.vanId,
        client: appt.client?.name || '', pet: ap.pet?.name || '',
        service: ap.service || appt.serviceName || '',
        method, amount, tip, card_fee: cardFee,
      });
    }

    await updateApptStatus(appt.id, 'completed');
    await refreshAppointments();
    setSaving(false);
    setShowCobroForm(null);
    setSelectedAppt(null);
    alert('✅ Cobro registrado en el Cierre Diario');
  };

  const handleSaveGrooming = async (apptId, petId) => {
    const hasData = groomingRecord.headTool || groomingRecord.bodyTool || groomingRecord.notes;
    if (!hasData) { alert('Completa al menos una área o agrega notas'); return; }
    setSaving(true);

    // Solo guardar como last_blade si es un blade REAL (empieza con #)
    const isRealBlade = (tool) => tool && BLADES.includes(tool);
    const isRealCombo = (tool) => tool && COMBOS.includes(tool);

    const mainBlade = [groomingRecord.bodyTool, groomingRecord.headTool, groomingRecord.legsTool]
      .find(t => isRealBlade(t)) || '';
    const mainCombo = [groomingRecord.bodyTool, groomingRecord.legsTool, groomingRecord.headTool]
      .find(t => isRealCombo(t)) || '';

    // Resumen de herramientas por área para referencia
    const toolSummary = [
      groomingRecord.headTool && `Cabeza: ${groomingRecord.headTool}`,
      groomingRecord.earsTool && `Orejas: ${groomingRecord.earsTool}`,
      groomingRecord.bodyTool && `Cuerpo: ${groomingRecord.bodyTool}`,
      groomingRecord.legsTool && `Patas: ${groomingRecord.legsTool}`,
      groomingRecord.tailTool && `Cola: ${groomingRecord.tailTool}`,
    ].filter(Boolean).join(' · ');

    const record = {
      id: uid(), appointmentId: apptId, petId, vanId: myVanId || vans[0]?.id, date,
      blade: mainBlade, combo: mainCombo,
      head: `${groomingRecord.headTool}${groomingRecord.headNotes ? ' — ' + groomingRecord.headNotes : ''}`,
      ears: `${groomingRecord.earsTool}${groomingRecord.earsNotes ? ' — ' + groomingRecord.earsNotes : ''}`,
      body: `${groomingRecord.bodyTool}${groomingRecord.bodyNotes ? ' — ' + groomingRecord.bodyNotes : ''}`,
      legs: `${groomingRecord.legsTool}${groomingRecord.legsNotes ? ' — ' + groomingRecord.legsNotes : ''}`,
      tail: `${groomingRecord.tailTool}${groomingRecord.tailNotes ? ' — ' + groomingRecord.tailNotes : ''}`,
      notes: groomingRecord.notes,
      healthSkin: groomingRecord.healthSkin, healthEars: groomingRecord.healthEars,
      healthNails: groomingRecord.healthNails, healthBehavior: groomingRecord.healthBehavior,
    };
    await saveGroomingRecord(record);

    // Guardar resumen completo de herramientas en el perfil de la mascota
    if (petId) {
      const updateData = { last_combo: toolSummary };
      if (mainBlade) updateData.last_blade = mainBlade;
      await supabase.from('pets').update(updateData).eq('id', petId);
    }

    setSaving(false);
    setShowGroomingForm(null);
    setGroomingRecord({ headTool: '', headNotes: '', earsTool: '', earsNotes: '', bodyTool: '', bodyNotes: '', legsTool: '', legsNotes: '', tailTool: '', tailNotes: '', notes: '', healthSkin: 'ok', healthEars: 'ok', healthNails: 'ok', healthBehavior: 'calm' });
    alert('✅ Ficha guardada correctamente');
  };

  const handleCreateClient = async () => {
    if (!newClientForm.name.trim()) { alert('Ingresa el nombre del cliente'); return; }
    setSaving(true);
    const client = { id: uid(), ...newClientForm, name: newClientForm.name.trim(), active: true };
    await addClient(client);
    setNewApptForm(f => ({ ...f, clientId: client.id }));
    setShowNewClient(false);
    setNewClientForm({ name: '', phone: '', address: '', email: '' });
    setSaving(false);
  };

  const handleCreateAppt = async () => {
    if (!newApptForm.clientId) { alert('Selecciona un cliente'); return; }
    if (!newApptForm.timeStart) { alert('Ingresa la hora de inicio'); return; }
    setSaving(true);
    const finalPrice = newApptForm.servicePrice > 0 && newApptForm.discountPct > 0
      ? parseFloat((newApptForm.servicePrice * (1 - newApptForm.discountPct / 100)).toFixed(2))
      : newApptForm.servicePrice;
    const appt = {
      id: uid(), date, timeStart: newApptForm.timeStart, timeEnd: newApptForm.timeEnd,
      vanId: newApptForm.vanId, clientId: newApptForm.clientId,
      status: 'unconfirmed', 
      notes: `${newApptForm.serviceName ? `Servicio: ${newApptForm.serviceName}` : ''}${newApptForm.discountPct > 0 ? ` (${newApptForm.discountPct}% desc.)` : ''}${newApptForm.notes ? ` — ${newApptForm.notes}` : ''}`,
      alertNotes: newApptForm.alertNotes,
      agreementSigned: false,
      servicePrice: finalPrice,
      serviceName: newApptForm.serviceName,
      discountPct: newApptForm.discountPct,
      client: clients.find(c => c.id === newApptForm.clientId) || null,
      pets: newApptForm.petIds.map(pid => {
        const p = pets.find(pt => pt.id === pid);
        return { id: uid(), petId: pid, service: newApptForm.serviceName, amount: finalPrice, tip: 0, cardFee: 0, method: 'Efectivo', status: 'pending', checkinTime: '', checkoutTime: '', pet: p ? { id: p.id, name: p.name, breed: p.breed, size: p.size } : null };
      }),
    };
    await addAppointment(appt);
    for (const ap of appt.pets) await saveAppointmentPet({ ...ap, appointmentId: appt.id });
    setSaving(false);
    setShowNewAppt(false);
    setNewApptForm({ clientId: '', vanId: session?.vanId || vans[0]?.id || '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '', petIds: [], serviceId: '', serviceName: '', servicePrice: 0, discountPct: 0, addons: [] });
    setClientSearch('');
  };

  const openMaps = (address) => {
    if (!address) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow={isGroomer ? `Van ${vans.find(v=>v.id===myVanId)?.name || ''} · ${session?.userName}` : 'Agenda'} title={formatDateNice(date)}
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...styles.input, padding: '6px 10px', fontSize: 13 }} />
            {/* Toggle vista */}
            <div style={{ display: 'flex', background: 'var(--color-background-secondary)', borderRadius: 8, padding: 3, gap: 2 }}>
              <button onClick={() => setViewMode('lista')} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'lista' ? 600 : 400, background: viewMode === 'lista' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'lista' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                📋 Lista
              </button>
              <button onClick={() => setViewMode('calendario')} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'calendario' ? 600 : 400, background: viewMode === 'calendario' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'calendario' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                📅 Calendario
              </button>
              <button onClick={() => setViewMode('ruta')} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'ruta' ? 600 : 400, background: viewMode === 'ruta' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'ruta' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                🗺️ Ruta
              </button>
            </div>
            <button onClick={() => setShowNewAppt(true)} style={styles.btnPrimary}><Plus size={15} /> Nueva cita</button>
          </div>
        }
      />

      {/* Filtro de groomer — solo admin */}
      {!isGroomer && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setFilterVanId('todos')}
            style={{ padding: '5px 14px', borderRadius: 999, border: `1.5px solid ${filterVanId === 'todos' ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, background: filterVanId === 'todos' ? 'var(--color-background-info)' : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: filterVanId === 'todos' ? 700 : 400, color: filterVanId === 'todos' ? 'var(--color-text-info)' : 'var(--color-text-secondary)' }}>
            Todos ({appointments.filter(a => a.date === date).length})
          </button>
          {vans.map(v => {
            const color = getVanColor(v.id);
            const count = appointments.filter(a => a.date === date && a.vanId === v.id).length;
            const isSelected = filterVanId === v.id;
            return (
              <button key={v.id} onClick={() => setFilterVanId(v.id)}
                style={{ padding: '5px 14px', borderRadius: 999, border: `1.5px solid ${isSelected ? color.border : 'var(--color-border-tertiary)'}`, background: isSelected ? color.bg : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: isSelected ? 700 : 400, color: isSelected ? color.text : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color.dot }} />
                {v.groomer || v.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ===== VISTA CALENDARIO ===== */}
      {viewMode === 'calendario' && (
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          {/* Leyenda de vans */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {(isGroomer ? vans.filter(v => v.id === myVanId) : vans).map((v, idx) => {
              const color = getVanColor(v.id);
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: color.bg, border: `1px solid ${color.border}`, borderRadius: 999, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color.dot }} />
                  <span style={{ color: color.text, fontWeight: 500 }}>{v.name} — {v.groomer}</span>
                </div>
              );
            })}
          </div>

          {/* Grid del calendario */}
          <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${isGroomer ? 1 : vans.length}, minmax(140px, 1fr))`, gap: 0, border: '1px solid var(--color-border-tertiary)', borderRadius: 12, overflow: 'hidden', minWidth: isGroomer ? 300 : vans.length * 160 }}>

            {/* Header */}
            <div style={{ background: 'var(--color-background-secondary)', borderBottom: '1px solid var(--color-border-tertiary)', padding: '8px 6px', fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>Hora</div>
            {(isGroomer ? vans.filter(v => v.id === myVanId) : vans).map(v => {
              const color = getVanColor(v.id);
              const vanAppts = dayAppts.filter(a => a.vanId === v.id);
              return (
                <div key={v.id} style={{ background: color.bg, borderBottom: `1px solid ${color.border}`, borderLeft: '1px solid var(--color-border-tertiary)', padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: color.text }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: color.text, opacity: 0.8 }}>{v.groomer} · {vanAppts.length} cita{vanAppts.length !== 1 ? 's' : ''}</div>
                </div>
              );
            })}

            {/* Filas por hora */}
            {Array.from({ length: 13 }, (_, i) => i + 7).map(hour => {
              const hourStr = `${hour.toString().padStart(2, '0')}:00`;
              const nextHourStr = `${(hour + 1).toString().padStart(2, '0')}:00`;
              return (
                <React.Fragment key={hour}>
                  {/* Columna de hora */}
                  <div style={{ padding: '8px 6px', fontSize: 11, color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-tertiary)', background: 'var(--color-background-secondary)', textAlign: 'right', minHeight: 60 }}>
                    {hour}:00
                  </div>
                  {/* Columnas por van */}
                  {(isGroomer ? vans.filter(v => v.id === myVanId) : vans).map(v => {
                    const color = getVanColor(v.id);
                    const appts = dayAppts.filter(a => {
                      if (a.vanId !== v.id) return false;
                      const start = a.timeStart || '00:00';
                      return start >= hourStr && start < nextHourStr;
                    });
                    return (
                      <div key={v.id} style={{ borderTop: '1px solid var(--color-border-tertiary)', borderLeft: '1px solid var(--color-border-tertiary)', padding: 4, minHeight: 60, background: 'var(--color-background-primary)', position: 'relative' }}>
                        {appts.map(appt => {
                          const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
                          return (
                            <div key={appt.id} onClick={() => { setSelectedAppt(selectedAppt === appt.id ? null : appt.id); setViewMode('lista'); }}
                              style={{ padding: '4px 6px', borderRadius: 6, background: color.bg, border: `1.5px solid ${color.border}`, marginBottom: 3, cursor: 'pointer', fontSize: 11 }}>
                              <div style={{ fontWeight: 600, color: color.text }}>{appt.timeStart} {appt.client?.name || 'Cliente'}</div>
                              <div style={{ color: color.text, opacity: 0.8 }}>
                                {appt.pets?.map(ap => ap.pet?.name).filter(Boolean).join(', ') || ''}
                              </div>
                              <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 999, background: sc.bg, color: sc.text }}>{STATUS_LABELS[appt.status]}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulario nueva cita */}
      {showNewAppt && (
        <div style={{ ...styles.card, marginBottom: 20, border: '1px solid var(--color-border-info)', background: 'var(--color-background-info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ ...styles.cardH3, margin: 0, color: 'var(--color-text-info)' }}>Nueva cita — {formatDateNice(date)}</h3>
            <button onClick={() => setShowNewAppt(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>

          {/* Buscar cliente */}
          <div style={styles.formGrid}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>Cliente *</label>
              <div style={{ position: 'relative' }}>
                <input value={clientSearch} onChange={e => { setClientSearch(e.target.value); setNewApptForm(f => ({...f, clientId: ''})); }}
                  style={styles.input} placeholder="Buscar cliente por nombre..." />
                {clientSearch && filteredClients.length > 0 && !newApptForm.clientId && (
                  <div style={styles.suggestionsBox}>
                    {filteredClients.map(c => (
                      <button key={c.id} onMouseDown={() => { setNewApptForm(f => ({...f, clientId: c.id, petIds: []})); setClientSearch(c.name); }}
                        className="suggestion-hover" style={styles.suggestionItem}>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{c.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {!newApptForm.clientId && (
                <button onClick={() => setShowNewClient(true)} style={{ ...styles.btnSecondary, marginTop: 6, fontSize: 12, padding: '5px 10px' }}>
                  <Plus size={13} /> Cliente nuevo
                </button>
              )}
              {newApptForm.clientId && (
                <div style={{ marginTop: 6, padding: '6px 10px', background: 'var(--color-background-success)', borderRadius: 6, fontSize: 12, color: 'var(--color-text-success)' }}>
                  ✅ {clients.find(c => c.id === newApptForm.clientId)?.name} — {clients.find(c => c.id === newApptForm.clientId)?.address}
                </div>
              )}
            </div>

            {!isGroomer && (
              <div>
                <label style={styles.lbl}>Van</label>
                <select value={newApptForm.vanId} onChange={e => setNewApptForm(f => ({...f, vanId: e.target.value}))} style={styles.input}>
                  {vans.map(v => <option key={v.id} value={v.id}>{v.name} — {v.groomer}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={styles.lbl}>Hora inicio</label>
              <input type="time" value={newApptForm.timeStart} onChange={e => setNewApptForm(f => ({...f, timeStart: e.target.value}))} style={styles.input} />
            </div>
            <div>
              <label style={styles.lbl}>Hora fin (estimada)</label>
              <input type="time" value={newApptForm.timeEnd} onChange={e => setNewApptForm(f => ({...f, timeEnd: e.target.value}))} style={styles.input} />
            </div>

            {/* Selector de servicio con precio automático */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>Servicio principal</label>
              <select value={newApptForm.serviceId} onChange={e => {
                const svc = (servicePrices || []).find(p => p.id === e.target.value);
                setNewApptForm(f => ({ ...f, serviceId: e.target.value, serviceName: svc?.name || '', servicePrice: svc?.price || 0 }));
              }} style={styles.input}>
                <option value="">Seleccionar servicio...</option>
                {['Signature Bath', 'Full Groom', 'Add-on'].map(cat => (
                  <optgroup key={cat} label={cat}>
                    {(servicePrices || []).filter(p => p.category === cat).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.size ? ` · ${p.size.split('(')[0].trim()}` : ''}{p.hair_type ? ` · ${p.hair_type}` : ''} — ${p.price}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {newApptForm.servicePrice > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.lbl}>Descuento (%)</label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" min="0" max="100" step="5"
                          value={newApptForm.discountPct}
                          onChange={e => setNewApptForm(f => ({...f, discountPct: parseFloat(e.target.value) || 0}))}
                          style={{ ...styles.input, paddingRight: 28 }} placeholder="0" />
                        <span style={{ position: 'absolute', right: 10, top: 11, fontSize: 12, color: '#94a3b8' }}>%</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, padding: '8px 12px', background: 'var(--color-background-success)', borderRadius: 8, border: '0.5px solid var(--color-border-success)' }}>
                      {newApptForm.discountPct > 0 ? (
                        <>
                          <div style={{ fontSize: 11, color: 'var(--color-text-success)', marginBottom: 2 }}>
                            <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>${newApptForm.servicePrice}</span>
                            {' '}-{newApptForm.discountPct}%
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-success)' }}>
                            💰 ${(newApptForm.servicePrice * (1 - newApptForm.discountPct / 100)).toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-success)' }}>
                          💰 ${newApptForm.servicePrice}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>Notas (opcional)</label>
              <input value={newApptForm.notes} onChange={e => setNewApptForm(f => ({...f, notes: e.target.value}))} style={styles.input} placeholder="Instrucciones especiales..." />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>⚠️ Notas de alerta (privado)</label>
              <input value={newApptForm.alertNotes} onChange={e => setNewApptForm(f => ({...f, alertNotes: e.target.value}))} style={styles.input} placeholder="Ej: perro agresivo, cliente difícil..." />
            </div>
          </div>

          {/* Mascotas */}
          {newApptForm.clientId && clientPets.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <label style={styles.lbl}>Mascotas</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {clientPets.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: newApptForm.petIds.includes(p.id) ? 'var(--color-background-success)' : 'var(--color-background-secondary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: 999, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={newApptForm.petIds.includes(p.id)}
                      onChange={e => setNewApptForm(f => ({ ...f, petIds: e.target.checked ? [...f.petIds, p.id] : f.petIds.filter(id => id !== p.id) }))} style={{ display: 'none' }} />
                    🐾 {p.name} ({p.breed || 'sin raza'})
                  </label>
                ))}
              </div>
            </div>
          )}

          {newApptForm.clientId && (
            <button onClick={() => setAddingPet(true)} style={{ ...styles.btnSecondary, marginTop: 10, fontSize: 12, padding: '5px 10px' }}>
              <Plus size={13} /> Agregar mascota nueva
            </button>
          )}

          {addingPet && (
            <div style={{ marginTop: 10, padding: 12, background: 'var(--color-background-secondary)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Nueva mascota</div>
              <div style={styles.formGrid}>
                <div><label style={styles.lbl}>Nombre *</label><input value={newPetForm.name} onChange={e => setNewPetForm(f => ({...f, name: e.target.value}))} style={styles.input} placeholder="Nombre" /></div>
                <div><label style={styles.lbl}>Raza</label><BreedInput value={newPetForm.breed} onChange={v => setNewPetForm(f => ({...f, breed: v}))} /></div>
                <div><label style={styles.lbl}>Tamaño</label><select value={newPetForm.size} onChange={e => setNewPetForm(f => ({...f, size: e.target.value}))} style={styles.input}>{SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={styles.lbl}>Pelo</label><select value={newPetForm.hairType} onChange={e => setNewPetForm(f => ({...f, hairType: e.target.value}))} style={styles.input}>{HAIR_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                <div><label style={styles.lbl}>Alergias</label><input value={newPetForm.allergies} onChange={e => setNewPetForm(f => ({...f, allergies: e.target.value}))} style={styles.input} placeholder="Ninguna" /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={async () => {
                  if (!newPetForm.name.trim()) { alert('Ingresa el nombre'); return; }
                  const pet = { id: uid(), clientId: newApptForm.clientId, client_id: newApptForm.clientId, ...newPetForm, name: newPetForm.name.trim() };
                  await addPet(pet);
                  setNewApptForm(f => ({ ...f, petIds: [...f.petIds, pet.id] }));
                  setAddingPet(false);
                  setNewPetForm({ name: '', breed: '', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', allergies: '' });
                }} style={styles.btnPrimary}><Check size={14} /> Guardar mascota</button>
                <button onClick={() => setAddingPet(false)} style={styles.btnSecondary}><X size={14} /> Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => setShowNewAppt(false)} style={styles.btnSecondary}><X size={15} /> Cancelar</button>
            <button onClick={handleCreateAppt} style={styles.btnPrimary} disabled={saving}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
              {saving ? 'Guardando...' : 'Crear cita'}
            </button>
          </div>
        </div>
      )}

      {/* Formulario cliente nuevo */}
      {showNewClient && (
        <div style={{ ...styles.card, marginBottom: 16, border: '1px solid var(--color-border-warning)' }}>
          <h3 style={{ ...styles.cardH3, color: 'var(--color-text-warning)' }}>Cliente nuevo</h3>
          <div style={styles.formGrid}>
            <div><label style={styles.lbl}>Nombre *</label><input value={newClientForm.name} onChange={e => setNewClientForm(f => ({...f, name: e.target.value}))} style={styles.input} placeholder="Nombre completo" /></div>
            <div><label style={styles.lbl}>Teléfono</label><input value={newClientForm.phone} onChange={e => setNewClientForm(f => ({...f, phone: e.target.value}))} style={styles.input} placeholder="(305) 000-0000" /></div>
            <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Dirección</label><input value={newClientForm.address} onChange={e => setNewClientForm(f => ({...f, address: e.target.value}))} style={styles.input} placeholder="Dirección completa" /></div>
            <div><label style={styles.lbl}>Email</label><input value={newClientForm.email} onChange={e => setNewClientForm(f => ({...f, email: e.target.value}))} style={styles.input} placeholder="email@ejemplo.com" /></div>
          </div>
          {isGroomer && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '8px 0 0' }}>El teléfono y email solo serán visibles para el administrador.</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button onClick={() => setShowNewClient(false)} style={styles.btnSecondary}><X size={14} /> Cancelar</button>
            <button onClick={handleCreateClient} style={styles.btnPrimary} disabled={saving}><Check size={14} /> Crear cliente</button>
          </div>
        </div>
      )}

      {/* Lista de citas */}
      {/* ===== VISTA RUTA ===== */}
      {viewMode === 'ruta' && (
        <div style={{ marginBottom: 20 }}>
          {/* Selector de van para admin */}
          {!isGroomer && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {vans.map(v => {
                const color = getVanColor(v.id);
                const count = dayAppts.filter(a => a.vanId === v.id).length;
                return (
                  <button key={v.id} onClick={() => setSelectedRutaVan(v.id)}
                    style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${selectedRutaVan === v.id ? color.border : 'var(--color-border-tertiary)'}`, background: selectedRutaVan === v.id ? color.bg : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: selectedRutaVan === v.id ? 600 : 400, color: selectedRutaVan === v.id ? color.text : 'var(--color-text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color.dot, display: 'inline-block', marginRight: 6 }} />
                    {v.name} — {v.groomer} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Ruta del día */}
          {(() => {
            const rutaVanId = isGroomer ? myVanId : (selectedRutaVan || vans[0]?.id);
            const rutaAppts = dayAppts.filter(a => a.vanId === rutaVanId).sort((a,b) => a.timeStart.localeCompare(b.timeStart));
            const rutaVan = vans.find(v => v.id === rutaVanId);
            const color = getVanColor(rutaVanId);

            if (rutaAppts.length === 0) return (
              <div style={styles.empty}>
                <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>Sin citas para esta van hoy</p>
              </div>
            );

            // Botón para abrir TODA la ruta en Google Maps
            const allAddresses = rutaAppts.map(a => a.client?.address).filter(Boolean);
            const mapsRouteUrl = allAddresses.length > 0
              ? `https://www.google.com/maps/dir/${allAddresses.map(a => encodeURIComponent(a)).join('/')}`
              : null;

            return (
              <div>
                {/* Header de la ruta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: color.text }}>{rutaVan?.name} — {rutaVan?.groomer}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{rutaAppts.length} cita{rutaAppts.length !== 1 ? 's' : ''} · {formatDateNice(date)}</div>
                  </div>
                  {mapsRouteUrl && (
                    <button onClick={() => window.open(mapsRouteUrl, '_blank')}
                      style={{ ...styles.btnPrimary, background: '#1a73e8', borderColor: '#1a73e8', color: '#fff' }}>
                      <MapPin size={15} /> Abrir ruta completa en Maps
                    </button>
                  )}
                </div>

                {/* Citas en orden de ruta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {rutaAppts.map((appt, idx) => {
                    const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
                    const mapsUrl = appt.client?.address
                      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(appt.client.address)}`
                      : null;
                    return (
                      <div key={appt.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        {/* Número de parada */}
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: color.bg, border: `2px solid ${color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 14, color: color.text }}>
                          {idx + 1}
                        </div>

                        {/* Línea conectora */}
                        <div style={{ flex: 1 }}>
                          <div style={{ ...styles.card, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600 }}>{appt.timeStart}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}</span>
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: sc.bg, color: sc.text }}>{STATUS_LABELS[appt.status]}</span>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{appt.client?.name || 'Sin cliente'}</div>
                                {appt.client?.address && (
                                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                    📍 {appt.client.address}
                                  </div>
                                )}
                                {appt.pets?.length > 0 && (
                                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                    {appt.pets.map(ap => `🐾 ${ap.pet?.name || 'Mascota'} — ${ap.service || ''} $${ap.amount || 0}`).join(' · ')}
                                  </div>
                                )}
                                {appt.alertNotes && (
                                  <div style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 4 }}>⚠️ {appt.alertNotes}</div>
                                )}
                              </div>
                              {mapsUrl && (
                                <button onClick={() => window.open(mapsUrl, '_blank')}
                                  style={{ ...styles.btnSecondary, padding: '6px 10px', fontSize: 12, flexShrink: 0, marginLeft: 8 }}>
                                  <MapPin size={13} /> Maps
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Línea conectora entre paradas */}
                          {idx < rutaAppts.length - 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0 4px 0', marginLeft: -20 }}>
                              <div style={{ width: 2, height: 24, background: color.border, marginLeft: 15, borderRadius: 2 }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumen de la ruta */}
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-background-secondary)', borderRadius: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Resumen del día</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: color.text }}>{rutaAppts.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Citas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: color.text }}>
                        {rutaAppts.reduce((sum, a) => sum + (a.pets?.length || 0), 0)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Mascotas</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-success)' }}>
                        ${rutaAppts.reduce((sum, a) => sum + (a.pets?.reduce((s, ap) => s + (ap.amount || 0), 0) || 0), 0).toFixed(0)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Esperado</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===== VISTA LISTA ===== */}
      {viewMode === 'lista' && (dayAppts.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>Sin citas para este día</p>
          <p style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>Agrega una nueva cita con el botón de arriba</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayAppts.map(appt => {
            const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
            const isOpen = selectedAppt === appt.id;
            return (
              <div key={appt.id} style={{ ...styles.card, borderLeft: `3px solid ${sc.border}`, cursor: 'pointer' }} onClick={() => setSelectedAppt(isOpen ? null : appt.id)}>
                {/* Alerta */}
                {!appt.agreementSigned && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-danger)', background: 'var(--color-background-danger)', padding: '4px 8px', borderRadius: 6, marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={11} /> Agreement no firmado
                  </div>
                )}
                {appt.alertNotes && (
                  <div style={{ fontSize: 11, color: 'var(--color-text-warning)', background: 'var(--color-background-warning)', padding: '4px 8px', borderRadius: 6, marginBottom: 8 }}>
                    ⚠️ {appt.alertNotes}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: sc.bg, color: sc.text }}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {appt.timeStart}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}
                      </span>
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{appt.client?.name || 'Sin cliente'}</div>
                    {!isGroomer && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{appt.client?.address}</div>}
                    {appt.pets?.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {appt.pets.map(ap => (
                          <span key={ap.id} style={{ fontSize: 12, padding: '3px 8px', background: 'var(--color-background-secondary)', borderRadius: 999, color: 'var(--color-text-secondary)' }}>
                            🐾 {ap.pet?.name || 'Mascota'} {ap.pet?.breed ? `(${ap.pet.breed})` : ''} {ap.pet?.size ? `· ${ap.pet.size.split('(')[0].trim()}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {!isGroomer && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>{vans.find(v => v.id === appt.vanId)?.name} — {vans.find(v => v.id === appt.vanId)?.groomer}</div>}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</div>
                </div>

                {/* Detalle expandido */}
                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border-tertiary)' }} onClick={e => e.stopPropagation()}>

                    {/* Acciones principales */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 14 }}>
                      {appt.status === 'unconfirmed' && (
                        <button onClick={() => updateApptStatus(appt.id, 'confirmed')} style={{ ...styles.btnPrimary, justifyContent: 'center' }}>
                          <Check size={14} /> Confirmar
                        </button>
                      )}
                      {(appt.status === 'confirmed' || appt.status === 'unconfirmed') && (
                        <button onClick={() => handleCheckin(appt.id)} style={{ ...styles.btnPrimary, justifyContent: 'center', background: 'var(--color-background-success)', color: 'var(--color-text-success)', borderColor: 'var(--color-border-success)' }}>
                          <Plus size={14} /> Check in
                        </button>
                      )}
                      {appt.status === 'in_progress' && (
                        <button onClick={() => handleComplete(appt)} style={{ ...styles.btnPrimary, justifyContent: 'center' }}>
                          <DollarSign size={14} /> Completar y cobrar
                        </button>
                      )}
                      {appt.client?.address && (
                        <button onClick={() => openMaps(appt.client.address)} style={{ ...styles.btnSecondary, justifyContent: 'center' }}>
                          <MapPin size={14} /> Google Maps
                        </button>
                      )}
                      {appt.status !== 'cancelled' && isAdmin && (
                        <button onClick={() => { if (confirm('¿Cancelar esta cita?')) updateApptStatus(appt.id, 'cancelled'); }}
                          style={{ ...styles.btnDanger, justifyContent: 'center' }}>
                          <X size={14} /> Cancelar
                        </button>
                      )}
                      {appt.status === 'cancelled' && isAdmin && (
                        <button onClick={() => { if (confirm('¿Borrar esta cita permanentemente? No se puede deshacer.')) deleteAppt(appt.id); }}
                          style={{ ...styles.btnDanger, justifyContent: 'center', background: 'var(--color-background-danger)' }}>
                          <Trash2 size={14} /> Borrar
                        </button>
                      )}
                    </div>

                    {/* Ficha de grooming y servicio por mascota */}
                    <div>
                      <div style={styles.lbl}>Mascotas y servicios</div>
                      {appt.pets?.length > 0 ? (
                        appt.pets.map(ap => (
                          <div key={ap.id} style={{ marginTop: 8, padding: '12px 14px', background: 'var(--color-background-secondary)', borderRadius: 10, border: '1px solid var(--color-border-tertiary)' }}>
                            {/* Header mascota */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>🐾 {ap.pet?.name || 'Mascota'}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                                  {[ap.pet?.breed, ap.pet?.size?.split('(')[0]?.trim()].filter(Boolean).join(' · ')}
                                </div>
                              </div>
                              <button onClick={() => { setShowGroomingForm({ ...ap, appointmentId: appt.id }); if (ap.pet?.last_blade) setGroomingRecord(r => ({...r, blade: ap.pet.last_blade || '', combo: ap.pet.last_combo || ''})); }}
                                style={{ ...styles.btnPrimary, padding: '6px 12px', fontSize: 12 }}>
                                <Edit2 size={12} /> Llenar ficha
                              </button>
                            </div>

                            {/* Checklist de tareas — vista groomer */}
                            {!isAdmin && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                                  Lo que debes hacer hoy:
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  {/* Servicio principal */}
                                  {ap.service && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1.5px solid var(--color-border-info)' }}>
                                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--color-border-info)', background: 'var(--color-background-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 10, color: 'var(--color-text-info)', fontWeight: 700 }}>1</span>
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-info)' }}>{ap.service}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Servicio principal</div>
                                      </div>
                                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-success)' }}>${ap.amount || 0}</span>
                                    </div>
                                  )}

                                  {/* Último corte como referencia */}
                                  {(ap.pet?.lastBlade || ap.pet?.lastCombo) && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', background: '#fff', borderRadius: 8, border: '1px solid var(--color-border-tertiary)' }}>
                                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, marginTop: 1 }}>✂️</div>
                                      <div>
                                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Referencia último corte</div>
                                        {ap.pet?.lastBlade && (
                                          <div style={{ fontSize: 12, color: 'var(--color-text-info)', fontWeight: 600 }}>
                                            Blade principal: {ap.pet.lastBlade}
                                          </div>
                                        )}
                                        {ap.pet?.lastCombo && (
                                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                            {ap.pet.lastCombo}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Alergias — importante */}
                                  {ap.pet?.allergies && ap.pet.allergies !== 'ninguna' && ap.pet.allergies !== 'Ninguna' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#fff5f5', borderRadius: 8, border: '1.5px solid #fca5a5' }}>
                                      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                                      <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>Alergias</div>
                                        <div style={{ fontSize: 11, color: '#7f1d1d' }}>{ap.pet.allergies}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Notas de comportamiento */}
                                  {ap.pet?.behavior_notes && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fcd34d' }}>
                                      <span style={{ fontSize: 16, flexShrink: 0 }}>🔔</span>
                                      <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Comportamiento</div>
                                        <div style={{ fontSize: 11, color: '#78350f' }}>{ap.pet.behavior_notes}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Sin servicio asignado */}
                                  {!ap.service && (
                                    <div style={{ padding: '8px 10px', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa', fontSize: 12, color: '#c2410c' }}>
                                      ⚠️ Sin servicio asignado — contacta al administrador
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Vista admin — editable */}
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <select defaultValue={ap.service}
                                  onChange={async e => {
                                    const svc = (servicePrices || []).find(p => `${p.name} ${p.size} ${p.hair_type}`.trim() === e.target.value || p.name === e.target.value);
                                    const newService = e.target.value;
                                    const newAmount = svc?.price || ap.amount;
                                    await supabase.from('appointment_pets').update({ service: newService, amount: newAmount }).eq('id', ap.id);
                                    await refreshAppointments();
                                  }}
                                  style={{ ...styles.input, fontSize: 12, flex: 1, minWidth: 180 }}>
                                  <option value={ap.service || ''}>{ap.service || 'Sin servicio'}</option>
                                  {['Signature Bath','Full Groom','Add-on'].map(cat => (
                                    <optgroup key={cat} label={cat}>
                                      {(servicePrices || []).filter(p => p.category === cat).map(p => (
                                        <option key={p.id} value={`${p.name}${p.size ? ' · ' + p.size.split('(')[0].trim() : ''}${p.hair_type ? ' · ' + p.hair_type : ''}`}>
                                          {p.name}{p.size ? ` · ${p.size.split('(')[0].trim()}` : ''}{p.hair_type ? ` · ${p.hair_type}` : ''} — ${p.price}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-success)', flexShrink: 0 }}>💰 ${ap.amount || 0}</span>
                              </div>
                            )}

                            {/* Último corte — admin */}
                            {isAdmin && ap.pet?.lastBlade && (
                              <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 6 }}>
                                ✂️ Último corte: Blade {ap.pet.lastBlade} {ap.pet.lastCombo ? `· Combo ${ap.pet.lastCombo}` : ''}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--color-background-secondary)', borderRadius: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>🐾 Sin mascota asignada</span>
                            <button onClick={() => setShowGroomingForm({ id: uid(), appointmentId: appt.id, petId: null, pet: null })}
                              style={{ ...styles.btnPrimary, padding: '5px 10px', fontSize: 12 }}>
                              <Edit2 size={12} /> Llenar ficha
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Servicio y precio */}
                    {(appt.serviceName || appt.servicePrice > 0) && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--color-background-success)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{appt.serviceName || 'Servicio'}</div>
                          {appt.discountPct > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--color-text-success)' }}>🏷️ {appt.discountPct}% descuento aplicado</div>
                          )}
                        </div>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: 'var(--color-text-success)' }}>
                          ${appt.servicePrice}
                        </div>
                      </div>
                    )}
                    {appt.notes && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-secondary)', padding: '6px 10px', background: 'var(--color-background-secondary)', borderRadius: 6 }}>📝 {appt.notes}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Modal de cobro */}
      {showCobroForm && (
        <div onClick={() => setShowCobroForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: 20, padding: 28, maxWidth: 460, width: '100%', boxShadow: '0 25px 80px rgba(0,0,0,0.5)', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cobro del servicio</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '4px 0 0', fontFamily: 'Fraunces, serif' }}>💰 {showCobroForm.client?.name}</h3>
              </div>
              <button onClick={() => setShowCobroForm(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>

            {/* Resumen mascotas */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 18, border: '1px solid #e2e8f0' }}>
              {(showCobroForm.pets || []).length > 0 ? (
                (showCobroForm.pets || []).map((ap, i) => {
                  // Buscar nombre real de la mascota
                  const petName = ap.pet?.name || ap.petName || 'Mascota';
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < (showCobroForm.pets?.length || 0) - 1 ? '1px solid #e2e8f0' : 'none', fontSize: 15 }}>
                      <span style={{ color: '#1e293b', fontWeight: 500 }}>
                        🐾 {petName}
                        {ap.service ? <span style={{ color: '#64748b', fontWeight: 400 }}> — {ap.service}</span> : ''}
                      </span>
                      <span style={{ fontWeight: 700, color: '#0f766e', fontSize: 16 }}>${ap.amount || 0}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 15, color: '#64748b' }}>Sin mascotas registradas</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 6, borderTop: '2px solid #e2e8f0', fontSize: 18, fontWeight: 800 }}>
                <span style={{ color: '#0f172a' }}>TOTAL</span>
                <span style={{ color: '#0f766e', fontFamily: 'Fraunces, serif', fontSize: 22 }}>
                  ${(showCobroForm.pets || []).reduce((sum, ap) => sum + (ap.amount || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Método de pago */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Método de pago</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => setCobroForm(f => ({...f, method: m}))}
                    style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${cobroForm.method === m ? '#0f766e' : '#e2e8f0'}`, background: cobroForm.method === m ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 15, fontWeight: cobroForm.method === m ? 700 : 500, color: cobroForm.method === m ? '#0f766e' : '#475569' }}>
                    {m}
                  </button>
                ))}
              </div>
              {cobroForm.method === 'Tarjeta crédito' && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#fffbeb', borderRadius: 8, fontSize: 13, color: '#92400e', border: '1px solid #fcd34d' }}>
                  ⚠️ Se agrega {settings?.cardFeePct || 5.5}% de fee de tarjeta
                </div>
              )}
            </div>

            {/* Propina */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Propina (opcional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                {[18, 20, 25].map(pct => {
                  const total = (showCobroForm.pets || []).reduce((sum, ap) => sum + (ap.amount || 0), 0);
                  const tipAmt = parseFloat((total * pct / 100).toFixed(2));
                  const isSelected = parseFloat(cobroForm.tip) === tipAmt;
                  return (
                    <button key={pct} onClick={() => setCobroForm(f => ({...f, tip: tipAmt}))}
                      style={{ padding: '10px 4px', borderRadius: 10, border: `2px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`, background: isSelected ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? '#0f766e' : '#1e293b' }}>{pct}%</div>
                      <div style={{ fontSize: 13, color: isSelected ? '#0f766e' : '#64748b' }}>${tipAmt}</div>
                    </button>
                  );
                })}
                <button onClick={() => setCobroForm(f => ({...f, tip: ''}))}
                  style={{ padding: '10px 4px', borderRadius: 10, border: '2px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>Custom</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Otro</div>
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 13, fontSize: 16, color: '#94a3b8', fontWeight: 600 }}>$</span>
                <input type="number" step="1" min="0" value={cobroForm.tip}
                  onChange={e => setCobroForm(f => ({...f, tip: e.target.value}))}
                  style={{ width: '100%', padding: '12px 16px 12px 32px', border: '2px solid #e2e8f0', borderRadius: 10, fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  placeholder="0.00" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCobroForm(null)}
                style={{ flex: 1, padding: '14px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#475569' }}>
                ✕ Cancelar
              </button>
              <button onClick={handleConfirmarCobro}
                style={{ flex: 2, padding: '14px', borderRadius: 12, border: 'none', background: '#0f766e', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={saving}>
                {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : '✓'}
                {saving ? 'Registrando...' : 'Confirmar cobro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ficha de grooming */}
      {showGroomingForm && (
        <div style={{ position: 'relative', marginTop: 20 }}>
          <div style={{ ...styles.card, border: '1px solid var(--color-border-info)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ ...styles.cardH3, margin: 0 }}>Ficha de grooming — 🐾 {showGroomingForm.pet?.name}</h3>
              <button onClick={() => setShowGroomingForm(null)} style={styles.iconBtn}><X size={16} /></button>
            </div>

            {/* Último corte */}
            {showGroomingForm.pet?.lastBlade && (
              <div style={{ padding: '8px 12px', background: 'var(--color-background-info)', borderRadius: 8, marginBottom: 14, fontSize: 12, color: 'var(--color-text-info)' }}>
                📋 Último corte: Blade <strong>{showGroomingForm.pet.lastBlade}</strong> {showGroomingForm.pet.lastCombo ? `· Combo ${showGroomingForm.pet.lastCombo}` : ''}
              </div>
            )}

            {/* Áreas del corte con herramienta por área */}
            <div style={{ marginTop: 14 }}>
              <label style={styles.lbl}>Detalles por área</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {[
                  ['head','headTool','headNotes','Cabeza'],
                  ['ears','earsTool','earsNotes','Orejas'],
                  ['body','bodyTool','bodyNotes','Cuerpo'],
                  ['legs','legsTool','legsNotes','Patas'],
                  ['tail','tailTool','tailNotes','Cola'],
                ].map(([, toolKey, notesKey, label]) => (
                  <div key={toolKey} style={{ background: 'var(--color-background-secondary)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>{label}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ ...styles.lbl, fontSize: 10 }}>Herramienta</label>
                        <select value={groomingRecord[toolKey]} onChange={e => setGroomingRecord(r => ({...r, [toolKey]: e.target.value}))} style={{ ...styles.input, fontSize: 12 }}>
                          <option value="">Sin herramienta</option>
                          <optgroup label="Blades">
                            {BLADES.map(b => <option key={b} value={b}>Blade {b}</option>)}
                          </optgroup>
                          <optgroup label="Combos">
                            {COMBOS.map(c => <option key={c} value={c}>Combo {c}</option>)}
                          </optgroup>
                          <option value="Tijeras">✂️ Tijeras</option>
                          <option value="Tijeras curvas">✂️ Tijeras curvas</option>
                          <option value="Navaja">🪒 Navaja</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ ...styles.lbl, fontSize: 10 }}>Notas del área</label>
                        <input value={groomingRecord[notesKey]} onChange={e => setGroomingRecord(r => ({...r, [notesKey]: e.target.value}))}
                          style={{ ...styles.input, fontSize: 12 }} placeholder={`Notas de ${label.toLowerCase()}...`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist de salud */}
            <div style={{ marginTop: 14 }}>
              <label style={styles.lbl}>Checklist de salud</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 6 }}>
                {[['healthSkin','Piel'],['healthEars','Orejas'],['healthNails','Uñas'],['healthBehavior','Comportamiento']].map(([key, label]) => (
                  <div key={key}>
                    <label style={{ ...styles.lbl, marginBottom: 4 }}>{label}</label>
                    <select value={groomingRecord[key]} onChange={e => setGroomingRecord(r => ({...r, [key]: e.target.value}))} style={styles.input}>
                      {key === 'healthBehavior'
                        ? [['calm','Tranquilo'],['nervous','Nervioso'],['aggressive','Agresivo'],['energetic','Energético']].map(([v,l]) => <option key={v} value={v}>{l}</option>)
                        : [['ok','Normal'],['attention','Requiere atención'],['urgent','Urgente — avisar al dueño']].map(([v,l]) => <option key={v} value={v}>{l}</option>)
                      }
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div style={{ marginTop: 14 }}>
              <label style={styles.lbl}>Notas especiales</label>
              <textarea value={groomingRecord.notes} onChange={e => setGroomingRecord(r => ({...r, notes: e.target.value}))}
                style={{ ...styles.input, minHeight: 70, resize: 'vertical' }} placeholder="Instrucciones especiales, observaciones del corte..." />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowGroomingForm(null)} style={styles.btnSecondary}><X size={15} /> Cancelar</button>
              <button onClick={() => handleSaveGrooming(showGroomingForm.appointmentId || selectedAppt, showGroomingForm.petId)} style={styles.btnPrimary} disabled={saving}>
                {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                {saving ? 'Guardando...' : 'Guardar ficha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
function ConfigTab({ vans, updateVans, settings, updateSettings, services, clearServices, categories, addCategory, removeCategory, expenses, users, addUser, updateUser, toggleUserActive, servicePrices, updateServicePrice, addServicePrice }) {
  const [editVan, setEditVan] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // { old, new }
  const [editingUser, setEditingUser] = useState(null);
  const [showNewUser, setShowNewUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPrice, setEditingPrice] = useState({});
  const [showNewService, setShowNewService] = useState(false);
  const [newService, setNewService] = useState({ category: 'Add-on', name: '', size: '', hair_type: '', price: '', duration_minutes: 60 });
  const [newUser, setNewUser] = useState({
    name: '', role: 'groomer', pin: '', van_id: '',
    can_create_clients: true, can_view_clients: false, can_schedule: true,
    can_view_all_schedule: false, can_view_finances: false, can_view_reports: false, can_edit_config: false,
  });

  const handleRenameCategory = async () => {
    if (!editingCategory?.new.trim()) return;
    const oldName = editingCategory.old;
    const newName = editingCategory.new.trim();
    if (newName === oldName) { setEditingCategory(null); return; }
    if (categories.includes(newName)) { alert('Ese nombre ya existe'); return; }
    await saveCategory(newName);
    await deleteCategoryDB(oldName);
    await supabase.from('expenses').update({ category: newName }).eq('category', oldName);
    await addCategory(newName);
    await removeCategory(oldName);
    setEditingCategory(null);
  };

  const categories_prices = servicePrices ? [...new Set(servicePrices.map(p => p.category))] : [];

  const handleSavePrice = async (price) => {
    const newPrice = parseFloat(editingPrice[price.id]);
    if (!isNaN(newPrice)) await updateServicePrice({ ...price, price: newPrice });
    setEditingPrice(prev => { const copy = {...prev}; delete copy[price.id]; return copy; });
  };

  const handleAddService = async () => {
    if (!newService.name.trim() || !newService.price) { alert('Ingresa nombre y precio'); return; }
    const svc = { id: uid(), ...newService, name: newService.name.trim(), price: parseFloat(newService.price) || 0, active: true, sort_order: (servicePrices?.length || 0) + 1 };
    await addServicePrice(svc);
    setShowNewService(false);
    setNewService({ category: 'Add-on', name: '', size: '', hair_type: '', price: '', duration_minutes: 60 });
  };

  const PERMS = [
    { key: 'can_create_clients', label: 'Crear clientes nuevos' },
    { key: 'can_view_clients', label: 'Ver datos del cliente después' },
    { key: 'can_schedule', label: 'Agendar citas' },
    { key: 'can_view_all_schedule', label: 'Ver agenda de todas las vans' },
    { key: 'can_view_finances', label: 'Ver finanzas y comisiones' },
    { key: 'can_view_reports', label: 'Ver reportes semanales' },
    { key: 'can_edit_config', label: 'Editar configuración' },
  ];

  const roleDefaults = {
    groomer: { can_create_clients: true, can_view_clients: false, can_schedule: true, can_view_all_schedule: false, can_view_finances: false, can_view_reports: false, can_edit_config: false },
    manager: { can_create_clients: true, can_view_clients: true, can_schedule: true, can_view_all_schedule: true, can_view_finances: false, can_view_reports: false, can_edit_config: false },
    admin:   { can_create_clients: true, can_view_clients: true, can_schedule: true, can_view_all_schedule: true, can_view_finances: true, can_view_reports: true, can_edit_config: true },
  };

  const handleRoleChange = (role, isNew) => {
    const d = roleDefaults[role] || roleDefaults.groomer;
    if (isNew) setNewUser(p => ({ ...p, role, ...d }));
    else setEditingUser(p => ({ ...p, role, ...d }));
  };

  const handleCreateUser = async () => {
    if (!newUser.name.trim()) { alert('Ingresa el nombre'); return; }
    if (!/^\d{4}$/.test(newUser.pin)) { alert('El PIN debe ser de 4 dígitos'); return; }
    if (newUser.role === 'groomer' && !newUser.van_id) { alert('Selecciona la van del groomer'); return; }
    if (users.filter(u => u.active).find(u => u.pin === newUser.pin)) { alert('Ese PIN ya está en uso'); return; }
    setSaving(true);
    const user = { ...newUser, id: uid(), active: true, name: newUser.name.trim() };
    const ok = await addUser(user);
    setSaving(false);
    if (ok) {
      setShowNewUser(false);
      setNewUser({ name: '', role: 'groomer', pin: '', van_id: '', ...roleDefaults.groomer });
    } else alert('Error al crear el usuario.');
  };

  const handleSaveEdit = async () => {
    if (!editingUser.name.trim()) { alert('Ingresa el nombre'); return; }
    if (!/^\d{4}$/.test(editingUser.pin)) { alert('El PIN debe ser de 4 dígitos'); return; }
    if (users.filter(u => u.active && u.id !== editingUser.id).find(u => u.pin === editingUser.pin)) { alert('Ese PIN ya está en uso'); return; }
    setSaving(true);
    await updateUser({ ...editingUser, name: editingUser.name.trim() });
    setSaving(false);
    setEditingUser(null);
  };

  const roleColors = { admin: '#0f172a', manager: '#7c3aed', groomer: '#0f766e' };
  const roleLabels = { admin: '👑 Admin', manager: '📋 Administradora', groomer: '🚐 Groomer' };
  const activeUsers = users.filter(u => u.active);
  const inactiveUsers = users.filter(u => !u.active);

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

      {/* ===== LISTA DE SERVICIOS Y PRECIOS ===== */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...styles.cardH3, margin: 0 }}>💰 Lista de servicios y precios</h3>
          <button onClick={() => setShowNewService(!showNewService)} style={styles.btnPrimary}>
            <Plus size={15} /> Nuevo servicio
          </button>
        </div>

        {/* Formulario nuevo servicio */}
        {showNewService && (
          <div style={{ padding: 14, background: 'var(--color-background-secondary)', borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Nuevo servicio</div>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.lbl}>Categoría</label>
                <select value={newService.category} onChange={e => setNewService(f => ({...f, category: e.target.value}))} style={styles.input}>
                  <option value="Signature Bath">Signature Bath</option>
                  <option value="Full Groom">Full Groom</option>
                  <option value="Add-on">Add-on</option>
                </select>
              </div>
              <div>
                <label style={styles.lbl}>Nombre del servicio</label>
                <input value={newService.name} onChange={e => setNewService(f => ({...f, name: e.target.value}))} style={styles.input} placeholder="Ej: Baño especial" />
              </div>
              {newService.category !== 'Add-on' && (
                <>
                  <div>
                    <label style={styles.lbl}>Tamaño</label>
                    <select value={newService.size} onChange={e => setNewService(f => ({...f, size: e.target.value}))} style={styles.input}>
                      <option value="">Todos</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={styles.lbl}>Tipo de pelo</label>
                    <select value={newService.hair_type} onChange={e => setNewService(f => ({...f, hair_type: e.target.value}))} style={styles.input}>
                      <option value="">Todos</option>
                      {HAIR_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label style={styles.lbl}>Precio ($)</label>
                <input type="number" step="1" value={newService.price} onChange={e => setNewService(f => ({...f, price: e.target.value}))} style={styles.input} placeholder="0" />
              </div>
              <div>
                <label style={styles.lbl}>Duración (min)</label>
                <input type="number" step="15" value={newService.duration_minutes} onChange={e => setNewService(f => ({...f, duration_minutes: parseInt(e.target.value) || 60}))} style={styles.input} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
              <button onClick={() => setShowNewService(false)} style={styles.btnSecondary}><X size={14} /> Cancelar</button>
              <button onClick={handleAddService} style={styles.btnPrimary}><Check size={14} /> Agregar</button>
            </div>
          </div>
        )}

        {/* Lista de precios por categoría */}
        {categories_prices.map(cat => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingBottom: 4, borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
              {cat}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {(servicePrices || []).filter(p => p.category === cat).map(price => (
                <div key={price.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--color-background-secondary)', borderRadius: 8 }}>
                  <div style={{ flex: 1, fontSize: 13 }}>
                    {price.name}
                    {price.size && <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}> · {price.size.split('(')[0].trim()}</span>}
                    {price.hair_type && <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}> · {price.hair_type}</span>}
                    {/* Peso del tamaño */}
                    {price.size && (
                      <span style={{ marginLeft: 6, fontSize: 11, padding: '1px 6px', background: 'var(--color-background-info)', color: 'var(--color-text-info)', borderRadius: 999 }}>
                        {price.size.match(/\(([^)]+)\)/)?.[1] || ''}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', flexShrink: 0 }}>{price.duration_minutes}min</div>
                  {editingPrice[price.id] !== undefined ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>$</span>
                      <input type="number" step="1" value={editingPrice[price.id]}
                        onChange={e => setEditingPrice(prev => ({...prev, [price.id]: e.target.value}))}
                        style={{ ...styles.input, width: 80, padding: '4px 8px', fontSize: 13 }}
                        onKeyDown={e => { if (e.key === 'Enter') handleSavePrice(price); if (e.key === 'Escape') setEditingPrice(prev => { const c = {...prev}; delete c[price.id]; return c; }); }}
                        autoFocus />
                      <button onClick={() => handleSavePrice(price)} style={styles.iconBtnGreen}><Check size={14} /></button>
                      <button onClick={() => setEditingPrice(prev => { const c = {...prev}; delete c[price.id]; return c; })} style={styles.iconBtn}><X size={14} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>${price.price}</span>
                      <button onClick={() => setEditingPrice(prev => ({...prev, [price.id]: price.price}))} style={styles.iconBtn}><Edit2 size={14} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== USUARIOS ===== */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...styles.cardH3, margin: 0 }}>👥 Usuarios del sistema</h3>
          <button onClick={() => setShowNewUser(!showNewUser)} style={styles.btnPrimary}>
            <Plus size={15} /> Nuevo usuario
          </button>
        </div>

        {/* Formulario nuevo usuario */}
        {showNewUser && (
          <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f766e', marginBottom: 12 }}>Crear nuevo usuario</div>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.lbl}>Nombre *</label>
                <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={styles.input} placeholder="Nombre completo" />
              </div>
              <div>
                <label style={styles.lbl}>Rol *</label>
                <select value={newUser.role} onChange={e => handleRoleChange(e.target.value, true)} style={styles.input}>
                  <option value="groomer">🚐 Groomer</option>
                  <option value="manager">📋 Administradora</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
              <div>
                <label style={styles.lbl}>PIN (4 dígitos) *</label>
                <input type="text" maxLength="4" value={newUser.pin}
                  onChange={e => setNewUser({ ...newUser, pin: e.target.value.replace(/\D/g,'').slice(0,4) })}
                  style={{ ...styles.input, fontFamily: 'monospace', letterSpacing: '0.3em', textAlign: 'center' }} placeholder="0000" />
              </div>
              {newUser.role === 'groomer' && (
                <div>
                  <label style={styles.lbl}>Van asignada *</label>
                  <select value={newUser.van_id} onChange={e => setNewUser({ ...newUser, van_id: e.target.value })} style={styles.input}>
                    <option value="">Seleccionar van...</option>
                    {vans.map(v => <option key={v.id} value={v.id}>{v.name} — {v.groomer || 'Sin groomer'}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={styles.lbl}>Permisos personalizados</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 6 }}>
                {PERMS.map(p => (
                  <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
                    <input type="checkbox" checked={!!newUser[p.key]} onChange={e => setNewUser({ ...newUser, [p.key]: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#0f766e' }} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={() => setShowNewUser(false)} style={styles.btnSecondary}><X size={15} /> Cancelar</button>
              <button onClick={handleCreateUser} style={styles.btnPrimary} disabled={saving}>
                {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                {saving ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        )}

        {/* Lista activos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeUsers.map(u => (
            <div key={u.id}>
              {editingUser?.id === u.id ? (
                <div style={{ background: '#fafaf7', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.lbl}>Nombre</label>
                      <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.lbl}>Rol</label>
                      <select value={editingUser.role} onChange={e => handleRoleChange(e.target.value, false)} style={styles.input} disabled={editingUser.role === 'admin'}>
                        <option value="groomer">🚐 Groomer</option>
                        <option value="manager">📋 Administradora</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.lbl}>PIN</label>
                      <input type="text" maxLength="4" value={editingUser.pin}
                        onChange={e => setEditingUser({ ...editingUser, pin: e.target.value.replace(/\D/g,'').slice(0,4) })}
                        style={{ ...styles.input, fontFamily: 'monospace', letterSpacing: '0.3em', textAlign: 'center' }} />
                    </div>
                    {editingUser.role === 'groomer' && (
                      <div>
                        <label style={styles.lbl}>Van</label>
                        <select value={editingUser.van_id || ''} onChange={e => setEditingUser({ ...editingUser, van_id: e.target.value })} style={styles.input}>
                          <option value="">Sin van</option>
                          {vans.map(v => <option key={v.id} value={v.id}>{v.name} — {v.groomer || 'Sin groomer'}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={styles.lbl}>Permisos</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 6 }}>
                      {PERMS.map(p => (
                        <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
                          <input type="checkbox" checked={!!editingUser[p.key]} onChange={e => setEditingUser({ ...editingUser, [p.key]: e.target.checked })}
                            style={{ width: 16, height: 16, accentColor: '#0f766e' }} />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button onClick={() => setEditingUser(null)} style={styles.btnSecondary}><X size={15} /> Cancelar</button>
                    <button onClick={handleSaveEdit} style={styles.btnPrimary} disabled={saving}>
                      {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fafaf7', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{{ admin:'👑', manager:'📋', groomer:'🚐' }[u.role]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: roleColors[u.role], fontWeight: 500 }}>{roleLabels[u.role]}</div>
                  </div>
                  {u.role === 'groomer' && (
                    <div style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>
                      {vans.find(v => v.id === u.van_id)?.name || '—'}
                    </div>
                  )}
                  <div style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.15em', color: '#475569', background: '#fff', padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    {u.pin}
                  </div>
                  <button onClick={() => setEditingUser({ ...u })} style={styles.iconBtn}><Edit2 size={14} /></button>
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleUserActive(u.id, false)} style={{ ...styles.iconBtn, color: '#dc2626' }} title="Desactivar">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Usuarios inactivos */}
        {inactiveUsers.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Inactivos ({inactiveUsers.length})
            </div>
            {inactiveUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, marginBottom: 6, opacity: 0.6 }}>
                <div style={{ fontSize: 18 }}>{{ admin:'👑', manager:'📋', groomer:'🚐' }[u.role]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, textDecoration: 'line-through', color: '#94a3b8' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{roleLabels[u.role]}</div>
                </div>
                <button onClick={() => toggleUserActive(u.id, true)}
                  style={{ fontSize: 12, padding: '4px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#0f766e', fontWeight: 500 }}>
                  Reactivar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
          {categories.map(c => {
            const expCount = (expenses || []).filter(e => e.category === c).length;
            return editingCategory?.old === c ? (
              <div key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <input value={editingCategory.new} onChange={e => setEditingCategory({ ...editingCategory, new: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') handleRenameCategory(); if (e.key === 'Escape') setEditingCategory(null); }}
                  style={{ ...styles.input, padding: '3px 8px', fontSize: 13, width: 140 }} autoFocus />
                <button onClick={handleRenameCategory} style={styles.iconBtnGreen}><Check size={13} /></button>
                <button onClick={() => setEditingCategory(null)} style={styles.iconBtn}><X size={13} /></button>
              </div>
            ) : (
              <div key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 999, fontSize: 13 }}>
                <span style={{ color: '#0f766e', fontWeight: 500 }}>{c}</span>
                {expCount > 0 && (
                  <span style={{ fontSize: 10, background: 'var(--color-background-info)', color: 'var(--color-text-info)', padding: '1px 5px', borderRadius: 999 }}>{expCount}</span>
                )}
                <button onClick={() => setEditingCategory({ old: c, new: c })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: '#94a3b8', display: 'flex' }}>
                  <Edit2 size={11} />
                </button>
                <button onClick={() => {
                  if (expCount > 0) {
                    alert(`No se puede eliminar "${c}" porque tiene ${expCount} gasto${expCount !== 1 ? 's' : ''} registrado${expCount !== 1 ? 's' : ''}. Primero renómbrala si quieres cambiarla.`);
                    return;
                  }
                  if (confirm(`¿Eliminar la categoría "${c}"?`)) removeCategory(c);
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: expCount > 0 ? '#e2e8f0' : '#94a3b8', display: 'flex' }}
                   title={expCount > 0 ? `Tiene ${expCount} gastos — no se puede borrar` : 'Eliminar categoría'}>
                  <X size={11} />
                </button>
              </div>
            );
          })}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ ...styles.cardH3, margin: 0 }}>Vans, groomers y PINs</h3>
          <button onClick={() => {
            const newVan = { id: `van-${uid().slice(0,6)}`, name: `Van ${vans.length + 1}`, groomer: '', pin: '', commissionPct: 45, active: true };
            updateVans([...vans, newVan]);
            setEditVan(prev => ({ ...prev, [newVan.id]: { name: newVan.name, groomer: '', pin: '', commissionPct: 45 } }));
          }} style={{ ...styles.btnPrimary, padding: '6px 12px', fontSize: 12 }}>
            <Plus size={14} /> Nueva van
          </button>
        </div>
        <div style={styles.vanList}>
          {vans.map(v => {
            const editing = editVan[v.id];
            return (
              <div key={v.id} style={{ ...styles.vanRow, opacity: v.active === false ? 0.5 : 1 }}>
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
                    <button onClick={() => {
                      const active = v.active !== false;
                      if (!confirm(`¿${active ? 'Desactivar' : 'Activar'} ${v.name}?`)) return;
                      updateVans(vans.map(van => van.id === v.id ? { ...van, active: !active } : van));
                    }} style={{ ...styles.iconBtn, color: v.active === false ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}
                      title={v.active === false ? 'Activar van' : 'Desactivar van'}>
                      {v.active === false ? <Check size={15} /> : <Trash2 size={15} />}
                    </button>
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

// ===== BREED AUTOCOMPLETE =====
function BreedInput({ value, onChange, placeholder = 'Escribir raza...' }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();
    return DOG_BREEDS.filter(b => b.toLowerCase().includes(q)).slice(0, 8);
  }, [value]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      onChange(suggestions[activeIdx]);
      setShowSuggestions(false);
      setActiveIdx(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setShowSuggestions(true); setActiveIdx(-1); }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => { setShowSuggestions(false); setActiveIdx(-1); }, 200)}
        onKeyDown={handleKeyDown}
        style={styles.input}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, background: '#fff', border: '1px solid var(--color-border-secondary)', borderRadius: 8, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden', maxHeight: 250, overflowY: 'auto' }}>
          {suggestions.map((breed, idx) => (
            <button key={breed} onMouseDown={e => { e.preventDefault(); onChange(breed); setShowSuggestions(false); setActiveIdx(-1); }}
              className="suggestion-hover"
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: idx === activeIdx ? 'var(--color-background-info)' : 'none', border: 'none', borderBottom: '0.5px solid var(--color-border-tertiary)', cursor: 'pointer', fontSize: 13, color: idx === activeIdx ? 'var(--color-text-info)' : 'var(--color-text-primary)', fontWeight: idx === activeIdx ? 600 : 400 }}>
              🐾 {breed}
            </button>
          ))}
          <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)' }}>
            ↑↓ para navegar · Enter para seleccionar · Esc para cerrar
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CLIENTES TAB =====
function ClientesTab({ clients, pets, appointments, session, isAdmin, addClient, updateClient, removeClient, addPet, updatePet, servicePrices, addAppointment, vans, settings, refreshAppointments }) {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [saving, setSaving] = useState(false);
  const [petGroomingHistory, setPetGroomingHistory] = useState({});
  const [loadingHistory, setLoadingHistory] = useState({});
  const [apptDate, setApptDate] = useState(todayISO());

  // Formulario unificado
  const emptyClient = { name: '', phone: '', email: '', address: '', notes: '' };
  const emptyPet = () => ({ id: `temp-${uid()}`, name: '', breed: '', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', color: '', weight: '', allergies: '', medicalNotes: '', behaviorNotes: '', serviceId: '', serviceName: '', servicePrice: 0, discountPct: 0, finalPrice: 0, headTool: '', headNotes: '', earsTool: '', earsNotes: '', bodyTool: '', bodyNotes: '', legsTool: '', legsNotes: '', tailTool: '', tailNotes: '', healthSkin: 'ok', healthEars: 'ok', healthNails: 'ok', healthBehavior: 'calm', groomingNotes: '' });

  const [clientForm, setClientForm] = useState(emptyClient);
  const [petForms, setPetForms] = useState([emptyPet()]);
  const [apptForm, setApptForm] = useState({ vanId: vans[0]?.id || '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '' });

  const canViewPhone = isAdmin || session?.permissions?.can_view_clients;

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    return clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.address?.toLowerCase().includes(search.toLowerCase()));
  }, [clients, search]);

  const clientPets = useMemo(() => {
    if (!selectedClient) return [];
    return pets.filter(p => p.client_id === selectedClient.id);
  }, [pets, selectedClient]);

  const clientHistory = useMemo(() => {
    if (!selectedClient) return [];
    return appointments.filter(a => a.clientId === selectedClient.id).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 10);
  }, [appointments, selectedClient]);

  const loadPetHistory = async (petId) => {
    if (petGroomingHistory[petId] || loadingHistory[petId]) return;
    setLoadingHistory(h => ({...h, [petId]: true}));
    const records = await loadGroomingRecords(petId);
    setPetGroomingHistory(h => ({...h, [petId]: records}));
    setLoadingHistory(h => ({...h, [petId]: false}));
  };

  const addPetForm = () => setPetForms(prev => [...prev, emptyPet()]);
  const removePetForm = (idx) => setPetForms(prev => prev.filter((_, i) => i !== idx));

  // Estados para edición
  const [showEditClient, setShowEditClient] = useState(false);
  const [showEditPet, setShowEditPet] = useState(false);
  const [editClientForm, setEditClientForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [editPetForm, setEditPetForm] = useState({ name: '', breed: '', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', color: '', weight: '', allergies: '', medicalNotes: '', behaviorNotes: '' });
  const [editingAppt, setEditingAppt] = useState(null);
  const [editApptForm, setEditApptForm] = useState({});

  const startEditClient = (c) => {
    setEditingClient(c);
    setEditClientForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '' });
    setShowEditClient(true);
    setShowEditPet(false);
  };

  const startEditPet = (p) => {
    setEditingPet(p);
    setEditPetForm({ name: p.name, breed: p.breed || '', size: p.size || 'Small (1-20 lbs)', hairType: p.hair_type || 'Short Hair', age: p.age || '', color: p.color || '', weight: p.weight || '', allergies: p.allergies || '', medicalNotes: p.medical_notes || '', behaviorNotes: p.behavior_notes || '' });
    setShowEditPet(true);
    setShowEditClient(false);
  };

  const handleSaveEditClient = async () => {
    if (!editClientForm.name.trim()) { alert('Ingresa el nombre'); return; }
    setSaving(true);
    await updateClient({ ...editingClient, ...editClientForm, name: editClientForm.name.trim() });
    setSelectedClient(prev => prev ? { ...prev, ...editClientForm, name: editClientForm.name.trim() } : null);
    setShowEditClient(false);
    setEditingClient(null);
    setSaving(false);
  };

  const handleSaveEditPet = async () => {
    if (!editPetForm.name.trim()) { alert('Ingresa el nombre'); return; }
    setSaving(true);
    await updatePet({ ...editingPet, ...editPetForm, name: editPetForm.name.trim(), clientId: editingPet.client_id, client_id: editingPet.client_id, hair_type: editPetForm.hairType, medical_notes: editPetForm.medicalNotes, behavior_notes: editPetForm.behaviorNotes });
    setShowEditPet(false);
    setEditingPet(null);
    setSaving(false);
  };

  const updatePetForm = (idx, field, value) => {
    setPetForms(prev => prev.map((p, i) => {
      if (i !== idx) return p;
      const updated = { ...p, [field]: value };

      // Cuando cambia el peso → actualizar tamaño automáticamente
      if (field === 'weight') {
        updated.size = getSizeByWeight(value) || updated.size;
        // Recalcular precio si ya tiene servicio seleccionado
        if (updated.serviceCategory && updated.hairType && updated.size) {
          const svc = getAutoPrice(servicePrices, updated.serviceCategory, updated.size, updated.hairType);
          if (svc) {
            updated.serviceId = svc.id;
            updated.serviceName = svc.name;
            updated.servicePrice = svc.price;
            updated.finalPrice = parseFloat((svc.price * (1 - (updated.discountPct || 0) / 100)).toFixed(2));
          }
        }
      }

      // Cuando cambia el tipo de pelo o categoría → recalcular precio
      if (field === 'hairType' || field === 'serviceCategory') {
        const cat = field === 'serviceCategory' ? value : updated.serviceCategory;
        const hair = field === 'hairType' ? value : updated.hairType;
        const size = updated.size;
        if (cat && hair && size) {
          const svc = getAutoPrice(servicePrices, cat, size, hair);
          if (svc) {
            updated.serviceId = svc.id;
            updated.serviceName = svc.name;
            updated.servicePrice = svc.price;
            updated.finalPrice = parseFloat((svc.price * (1 - (updated.discountPct || 0) / 100)).toFixed(2));
          }
        }
      }

      // Cuando selecciona servicio manualmente
      if (field === 'serviceId') {
        const svc = (servicePrices || []).find(s => s.id === value);
        updated.serviceName = svc?.name || '';
        updated.servicePrice = svc?.price || 0;
        updated.serviceCategory = svc?.category || '';
        updated.finalPrice = parseFloat(((svc?.price || 0) * (1 - (updated.discountPct || 0) / 100)).toFixed(2));
      }

      // Cuando cambia el descuento
      if (field === 'discountPct') {
        const disc = parseFloat(value) || 0;
        updated.finalPrice = parseFloat((updated.servicePrice * (1 - disc / 100)).toFixed(2));
      }

      return updated;
    }));
  };

  const getAddonsTotal = (pf) => {
    return (servicePrices || []).filter(p => (pf.addons || []).includes(p.id)).reduce((sum, p) => sum + p.price, 0);
  };

  const getPetTotal = (pf) => {
    return (pf.finalPrice || 0) + getAddonsTotal(pf);
  };

  const totalCita = petForms.reduce((sum, p) => sum + getPetTotal(p), 0);

  const handleCreateAll = async () => {
    if (!clientForm.name.trim()) { alert('Ingresa el nombre del cliente'); return; }
    if (petForms.some(p => !p.name.trim())) { alert('Ingresa el nombre de cada mascota'); return; }

    // Validación de duplicados
    const nameLower = clientForm.name.trim().toLowerCase();
    const addrLower = clientForm.address?.trim().toLowerCase();

    const dupName = clients.find(c => c.name.toLowerCase() === nameLower);
    const dupAddr = addrLower ? clients.find(c => c.address?.toLowerCase() === addrLower) : null;

    if (dupName) {
      const ok = window.confirm(`⚠️ Ya existe un cliente con el nombre "${clientForm.name.trim()}".\n\n¿Es un cliente diferente? Clic OK para continuar de todas formas.\nClic Cancelar para revisar.`);
      if (!ok) return;
    } else if (dupAddr) {
      const ok = window.confirm(`⚠️ Ya existe un cliente en la dirección "${clientForm.address}":\n${dupAddr.name}\n\n¿Es un cliente diferente? Clic OK para continuar.\nClic Cancelar para revisar.`);
      if (!ok) return;
    }

    setSaving(true);

    // 1. Crear cliente
    const clientId = uid();
    const client = { id: clientId, ...clientForm, name: clientForm.name.trim(), active: true };
    await addClient(client);

    // 2. Crear mascotas y cita
    const apptId = uid();
    const apptPets = [];

    for (const pf of petForms) {
      const petId = uid();
      const pet = { id: petId, clientId, client_id: clientId, name: pf.name.trim(), breed: pf.breed, size: pf.size, hairType: pf.hairType, hair_type: pf.hairType, age: pf.age, color: pf.color, weight: pf.weight, allergies: pf.allergies, medicalNotes: pf.medicalNotes, medical_notes: pf.medicalNotes, behaviorNotes: pf.behaviorNotes, behavior_notes: pf.behaviorNotes };
      await addPet(pet);

      // Guardar ficha de grooming si tiene datos
      const hasGrooming = pf.headTool || pf.bodyTool || pf.groomingNotes;
      if (hasGrooming) {
        const mainBlade = pf.bodyTool || pf.headTool || '';
        const mainCombo = pf.legsTool || pf.bodyTool || '';
        await saveGroomingRecord({
          id: uid(), appointmentId: apptId, petId, vanId: apptForm.vanId, date: apptDate,
          blade: mainBlade, combo: mainCombo,
          head: `${pf.headTool}${pf.headNotes ? ' — ' + pf.headNotes : ''}`,
          ears: `${pf.earsTool}${pf.earsNotes ? ' — ' + pf.earsNotes : ''}`,
          body: `${pf.bodyTool}${pf.bodyNotes ? ' — ' + pf.bodyNotes : ''}`,
          legs: `${pf.legsTool}${pf.legsNotes ? ' — ' + pf.legsNotes : ''}`,
          tail: `${pf.tailTool}${pf.tailNotes ? ' — ' + pf.tailNotes : ''}`,
          notes: pf.groomingNotes,
          healthSkin: pf.healthSkin, healthEars: pf.healthEars,
          healthNails: pf.healthNails, healthBehavior: pf.healthBehavior,
        });
        if (mainBlade) await supabase.from('pets').update({ last_blade: mainBlade, last_combo: mainCombo }).eq('id', petId);
      }

      apptPets.push({ id: uid(), petId, service: pf.serviceName, amount: getPetTotal(pf), tip: 0, cardFee: 0, method: 'Efectivo', status: 'pending', checkinTime: '', checkoutTime: '', pet: { id: petId, name: pf.name.trim(), breed: pf.breed, size: pf.size } });
    }

    // 3. Crear cita
    const appt = {
      id: apptId, date: apptDate, timeStart: apptForm.timeStart, timeEnd: apptForm.timeEnd,
      vanId: apptForm.vanId, clientId, status: 'unconfirmed',
      notes: apptForm.notes, alertNotes: apptForm.alertNotes, agreementSigned: false,
      client: { id: clientId, name: clientForm.name.trim(), address: clientForm.address },
      pets: apptPets,
    };
    await addAppointment(appt);
    for (const ap of apptPets) await saveAppointmentPet({ ...ap, appointmentId: apptId });

    setSaving(false);
    setShowNewForm(false);
    setClientForm(emptyClient);
    setPetForms([emptyPet()]);
    setApptForm({ vanId: vans[0]?.id || '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '' });
    alert(`✅ ${clientForm.name} creado con ${petForms.length} mascota(s) y su cita`);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Base de datos" title="Clientes y mascotas"
        right={
          <button onClick={() => { setShowNewForm(!showNewForm); setClientForm(emptyClient); setPetForms([emptyPet()]); }} style={styles.btnPrimary}>
            <Plus size={15} /> Nuevo cliente
          </button>
        }
      />

      {/* ===== FORMULARIO UNIFICADO ===== */}
      {showNewForm && (
        <div style={{ ...styles.card, marginBottom: 20, border: '1px solid var(--color-border-info)', background: 'var(--color-background-info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardH3, margin: 0, color: 'var(--color-text-info)' }}>Nuevo cliente + mascota(s) + cita</h3>
            <button onClick={() => setShowNewForm(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>

          {/* PASO 1: Cliente */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-info)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Paso 1 — Datos del cliente</div>
            <div style={styles.formGrid}>
              <div><label style={styles.lbl}>Nombre *</label><input value={clientForm.name} onChange={e => setClientForm(f => ({...f, name: e.target.value}))} style={styles.input} placeholder="Nombre completo" /></div>
              <div><label style={styles.lbl}>Teléfono</label><input value={clientForm.phone} onChange={e => setClientForm(f => ({...f, phone: e.target.value}))} style={styles.input} placeholder="(305) 000-0000" /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Dirección</label><input value={clientForm.address} onChange={e => setClientForm(f => ({...f, address: e.target.value}))} style={styles.input} placeholder="Dirección completa" /></div>
              <div><label style={styles.lbl}>Email</label><input value={clientForm.email} onChange={e => setClientForm(f => ({...f, email: e.target.value}))} style={styles.input} placeholder="email@ejemplo.com" /></div>
              <div><label style={styles.lbl}>Notas internas (solo admin)</label><input value={clientForm.notes} onChange={e => setClientForm(f => ({...f, notes: e.target.value}))} style={styles.input} placeholder="Notas privadas..." /></div>
            </div>
          </div>

          {/* PASO 2: Mascotas con servicio y ficha */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-info)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Paso 2 — Mascota(s)</div>
            {petForms.map((pf, idx) => (
              <div key={pf.id} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>🐾 Mascota {idx + 1}</div>
                  {petForms.length > 1 && (
                    <button onClick={() => removePetForm(idx)} style={{ ...styles.iconBtn, color: 'var(--color-text-danger)' }}><X size={14} /></button>
                  )}
                </div>

                {/* Datos de la mascota */}
                <div style={styles.formGrid}>
                  <div><label style={styles.lbl}>Nombre *</label><input value={pf.name} onChange={e => updatePetForm(idx, 'name', e.target.value)} style={styles.input} placeholder="Nombre" /></div>
                  <div><label style={styles.lbl}>Raza</label><BreedInput value={pf.breed} onChange={v => updatePetForm(idx, 'breed', v)} /></div>
                  <div>
                    <label style={styles.lbl}>Peso (lbs) *</label>
                    <input type="number" value={pf.weight} onChange={e => updatePetForm(idx, 'weight', e.target.value)} style={styles.input} placeholder="0" />
                    {pf.weight > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 4, fontWeight: 500 }}>
                        📏 {getSizeByWeight(pf.weight)}
                      </div>
                    )}
                  </div>
                  <div><label style={styles.lbl}>Tipo de pelo *</label><select value={pf.hairType} onChange={e => updatePetForm(idx, 'hairType', e.target.value)} style={styles.input}>{HAIR_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                  <div><label style={styles.lbl}>Edad</label><input value={pf.age} onChange={e => updatePetForm(idx, 'age', e.target.value)} style={styles.input} placeholder="Ej: 3 años" /></div>
                  <div><label style={styles.lbl}>Color</label><input value={pf.color} onChange={e => updatePetForm(idx, 'color', e.target.value)} style={styles.input} placeholder="Ej: Blanco y negro" /></div>
                  <div><label style={styles.lbl}>Alergias</label><input value={pf.allergies} onChange={e => updatePetForm(idx, 'allergies', e.target.value)} style={styles.input} placeholder="Ninguna" /></div>
                  <div><label style={styles.lbl}>Notas médicas</label><input value={pf.medicalNotes} onChange={e => updatePetForm(idx, 'medicalNotes', e.target.value)} style={styles.input} placeholder="Ninguna" /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Notas de comportamiento</label><input value={pf.behaviorNotes} onChange={e => updatePetForm(idx, 'behaviorNotes', e.target.value)} style={styles.input} placeholder="Ej: Ansioso con tijeras, mordió en visita anterior..." /></div>
                </div>

                {/* Servicio y precio */}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Servicio de esta visita</div>

                  {/* Selector simplificado: tipo + pelo → precio automático */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div>
                      <label style={styles.lbl}>Tipo de servicio</label>
                      <select value={pf.serviceCategory || ''} onChange={e => updatePetForm(idx, 'serviceCategory', e.target.value)} style={styles.input}>
                        <option value="">Seleccionar...</option>
                        <option value="Signature Bath">🛁 Signature Bath</option>
                        <option value="Full Groom">✂️ Full Groom</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.lbl}>Tipo de pelo</label>
                      <select value={pf.hairType} onChange={e => updatePetForm(idx, 'hairType', e.target.value)} style={styles.input}>
                        {HAIR_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Precio automático calculado */}
                  {pf.servicePrice > 0 ? (
                    <div style={{ padding: '10px 14px', background: 'var(--color-background-success)', borderRadius: 10, border: '0.5px solid var(--color-border-success)', marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--color-text-success)', marginBottom: 4 }}>
                        {pf.serviceName} · {getSizeByWeight(pf.weight)} · {pf.hairType}
                      </div>
                      {pf.discountPct > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, textDecoration: 'line-through', opacity: 0.6, color: 'var(--color-text-success)' }}>${pf.servicePrice}</span>
                          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-success)' }}>💰 ${getPetTotal(pf).toFixed(2)}</span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-success)' }}>-{pf.discountPct}%{getAddonsTotal(pf) > 0 ? ` +$${getAddonsTotal(pf)} add-ons` : ''}</span>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-success)' }}>💰 ${getPetTotal(pf).toFixed(2)}</div>
                          {getAddonsTotal(pf) > 0 && <div style={{ fontSize: 11, color: 'var(--color-text-success)' }}>Servicio ${pf.servicePrice} + Add-ons ${getAddonsTotal(pf)}</div>}
                        </div>
                      )}
                    </div>
                  ) : pf.serviceCategory && !pf.weight ? (
                    <div style={{ padding: '8px 12px', background: 'var(--color-background-warning)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-warning)' }}>
                      ⚠️ Ingresa el peso del perro para calcular el precio automáticamente
                    </div>
                  ) : pf.serviceCategory && pf.weight && !pf.servicePrice ? (
                    <div style={{ padding: '8px 12px', background: 'var(--color-background-warning)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-warning)' }}>
                      ⚠️ No se encontró precio para esta combinación
                    </div>
                  ) : null}

                  {/* Add-ons */}
                  <div>
                    <label style={styles.lbl}>Add-ons (opcional)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {(servicePrices || []).filter(p => p.category === 'Add-on').map(addon => {
                        const selected = (pf.addons || []).includes(addon.id);
                        return (
                          <button key={addon.id} type="button"
                            onClick={() => updatePetForm(idx, 'addons', selected ? (pf.addons || []).filter(id => id !== addon.id) : [...(pf.addons || []), addon.id])}
                            style={{ padding: '5px 12px', background: selected ? 'var(--color-background-info)' : 'var(--color-background-secondary)', border: `1px solid ${selected ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: selected ? 600 : 400, color: selected ? 'var(--color-text-info)' : 'var(--color-text-secondary)', transition: 'all 0.15s' }}>
                            {selected ? '✅ ' : ''}{addon.name} +${addon.price}
                          </button>
                        );
                      })}
                    </div>
                    {/* Total add-ons */}
                  </div>

                  {/* Descuento — solo admin */}
                  {pf.servicePrice > 0 && isAdmin && (
                    <div style={{ marginTop: 10 }}>
                      <label style={styles.lbl}>Descuento % (solo admin)</label>
                      <div style={{ position: 'relative', maxWidth: 150 }}>
                        <input type="number" min="0" max="100" step="5" value={pf.discountPct}
                          onChange={e => updatePetForm(idx, 'discountPct', e.target.value)}
                          style={{ ...styles.input, paddingRight: 28 }} placeholder="0" />
                        <span style={{ position: 'absolute', right: 10, top: 11, fontSize: 12, color: '#94a3b8' }}>%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button onClick={addPetForm} style={{ ...styles.btnSecondary, width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> Agregar otra mascota
            </button>
          </div>

          {/* PASO 3: Cita */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-info)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Paso 3 — Cita</div>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.lbl}>Fecha *</label>
                <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.lbl}>Van asignada *</label>
                <select value={apptForm.vanId} onChange={e => setApptForm(f => ({...f, vanId: e.target.value}))} style={styles.input}>
                  {vans.map(v => <option key={v.id} value={v.id}>{v.name} — {v.groomer}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.lbl}>Hora inicio</label>
                <input type="time" value={apptForm.timeStart} onChange={e => setApptForm(f => ({...f, timeStart: e.target.value}))} style={styles.input} />
              </div>
              <div>
                <label style={styles.lbl}>Hora fin (estimada)</label>
                <input type="time" value={apptForm.timeEnd} onChange={e => setApptForm(f => ({...f, timeEnd: e.target.value}))} style={styles.input} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>Notas de la cita</label>
                <input value={apptForm.notes} onChange={e => setApptForm(f => ({...f, notes: e.target.value}))} style={styles.input} placeholder="Instrucciones especiales..." />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>⚠️ Notas de alerta (privado)</label>
                <input value={apptForm.alertNotes} onChange={e => setApptForm(f => ({...f, alertNotes: e.target.value}))} style={styles.input} placeholder="Ej: perro agresivo, cliente difícil..." />
              </div>
            </div>

            {/* Total de la cita */}
            {totalCita > 0 && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--color-background-success)', borderRadius: 10, border: '0.5px solid var(--color-border-success)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Resumen de la cita</div>
                {petForms.filter(p => getPetTotal(p) > 0).map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-success)', marginBottom: 4 }}>
                    <div>
                      <span>🐾 {p.name || `Mascota ${i+1}`} — {p.serviceName}</span>
                      {getAddonsTotal(p) > 0 && <div style={{ fontSize: 11, opacity: 0.8 }}>+ {(p.addons || []).length} add-on(s)</div>}
                    </div>
                    <span style={{ fontWeight: 500 }}>${getPetTotal(p).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--color-text-success)', paddingTop: 8, borderTop: '0.5px solid var(--color-border-success)', marginTop: 6 }}>
                  <span>TOTAL CITA</span>
                  <span>${totalCita.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowNewForm(false)} style={styles.btnSecondary}><X size={15} /> Cancelar</button>
            <button onClick={handleCreateAll} style={styles.btnPrimary} disabled={saving}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
              {saving ? 'Creando...' : 'Crear cliente, mascotas y cita'}
            </button>
          </div>
        </div>
      )}

      {/* ===== LISTA DE CLIENTES ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '1fr 1.5fr' : '1fr', gap: 20 }}>
        <div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} style={styles.input} placeholder="Buscar cliente..." />
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 500, overflowY: 'auto' }}>
            {filteredClients.map(c => (
              <div key={c.id} onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}
                className="row-hover" style={{ padding: '10px 12px', background: selectedClient?.id === c.id ? 'var(--color-background-info)' : 'var(--color-background-primary)', border: `0.5px solid ${selectedClient?.id === c.id ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, borderRadius: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{c.address || 'Sin dirección'}</div>
                    {canViewPhone && c.phone && <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 2 }}>{c.phone}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)', padding: '2px 6px', borderRadius: 999 }}>
                      {pets.filter(p => p.client_id === c.id).length} 🐾
                    </span>
                    {isAdmin && <button onClick={e => { e.stopPropagation(); removeClient(c.id); setSelectedClient(null); }} style={{ ...styles.iconBtn, color: 'var(--color-text-danger)' }}><Trash2 size={13} /></button>}
                  </div>
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>
                {search ? 'No se encontraron clientes' : 'Sin clientes aún'}
              </div>
            )}
          </div>
        </div>

        {/* ===== DETALLE DEL CLIENTE ===== */}
        {selectedClient && (
          <div>
            {/* Formulario editar cliente */}
            {showEditClient && editingClient?.id === selectedClient.id ? (
              <div style={{ ...styles.card, border: '1px solid var(--color-border-warning)', background: 'var(--color-background-warning)', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Editar cliente</h3>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>
                <div style={styles.formGrid}>
                  <div><label style={styles.lbl}>Nombre *</label><input value={editClientForm.name} onChange={e => setEditClientForm(f => ({...f, name: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Teléfono</label><input value={editClientForm.phone} onChange={e => setEditClientForm(f => ({...f, phone: e.target.value}))} style={styles.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Dirección</label><input value={editClientForm.address} onChange={e => setEditClientForm(f => ({...f, address: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Email</label><input value={editClientForm.email} onChange={e => setEditClientForm(f => ({...f, email: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Notas internas</label><input value={editClientForm.notes} onChange={e => setEditClientForm(f => ({...f, notes: e.target.value}))} style={styles.input} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.btnSecondary}><X size={14} /> Cancelar</button>
                  <button onClick={handleSaveEditClient} style={styles.btnPrimary} disabled={saving}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Formulario editar mascota */}
            {showEditPet && editingPet && (
              <div style={{ ...styles.card, border: '1px solid var(--color-border-warning)', background: 'var(--color-background-warning)', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Editar mascota — {editingPet.name}</h3>
                  <button onClick={() => { setShowEditPet(false); setEditingPet(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>
                <div style={styles.formGrid}>
                  <div><label style={styles.lbl}>Nombre *</label><input value={editPetForm.name} onChange={e => setEditPetForm(f => ({...f, name: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Raza</label><BreedInput value={editPetForm.breed} onChange={v => setEditPetForm(f => ({...f, breed: v}))} /></div>
                  <div>
                    <label style={styles.lbl}>Peso (lbs)</label>
                    <input type="number" value={editPetForm.weight} onChange={e => setEditPetForm(f => ({...f, weight: e.target.value, size: getSizeByWeight(e.target.value) || f.size}))} style={styles.input} />
                    {editPetForm.weight > 0 && <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 4 }}>📏 {getSizeByWeight(editPetForm.weight)}</div>}
                  </div>
                  <div><label style={styles.lbl}>Tipo de pelo</label><select value={editPetForm.hairType} onChange={e => setEditPetForm(f => ({...f, hairType: e.target.value}))} style={styles.input}>{HAIR_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                  <div><label style={styles.lbl}>Tamaño</label><select value={editPetForm.size} onChange={e => setEditPetForm(f => ({...f, size: e.target.value}))} style={styles.input}>{SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label style={styles.lbl}>Edad</label><input value={editPetForm.age} onChange={e => setEditPetForm(f => ({...f, age: e.target.value}))} style={styles.input} placeholder="Ej: 3 años" /></div>
                  <div><label style={styles.lbl}>Color</label><input value={editPetForm.color} onChange={e => setEditPetForm(f => ({...f, color: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Alergias</label><input value={editPetForm.allergies} onChange={e => setEditPetForm(f => ({...f, allergies: e.target.value}))} style={styles.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Notas médicas</label><input value={editPetForm.medicalNotes} onChange={e => setEditPetForm(f => ({...f, medicalNotes: e.target.value}))} style={styles.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Notas de comportamiento</label><input value={editPetForm.behaviorNotes} onChange={e => setEditPetForm(f => ({...f, behaviorNotes: e.target.value}))} style={styles.input} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={() => { setShowEditPet(false); setEditingPet(null); }} style={styles.btnSecondary}><X size={14} /> Cancelar</button>
                  <button onClick={handleSaveEditPet} style={styles.btnPrimary} disabled={saving}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            )}

            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>{selectedClient.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{selectedClient.address}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {isAdmin && <button onClick={() => startEditClient(selectedClient)} style={{ ...styles.btnSecondary, padding: '5px 10px', fontSize: 12 }}><Edit2 size={13} /> Editar</button>}
                  <button onClick={() => setSelectedClient(null)} style={styles.iconBtn}><X size={15} /></button>
                </div>
              </div>
              {canViewPhone && selectedClient.phone && (
                <div style={{ fontSize: 13, color: 'var(--color-text-info)', marginBottom: 4 }}>📞 {selectedClient.phone}</div>
              )}
              {canViewPhone && selectedClient.email && (
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>✉️ {selectedClient.email}</div>
              )}
              {isAdmin && selectedClient.notes && (
                <div style={{ padding: '6px 10px', background: 'var(--color-background-warning)', borderRadius: 6, fontSize: 12, color: 'var(--color-text-warning)', marginTop: 6 }}>
                  📝 {selectedClient.notes}
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                {clientHistory.length} visita{clientHistory.length !== 1 ? 's' : ''} registrada{clientHistory.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Mascotas */}
            <div style={{ ...styles.card, marginTop: 12 }}>
              <h3 style={{ ...styles.cardH3, marginBottom: 12 }}>Mascotas</h3>
              {clientPets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-secondary)', fontSize: 13 }}>Sin mascotas registradas</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {clientPets.map(p => (
                    <div key={p.id} style={{ padding: '10px 12px', background: 'var(--color-background-secondary)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>🐾 {p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            {[p.breed, p.size?.split('(')[0]?.trim(), p.hair_type].filter(Boolean).join(' · ')}
                          </div>
                          {p.age && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{p.age}{p.weight ? ` · ${p.weight} lbs` : ''}{p.color ? ` · ${p.color}` : ''}</div>}
                          {p.allergies && <div style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>⚠️ Alergias: {p.allergies}</div>}
                          {p.behavior_notes && <div style={{ fontSize: 11, color: 'var(--color-text-warning)', marginTop: 2 }}>🔔 {p.behavior_notes}</div>}
                          {p.last_blade && <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 3 }}>✂️ Último corte: Blade {p.last_blade}{p.last_combo ? ` · Combo ${p.last_combo}` : ''}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {isAdmin && <button onClick={() => startEditPet(p)} style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11 }}><Edit2 size={12} /> Editar</button>}
                          <button onClick={() => loadPetHistory(p.id)} style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11 }}>📋 Fichas</button>
                        </div>
                      </div>

                      {/* Historial de fichas */}
                      {petGroomingHistory[p.id] && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                            Historial de fichas ({petGroomingHistory[p.id].length})
                          </div>
                          {petGroomingHistory[p.id].length === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Sin fichas registradas aún</div>
                          ) : (
                            petGroomingHistory[p.id].map(r => (
                              <div key={r.id} style={{ marginBottom: 8, padding: '8px 10px', background: 'var(--color-background-primary)', borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{ fontSize: 12, fontWeight: 500 }}>{formatDateNice(r.date)}</span>
                                  {r.blade && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#E6F1FB', color: '#0C447C' }}>✂️ {r.blade}{r.combo ? ` · ${r.combo}` : ''}</span>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 4 }}>
                                  {[['Cabeza', r.head], ['Orejas', r.ears], ['Cuerpo', r.body], ['Patas', r.legs], ['Cola', r.tail]].filter(([,v]) => v).map(([label, val]) => (
                                    <div key={label} style={{ fontSize: 11 }}>
                                      <span style={{ color: 'var(--color-text-secondary)' }}>{label}: </span>
                                      <span>{val}</span>
                                    </div>
                                  ))}
                                </div>
                                {r.notes && <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4, fontStyle: 'italic' }}>📝 {r.notes}</div>}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial de citas */}
            {clientHistory.length > 0 && (
              <div style={{ ...styles.card, marginTop: 12 }}>
                <h3 style={{ ...styles.cardH3, marginBottom: 10 }}>Historial de visitas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {clientHistory.map(a => {
                    const sc = STATUS_COLORS[a.status] || STATUS_COLORS.unconfirmed;
                    const isEditingAppt = editingAppt?.id === a.id;
                    return (
                      <div key={a.id} style={{ padding: '10px 12px', background: 'var(--color-background-secondary)', borderRadius: 10 }}>
                        {isEditingAppt ? (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>✏️ Editar cita</div>
                            <div style={styles.formGrid}>
                              <div>
                                <label style={styles.lbl}>Fecha</label>
                                <input type="date" value={editApptForm.date} onChange={e => setEditApptForm(f => ({...f, date: e.target.value}))} style={styles.input} />
                              </div>
                              <div>
                                <label style={styles.lbl}>Van</label>
                                <select value={editApptForm.vanId} onChange={e => setEditApptForm(f => ({...f, vanId: e.target.value}))} style={styles.input}>
                                  {vans.map(v => <option key={v.id} value={v.id}>{v.name} — {v.groomer}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={styles.lbl}>Hora inicio</label>
                                <input type="time" value={editApptForm.timeStart} onChange={e => setEditApptForm(f => ({...f, timeStart: e.target.value}))} style={styles.input} />
                              </div>
                              <div>
                                <label style={styles.lbl}>Hora fin</label>
                                <input type="time" value={editApptForm.timeEnd} onChange={e => setEditApptForm(f => ({...f, timeEnd: e.target.value}))} style={styles.input} />
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.lbl}>Notas</label>
                                <input value={editApptForm.notes} onChange={e => setEditApptForm(f => ({...f, notes: e.target.value}))} style={styles.input} placeholder="Instrucciones especiales..." />
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={styles.lbl}>⚠️ Notas de alerta</label>
                                <input value={editApptForm.alertNotes} onChange={e => setEditApptForm(f => ({...f, alertNotes: e.target.value}))} style={styles.input} placeholder="Ej: perro agresivo..." />
                              </div>
                            </div>
                            {/* Editar servicio por mascota */}
                            {a.pets?.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <label style={styles.lbl}>Servicios y add-ons por mascota</label>
                                {a.pets.map((ap, idx) => (
                                  <div key={ap.id} style={{ marginTop: 8, padding: '10px 12px', background: 'var(--color-background-secondary)', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🐾 {ap.pet?.name || 'Mascota'}</div>
                                    
                                    {/* Selector de servicio principal */}
                                    <div style={{ marginBottom: 8 }}>
                                      <label style={{ ...styles.lbl, fontSize: 11 }}>Servicio principal</label>
                                      <select defaultValue={ap.service}
                                        onChange={async e => {
                                          const svcName = e.target.value;
                                          const svc = (servicePrices || []).find(p =>
                                            `${p.name}${p.size ? ' · ' + p.size.split('(')[0].trim() : ''}${p.hair_type ? ' · ' + p.hair_type : ''}` === svcName
                                          );
                                          await supabase.from('appointment_pets').update({ service: svcName, amount: svc?.price || ap.amount }).eq('id', ap.id);
                                          await refreshAppointments();
                                        }}
                                        style={{ ...styles.input, fontSize: 12 }}>
                                        <option value={ap.service || ''}>{ap.service || 'Sin servicio'}</option>
                                        {['Signature Bath','Full Groom'].map(cat => (
                                          <optgroup key={cat} label={cat}>
                                            {(servicePrices || []).filter(p => p.category === cat).map(p => (
                                              <option key={p.id} value={`${p.name}${p.size ? ' · ' + p.size.split('(')[0].trim() : ''}${p.hair_type ? ' · ' + p.hair_type : ''}`}>
                                                {p.name}{p.size ? ` · ${p.size.split('(')[0].trim()}` : ''}{p.hair_type ? ` · ${p.hair_type}` : ''} — ${p.price}
                                              </option>
                                            ))}
                                          </optgroup>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Add-ons */}
                                    <div>
                                      <label style={{ ...styles.lbl, fontSize: 11 }}>Add-ons</label>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                        {(servicePrices || []).filter(p => p.category === 'Add-on').map(addon => (
                                          <button key={addon.id} type="button"
                                            onClick={async () => {
                                              const currentAmt = ap.amount || 0;
                                              const newAmt = currentAmt + addon.price;
                                              const newService = ap.service ? `${ap.service} + ${addon.name}` : addon.name;
                                              await supabase.from('appointment_pets').update({ amount: newAmt, service: newService }).eq('id', ap.id);
                                              await refreshAppointments();
                                            }}
                                            style={{ padding: '4px 10px', background: 'var(--color-background-primary)', border: '1px solid var(--color-border-secondary)', borderRadius: 999, cursor: 'pointer', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                                            + {addon.name} +${addon.price}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-success)' }}>Total: ${ap.amount || 0}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                              <button onClick={() => { setEditingAppt(null); setEditApptForm({}); }} style={styles.btnSecondary}><X size={13} /> Cancelar</button>
                              <button onClick={async () => {
                                setSaving(true);
                                await supabase.from('appointments').update({
                                  date: editApptForm.date, time_start: editApptForm.timeStart,
                                  time_end: editApptForm.timeEnd, van_id: editApptForm.vanId,
                                  notes: editApptForm.notes, alert_notes: editApptForm.alertNotes,
                                }).eq('id', a.id);
                                await refreshAppointments();
                                setEditingAppt(null);
                                setSaving(false);
                              }} style={styles.btnPrimary} disabled={saving}>
                                {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
                                Guardar cambios
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: sc.bg, color: sc.text }}>{STATUS_LABELS[a.status]}</span>
                                <span style={{ fontSize: 13, fontWeight: 500 }}>{formatDateNice(a.date)} · {a.timeStart}</span>
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                {vans.find(v => v.id === a.vanId)?.name} — {vans.find(v => v.id === a.vanId)?.groomer}
                              </div>
                              {a.pets?.length > 0 && (
                                <div style={{ marginTop: 4 }}>
                                  {a.pets.map(ap => (
                                    <div key={ap.id} style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                      🐾 {ap.pet?.name || 'Mascota'} — {ap.service || 'Sin servicio'} {ap.amount > 0 ? `· $${ap.amount}` : ''}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {isAdmin && ['unconfirmed','confirmed'].includes(a.status) && (
                              <button onClick={() => {
                                setEditingAppt(a);
                                setEditApptForm({ date: a.date, timeStart: a.timeStart, timeEnd: a.timeEnd || '', vanId: a.vanId, notes: a.notes || '', alertNotes: a.alertNotes || '' });
                              }} style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11, flexShrink: 0 }}>
                                <Edit2 size={12} /> Editar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ===== IA RAZAS TAB =====
function RazasTab({ session }) {
  const [step, setStep] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const BREED_CUTS = {
    'Golden Retriever': { cuts: ['Natural / Show cut', 'Summer cut', 'Teddy bear cut'], blades: ['#4F', '#5F'], combos: ['#A (3/4")', '#C (7/8")'], note: 'Pelo doble — nunca rasurar hasta la piel. Cepillar bien antes del baño.', warn: 'Revisar zona detrás de las orejas — muy propenso a enredos.' },
    'Poodle': { cuts: ['Puppy cut', 'Continental clip', 'Lamb cut'], blades: ['#10', '#15', '#30'], combos: ['#1 (1/2")', '#2 (3/8")', '#4 (1/4")'], note: 'Pelo rizado que crece continuamente. No hace shed. Requiere grooming cada 4-6 semanas.', warn: 'Revisar bien las patas y cara — el pelo crece muy rápido en esas zonas.' },
    'Schnauzer': { cuts: ['Corte tradicional', 'Puppy cut', 'Teddy bear'], blades: ['#7F', '#10', '#5F'], combos: ['#A (3/4")', '#2 (3/8")'], note: 'Pelo de doble capa. El corte tradicional preserva la textura del pelo duro.', warn: 'No usar blade muy corto en el cuerpo — destruye la textura del pelo.' },
    'Shih Tzu': { cuts: ['Puppy cut / Teddy bear', 'Show cut (pelo largo)', 'Summer cut'], blades: ['#10', '#5F', '#7F'], combos: ['#1 (1/2")', '#2 (3/8")'], note: 'Pelo largo y sedoso. Muy propenso a enredos si no se cepilla diariamente.', warn: 'Revisar con cuidado la zona del hocico y ojos — el pelo cae sobre los ojos.' },
    'Maltese': { cuts: ['Puppy cut', 'Teddy bear', 'Show cut'], blades: ['#10', '#15'], combos: ['#1 (1/2")', '#2 (3/8")'], note: 'Pelo blanco fino y sedoso. Propenso a manchas alrededor de los ojos.', warn: 'Usar condicionador para evitar enredos. Muy delicado con las tijeras cerca de los ojos.' },
    'Yorkshire Terrier': { cuts: ['Puppy cut', 'Show cut tradicional', 'Teddy bear'], blades: ['#10', '#15'], combos: ['#2 (3/8")', '#4 (1/4")'], note: 'Pelo fino y sedoso. Crece continuamente. Muy popular el puppy cut para facilitar mantenimiento.', warn: 'Cuidado con el pelaje alrededor de las orejas — se enreda fácilmente.' },
    'Bichon Frise': { cuts: ['Bichon cut clásico', 'Puppy cut', 'Teddy bear'], blades: ['#10', '#15'], combos: ['#A (3/4")', '#C (7/8")'], note: 'Pelo rizado y esponjoso. Requiere cepillado frecuente para mantener la forma esférica.', warn: 'La cara se trabaja con tijeras — requiere precisión para el look redondeado característico.' },
    'Goldendoodle': { cuts: ['Teddy bear cut', 'Puppy cut', 'Summer cut'], blades: ['#4F', '#5F'], combos: ['#1 (1/2")', '#2 (3/8")', '#A (3/4")'], note: 'Mezcla Golden + Poodle. El pelo puede variar mucho entre individuos.', warn: 'Muy propenso a enredos si el pelo es más cercano al Poodle. Cepillar antes del baño.' },
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null); setError(null); setStep('preview');
  };

  const analyzeImage = async () => {
    if (!imageFile) return;
    setLoading(true); setStep('loading'); setError(null);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = () => rej(new Error('Error leyendo imagen'));
        r.readAsDataURL(imageFile);
      });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: imageFile.type || 'image/jpeg', data: base64 } },
              { type: 'text', text: `Eres un experto en razas de perros para una empresa de mobile grooming en Florida llamada El Pet Wash.

Analiza esta imagen y responde SOLO en JSON con este formato exacto, sin texto adicional, sin markdown:
{
  "breed": "nombre de la raza en inglés",
  "confidence": número del 1 al 100,
  "origin": "país de origen",
  "size": "Small|Medium|Large|Extra Large",
  "hair_type": "Short Hair|Long Hair",
  "mix": false o true si es mestizo,
  "mix_breeds": "si es mestizo, las razas que parece tener, si no es mestizo deja vacío",
  "price_service": "Signature Bath",
  "price_range": "$70-$90",
  "grooming_notes": "2-3 observaciones importantes sobre el grooming de esta raza",
  "warning": "advertencia más importante para el groomer"
}

Si no es un perro, responde: {"error": "No es un perro"}` }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(i => i.text || '').join('').trim();
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (parsed.error) { setError('No se detectó un perro en la imagen. Intenta con otra foto.'); setStep('preview'); }
      else {
        const breedKey = Object.keys(BREED_CUTS).find(k => parsed.breed?.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(parsed.breed?.toLowerCase()));
        const cuts = breedKey ? BREED_CUTS[breedKey] : null;
        setResult({ ...parsed, cuts });
        setStep('result');
      }
    } catch(e) {
      console.error(e);
      setError('Error al analizar la imagen. Intenta de nuevo.');
      setStep('preview');
    }
    setLoading(false);
  };

  const reset = () => { setStep('upload'); setImageFile(null); setImagePreview(null); setResult(null); setError(null); };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 600, margin: '0 auto' }}>
      <SectionTitle eyebrow="Inteligencia artificial" title="Identificador de razas" />

      {step === 'upload' && (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 8 }}>Toma una foto del perro</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>La IA detectará la raza y sugerirá el corte, blade y combo ideal</div>
            <label style={{ ...styles.btnPrimary, display: 'inline-flex', cursor: 'pointer', padding: '12px 24px', fontSize: 15 }}>
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
              📷 Tomar foto o elegir imagen
            </label>
          </div>
        </div>
      )}

      {step === 'preview' && imagePreview && (
        <div style={styles.card}>
          <img src={imagePreview} alt="Perro" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }} />
          {error && <div style={{ padding: '10px 12px', background: 'var(--color-background-danger)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-danger)', marginBottom: 14 }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={reset} style={styles.btnSecondary}><X size={15} /> Nueva foto</button>
            <button onClick={analyzeImage} style={{ ...styles.btnPrimary, flex: 1, justifyContent: 'center' }}>
              🧠 Analizar con IA
            </button>
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px 20px' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-text-info)', display: 'block', margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: 'var(--color-text-primary)' }}>Analizando imagen...</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6 }}>La IA está identificando la raza</div>
        </div>
      )}

      {step === 'result' && result && (
        <div>
          {/* Resultado principal */}
          <div style={styles.card}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
              <img src={imagePreview} alt="Perro" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Raza detectada</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {result.breed} {result.mix && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>(mestizo)</span>}
                </div>
                {result.mix_breeds && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>Mezcla: {result.mix_breeds}</div>}
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{result.origin} · {result.size} · {result.hair_type}</div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--color-border-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${result.confidence}%`, height: '100%', background: 'var(--color-text-info)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-info)', minWidth: 40 }}>{result.confidence}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>Nivel de confianza</div>
                </div>
              </div>
            </div>
            {result.warning && (
              <div style={{ padding: '8px 12px', background: 'var(--color-background-warning)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-warning)' }}>
                ⚠️ {result.warning}
              </div>
            )}
          </div>

          {/* Cortes sugeridos */}
          {result.cuts && (
            <div style={{ ...styles.card, marginTop: 12 }}>
              <h3 style={{ ...styles.cardH3, marginBottom: 12 }}>✂️ Cortes recomendados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.cuts.cuts.map((cut, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--color-background-secondary)', borderRadius: 8, fontSize: 13 }}>
                    <div style={{ fontWeight: 500 }}>{i === 0 ? '⭐ ' : ''}{cut}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Herramientas sugeridas</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.cuts.blades.map(b => (
                    <span key={b} style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#E6F1FB', color: '#0C447C', border: '0.5px solid #85B7EB' }}>
                      ✂️ {b}
                    </span>
                  ))}
                  {result.cuts.combos.map(c => (
                    <span key={c} style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#FAEEDA', color: '#633806', border: '0.5px solid #EF9F27' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {result.cuts.note && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--color-background-info)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-info)' }}>
                  💡 {result.cuts.note}
                </div>
              )}
            </div>
          )}

          {/* Notas de grooming de la IA */}
          {result.grooming_notes && (
            <div style={{ ...styles.card, marginTop: 12 }}>
              <h3 style={{ ...styles.cardH3, marginBottom: 8 }}>📋 Notas de la IA</h3>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{result.grooming_notes}</div>
            </div>
          )}

          {/* Precio sugerido */}
          <div style={{ ...styles.card, marginTop: 12 }}>
            <h3 style={{ ...styles.cardH3, marginBottom: 8 }}>💰 Precio sugerido — El Pet Wash</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{result.price_service}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{result.size} · {result.hair_type}</div>
              </div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: 'var(--color-text-success)' }}>{result.price_range}</div>
            </div>
          </div>

          <button onClick={reset} style={{ ...styles.btnSecondary, width: '100%', justifyContent: 'center', marginTop: 12 }}>
            📷 Analizar otro perro
          </button>
        </div>
      )}
    </div>
  );
}

function AuditoriaTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100);
      setLogs(data || []);
      setLoading(false);
    })();
  }, []);

  const roleColors = { admin: '#0f172a', manager: '#7c3aed', groomer: '#0f766e' };
  const roleLabels = { admin: '👑 Admin', manager: '📋 Admin.', groomer: '🚐 Groomer' };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Seguridad" title="Historial de actividad" />
      <div style={styles.card}>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
          Registro de todas las acciones del sistema — quién hizo qué y cuándo.
        </p>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Cargando historial...</div>
        ) : logs.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ margin: 0, color: '#64748b' }}>Sin actividad registrada todavía</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha y hora</th>
                  <th style={styles.th}>Usuario</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Acción</th>
                  <th style={styles.th}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="row-hover" style={styles.tr}>
                    <td style={{ ...styles.td, fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{log.user_name}</td>
                    <td style={styles.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: roleColors[log.user_role] || '#64748b' }}>
                        {roleLabels[log.user_role] || log.user_role}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontSize: 12 }}>
                      <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#475569' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontSize: 13, color: '#475569' }}>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
