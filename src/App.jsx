import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Download, FileText, Settings as SettingsIcon, TrendingUp, Loader2, Edit2, X, Check, Truck, Sparkles, Lock, LogOut, Eye, EyeOff, DollarSign, AlertTriangle, MapPin } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ===== TRADUCCIONES =====
const TRANSLATIONS = {
  es: {
    // Tabs
    tab_citas: 'My Appointments',
    tab_clientes: 'Clients',
    tab_razas: 'AI Breeds',
    tab_registro: 'My Daily Log',
    tab_registro_admin: 'Daily Log',
    tab_cierre: 'My Daily Close',
    tab_cierre_admin: 'Daily Close',
    tab_gastos: '💼 Expenses',
    tab_inventario: '📦 Inventory',
    tab_semana: 'Weekly Report',
    tab_dashboard: 'Dashboard',
    tab_auditoria: 'Audit Log',
    tab_config: 'Settings',
    // Citas
    new_appt: '+ New Appointment',
    checkin: 'Check In',
    complete_pay: 'Complete & Collect',
    view_invoice: '🧾 Ver Invoice',
    reopen: '🔓 Reopen',
    cancel_appt: 'Cancelar',
    reassign: '🔄 Reassign',
    status_unconfirmed: 'Unconfirmed',
    status_confirmed: 'Confirmed',
    status_in_progress: 'In Progress',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',
    // Daily Log
    services_section: '💼 Services',
    expenses_section: '⛽ Daily Expenses',
    add_service: 'Log Service',
    add_expense: 'Log Expense',
    // Grooming
    grooming_record: 'Ficha de grooming',
    checklist: 'Checklist',
    // Inventario
    request_supplies: '📦 Request Supplies',
    my_requests: '📋 My Requests',
    send_request: 'Send Request to Admin',
    mark_delivered: '✅ Mark as Delivered',
    pending_requests: 'Pending Requests',
    history: 'Historial',
    articles: '⚙️ Artículos',
    // Generales
    save: 'Save',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Edit',
    search: 'Search',
    loading: 'Loading...',
    no_data: 'Sin datos',
    date: 'Date',
    amount: 'Amount',
    total: 'Total',
    notes: 'Notas',
    method: 'Método de pago',
    van: 'Van',
    groomer: 'Groomer',
    company: 'Company',
    client: 'Cliente',
    pet: 'Mascota',
    service: 'Servicio',
    // Cierre
    daily_close: 'Daily Close',
    weekly_report: 'Weekly Report',
    total_sales: 'Total Sales',
    to_pay: 'A pagar',
    company_income: 'Company Income',
    // Login
    enter_pin: 'Ingresa tu PIN',
    wrong_pin: 'PIN incorrecto',
  },
  en: {
    // Tabs
    tab_citas: 'My Appointments',
    tab_clientes: 'Clients',
    tab_razas: 'AI Breeds',
    tab_registro: 'My Daily Log',
    tab_registro_admin: 'Daily Log',
    tab_cierre: 'My Daily Close',
    tab_cierre_admin: 'Daily Close',
    tab_gastos: '💼 Expenses',
    tab_inventario: '📦 Inventory',
    tab_semana: 'Weekly Report',
    tab_dashboard: 'Dashboard',
    tab_auditoria: 'Audit Log',
    tab_config: 'Settings',
    // Citas
    new_appt: '+ New Appointment',
    checkin: 'Check In',
    complete_pay: 'Complete & Collect',
    view_invoice: '🧾 View Invoice',
    reopen: '🔓 Reopen',
    cancel_appt: 'Cancel',
    reassign: '🔄 Reassign',
    status_unconfirmed: 'Unconfirmed',
    status_confirmed: 'Confirmed',
    status_in_progress: 'In Progress',
    status_completed: 'Completed',
    status_cancelled: 'Cancelled',
    // Daily Log
    services_section: '💼 Services',
    expenses_section: '⛽ Daily Expenses',
    add_service: 'Log Service',
    add_expense: 'Log Expense',
    // Grooming
    grooming_record: 'Grooming Record',
    checklist: 'Checklist',
    // Inventario
    request_supplies: '📦 Request Supplies',
    my_requests: '📋 My Requests',
    send_request: 'Send Request to Admin',
    mark_delivered: '✅ Mark as Delivered',
    pending_requests: 'Pending Requests',
    history: 'History',
    articles: '⚙️ Items',
    // Generales
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    loading: 'Loading...',
    no_data: 'No data',
    date: 'Date',
    amount: 'Amount',
    total: 'Total',
    notes: 'Notes',
    method: 'Payment method',
    van: 'Van',
    groomer: 'Groomer',
    company: 'Company',
    client: 'Client',
    pet: 'Pet',
    service: 'Service',
    // Cierre
    daily_close: 'Daily Close',
    weekly_report: 'Weekly Report',
    total_sales: 'Total Sales',
    to_pay: 'To Pay',
    company_income: 'Company Income',
    // Login
    enter_pin: 'Enter your PIN',
    wrong_pin: 'Wrong PIN',
  }
};

const useT = (lang = 'es') => (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['es'][key] ?? key;

// ===== SQUARE CONFIG =====
const SQUARE_CONFIG = {
  sandbox: {
    appId: 'sandbox-sq0idb-O_iKDsUOzV0sxyoXc0rzTQ',
    locationId: 'L2EGW8SFRMRR77299',
    scriptUrl: 'https://sandbox.web.squarecdn.com/v1/square.js',
  },
  production: {
    appId: import.meta.env.VITE_SQUARE_APP_ID || 'sq0idp-HnbL8ULCx-2jtvYlfKdtEQ',
    locationId: import.meta.env.VITE_SQUARE_LOCATION_ID || 'L2FFGMCZY3V9J',
    scriptUrl: 'https://web.squarecdn.com/v1/square.js',
  }
};
const SQUARE_ENV = 'production';
const SQ = SQUARE_CONFIG[SQUARE_ENV];

// Cargar Square SDK
const loadSquareSDK = () => new Promise((resolve, reject) => {
  if (window.Square) { resolve(window.Square); return; }
  const script = document.createElement('script');
  script.src = SQ.scriptUrl;
  script.onload = () => resolve(window.Square);
  script.onerror = reject;
  document.head.appendChild(script);
});

const processSquarePayment = async (amountCents, note = '') => {
  try {
    const Square = await loadSquareSDK();
    const payments = Square.payments(SQ.appId, SQ.locationId);

    // Intentar Tap to Pay primero (iPhone)
    let paymentMethod;
    try {
      const tapToPay = await payments.tapToPay();
      paymentMethod = tapToPay;
    } catch (tapError) {
      // Fallback a card form
      const card = await payments.card();
      await card.attach('#square-card-container');
      paymentMethod = card;
    }

    if (amountCents === 0) return { success: true, token: null };

    // Obtener token de Square
    const result = await paymentMethod.tokenize();
    if (result.status !== 'OK') {
      return { success: false, error: result.errors?.[0]?.message || 'Tokenization failed' };
    }

    // Enviar token al backend para procesar el pago real
    const response = await fetch('/api/square-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: result.token,
        amount: amountCents,
        note,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'Payment failed' };
    }

    return { success: true, paymentId: data.paymentId, token: result.token };
  } catch (err) {
    console.error('Square error:', err);
    return { success: false, error: err.message };
  }
};

// ===== SUPABASE =====
const SUPABASE_URL = 'https://lpzwnbrjpayjhlwjmuda.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== CONSTANTES =====
const PAYMENT_METHODS = ['Cash', 'Zelle', 'Credit Card', 'Check'];
const METHOD_STYLES = {
  'Cash':        { bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  'Zelle':       { bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' },
  'Credit Card': { bg: '#e0f2fe', text: '#075985', dot: '#0284c7' },
  'Check':       { bg: '#fef3c7', text: '#854d0e', dot: '#d97706' },
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

const DEFAULT_COMPANIES = [
  { id: 'epw', name: 'El Pet Wash', logoEmoji: '🐾', gasFee: 7, cardFeePct: 5.5, active: true, sortOrder: 1 },
  { id: 'atw', name: 'All Tails Wag', logoEmoji: '🐕', gasFee: 7, cardFeePct: 5.5, active: true, sortOrder: 2 },
];

const AGREEMENTS = {
  epw: `GROOMING SERVICE AGREEMENT — El Pet Wash LLC

General Grooming Risks: Extra care will be taken when performing any grooming procedures, however, owner must understand possible reactions such as stress, skin irritation, possible nicks to the skin, or a toe-nail quicked may occur. Additionally, problems occasionally arise after the grooming visit such as bleeding of nicks, clipper irritation, eyes irritation, mental or physical stress. Grooming can also expose a hidden medical problem or aggravate a current one. Owner agrees not to hold El Pet Wash LLC for any injuries, which might result from this grooming process.

Health and Behavior of Pet: I agree and understand that El Pet Wash LLC has relied upon my representation that my pet is in good health, has not injured or shown threatening behavior to any persons or animals, is current on all required vaccinations and is free of parasites. El Pet Wash LLC reserves the right to refuse service, or to stop a groom in progress, if your pet may pose a threat to themselves, other pets or staff, whether it be an aggression problem, health problem, or parasite problem.

Owner Responsibility: The owner agrees to be solely responsible and liable for any and all acts of behavior of their pet. This may include, but is not limited to, injury or death to pet, injury or death to another pet(s), or injury or death to a staff member or any other member of the public. Medical treatment expenses required by a staff member, a member of the public or for another pet will be the sole responsibility of the pet owner.

Matted Hair on Pets: Owner is aware that we don't charge additional fees if the hair on pet is in a matted condition, but if in fact the hair is knotted the groomer will have to shave the hair down.

Additional Services: I agree and understand that De-matting, De-shedding, Flea and Tick Treatments, Medicated Shampoo, Special Cuts, Special Needs for aging or Health problems, Aggressive or bad behaviors or any additional services will cause extra charges.

Credit Card Payment and Processing Fee: The Client may choose to make payments via credit card. If this payment method is selected, an additional processing fee of 5% of the total transaction amount will be applied to cover administrative and banking charges. This fee will be disclosed to the Client prior to processing the payment and will be included in the total amount due. This fee is non-refundable, even in the event of cancellations, returns, or partial refunds, unless otherwise required by law.

Driver fee will be applied even if we can't do the service because of aggressive or bad behaviors.`,

  atw: `GROOMING SERVICE AGREEMENT — All Tails Wag Grooming LLC

General Grooming Risks: Extra care will be taken when performing any grooming procedures, however, owner must understand possible reactions such as stress, skin irritation, possible nicks to the skin, or a toe-nail quicked may occur. Additionally, problems occasionally arise after the grooming visit such as bleeding of nicks, clipper irritation, eyes irritation, mental or physical stress. Grooming can also expose a hidden medical problem or aggravate a current one. Owner agrees not to hold All Tails Wag Grooming LLC for any injuries, which might result from this grooming process.

Health and Behavior of Pet: I agree and understand that All Tails Wag Grooming LLC has relied upon my representation that my pet is in good health, has not injured or shown threatening behavior to any persons or animals, is current on all required vaccinations and is free of parasites. All Tails Wag Grooming LLC reserves the right to refuse service, or to stop a groom in progress, if your pet may pose a threat to themselves, other pets or staff, whether it be an aggression problem, health problem, or parasite problem.

Owner Responsibility: The owner agrees to be solely responsible and liable for any and all acts of behavior of their pet. This may include, but is not limited to, injury or death to pet, injury or death to another pet(s), or injury or death to a staff member or any other member of the public. Medical treatment expenses required by a staff member, a member of the public or for another pet will be the sole responsibility of the pet owner.

Matted Hair on Pets: Owner is aware that we don't charge additional fees if the hair on pet is in a matted condition, but if in fact the hair is knotted the groomer will have to shave the hair down.

Additional Services: I agree and understand that De-matting, De-shedding, Flea and Tick Treatments, Medicated Shampoo, Special Cuts, Special Needs for aging or Health problems, Aggressive or bad behaviors or any additional services will cause extra charges.

Driver fee will be applied even if we can't do the service because of aggressive or bad behaviors.`,
};

// ===== ESPECIES =====
const SPECIES = [
  { id: 'dog',    label: 'Perro',   icon: '🐕', hasSize: true,  hasHair: true  },
  { id: 'cat',    label: 'Gato',    icon: '🐈', hasSize: false, hasHair: false },
  { id: 'rabbit', label: 'Conejo',  icon: '🐇', hasSize: false, hasHair: false },
  { id: 'bird',   label: 'Ave',     icon: '🦜', hasSize: false, hasHair: false },
  { id: 'goat',   label: 'Cabra',   icon: '🐐', hasSize: false, hasHair: false },
  { id: 'exotic', label: 'Exótico', icon: '🦔', hasSize: false, hasHair: false },
];
const getSpecies = (id) => SPECIES.find(s => s.id === id) || SPECIES[0];

const CAT_BREEDS = [
  'Persian','Maine Coon','Siamese','British Shorthair','Ragdoll','Bengal',
  'Abyssinian','Sphynx','Scottish Fold','Norwegian Forest Cat','Turkish Angora',
  'Russian Blue','Birman','Burmese','Himalayan','Devon Rex','Cornish Rex',
  'American Shorthair','Domestic Shorthair','Domestic Longhair','Mixed Breed',
];

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
  'Abyssinian','Persian','Siamese','Mixed Breed','Monthtizo',
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
    species: pet.species || 'dog',
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
    .select(`*, appointment_pets(*, pets(*))`)
    .order('date').order('time_start', { nullsFirst: true });
  if (error) { console.error('loadAppointments error:', error); return []; }
  // Cargar clientes por separado para evitar conflicto de tipos
  const clientIds = [...new Set((data || []).map(a => a.client_id).filter(Boolean))];
  let clientMap = {};
  if (clientIds.length > 0) {
    const { data: cData } = await supabase.from('clients').select('*').in('id', clientIds);
    (cData || []).forEach(c => { clientMap[c.id] = c; });
  }
  return (data || []).map(a => ({
    id: a.id, date: a.date, timeStart: a.time_start, timeEnd: a.time_end || '',
    vanId: a.van_id, clientId: a.client_id, status: a.status || 'unconfirmed',
    notes: a.notes || '', alertNotes: a.alert_notes || '',
    agreementSigned: a.agreement_signed || false,
    groomerId: a.groomer_id || null,
    companyId: a.company_id || 'epw',
    client: clientMap[a.client_id] ? { id: clientMap[a.client_id].id, name: clientMap[a.client_id].name, phone: clientMap[a.client_id].phone, address: clientMap[a.client_id].address } : null,
    pets: (a.appointment_pets || []).map(ap => ({
      id: ap.id, petId: ap.pet_id, service: ap.service || '', amount: parseFloat(ap.amount) || 0,
      tip: parseFloat(ap.tip) || 0, cardFee: parseFloat(ap.card_fee) || 0,
      method: ap.method || 'Cash', status: ap.status || 'pending',
      checkinTime: ap.checkin_time || '', checkoutTime: ap.checkout_time || '',
      pet: ap.pets ? { id: ap.pets.id, name: ap.pets.name, breed: ap.pets.breed, size: ap.pets.size, lastBlade: ap.pets.last_blade, lastCombo: ap.pets.last_combo, allergies: ap.pets.allergies, behavior_notes: ap.pets.behavior_notes } : null,
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
    groomer_id: appt.groomerId || null,
    company_id: appt.companyId || 'epw',
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
    card_fee: ap.cardFee || 0, method: ap.method || 'Cash',
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
    commissionPct: parseFloat(v.commission_pct) || 45, active: v.active !== false,
    companyId: v.company_id || 'epw',
  }));
};

const loadCompanies = async () => {
  const { data, error } = await supabase.from('companies').select('*').order('sort_order');
  if (error) { console.error(error); return DEFAULT_COMPANIES; }
  return (data || DEFAULT_COMPANIES).map(c => ({
    id: c.id, name: c.name, logoEmoji: c.logo_emoji || '🐾',
    gasFee: parseFloat(c.gas_fee) || 7, cardFeePct: parseFloat(c.card_fee_pct) || 5.5,
    active: c.active !== false, sortOrder: c.sort_order || 0,
  }));
};

const saveCompany = async (company) => {
  const { error } = await supabase.from('companies').upsert({
    id: company.id, name: company.name, logo_emoji: company.logoEmoji || '🐾',
    gas_fee: company.gasFee || 7, card_fee_pct: company.cardFeePct || 5.5,
    active: company.active !== false, sort_order: company.sortOrder || 0,
  });
  if (error) console.error(error);
  return !error;
};
const saveVan = async (van) => {
  const { error } = await supabase.from('vans').upsert({
    id: van.id, name: van.name, groomer: van.groomer || '', pin: van.pin,
    commission_pct: van.commissionPct || 45,
  });
  if (error) console.error(error);
};
const loadGroomers = async () => {
  const { data, error } = await supabase.from('groomers').select('*').order('name');
  if (error) { console.error(error); return []; }
  return (data || []).map(g => ({
    id: g.id, name: g.name, pin: g.pin,
    commissionPct: parseFloat(g.commission_pct) || 45,
    vanId: g.van_id, active: g.active !== false, language: g.language || 'es',
  }));
};
const saveGroomer = async (groomer) => {
  const { error } = await supabase.from('groomers').upsert({
    id: groomer.id, name: groomer.name, pin: groomer.pin,
    commission_pct: groomer.commissionPct || 45,
    van_id: groomer.vanId || null, active: groomer.active !== false,
    language: groomer.language || 'es',
  });
  if (error) console.error(error);
  return !error;
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
  if (error) return { commissionPct: 45, tipsToGroomer: 100, adminPin: DEFAULT_ADMIN_PIN, cardFeePct: 5.5, gasFee: 7.00, taxRate: 7.0 };
  return {
    commissionPct: parseFloat(data.commission_pct) || 45,
    tipsToGroomer: parseFloat(data.tips_to_groomer) || 100,
    adminPin: data.admin_pin || DEFAULT_ADMIN_PIN,
    cardFeePct: parseFloat(data.card_fee_pct) || 5.5,
    gasFee: parseFloat(data.gas_fee) || 7.00,
    taxRate: parseFloat(data.tax_rate) || 7.0,
  };
};
const saveSettings = async (s) => {
  await supabase.from('settings').upsert({
    id: 1, commission_pct: s.commissionPct, tips_to_groomer: s.tipsToGroomer,
    admin_pin: s.adminPin, card_fee_pct: s.cardFeePct, gas_fee: s.gasFee,
    tax_rate: s.taxRate || 7.0,
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
  // Delete foto del storage también
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

// ===== INVOICES =====
const getNextInvoiceNumber = async (companyId) => {
  const year = new Date().getFullYear();
  const prefix = companyId === 'epw' ? 'EPW' : 'ATW';
  const seqId = `${companyId}-${year}`;

  // Obtener o crear secuencia
  const { data: existing } = await supabase
    .from('invoice_sequences')
    .select('*')
    .eq('company_id', companyId)
    .eq('year', year)
    .single();

  let nextNum = 1;
  if (existing) {
    nextNum = (existing.last_number || 0) + 1;
    await supabase.from('invoice_sequences')
      .update({ last_number: nextNum })
      .eq('company_id', companyId).eq('year', year);
  } else {
    await supabase.from('invoice_sequences')
      .insert({ id: seqId, company_id: companyId, year, last_number: 1 });
  }

  return `${prefix}-${year}-${String(nextNum).padStart(4, '0')}`;
};

const saveInvoice = async (invoice) => {
  const { error } = await supabase.from('invoices').upsert({
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    company_id: invoice.companyId,
    appointment_id: invoice.appointmentId || null,
    client_id: invoice.clientId || null,
    client_name: invoice.clientName,
    client_address: invoice.clientAddress || '',
    groomer_name: invoice.groomerName || '',
    van_name: invoice.vanName || '',
    date: invoice.date,
    services: JSON.stringify(invoice.services || []),
    subtotal: invoice.subtotal,
    gas_fee: invoice.gasFee,
    card_fee: invoice.cardFee,
    tip: invoice.tip,
    total: invoice.total,
    method: invoice.method,
    status: 'paid',
  });
  if (error) console.error('Invoice save error:', error);
  return !error;
};

// ===== GROOMER PAYMENTS =====
const loadGroomerPayments = async () => {
  const { data, error } = await supabase.from('groomer_payments').select('*').order('date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
};

const saveGroomerPayment = async (payment) => {
  const { error } = await supabase.from('groomer_payments').insert({
    id: payment.id, groomer_id: payment.groomerId, groomer_name: payment.groomerName,
    amount: payment.amount, method: payment.method || 'cash', date: payment.date,
    notes: payment.notes || '', period_start: payment.periodStart || null,
    period_end: payment.periodEnd || null, created_by: payment.createdBy || '',
  });
  if (error) console.error(error);
  return !error;
};

// ===== GROOMING PHOTOS =====
const loadGroomingPhotos = async (appointmentId) => {
  const { data, error } = await supabase.from('grooming_photos')
    .select('*').eq('appointment_id', appointmentId).order('created_at');
  if (error) { console.error(error); return []; }
  return data || [];
};

const saveGroomingPhoto = async (photo) => {
  const { error } = await supabase.from('grooming_photos').insert({
    id: photo.id, appointment_id: photo.appointmentId,
    pet_id: photo.petId || null, pet_name: photo.petName || '',
    photo_url: photo.photoUrl, type: photo.type || 'after',
    created_by: photo.createdBy || '',
  });
  if (error) console.error(error);
  return !error;
};

const deleteGroomingPhoto = async (id) => {
  await supabase.from('grooming_photos').delete().eq('id', id);
};

// ===== ADDRESS AUTOCOMPLETE =====
const GOOGLE_PLACES_KEY = 'AIzaSyBR-RQ639CWkt-SprO3EM4iHp89ahPVvmE';

function AddressAutocomplete({ value, onChange, placeholder = 'Start typing address...', style = {} }) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const sessionTokenRef = useRef(null);

  useEffect(() => { setInputValue(value || ''); }, [value]);

  useEffect(() => {
    const waitForGoogle = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(waitForGoogle);
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    }, 300);
    return () => clearInterval(waitForGoogle);
  }, []);

  const fetchSuggestions = async (input) => {
    if (!input || input.length < 3 || !window.google?.maps?.places) return;
    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input,
        sessionToken: sessionTokenRef.current,
        types: ['address'],
        componentRestrictions: { country: 'us' },
      }, (predictions, status) => {
        if (status === 'OK' && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      });
    } catch (err) {
      console.error('Places error:', err);
    }
  };

  const handleSelect = (prediction) => {
    setShowSuggestions(false);
    setSuggestions([]);
    if (!window.google?.maps?.places) return;
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails({
      placeId: prediction.place_id,
      fields: ['formatted_address', 'address_components'],
      sessionToken: sessionTokenRef.current,
    }, (place, status) => {
      if (status !== 'OK' || !place) return;
      const get = (type) => place.address_components?.find(c => c.types.includes(type))?.long_name || '';
      const getShort = (type) => place.address_components?.find(c => c.types.includes(type))?.short_name || '';
      const address = place.formatted_address;
      const zip = get('postal_code');
      const city = get('locality') || get('sublocality') || get('neighborhood');
      const state = getShort('administrative_area_level_1');
      setInputValue(address);
      onChange({ address, zip, city, state });
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    });
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        value={inputValue}
        onChange={e => {
          const val = e.target.value;
          setInputValue(val);
          onChange({ address: val });
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        style={{ ...styles.input, ...style }}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 9999, maxHeight: 240, overflowY: 'auto' }}>
          {suggestions.map(s => (
            <div key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>📍 {s.structured_formatting?.main_text}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{s.structured_formatting?.secondary_text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ===== EXPORT FUNCTIONS =====
const exportToPDF = (title, columns, rows, filename) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(15, 118, 110);
  doc.text('Groomora', 14, 18);
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);
  autoTable(doc, {
    startY: 42,
    head: [columns],
    body: rows,
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    styles: { cellPadding: 3 },
  });
  doc.save(`${filename}.pdf`);
};

const exportToExcel = (title, columns, rows, filename) => {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Groomora — ' + title],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    columns,
    ...rows,
  ]);
  ws['!cols'] = columns.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Weekly Report Export
const exportWeeklyPDF = (groomers, vans, services, settings, dateStart, dateEnd) => {
  const rows = groomers.filter(g => g.active !== false).map(g => {
    const van = vans.find(v => v.id === g.vanId);
    const groomerSvcs = services.filter(s => inRange(s.date, dateStart, dateEnd) && s.vanId === g.vanId);
    const sales = groomerSvcs.reduce((sum, s) => sum + s.amount, 0);
    const tips = groomerSvcs.reduce((sum, s) => sum + (s.tip || 0), 0);
    const commission = sales * (g.commissionPct || 45) / 100;
    return [g.name, van?.name || '', groomerSvcs.length, `$${sales.toFixed(2)}`, `$${tips.toFixed(2)}`, `${g.commissionPct || 45}%`, `$${commission.toFixed(2)}`];
  });
  exportToPDF(
    `Weekly Report: ${dateStart} to ${dateEnd}`,
    ['Groomer', 'Van', 'Services', 'Sales', 'Tips', 'Commission %', 'Commission $'],
    rows,
    `weekly-report-${dateStart}`
  );
};

const exportWeeklyExcel = (groomers, vans, services, settings, dateStart, dateEnd) => {
  const rows = groomers.filter(g => g.active !== false).map(g => {
    const van = vans.find(v => v.id === g.vanId);
    const groomerSvcs = services.filter(s => inRange(s.date, dateStart, dateEnd) && s.vanId === g.vanId);
    const sales = groomerSvcs.reduce((sum, s) => sum + s.amount, 0);
    const tips = groomerSvcs.reduce((sum, s) => sum + (s.tip || 0), 0);
    const commission = sales * (g.commissionPct || 45) / 100;
    return [g.name, van?.name || '', groomerSvcs.length, sales.toFixed(2), tips.toFixed(2), `${g.commissionPct || 45}%`, commission.toFixed(2)];
  });
  exportToExcel(
    `Weekly Report ${dateStart}`,
    ['Groomer', 'Van', 'Services', 'Sales', 'Tips', 'Commission %', 'Commission $'],
    rows,
    `weekly-report-${dateStart}`
  );
};

// Daily Close Export
const exportDailyPDF = (services, vans, dateStart, dateEnd, settings) => {
  const rows = services.filter(s => inRange(s.date, dateStart, dateEnd)).map(s => {
    const van = vans.find(v => v.id === s.vanId);
    return [s.date, van?.name || '', s.clientName || '', s.amount?.toFixed(2) || '0', s.tip?.toFixed(2) || '0', s.method || '', s.gasFee?.toFixed(2) || '0'];
  });
  const total = services.filter(s => inRange(s.date, dateStart, dateEnd)).reduce((sum, s) => sum + s.amount, 0);
  rows.push(['', '', 'TOTAL', `$${total.toFixed(2)}`, '', '', '']);
  exportToPDF(
    `Daily Close: ${dateStart}${dateStart !== dateEnd ? ` to ${dateEnd}` : ''}`,
    ['Date', 'Van', 'Client', 'Amount', 'Tip', 'Method', 'Gas Fee'],
    rows,
    `daily-close-${dateStart}`
  );
};

// P&L Export
const exportPLPDF = (services, expenses, vans, settings, dateStart, dateEnd) => {
  DEFAULT_COMPANIES.forEach(company => {
    const compSvcs = services.filter(s => inRange(s.date, dateStart, dateEnd) && vans.find(v => v.id === s.vanId)?.companyId === company.id);
    const compExp = expenses.filter(e => inRange(e.date, dateStart, dateEnd) && vans.find(v => v.id === e.vanId)?.companyId === company.id);
    const revenue = compSvcs.reduce((s, i) => s + i.amount, 0);
    const gasFees = compSvcs.length * (settings?.gasFee || 7);
    const companyIncome = revenue * 0.55 + gasFees;
    const totalExp = compExp.reduce((s, e) => s + e.amount, 0);
    const netProfit = companyIncome - totalExp;
    exportToPDF(
      `P&L — ${company.name}: ${dateStart} to ${dateEnd}`,
      ['Item', 'Amount'],
      [
        ['Gross Sales', `$${revenue.toFixed(2)}`],
        ['Company Revenue (55%)', `$${(revenue * 0.55).toFixed(2)}`],
        ['Gas Fee Income', `$${gasFees.toFixed(2)}`],
        ['Total Revenue', `$${companyIncome.toFixed(2)}`],
        ['Operating Expenses', `-$${totalExp.toFixed(2)}`],
        ['NET PROFIT', `$${netProfit.toFixed(2)}`],
      ],
      `pl-${company.id}-${dateStart}`
    );
  });
};

// ===== FUEL LOGS =====
const loadFuelLogs = async () => {
  const { data, error } = await supabase.from('fuel_logs').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(f => ({
    id: f.id, vanId: f.van_id, date: f.date,
    odometer: parseFloat(f.odometer) || 0, amount: parseFloat(f.amount) || 0,
    method: f.method || 'cash', station: f.station || '',
    receiptUrl: f.receipt_url || null, createdBy: f.created_by || '',
  }));
};

const saveFuelLog = async (log) => {
  const { error } = await supabase.from('fuel_logs').insert({
    id: log.id, van_id: log.vanId, date: log.date,
    odometer: log.odometer, amount: log.amount,
    method: log.method || 'cash', station: log.station || '',
    receipt_url: log.receiptUrl || null, created_by: log.createdBy || '',
  });
  if (error) console.error(error);
  return !error;
};

const deleteFuelLog = async (id) => {
  await supabase.from('fuel_logs').delete().eq('id', id);
};

// ===== GASTOS EMPRESA =====
const loadCompanyExpenses = async () => {
  const { data, error } = await supabase.from('company_expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(e => ({
    id: e.id, companyId: e.company_id, category: e.category,
    description: e.description || '', amount: parseFloat(e.amount) || 0,
    method: e.method || 'cash', vanId: e.van_id || null,
    receiptUrl: e.receipt_url || null, date: e.date, createdBy: e.created_by || '',
  }));
};

const saveCompanyExpense = async (expense) => {
  const { error } = await supabase.from('company_expenses').upsert({
    id: expense.id, company_id: expense.companyId, category: expense.category,
    description: expense.description || '', amount: expense.amount,
    method: expense.method || 'cash', van_id: expense.vanId || null,
    receipt_url: expense.receiptUrl || null, date: expense.date,
    created_by: expense.createdBy || '',
  });
  if (error) console.error(error);
  return !error;
};

const deleteCompanyExpense = async (id) => {
  await supabase.from('company_expenses').delete().eq('id', id);
};

// ===== INVENTARIO =====
const loadInventoryItems = async () => {
  const { data, error } = await supabase.from('inventory_items').select('*').eq('active', true).order('sort_order');
  if (error) { console.error(error); return []; }
  return data || [];
};

const loadInventoryRequests = async () => {
  const { data, error } = await supabase
    .from('inventory_requests')
    .select(`*, inventory_request_items(*, inventory_items(*))`)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error(error); return []; }
  return data || [];
};

const saveInventoryRequest = async (req, items) => {
  const { error } = await supabase.from('inventory_requests').insert({
    id: req.id, van_id: req.vanId, groomer_id: req.groomerId,
    groomer_name: req.groomerName, status: 'pending', notes: req.notes || '',
  });
  if (error) { console.error(error); return false; }
  for (const item of items) {
    await supabase.from('inventory_request_items').insert({
      id: uid(), request_id: req.id, item_id: item.itemId,
      item_name: item.itemName, quantity: item.quantity,
    });
  }
  return true;
};

const markRequestDelivered = async (requestId) => {
  await supabase.from('inventory_requests').update({
    status: 'delivered', delivered_at: new Date().toISOString(),
  }).eq('id', requestId);
};

// ===== APP =====
export default function App() {
  const [tab, setTab] = useState('registro');
  const [loading, setLoading] = useState(true);
  const [vans, setVans] = useState(DEFAULT_VANS);
  const [services, setServices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState({ commissionPct: 45, tipsToGroomer: 100, adminPin: DEFAULT_ADMIN_PIN, cardFeePct: 5.5, gasFee: 7.00, taxRate: 7.0 });
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [servicePrices, setServicePrices] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [companies, setCompanies] = useState(DEFAULT_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryRequests, setInventoryRequests] = useState([]);
  const [companyExpenses, setCompanyExpenses] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [groomerPayments, setGroomerPayments] = useState([]);
  const lang = 'en';
  const t = useT(lang);

  useEffect(() => {
    (async () => {
      const [v, s, st, ex, cats, us, appts, cls, pts, svc, gr, cos, invItems, invReqs, compExp, fuel, payments] = await Promise.all([
        loadVans(), loadServices(), loadSettings(), loadExpenses(),
        loadCategories(), loadUsers(), loadAppointments(), loadClients(), loadPets(),
        loadServicePrices(), loadGroomers(), loadCompanies(),
        loadInventoryItems(), loadInventoryRequests(), loadCompanyExpenses(), loadFuelLogs(), loadGroomerPayments()
      ]);
      setVans(v); setServices(s); setSettings(st); setExpenses(ex);
      setCategories(cats); setUsers(us); setAppointments(appts);
      setClients(cls); setPets(pts); setServicePrices(svc); setGroomers(gr);
      setCompanies(cos); setInventoryItems(invItems); setInventoryRequests(invReqs);
      setCompanyExpenses(compExp); setFuelLogs(fuel); setGroomerPayments(payments);
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

  const updateCompany = async (company) => {
    setCompanies(prev => prev.map(c => c.id === company.id ? company : c));
    await saveCompany(company);
  };

  const addGroomer = async (groomer) => {
    const ok = await saveGroomer(groomer);
    if (ok) setGroomers(prev => [...prev, groomer].sort((a,b) => a.name.localeCompare(b.name)));
    return ok;
  };
  const updateGroomer = async (groomer) => {
    const ok = await saveGroomer(groomer);
    if (ok) setGroomers(prev => prev.map(g => g.id === groomer.id ? groomer : g));
    return ok;
  };
  const toggleGroomerActive = async (id, active) => {
    await supabase.from('groomers').update({ active }).eq('id', id);
    setGroomers(prev => prev.map(g => g.id === id ? { ...g, active } : g));
  };
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

  // Clients
  const addClient = async (client) => {
    const ok = await saveClient(client);
    if (ok) setClients(prev => [client, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
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

    const msg = `⚠️ ¿Delete a ${client?.name}?\n\nEsto eliminará permanentemente:\n• ${clientPetsList.length} mascota(s)\n• ${clientAppts.length} cita(s)\n• Todas las fichas de grooming\n\nNo se puede deshacer.`;
    if (!confirm(msg)) return;

    // Delete estado local
    setClients(prev => prev.filter(c => c.id !== id));
    setPets(prev => prev.filter(p => p.client_id !== id));
    setAppointments(prev => prev.filter(a => a.clientId !== id));

    // Delete en Supabase en cascada
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
        <p style={{ marginTop: 12, color: '#475569', fontFamily: 'Manrope, sans-serif' }}>Loading...</p>
      </div>
    );
  }

  if (!session) return <LoginScreen users={users} vans={vans} groomers={groomers} companies={companies} onLogin={setSession} loadingUsers={loading} />;

  const isAdmin = session.role === 'admin';
  const isManager = session.role === 'manager';
  const isGroomer = session.role === 'groomer';
  const canViewFinances = session.permissions?.can_view_finances || isAdmin;
  const canViewReports = session.permissions?.can_view_reports || isAdmin;
  const canEditConfig = session.permissions?.can_edit_config || isAdmin;
  const canViewAllSchedule = session.permissions?.can_view_all_schedule || isAdmin;

  // Company activa
  const activeCompanyId = session.companyId || 'epw';
  const activeCompany = companies.find(c => c.id === activeCompanyId) || DEFAULT_COMPANIES[0];

  const currentVan = isGroomer ? vans.find(v => v.id === session.vanId) : null;
  const visibleServices = canViewAllSchedule ? services : services.filter(s => s.vanId === session.vanId);
  const visibleExpenses = canViewAllSchedule ? expenses : expenses.filter(e => e.vanId === session.vanId);
  // Admin ve todas las vans, groomer solo la suya
  const visibleVans = isGroomer
    ? (currentVan ? [currentVan] : [])
    : vans; // Admin y manager ven todas

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
        onLogout={() => setSession(null)}
        activeCompany={activeCompany} />
      <main style={styles.main}>
        {tab === 'citas' && (
          <CitasTab
            appointments={appointments} vans={visibleVans} clients={clients} pets={pets}
            session={{ ...session, groomers }} settings={settings} isAdmin={isAdmin || session?.role === 'manager'}
            canViewAllSchedule={canViewAllSchedule} updateApptStatus={updateApptStatus}
            addAppointment={addAppointment} addClient={addClient} addPet={addPet}
            refreshAppointments={refreshAppointments} deleteAppt={deleteAppt}
            servicePrices={servicePrices}
          />
        )}
        {tab === 'clientes' && (
          <ClientsTab
            clients={clients} pets={pets} appointments={appointments}
            session={session} isAdmin={isAdmin || session?.role === 'manager'}
            addClient={addClient} updateClient={updateClient} removeClient={removeClient}
            addPet={addPet} updatePet={updatePet}
            servicePrices={servicePrices} addAppointment={addAppointment} vans={visibleVans}
            settings={{ ...settings, companies, groomersList: groomers }}
            refreshAppointments={refreshAppointments}
          />
        )}
        {tab === 'razas' && <RazasTab session={session} />}
        {tab === 'registro' && (
          <RegistroTab
            vans={visibleVans} services={visibleServices} addService={addService}
            updateService={updateService} removeService={removeService}
            fixedVanId={isGroomer ? session.vanId : null} settings={settings}
            isAdmin={isAdmin || isManager}
            fuelLogs={fuelLogs} setFuelLogs={setFuelLogs}
            expenses={visibleExpenses} addExpense={addExpense} removeExpense={removeExpense}
            categories={categories} lang={lang}
          />
        )}
        {tab === 'cierre' && <CierreTab vans={visibleVans} services={visibleServices} expenses={visibleExpenses} isAdmin={canViewAllSchedule} settings={settings} />}
        {tab === 'semana' && canViewReports && <WeekTab vans={vans} services={services} expenses={expenses} settings={settings} appointments={appointments} groomers={groomers} />}
        {tab === 'dashboard' && isAdmin && <DashboardTab vans={vans} services={services} expenses={expenses} settings={settings} appointments={appointments} groomers={groomers} companies={companies} companyExpenses={companyExpenses} />}
        {tab === 'config' && canEditConfig && (
          <ConfigTab vans={vans} updateVans={updateVans} settings={settings} updateSettings={updateSettings}
            services={services} clearServices={clearServices} categories={categories}
            addCategory={addCategory} removeCategory={removeCategory} expenses={expenses}
            users={users} addUser={addUser} updateUser={updateUser} toggleUserActive={toggleUserActive}
            servicePrices={servicePrices} updateServicePrice={updateServicePrice} addServicePrice={addServicePrice}
            groomers={groomers} addGroomer={addGroomer} updateGroomer={updateGroomer} toggleGroomerActive={toggleGroomerActive}
          />
        )}
        {tab === 'payroll' && isAdmin && (
          <PayrollTab
            groomers={groomers} vans={vans} services={services}
            appointments={appointments} settings={settings}
            groomerPayments={groomerPayments}
            setGroomerPayments={setGroomerPayments}
            session={session}
          />
        )}
        {tab === 'gastos-empresa' && isAdmin && (
          <ExpensesCompanyTab
            vans={vans} session={session} companies={companies}
            companyExpenses={companyExpenses}
            setCompanyExpenses={setCompanyExpenses}
            taxRate={settings.taxRate ?? 7.0}
          />
        )}
        {tab === 'inventario' && (
          <InventarioTab
            vans={vans} session={session} isAdmin={isAdmin || isManager}
            inventoryItems={inventoryItems} setInventoryItems={setInventoryItems}
            inventoryRequests={inventoryRequests} setInventoryRequests={setInventoryRequests}
            groomers={groomers}
          />
        )}
        {tab === 'auditoria' && isAdmin && <AuditoriaTab />}
      </main>
      <footer style={styles.footer}><Sparkles size={12} /> El Pet Wash · Daily Close</footer>
    </div>
  );
}

// ===== INVOICE MODAL =====
function InvoiceModal({ invoice, onClose }) {
  const company = DEFAULT_COMPANIES.find(c => c.id === invoice.companyId) || DEFAULT_COMPANIES[0];
  const invoiceRef = React.useRef(null);

  const thankYouMsg = invoice.companyId === 'epw'
    ? 'Thank you for choosing El Pet Wash!'
    : 'Thank you for choosing All Tails Wag!';

  const formattedDate = new Date(invoice.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleWhatsApp = () => {
    const msg = `🐾 *${company.name}*\nInvoice: ${invoice.invoiceNumber}\nDate: ${formattedDate}\nClient: ${invoice.clientName}\n\n${(invoice.services || []).map(s => `• ${s.petName} — ${s.service}: $${s.amount}`).join('\n')}\n\nSubtotal: $${invoice.subtotal?.toFixed(2)}\nGas fee: $${invoice.gasFee?.toFixed(2)}${invoice.cardFee > 0 ? `\nCard fee: $${invoice.cardFee?.toFixed(2)}` : ''}${invoice.tip > 0 ? `\nTip: $${invoice.tip?.toFixed(2)}` : ''}\n*TOTAL: $${invoice.total?.toFixed(2)}*\nPaid with: ${invoice.method}\n\n${thankYouMsg}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadPDF = () => {
    const content = invoiceRef.current;
    if (!content) return;
    // Crear versión imprimible
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: 'Georgia', serif; max-width: 600px; margin: 40px auto; color: #0f172a; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 48px; margin-bottom: 8px; }
            .company { font-size: 24px; font-weight: 700; }
            .invoice-num { font-size: 14px; color: #64748b; margin-top: 4px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
            .section { margin: 20px 0; }
            .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 700; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .service-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .service-name { color: #0f172a; }
            .service-addon { color: #64748b; padding-left: 16px; }
            .service-amount { font-weight: 600; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #64748b; }
            .grand-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 20px; font-weight: 700; border-top: 2px solid #0f172a; margin-top: 8px; }
            .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${company.logoEmoji}</div>
            <div class="company">${company.name} LLC</div>
            <div class="invoice-num">Invoice ${invoice.invoiceNumber}</div>
          </div>

          <div class="section">
            <div class="info-row"><span><b>Date:</b> ${formattedDate}</span></div>
            <div class="info-row"><span><b>Client:</b> ${invoice.clientName}</span></div>
            ${invoice.clientAddress ? `<div class="info-row"><span><b>Address:</b> ${invoice.clientAddress}</span></div>` : ''}
            <div class="info-row"><span><b>Groomer:</b> ${invoice.groomerName}</span></div>
            <div class="info-row"><span><b>Payment:</b> ${invoice.method}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Services</div>
            ${(invoice.services || []).map(s => `
              <div class="service-row">
                <span class="service-name">🐾 ${s.petName}${s.service ? ` — ${s.service}` : ''}</span>
                <span class="service-amount">$${(s.amount || 0).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="section-title">Summary</div>
            <div class="total-row"><span>Subtotal</span><span>$${invoice.subtotal?.toFixed(2)}</span></div>
            <div class="total-row"><span>Gas fee</span><span>$${invoice.gasFee?.toFixed(2)}</span></div>
            ${invoice.cardFee > 0 ? `<div class="total-row"><span>Credit card fee (${invoice.companyId === 'epw' ? '5.5' : '5.5'}%)</span><span>$${invoice.cardFee?.toFixed(2)}</span></div>` : ''}
            ${invoice.tip > 0 ? `<div class="total-row"><span>Tip</span><span>$${invoice.tip?.toFixed(2)}</span></div>` : ''}
            <div class="grand-total"><span>TOTAL</span><span>$${invoice.total?.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            <p><b>${thankYouMsg}</b></p>
            <p>Miami, FL · ${company.name} LLC</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div ref={invoiceRef} style={{ background: '#fff', borderRadius: 20, padding: 0, maxWidth: 500, width: '100%', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.4)' }}>

        {/* Header empresa */}
        <div style={{ background: invoice.companyId === 'epw' ? '#0f766e' : '#7c3aed', padding: '24px 28px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 6 }}>{company.logoEmoji}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700 }}>{company.name} LLC</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Invoice #{invoice.invoiceNumber}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Miami, FL</div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* Info cita */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 16, fontSize: 13 }}>
            <div style={{ color: '#64748b' }}>Date</div>
            <div style={{ fontWeight: 500 }}>{formattedDate}</div>
            <div style={{ color: '#64748b' }}>Cliente</div>
            <div style={{ fontWeight: 500 }}>{invoice.clientName}</div>
            {invoice.clientAddress && <>
              <div style={{ color: '#64748b' }}>Dirección</div>
              <div style={{ fontSize: 12 }}>{invoice.clientAddress}</div>
            </>}
            <div style={{ color: '#64748b' }}>Groomer</div>
            <div style={{ fontWeight: 500 }}>{invoice.groomerName}</div>
            <div style={{ color: '#64748b' }}>Método</div>
            <div><MethodChip method={invoice.method} /></div>
          </div>

          {/* Services desglosados */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Services</div>
            {(invoice.services || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>🐾 {s.petName}</div>
                  {s.service && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.service}</div>}
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>${(s.amount || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
              <span>Subtotal</span><span>${invoice.subtotal?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
              <span>Fee gasolina</span><span>${invoice.gasFee?.toFixed(2)}</span>
            </div>
            {invoice.cardFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7c3aed', marginBottom: 6 }}>
                <span>Fee tarjeta (5.5%)</span><span>${invoice.cardFee?.toFixed(2)}</span>
              </div>
            )}
            {invoice.tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                <span>Propina</span><span>${invoice.tip?.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#0f172a', paddingTop: 10, borderTop: '2px solid #e2e8f0', marginTop: 6 }}>
              <span>TOTAL</span><span>${invoice.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Mensaje */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', fontStyle: 'italic', marginBottom: 20 }}>
            {thankYouMsg}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <button onClick={handleDownloadPDF}
              style={{ ...styles.btnSecondary, justifyContent: 'center', padding: '12px' }}>
              📄 Descargar PDF
            </button>
            <button onClick={handleWhatsApp}
              style={{ padding: '12px', borderRadius: 8, border: 'none', background: '#25d366', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              💬 WhatsApp
            </button>
          </div>
          <button onClick={onClose}
            style={{ ...styles.btnSecondary, width: '100%', justifyContent: 'center', padding: '11px' }}>
            ✕ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== SIGNATURE MODAL =====
function SignatureModal({ appt, companyId, onSave, onClose }) {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const company = DEFAULT_COMPANIES.find(c => c.id === (companyId || 'epw')) || DEFAULT_COMPANIES[0];
  const agreementText = AGREEMENTS[companyId || 'epw'] || AGREEMENTS.epw;

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const pos = getPos(e, canvas);
    setIsDrawing(true);
    setLastPos(pos);
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setLastPos(pos);
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSave = () => {
    if (!hasSigned) { alert('Por favor firma antes de continuar'); return; }
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 560, width: '100%', maxHeight: '95vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Service Agreement</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {company.logoEmoji} {company.name}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        {/* Info cita */}
        <div style={{ padding: '10px 14px', background: '#f0fdfa', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
          <strong>{appt.client?.name}</strong>
          {appt.pets?.length > 0 && <span style={{ color: '#64748b' }}> · {appt.pets.map(ap => ap.pet?.name).filter(Boolean).join(', ')}</span>}
        </div>

        {/* Texto del agreement */}
        <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20, maxHeight: 220, overflowY: 'auto' }}>
          <pre style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'Manrope, sans-serif', margin: 0 }}>
            {agreementText}
          </pre>
        </div>

        {/* Canvas de firma */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Firma del cliente</label>
            {hasSigned && (
              <button onClick={clearCanvas} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                ✕ Delete firma
              </button>
            )}
          </div>
          <div style={{ border: '2px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fafaf7', position: 'relative' }}>
            <canvas
              ref={canvasRef}
              width={510}
              height={150}
              style={{ display: 'block', width: '100%', height: 150, cursor: 'crosshair', touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {!hasSigned && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 13, color: '#cbd5e1', fontStyle: 'italic' }}>Firma aquí con el dedo o mouse</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>
            Al firmar, el cliente acepta todos los términos del acuerdo de servicio
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569' }}>
            Cancelar
          </button>
          <button onClick={handleSave}
            style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: hasSigned ? '#0f766e' : '#94a3b8', cursor: hasSigned ? 'pointer' : 'not-allowed', fontSize: 15, fontWeight: 700, color: '#fff' }}>
            ✓ Confirmar y guardar firma
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== LOGIN =====
function LoginScreen({ users, vans, groomers: groomersList, companies, onLogin, loadingUsers }) {
  const [step, setStep] = useState('select');
  const [selectedUser, setSelectedUser] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const admins = users.filter(u => u.role === 'admin');
  const managers = users.filter(u => u.role === 'manager');
  const groomers = (groomersList && groomersList.length > 0)
    ? groomersList.filter(g => g.active !== false).map(g => ({
        id: g.id, name: g.name, pin: g.pin, role: 'groomer',
        van_id: g.vanId, vanId: g.vanId, commissionPct: g.commissionPct,
        companyId: g.companyId || 'epw',
        can_create_clients: true, can_view_clients: false, can_schedule: true,
        can_view_all_schedule: false, can_view_finances: false, can_view_reports: false, can_edit_config: false,
      }))
    : users.filter(u => u.role === 'groomer');

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
        vanId: selectedUser.van_id || selectedUser.vanId,
        commissionPct: selectedUser.commissionPct,
        companyId: selectedUser.companyId || 'epw',
        permissions: {
          can_create_clients: selectedUser.can_create_clients ?? true,
          can_view_clients: selectedUser.can_view_clients ?? false,
          can_schedule: selectedUser.can_schedule ?? true,
          can_view_all_schedule: selectedUser.can_view_all_schedule ?? false,
          can_view_finances: selectedUser.can_view_finances ?? false,
          can_view_reports: selectedUser.can_view_reports ?? false,
          can_edit_config: selectedUser.can_edit_config ?? false,
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
    <div style={{ minHeight: '100vh', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...styles.loginCard, maxWidth: step === 'select' ? 560 : 400 }}>
        <div style={styles.loginHeader}>
          <div style={styles.logoBox}><Truck size={20} color="#fff" /></div>
          <div>
            <h1 style={styles.title}>Group Guerrero Orejarena</h1>
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
                Loading usuarios...
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
function Header({ tab, setTab, session, currentVan, canViewFinances, canViewReports, canEditConfig, onLogout, activeCompany, onLanguageChange }) {
  const isAdmin = session?.role === 'admin';
  const isManager = session?.role === 'manager';
  const isGroomer = session?.role === 'groomer';
  const lang = 'en';
  const t = useT(lang);

  const tabs = [
    { id: 'citas',         label: t('tab_citas'),                                    icon: Plus,        show: true },
    { id: 'clientes',      label: t('tab_clientes'),                                 icon: Plus,        show: isAdmin || isManager },
    { id: 'razas',         label: t('tab_razas'),                                    icon: Sparkles,    show: true },
    { id: 'registro',      label: isGroomer ? t('tab_registro') : t('tab_registro_admin'), icon: FileText, show: true },
    { id: 'cierre',        label: isGroomer ? t('tab_cierre') : t('tab_cierre_admin'), icon: FileText,  show: true },
    { id: 'payroll',       label: '💸 Payroll',                                         icon: DollarSign,  show: isAdmin },
    { id: 'gastos-empresa',label: t('tab_gastos'),                                   icon: DollarSign,  show: isAdmin },
    { id: 'inventario',    label: t('tab_inventario'),                               icon: Plus,        show: true },
    { id: 'semana',        label: t('tab_semana'),                                   icon: TrendingUp,  show: canViewReports },
    { id: 'dashboard',     label: t('tab_dashboard'),                                icon: TrendingUp,  show: isAdmin },
    { id: 'auditoria',     label: t('tab_auditoria'),                                icon: FileText,    show: isAdmin },
    { id: 'config',        label: t('tab_config'),                                   icon: SettingsIcon,show: canEditConfig },
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
            <h1 style={styles.title}>{(isAdmin || isManager) ? 'Group Guerrero Orejarena' : (activeCompany?.name || 'El Pet Wash')}</h1>
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
function RegistroTab({ vans, services, addService, updateService, removeService, fixedVanId, settings, expenses, addExpense, removeExpense, categories, isAdmin, fuelLogs, setFuelLogs, lang }) {
  const t = useT('en');
  const [activeSection, setActiveSection] = useState('gastos');
  const [date, setDate] = useState(todayISO());
  const [vanId, setVanId] = useState(fixedVanId || vans[0]?.id || '');
  const [form, setForm] = useState({ client: '', pet: '', service: '', method: 'Cash', amount: '', tip: '' });
  const [editingId, setEditingId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: categories[0] || 'Gasolina', description: '', amount: '', method: 'cash', odometer: '', station: '' });
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
  const calcTotal = (base, tip, method, serviceName = '') => {
    const baseAmt = parseFloat(base) || 0;
    const tipAmt = parseFloat(tip) || 0;
    const isGuarantee = baseAmt === 0 || serviceName.toLowerCase().includes('guarantee');
    const gasFee = isGuarantee ? 0 : (settings?.gasFee || 7);
    const cardFee = (!isGuarantee && method === 'Credit Card') ? ((baseAmt + tipAmt) * ((settings?.cardFeePct || 5.5) / 100)) : 0;
    return { baseAmt, tipAmt, gasFee, cardFee, total: baseAmt + tipAmt + gasFee + cardFee, isGuarantee };
  };

  const currentCalc = calcTotal(form.amount, form.tip, form.method, form.service || '');

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
    const calc = calcTotal(form.amount, form.tip, form.method, form.service || '');
    if (editingId) {
      const existing = services.find(s => s.id === editingId);
      if (existing) updateService({ ...existing, ...form, amount: calc.baseAmt, tip: calc.tipAmt, cardFee: calc.cardFee, vanId, date });
      setEditingId(null);
    } else {
      addService({ id: uid(), date, vanId, client: form.client.trim(), pet: form.pet.trim(), service: form.service.trim(), method: form.method, amount: calc.baseAmt, tip: calc.tipAmt, cardFee: calc.cardFee, createdAt: Date.now() });
    }
    setForm({ client: '', pet: '', service: '', method: 'Cash', amount: '', tip: '' });
  };

  const handleEdit = (s) => {
    setForm({ client: s.client, pet: s.pet, service: s.service, method: s.method, amount: String(s.amount), tip: String(s.tip || '') });
    setEditingId(s.id); setActiveSection('servicios');
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este servicio?')) {
      removeService(id);
      if (editingId === id) { setEditingId(null); setForm({ client: '', pet: '', service: '', method: 'Cash', amount: '', tip: '' }); }
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.amount) { alert('Ingresa el monto del gasto'); return; }
    if (expenseForm.category === 'Gasolina' && !expenseForm.odometer) { alert('Ingresa el odómetro'); return; }
    setUploadingReceipt(true);

    // Descripción automática para gasolina
    const description = expenseForm.category === 'Gasolina'
      ? `Odómetro: ${expenseForm.odometer} mi${expenseForm.station ? ' · ' + expenseForm.station : ''}`
      : expenseForm.description.trim();

    const expenseId = uid();
    await addExpense(
      { id: expenseId, date, vanId, category: expenseForm.category, description, amount: parseFloat(expenseForm.amount) || 0, createdAt: Date.now() },
      receiptFile
    );

    // Si es gasolina → también guardar en fuel_logs
    if (expenseForm.category === 'Gasolina' && expenseForm.odometer) {
      const fuelLog = {
        id: uid(), vanId, date,
        odometer: parseFloat(expenseForm.odometer) || 0,
        amount: parseFloat(expenseForm.amount) || 0,
        method: expenseForm.method || 'cash',
        station: expenseForm.station || '',
      };
      const ok = await saveFuelLog(fuelLog);
      if (ok) setFuelLogs(prev => [fuelLog, ...prev]);
    }

    setExpenseForm({ category: categories[0] || 'Gasolina', description: '', amount: '', method: 'cash', odometer: '', station: '' });
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
      <SectionTitle eyebrow="Daily Log del día" title={formatDateNice(todayISO())} />

      {/* Selector de sección — solo Daily Expenses */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
        <button onClick={() => setActiveSection('gastos')} style={{
          flex: 1, padding: '8px 12px', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: activeSection === 'gastos' ? '#fff' : 'transparent',
          color: activeSection === 'gastos' ? '#dc2626' : '#64748b',
          boxShadow: activeSection === 'gastos' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}>{t('expenses_section')}</button>
      </div>

      {activeSection === 'gastos' ? (
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardH3}>Log Expense</h3>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={styles.lbl}>Date</label>
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
                <label style={styles.lbl}>Amount *</label>
                <input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} style={styles.input} placeholder="0.00" />
              </div>
              <div>
                <label style={styles.lbl}>Método de pago</label>
                <select value={expenseForm.method} onChange={e => setExpenseForm({ ...expenseForm, method: e.target.value })} style={styles.input}>
                  <option value="cash">💵 Cash</option>
                  <option value="tarjeta-empresa">💳 Tarjeta empresa</option>
                </select>
              </div>

              {/* Campos extra solo para gasolina */}
              {expenseForm.category === 'Gasolina' && (
                <>
                  <div>
                    <label style={styles.lbl}>Odómetro (millas) *</label>
                    <input type="number" step="1" value={expenseForm.odometer}
                      onChange={e => setExpenseForm({ ...expenseForm, odometer: e.target.value })}
                      style={styles.input} placeholder="45,230" />
                  </div>
                  <div>
                    <label style={styles.lbl}>Estación (opcional)</label>
                    <input value={expenseForm.station}
                      onChange={e => setExpenseForm({ ...expenseForm, station: e.target.value })}
                      style={styles.input} placeholder="Ej: Shell Brickell" />
                  </div>
                </>
              )}

              {/* Descripción para otras categorías */}
              {expenseForm.category !== 'Gasolina' && (
                <div>
                  <label style={styles.lbl}>Descripción (opcional)</label>
                  <input value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} style={styles.input} placeholder="Ej: Shampoo desodorizante" />
                </div>
              )}

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
                {uploadingReceipt ? 'Subiendo...' : 'Log Expense'}
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
                <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>No expenses registrados</p>
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
                      {isAdmin && <button onClick={() => { if (confirm('¿Eliminar este gasto?')) removeExpense(e.id); }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>}
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
                <label style={styles.lbl}>Date</label>
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
                    <div style={styles.suggestionsHeader}>Clients encontrados · toca para autocompletar</div>
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
                <label style={styles.lbl}>Amount del servicio *</label>
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
                <button onClick={() => { setEditingId(null); setForm({ client: '', pet: '', service: '', method: 'Cash', amount: '', tip: '' }); }} style={styles.btnSecondary}>
                  <X size={15} /> Cancelar
                </button>
              )}
              <button onClick={handleSubmit} style={styles.btnPrimary}>
                {editingId ? <><Check size={15} /> Save cambios</> : <><Plus size={15} /> Agregar servicio</>}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <SectionTitle
              eyebrow={`${currentVan?.name || 'Van'} · ${formatDateNice(date)}`}
              title={`${dayServices.length} servicio${dayServices.length === 1 ? '' : 's'} registrado${dayServices.length === 1 ? '' : 's'}`}
              right={
                <div style={styles.miniStats}>
                  <div><span style={styles.miniLbl}>Sales</span><span style={styles.miniVal}>{fmt(dayTotal)}</span></div>
                  {dayTips > 0 && <div><span style={styles.miniLbl}>Tips</span><span style={styles.miniVal}>{fmt(dayTips)}</span></div>}
                  {dayExpTotal > 0 && <div><span style={styles.miniLbl}>Expenses</span><span style={{ ...styles.miniVal, color: '#dc2626' }}>{fmt(dayExpTotal)}</span></div>}
                </div>
              }
            />
            {dayServices.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>No services todavía</p>
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
                        <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
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
                            {isAdmin && <button onClick={() => handleEdit(s)} style={styles.iconBtn}><Edit2 size={14} /></button>}
                            {isAdmin && <button onClick={() => handleDelete(s.id)} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>}
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
// ===== CITAS TAB =====
const BLADES = ['#3F','#4F','#5F','#7F','#10','#15','#30','#40','#50'];
const COMBOS = ['#0 (5/8")','#1 (1/2")','#2 (3/8")','#4 (1/4")','#5 (1/8")','#A (3/4")','#C (7/8")','#E (1")'];
const SIZES = ['Small (1-20 lbs)','Medium (21-40 lbs)','Large (41-60 lbs)','Big (61-80 lbs)','Extra Large (81-100 lbs)','Giant (100-120 lbs)','Extra Giant (+120 lbs)'];
const HAIR_TYPES = ['Short Hair','Long Hair'];
const getStatusLabels = (t) => ({ unconfirmed: t('status_unconfirmed'), confirmed: t('status_confirmed'), in_progress: t('status_in_progress'), completed: t('status_completed'), cancelled: t('status_cancelled') });
const STATUS_COLORS = { unconfirmed: { bg: '#FAEEDA', text: '#633806', border: '#BA7517' }, confirmed: { bg: '#EAF3DE', text: '#27500A', border: '#3B6D11' }, in_progress: { bg: '#E6F1FB', text: '#0C447C', border: '#185FA5' }, completed: { bg: '#F1EFE8', text: '#5F5E5A', border: '#888780' }, cancelled: { bg: '#FCEBEB', text: '#791F1F', border: '#A32D2D' } };

function CitasTab({ appointments, vans, clients, pets, session, settings, isAdmin, canViewAllSchedule, updateApptStatus, addAppointment, addClient, addPet, refreshAppointments, deleteAppt, servicePrices }) {
  const t = useT('en');
  const STATUS_LABELS = getStatusLabels(t);
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
  const [newApptForm, setNewApptForm] = useState({ clientId: '', vanId: session?.vanId || vans[0]?.id || '', companyId: vans[0]?.companyId || 'epw', groomerId: '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '', petIds: [], serviceId: '', serviceName: '', servicePrice: 0, discountPct: 0, addons: [] });
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', address: '', email: '', zip: '', city: '', state: 'FL' });
  const [newPetForm, setNewPetForm] = useState({ name: '', breed: '', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', allergies: '' });
  const [addingPet, setAddingPet] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const [showCobroForm, setShowCobroForm] = useState(null);
  const [cobroForm, setCobroForm] = useState({ method: 'Cash', tip: '' });
  const [viewMode, setViewMode] = useState('lista');
  const [selectedRutaVan, setSelectedRutaVan] = useState(null);
  const [filterVanId, setFilterVanId] = useState('todos');
  const [showSignature, setShowSignature] = useState(null); // appt
  const [reasignando, setReasignando] = useState(null); // appt id
  const [editingPets, setEditingPets] = useState(null);
  const [editingApptInfo, setEditingApptInfo] = useState(null); // appt id
  const [editApptInfoForm, setEditApptInfoForm] = useState({});
  const [apptPhotos, setApptPhotos] = useState({}); // { apptId: [photos] }
  const [showPhotos, setShowPhotos] = useState(null); // appt id
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [reasignForm, setReasignForm] = useState({ vanId: '', groomerId: '' });
  const [showInvoice, setShowInvoice] = useState(null);

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
    else if (filterVanId === 'epw' || filterVanId === 'atw') {
      list = list.filter(a => vans.find(v => v.id === a.vanId)?.companyId === filterVanId);
    } else if (filterVanId !== 'todos') {
      list = list.filter(a => a.vanId === filterVanId);
    }
    return list.sort((a,b) => (a.timeStart || '').localeCompare(b.timeStart || ''));
  }, [appointments, date, isGroomer, myVanId, filterVanId, vans]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 15);
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone?.includes(clientSearch) ||
      c.address?.toLowerCase().includes(clientSearch.toLowerCase())
    ).slice(0, 15);
  }, [clients, clientSearch]);

  const clientPets = useMemo(() => {
    if (!newApptForm.clientId) return [];
    return pets.filter(p => p.client_id === newApptForm.clientId);
  }, [pets, newApptForm.clientId]);

  const handleCheckin = async (apptId) => {
    await updateApptStatus(apptId, 'in_progress');
    await refreshAppointments();
  };

  const handleSaveSignature = async (appt, signatureData) => {
    await supabase.from('appointments').update({
      agreement_signed: true,
      notes: (appt.notes || '') + ` [Firmado: ${new Date().toLocaleString('es-ES')}]`
    }).eq('id', appt.id);
    await refreshAppointments();
    setShowSignature(null);
    alert('✅ Agreement firmado y guardado');
  };

  const handleComplete = (appt) => {
    setShowCobroForm(appt);
    setCobroForm({ method: 'Cash', tip: '' });
  };

  const handleConfirmarCobro = async () => {
    if (!showCobroForm) return;
    setSaving(true);
    const appt = showCobroForm;
    const tip = parseFloat(cobroForm.tip) || 0;
    const cardFeePct = settings?.cardFeePct || 5.5;
    const method = cobroForm.method;
    const van = vans.find(v => v.id === appt.vanId);
    const companyId = van?.companyId || appt.companyId || 'epw';

    // Si es tarjeta → procesar con Square primero
    if (method === 'Credit Card') {
      const isGuaranteeCheck = (appt.pets || []).every(ap =>
        (ap.service || '').toLowerCase().includes('guarantee') || (ap.amount || 0) === 0
      );
      if (!isGuaranteeCheck) {
        const subtotalCheck = (appt.pets || []).reduce((sum, ap) => sum + (ap.amount || 0), 0);
        const totalCheck = subtotalCheck + (settings?.gasFee || 7) + tip;
        const amountCents = Math.round(totalCheck * 100);
        const squareResult = await processSquarePayment(amountCents, `${appt.client?.name || ''} - ${appt.pets?.map(p => p.pet?.name).join(', ') || ''}`);
        if (!squareResult.success) {
          alert(`❌ Payment failed: ${squareResult.error}`);
          setSaving(false);
          return;
        }
      }
    }

    // Si todos los servicios son Guarantee → gasFee = $0
    const isGuarantee = (appt.pets || []).every(ap =>
      (ap.service || '').toLowerCase().includes('guarantee') ||
      (ap.amount || 0) === 0
    );
    const gasFee = isGuarantee ? 0 : (settings?.gasFee || 7);

    // Calcular totales
    const subtotal = (appt.pets || []).reduce((sum, ap) => sum + (ap.amount || 0), 0);
    const cardFee = method === 'Credit Card' ? parseFloat(((subtotal + tip) * cardFeePct / 100).toFixed(2)) : 0;
    const total = subtotal + gasFee + cardFee + tip;

    // Registrar cada mascota como servicio en el cierre diario
    for (const ap of (appt.pets || [])) {
      const amount = ap.amount || appt.servicePrice || 0;
      const apCardFee = method === 'Credit Card' ? parseFloat(((amount + tip) * cardFeePct / 100).toFixed(2)) : 0;
      await supabase.from('services').insert({
        id: uid(), date: appt.date, van_id: appt.vanId,
        client: appt.client?.name || '', pet: ap.pet?.name || '',
        service: ap.service || appt.serviceName || '',
        method, amount, tip, card_fee: apCardFee,
      });
    }

    // Generar invoice
    const invoiceNumber = await getNextInvoiceNumber(companyId);
    const invoice = {
      id: uid(),
      invoiceNumber,
      companyId,
      appointmentId: appt.id,
      clientId: appt.clientId,
      clientName: appt.client?.name || '',
      clientAddress: appt.client?.address || '',
      groomerName: session?.userName || van?.groomer || '',
      vanName: van?.name || '',
      date: appt.date,
      services: (appt.pets || []).map(ap => ({
        petName: ap.pet?.name || 'Mascota',
        service: ap.service || '',
        amount: ap.amount || 0,
      })),
      subtotal,
      gasFee,
      cardFee,
      tip,
      total,
      method,
    };
    await saveInvoice(invoice);

    await updateApptStatus(appt.id, 'completed');
    await refreshAppointments();
    setSaving(false);
    setShowCobroForm(null);
    setSelectedAppt(null);
    // Mostrar invoice
    setShowInvoice(invoice);
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

    // Save resumen completo de herramientas en el perfil de la mascota
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
    if (!newApptForm.clientId) { alert('Select a client'); return; }
    if (!newApptForm.timeStart) { alert('Enter start time'); return; }

    // Validar conflicto de horario
    const conflict = appointments.filter(a =>
      a.vanId === newApptForm.vanId &&
      a.date === date &&
      a.status !== 'cancelled' &&
      a.timeStart && a.timeEnd &&
      newApptForm.timeStart < a.timeEnd &&
      newApptForm.timeEnd > a.timeStart
    );
    if (conflict.length > 0) {
      const van = vans.find(v => v.id === newApptForm.vanId);
      alert(`⚠️ Conflict! ${van?.name} already has an appointment from ${conflict[0].timeStart} to ${conflict[0].timeEnd}. Please choose a different time.`);
      return;
    }
    setSaving(true);
    const discountedPrice = newApptForm.servicePrice > 0 && newApptForm.discountPct > 0
      ? parseFloat((newApptForm.servicePrice * (1 - newApptForm.discountPct / 100)).toFixed(2))
      : newApptForm.servicePrice;
    const addonsTotal = (newApptForm.addons || []).reduce((sum, id) => sum + ((servicePrices || []).find(p => p.id === id)?.price || 0), 0);
    const addonsNames = (newApptForm.addons || []).map(id => (servicePrices || []).find(p => p.id === id)?.name).filter(Boolean).join(', ');
    const finalPrice = discountedPrice + addonsTotal;
    const van = vans.find(v => v.id === newApptForm.vanId);

    // Si no hay mascotas seleccionadas pero hay servicio, crear un pet genérico
    const petsList = newApptForm.petIds.length > 0
      ? newApptForm.petIds.map(pid => {
          const p = pets.find(pt => pt.id === pid);
          return {
            id: uid(), petId: pid,
            service: newApptForm.serviceName || '',
            amount: finalPrice, tip: 0, cardFee: 0,
            method: 'Cash', status: 'pending',
            checkinTime: '', checkoutTime: '',
            pet: p ? { id: p.id, name: p.name, breed: p.breed, size: p.size, allergies: p.allergies, behavior_notes: p.behavior_notes } : null,
          };
        })
      : [{
          id: uid(), petId: null,
          service: newApptForm.serviceName || '',
          amount: finalPrice, tip: 0, cardFee: 0,
          method: 'Cash', status: 'pending',
          checkinTime: '', checkoutTime: '',
          pet: null,
        }];

    const appt = {
      id: uid(), date, timeStart: newApptForm.timeStart, timeEnd: newApptForm.timeEnd,
      vanId: newApptForm.vanId, clientId: newApptForm.clientId,
      groomerId: newApptForm.groomerId || null,
      companyId: newApptForm.companyId || van?.companyId || 'epw',
      status: 'unconfirmed',
      notes: `${newApptForm.serviceName ? `Servicio: ${newApptForm.serviceName}` : ''}${addonsNames ? ` + ${addonsNames}` : ''}${newApptForm.discountPct > 0 ? ` (${newApptForm.discountPct}% desc.)` : ''}${newApptForm.notes ? ` — ${newApptForm.notes}` : ''}`,
      alertNotes: newApptForm.alertNotes,
      agreementSigned: false,
      servicePrice: finalPrice,
      serviceName: newApptForm.serviceName,
      discountPct: newApptForm.discountPct,
      client: clients.find(c => c.id === newApptForm.clientId) || null,
      pets: petsList,
    };
    await addAppointment(appt);
    for (const ap of appt.pets) {
      if (ap.petId || ap.service || ap.amount > 0) {
        await saveAppointmentPet({ ...ap, appointmentId: appt.id });
      }
    }
    setSaving(false);
    setShowNewAppt(false);
    setNewApptForm({ clientId: '', vanId: session?.vanId || vans[0]?.id || '', companyId: vans[0]?.companyId || 'epw', groomerId: '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '', petIds: [], serviceId: '', serviceName: '', servicePrice: 0, discountPct: 0, addons: [] });
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
              <button onClick={() => setViewMode('lista')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'lista' ? 600 : 400, background: viewMode === 'lista' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'lista' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                📋 List
              </button>
              <button onClick={() => setViewMode('semana')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'semana' ? 600 : 400, background: viewMode === 'semana' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'semana' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                📅 Week
              </button>
              <button onClick={() => setViewMode('mes')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'mes' ? 600 : 400, background: viewMode === 'mes' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'mes' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                🗓️ Month
              </button>
              <button onClick={() => setViewMode('agenda')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'agenda' ? 600 : 400, background: viewMode === 'agenda' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'agenda' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                👤 Agenda
              </button>
              <button onClick={() => setViewMode('calendario')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'calendario' ? 600 : 400, background: viewMode === 'calendario' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'calendario' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                🚐 Vans
              </button>
            </div>
            <button onClick={() => setShowNewAppt(true)} style={styles.btnPrimary}><Plus size={15} /> {t('new_appt')}</button>
          </div>
        }
      />

      {/* Filtro de empresa y groomer — solo admin */}
      {!isGroomer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {/* Filtro por empresa */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company:</span>
            <button onClick={() => setFilterVanId('todos')}
              style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${filterVanId === 'todos' ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, background: filterVanId === 'todos' ? 'var(--color-background-info)' : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: filterVanId === 'todos' ? 700 : 400, color: filterVanId === 'todos' ? 'var(--color-text-info)' : 'var(--color-text-secondary)' }}>
              🏢 Todas ({appointments.filter(a => a.date === date).length})
            </button>
            <button onClick={() => setFilterVanId('epw')}
              style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${filterVanId === 'epw' ? '#0f766e' : 'var(--color-border-tertiary)'}`, background: filterVanId === 'epw' ? '#f0fdfa' : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: filterVanId === 'epw' ? 700 : 400, color: filterVanId === 'epw' ? '#0f766e' : 'var(--color-text-secondary)' }}>
              🐾 El Pet Wash ({appointments.filter(a => a.date === date && vans.find(v => v.id === a.vanId)?.companyId === 'epw').length})
            </button>
            <button onClick={() => setFilterVanId('atw')}
              style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${filterVanId === 'atw' ? '#7c3aed' : 'var(--color-border-tertiary)'}`, background: filterVanId === 'atw' ? '#faf5ff' : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: filterVanId === 'atw' ? 700 : 400, color: filterVanId === 'atw' ? '#7c3aed' : 'var(--color-text-secondary)' }}>
              🐕 All Tails Wag ({appointments.filter(a => a.date === date && vans.find(v => v.id === a.vanId)?.companyId === 'atw').length})
            </button>
          </div>

          {/* Filtro por groomer */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Groomer:</span>
            {vans.filter(v => filterVanId === 'todos' || filterVanId === v.id || v.companyId === filterVanId).map(v => {
              const color = getVanColor(v.id);
              const count = appointments.filter(a => a.date === date && a.vanId === v.id).length;
              const isSelected = filterVanId === v.id;
              return (
                <button key={v.id} onClick={() => setFilterVanId(isSelected ? 'todos' : v.id)}
                  style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${isSelected ? color.border : 'var(--color-border-tertiary)'}`, background: isSelected ? color.bg : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: isSelected ? 700 : 400, color: isSelected ? color.text : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color.dot }} />
                  {v.groomer || v.name} ({count})
                </button>
              );
            })}
          </div>
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
            <h3 style={{ ...styles.cardH3, margin: 0, color: 'var(--color-text-info)' }}>New Appointment — {formatDateNice(date)}</h3>
            <button onClick={() => setShowNewAppt(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>

          {/* Search cliente */}
          <div style={styles.formGrid}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>Cliente *</label>
              <div style={{ position: 'relative' }}>
                <input value={clientSearch} onChange={e => { setClientSearch(e.target.value); setNewApptForm(f => ({...f, clientId: ''})); }}
                  style={styles.input} placeholder="Search cliente por nombre..." />
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
              <>
                {/* Solo selector de van — empresa y groomer automáticos */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.lbl}>Van</label>
                  <select value={newApptForm.vanId}
                    onChange={e => {
                      const van = vans.find(v => v.id === e.target.value);
                      const groomerList = session?.groomers || [];
                      const groomer = groomerList.find(g => g.vanId === e.target.value) ||
                                      groomerList.find(g => g.name === van?.groomer);
                      setNewApptForm(f => ({
                        ...f,
                        vanId: e.target.value,
                        companyId: van?.companyId || f.companyId,
                        groomerId: groomer?.id || '',
                      }));
                    }}
                    style={styles.input}>
                    {vans.map(v => {
                      const groomerList = session?.groomers || [];
                      const groomer = groomerList.find(g => g.vanId === v.id) ||
                                      groomerList.find(g => g.name === v.groomer);
                      const company = DEFAULT_COMPANIES.find(c => c.id === v.companyId);
                      return (
                        <option key={v.id} value={v.id}>
                          {v.name}{groomer ? ` — ${groomer.name}` : v.groomer ? ` — ${v.groomer}` : ''} {company ? `(${company.logoEmoji} ${company.name})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  {/* Info de empresa y groomer automáticos */}
                  {newApptForm.vanId && (() => {
                    const van = vans.find(v => v.id === newApptForm.vanId);
                    const groomerList = session?.groomers || [];
                    const groomer = groomerList.find(g => g.vanId === newApptForm.vanId) ||
                                    groomerList.find(g => g.name === van?.groomer);
                    const company = DEFAULT_COMPANIES.find(c => c.id === van?.companyId);
                    const groomerName = groomer?.name || van?.groomer || '';
                    const groomerPct = groomer?.commissionPct || van?.commissionPct || 45;
                    return (
                      <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0fdfa', borderRadius: 6, fontSize: 12, color: '#0f766e', display: 'flex', gap: 12 }}>
                        {company && <span>{company.logoEmoji} {company.name}</span>}
                        {groomerName && <span>✂️ {groomerName} · {groomerPct}%</span>}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>Start Time *</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <input type="time" value={newApptForm.timeStart}
                  onChange={e => {
                    const start = e.target.value;
                    const numPets = newApptForm.petIds.length || 1;
                    const duration = numPets === 1 ? 2 : numPets === 2 ? 3 : 4;
                    const [h, m] = start.split(':').map(Number);
                    const endH = h + duration;
                    const endTime = `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                    setNewApptForm(f => ({...f, timeStart: start, timeEnd: endTime, duration}));
                  }}
                  style={{ ...styles.input, width: 160 }} />

                {/* Duración automática */}
                <div style={{ padding: '9px 14px', background: '#f0fdfa', borderRadius: 8, fontSize: 13, color: '#0f766e', fontWeight: 600, border: '1px solid #ccfbf1' }}>
                  ⏱ {newApptForm.petIds.length <= 1 ? '2' : newApptForm.petIds.length === 2 ? '3' : '4'} hrs
                  → End: {newApptForm.timeEnd || '—'}
                </div>
              </div>

              {/* Conflicto de horario */}
              {newApptForm.timeStart && newApptForm.vanId && (() => {
                const conflict = appointments.filter(a =>
                  a.vanId === newApptForm.vanId &&
                  a.date === date &&
                  a.status !== 'cancelled' &&
                  a.timeStart && a.timeEnd &&
                  newApptForm.timeStart < a.timeEnd &&
                  newApptForm.timeEnd > a.timeStart
                );
                if (conflict.length === 0) return null;
                const van = vans.find(v => v.id === newApptForm.vanId);
                return (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, fontSize: 12, color: '#dc2626', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚠️ {van?.name} already has an appointment from {conflict[0].timeStart} to {conflict[0].timeEnd}
                  </div>
                );
              })()}
            </div>

            {/* Selector de servicio — solo admin/manager */}
            {!isGroomer && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>Servicio principal</label>
              <select value={newApptForm.serviceId} onChange={e => {
                const svc = (servicePrices || []).find(p => p.id === e.target.value);
                setNewApptForm(f => ({ ...f, serviceId: e.target.value, serviceName: svc?.name || '', servicePrice: svc?.price || 0 }));
              }} style={styles.input}>
                <option value="">Seleccionar servicio...</option>
                {['Signature Bath', 'Full Groom'].map(cat => (
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
            )}

            {/* Add-ons — solo admin/manager */}
            {!isGroomer && (servicePrices || []).filter(p => p.category === 'Add-on').length > 0 && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>Add-ons (opcional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {(servicePrices || []).filter(p => p.category === 'Add-on').map(addon => {
                    const selected = (newApptForm.addons || []).includes(addon.id);
                    return (
                      <button key={addon.id} type="button"
                        onClick={() => setNewApptForm(f => ({
                          ...f,
                          addons: selected
                            ? (f.addons || []).filter(id => id !== addon.id)
                            : [...(f.addons || []), addon.id]
                        }))}
                        style={{ padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${selected ? '#0f766e' : 'var(--color-border-tertiary)'}`, background: selected ? '#f0fdfa' : 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: selected ? 700 : 400, color: selected ? '#0f766e' : 'var(--color-text-secondary)', transition: 'all 0.15s' }}>
                        {selected ? '✅ ' : '+ '}{addon.name} ${addon.price}
                      </button>
                    );
                  })}
                </div>
                {/* Total con add-ons */}
                {(newApptForm.addons || []).length > 0 && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--color-background-success)', borderRadius: 8, border: '0.5px solid var(--color-border-success)' }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-success)', marginBottom: 4 }}>
                      {(newApptForm.addons || []).map(id => (servicePrices || []).find(p => p.id === id)?.name).filter(Boolean).join(' + ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-success)' }}>
                        Servicio ${newApptForm.discountPct > 0
                          ? (newApptForm.servicePrice * (1 - newApptForm.discountPct/100)).toFixed(2)
                          : newApptForm.servicePrice} + Add-ons ${(newApptForm.addons || []).reduce((sum, id) => sum + ((servicePrices || []).find(p => p.id === id)?.price || 0), 0).toFixed(2)}
                      </span>
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: 'var(--color-text-success)' }}>
                        💰 ${(
                          (newApptForm.discountPct > 0
                            ? newApptForm.servicePrice * (1 - newApptForm.discountPct/100)
                            : newApptForm.servicePrice) +
                          (newApptForm.addons || []).reduce((sum, id) => sum + ((servicePrices || []).find(p => p.id === id)?.price || 0), 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                {clientPets.map(p => {
                  const selected = newApptForm.petIds.includes(p.id);
                  return (
                    <button key={p.id} type="button"
                      onClick={() => setNewApptForm(f => {
                        const newPetIds = selected ? f.petIds.filter(id => id !== p.id) : [...f.petIds, p.id];
                        const numPets = newPetIds.length || 1;
                        const duration = numPets === 1 ? 2 : numPets === 2 ? 3 : 4;
                        const [h, m] = (f.timeStart || '09:00').split(':').map(Number);
                        const endH = h + duration;
                        const endTime = `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                        return { ...f, petIds: newPetIds, timeEnd: endTime, duration };
                      })}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: selected ? 'var(--color-background-success)' : 'var(--color-background-secondary)', border: `1.5px solid ${selected ? 'var(--color-border-success)' : 'var(--color-border-tertiary)'}`, borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? 'var(--color-text-success)' : 'var(--color-text-secondary)' }}>
                      {selected ? '✅ ' : '🐾 '}{p.name} {p.breed ? `(${p.breed})` : ''}
                    </button>
                  );
                })}
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
                }} style={styles.btnPrimary}><Check size={14} /> Save mascota</button>
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
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.lbl}>Address</label>
              <AddressAutocomplete
                value={newClientForm.address}
                onChange={details => setNewClientForm(f => ({...f, address: details.address, zip: details.zip || f.zip, city: details.city || f.city, state: details.state || f.state}))}
                placeholder="Start typing address..."
              />
              {newClientForm.zip && (
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <div style={{ flex: 1, padding: '6px 10px', background: '#f0fdfa', borderRadius: 8, fontSize: 12, color: '#0f766e', fontWeight: 600 }}>
                    📍 {newClientForm.city}, {newClientForm.state} {newClientForm.zip}
                  </div>
                </div>
              )}
            </div>
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
                                  {isAdmin && appt.status !== 'completed' && appt.status !== 'cancelled' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <input type="time" defaultValue={appt.timeStart}
                                        onBlur={async e => {
                                          const newStart = e.target.value;
                                          if (!newStart || newStart === appt.timeStart) return;
                                          const numPets = appt.pets?.length || 1;
                                          const duration = numPets === 1 ? 2 : numPets === 2 ? 3 : 4;
                                          const [h, m] = newStart.split(':').map(Number);
                                          const endH = h + duration;
                                          const newEnd = `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                                          // Verificar conflicto
                                          const conflict = appointments.filter(a =>
                                            a.id !== appt.id &&
                                            a.vanId === appt.vanId &&
                                            a.date === appt.date &&
                                            a.status !== 'cancelled' &&
                                            a.timeStart && a.timeEnd &&
                                            newStart < a.timeEnd &&
                                            newEnd > a.timeStart
                                          );
                                          if (conflict.length > 0) {
                                            alert(`⚠️ Conflict! ${appt.vanId} already has an appointment from ${conflict[0].timeStart} to ${conflict[0].timeEnd}`);
                                            e.target.value = appt.timeStart;
                                            return;
                                          }
                                          await supabase.from('appointments').update({ time_start: newStart, time_end: newEnd }).eq('id', appt.id);
                                          appt.timeStart = newStart;
                                          appt.timeEnd = newEnd;
                                        }}
                                        style={{ ...styles.input, width: 120, padding: '4px 8px', fontSize: 13 }} />
                                      <span style={{ fontSize: 12, color: '#0f766e', fontWeight: 600 }}>
                                        → {(() => {
                                          const numPets = appt.pets?.length || 1;
                                          const duration = numPets === 1 ? 2 : numPets === 2 ? 3 : 4;
                                          const [h, m] = (appt.timeStart || '09:00').split(':').map(Number);
                                          const endH = h + duration;
                                          return `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')} (${duration}h)`;
                                        })()}
                                      </span>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{appt.timeStart}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}</span>
                                  )}
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
                      {/* Botón firma — siempre visible si no ha firmado */}
                      {!appt.agreementSigned ? (
                        <button onClick={(e) => { e.stopPropagation(); setShowSignature(appt); }}
                          style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: '#f59e0b', color: '#92400e', background: '#fffbeb', gridColumn: 'span 2' }}>
                          ✍️ Firmar Agreement
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f0fdfa', borderRadius: 8, fontSize: 12, color: '#0f766e', fontWeight: 600, gridColumn: 'span 2' }}>
                          ✅ Agreement firmado
                        </div>
                      )}
                      {appt.status === 'unconfirmed' && (
                        <button onClick={() => updateApptStatus(appt.id, 'confirmed')} style={{ ...styles.btnPrimary, justifyContent: 'center' }}>
                          <Check size={14} /> Confirmar
                        </button>
                      )}
                      {(appt.status === 'confirmed' || appt.status === 'unconfirmed') && (
                        <button onClick={() => handleCheckin(appt.id)} style={{ ...styles.btnPrimary, justifyContent: 'center', background: 'var(--color-background-success)', color: 'var(--color-text-success)', borderColor: 'var(--color-border-success)' }}>
                          <Plus size={14} /> {t('checkin')}
                        </button>
                      )}
                      {appt.status === 'in_progress' && (
                        <button onClick={() => handleComplete(appt)} style={{ ...styles.btnPrimary, justifyContent: 'center' }}>
                          <DollarSign size={14} /> {t('complete_pay')}
                        </button>
                      )}
                      {/* Ver invoice — cita completada */}
                      {appt.status === 'completed' && (
                        <button onClick={async () => {
                          // Search invoice guardada
                          const { data } = await supabase.from('invoices')
                            .select('*').eq('appointment_id', appt.id).single();
                          if (data) {
                            const van = vans.find(v => v.id === appt.vanId);
                            setShowInvoice({
                              id: data.id,
                              invoiceNumber: data.invoice_number,
                              companyId: data.company_id,
                              clientName: data.client_name,
                              clientAddress: data.client_address,
                              groomerName: data.groomer_name,
                              vanName: data.van_name,
                              date: data.date,
                              services: typeof data.services === 'string' ? JSON.parse(data.services) : (data.services || []),
                              subtotal: parseFloat(data.subtotal) || 0,
                              gasFee: parseFloat(data.gas_fee) || 0,
                              cardFee: parseFloat(data.card_fee) || 0,
                              tip: parseFloat(data.tip) || 0,
                              total: parseFloat(data.total) || 0,
                              method: data.method,
                            });
                          } else {
                            // Reconstruir invoice desde la cita si no existe
                            const van = vans.find(v => v.id === appt.vanId);
                            const subtotal = (appt.pets || []).reduce((s, ap) => s + (ap.amount || 0), 0);
                            setShowInvoice({
                              invoiceNumber: '—',
                              companyId: van?.companyId || 'epw',
                              clientName: appt.client?.name || '',
                              clientAddress: appt.client?.address || '',
                              groomerName: van?.groomer || '',
                              date: appt.date,
                              services: (appt.pets || []).map(ap => ({ petName: ap.pet?.name || 'Mascota', service: ap.service || '', amount: ap.amount || 0 })),
                              subtotal,
                              gasFee: 7,
                              cardFee: 0,
                              tip: 0,
                              total: subtotal + 7,
                              method: 'Cash',
                            });
                          }
                        }} style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: '#0f766e', color: '#0f766e' }}>
                          🧾 Ver Invoice
                        </button>
                      )}
                      {appt.client?.address && (
                        <button onClick={() => openMaps(appt.client.address)} style={{ ...styles.btnSecondary, justifyContent: 'center' }}>
                          <MapPin size={14} /> Google Maps
                        </button>
                      )}
                      {/* Fotos antes/después */}
                      {(appt.status === 'in_progress' || appt.status === 'completed') && (
                        <button onClick={async () => {
                          if (showPhotos === appt.id) { setShowPhotos(null); return; }
                          const photos = await loadGroomingPhotos(appt.id);
                          setApptPhotos(prev => ({...prev, [appt.id]: photos}));
                          setShowPhotos(appt.id);
                        }} style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: showPhotos === appt.id ? '#0f766e' : '#e2e8f0', color: showPhotos === appt.id ? '#0f766e' : '#64748b' }}>
                          📸 {showPhotos === appt.id ? 'Hide photos' : 'Photos'}
                        </button>
                      )}
                      {isAdmin && appt.status !== 'completed' && appt.status !== 'cancelled' && (
                        <button onClick={() => {
                          if (editingApptInfo === appt.id) { setEditingApptInfo(null); return; }
                          setEditingApptInfo(appt.id);
                          setEditApptInfoForm({ date: appt.date, timeStart: appt.timeStart || '', timeEnd: appt.timeEnd || '', vanId: appt.vanId, notes: appt.notes || '' });
                        }} style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: editingApptInfo === appt.id ? '#7c3aed' : '#e2e8f0', color: editingApptInfo === appt.id ? '#7c3aed' : '#64748b', background: editingApptInfo === appt.id ? '#f5f3ff' : '#fff' }}>
                          <Edit2 size={14} /> {editingApptInfo === appt.id ? 'Done' : 'Edit date & time'}
                        </button>
                      )}
                      {isAdmin && appt.status !== 'completed' && appt.status !== 'cancelled' && (
                        <button onClick={() => setEditingPets(editingPets === appt.id ? null : appt.id)}
                          style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: editingPets === appt.id ? '#0f766e' : '#e2e8f0', color: editingPets === appt.id ? '#0f766e' : '#64748b', background: editingPets === appt.id ? '#f0fdfa' : '#fff' }}>
                          <Edit2 size={14} /> {editingPets === appt.id ? 'Done editing' : 'Edit pets & prices'}
                        </button>
                      )}
                      {/* Reopen — solo admin, solo completadas */}
                      {appt.status === 'completed' && isAdmin && (
                        <button onClick={() => {
                          if (confirm('¿Reabrir esta cita?\n\nVuelve a "In Progress" para que puedas corregir el servicio y cobrar de nuevo.\n\nEsto quedará registrado en auditoría.')) {
                            updateApptStatus(appt.id, 'in_progress');
                          }
                        }} style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: '#7c3aed', color: '#7c3aed', background: '#faf5ff' }}>
                          {t('reopen')}
                        </button>
                      )}
                      {appt.status !== 'cancelled' && appt.status !== 'completed' && isAdmin && (
                        <button onClick={() => { if (confirm('¿Cancelar esta cita?')) updateApptStatus(appt.id, 'cancelled'); }}
                          style={{ ...styles.btnDanger, justifyContent: 'center' }}>
                          <X size={14} /> Cancelar
                        </button>
                      )}
                      {appt.status !== 'completed' && appt.status !== 'cancelled' && isAdmin && (
                        <button onClick={() => { setReasignando(appt.id); setReasignForm({ vanId: appt.vanId, groomerId: appt.groomerId || '' }); }}
                          style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: '#f59e0b', color: '#92400e' }}>
                          {t('reassign')}
                        </button>
                      )}
                      {appt.status === 'cancelled' && isAdmin && (
                        <button onClick={() => { if (confirm('¿Delete esta cita permanentemente? No se puede deshacer.')) deleteAppt(appt.id); }}
                          style={{ ...styles.btnDanger, justifyContent: 'center', background: 'var(--color-background-danger)' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>

                    {/* Panel edición fecha y hora */}
                    {editingApptInfo === appt.id && (
                      <div style={{ marginTop: 14, padding: '14px', background: '#f5f3ff', borderRadius: 12, border: '1.5px solid #7c3aed' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>✏️ Edit appointment info</div>
                        <div style={styles.formGrid}>
                          <div>
                            <label style={styles.lbl}>Date</label>
                            <input type="date" value={editApptInfoForm.date}
                              onChange={e => setEditApptInfoForm(f => ({...f, date: e.target.value}))}
                              style={styles.input} />
                          </div>
                          <div>
                            <label style={styles.lbl}>Van</label>
                            <select value={editApptInfoForm.vanId}
                              onChange={e => setEditApptInfoForm(f => ({...f, vanId: e.target.value}))}
                              style={styles.input}>
                              {vans.filter(v => v.active !== false).map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={styles.lbl}>Start time</label>
                            <input type="time" value={editApptInfoForm.timeStart}
                              onChange={e => setEditApptInfoForm(f => ({...f, timeStart: e.target.value}))}
                              style={styles.input} />
                          </div>
                          <div>
                            <label style={styles.lbl}>End time</label>
                            <input type="time" value={editApptInfoForm.timeEnd}
                              onChange={e => setEditApptInfoForm(f => ({...f, timeEnd: e.target.value}))}
                              style={styles.input} />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={styles.lbl}>Notes</label>
                            <input value={editApptInfoForm.notes}
                              onChange={e => setEditApptInfoForm(f => ({...f, notes: e.target.value}))}
                              style={styles.input} placeholder="Special instructions..." />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button onClick={async () => {
                            await supabase.from('appointments').update({
                              date: editApptInfoForm.date,
                              time_start: editApptInfoForm.timeStart,
                              time_end: editApptInfoForm.timeEnd,
                              van_id: editApptInfoForm.vanId,
                              notes: editApptInfoForm.notes,
                            }).eq('id', appt.id);
                            await refreshAppointments();
                            setEditingApptInfo(null);
                          }} style={styles.btnPrimary}>
                            <Check size={14} /> Save changes
                          </button>
                          <button onClick={() => setEditingApptInfo(null)} style={styles.btnSecondary}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Panel de fotos */}
                    {showPhotos === appt.id && (
                      <div style={{ marginTop: 14, padding: '14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>📸 Grooming Photos</div>

                        {/* Fotos existentes */}
                        {(apptPhotos[appt.id] || []).length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                            {(apptPhotos[appt.id] || []).map(photo => (
                              <div key={photo.id} style={{ position: 'relative' }}>
                                <img src={photo.photo_url} alt={photo.type} onClick={() => setViewingPhoto(photo.photo_url)}
                                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '2px solid #e2e8f0' }} />
                                <div style={{ position: 'absolute', top: 4, left: 4, background: photo.type === 'before' ? '#fef3c7' : '#f0fdfa', borderRadius: 999, padding: '2px 6px', fontSize: 10, fontWeight: 700, color: photo.type === 'before' ? '#92400e' : '#0f766e' }}>
                                  {photo.type === 'before' ? 'BEFORE' : 'AFTER'}
                                </div>
                                {(isAdmin || session?.role === 'groomer') && (
                                  <button onClick={async () => {
                                    await deleteGroomingPhoto(photo.id);
                                    setApptPhotos(prev => ({...prev, [appt.id]: prev[appt.id].filter(p => p.id !== photo.id)}));
                                  }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={12} />
                                  </button>
                                )}
                                {photo.pet_name && <div style={{ fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 3 }}>🐾 {photo.pet_name}</div>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '16px 0', marginBottom: 12 }}>No photos yet</div>
                        )}

                        {/* Subir nueva foto */}
                        {appt.status !== 'cancelled' && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Add photo:</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {['before', 'after'].map(type => (
                                <label key={type} style={{ flex: 1, cursor: 'pointer' }}>
                                  <div style={{ padding: '10px', background: type === 'before' ? '#fffbeb' : '#f0fdfa', border: `1.5px dashed ${type === 'before' ? '#f59e0b' : '#0f766e'}`, borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 600, color: type === 'before' ? '#92400e' : '#0f766e' }}>
                                    📷 {type === 'before' ? 'Before' : 'After'}
                                  </div>
                                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                                    onChange={async e => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      const photoId = uid();
                                      const ext = file.name.split('.').pop();
                                      const path = `grooming-${photoId}.${ext}`;
                                      const { error } = await supabase.storage.from('receipts').upload(path, file, { upsert: true });
                                      if (error) { alert('Error uploading photo'); return; }
                                      const { data } = supabase.storage.from('receipts').getPublicUrl(path);
                                      const pet = appt.pets?.[0];
                                      const photo = { id: photoId, appointmentId: appt.id, petId: pet?.petId || null, petName: pet?.pet?.name || '', photoUrl: data.publicUrl, type, createdBy: session?.userName || '' };
                                      await saveGroomingPhoto(photo);
                                      setApptPhotos(prev => ({...prev, [appt.id]: [...(prev[appt.id] || []), { id: photoId, photo_url: data.publicUrl, type, pet_name: pet?.pet?.name || '' }]}));
                                    }} />
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Modal ver foto grande */}
                    {viewingPhoto && (
                      <div onClick={() => setViewingPhoto(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <img src={viewingPhoto} alt="Photo" style={{ maxWidth: '95vw', maxHeight: '95vh', borderRadius: 8, objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* Panel edición mascotas y precios */}
                    {editingPets === appt.id && (
                      <div style={{ marginTop: 14, padding: '14px', background: '#f0fdfa', borderRadius: 12, border: '1.5px solid #0f766e' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f766e', marginBottom: 12 }}>✏️ Edit pets & prices</div>
                        {(appt.pets || []).map(ap => (
                          <div key={ap.id} style={{ padding: '10px 12px', background: '#fff', borderRadius: 10, marginBottom: 8, border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🐾 {ap.pet?.name || 'Pet'}</div>

                            {/* Servicio */}
                            <div style={{ marginBottom: 8 }}>
                              <label style={{ ...styles.lbl, fontSize: 11 }}>Service</label>
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
                                <option value={ap.service || ''}>{ap.service || 'No service'}</option>
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
                            <div style={{ marginBottom: 8 }}>
                              <label style={{ ...styles.lbl, fontSize: 11 }}>Add-ons</label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                {(servicePrices || []).filter(p => p.category === 'Add-on').map(addon => (
                                  <button key={addon.id} type="button"
                                    onClick={async () => {
                                      const newAmt = (ap.amount || 0) + addon.price;
                                      const newSvc = ap.service ? `${ap.service} + ${addon.name}` : addon.name;
                                      await supabase.from('appointment_pets').update({ amount: newAmt, service: newSvc }).eq('id', ap.id);
                                      await refreshAppointments();
                                    }}
                                    style={{ padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 999, cursor: 'pointer', fontSize: 11, color: '#64748b' }}>
                                    + {addon.name} +${addon.price}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Precio manual + quitar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 12, color: '#64748b' }}>Price: $</span>
                                <input type="number" step="0.01" defaultValue={ap.amount || 0}
                                  onBlur={async e => {
                                    const newAmount = parseFloat(e.target.value) || 0;
                                    await supabase.from('appointment_pets').update({ amount: newAmount }).eq('id', ap.id);
                                    await refreshAppointments();
                                  }}
                                  style={{ ...styles.input, width: 90, textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#0f766e', padding: '4px 8px' }} />
                              </div>
                              <button onClick={async () => {
                                if (!confirm(`Remove ${ap.pet?.name || 'pet'} from this appointment?`)) return;
                                await supabase.from('appointment_pets').delete().eq('id', ap.id);
                                await refreshAppointments();
                              }} style={{ ...styles.iconBtn, color: '#dc2626' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Agregar mascota */}
                        <div style={{ marginTop: 8, padding: '10px 12px', background: '#fff', borderRadius: 10, border: '1px dashed #0f766e' }}>
                          <label style={{ ...styles.lbl, fontSize: 11, color: '#0f766e' }}>➕ Add pet</label>
                          <select onChange={async e => {
                            if (!e.target.value) return;
                            const petId = e.target.value;
                            await supabase.from('appointment_pets').insert({
                              id: uid(), appointment_id: appt.id,
                              pet_id: petId, service: '', amount: 0,
                            });
                            await refreshAppointments();
                            e.target.value = '';
                          }} style={{ ...styles.input, fontSize: 12, marginTop: 4 }}>
                            <option value="">— Select pet to add —</option>
                            {(pets || []).filter(p => {
                              const clientId = appt.clientId;
                              return (p.client_id == clientId || p.clientId == clientId) &&
                                !(appt.pets || []).find(ap => ap.petId === p.id || ap.pet_id === p.id || String(ap.petId) === String(p.id));
                            }).map(p => (
                              <option key={p.id} value={p.id}>{p.name} — {p.breed || ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Formulario de reasignación */}
                    {reasignando === appt.id && (
                      <div style={{ marginBottom: 14, padding: '12px 14px', background: '#fffbeb', borderRadius: 10, border: '1.5px solid #f59e0b' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>{t('reassign')} cita</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                          <div>
                            <label style={styles.lbl}>Van</label>
                            <select value={reasignForm.vanId} onChange={e => setReasignForm(f => ({...f, vanId: e.target.value}))} style={styles.input}>
                              {vans.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={styles.lbl}>Groomer del día</label>
                            <select value={reasignForm.groomerId} onChange={e => setReasignForm(f => ({...f, groomerId: e.target.value}))} style={styles.input}>
                              <option value="">Sin asignar</option>
                              {(session?.groomers || []).filter(g => g.active !== false).map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => setReasignando(null)} style={styles.btnSecondary}><X size={13} /> Cancelar</button>
                          <button onClick={async () => {
                            await supabase.from('appointments').update({
                              van_id: reasignForm.vanId,
                              groomer_id: reasignForm.groomerId || null,
                            }).eq('id', appt.id);
                            await refreshAppointments();
                            setReasignando(null);
                            alert('✅ Cita reasignada correctamente');
                          }} style={{ ...styles.btnPrimary, background: '#f59e0b', borderColor: '#f59e0b' }}>
                            <Check size={13} /> Confirmar reasignación
                          </button>
                        </div>
                      </div>
                    )}

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
                            {isAdmin && appt.status !== 'completed' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {/* Selector servicio principal */}
                                <div>
                                  <label style={{ ...styles.lbl, fontSize: 10 }}>Servicio principal</label>
                                  <select defaultValue={ap.service}
                                    onChange={async e => {
                                      const svc = (servicePrices || []).find(p =>
                                        `${p.name}${p.size ? ' · ' + p.size.split('(')[0].trim() : ''}${p.hair_type ? ' · ' + p.hair_type : ''}` === e.target.value
                                      );
                                      // Calcular precio base + add-ons actuales
                                      const addonsInService = (ap.service || '').split(' + ').slice(1);
                                      const addonsTotal = addonsInService.reduce((sum, aName) => {
                                        const a = (servicePrices || []).find(p => p.category === 'Add-on' && p.name === aName);
                                        return sum + (a?.price || 0);
                                      }, 0);
                                      const newBase = svc?.price || 0;
                                      const newService = svc ? `${e.target.value}${addonsInService.length ? ' + ' + addonsInService.join(' + ') : ''}` : e.target.value;
                                      await supabase.from('appointment_pets').update({ service: newService, amount: newBase + addonsTotal }).eq('id', ap.id);
                                      await refreshAppointments();
                                    }}
                                    style={{ ...styles.input, fontSize: 13 }}>
                                    <option value={ap.service?.split(' + ')[0] || ''}>{ap.service?.split(' + ')[0] || 'Sin servicio'}</option>
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

                                {/* Add-ons toggle */}
                                {(servicePrices || []).filter(p => p.category === 'Add-on').length > 0 && (
                                  <div>
                                    <label style={{ ...styles.lbl, fontSize: 10 }}>Add-ons</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                      {(servicePrices || []).filter(p => p.category === 'Add-on').map(addon => {
                                        const serviceParts = (ap.service || '').split(' + ');
                                        const isSelected = serviceParts.slice(1).includes(addon.name);
                                        return (
                                          <button key={addon.id} type="button"
                                            onClick={async () => {
                                              const parts = (ap.service || '').split(' + ');
                                              const baseService = parts[0];
                                              const currentAddons = parts.slice(1);
                                              let newAddons, newAmount;

                                              const basePrice = (() => {
                                                const svc = (servicePrices || []).find(p =>
                                                  p.category !== 'Add-on' &&
                                                  `${p.name}${p.size ? ' · ' + p.size.split('(')[0].trim() : ''}${p.hair_type ? ' · ' + p.hair_type : ''}` === baseService
                                                );
                                                return svc?.price || (ap.amount - currentAddons.reduce((s, n) => {
                                                  const a = (servicePrices || []).find(p => p.name === n && p.category === 'Add-on');
                                                  return s + (a?.price || 0);
                                                }, 0));
                                              })();

                                              if (isSelected) {
                                                // Quitar add-on
                                                newAddons = currentAddons.filter(n => n !== addon.name);
                                                newAmount = basePrice + newAddons.reduce((s, n) => {
                                                  const a = (servicePrices || []).find(p => p.name === n && p.category === 'Add-on');
                                                  return s + (a?.price || 0);
                                                }, 0);
                                              } else {
                                                // Agregar add-on
                                                newAddons = [...currentAddons, addon.name];
                                                newAmount = parseFloat((basePrice + newAddons.reduce((s, n) => {
                                                  const a = (servicePrices || []).find(p => p.name === n && p.category === 'Add-on');
                                                  return s + (a?.price || 0);
                                                }, 0)).toFixed(2));
                                              }

                                              const newService = newAddons.length > 0
                                                ? `${baseService} + ${newAddons.join(' + ')}`
                                                : baseService;
                                              await supabase.from('appointment_pets').update({ service: newService, amount: newAmount }).eq('id', ap.id);
                                              await refreshAppointments();
                                            }}
                                            style={{ padding: '6px 12px', background: isSelected ? '#f0fdfa' : 'var(--color-background-secondary)', border: `1.5px solid ${isSelected ? '#0f766e' : 'var(--color-border-tertiary)'}`, borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: isSelected ? 700 : 400, color: isSelected ? '#0f766e' : 'var(--color-text-secondary)' }}>
                                            {isSelected ? '✅ ' : '+ '}{addon.name} ${addon.price}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Desglose en columna */}
                                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #f1f5f9' }}>
                                  {(() => {
                                    const parts = (ap.service || '').split(' + ');
                                    const baseService = parts[0];
                                    const addons = parts.slice(1);
                                    const baseSvc = (servicePrices || []).find(p =>
                                      p.category !== 'Add-on' &&
                                      `${p.name}${p.size ? ' · ' + p.size.split('(')[0].trim() : ''}${p.hair_type ? ' · ' + p.hair_type : ''}` === baseService
                                    );
                                    const basePrice = baseSvc?.price || 0;
                                    const addonsTotal = addons.reduce((s, n) => {
                                      const a = (servicePrices || []).find(p => p.name === n && p.category === 'Add-on');
                                      return s + (a?.price || 0);
                                    }, 0);
                                    return (
                                      <>
                                        {baseService && (
                                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                            <span>✂️ {baseService}</span>
                                            <span style={{ fontWeight: 600 }}>${basePrice.toFixed(2)}</span>
                                          </div>
                                        )}
                                        {addons.map((name, i) => {
                                          const a = (servicePrices || []).find(p => p.name === name && p.category === 'Add-on');
                                          return (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                                              <span>+ {name}</span>
                                              <span>${(a?.price || 0).toFixed(2)}</span>
                                            </div>
                                          );
                                        })}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#0f766e', paddingTop: 6, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
                                          <span>TOTAL</span>
                                          <span>${(ap.amount || 0).toFixed(2)}</span>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Solo lectura — cita completada */}
                            {isAdmin && appt.status === 'completed' && (
                              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                                {(ap.service || '').split(' + ').map((name, i) => {
                                  const isBase = i === 0;
                                  const svc = isBase
                                    ? (servicePrices || []).find(p => p.category !== 'Add-on' && `${p.name}${p.size ? ' · ' + p.size.split('(')[0].trim() : ''}${p.hair_type ? ' · ' + p.hair_type : ''}` === name)
                                    : (servicePrices || []).find(p => p.name === name && p.category === 'Add-on');
                                  return (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: isBase ? 13 : 12, color: isBase ? '#0f172a' : '#64748b', marginBottom: 3 }}>
                                      <span>{isBase ? '✂️ ' : '+ '}{name}</span>
                                      <span style={{ fontWeight: isBase ? 600 : 400 }}>${(svc?.price || 0).toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#0f766e', paddingTop: 6, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
                                  <span>TOTAL</span><span>${(ap.amount || 0).toFixed(2)}</span>
                                </div>
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

      {/* Modal de invoice */}
      {showInvoice && (
        <InvoiceModal
          invoice={showInvoice}
          onClose={() => setShowInvoice(null)}
        />
      )}

      {/* ===== VISTA SEMANA — Timeline por día con bloques ===== */}
      {viewMode === 'semana' && (() => {
        const { start: wStart, end: wEnd } = getWeekRange(date);
        const days = [];
        let cur = new Date(wStart + 'T12:00:00');
        while (true) {
          const tz = cur.getTimezoneOffset() * 60000;
          const iso = new Date(cur - tz).toISOString().slice(0,10);
          days.push(iso);
          if (iso >= wEnd) break;
          cur.setDate(cur.getDate() + 1);
        }
        const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am - 7pm

        const getApptTop = (timeStr) => {
          if (!timeStr) return 0;
          const [h, m] = timeStr.split(':').map(Number);
          return ((h - 7) * 60 + (m || 0)) * (48 / 60); // 48px por hora
        };

        const getApptHeight = (timeStart, timeEnd) => {
          if (!timeStart || !timeEnd) return 96; // 2 horas default
          const [sh, sm] = timeStart.split(':').map(Number);
          const [eh, em] = timeEnd.split(':').map(Number);
          const mins = (eh * 60 + em) - (sh * 60 + sm);
          return Math.max(mins * (48 / 60), 40);
        };

        return (
          <div>
            {/* Header semana con navegación */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button onClick={() => { const p = new Date(wStart + 'T12:00:00'); p.setDate(p.getDate() - 7); const tz = p.getTimezoneOffset() * 60000; setDate(new Date(p - tz).toISOString().slice(0,10)); }} style={{ ...styles.iconBtn, fontSize: 20, padding: '6px 12px' }}>‹</button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700 }}>
                {formatDateNice(wStart)} — {formatDateNice(wEnd)}
              </div>
              <button onClick={() => { const n = new Date(wStart + 'T12:00:00'); n.setDate(n.getDate() + 7); const tz = n.getTimezoneOffset() * 60000; setDate(new Date(n - tz).toISOString().slice(0,10)); }} style={{ ...styles.iconBtn, fontSize: 20, padding: '6px 12px' }}>›</button>
            </div>

            {/* Columnas días */}
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(7, minmax(100px, 1fr))', minWidth: 750 }}>
                {/* Header días */}
                <div />
                {days.map((d, i) => {
                  const count = appointments.filter(a => a.date === d).length;
                  const isToday = d === todayISO();
                  return (
                    <div key={d} style={{ textAlign: 'center', padding: '8px 4px', borderBottom: '2px solid #e2e8f0', background: isToday ? '#fffbeb' : '#fff' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{DAY_LABELS[i]}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: isToday ? '#f59e0b' : '#0f172a' }}>{d.slice(8)}</div>
                      {count > 0 && <div style={{ fontSize: 10, color: '#0f766e', fontWeight: 600 }}>{count} apt{count !== 1 ? 's' : ''}</div>}
                    </div>
                  );
                })}

                {/* Filas de horas */}
                {HOURS.map(hour => (
                  <>
                    {/* Label hora */}
                    <div key={`hour-${hour}`} style={{ fontSize: 10, color: '#94a3b8', textAlign: 'right', paddingRight: 6, paddingTop: 4, height: 48, borderTop: '1px solid #f1f5f9' }}>
                      {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour-12}pm`}
                    </div>
                    {/* Celdas por día */}
                    {days.map(d => {
                      const dayAppts = appointments.filter(a => {
                        if (a.date !== d) return false;
                        if (!a.timeStart) return false;
                        const [h] = a.timeStart.split(':').map(Number);
                        return h === hour;
                      });
                      const isToday = d === todayISO();
                      return (
                        <div key={`${d}-${hour}`} style={{ height: 48, borderTop: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', background: isToday ? 'rgba(245,158,11,0.03)' : 'transparent', position: 'relative' }}>
                          {dayAppts.map(appt => {
                            const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
                            const height = getApptHeight(appt.timeStart, appt.timeEnd);
                            return (
                              <div key={appt.id}
                                onClick={() => setExpandedAppt(expandedAppt === appt.id ? null : appt.id)}
                                style={{ position: 'absolute', left: 2, right: 2, top: 2, height: Math.min(height, 44), background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 6, padding: '2px 4px', cursor: 'pointer', overflow: 'hidden', zIndex: 1 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: sc.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {appt.timeStart} {appt.client?.name?.split(' ')[0] || ''}
                                </div>
                                {height > 30 && (
                                  <div style={{ fontSize: 9, color: sc.text, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                    🐾 {appt.pets?.[0]?.pet?.name || ''}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
              Tap any appointment to expand · Tap a day header to see list view
            </div>
          </div>
        );
      })()}

      {/* ===== VISTA MES — Cuadrícula con nombres ===== */}
      {viewMode === 'mes' && (() => {
        const d = new Date(date + 'T12:00:00');
        const year = d.getFullYear();
        const month = d.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDow = (firstDay.getDay() + 6) % 7;
        const totalDays = lastDay.getDate();
        const toISO = (y, m, day) => `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button onClick={() => { const p = new Date(year, month - 1, 1); setDate(toISO(p.getFullYear(), p.getMonth(), 1)); }} style={{ ...styles.iconBtn, fontSize: 20 }}>‹</button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700 }}>{monthNames[month]} {year}</div>
              <button onClick={() => { const n = new Date(year, month + 1, 1); setDate(toISO(n.getFullYear(), n.getMonth(), 1)); }} style={{ ...styles.iconBtn, fontSize: 20 }}>›</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
              {DAY_LABELS.map(dl => (
                <div key={dl} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 0' }}>{dl}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {Array.from({ length: startDow }).map((_, i) => <div key={`e-${i}`} style={{ minHeight: 80 }} />)}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const iso = toISO(year, month, dayNum);
                const dayAppts = appointments.filter(a => a.date === iso && (filterVanId === 'todos' || (filterVanId === 'epw' || filterVanId === 'atw' ? vans.find(v => v.id === a.vanId)?.companyId === filterVanId : a.vanId === filterVanId)));
                const isToday = iso === todayISO();
                const isSelected = iso === date;

                return (
                  <div key={iso}
                    style={{ minHeight: 80, padding: '4px', background: isSelected ? '#f0fdfa' : isToday ? '#fffbeb' : '#fff', border: `1.5px solid ${isSelected ? '#0f766e' : isToday ? '#f59e0b' : '#f1f5f9'}`, borderRadius: 8, cursor: 'pointer' }}
                    onClick={() => { setDate(iso); setViewMode('lista'); }}>
                    <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? '#f59e0b' : isSelected ? '#0f766e' : '#0f172a', marginBottom: 3 }}>{dayNum}</div>
                    {dayAppts.slice(0, 3).map(a => {
                      const sc = STATUS_COLORS[a.status] || STATUS_COLORS.unconfirmed;
                      return (
                        <div key={a.id} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 4, background: sc.bg, color: sc.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {a.timeStart ? `${a.timeStart} ` : ''}{a.client?.name?.split(' ')[0] || '🐾'}
                        </div>
                      );
                    })}
                    {dayAppts.length > 3 && (
                      <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>+{dayAppts.length - 3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ===== VISTA AGENDA — Por groomer ===== */}
      {viewMode === 'agenda' && (() => {
        const activeGroomers = groomers?.filter(g => g.active !== false) || [];
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => { const p = new Date(date + 'T12:00:00'); p.setDate(p.getDate() - 1); const tz = p.getTimezoneOffset() * 60000; setDate(new Date(p - tz).toISOString().slice(0,10)); }} style={{ ...styles.iconBtn, fontSize: 20 }}>‹</button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700 }}>{formatDateNice(date)}</div>
              <button onClick={() => { const n = new Date(date + 'T12:00:00'); n.setDate(n.getDate() + 1); const tz = n.getTimezoneOffset() * 60000; setDate(new Date(n - tz).toISOString().slice(0,10)); }} style={{ ...styles.iconBtn, fontSize: 20 }}>›</button>
            </div>

            {activeGroomers.map(groomer => {
              const van = vans.find(v => v.id === groomer.vanId);
              const company = DEFAULT_COMPANIES.find(c => c.id === van?.companyId);
              const groomerAppts = appointments.filter(a => {
                if (a.date !== date) return false;
                return a.groomerId === groomer.id || a.vanId === groomer.vanId;
              }).sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''));

              return (
                <div key={groomer.id} style={{ ...styles.card, marginBottom: 12 }}>
                  {/* Header groomer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: groomerAppts.length > 0 ? 12 : 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdfa', border: '2px solid #0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#0f766e' }}>
                      {groomer.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>✂️ {groomer.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{company?.logoEmoji} {company?.name} · {van?.name}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: groomerAppts.length > 0 ? '#0f766e' : '#94a3b8' }}>
                      {groomerAppts.length} apt{groomerAppts.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Citas del groomer */}
                  {groomerAppts.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '8px 0', display: groomerAppts.length === 0 ? 'block' : 'none' }}>No appointments today</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {groomerAppts.map(appt => {
                        const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
                        const isExpanded = expandedAppt === appt.id;
                        return (
                          <div key={appt.id}
                            onClick={() => setExpandedAppt(isExpanded ? null : appt.id)}
                            style={{ padding: '10px 14px', background: sc.bg, borderRadius: 10, border: `1.5px solid ${sc.border}`, cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: sc.text }}>
                                  {appt.timeStart && `⏰ ${appt.timeStart} `}{appt.client?.name || 'Client'}
                                </div>
                                <div style={{ fontSize: 12, color: sc.text, opacity: 0.8, marginTop: 2 }}>
                                  🐾 {appt.pets?.map(p => p.pet?.name).filter(Boolean).join(', ') || 'Pets'}
                                  {appt.client?.address && ` · 📍 ${appt.client.address.split(',')[0]}`}
                                </div>
                              </div>
                              <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.6)', color: sc.text, fontWeight: 600 }}>
                                {STATUS_LABELS[appt.status]}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Modal de firma */}
      {/* Modal de firma */}
      {showSignature && (
        <SignatureModal
          appt={showSignature}
          companyId={vans.find(v => v.id === showSignature.vanId)?.companyId || 'epw'}
          onSave={(sig) => handleSaveSignature(showSignature, sig)}
          onClose={() => setShowSignature(null)}
        />
      )}

      {/* Modal de cobro */}
      {showCobroForm && (
        <div onClick={() => setShowCobroForm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '20px 20px 0 0', padding: '20px 20px 32px', maxWidth: 460, width: '100%', boxShadow: '0 -10px 40px rgba(0,0,0,0.3)', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 999, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Collect Payment</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '4px 0 0', fontFamily: 'Fraunces, serif' }}>💰 {showCobroForm.client?.name}</h3>
              </div>
              <button onClick={() => setShowCobroForm(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>

            {/* Resumen mascotas con desglose */}
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 18, border: '1px solid #e2e8f0' }}>
              {(showCobroForm.pets || []).length > 0 ? (
                (showCobroForm.pets || []).map((ap, i) => {
                  const petName = ap.pet?.name || ap.petName || 'Mascota';
                  const parts = (ap.service || '').split(' + ');
                  const baseService = parts[0];
                  const addons = parts.slice(1);
                  return (
                    <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < (showCobroForm.pets?.length || 0) - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>🐾 {petName}</div>
                      {baseService && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 3 }}>
                          <span style={{ color: '#1e293b' }}>✂️ {baseService}</span>
                          <span style={{ fontWeight: 600, color: '#0f766e' }}>
                            ${(() => {
                              const addonsTotal = addons.reduce((s, n) => {
                                const a = (servicePrices || []).find(p => p.name === n && p.category === 'Add-on');
                                return s + (a?.price || 0);
                              }, 0);
                              return Math.max(0, (ap.amount || 0) - addonsTotal).toFixed(2);
                            })()}
                          </span>
                        </div>
                      )}
                      {addons.map((name, j) => {
                        const addon = (servicePrices || []).find(p => p.name === name && p.category === 'Add-on');
                        return (
                          <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 2, paddingLeft: 12 }}>
                            <span>+ {name}</span>
                            <span>${(addon?.price || 0).toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#0f766e', marginTop: 6 }}>
                        <span>Subtotal</span>
                        <span>${(ap.amount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 15, color: '#64748b' }}>Sin mascotas registradas</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 6, borderTop: '2px solid #e2e8f0', fontSize: 18, fontWeight: 800 }}>
                <span style={{ color: '#0f172a' }}>TOTAL SERVICIOS</span>
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
                  <button key={m} onClick={async () => {
                    setCobroForm(f => ({...f, method: m}));
                    if (m === 'Credit Card') {
                      setTimeout(async () => {
                        try { await processSquarePayment(0); } catch(e) {}
                      }, 300);
                    }
                  }}
                    style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${cobroForm.method === m ? '#0f766e' : '#e2e8f0'}`, background: cobroForm.method === m ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 15, fontWeight: cobroForm.method === m ? 700 : 500, color: cobroForm.method === m ? '#0f766e' : '#475569' }}>
                    {m}
                  </button>
                ))}
              </div>
              {cobroForm.method === 'Credit Card' && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ padding: '8px 12px', background: '#fffbeb', borderRadius: 8, fontSize: 13, color: '#92400e', border: '1px solid #fcd34d', marginBottom: 10 }}>
                    ⚠️ {settings?.cardFeePct || 5.5}% card fee will be added
                  </div>
                  {/* Square Card Container */}
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 10 }}>
                      💳 Enter card details or use Tap to Pay
                    </div>
                    <div id="square-card-container" style={{ minHeight: 89 }}></div>
                  </div>
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
                {saving ? 'Guardando...' : 'Save ficha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== GASOLINA SECTION =====
function GasolinaSection({ vanId, vans, fuelLogs, setFuelLogs, isAdmin }) {
  const [fuelForm, setFuelForm] = useState({ odometer: '', amount: '', method: 'cash', station: '', date: todayISO() });
  const [fuelReceipt, setFuelReceipt] = useState(null);
  const [fuelPreview, setFuelPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const vanFuelLogs = useMemo(() =>
    (fuelLogs || []).filter(f => f.vanId === vanId).sort((a,b) => b.odometer - a.odometer),
    [fuelLogs, vanId]
  );

  const handleSave = async () => {
    if (!fuelForm.odometer || !fuelForm.amount) { alert('Ingresa odómetro y monto'); return; }
    setSaving(true);
    const log = {
      id: uid(), vanId, date: fuelForm.date,
      odometer: parseFloat(fuelForm.odometer) || 0,
      amount: parseFloat(fuelForm.amount) || 0,
      method: fuelForm.method, station: fuelForm.station.trim(),
    };
    if (fuelReceipt) {
      const ext = fuelReceipt.name.split('.').pop();
      const path = `fuel-${log.id}.${ext}`;
      const { error } = await supabase.storage.from('receipts').upload(path, fuelReceipt, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('receipts').getPublicUrl(path);
        log.receiptUrl = data.publicUrl;
      }
    }
    const ok = await saveFuelLog(log);
    if (ok) {
      setFuelLogs(prev => [log, ...prev]);
      setFuelForm({ odometer: '', amount: '', method: 'cash', station: '', date: todayISO() });
      setFuelReceipt(null); setFuelPreview(null);
      alert('✅ Carga registrada');
    }
    setSaving(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={styles.card}>
        <h3 style={styles.cardH3}>⛽ Registrar carga de gasolina</h3>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.lbl}>Date *</label>
            <input type="date" value={fuelForm.date} onChange={e => setFuelForm(f => ({...f, date: e.target.value}))} style={styles.input} />
          </div>
          <div>
            <label style={styles.lbl}>Odómetro (millas) *</label>
            <input type="number" step="1" value={fuelForm.odometer} onChange={e => setFuelForm(f => ({...f, odometer: e.target.value}))} style={styles.input} placeholder="45,230" />
          </div>
          <div>
            <label style={styles.lbl}>Amount pagado *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }}>$</span>
              <input type="number" step="0.01" value={fuelForm.amount} onChange={e => setFuelForm(f => ({...f, amount: e.target.value}))} style={{ ...styles.input, paddingLeft: 24 }} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label style={styles.lbl}>Método de pago</label>
            <select value={fuelForm.method} onChange={e => setFuelForm(f => ({...f, method: e.target.value}))} style={styles.input}>
              <option value="cash">💵 Cash</option>
              <option value="tarjeta-empresa">💳 Tarjeta empresa</option>
            </select>
          </div>
          <div>
            <label style={styles.lbl}>Estación (opcional)</label>
            <input value={fuelForm.station} onChange={e => setFuelForm(f => ({...f, station: e.target.value}))} style={styles.input} placeholder="Ej: Shell Brickell" />
          </div>
          <div>
            <label style={styles.lbl}>📷 Foto recibo (opcional)</label>
            <input type="file" accept="image/*" capture="environment"
              onChange={e => { const file = e.target.files[0]; if (!file) return; setFuelReceipt(file); setFuelPreview(URL.createObjectURL(file)); }}
              style={{ ...styles.input, padding: '7px 12px', fontSize: 13 }} />
          </div>
        </div>
        {fuelPreview && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={fuelPreview} alt="Recibo" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <button onClick={() => { setFuelReceipt(null); setFuelPreview(null); }} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Quitar foto</button>
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <button onClick={handleSave} style={styles.btnPrimary} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : '⛽'}
            {saving ? 'Guardando...' : 'Registrar carga'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <SectionTitle eyebrow={vans.find(v => v.id === vanId)?.name || 'Van'} title="Historial de cargas" />
        {vanFuelLogs.length === 0 ? (
          <div style={styles.empty}><p style={{ margin: 0, color: '#64748b' }}>Sin cargas registradas aún</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vanFuelLogs.map((log, idx) => {
              const prev = vanFuelLogs[idx + 1];
              const miles = prev ? Math.round(log.odometer - prev.odometer) : null;
              return (
                <div key={log.id} style={{ ...styles.card, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>📍 {log.odometer.toLocaleString()} mi</span>
                        {miles !== null && miles > 0 && (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#f0fdfa', color: '#0f766e', fontWeight: 600 }}>
                            +{miles.toLocaleString()} mi desde última carga
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {formatDateNice(log.date)} · {log.method === 'cash' ? '💵 Cash' : '💳 Tarjeta empresa'}
                        {log.station && ` · ${log.station}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      {log.receiptUrl && (
                        <img src={log.receiptUrl} alt="Recibo" onClick={() => setViewingReceipt(log.receiptUrl)}
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid #e2e8f0' }} />
                      )}
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#0284c7' }}>{fmt(log.amount)}</span>
                      {isAdmin && (
                        <button onClick={async () => { if (!confirm('¿Eliminar?')) return; await deleteFuelLog(log.id); setFuelLogs(prev => prev.filter(f => f.id !== log.id)); }}
                          style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={13} /></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewingReceipt && (
        <div onClick={() => setViewingReceipt(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={viewingReceipt} alt="Recibo" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}

function CierreTab({ vans, services, expenses, isAdmin, settings }) {
  const [dateStart, setDateStart] = useState(todayISO());
  const [dateEnd, setDateEnd] = useState(todayISO());
  const [rangeMode, setRangeMode] = useState(false);

  const start = dateStart;
  const end = rangeMode ? dateEnd : dateStart;

  const breakdown = useMemo(() => {
    return vans.map(van => {
      const items = services.filter(s => inRange(s.date, start, end) && s.vanId === van.id);
      const vanExpenses = expenses.filter(e => inRange(e.date, start, end) && e.vanId === van.id);
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
      const vanCommission = van.commissionPct || settings?.commissionPct || 45;
      const commission = total * (vanCommission / 100);
      const companyShare = total * ((100 - vanCommission) / 100);
      const companyTotal = companyShare + gasFees + cardFees;
      return { van, items, byMethod, total, tips, cardFees, gasFees, expTotal, count: items.length, expenses: vanExpenses, commission, companyShare, companyTotal, vanCommission };
    });
  }, [vans, services, expenses, start, end, settings]);

  const grandTotal = breakdown.reduce((sum, b) => sum + b.total, 0);
  const grandTips = breakdown.reduce((sum, b) => sum + b.tips, 0);
  const grandCount = breakdown.reduce((sum, b) => sum + b.count, 0);
  const grandCardFees = breakdown.reduce((sum, b) => sum + b.cardFees, 0);
  const grandGasFees = breakdown.reduce((sum, b) => sum + b.gasFees, 0);
  const grandCommission = breakdown.reduce((sum, b) => sum + b.commission, 0);
  const grandCompanyShare = breakdown.reduce((sum, b) => sum + b.companyShare, 0);
  const grandCompanyTotal = breakdown.reduce((sum, b) => sum + b.companyTotal, 0);
  const grandByMethod = PAYMENT_METHODS.reduce((acc, m) => { acc[m] = breakdown.reduce((sum, b) => sum + b.byMethod[m].amount, 0); return acc; }, {});

  const title = rangeMode
    ? `${formatDateNice(start)} — ${formatDateNice(end)}`
    : formatDateNice(start);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Daily Close" title={title} />

      {/* Selector de fechas */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>📅 Period</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => exportDailyPDF(services, vans, start, end, settings)}
              style={{ ...styles.btnSecondary, fontSize: 12, padding: '6px 12px' }}>
              <FileText size={13} /> PDF
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={styles.lbl}>{rangeMode ? 'Date inicio' : 'Date'}</label>
            <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} style={{ ...styles.input, width: 180 }} />
          </div>
          {rangeMode && (
            <div>
              <label style={styles.lbl}>Date fin</label>
              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} style={{ ...styles.input, width: 180 }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={() => setRangeMode(!rangeMode)}
            style={{ ...styles.btnSecondary, padding: '9px 14px', fontSize: 13, borderColor: rangeMode ? '#0f766e' : '#e2e8f0', color: rangeMode ? '#0f766e' : '#64748b' }}>
            {rangeMode ? '📅 Ver un día' : '📅 Ver rango'}
          </button>
          <button onClick={() => exportDailyPDF(services, vans, start, end, settings)}
            style={{ ...styles.btnPrimary, padding: '9px 14px', fontSize: 13 }}>
            <FileText size={13} /> Export PDF
          </button>
        </div>
      </div>

      {/* KPIs principales */}
      <div style={styles.kpiGrid}>
        <KpiCard label="Services" value={grandCount} />
        <KpiCard label="Sales totales" value={fmt(grandTotal)} highlight />
        {grandTips > 0 && <KpiCard label="Tips" value={fmt(grandTips)} />}
        {grandCardFees > 0 && <KpiCard label="Fee tarjeta" value={fmt(grandCardFees)} />}
        <KpiCard label="Fee gasolina" value={fmt(grandGasFees)} />
        <KpiCard label="To Pay Groomers" value={fmt(grandCommission)} />
        <KpiCard label="Company Income" value={fmt(grandCompanyTotal)} highlight accent />
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
          <SectionTitle eyebrow="By Van" title="Desglose individual" />
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
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No services</div>
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
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                      {b.tips > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Tips</span><span style={{ color: '#0f766e', fontWeight: 600 }}>{fmt(b.tips)}</span></div>}
                      {b.cardFees > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Fee tarjeta</span><span style={{ color: '#7c3aed', fontWeight: 600 }}>{fmt(b.cardFees)}</span></div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Fee gasolina</span><span style={{ color: '#0284c7', fontWeight: 600 }}>{fmt(b.gasFees)}</span></div>
                      {b.expTotal > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Expenses del día</span><span style={{ color: '#dc2626', fontWeight: 600 }}>-{fmt(b.expTotal)}</span></div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', marginTop: 4, borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#0f766e', fontWeight: 600 }}>To Pay Groomer ({b.vanCommission}%)</span>
                        <span style={{ color: '#0f766e', fontWeight: 700 }}>{fmt(b.commission)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                        <span style={{ color: '#7c3aed', fontWeight: 600 }}>Company Income</span>
                        <span style={{ color: '#7c3aed', fontWeight: 700 }}>{fmt(b.companyTotal)}</span>
                      </div>
                    </div>
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
function WeekTab({ vans, services, expenses, settings, appointments, groomers }) {
  const [refDate, setRefDate] = useState(todayISO());
  const [reportMode, setReportMode] = useState('groomer');
  const { start, end } = getWeekRange(refDate);

  const handleExportPDF = () => exportWeeklyPDF(groomers, vans, services, settings, start, end);
  const handleExportExcel = () => exportWeeklyExcel(groomers, vans, services, settings, start, end);

  // Reporte por GROOMER + EMPRESA (nuevo)
  const groomerReport = useMemo(() => {
    const weekAppts = (appointments || []).filter(a => inRange(a.date, start, end) && a.status === 'completed');
    const weekExpenses = expenses.filter(e => inRange(e.date, start, end));

    // Agrupar por groomer
    const groomerMap = {};
    for (const appt of weekAppts) {
      const groomerId = appt.groomerId || appt.vanId; // fallback a van si no hay groomer
      const companyId = appt.companyId || vans.find(v => v.id === appt.vanId)?.companyId || 'epw';
      const key = `${groomerId}__${companyId}`;
      if (!groomerMap[key]) {
        const groomer = (groomers || []).find(g => g.id === groomerId) ||
          vans.find(v => v.id === groomerId); // fallback
        groomerMap[key] = {
          groomerId, companyId,
          groomerName: groomer?.name || groomer?.groomer || 'Sin asignar',
          commissionPct: groomer?.commissionPct || settings.commissionPct || 45,
          citas: 0, sales: 0, tips: 0, pets: 0,
        };
      }
      groomerMap[key].citas++;
      groomerMap[key].pets += appt.pets?.length || 0;
      groomerMap[key].sales += appt.pets?.reduce((sum, ap) => sum + (ap.amount || 0), 0) || 0;
    }

    return Object.values(groomerMap).map(r => {
      const gasFees = r.citas * (settings.gasFee || 7);
      const commission = r.sales * (r.commissionPct / 100);
      const totalPay = commission; // Gas fee lo paga el cliente, no se descuenta al groomer
      const company = DEFAULT_COMPANIES.find(c => c.id === r.companyId) || DEFAULT_COMPANIES[0];
      return { ...r, gasFees, commission, totalPay, company };
    }).sort((a, b) => a.groomerName.localeCompare(b.groomerName));
  }, [appointments, expenses, start, end, groomers, vans, settings]);

  // Reporte por van (clásico)
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
      const totalPay = commission + tipShare;
      // Company Income = % que queda + fees
      const companyPct = 100 - vanCommission;
      const companyShare = sales * (companyPct / 100);
      const companyTotal = companyShare + gasFees + cardFees;
      const byMethod = PAYMENT_METHODS.reduce((acc, m) => { acc[m] = items.filter(i => i.method === m).reduce((sum, i) => sum + i.amount, 0); return acc; }, {});
      return { van, count: items.length, sales, tips, cardFees, gasFees, expTotal, commission, tipShare, totalPay, companyShare, companyTotal, companyPct, byMethod, vanCommission };
    });
  }, [vans, services, expenses, start, end, settings]);

  const totals = report.reduce((acc, r) => ({
    sales: acc.sales + r.sales, tips: acc.tips + r.tips, cardFees: acc.cardFees + r.cardFees,
    gasFees: acc.gasFees + r.gasFees, expTotal: acc.expTotal + r.expTotal,
    commission: acc.commission + r.commission, tipShare: acc.tipShare + r.tipShare,
    totalPay: acc.totalPay + r.totalPay, count: acc.count + r.count,
    companyShare: acc.companyShare + r.companyShare, companyTotal: acc.companyTotal + r.companyTotal,
  }), { sales: 0, tips: 0, cardFees: 0, gasFees: 0, expTotal: 0, commission: 0, tipShare: 0, totalPay: 0, count: 0, companyShare: 0, companyTotal: 0 });

  const exportCSV = () => {
    const rows = [
      ['Weekly Report El Pet Wash'],
      [`Week: ${start} a ${end}`],
      [`Commission: ${settings.commissionPct}% · Tips: ${settings.tipsToGroomer}% · Fee gasolina: $${settings.gasFee} · Fee tarjeta: ${settings.cardFeePct}%`],
      [],
      ['Van','Groomer','Services','Sales','Cash','Zelle','Tarjeta','Check','Tips','Fee Tarjeta','Fee Gasolina','Expenses','Commission','+ Tips','- Gasolina','- Expenses','A PAGAR'],
    ];
    report.forEach(r => rows.push([
      r.van.name, r.van.groomer||'', r.count, r.sales.toFixed(2),
      r.byMethod['Cash'].toFixed(2), r.byMethod['Zelle'].toFixed(2),
      r.byMethod['Credit Card'].toFixed(2), r.byMethod['Check'].toFixed(2),
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
      <SectionTitle eyebrow="Weekly Report" title={`${formatDateNice(start)} — ${formatDateNice(end)}`} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={exportCSV} style={{ ...styles.btnSecondary, fontSize: 12 }}>
          <Download size={14} /> CSV
        </button>
        <button onClick={handleExportPDF} style={{ ...styles.btnSecondary, fontSize: 12 }}>
          <FileText size={14} /> PDF
        </button>
        <button onClick={handleExportExcel} style={{ ...styles.btnSecondary, fontSize: 12 }}>
          <Download size={14} /> Excel
        </button>
      </div>
      <div style={styles.card}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={styles.lbl}>Cualquier día de la semana</label>
            <input type="date" value={refDate} onChange={e => setRefDate(e.target.value)} style={styles.input} />
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>Lunes a domingo</p>
          </div>
          {/* Toggle vista */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, gap: 2 }}>
            <button onClick={() => setReportMode('groomer')}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: reportMode === 'groomer' ? 600 : 400, background: reportMode === 'groomer' ? '#fff' : 'transparent', color: reportMode === 'groomer' ? '#0f766e' : '#64748b' }}>
              ✂️ By Groomer
            </button>
            <button onClick={() => setReportMode('van')}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: reportMode === 'van' ? 600 : 400, background: reportMode === 'van' ? '#fff' : 'transparent', color: reportMode === 'van' ? '#0f766e' : '#64748b' }}>
              🚐 By Van
            </button>
          </div>
          <button onClick={exportCSV} style={styles.btnPrimary}><Download size={15} /> Exportar CSV</button>
        </div>
      </div>

      {/* ===== REPORTE POR GROOMER ===== */}
      {reportMode === 'groomer' && (
        <div style={{ marginTop: 20 }}>
          <SectionTitle eyebrow="Pago a Groomers" title="Por groomer y empresa" />
          {groomerReport.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ margin: 0, color: '#64748b', fontFamily: 'Fraunces, serif', fontSize: 18 }}>Sin citas completadas esta semana</p>
              <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 13 }}>Las citas deben estar en estado "Completed" para aparecer aquí</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Agrupar por groomer */}
              {[...new Set(groomerReport.map(r => r.groomerName))].map(groomerName => {
                const rows = groomerReport.filter(r => r.groomerName === groomerName);
                const totalSales = rows.reduce((sum, r) => sum + r.sales, 0);
                const totalPay = rows.reduce((sum, r) => sum + r.totalPay, 0);
                return (
                  <div key={groomerName} style={{ ...styles.card }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600 }}>✂️ {groomerName}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {rows.reduce((sum, r) => sum + r.citas, 0)} citas · {rows.reduce((sum, r) => sum + r.pets, 0)} mascotas
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Total a pagar</div>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#0f766e' }}>{fmt(totalPay)}</div>
                      </div>
                    </div>

                    {/* Por empresa */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {rows.map(r => (
                        <div key={`${r.groomerId}-${r.companyId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.company.logoEmoji} {r.company.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              {r.citas} citas · {r.pets} mascotas · {r.commissionPct}% comisión
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                              Sales {fmt(r.sales)} · Commission {fmt(r.commission)} · Gas -{fmt(r.gasFees)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>A pagar</div>
                            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#0f766e' }}>{fmt(r.totalPay)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {rows.length > 1 && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                        <span>Total combinado</span>
                        <span style={{ color: '#0f766e' }}>{fmt(totalPay)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== REPORTE POR VAN (clásico) ===== */}
      {reportMode === 'van' && (
        <>
          <div style={styles.kpiGrid}>
            <KpiCard label="Services" value={totals.count} />
            <KpiCard label="Sales totales" value={fmt(totals.sales)} highlight />
            <KpiCard label="To Pay Groomers" value={fmt(totals.totalPay)} highlight accent />
            <KpiCard label="Company Income (55%)" value={fmt(totals.companyShare)} />
            <KpiCard label="+ Fee gasolina" value={fmt(totals.gasFees)} />
            <KpiCard label="+ Fee tarjeta" value={fmt(totals.cardFees)} />
            <KpiCard label="TOTAL EMPRESA" value={fmt(totals.companyTotal)} highlight />
          </div>

          <div style={{ marginTop: 24 }}>
            <SectionTitle eyebrow="Pago a Groomers + Ingreso Company" title="Desglose por van" />
        <div style={styles.card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Van</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Serv.</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Sales</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Commission groomer</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#0f766e' }}>A PAGAR groomer</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#7c3aed' }}>Company Income</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#0284c7' }}>+ Fee gas</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#ec4899' }}>+ Fee tarjeta</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#7c3aed' }}>TOTAL EMPRESA</th>
                </tr>
              </thead>
              <tbody>
                {report.map(r => (
                  <tr key={r.van.id} className="row-hover" style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{r.van.name}</strong>
                      {r.van.groomer && <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.van.groomer}</div>}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{r.count}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{fmt(r.sales)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{fmt(r.commission)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.vanCommission}%</div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#0f766e', fontFamily: 'Fraunces, serif', fontSize: 15 }}>{fmt(r.totalPay)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: '#7c3aed' }}>{fmt(r.companyShare)}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.companyPct}%</div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#0284c7' }}>{fmt(r.gasFees)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#ec4899' }}>{r.cardFees > 0 ? fmt(r.cardFees) : '—'}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800, color: '#7c3aed', fontFamily: 'Fraunces, serif', fontSize: 15 }}>{fmt(r.companyTotal)}</td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                  <td style={{ ...styles.td, fontWeight: 700 }}>TOTAL</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{totals.count}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{fmt(totals.sales)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>{fmt(totals.commission)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800, color: '#0f766e', fontFamily: 'Fraunces, serif', fontSize: 16 }}>{fmt(totals.totalPay)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>{fmt(totals.companyShare)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>{fmt(totals.gasFees)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#ec4899' }}>{totals.cardFees > 0 ? fmt(totals.cardFees) : '—'}</td>
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800, color: '#7c3aed', fontFamily: 'Fraunces, serif', fontSize: 17 }}>{fmt(totals.companyTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
          </div>
        </>
      )}
    </div>
  );
}

// ===== CONFIG TAB =====
function ConfigTab({ vans, updateVans, settings, updateSettings, services, clearServices, categories, addCategory, removeCategory, expenses, users, addUser, updateUser, toggleUserActive, servicePrices, updateServicePrice, addServicePrice, groomers, addGroomer, updateGroomer, toggleGroomerActive }) {
  const [activeSection, setActiveSection] = useState(null);
  const [editVan, setEditVan] = useState({});
  const [showNewGroomerForm, setShowNewGroomerForm] = useState(false);
  const [newGroomerData, setNewGroomerData] = useState({ name: '', pin: '', commissionPct: 45, vanId: '', companyId: 'epw' });
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
    { key: 'can_edit_config', label: 'Edit configuración' },
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
  // Solo mostrar admin y managers en usuarios del sistema — los groomers van en su propia sección
  const activeUsers = users.filter(u => u.active && u.role !== 'groomer');
  const inactiveUsers = users.filter(u => !u.active && u.role !== 'groomer');

  const startEdit = (v) => setEditVan({ ...editVan, [v.id]: { name: v.name, groomer: v.groomer || '', pin: v.pin || '', commissionPct: v.commissionPct || 45 } });
  const cancelEdit = (id) => { const copy = { ...editVan }; delete copy[id]; setEditVan(copy); };
  const saveEdit = (id) => {
    const e = editVan[id];
    if (!e.name.trim()) { alert('El nombre no puede estar vacío'); return; }
    updateVans(vans.map(v => v.id === id ? { ...v, name: e.name.trim() } : v));
    cancelEdit(id);
  };
  const clearAll = () => {
    if (confirm('¿Delete TODOS los servicios? No se puede deshacer.')) {
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
      <SectionTitle eyebrow="Groomora" title="⚙️ Settings" />

      {/* Menú principal */}
      {!activeSection ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { id: 'companies', icon: '🏢', title: 'Companies', sub: 'Vans & Groomers' },
            { id: 'fees', icon: '💳', title: 'Fees & Rates', sub: 'Gas, Card, Tax' },
            { id: 'services', icon: '✂️', title: 'Services', sub: 'Prices & Add-ons' },
            { id: 'users', icon: '👥', title: 'Users', sub: 'PINs & Roles' },
            { id: 'categories', icon: '📋', title: 'Categories', sub: 'Expense types' },
            { id: 'danger', icon: '⚠️', title: 'Danger Zone', sub: 'Clear data' },
          ].map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ padding: '20px 16px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.sub}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setActiveSection(null)} style={{ ...styles.btnSecondary, marginBottom: 16 }}>
            ← Back to Settings
          </button>

          {/* ===== COMPANIES ===== */}
          {activeSection === 'companies' && (
            <div>
              <div style={{ ...styles.card, marginTop: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>🏢 Companies — Vans & Groomers</h3>
                  <button onClick={() => setShowNewGroomerForm(prev => !prev)} style={{ ...styles.btnPrimary, padding: '6px 12px', fontSize: 12 }}>
                    <Plus size={14} /> New Groomer
                  </button>
                </div>

                {/* Formulario nuevo groomer */}
                {showNewGroomerForm && (
                  <div style={{ padding: '14px', background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>➕ New Groomer</div>
                    <div style={styles.formGrid}>
                      <div>
                        <label style={styles.lbl}>Name *</label>
                        <input value={newGroomerData.name} onChange={e => setNewGroomerData(d => ({...d, name: e.target.value}))} style={styles.input} placeholder="Groomer name" />
                      </div>
                      <div>
                        <label style={styles.lbl}>PIN * (4 digits)</label>
                        <input type="text" maxLength="4" value={newGroomerData.pin} onChange={e => setNewGroomerData(d => ({...d, pin: e.target.value.replace(/\D/g,'').slice(0,4)}))} style={{ ...styles.input, fontFamily: 'monospace', letterSpacing: '0.2em', textAlign: 'center' }} placeholder="0000" />
                      </div>
                      <div>
                        <label style={styles.lbl}>Company *</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {DEFAULT_COMPANIES.map(c => (
                            <button key={c.id} type="button" onClick={() => setNewGroomerData(d => ({...d, companyId: c.id, vanId: ''}))}
                              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${newGroomerData.companyId === c.id ? '#0f766e' : '#e2e8f0'}`, background: newGroomerData.companyId === c.id ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: newGroomerData.companyId === c.id ? 700 : 400, color: newGroomerData.companyId === c.id ? '#0f766e' : '#64748b' }}>
                              {c.logoEmoji} {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={styles.lbl}>Van</label>
                        <select value={newGroomerData.vanId} onChange={e => setNewGroomerData(d => ({...d, vanId: e.target.value}))} style={styles.input}>
                          <option value="">— No van assigned —</option>
                          {vans.filter(v => v.companyId === newGroomerData.companyId).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={styles.lbl}>Commission %</label>
                        <div style={{ position: 'relative' }}>
                          <input type="number" min="0" max="100" value={newGroomerData.commissionPct} onChange={e => setNewGroomerData(d => ({...d, commissionPct: e.target.value}))} style={{ ...styles.input, paddingRight: 28 }} />
                          <span style={{ position: 'absolute', right: 10, top: 11, color: '#94a3b8' }}>%</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={async () => {
                        if (!newGroomerData.name.trim()) { alert('Enter groomer name'); return; }
                        if (!newGroomerData.pin || newGroomerData.pin.length !== 4) { alert('PIN must be 4 digits'); return; }
                        const newG = { id: `groomer-${uid().slice(0,6)}`, name: newGroomerData.name.trim(), pin: newGroomerData.pin, commissionPct: parseFloat(newGroomerData.commissionPct) || 45, vanId: newGroomerData.vanId || null, active: true, companyId: newGroomerData.companyId };
                        await addGroomer(newG);
                        setShowNewGroomerForm(false);
                        setNewGroomerData({ name: '', pin: '', commissionPct: 45, vanId: '', companyId: 'epw' });
                      }} style={styles.btnPrimary}><Plus size={14} /> Add Groomer</button>
                      <button onClick={() => { setShowNewGroomerForm(false); setNewGroomerData({ name: '', pin: '', commissionPct: 45, vanId: '', companyId: 'epw' }); }} style={styles.btnSecondary}>Cancel</button>
                    </div>
                  </div>
                )}

                {DEFAULT_COMPANIES.map(company => {
                  const companyVans = vans.filter(v => v.companyId === company.id && v.active !== false);
                  const companyGroomers = (groomers || []).filter(g => g.active !== false).filter(g => {
                    const van = vans.find(v => v.id === g.vanId);
                    return van?.companyId === company.id || g.companyId === company.id;
                  });
                  return (
                    <div key={company.id} style={{ marginBottom: 20, padding: '16px', background: '#f8fafc', borderRadius: 12, border: `1px solid ${company.id === 'epw' ? '#ccfbf1' : '#ede9fe'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <span style={{ fontSize: 24 }}>{company.logoEmoji}</span>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700 }}>{company.name}</div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{companyGroomers.length} groomer{companyGroomers.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {companyVans.map(v => {
                          const assignedGroomer = (groomers || []).find(g => g.vanId === v.id && g.active !== false);
                          const isEditing = editVan[`groomer-${assignedGroomer?.id}`];
                          return (
                            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', minWidth: 60 }}>🚐 {v.name}</div>
                              <div style={{ color: '#e2e8f0' }}>→</div>
                              {isEditing ? (
                                <>
                                  <input value={isEditing.name} onChange={e => setEditVan({ ...editVan, [`groomer-${assignedGroomer.id}`]: { ...isEditing, name: e.target.value } })} placeholder="Name" style={{ ...styles.input, flex: 1 }} />
                                  <input type="text" maxLength="4" value={isEditing.pin} onChange={e => setEditVan({ ...editVan, [`groomer-${assignedGroomer.id}`]: { ...isEditing, pin: e.target.value.replace(/\D/g,'').slice(0,4) } })} placeholder="PIN" style={{ ...styles.input, width: 80, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.2em' }} />
                                  <div style={{ position: 'relative', width: 90 }}>
                                    <input type="number" min="0" max="100" value={isEditing.commissionPct} onChange={e => setEditVan({ ...editVan, [`groomer-${assignedGroomer.id}`]: { ...isEditing, commissionPct: e.target.value } })} style={{ ...styles.input, paddingRight: 24 }} />
                                    <span style={{ position: 'absolute', right: 8, top: 11, fontSize: 12, color: '#94a3b8' }}>%</span>
                                  </div>
                                  <button onClick={async () => {
                                    const ed = editVan[`groomer-${assignedGroomer.id}`];
                                    await updateGroomer({ ...assignedGroomer, ...ed, commissionPct: parseFloat(ed.commissionPct) || 45 });
                                    setEditVan(prev => { const c = {...prev}; delete c[`groomer-${assignedGroomer.id}`]; return c; });
                                  }} style={styles.iconBtnGreen}><Check size={16} /></button>
                                  <button onClick={() => setEditVan(prev => { const c = {...prev}; delete c[`groomer-${assignedGroomer.id}`]; return c; })} style={styles.iconBtn}><X size={16} /></button>
                                </>
                              ) : assignedGroomer ? (
                                <>
                                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{assignedGroomer.name}</div>
                                  <div style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, letterSpacing: '0.15em', color: '#475569' }}>{assignedGroomer.pin}</div>
                                  <div style={{ background: '#f0fdfa', padding: '3px 8px', borderRadius: 6, color: '#0f766e', fontWeight: 700, fontSize: 13 }}>{assignedGroomer.commissionPct}%</div>
                                  <button onClick={() => setEditVan(prev => ({...prev, [`groomer-${assignedGroomer.id}`]: { name: assignedGroomer.name, pin: assignedGroomer.pin, commissionPct: assignedGroomer.commissionPct }}))} style={styles.iconBtn}><Edit2 size={14} /></button>
                                  <button onClick={async () => {
                                    if (!confirm(`Deactivate ${assignedGroomer.name}? They won't appear in new appointments.`)) return;
                                    await updateGroomer({ ...assignedGroomer, active: false });
                                  }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>
                                </>
                              ) : (
                                <div style={{ flex: 1, fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No groomer assigned</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== FEES & RATES ===== */}
          {activeSection === 'fees' && (
            <div style={styles.card}>
              <h3 style={styles.cardH3}>💳 Fees & Rates</h3>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.lbl}>% Tips to groomer</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min="0" max="100" step="1" value={settings.tipsToGroomer}
                      onChange={e => updateSettings({ ...settings, tipsToGroomer: parseFloat(e.target.value) || 0 })}
                      style={{ ...styles.input, paddingRight: 32 }} />
                    <span style={{ position: 'absolute', right: 12, top: 11, color: '#94a3b8' }}>%</span>
                  </div>
                </div>
                <div>
                  <label style={styles.lbl}>Gas fee per service</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }}>$</span>
                    <input type="number" min="0" step="0.5" value={settings.gasFee}
                      onChange={e => updateSettings({ ...settings, gasFee: parseFloat(e.target.value) || 0 })}
                      style={{ ...styles.input, paddingLeft: 24 }} />
                  </div>
                </div>
                <div>
                  <label style={styles.lbl}>Credit card fee %</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min="0" max="100" step="0.1" value={settings.cardFeePct}
                      onChange={e => updateSettings({ ...settings, cardFeePct: parseFloat(e.target.value) || 0 })}
                      style={{ ...styles.input, paddingRight: 32 }} />
                    <span style={{ position: 'absolute', right: 12, top: 11, color: '#94a3b8' }}>%</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>Only added for credit card payments</p>
                </div>
                <div>
                  <label style={styles.lbl}>🧾 Tax rate (Florida)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" min="0" max="20" step="0.1" value={settings.taxRate ?? 7.0}
                      onChange={e => updateSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                      style={{ ...styles.input, paddingRight: 32 }} />
                    <span style={{ position: 'absolute', right: 12, top: 11, color: '#94a3b8' }}>%</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>Applies to company purchases</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== SERVICES ===== */}
          {activeSection === 'services' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ ...styles.cardH3, margin: 0 }}>✂️ Services & Prices</h3>
                <button onClick={() => setShowNewService(!showNewService)} style={styles.btnPrimary}>
                  <Plus size={15} /> New service
                </button>
              </div>
              {showNewService && (
                <div style={{ padding: 14, background: 'var(--color-background-secondary)', borderRadius: 10, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>New service</div>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.lbl}>Category</label>
                      <select value={newService.category} onChange={e => setNewService(f => ({...f, category: e.target.value}))} style={styles.input}>
                        <option value="Signature Bath">Signature Bath</option>
                        <option value="Full Groom">Full Groom</option>
                        <option value="Add-on">Add-on</option>
                        <option value="Cat">Cat</option>
                        <option value="Exotic">Exotic</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.lbl}>Name *</label>
                      <input value={newService.name} onChange={e => setNewService(f => ({...f, name: e.target.value}))} style={styles.input} placeholder="e.g. Small (1-20 lbs)" />
                    </div>
                    {['Signature Bath','Full Groom'].includes(newService.category) && (
                      <>
                        <div>
                          <label style={styles.lbl}>Size</label>
                          <input value={newService.size} onChange={e => setNewService(f => ({...f, size: e.target.value}))} style={styles.input} placeholder="Small (1-20 lbs)" />
                        </div>
                        <div>
                          <label style={styles.lbl}>Hair type</label>
                          <select value={newService.hair_type} onChange={e => setNewService(f => ({...f, hair_type: e.target.value}))} style={styles.input}>
                            <option value="">All types</option>
                            <option value="Short Hair">Short Hair</option>
                            <option value="Long Hair">Long Hair</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div>
                      <label style={styles.lbl}>Price *</label>
                      <input type="number" step="0.01" value={newService.price} onChange={e => setNewService(f => ({...f, price: e.target.value}))} style={styles.input} placeholder="0.00" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={async () => {
                      if (!newService.name || !newService.price) { alert('Name and price required'); return; }
                      await addServicePrice({ id: `svc-${uid().slice(0,8)}`, category: newService.category, name: newService.name, size: newService.size, hair_type: newService.hair_type, price: parseFloat(newService.price) || 0, duration_minutes: 60 });
                      setNewService({ category: 'Add-on', name: '', size: '', hair_type: '', price: '', duration_minutes: 60 });
                      setShowNewService(false);
                    }} style={styles.btnPrimary}><Plus size={14} /> Save service</button>
                    <button onClick={() => setShowNewService(false)} style={styles.btnSecondary}>Cancel</button>
                  </div>
                </div>
              )}
              {['Signature Bath','Full Groom','Add-on','Cat','Exotic'].map(cat => {
                const items = (servicePrices || []).filter(p => p.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{cat}</div>
                    {items.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 4 }}>
                        <div style={{ flex: 1, fontSize: 13 }}>
                          {p.name}{p.size ? ` · ${p.size}` : ''}{p.hair_type ? ` · ${p.hair_type}` : ''}
                        </div>
                        {editingPrice[p.id] !== undefined ? (
                          <>
                            <input type="number" step="0.01" value={editingPrice[p.id]}
                              onChange={e => setEditingPrice(prev => ({...prev, [p.id]: e.target.value}))}
                              style={{ ...styles.input, width: 90, textAlign: 'right', padding: '4px 8px' }} />
                            <button onClick={async () => {
                              await updateServicePrice({ ...p, price: parseFloat(editingPrice[p.id]) || 0 });
                              setEditingPrice(prev => { const c = {...prev}; delete c[p.id]; return c; });
                            }} style={styles.iconBtnGreen}><Check size={14} /></button>
                            <button onClick={() => setEditingPrice(prev => { const c = {...prev}; delete c[p.id]; return c; })} style={styles.iconBtn}><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <span style={{ fontWeight: 700, color: '#0f766e', fontSize: 14 }}>${p.price}</span>
                            <button onClick={() => setEditingPrice(prev => ({...prev, [p.id]: p.price}))} style={styles.iconBtn}><Edit2 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== USERS ===== */}
          {activeSection === 'users' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ ...styles.cardH3, margin: 0 }}>👥 Users</h3>
                <button onClick={() => setShowNewUser(!showNewUser)} style={styles.btnPrimary}>
                  <Plus size={15} /> New user
                </button>
              </div>
              {(users || []).map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 8, opacity: u.active === false ? 0.5 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{u.role} · PIN: {u.pin}</div>
                  </div>
                  <button onClick={() => toggleUserActive(u.id, u.active !== false)} style={{ fontSize: 12, color: u.active !== false ? '#dc2626' : '#0f766e', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {u.active !== false ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ===== CATEGORIES ===== */}
          {activeSection === 'categories' && (
            <div style={styles.card}>
              <h3 style={styles.cardH3}>📋 Expense Categories</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ ...styles.input, flex: 1 }} placeholder="New category name" />
                <button onClick={async () => {
                  if (!newCategory.trim()) return;
                  await addCategory(newCategory.trim());
                  setNewCategory('');
                }} style={styles.btnPrimary}><Plus size={15} /></button>
              </div>
              {(categories || []).map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 6 }}>
                  {editingCategory?.old === cat ? (
                    <>
                      <input value={editingCategory.new} onChange={e => setEditingCategory(prev => ({...prev, new: e.target.value}))} style={{ ...styles.input, flex: 1, padding: '4px 8px' }} />
                      <button onClick={handleRenameCategory} style={styles.iconBtnGreen}><Check size={14} /></button>
                      <button onClick={() => setEditingCategory(null)} style={styles.iconBtn}><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 14 }}>{cat}</span>
                      <button onClick={() => setEditingCategory({ old: cat, new: cat })} style={styles.iconBtn}><Edit2 size={13} /></button>
                      <button onClick={() => removeCategory(cat)} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ===== DANGER ZONE ===== */}
          {activeSection === 'danger' && (
            <div style={{ ...styles.card, borderColor: '#fecaca' }}>
              <h3 style={{ ...styles.cardH3, color: '#991b1b' }}>⚠️ Danger Zone</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 0 }}>
                There are {services.length} service{services.length !== 1 ? 's' : ''} recorded in total.
              </p>
              <button onClick={clearAll} style={styles.btnDanger}>
                <Trash2 size={15} /> Delete all history
              </button>
            </div>
          )}

        </div>
      )}
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
  const s = METHOD_STYLES[method] || METHOD_STYLES['Cash'];
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
function BreedInput({ value, onChange, species = 'dog', placeholder = 'Escribir raza...' }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const breedList = species === 'cat' ? CAT_BREEDS : DOG_BREEDS;

  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();
    return breedList.filter(b => b.toLowerCase().includes(q)).slice(0, 8);
  }, [value, breedList]);

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
function ClientsTab({ clients, pets, appointments, session, isAdmin, addClient, updateClient, removeClient, addPet, updatePet, servicePrices, addAppointment, vans, settings, refreshAppointments }) {
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
  const emptyPet = () => ({ id: `temp-${uid()}`, name: '', breed: '', species: 'dog', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', color: '', weight: '', allergies: '', medicalNotes: '', behaviorNotes: '', serviceId: '', serviceName: '', serviceCategory: '', servicePrice: 0, discountPct: 0, finalPrice: 0, addons: [] });

  const [clientForm, setClientForm] = useState(emptyClient);
  const [petForms, setPetForms] = useState([emptyPet()]);
  const [apptForm, setApptForm] = useState({ vanId: vans[0]?.id || '', companyId: 'epw', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '' });

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

    try {
    // 1. Crear cliente
    const clientId = uid();
    const client = { id: clientId, ...clientForm, name: clientForm.name.trim(), active: true };
    const clientOk = await addClient(client);
    if (!clientOk) { alert('❌ Error saving client. Check console.'); setSaving(false); return; }

    // 2. Crear mascotas y cita
    const apptId = uid();
    const apptPets = [];

    for (const pf of petForms) {
      const petId = uid();
      const pet = { id: petId, clientId, client_id: clientId, name: pf.name.trim(), breed: pf.breed, species: pf.species || 'dog', size: pf.size, hairType: pf.hairType, hair_type: pf.hairType, age: pf.age, color: pf.color, weight: pf.weight, allergies: pf.allergies, medicalNotes: pf.medicalNotes, medical_notes: pf.medicalNotes, behaviorNotes: pf.behaviorNotes, behavior_notes: pf.behaviorNotes };
      await addPet(pet);

      // Save ficha de grooming si tiene datos
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

      apptPets.push({ id: uid(), petId, service: pf.serviceName, amount: getPetTotal(pf), tip: 0, cardFee: 0, method: 'Cash', status: 'pending', checkinTime: '', checkoutTime: '', pet: { id: petId, name: pf.name.trim(), breed: pf.breed, size: pf.size } });
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
    } catch(err) {
      console.error('Error creating client:', err);
      alert(`❌ Error: ${err.message}`);
      setSaving(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Base de datos" title="Clients y mascotas"
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
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>Address</label>
                <AddressAutocomplete
                  value={clientForm.address}
                  onChange={details => setClientForm(f => ({...f, address: details.address, zip: details.zip || f.zip, city: details.city || f.city, state: details.state || f.state}))}
                  placeholder="Start typing address..."
                />
                {clientForm.zip && (
                  <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0fdfa', borderRadius: 8, fontSize: 12, color: '#0f766e', fontWeight: 600 }}>
                    📍 {clientForm.city}, {clientForm.state} {clientForm.zip}
                  </div>
                )}
              </div>
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
                  {/* Selector de especie */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={styles.lbl}>Especie</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {SPECIES.map(sp => (
                        <button key={sp.id} type="button" onClick={() => updatePetForm(idx, 'species', sp.id)}
                          style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${pf.species === sp.id ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, background: pf.species === sp.id ? 'var(--color-background-info)' : 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: pf.species === sp.id ? 600 : 400, color: pf.species === sp.id ? 'var(--color-text-info)' : 'var(--color-text-secondary)' }}>
                          {sp.icon} {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label style={styles.lbl}>Nombre *</label><input value={pf.name} onChange={e => updatePetForm(idx, 'name', e.target.value)} style={styles.input} placeholder="Nombre" /></div>
                  <div><label style={styles.lbl}>Raza</label><BreedInput value={pf.breed} onChange={v => updatePetForm(idx, 'breed', v)} species={pf.species || 'dog'} /></div>
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
                  {/* Selector de servicio según especie */}
                  {pf.species === 'dog' ? (
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
                  ) : (
                    <div style={{ marginBottom: 10 }}>
                      <label style={styles.lbl}>Servicio</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                        {(servicePrices || []).filter(p => p.category === (pf.species === 'cat' ? 'Cat' : 'Exotic')).map(p => (
                          <button key={p.id} type="button"
                            onClick={() => {
                              updatePetForm(idx, 'serviceId', p.id);
                              updatePetForm(idx, 'serviceName', p.name);
                              updatePetForm(idx, 'servicePrice', p.price);
                              updatePetForm(idx, 'serviceCategory', p.category);
                              updatePetForm(idx, 'finalPrice', p.price);
                            }}
                            style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${pf.serviceId === p.id ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, background: pf.serviceId === p.id ? 'var(--color-background-info)' : 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: pf.serviceId === p.id ? 600 : 400, color: pf.serviceId === p.id ? 'var(--color-text-info)' : 'var(--color-text-secondary)' }}>
                            {p.name}
                            <span style={{ marginLeft: 8, fontWeight: 700, color: pf.serviceId === p.id ? 'var(--color-text-success)' : 'var(--color-text-secondary)' }}>${p.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Precio calculado */}
                  {pf.servicePrice > 0 ? (
                    <div style={{ padding: '10px 14px', background: 'var(--color-background-success)', borderRadius: 10, border: '0.5px solid var(--color-border-success)', marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--color-text-success)', marginBottom: 4 }}>
                        {pf.serviceName}
                        {pf.species === 'dog' && ` · ${getSizeByWeight(pf.weight)} · ${pf.hairType}`}
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
                  ) : pf.species === 'dog' && pf.serviceCategory && !pf.weight ? (
                    <div style={{ padding: '8px 12px', background: 'var(--color-background-warning)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-warning)' }}>
                      ⚠️ Ingresa el peso para calcular el precio automáticamente
                    </div>
                  ) : pf.species === 'dog' && pf.serviceCategory && pf.weight && !pf.servicePrice ? (
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
                <label style={styles.lbl}>Date *</label>
                <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} style={styles.input} />
              </div>
              {/* Selector de empresa — solo admin/manager */}
              {isAdmin && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.lbl}>Company</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {(settings?.companies || DEFAULT_COMPANIES).map(c => (
                      <button key={c.id} type="button"
                        onClick={() => setApptForm(f => ({ ...f, companyId: c.id, vanId: vans.find(v => v.companyId === c.id)?.id || vans[0]?.id || '' }))}
                        style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `2px solid ${apptForm.companyId === c.id ? '#0f766e' : 'var(--color-border-tertiary)'}`, background: apptForm.companyId === c.id ? '#f0fdfa' : 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: apptForm.companyId === c.id ? 700 : 400, color: apptForm.companyId === c.id ? '#0f766e' : 'var(--color-text-secondary)' }}>
                        {c.logoEmoji} {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={styles.lbl}>Van asignada *</label>
                <select value={apptForm.vanId} onChange={e => setApptForm(f => ({...f, vanId: e.target.value}))} style={styles.input}>
                  {vans.filter(v => !apptForm.companyId || v.companyId === apptForm.companyId || !v.companyId).map(v => {
                    const groomer = (settings?.groomersList || []).find(g => g.vanId === v.id);
                    return <option key={v.id} value={v.id}>{v.name}{groomer ? ` — ${groomer.name}` : ''}</option>;
                  })}
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
            <input value={search} onChange={e => setSearch(e.target.value)} style={styles.input} placeholder="Search cliente..." />
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
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit cliente</h3>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>
                <div style={styles.formGrid}>
                  <div><label style={styles.lbl}>Nombre *</label><input value={editClientForm.name} onChange={e => setEditClientForm(f => ({...f, name: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Teléfono</label><input value={editClientForm.phone} onChange={e => setEditClientForm(f => ({...f, phone: e.target.value}))} style={styles.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={styles.lbl}>Address</label>
                    <AddressAutocomplete
                      value={editClientForm.address}
                      onChange={details => setEditClientForm(f => ({...f, address: details.address, zip: details.zip || f.zip, city: details.city || f.city, state: details.state || f.state}))}
                      placeholder="Start typing address..."
                    />
                    {editClientForm.zip && (
                      <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0fdfa', borderRadius: 8, fontSize: 12, color: '#0f766e', fontWeight: 600 }}>
                        📍 {editClientForm.city}, {editClientForm.state} {editClientForm.zip}
                      </div>
                    )}
                  </div>
                  <div><label style={styles.lbl}>Email</label><input value={editClientForm.email} onChange={e => setEditClientForm(f => ({...f, email: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Notas internas</label><input value={editClientForm.notes} onChange={e => setEditClientForm(f => ({...f, notes: e.target.value}))} style={styles.input} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.btnSecondary}><X size={14} /> Cancelar</button>
                  <button onClick={handleSaveEditClient} style={styles.btnPrimary} disabled={saving}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    {saving ? 'Guardando...' : 'Save cambios'}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Formulario editar mascota */}
            {showEditPet && editingPet && (
              <div style={{ ...styles.card, border: '1px solid var(--color-border-warning)', background: 'var(--color-background-warning)', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit mascota — {editingPet.name}</h3>
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
                    {saving ? 'Guardando...' : 'Save cambios'}
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
                  {isAdmin && <button onClick={() => startEditClient(selectedClient)} style={{ ...styles.btnSecondary, padding: '5px 10px', fontSize: 12 }}><Edit2 size={13} /> Edit</button>}
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
                          {isAdmin && <button onClick={() => startEditPet(p)} style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11 }}><Edit2 size={12} /> Edit</button>}
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
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>✏️ Edit cita</div>
                            <div style={styles.formGrid}>
                              <div>
                                <label style={styles.lbl}>Date</label>
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
                            {/* Edit servicio por mascota */}
                            {a.pets?.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <label style={styles.lbl}>Services y add-ons por mascota</label>
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

                                    {/* Precio manual */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Price</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ color: '#94a3b8' }}>$</span>
                                        <input type="number" step="0.01" defaultValue={ap.amount || 0}
                                          onBlur={async e => {
                                            const newAmount = parseFloat(e.target.value) || 0;
                                            await supabase.from('appointment_pets').update({ amount: newAmount }).eq('id', ap.id);
                                            await refreshAppointments();
                                          }}
                                          style={{ ...styles.input, width: 90, textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#0f766e', padding: '4px 8px' }} />
                                        <button onClick={async () => {
                                          if (!confirm(`Remove ${ap.pet?.name || 'pet'} from this appointment?`)) return;
                                          await supabase.from('appointment_pets').delete().eq('id', ap.id);
                                          await refreshAppointments();
                                        }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Agregar mascota */}
                                <div style={{ marginTop: 10, padding: '10px 12px', background: '#f0fdfa', borderRadius: 8, border: '1px dashed #0f766e' }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0f766e', marginBottom: 8 }}>➕ Add pet to appointment</div>
                                  <select onChange={async e => {
                                    if (!e.target.value) return;
                                    const petId = e.target.value;
                                    const pet = pets.find(p => p.id === petId || p.id === parseInt(petId));
                                    await supabase.from('appointment_pets').insert({
                                      id: uid(), appointment_id: a.id,
                                      pet_id: petId, service: '', amount: 0,
                                    });
                                    await refreshAppointments();
                                    e.target.value = '';
                                  }} style={{ ...styles.input, fontSize: 12 }}>
                                    <option value="">— Select pet to add —</option>
                                    {(pets || []).filter(p => {
                                      const clientId = a.clientId || a.client_id;
                                      return (p.client_id == clientId || p.clientId == clientId) &&
                                        !(a.pets || []).find(ap => ap.petId === p.id || ap.pet_id === p.id);
                                    }).map(p => (
                                      <option key={p.id} value={p.id}>{p.name} — {p.breed || ''}</option>
                                    ))}
                                  </select>
                                </div>
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
                                Save cambios
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
                                <Edit2 size={12} /> Edit
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

// ===== DASHBOARD TAB =====
function DashboardTab({ vans, services, expenses, settings, appointments, groomers, companies, companyExpenses }) {
  const [section, setSection] = useState('overview');
  const [period, setPeriod] = useState('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');

  const now = new Date();
  const todayStr = todayISO();

  const getRange = () => {
    if (period === 'custom' && customStart && customEnd) {
      return { start: customStart, end: customEnd, label: `${customStart} → ${customEnd}` };
    }
    if (period === 'week') {
      const { start, end } = getWeekRange(todayStr);
      return { start, end, label: 'Esta semana' };
    }
    if (period === 'month') {
      const start = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
      return { start, end: todayStr, label: 'Este mes' };
    }
    return { start: `${now.getFullYear()}-01-01`, end: todayStr, label: `${now.getFullYear()}` };
  };

  const getPriorRange = () => {
    const { start, end } = getRange();
    const diffDays = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
    const priorEnd = new Date(new Date(start) - 86400000);
    const priorStart = new Date(priorEnd - (diffDays - 1) * 86400000);
    const toISO = d => { const tz = d.getTimezoneOffset() * 60000; return new Date(d - tz).toISOString().slice(0,10); };
    return { start: toISO(priorStart), end: toISO(priorEnd) };
  };

  const { start, end, label } = getRange();
  const prior = getPriorRange();

  const filterData = (list, dateField = 'date') => {
    let r = list.filter(i => inRange(i[dateField], start, end));
    if (selectedCompany !== 'all') {
      r = r.filter(i => {
        const van = vans.find(v => v.id === (i.vanId || i.van_id));
        return van?.companyId === selectedCompany;
      });
    }
    return r;
  };

  const filteredServices = useMemo(() => filterData(services), [services, start, end, selectedCompany, vans]);
  const filteredExpenses = useMemo(() => filterData(expenses), [expenses, start, end, selectedCompany, vans]);
  const filteredAppts = useMemo(() => filterData(appointments), [appointments, start, end, selectedCompany, vans]);
  const priorServices = useMemo(() => {
    let r = services.filter(i => inRange(i.date, prior.start, prior.end));
    if (selectedCompany !== 'all') r = r.filter(i => vans.find(v => v.id === i.vanId)?.companyId === selectedCompany);
    return r;
  }, [services, prior.start, prior.end, selectedCompany, vans]);

  // KPIs
  const totalRevenue = filteredServices.reduce((s, i) => s + i.amount, 0);
  const totalTips = filteredServices.reduce((s, i) => s + (i.tip || 0), 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalCardFees = filteredServices.reduce((s, i) => s + (i.cardFee || 0), 0);
  const totalGasFees = filteredServices.length * (settings?.gasFee || 7);
  const netRevenue = totalRevenue - totalExpenses;
  const completedAppts = filteredAppts.filter(a => a.status === 'completed').length;
  const cancelledAppts = filteredAppts.filter(a => a.status === 'cancelled').length;
  const totalAppts = filteredAppts.length;
  const totalPets = filteredAppts.reduce((s, a) => s + (a.pets?.length || 0), 0);
  const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;
  const priorRevenue = priorServices.reduce((s, i) => s + i.amount, 0);
  const revenueGrowth = priorRevenue > 0 ? ((totalRevenue - priorRevenue) / priorRevenue * 100).toFixed(1) : null;

  // Por empresa
  const epwRevenue = filteredServices.filter(s => vans.find(v => v.id === s.vanId)?.companyId === 'epw').reduce((s,i) => s + i.amount, 0);
  const atwRevenue = filteredServices.filter(s => vans.find(v => v.id === s.vanId)?.companyId === 'atw').reduce((s,i) => s + i.amount, 0);

  // Por método de pago
  const byMethod = PAYMENT_METHODS.reduce((acc, m) => {
    acc[m] = filteredServices.filter(s => s.method === m).reduce((s,i) => s + i.amount, 0);
    return acc;
  }, {});

  // Por groomer
  const groomerStats = useMemo(() => groomers.filter(g => g.active !== false).map(g => {
    const gAppts = filteredAppts.filter(a => a.groomerId === g.id);
    const gRevenue = gAppts.filter(a => a.status === 'completed').reduce((s, a) => s + (a.pets?.reduce((ps, ap) => ps + (ap.amount || 0), 0) || 0), 0);
    const commission = gRevenue * (g.commissionPct || 45) / 100;
    const van = vans.find(v => v.id === g.vanId);
    const company = DEFAULT_COMPANIES.find(c => c.id === van?.companyId);
    return { ...g, appts: gAppts.length, completed: gAppts.filter(a => a.status === 'completed').length, revenue: gRevenue, commission, van, company };
  }).sort((a, b) => b.revenue - a.revenue), [groomers, filteredAppts, vans]);

  // Expenses por van y categoría
  const expensesByVan = useMemo(() => vans.map(v => {
    const vanExp = filteredExpenses.filter(e => e.vanId === v.id);
    const byCategory = {};
    vanExp.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    return { van: v, total: vanExp.reduce((s,e) => s + e.amount, 0), byCategory };
  }).filter(v => v.total > 0), [filteredExpenses, vans]);

  // Días de la semana
  const byDay = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((day, i) => ({
    day, count: filteredAppts.filter(a => ((new Date(a.date + 'T12:00:00').getDay() + 6) % 7) === i).length
  }));
  const maxDay = Math.max(...byDay.map(d => d.count), 1);

  // Clients nuevos vs recurrentes
  const uniqueClients = [...new Set(filteredAppts.map(a => a.clientId).filter(Boolean))];
  const allPrevAppts = appointments.filter(a => a.date < start);
  const prevClientIds = new Set(allPrevAppts.map(a => a.clientId).filter(Boolean));
  const newClients = uniqueClients.filter(id => !prevClientIds.has(id)).length;
  const returningClients = uniqueClients.length - newClients;

  // Services más populares
  const serviceCount = {};
  filteredAppts.forEach(a => (a.pets || []).forEach(ap => {
    const base = (ap.service || '').split(' + ')[0];
    if (base) serviceCount[base] = (serviceCount[base] || 0) + 1;
  }));
  const topServices = Object.entries(serviceCount).sort((a,b) => b[1]-a[1]).slice(0, 5);

  const pct = (val, total) => total > 0 ? Math.round(val/total*100) : 0;

  const Bar = ({ value, max, color = '#0f766e', height = 8 }) => (
    <div style={{ height, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${max > 0 ? (value/max)*100 : 0}%`, background: color, borderRadius: 999, transition: 'width 0.5s' }} />
    </div>
  );

  const KPI = ({ label, value, sub, color = '#0f766e', growth }) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 18px', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{sub}</div>}
      {growth !== null && growth !== undefined && (
        <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: parseFloat(growth) >= 0 ? '#0f766e' : '#dc2626' }}>
          {parseFloat(growth) >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs período anterior
        </div>
      )}
    </div>
  );

  const SECTIONS = ['overview','sales','clients','staff','operations','comparison','pl'];
  const SECTION_LABELS = { overview:'📌 Overview', sales:'💰 Sales', clients:'👥 Clients & Pets', staff:'✂️ Staff', operations:'⚙️ Operations', comparison:'📈 vs Prior Period', pl:'📊 P&L' };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Analytics" title="Dashboard" />

      {/* Controles */}
      <div style={{ ...styles.card, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Período */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={styles.lbl}>Período</label>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, gap: 2 }}>
              {[['week','Week'],['month','Month'],['year','Year'],['custom','Custom']].map(([val, lbl]) => (
                <button key={val} onClick={() => setPeriod(val)}
                  style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: period === val ? 600 : 400, background: period === val ? '#fff' : 'transparent', color: period === val ? '#0f766e' : '#64748b' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Dates custom */}
          {period === 'custom' && (
            <>
              <div>
                <label style={styles.lbl}>Desde</label>
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ ...styles.input, width: 160 }} />
              </div>
              <div>
                <label style={styles.lbl}>Hasta</label>
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ ...styles.input, width: 160 }} />
              </div>
            </>
          )}

          {/* Company */}
          <div>
            <label style={styles.lbl}>Company</label>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, gap: 2 }}>
              {[['all','🏢 Todas'], ['epw','🐾 EPW'], ['atw','🐕 ATW']].map(([val, lbl]) => (
                <button key={val} onClick={() => setSelectedCompany(val)}
                  style={{ padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: selectedCompany === val ? 600 : 400, background: selectedCompany === val ? '#fff' : 'transparent', color: selectedCompany === val ? '#0f766e' : '#64748b' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 12, color: '#94a3b8', alignSelf: 'flex-end', paddingBottom: 2 }}>{label}</div>
        </div>
      </div>

      {/* Secciones nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)}
            style={{ padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${section === s ? '#0f766e' : '#e2e8f0'}`, background: section === s ? '#0f766e' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: section === s ? 700 : 400, color: section === s ? '#fff' : '#64748b', whiteSpace: 'nowrap' }}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {section === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            <KPI label="Ingresos brutos" value={fmt(totalRevenue)} sub={`+${fmt(totalTips)} propinas`} color="#0f766e" growth={revenueGrowth} />
            <KPI label="Neto" value={fmt(netRevenue)} sub={`-${fmt(totalExpenses)} gastos`} color="#7c3aed" />
            <KPI label="Citas" value={totalAppts} sub={`${completedAppts} completadas (${completionRate}%)`} color="#3b82f6" />
            <KPI label="Mascotas" value={totalPets} color="#f59e0b" />
            <KPI label="Fee tarjeta" value={fmt(totalCardFees)} color="#ec4899" />
            <KPI label="Fee gasolina" value={fmt(totalGasFees)} sub="Company Income" color="#0284c7" />
          </div>

          {/* EPW vs ATW */}
          {selectedCompany === 'all' && (
            <div style={{ ...styles.card, marginBottom: 16 }}>
              <h3 style={styles.cardH3}>🏢 Por empresa</h3>
              {DEFAULT_COMPANIES.map(c => {
                const rev = c.id === 'epw' ? epwRevenue : atwRevenue;
                const p = pct(rev, totalRevenue);
                return (
                  <div key={c.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{c.logoEmoji} {c.name}</span>
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#0f766e' }}>{fmt(rev)} <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Manrope' }}>({p}%)</span></span>
                    </div>
                    <Bar value={rev} max={totalRevenue} color={c.id === 'epw' ? '#0f766e' : '#7c3aed'} height={10} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Días de la semana */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>📅 Citas por día</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 90 }}>
              {byDay.map(({ day, count }) => (
                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: count > 0 ? '#0f766e' : 'transparent' }}>{count}</div>
                  <div style={{ width: '100%', background: count > 0 ? '#0f766e' : '#f1f5f9', borderRadius: '4px 4px 0 0', height: `${Math.max((count/maxDay)*65, 4)}px`, transition: 'height 0.4s' }} />
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SALES ===== */}
      {section === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <KPI label="Sales brutas" value={fmt(totalRevenue)} color="#0f766e" />
            <KPI label="Tips" value={fmt(totalTips)} color="#f59e0b" />
            <KPI label="Fee tarjeta" value={fmt(totalCardFees)} sub="Company Income" color="#ec4899" />
            <KPI label="Fee gasolina" value={fmt(totalGasFees)} sub={`${filteredServices.length} servicios × $${settings?.gasFee || 7}`} color="#0284c7" />
            <KPI label="Total ingresos empresa" value={fmt(totalRevenue + totalCardFees + totalGasFees)} color="#0f172a" />
          </div>

          {/* Métodos de pago */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>💳 Por método de pago</h3>
            {PAYMENT_METHODS.map(m => {
              const amt = byMethod[m] || 0;
              const ms = METHOD_STYLES[m];
              return (
                <div key={m} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: ms.dot, display: 'inline-block' }} />{m}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{fmt(amt)} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct(amt, totalRevenue)}%)</span></span>
                  </div>
                  <Bar value={amt} max={totalRevenue} color={ms.dot} height={6} />
                </div>
              );
            })}
          </div>

          {/* EPW vs ATW desglose */}
          {selectedCompany === 'all' && (
            <div style={styles.card}>
              <h3 style={styles.cardH3}>🏢 Por empresa</h3>
              {DEFAULT_COMPANIES.map(c => {
                const rev = c.id === 'epw' ? epwRevenue : atwRevenue;
                const svcCount = filteredServices.filter(s => vans.find(v => v.id === s.vanId)?.companyId === c.id).length;
                const tips = filteredServices.filter(s => vans.find(v => v.id === s.vanId)?.companyId === c.id).reduce((s,i) => s + (i.tip||0), 0);
                return (
                  <div key={c.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{c.logoEmoji} {c.name}</span>
                      <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#0f766e' }}>{fmt(rev)}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, color: '#64748b' }}>
                      <div><div style={{ fontWeight: 600, color: '#0f172a' }}>{svcCount}</div>Services</div>
                      <div><div style={{ fontWeight: 600, color: '#0f172a' }}>{fmt(tips)}</div>Tips</div>
                      <div><div style={{ fontWeight: 600, color: '#0f172a' }}>{pct(rev, totalRevenue)}%</div>Del total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== CLIENTS & PETS ===== */}
      {section === 'clients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <KPI label="Clients únicos" value={uniqueClients.length} color="#0f766e" />
            <KPI label="Clients nuevos" value={newClients} sub="Primera visita" color="#3b82f6" />
            <KPI label="Clients recurrentes" value={returningClients} sub="Ya han venido" color="#f59e0b" />
            <KPI label="Mascotas atendidas" value={totalPets} color="#ec4899" />
          </div>

          {/* Services más populares */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>🌟 Services más populares</h3>
            {topServices.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>Sin datos para este período</div>
            ) : topServices.map(([name, count], i) => (
              <div key={name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 400 }}>{i === 0 ? '⭐ ' : ''}{name}</span>
                  <span style={{ fontWeight: 600, color: '#0f766e' }}>{count !== 1 ? count + ' veces' : '1 vez'}</span>
                </div>
                <Bar value={count} max={topServices[0]?.[1] || 1} color={i === 0 ? '#0f766e' : '#94a3b8'} height={6} />
              </div>
            ))}
          </div>

          {/* Ticket promedio */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>💰 Ticket promedio</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: '14px', background: '#f0fdfa', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Por cita</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#0f766e' }}>
                  {fmt(totalAppts > 0 ? totalRevenue / totalAppts : 0)}
                </div>
              </div>
              <div style={{ padding: '14px', background: '#f0fdfa', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Por mascota</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#0f766e' }}>
                  {fmt(totalPets > 0 ? totalRevenue / totalPets : 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STAFF ===== */}
      {section === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <KPI label="Groomers activos" value={groomerStats.filter(g => g.appts > 0).length} color="#0f766e" />
            <KPI label="Total comisiones" value={fmt(groomerStats.reduce((s,g) => s + g.commission, 0))} color="#7c3aed" />
            <KPI label="Citas completadas" value={completedAppts} sub={`${completionRate}% tasa de completación`} color="#3b82f6" />
          </div>

          {groomerStats.filter(g => g.appts > 0).length === 0 ? (
            <div style={styles.empty}><p style={{ margin: 0, color: '#64748b' }}>Sin datos de groomers para este período</p></div>
          ) : groomerStats.filter(g => g.appts > 0).map(g => {
            const maxRev = Math.max(...groomerStats.map(gs => gs.revenue), 1);
            return (
              <div key={g.id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>✂️ {g.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {g.company?.logoEmoji} {g.company?.name || ''} · {g.van?.name || ''} · {g.commissionPct}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#0f766e' }}>{fmt(g.commission)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>a pagar</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, marginBottom: 8 }}>
                  <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{g.appts}</div>
                    <div style={{ color: '#94a3b8' }}>Citas</div>
                  </div>
                  <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0f766e' }}>{g.completed}</div>
                    <div style={{ color: '#94a3b8' }}>Completeds</div>
                  </div>
                  <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{fmt(g.revenue)}</div>
                    <div style={{ color: '#94a3b8' }}>Sales</div>
                  </div>
                </div>
                <Bar value={g.revenue} max={maxRev} color='#0f766e' height={6} />
              </div>
            );
          })}
        </div>
      )}

      {/* ===== OPERATIONS ===== */}
      {section === 'operations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <KPI label="Total citas" value={totalAppts} color="#3b82f6" />
            <KPI label="Completeds" value={completedAppts} sub={`${completionRate}%`} color="#0f766e" />
            <KPI label="Cancelleds" value={cancelledAppts} sub={`${pct(cancelledAppts, totalAppts)}%`} color="#dc2626" />
            <KPI label="Total gastos" value={fmt(totalExpenses)} color="#f59e0b" />
          </div>

          {/* Expenses por van y categoría */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>⛽ Expenses por van</h3>
            {expensesByVan.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>No expenses para este período</div>
            ) : expensesByVan.map(({ van, total, byCategory }) => (
              <div key={van.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>🚐 {van.name}</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{fmt(total)}</span>
                </div>
                {Object.entries(byCategory).sort((a,b) => b[1]-a[1]).map(([cat, amt]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                    <span>• {cat}</span>
                    <span style={{ fontWeight: 500 }}>{fmt(amt)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Citas por van */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>🚐 Citas por van</h3>
            {vans.map(v => {
              const count = filteredAppts.filter(a => a.vanId === v.id).length;
              const completed = filteredAppts.filter(a => a.vanId === v.id && a.status === 'completed').length;
              if (count === 0) return null;
              return (
                <div key={v.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{v.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{completed}/{count} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct(completed, count)}%)</span></span>
                  </div>
                  <Bar value={completed} max={count} color='#0f766e' height={6} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== VS PRIOR PERIOD ===== */}
      {section === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '10px 14px', background: '#f0fdfa', borderRadius: 10, fontSize: 13, color: '#0f766e', border: '1px solid #ccfbf1' }}>
            📊 Comparando <strong>{label}</strong> vs período anterior ({prior.start} → {prior.end})
          </div>

          {[
            { label: 'Ingresos', current: totalRevenue, prior: priorRevenue, fmt: true },
            { label: 'Services', current: filteredServices.length, prior: priorServices.length, fmt: false },
            { label: 'Citas', current: totalAppts, prior: appointments.filter(a => inRange(a.date, prior.start, prior.end)).length, fmt: false },
          ].map(item => {
            const diff = item.current - item.prior;
            const diffPct = item.prior > 0 ? ((diff / item.prior) * 100).toFixed(1) : null;
            const isUp = diff >= 0;
            return (
              <div key={item.label} style={styles.card}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>{item.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#f0fdfa', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Período actual</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#0f766e' }}>
                      {item.fmt ? fmt(item.current) : item.current}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: '#f8fafc', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Período anterior</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#94a3b8' }}>
                      {item.fmt ? fmt(item.prior) : item.prior}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: isUp ? '#f0fdfa' : '#fef2f2', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Diferencia</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: isUp ? '#0f766e' : '#dc2626' }}>
                      {isUp ? '▲' : '▼'} {diffPct ? `${Math.abs(diffPct)}%` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: isUp ? '#0f766e' : '#dc2626' }}>
                      {item.fmt ? fmt(Math.abs(diff)) : Math.abs(diff)} {isUp ? 'más' : 'menos'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== P&L ===== */}
      {section === 'pl' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => exportPLPDF(filteredServices, filteredExpenses, vans, settings, startDate, endDate)} style={{ ...styles.btnSecondary, fontSize: 12 }}>
              <FileText size={14} /> Export P&L PDF
            </button>
          </div>
          {DEFAULT_COMPANIES.map(company => {
            const compSvcs = filteredServices.filter(s => vans.find(v => v.id === s.vanId)?.companyId === company.id);
            const compExp = filteredExpenses.filter(e => vans.find(v => v.id === e.vanId)?.companyId === company.id);
            const revenue = compSvcs.reduce((s, i) => s + i.amount, 0);
            const tips = compSvcs.reduce((s, i) => s + (i.tip || 0), 0);
            const cardFees = compSvcs.reduce((s, i) => s + (i.cardFee || 0), 0);
            const gasFees = compSvcs.length * (settings?.gasFee || 7);
            const expenses = compExp.reduce((s, e) => s + e.amount, 0);
            const commissions = revenue * 0.45; // promedio 45%
            const companyIncome = revenue * 0.55 + gasFees + cardFees;
            const netProfit = companyIncome - expenses;
            const margin = companyIncome > 0 ? ((netProfit / companyIncome) * 100).toFixed(1) : 0;

            return (
              <div key={company.id} style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{company.logoEmoji}</span>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700 }}>{company.name}</div>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: netProfit >= 0 ? '#f0fdfa' : '#fef2f2', color: netProfit >= 0 ? '#0f766e' : '#dc2626', fontWeight: 700 }}>
                    {netProfit >= 0 ? '▲' : '▼'} {margin}% margin
                  </span>
                </div>

                {/* Ingresos */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>📈 Revenue</div>
                  {[
                    { label: 'Grooming sales', value: revenue, color: '#0f766e' },
                    { label: 'Gas fee income', value: gasFees, color: '#0284c7' },
                    { label: 'Card fee income', value: cardFees, color: '#ec4899' },
                    { label: 'Tips', value: tips, color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: item.color }}>{fmt(item.value)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700 }}>
                    <span style={{ fontSize: 14 }}>Total Revenue</span>
                    <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: '#0f766e' }}>{fmt(companyIncome)}</span>
                  </div>
                </div>

                {/* Gastos */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>📉 Expenses</div>
                  {[
                    { label: 'Groomer commissions (≈45%)', value: commissions, color: '#dc2626' },
                    { label: 'Operating expenses', value: expenses, color: '#dc2626' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: item.color }}>-{fmt(item.value)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700 }}>
                    <span style={{ fontSize: 14 }}>Total Expenses</span>
                    <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: '#dc2626' }}>-{fmt(commissions + expenses)}</span>
                  </div>
                </div>

                {/* Net Profit */}
                <div style={{ padding: '14px', background: netProfit >= 0 ? '#f0fdfa' : '#fef2f2', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Net Profit</span>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 800, color: netProfit >= 0 ? '#0f766e' : '#dc2626' }}>{fmt(netProfit)}</span>
                </div>
              </div>
            );
          })}

          {/* Total consolidado */}
          <div style={{ ...styles.card, borderTop: '3px solid #0f172a' }}>
            <h3 style={styles.cardH3}>🏢 Group Guerrero Orejarena — Consolidated</h3>
            {(() => {
              const totalRev = filteredServices.reduce((s, i) => s + i.amount, 0);
              const totalGas = filteredServices.length * (settings?.gasFee || 7);
              const totalCard = filteredServices.reduce((s, i) => s + (i.cardFee || 0), 0);
              const totalExp = filteredExpenses.reduce((s, e) => s + e.amount, 0);
              const totalComm = totalRev * 0.45;
              const totalIncome = totalRev * 0.55 + totalGas + totalCard;
              const totalNet = totalIncome - totalExp;
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Total Revenue', value: totalIncome, color: '#0f766e' },
                    { label: 'Commissions', value: totalComm, color: '#dc2626' },
                    { label: 'Expenses', value: totalExp, color: '#dc2626' },
                    { label: 'NET PROFIT', value: totalNet, color: totalNet >= 0 ? '#0f766e' : '#dc2626', big: true },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '12px', background: '#f8fafc', borderRadius: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: item.big ? 24 : 18, fontWeight: 800, color: item.color }}>{fmt(Math.abs(item.value))}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
// ===== PAYROLL TAB =====
function PayrollTab({ groomers, vans, services, appointments, settings, groomerPayments, setGroomerPayments, session }) {
  
  // Calcular semana actual (Lun-Dom)
  const getCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0=Dom, 1=Lun...
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const toISO = d => { const tz = d.getTimezoneOffset() * 60000; return new Date(d - tz).toISOString().slice(0,10); };
    return { start: toISO(monday), end: toISO(sunday) };
  };

  const getPrevWeek = (start) => {
    const d = new Date(start + 'T12:00:00');
    d.setDate(d.getDate() - 7);
    const tz = d.getTimezoneOffset() * 60000;
    const newStart = new Date(d - tz).toISOString().slice(0,10);
    const endD = new Date(d);
    endD.setDate(d.getDate() + 6);
    const newEnd = new Date(endD - tz).toISOString().slice(0,10);
    return { start: newStart, end: newEnd };
  };

  const getNextWeek = (start) => {
    const d = new Date(start + 'T12:00:00');
    d.setDate(d.getDate() + 7);
    const tz = d.getTimezoneOffset() * 60000;
    const newStart = new Date(d - tz).toISOString().slice(0,10);
    const endD = new Date(d);
    endD.setDate(d.getDate() + 6);
    const newEnd = new Date(endD - tz).toISOString().slice(0,10);
    return { start: newStart, end: newEnd };
  };

  const week = getCurrentWeek();
  const [weekStart, setWeekStart] = useState(week.start);
  const [weekEnd, setWeekEnd] = useState(week.end);
  const [payingGroomer, setPayingGroomer] = useState(null);
  const [payForm, setPayForm] = useState({ method: 'cash', notes: '', date: todayISO() });
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(null);

  const navigateWeek = (direction) => {
    const newWeek = direction === 'prev' ? getPrevWeek(weekStart) : getNextWeek(weekStart);
    setWeekStart(newWeek.start);
    setWeekEnd(newWeek.end);
    setPayingGroomer(null);
  };

  // Verificar citas sin cerrar en la semana
  const openAppts = useMemo(() => {
    return appointments.filter(a =>
      inRange(a.date, weekStart, weekEnd) &&
      a.status !== 'completed' &&
      a.status !== 'cancelled'
    );
  }, [appointments, weekStart, weekEnd]);

  const hasOpenAppts = openAppts.length > 0;

  // Verificar si la semana ya fue pagada
  const weekAlreadyPaid = (groomerId) => {
    return groomerPayments.some(p =>
      p.groomer_id === groomerId &&
      p.period_start === weekStart &&
      p.period_end === weekEnd
    );
  };

  // Calcular comisiones por groomer
  const groomerStats = useMemo(() => {
    return groomers.filter(g => g.active !== false).map(g => {
      const van = vans.find(v => v.id === g.vanId);
      const company = DEFAULT_COMPANIES.find(c => c.id === van?.companyId);

      const groomerServices = services.filter(s => {
        if (!inRange(s.date, weekStart, weekEnd)) return false;
        const sVan = vans.find(v => v.id === s.vanId);
        return sVan?.id === g.vanId || s.groomerId === g.id;
      });

      const totalSales = groomerServices.reduce((sum, s) => sum + s.amount, 0);
      const totalTips = groomerServices.reduce((sum, s) => sum + (s.tip || 0), 0);
      const commissionPct = g.commissionPct || 45;
      const commission = totalSales * commissionPct / 100;
      const tipsShare = totalTips * (settings?.tipsToGroomer || 100) / 100;
      const totalEarned = commission + tipsShare;

      const paidInPeriod = groomerPayments
        .filter(p => p.groomer_id === g.id && p.period_start === weekStart && p.period_end === weekEnd)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const balance = totalEarned - paidInPeriod;
      const alreadyPaid = weekAlreadyPaid(g.id);

      // Citas abiertas de este groomer en la semana
      const groomerOpenAppts = openAppts.filter(a => {
        const apptVan = vans.find(v => v.id === a.vanId);
        return apptVan?.id === g.vanId || a.groomerId === g.id;
      });

      return { ...g, van, company, totalSales, totalTips, commission, tipsShare, totalEarned, paidInPeriod, balance, commissionPct, serviceCount: groomerServices.length, alreadyPaid, groomerOpenAppts };
    }).sort((a, b) => b.balance - a.balance);
  }, [groomers, vans, services, groomerPayments, weekStart, weekEnd, openAppts, settings]);

  const totalPending = groomerStats.reduce((sum, g) => sum + Math.max(g.balance, 0), 0);
  const totalPaid = groomerStats.reduce((sum, g) => sum + g.paidInPeriod, 0);

  const handlePay = async (groomer) => {
    if (groomer.groomerOpenAppts.length > 0) {
      alert(`⚠️ ${groomer.name} has ${groomer.groomerOpenAppts.length} open appointment(s) this week. Please close them before paying.`);
      return;
    }
    if (!payForm.date) { alert('Enter payment date'); return; }
    setSaving(true);
    const payment = {
      id: uid(), groomerId: groomer.id, groomerName: groomer.name,
      amount: groomer.balance, method: payForm.method,
      date: payForm.date, notes: payForm.notes || `Week ${weekStart} to ${weekEnd}`,
      periodStart: weekStart, periodEnd: weekEnd,
      createdBy: session?.userName || '',
    };
    const ok = await saveGroomerPayment(payment);
    if (ok) {
      setGroomerPayments(prev => [payment, ...prev]);
      setPayingGroomer(null);
      setPayForm({ method: 'cash', notes: '', date: todayISO() });
      alert(`✅ Payment of ${fmt(groomer.balance)} to ${groomer.name} recorded!`);
    }
    setSaving(false);
  };

  const weekLabel = `${formatDateNice(weekStart)} — ${formatDateNice(weekEnd)}`;
  const isCurrentWeek = weekStart === week.start;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Finance" title="💸 Payroll" />

      {/* Selector de semana */}
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button onClick={() => navigateWeek('prev')} style={{ ...styles.iconBtn, fontSize: 20, padding: '8px 12px' }}>‹</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {isCurrentWeek ? '📅 Current Week' : '📅 Week'}
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{weekLabel}</div>
          </div>
          <button onClick={() => navigateWeek('next')} style={{ ...styles.iconBtn, fontSize: 20, padding: '8px 12px' }} disabled={isCurrentWeek}>›</button>
        </div>

        {/* Alerta citas abiertas */}
        {hasOpenAppts && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef3c7', borderRadius: 10, border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#92400e' }}>
                {openAppts.length} open appointment{openAppts.length !== 1 ? 's' : ''} this week
              </div>
              <div style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>
                Close all appointments before paying groomers
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        <div style={{ ...styles.kpiCard, borderTop: '3px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Pending</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#f59e0b', marginTop: 6 }}>{fmt(totalPending)}</div>
        </div>
        <div style={{ ...styles.kpiCard, borderTop: '3px solid #0f766e' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Paid</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#0f766e', marginTop: 6 }}>{fmt(totalPaid)}</div>
        </div>
        <div style={{ ...styles.kpiCard, borderTop: '3px solid #7c3aed' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Total</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#7c3aed', marginTop: 6 }}>{fmt(totalPending + totalPaid)}</div>
        </div>
      </div>

      {/* Lista de groomers */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groomerStats.map(g => (
          <div key={g.id} style={{ ...styles.card, borderLeft: `4px solid ${g.alreadyPaid ? '#0f766e' : g.balance > 0 ? '#f59e0b' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700 }}>✂️ {g.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {g.company?.logoEmoji} {g.company?.name} · {g.van?.name} · {g.commissionPct}%
                </div>
                {g.groomerOpenAppts.length > 0 && (
                  <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                    ⚠️ {g.groomerOpenAppts.length} open appointment{g.groomerOpenAppts.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {g.alreadyPaid ? (
                  <div style={{ padding: '6px 12px', background: '#f0fdfa', borderRadius: 999, fontSize: 13, fontWeight: 700, color: '#0f766e' }}>
                    ✅ Paid
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Balance</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 800, color: g.balance > 0 ? '#f59e0b' : '#64748b' }}>
                      {fmt(g.balance)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Desglose */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Services', value: g.serviceCount },
                { label: 'Sales', value: fmt(g.totalSales) },
                { label: `Commission`, value: fmt(g.commission) },
                { label: 'Tips', value: fmt(g.tipsShare) },
              ].map(item => (
                <div key={item.label} style={{ padding: '8px', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Botones */}
            {!g.alreadyPaid && (
              <div style={{ display: 'flex', gap: 8 }}>
                {g.balance > 0 && payingGroomer !== g.id && (
                  <button onClick={() => {
                    if (g.groomerOpenAppts.length > 0) {
                      alert(`⚠️ ${g.name} has ${g.groomerOpenAppts.length} open appointment(s). Close them first.`);
                      return;
                    }
                    setPayingGroomer(g.id);
                    setPayForm({ method: 'cash', notes: `Week ${weekStart}`, date: todayISO() });
                  }}
                    style={{ ...styles.btnPrimary, background: g.groomerOpenAppts.length > 0 ? '#94a3b8' : '#f59e0b', borderColor: g.groomerOpenAppts.length > 0 ? '#94a3b8' : '#f59e0b' }}>
                    💸 Pay {fmt(g.balance)}
                  </button>
                )}
                <button onClick={() => setShowHistory(showHistory === g.id ? null : g.id)}
                  style={{ ...styles.btnSecondary, fontSize: 13 }}>
                  📋 {showHistory === g.id ? 'Hide' : 'History'}
                </button>
              </div>
            )}

            {/* Formulario de pago */}
            {payingGroomer === g.id && (
              <div style={{ marginTop: 12, padding: '14px', background: '#fffbeb', borderRadius: 10, border: '1.5px solid #f59e0b' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>
                  💸 Pay {g.name} — {fmt(g.balance)}
                  <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>Week: {weekLabel}</div>
                </div>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.lbl}>Date</label>
                    <input type="date" value={payForm.date} onChange={e => setPayForm(f => ({...f, date: e.target.value}))} style={styles.input} />
                  </div>
                  <div>
                    <label style={styles.lbl}>Method</label>
                    <select value={payForm.method} onChange={e => setPayForm(f => ({...f, method: e.target.value}))} style={styles.input}>
                      <option value="cash">💵 Cash</option>
                      <option value="zelle">📱 Zelle</option>
                      <option value="check">📄 Check</option>
                      <option value="transfer">🏦 Transfer</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={styles.lbl}>Notes (optional)</label>
                    <input value={payForm.notes} onChange={e => setPayForm(f => ({...f, notes: e.target.value}))} style={styles.input} placeholder={`Week of ${weekStart}`} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => handlePay(g)} style={{ ...styles.btnPrimary, background: '#f59e0b', borderColor: '#f59e0b' }} disabled={saving}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '✅'}
                    {saving ? 'Saving...' : `Confirm ${fmt(g.balance)}`}
                  </button>
                  <button onClick={() => setPayingGroomer(null)} style={styles.btnSecondary}>Cancel</button>
                </div>
              </div>
            )}

            {/* Historial */}
            {showHistory === g.id && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Payment History</div>
                {groomerPayments.filter(p => p.groomer_id === g.id).length === 0 ? (
                  <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 12 }}>No payments yet</div>
                ) : groomerPayments.filter(p => p.groomer_id === g.id).slice(0, 10).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0fdfa', borderRadius: 8, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f766e' }}>{fmt(parseFloat(p.amount))}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {formatDateNice(p.date)} · {p.method}
                        {p.period_start && ` · ${p.period_start} → ${p.period_end}`}
                        {p.notes ? ` · ${p.notes}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#0f766e', fontWeight: 600 }}>✅ Paid</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== GASTOS EMPRESA TAB =====
const COMPANY_EXPENSE_CATEGORIES = [
  { id: 'Mantenimiento', icon: '🔧' },
  { id: 'Repuestos',     icon: '⚙️' },
  { id: 'Insumos',       icon: '🧴' },
  { id: 'Seguros',       icon: '🛡️' },
  { id: 'Marketing',     icon: '📱' },
  { id: 'Equipos',       icon: '✂️' },
  { id: 'Administrativo',icon: '📋' },
  { id: 'Otros',         icon: '💼' },
];

function ExpensesCompanyTab({ vans, session, companies, companyExpenses, setCompanyExpenses, taxRate }) {
  const [form, setForm] = useState({
    companyId: 'epw', category: 'Mantenimiento', description: '',
    amount: '', tax: '', method: 'cash', vanId: '', date: todayISO(),
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [dateStart, setDateStart] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
  });
  const [dateEnd, setDateEnd] = useState(todayISO());

  const filtered = useMemo(() => companyExpenses.filter(e =>
    inRange(e.date, dateStart, dateEnd) &&
    (filterCompany === 'all' || e.companyId === filterCompany) &&
    (filterCategory === 'all' || e.category === filterCategory)
  ).sort((a,b) => b.date.localeCompare(a.date)), [companyExpenses, dateStart, dateEnd, filterCompany, filterCategory]);

  const totalFiltered = filtered.reduce((s,e) => s + e.amount, 0);
  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]);
  }, [filtered]);

  const handleSubmit = async () => {
    if (!form.amount || !form.category) { alert('Ingresa categoría y monto'); return; }
    setSaving(true);
    const baseAmount = parseFloat(form.amount) || 0;
    const taxAmount = parseFloat(form.tax) || 0;
    const totalAmount = baseAmount + taxAmount;
    const taxDesc = taxAmount > 0 ? ` (base $${baseAmount.toFixed(2)} + tax $${taxAmount.toFixed(2)})` : '';
    const expense = {
      id: uid(), companyId: form.companyId, category: form.category,
      description: (form.description.trim() || '') + taxDesc,
      amount: totalAmount,
      method: form.method, vanId: form.vanId || null,
      date: form.date, createdBy: session?.userName || '',
    };
    if (receiptFile) {
      const ext = receiptFile.name.split('.').pop();
      const path = `company-${expense.id}.${ext}`;
      const { error } = await supabase.storage.from('receipts').upload(path, receiptFile, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('receipts').getPublicUrl(path);
        expense.receiptUrl = data.publicUrl;
      }
    }
    const ok = await saveCompanyExpense(expense);
    if (ok) {
      setCompanyExpenses(prev => [expense, ...prev]);
      setForm({ companyId: 'epw', category: 'Mantenimiento', description: '', amount: '', tax: '', method: 'cash', vanId: '', date: todayISO() });
      setReceiptFile(null); setReceiptPreview(null);
    }
    setSaving(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Administración" title="💼 Expenses de Company" />

      <div style={styles.card}>
        <h3 style={styles.cardH3}>Log Expense</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={styles.lbl}>Company</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {DEFAULT_COMPANIES.map(c => (
              <button key={c.id} type="button" onClick={() => setForm(f => ({...f, companyId: c.id, vanId: ''}))}
                style={{ flex: 1, padding: '9px', borderRadius: 10, border: `2px solid ${form.companyId === c.id ? '#0f766e' : '#e2e8f0'}`, background: form.companyId === c.id ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 14, fontWeight: form.companyId === c.id ? 700 : 400, color: form.companyId === c.id ? '#0f766e' : '#64748b' }}>
                {c.logoEmoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={styles.lbl}>Categoría</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {COMPANY_EXPENSE_CATEGORIES.map(cat => (
              <button key={cat.id} type="button" onClick={() => setForm(f => ({...f, category: cat.id}))}
                style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${form.category === cat.id ? '#0f766e' : '#e2e8f0'}`, background: form.category === cat.id ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: form.category === cat.id ? 700 : 400, color: form.category === cat.id ? '#0f766e' : '#64748b' }}>
                {cat.icon} {cat.id}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.formGrid}>
          <div>
            <label style={styles.lbl}>Date *</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={styles.input} />
          </div>
          <div>
            <label style={styles.lbl}>Amount *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }}>$</span>
              <input type="number" step="0.01" value={form.amount}
                onChange={e => {
                  const amt = e.target.value;
                  const taxAmt = parseFloat(amt) > 0 ? parseFloat((parseFloat(amt) * (taxRate || 7) / 100).toFixed(2)) : '';
                  setForm(f => ({...f, amount: amt, tax: taxAmt}));
                }}
                style={{ ...styles.input, paddingLeft: 24 }} placeholder="0.00" />
            </div>
          </div>
          <div>
            <label style={styles.lbl}>🧾 Tax ({taxRate || 7}%) — auto</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: 11, color: '#94a3b8' }}>$</span>
              <input type="number" step="0.01" value={form.tax}
                onChange={e => setForm(f => ({...f, tax: e.target.value}))}
                style={{ ...styles.input, paddingLeft: 24, background: '#f0fdfa' }} placeholder="0.00" />
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
              Total con tax: <strong>${((parseFloat(form.amount)||0) + (parseFloat(form.tax)||0)).toFixed(2)}</strong>
            </p>
          </div>
          <div>
            <label style={styles.lbl}>Descripción</label>
            <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} style={styles.input} placeholder="Ej: Cambio de aceite Van 2" />
          </div>
          <div>
            <label style={styles.lbl}>Método de pago</label>
            <select value={form.method} onChange={e => setForm(f => ({...f, method: e.target.value}))} style={styles.input}>
              <option value="cash">💵 Cash</option>
              <option value="tarjeta-empresa">💳 Tarjeta empresa</option>
              <option value="cheque">📄 Cheque</option>
              <option value="zelle">📱 Zelle</option>
            </select>
          </div>
          <div>
            <label style={styles.lbl}>Van (opcional)</label>
            <select value={form.vanId} onChange={e => setForm(f => ({...f, vanId: e.target.value}))} style={styles.input}>
              <option value="">🏢 Toda la empresa</option>
              {vans.filter(v => v.companyId === form.companyId).map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.lbl}>📷 Recibo (opcional)</label>
            <input type="file" accept="image/*" capture="environment"
              onChange={e => { const f = e.target.files[0]; if (!f) return; setReceiptFile(f); setReceiptPreview(URL.createObjectURL(f)); }}
              style={{ ...styles.input, padding: '7px 12px', fontSize: 13 }} />
          </div>
        </div>

        {receiptPreview && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={receiptPreview} alt="Recibo" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <button onClick={() => { setReceiptFile(null); setReceiptPreview(null); }} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Quitar foto</button>
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <button onClick={handleSubmit} style={styles.btnPrimary} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
            {saving ? 'Guardando...' : 'Log Expense'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ ...styles.card, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div><label style={styles.lbl}>Desde</label><input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} style={{ ...styles.input, width: 160 }} /></div>
          <div><label style={styles.lbl}>Hasta</label><input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} style={{ ...styles.input, width: 160 }} /></div>
          <div>
            <label style={styles.lbl}>Company</label>
            <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} style={styles.input}>
              <option value="all">Todas</option>
              {DEFAULT_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.logoEmoji} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.lbl}>Categoría</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={styles.input}>
              <option value="all">Todas</option>
              {COMPANY_EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.id}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 16 }}>
        <div style={{ ...styles.kpiCard, borderTop: '3px solid #dc2626' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total gastos</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#dc2626', marginTop: 6 }}>{fmt(totalFiltered)}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</div>
        </div>
        {byCategory.slice(0, 3).map(([cat, amt]) => {
          const catInfo = COMPANY_EXPENSE_CATEGORIES.find(c => c.id === cat);
          return (
            <div key={cat} style={styles.kpiCard}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{catInfo?.icon} {cat}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 6 }}>{fmt(amt)}</div>
            </div>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={styles.empty}><p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>No expenses para este período</p></div>
        ) : filtered.map(e => {
          const catInfo = COMPANY_EXPENSE_CATEGORIES.find(c => c.id === e.category);
          const company = DEFAULT_COMPANIES.find(c => c.id === e.companyId);
          const van = vans.find(v => v.id === e.vanId);
          const methodLabels = { cash: '💵 Cash', 'tarjeta-empresa': '💳 Tarjeta empresa', cheque: '📄 Cheque', zelle: '📱 Zelle' };
          return (
            <div key={e.id} className="row-hover" style={{ ...styles.card, padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18 }}>{catInfo?.icon || '💼'}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{e.category}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#f0fdfa', color: '#0f766e', fontWeight: 600 }}>{company?.logoEmoji} {company?.name}</span>
                    {van && <span style={{ fontSize: 11, color: '#64748b' }}>🚐 {van.name}</span>}
                    {!e.vanId && <span style={{ fontSize: 11, color: '#94a3b8' }}>🏢 Company</span>}
                  </div>
                  {e.description && <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>{e.description}</div>}
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDateNice(e.date)} · {methodLabels[e.method] || e.method}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {e.receiptUrl && (
                    <img src={e.receiptUrl} alt="Recibo" onClick={() => setViewingReceipt(e.receiptUrl)}
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid #e2e8f0' }} />
                  )}
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{fmt(e.amount)}</span>
                  <button onClick={async () => { if (!confirm('¿Eliminar?')) return; await deleteCompanyExpense(e.id); setCompanyExpenses(prev => prev.filter(x => x.id !== e.id)); }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {viewingReceipt && (
        <div onClick={() => setViewingReceipt(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={viewingReceipt} alt="Recibo" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}

// ===== INVENTARIO TAB =====
function InventarioTab({ vans, session, isAdmin, inventoryItems, setInventoryItems, inventoryRequests, setInventoryRequests, groomers }) {
  const t = useT('en');
  const isGroomer = session?.role === 'groomer';
  const myVanId = session?.vanId;
  const [activeSection, setActiveSection] = useState(isGroomer ? 'solicitar' : 'solicitudes');
  const [requestItems, setRequestItems] = useState({});
  const [requestNotes, setRequestNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');
  const [newItemUnit, setNewItemUnit] = useState('unidad');

  const pendingRequests = inventoryRequests.filter(r => r.status === 'pending');
  const deliveredRequests = inventoryRequests.filter(r => r.status === 'delivered');
  const categories = [...new Set(inventoryItems.map(i => i.category))];

  const handleSendRequest = async () => {
    const selectedItems = Object.entries(requestItems).filter(([, qty]) => qty > 0);
    if (selectedItems.length === 0) { alert('Selecciona al menos un artículo'); return; }
    setSaving(true);
    const reqId = uid();
    const req = { id: reqId, vanId: myVanId, groomerId: session.userId, groomerName: session.userName, notes: requestNotes };
    const items = selectedItems.map(([itemId, qty]) => {
      const item = inventoryItems.find(i => i.id === itemId);
      return { itemId, itemName: item?.name || '', quantity: qty };
    });
    const ok = await saveInventoryRequest(req, items);
    if (ok) {
      const fresh = await loadInventoryRequests();
      setInventoryRequests(fresh);
      setRequestItems({});
      setRequestNotes('');
      alert('✅ Solicitud enviada al administrador');
    }
    setSaving(false);
  };

  const handleMarkDelivered = async (requestId) => {
    await markRequestDelivered(requestId);
    const fresh = await loadInventoryRequests();
    setInventoryRequests(fresh);
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) { alert('Ingresa el nombre del artículo'); return; }
    const item = { id: `item-${uid().slice(0,8)}`, name: newItemName.trim(), category: newItemCategory || 'General', unit: newItemUnit || 'unidad', active: true, sort_order: inventoryItems.length + 1 };
    const { error } = await supabase.from('inventory_items').insert(item);
    if (error) { alert(`Error: ${error.message}`); return; }
    setInventoryItems(prev => [...prev, item]);
    setNewItemName('');
    alert(`✅ "${item.name}" agregado`);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Insumos" title="📦 Inventory"
        right={pendingRequests.length > 0 && isAdmin ? (
          <div style={{ padding: '6px 14px', background: '#fef3c7', borderRadius: 999, fontSize: 13, fontWeight: 700, color: '#92400e', border: '1px solid #fcd34d' }}>
            🔔 {pendingRequests.length} pendiente{pendingRequests.length !== 1 ? 's' : ''}
          </div>
        ) : null}
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#f1f5f9', padding: 3, borderRadius: 8, flexWrap: 'wrap' }}>
        {isGroomer ? (
          <>
            <button onClick={() => setActiveSection('solicitar')} style={{ flex: 1, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === 'solicitar' ? 600 : 400, background: activeSection === 'solicitar' ? '#fff' : 'transparent', color: activeSection === 'solicitar' ? '#0f766e' : '#64748b' }}>{t('request_supplies')}</button>
            <button onClick={() => setActiveSection('mis-solicitudes')} style={{ flex: 1, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === 'mis-solicitudes' ? 600 : 400, background: activeSection === 'mis-solicitudes' ? '#fff' : 'transparent', color: activeSection === 'mis-solicitudes' ? '#0f766e' : '#64748b' }}>{t('my_requests')}</button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveSection('solicitudes')} style={{ flex: 1, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === 'solicitudes' ? 600 : 400, background: activeSection === 'solicitudes' ? '#fff' : 'transparent', color: activeSection === 'solicitudes' ? '#0f766e' : '#64748b' }}>🔔 {t('pending_requests')} {pendingRequests.length > 0 && `(${pendingRequests.length})`}</button>
            <button onClick={() => setActiveSection('historial')} style={{ flex: 1, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === 'historial' ? 600 : 400, background: activeSection === 'historial' ? '#fff' : 'transparent', color: activeSection === 'historial' ? '#0f766e' : '#64748b' }}>📋 {t('history')}</button>
            <button onClick={() => setActiveSection('articulos')} style={{ flex: 1, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === 'articulos' ? 600 : 400, background: activeSection === 'articulos' ? '#fff' : 'transparent', color: activeSection === 'articulos' ? '#0f766e' : '#64748b' }}>{t('articles')}</button>
          </>
        )}
      </div>

      {activeSection === 'solicitar' && (
        <div style={styles.card}>
          <h3 style={styles.cardH3}>📦 ¿Qué necesitas?</h3>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{cat}</div>
              {inventoryItems.filter(i => i.category === cat).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: (requestItems[item.id] || 0) > 0 ? '#f0fdfa' : '#f8fafc', borderRadius: 10, marginBottom: 6, border: `1px solid ${(requestItems[item.id] || 0) > 0 ? '#ccfbf1' : '#f1f5f9'}` }}>
                  <div style={{ flex: 1, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.unit}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setRequestItems(prev => ({...prev, [item.id]: Math.max(0, (prev[item.id]||0)-1)}))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 16, color: (requestItems[item.id]||0) > 0 ? '#0f766e' : '#94a3b8' }}>{requestItems[item.id] || 0}</span>
                    <button onClick={() => setRequestItems(prev => ({...prev, [item.id]: (prev[item.id]||0)+1}))} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#0f766e', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <label style={styles.lbl}>Notas adicionales</label>
            <input value={requestNotes} onChange={e => setRequestNotes(e.target.value)} style={styles.input} placeholder="Ej: El shampoo está casi vacío..." />
          </div>
          <button onClick={handleSendRequest} style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 14 }} disabled={saving}>
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : '📦'}
            {saving ? t('loading') : t('send_request')}
          </button>
        </div>
      )}

      {activeSection === 'mis-solicitudes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inventoryRequests.filter(r => r.van_id === myVanId).length === 0
            ? <div style={styles.empty}><p style={{ margin: 0, color: '#64748b' }}>Sin solicitudes aún</p></div>
            : inventoryRequests.filter(r => r.van_id === myVanId).map(req => (
              <div key={req.id} style={{ ...styles.card, borderLeft: `3px solid ${req.status === 'pending' ? '#f59e0b' : '#0f766e'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: req.status === 'pending' ? '#fef3c7' : '#f0fdfa', color: req.status === 'pending' ? '#92400e' : '#0f766e', fontWeight: 600 }}>
                    {req.status === 'pending' ? '⏳ Pendiente' : '✅ Entregado'}
                  </span>
                </div>
                {(req.inventory_request_items || []).map(item => (
                  <div key={item.id} style={{ fontSize: 13, color: '#475569' }}>• {item.item_name}: {item.quantity}</div>
                ))}
              </div>
            ))}
        </div>
      )}

      {activeSection === 'solicitudes' && (
        <div>
          {pendingRequests.length === 0
            ? <div style={styles.empty}><p style={{ margin: 0, color: '#64748b', fontFamily: 'Fraunces, serif', fontSize: 18 }}>Sin solicitudes pendientes 🎉</p></div>
            : pendingRequests.map(req => {
              const van = vans.find(v => v.id === req.van_id);
              return (
                <div key={req.id} style={{ ...styles.card, borderLeft: '3px solid #f59e0b', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>🚐 {van?.name || req.van_id} — {req.groomer_name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{new Date(req.created_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>⏳ Pendiente</span>
                  </div>
                  {(req.inventory_request_items || []).map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 10px', background: '#f8fafc', borderRadius: 6, marginBottom: 4 }}>
                      <span>📦 {item.item_name}</span>
                      <span style={{ fontWeight: 600, color: '#0f766e' }}>{item.quantity} {inventoryItems.find(i => i.id === item.item_id)?.unit || ''}</span>
                    </div>
                  ))}
                  {req.notes && <div style={{ fontSize: 12, color: '#64748b', margin: '8px 0' }}>📝 {req.notes}</div>}
                  <button onClick={() => handleMarkDelivered(req.id)} style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center', marginTop: 8 }}>✅ Mark as Delivered</button>
                </div>
              );
            })}
        </div>
      )}

      {activeSection === 'historial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {deliveredRequests.length === 0
            ? <div style={styles.empty}><p style={{ margin: 0, color: '#64748b' }}>Sin entregas registradas</p></div>
            : deliveredRequests.map(req => {
              const van = vans.find(v => v.id === req.van_id);
              return (
                <div key={req.id} style={{ ...styles.card, borderLeft: '3px solid #0f766e', opacity: 0.85 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600 }}>🚐 {van?.name} — {req.groomer_name}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#f0fdfa', color: '#0f766e', fontWeight: 600 }}>✅ Entregado</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                    {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {req.delivered_at && ` → ${new Date(req.delivered_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`}
                  </div>
                  {(req.inventory_request_items || []).map(item => (
                    <div key={item.id} style={{ fontSize: 12, color: '#475569' }}>• {item.item_name}: {item.quantity}</div>
                  ))}
                </div>
              );
            })}
        </div>
      )}

      {activeSection === 'articulos' && (
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardH3}>➕ Nuevo artículo</h3>
            <div style={styles.formGrid}>
              <div><label style={styles.lbl}>Nombre *</label><input value={newItemName} onChange={e => setNewItemName(e.target.value)} style={styles.input} placeholder="Ej: Shampoo desodorizante" /></div>
              <div>
                <label style={styles.lbl}>Categoría</label>
                <input value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)} style={styles.input} placeholder="Shampoo, Insumos, Cuidado..." list="cat-list" />
                <datalist id="cat-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label style={styles.lbl}>Unidad</label>
                <select value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)} style={styles.input}>
                  {['botella','frasco','paquete','rollo','unidad','caja','galón'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleAddItem} style={{ ...styles.btnPrimary, marginTop: 12 }}><Plus size={15} /> Agregar artículo</button>
          </div>

          <div style={{ ...styles.card, marginTop: 16 }}>
            <h3 style={styles.cardH3}>Artículos registrados</h3>
            {categories.map(cat => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{cat}</div>
                {inventoryItems.filter(i => i.category === cat).map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{item.name}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.unit}</span>
                      <button onClick={async () => {
                        if (!confirm(`¿Desactivar "${item.name}"?`)) return;
                        await supabase.from('inventory_items').update({ active: false }).eq('id', item.id);
                        setInventoryItems(prev => prev.filter(i => i.id !== item.id));
                      }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
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
          Daily Log de todas las acciones del sistema — quién hizo qué y cuándo.
        </p>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading historial...</div>
        ) : logs.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ margin: 0, color: '#64748b' }}>Sin actividad registrada todavía</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date y hora</th>
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
