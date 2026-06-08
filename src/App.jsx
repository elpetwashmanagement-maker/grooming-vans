// Raykota v2.3 - Clean client form
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Download, FileText, Settings as SettingsIcon, TrendingUp, Loader2, Edit2, X, Check, Truck, Sparkles, Lock, LogOut, Eye, EyeOff, DollarSign, AlertTriangle, MapPin } from 'lucide-react';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ModulesProvider, useModulesContext } from "./context/ModulesContext";
import { ModuleGuard } from "./components/ModuleGuard";
import { RaykotaPay } from "./components/RaykotaPay";
import { RouteMapView } from "./components/RouteMapView";
import { ModulesAdmin } from "./components/ModulesAdmin";
import { AlertsPanel } from "./components/AlertsPanel";
import { CombosAdmin, ComboChip, DEFAULT_COMBOS, DEFAULT_BLADES } from "./components/CombosAdmin";
import { supabase } from "./lib/supabase";
import * as XLSX from 'xlsx';
// ===== TRADUCCIONES =====
const TRANSLATIONS = {
  es: {
    // Tabs
    tab_appointments: 'My Appointments',
    tab_clients: 'Clients',
    tab_breeds: 'AI Breeds',
    tab_registro: 'My Daily Log',
    tab_registro_admin: 'Daily Log',
    tab_cierre: 'My Daily Close',
    tab_cierre_admin: 'Daily Close',
    tab_gastos: '💼 Expenses',
    tab_inventory: '📦 Inventory',
    tab_week: 'Weekly Report',
    tab_dashboard: 'Dashboard',
    tab_auditoria: 'Audit Log',
    tab_config: 'Settings',
    // Appointments
    new_appt: '+ New Appointment',
    checkin: 'Check In',
    complete_pay: 'Complete & Collect',
    view_invoice: '🧾 Ver Invoice',
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
    grooming_record: 'Ficha de grooming',
    checklist: 'Checklist',
    // Inventory
    request_supplies: '📦 Request Supplies',
    my_requests: '📋 My Requests',
    send_request: 'Send Request to Admin',
    mark_delivered: '✅ Mark as Delivered',
    pending_requests: 'Pending Requests',
    history: 'Historial',
    articles: '⚙️ Artículos',
    // Generales
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    loading: 'Loading...',
    no_data: 'Sin datos',
    date: 'Date',
    amount: 'Amount',
    total: 'Total',
    notes: 'Notes',
    method: 'Método de pago',
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
    to_pay: 'A pay',
    company_income: 'Company Income',
    // Login
    enter_pin: 'Ingresa tu PIN',
    wrong_pin: 'PIN incorrecto',
  },
  en: {
    // Tabs
    tab_appointments: 'My Appointments',
    tab_clients: 'Clients',
    tab_breeds: 'AI Breeds',
    tab_registro: 'My Daily Log',
    tab_registro_admin: 'Daily Log',
    tab_cierre: 'My Daily Close',
    tab_cierre_admin: 'Daily Close',
    tab_gastos: '💼 Expenses',
    tab_inventory: '📦 Inventory',
    tab_week: 'Weekly Report',
    tab_dashboard: 'Dashboard',
    tab_auditoria: 'Audit Log',
    tab_config: 'Settings',
    // Appointments
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
    // Inventory
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
    appId: import.meta.env.VITE_SQUARE_APP_ID || 'sq0idp-NMrGOWJsE92t5QnHfFvk5g',
    locationId: import.meta.env.VITE_SQUARE_LOCATION_ID || 'LVYKDEEJCC7NE',
    scriptUrl: 'https://web.squarecdn.com/v1/square.js',
  }
};

// Square por empresa
const SQUARE_BY_COMPANY = {
  epw: {
    appId: 'sq0idp-NMrGOWJsE92t5QnHfFvk5g',
    locationId: 'LVYKDEEJCC7NE',
  },
  atw: {
    appId: 'sq0idp-8BUBQILfZCghnkzFNC3rrQ',
    locationId: 'L2GY0521F3XAG',
  },
};


const SQUARE_ENV = 'production';
const SQ = SQUARE_CONFIG[SQUARE_ENV];

// Obtener config de Square para una empresa
const getSQForCompany = (companyId) => {
  const co = SQUARE_BY_COMPANY[companyId] || SQUARE_BY_COMPANY['epw'];
  return {
    ...SQ,
    appId: co.appId,
    locationId: co.locationId,
  };
};

// Cargar Square SDK
const loadSquareSDK = () => new Promise((resolve, reject) => {
  if (window.Square) { resolve(window.Square); return; }
  const script = document.createElement('script');
  script.src = SQ.scriptUrl;
  script.onload = () => resolve(window.Square);
  script.onerror = reject;
  document.head.appendChild(script);
});

const processSquarePayment = async (amountCents, note = '', companyId = 'epw') => {
  try {
    const Square = await loadSquareSDK();
    const sqConfig = getSQForCompany(companyId);
    const payments = Square.payments(sqConfig.appId, sqConfig.locationId);

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



// ===== SMS =====
const sendSMSApi = async (phone, message, companyId, clientId = null, clientName = null) => {
  try {
    const res = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, message, companyId: companyId || 'epw', clientId, clientName }),
    });
    const data = await res.json();
    if (data.success) console.log('SMS sent:', phone);
    else console.error('SMS error:', data.error);
    return data.success;
  } catch (err) {
    console.error('SMS failed:', err);
    return false;
  }
};

const sendSMS = async (phone, message, companyId) => {
  if (!phone) return { success: false, error: 'No phone number' };
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: formattedPhone, message, companyId }),
    });
    return await response.json();
  } catch (err) {
    console.error('SMS error:', err);
    return { success: false, error: err.message };
  }
};

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
const DEFAULT_CATEGORIES = ['Gas', 'Shampoo', 'Colonias', 'Materiales', 'Mantenimiento', 'Otros'];

const DEFAULT_COMPANIES = [
  { id: 'epw', name: 'El Pet Wash', logoEmoji: '🐾', gasFee: 7, cardFeePct: 5.5, active: true, sortOrder: 1 },
  { id: 'atw', name: 'All Tails Wag', logoEmoji: '🐕', gasFee: 7, cardFeePct: 5.5, active: true, sortOrder: 2 },
];

const INVOICE_FOOTERS = {
  epw: `Thank you for choosing El Pet Wash LLC!
We love your furry family member. 🐾
Questions? Call us anytime.
www.elpetwash.com`,
  atw: `Thank you for choosing All Tails Wag Grooming LLC!
We love your furry family member. 🐾
Questions? Call us anytime.
www.alltailswag.com`,
};

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
  { id: 'dog',   label: 'Dog',   icon: '🐕', hasSize: true,  hasHair: true  },
  { id: 'cat',   label: 'Cat',   icon: '🐈', hasSize: false, hasHair: false },
  { id: 'other', label: 'Other', icon: '🐾', hasSize: false, hasHair: false },
];
const getSpecies = (id) => SPECIES.find(s => s.id === id) || SPECIES[0];

const CAT_BREEDS = [
  'Abyssinian','Bengal','Birman','British Shorthair',
  'Burmese','Cornish Rex','Devon Rex',
  'Domestic Longhair','Domestic Shorthair','Himalayan',
  'Maine Coon','Norwegian Forest Cat','Persian',
  'Ragdoll','Russian Blue','Scottish Fold',
  'Siamese','Sphynx','Turkish Angora','Mixed Breed',
];

// ===== RAZAS POPULARES =====
const DOG_BREEDS = [
  'Affenpinscher','Afghan Hound','Airedale Terrier','Akita',
  'Alaskan Husky','Alaskan Klee Kai','Alaskan Malamute',
  'American Bulldog','American Coonhound','American Eskimo Dog',
  'American Pit Bull Terrier','American Staffordshire Terrier',
  'Australian Labradoodle','Australian Shepherd','Aussiedoodle',
  'Basenji','Basset Hound','Beagle','Belgian Malinois',
  'Bernedoodle','Bernese Mountain Dog','Bernadoodle',
  'Bich Poo','Bichon Frise','Bijian Havanese','Border Collie',
  'Border Terrier','Boston Terrier','Boxer','Bulldog','Bullmastiff',
  'Cairn Terrier','Cane Corso Italiano','Cavapoo',
  'Cavalier King Charles Spaniel','Chihuahua','Chow Chow',
  'Cockapoo','Cocker Spaniel','Coton De Tulear',
  'Dachshund','Dalmatian','Doberman','Doberman Pinscher',
  'Dutch Shepherd','English Bulldog','English Cocker Spaniel',
  'English Setter','English Springer Spaniel',
  'French Bulldog','German Shepherd','German Shorthaired Pointer',
  'Goldendoodle','Golden Retriever','Great Dane','Greyhound',
  'Havanese','Havapoo','Irish Setter','Italian Greyhound',
  'Jack Russell Terrier','Keeshond',
  'Lab Shepherd','Labradoodle','Labrador Husky','Labrador Retriever',
  'Lagotto Romagnolo','Lhasa Apso',
  'Maltese','Maltipoo','Miniature Australian Shepherd',
  'Miniature Pinscher','Miniature Poodle','Miniature Schnauzer',
  'Mini Poodle Mix','Morkie',
  'Papillon','Pekingese','Pembroke Welsh Corgi','Pit Bull',
  'Pitbull','Pointer','Pomeranian','Pomsky','Poodle (Miniature)',
  'Poodle (Standard)','Poodle (Toy)','Portuguese Water Dog','Pug',
  'Rhodesian Ridgeback','Rottweiler',
  'Saint Bernard','Samoyed','Schnauzer','Shetland Sheepdog',
  'Sheepadoodle','Sheepdoodle','Shih Poo','Shih Tzu','Shorkie',
  'Siberian Husky','Shnoodle','Soft Coated Wheaten Terrier',
  'Staffordshire Bull Terrier','Standard Schnauzer','Standard Poodle',
  'Teddy Bear','Terrier Mix','Toy Poodle',
  'Vizsla','Weimaraner','West Highland White Terrier','Whippet',
  'Yorkshire Terrier','Yorkie/Poodle Mix',
  'Mixed Breed',
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
    company_id: user.companyId || user.company_id || null,
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
  let all = [], from = 0, batchSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('clients').select('*').eq('active', true).order('name').range(from, from + batchSize - 1);
    if (error) { console.error(error); break; }
    if (!data || data.length === 0) break;
    all = [...all, ...data];
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return all;
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
    notify_sms: client.notifySms || false,
    notify_email: client.notifyEmail || false,
    companies: client.companies || [],
  });
  if (error) console.error(error);
  return !error;
};

// ===== MASCOTAS =====
const loadPets = async () => {
  let all = [], from = 0, batchSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('pets').select('*').order('name').range(from, from + batchSize - 1);
    if (error) { console.error(error); break; }
    if (!data || data.length === 0) break;
    all = [...all, ...data];
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return all;
};
const savePet = async (pet) => {
  const { error } = await supabase.from('pets').upsert({
    id: pet.id, client_id: pet.clientId, name: pet.name, breed: pet.breed || '',
    species: pet.species || 'dog',
    size: pet.size || '', hair_type: pet.hairType || '', weight: pet.weight || 0,
    color: pet.color || '', age: pet.age || '', allergies: pet.allergies || '',
    medical_notes: pet.medicalNotes || '', behavior_notes: pet.behaviorNotes || '',
    last_blade: pet.lastBlade || '', last_combo: pet.lastCombo || '',
    gender: pet.gender || '',
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
  // Cargar clients por separado para evitar conflicto de tipos
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
    recurrenceWeeks: a.recurrence_weeks || 0,
    recurrenceParentId: a.recurrence_parent_id || null,
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
  const payload = {
    id: appt.id, date: appt.date, time_start: appt.timeStart, time_end: appt.timeEnd || '',
    van_id: appt.vanId, client_id: String(appt.clientId), status: appt.status || 'unconfirmed',
    notes: appt.notes || '', alert_notes: appt.alertNotes || '',
    agreement_signed: appt.agreementSigned || false,
    groomer_id: appt.groomerId || null,
    company_id: appt.companyId || 'epw',
    recurrence_weeks: appt.recurrenceWeeks || 0,
    recurrence_parent_id: appt.recurrenceParentId || null,
  };
  console.log('💾 Saving appointment:', payload);
  const { error } = await supabase.from('appointments').upsert(payload);
  if (error) console.error('❌ saveAppointment error:', error);
  else console.log('✅ Appointment saved!');
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
    active: van.active !== false,
    company_id: van.companyId || 'epw',
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

// ===== GPS TRACKING =====
const saveVanLocation = async (location) => {
  const { error } = await supabase.from('van_locations').upsert({
    id: location.vanId, // usa vanId como primary key para upsert
    van_id: location.vanId,
    groomer_id: location.groomerId || null,
    groomer_name: location.groomerName || '',
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy || 0,
    timestamp: new Date().toISOString(),
    is_active: true,
  });
  if (error) console.error('GPS error:', error);
};

const loadVanLocations = async () => {
  const { data, error } = await supabase.from('van_locations')
    .select('*').eq('is_active', true)
    .gte('timestamp', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // últimos 30 min
  if (error) { console.error(error); return []; }
  return data || [];
};

const deactivateVanLocation = async (vanId) => {
  await supabase.from('van_locations').update({ is_active: false }).eq('van_id', vanId);
};

// ===== DEPOSITS =====
const loadDeposits = async () => {
  const { data, error } = await supabase.from('deposits').select('*').order('date', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
};

const saveDeposit = async (deposit) => {
  const { error } = await supabase.from('deposits').insert({
    id: deposit.id, appointment_id: deposit.appointmentId,
    client_id: deposit.clientId, amount: deposit.amount,
    method: deposit.method, date: deposit.date,
    notes: deposit.notes || '', created_by: deposit.createdBy || '',
  });
  if (error) console.error(error);
  return !error;
};

// ===== CARDS ON FILE =====
const loadCardsOnFile = async () => {
  const { data, error } = await supabase.from('cards_on_file').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
};

const saveCardOnFile = async (card) => {
  const { error } = await supabase.from('cards_on_file').insert({
    id: card.id, client_id: card.clientId, last4: card.last4,
    brand: card.brand || 'Visa', exp_month: card.expMonth || '',
    exp_year: card.expYear || '', square_card_id: card.squareCardId || '',
    nickname: card.nickname || '', is_default: card.isDefault || false,
  });
  if (error) console.error(error);
  return !error;
};

const deleteCardOnFile = async (id) => {
  await supabase.from('cards_on_file').delete().eq('id', id);
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
const GOOGLE_PLACES_KEY = 'AIzaSyDjIrZHfloSCZHo4wOi9p0t3VFwIiPY2dI';

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
  doc.text('Raykota', 14, 18);
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
    ['Raykota — ' + title],
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

// Tax Deductible Expenses Export
const exportTaxReportPDF = (expenses, vans, dateStart, dateEnd) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(15, 118, 110);
  doc.text('Raykota', 14, 18);
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text(`Tax Deductible Expenses Report`, 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Period: ${dateStart} to ${dateEnd} · Generated: ${new Date().toLocaleDateString()}`, 14, 36);

  DEFAULT_COMPANIES.forEach((company, idx) => {
    const compExp = expenses.filter(e => e.companyId === company.id && inRange(e.date, dateStart, dateEnd));
    if (compExp.length === 0) return;

    const byCategory = {};
    compExp.forEach(e => {
      if (!byCategory[e.category]) byCategory[e.category] = { items: [], total: 0, tax: 0 };
      byCategory[e.category].items.push(e);
      byCategory[e.category].total += e.amount;
      byCategory[e.category].tax += e.tax_amount || 0;
    });

    const rows = compExp.map(e => [
      e.date, e.category, e.description || '', `$${(e.amount - (e.tax_amount||0)).toFixed(2)}`, `$${(e.tax_amount||0).toFixed(2)}`, `$${e.amount.toFixed(2)}`
    ]);
    const totalAmount = compExp.reduce((s, e) => s + e.amount, 0);
    const totalTax = compExp.reduce((s, e) => s + (e.tax_amount || 0), 0);
    rows.push(['', '', 'TOTAL', `$${(totalAmount - totalTax).toFixed(2)}`, `$${totalTax.toFixed(2)}`, `$${totalAmount.toFixed(2)}`]);

    const startY = idx === 0 ? 44 : (doc.lastAutoTable?.finalY || 44) + 16;
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text(`${company.logoEmoji} ${company.name}`, 14, startY);

    autoTable(doc, {
      startY: startY + 4,
      head: [['Date', 'Category', 'Description', 'Base Amount', 'Tax', 'Total']],
      body: rows,
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [240, 253, 250] },
    });
  });

  doc.save(`tax-expenses-${dateStart}-${dateEnd}.pdf`);
};

const exportTaxReportExcel = (expenses, vans, dateStart, dateEnd) => {
  const wb = XLSX.utils.book_new();
  let hasData = false;
  DEFAULT_COMPANIES.forEach(company => {
    const compExp = expenses.filter(e => e.companyId === company.id && inRange(e.date, dateStart, dateEnd));
    const rows = [
      ['Raykota — Tax Deductible Expenses'],
      [`${company.name} · Period: ${dateStart} to ${dateEnd}`],
      [],
      ['Date', 'Category', 'Description', 'Base Amount', 'Tax', 'Total', 'Method', 'Van'],
      ...compExp.map(e => [e.date, e.category, e.description || '', (e.amount - (e.tax_amount||0)).toFixed(2), (e.tax_amount||0).toFixed(2), e.amount.toFixed(2), e.method || '', vans.find(v => v.id === e.vanId)?.name || '']),
      [],
      ['', '', 'TOTAL',
        compExp.reduce((s,e) => s + e.amount - (e.tax_amount||0), 0).toFixed(2),
        compExp.reduce((s,e) => s + (e.tax_amount||0), 0).toFixed(2),
        compExp.reduce((s,e) => s + e.amount, 0).toFixed(2)
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 25 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, company.name.slice(0, 31));
    hasData = true;
  });
  if (!hasData) {
    const ws = XLSX.utils.aoa_to_sheet([['No expenses found for this period']]);
    XLSX.utils.book_append_sheet(wb, ws, 'No Data');
  }
  XLSX.writeFile(wb, `tax-expenses-${dateStart}-${dateEnd}.xlsx`);
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
function AppMain() {
  const [tab, setTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  const [vans, setVans] = useState(DEFAULT_VANS);
  const [services, setServices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState({ commissionPct: 45, tipsToGroomer: 100, adminPin: DEFAULT_ADMIN_PIN, cardFeePct: 5.5, gasFee: 7.00, taxRate: 7.0 });
  const [session, setSession] = useState(null);
  const [vanLocations, setVanLocations] = useState([]);
  const gpsWatchRef = useRef(null);
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
  const [deposits, setDeposits] = useState([]);
  const [cardsOnFile, setCardsOnFile] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const lastBookingCountRef = useRef(null);
  const lang = 'en';
  const t = useT(lang);

  useEffect(() => {
    (async () => {
      const [v, s, st, ex, cats, us, appts, cls, pts, svc, gr, cos, invItems, invReqs, compExp, fuel, payments, deps, cards, bkReqs] = await Promise.all([
        loadVans(), loadServices(), loadSettings(), loadExpenses(),
        loadCategories(), loadUsers(), loadAppointments(), loadClients(), loadPets(),
        loadServicePrices(), loadGroomers(), loadCompanies(),
        loadInventoryItems(), loadInventoryRequests(), loadCompanyExpenses(), loadFuelLogs(), loadGroomerPayments(), loadDeposits(), loadCardsOnFile(), loadBookingRequests()
      ]);
      setVans(v); setServices(s); setSettings(st); setExpenses(ex);
      setCategories(cats); setUsers(us); setAppointments(appts);
      setClients(cls); setPets(pts); setServicePrices(svc); setGroomers(gr);
      setCompanies(cos); setInventoryItems(invItems); setInventoryRequests(invReqs);
      setCompanyExpenses(compExp); setFuelLogs(fuel); setGroomerPayments(payments);
      setDeposits(deps); setCardsOnFile(cards); setBookingRequests(bkReqs);
      lastBookingCountRef.current = bkReqs.filter(r => r.status === 'pending').length;
      setSession(loadSession());
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) saveSessionLocal(session); }, [session, loading]);

  // GPS — Groomer comparte ubicación cuando app está abierta
  useEffect(() => {
    if (!session || session.role !== 'groomer' || !session.vanId) return;
    if (!navigator.geolocation) return;
    const updateLocation = (pos) => {
      saveVanLocation({ vanId: session.vanId, groomerId: session.userId, groomerName: session.userName, latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
    };
    gpsWatchRef.current = navigator.geolocation.watchPosition(updateLocation, (err) => console.log('GPS:', err.message), { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 });
    return () => { if (gpsWatchRef.current) { navigator.geolocation.clearWatch(gpsWatchRef.current); deactivateVanLocation(session.vanId); } };
  }, [session?.vanId]);

  // GPS — Admin carga ubicaciones cada 30s
  useEffect(() => {
    if (!session || session.role === 'groomer') return;
    const loadLocs = async () => { const locs = await loadVanLocations(); setVanLocations(locs); };
    loadLocs();
    const interval = setInterval(loadLocs, 30000);
    return () => clearInterval(interval);
  }, [session?.role]);

  useEffect(() => {
    if (loading || !session) return;
    const interval = setInterval(async () => {
      const [freshS, freshE] = await Promise.all([loadServices(), loadExpenses()]);
      setServices(freshS); setExpenses(freshE);
    }, 15000);
    return () => clearInterval(interval);
  }, [loading, session]);

  // Polling de booking requests + notificación
  useEffect(() => {
    if (!session || session.role === 'groomer') return;
    const checkRequests = async () => {
      const reqs = await loadBookingRequests();
      setBookingRequests(reqs);
      const pendingCount = reqs.filter(r => r.status === 'pending').length;
      if (lastBookingCountRef.current !== null && pendingCount > lastBookingCountRef.current) {
        const newest = reqs.filter(r => r.status === 'pending')[0];
        playNotificationSound();
        showBrowserNotification(
          '🐾 New Booking Request!',
          newest ? `${newest.client_name} — ${newest.pet_name || 'Pet'} · ${newest.company_id === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}` : 'A new client wants to book'
        );
      }
      lastBookingCountRef.current = pendingCount;
    };
    checkRequests();
    const interval = setInterval(checkRequests, 30000);
    return () => clearInterval(interval);
  }, [session?.role, loading]);

  useEffect(() => {
    if (!session) return;
    if (session.role === 'groomer') setTab('home');
    if (session.role === 'admin' || session.role === 'manager') setTab('home');
    if (session.role === 'viewer') setTab('appointments');
    if (session.role === 'finance') setTab('week');
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

  // Appointments
  const addAppointment = async (appt) => {
    setAppointments(prev => [...prev, appt]);
    await saveAppointment(appt);
  };
  const updateServicePrice = async (price) => {
    setServicePrices(prev => prev.map(p => p.id === price.id ? price : p));
    await saveServicePrice(price);
  };
  const deleteServicePrice = async (id) => {
    await supabase.from('service_prices').delete().eq('id', id);
    setServicePrices(prev => prev.filter(p => p.id !== id));
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
    const appt = appointments.find(a => a.id === id);
    const isCompleted = appt?.status === 'completed';
    const msg = isCompleted
      ? '⚠️ This appointment is COMPLETED.\n\nThis will delete:\n• Appointment\n• Financial records (services, invoice)\n• Grooming records\n\nCannot be undone. Continue?'
      : '⚠️ Delete this appointment? Cannot be undone.';
    if (!confirm(msg)) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
    await supabase.from('grooming_records').delete().eq('appointment_id', id);
    await supabase.from('grooming_photos').delete().eq('appointment_id', id);
    await supabase.from('invoices').delete().eq('appointment_id', id);
    await supabase.from('services').delete().eq('appointment_id', id);
    await supabase.from('appointment_pets').delete().eq('appointment_id', id);
    await supabase.from('appointments').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.appointmentId !== id));
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
    const clientAppts = appointments.filter(a => String(a.clientId) === String(id));
    const clientPetsList = pets.filter(p => p.client_id === id);

    const msg = `⚠️ ¿Delete a ${client?.name}?\n\nEsto eliminará permanentemente:\n• ${clientPetsList.length} pet(s)\n• ${clientAppts.length} appointment(s)\n• Todas las fichas de grooming\n\nNo se puede deshacer.`;
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

  // Pets
  const addPet = async (pet) => {
    const ok = await savePet(pet);
    if (ok) setPets(prev => [...prev, pet]);
    return ok;
  };
  const updatePet = async (pet) => {
    if (pet._deleted) { setPets(prev => prev.filter(p => p.id !== pet.id)); return true; }
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
  const isViewer = session.role === 'viewer' || session.role === 'viewer-epw' || session.role === 'viewer-atw';
  const isFinance = session.role === 'finance';
  // Viewer ve solo su empresa
  const viewerCompanyId = (isViewer || isFinance) ? session.companyId : null;
  const canViewFinances = session.permissions?.can_view_finances || isAdmin;
  const canViewReports = session.permissions?.can_view_reports || isAdmin || isViewer;
  const canEditConfig = session.permissions?.can_edit_config || isAdmin;
  const canViewAllSchedule = session.permissions?.can_view_all_schedule || isAdmin || isViewer;

  // Company activa
  const activeCompanyId = session.companyId || 'epw';
  const activeCompany = companies.find(c => c.id === activeCompanyId) || DEFAULT_COMPANIES[0];

  const currentVan = isGroomer ? vans.find(v => v.id === session.vanId) : null;
  const visibleServices = canViewAllSchedule ? services : services.filter(s => s.vanId === session.vanId);
  const visibleExpenses = canViewAllSchedule ? expenses : expenses.filter(e => e.vanId === session.vanId);
  // Admin ve todas las vans, groomer solo la suya
  const visibleVans = isGroomer
    ? (currentVan ? [currentVan] : [])
    : (isViewer || isFinance)
      ? vans.filter(v => v.companyId === viewerCompanyId)
      : vans; // Admin y manager ven todas

  return (
    <ModulesProvider companyId={activeCompanyId}>
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
        activeCompany={activeCompany} isOnline={isOnline} />
      <main style={styles.main}>
        {tab === 'home' && !isViewer && <HomeTab session={session} appointments={appointments} vans={vans} clients={clients} pets={pets} settings={settings} setTab={setTab} groomers={groomers} />}
        {tab === 'home' && isViewer && (
          <div style={{ padding: 20, textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800 }}>Welcome, {session.userName}!</div>
            <div style={{ color: '#64748b', marginTop: 8 }}>Use the menu to view your schedule and reports.</div>
            <button onClick={() => setTab('appointments')} style={{ marginTop: 20, padding: '12px 24px', background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              📅 View Schedule
            </button>
          </div>
        )}
        {tab === 'appointments' && (
          <AppointmentsTab
            appointments={(isViewer || isFinance) ? appointments.filter(a => visibleVans.some(v => v.id === a.vanId)) : appointments}
            vans={vans} clients={clients} pets={pets}
            session={{ ...session, groomers }} settings={settings} isAdmin={isAdmin || session?.role === 'manager'}
            canViewAllSchedule={canViewAllSchedule} updateApptStatus={updateApptStatus}
            addAppointment={isViewer ? () => {} : addAppointment} addClient={addClient} addPet={addPet}
            refreshAppointments={refreshAppointments} deleteAppt={deleteAppt}
            servicePrices={servicePrices} deposits={deposits} setDeposits={setDeposits}
            groomers={groomers}
          />
        )}
        {tab === 'clients' && (
          <ClientsTab
            clients={clients} pets={pets} appointments={appointments}
            session={session} isAdmin={isAdmin || session?.role === 'manager'}
            addClient={addClient} updateClient={updateClient} removeClient={removeClient}
            addPet={addPet} updatePet={updatePet}
            servicePrices={servicePrices} addAppointment={addAppointment} vans={vans}
            settings={{ ...settings, companies, groomersList: groomers }}
            refreshAppointments={refreshAppointments}
            cardsOnFile={cardsOnFile} setCardsOnFile={setCardsOnFile}
            setTab={setTab}
          />
        )}
        {tab === 'breeds' && <BreedsTab session={session} />}
        {tab === 'registro' && (
          <RegistroTab
            vans={vans} services={visibleServices} addService={addService}
            updateService={updateService} removeService={removeService}
            fixedVanId={isGroomer ? session.vanId : null} settings={settings}
            isAdmin={isAdmin || isManager}
            fuelLogs={fuelLogs} setFuelLogs={setFuelLogs}
            expenses={visibleExpenses} addExpense={addExpense} removeExpense={removeExpense}
            categories={categories} lang={lang}
          />
        )}
        {tab === 'cierre' && <CierreTab vans={vans} services={visibleServices} expenses={visibleExpenses} isAdmin={canViewAllSchedule} settings={settings} />}
        {tab === 'boarding' && <ModuleGuard module="boarding"><BoardingTab clients={clients} pets={pets} session={session} settings={settings} /></ModuleGuard>}
        {tab === 'week' && canViewReports && <WeekTab vans={(isViewer || isFinance) ? visibleVans : vans} services={(isViewer || isFinance) ? services.filter(s => visibleVans.some(v => v.id === s.vanId)) : services} expenses={expenses} settings={settings} appointments={(isViewer || isFinance) ? appointments.filter(a => visibleVans.some(v => v.id === a.vanId)) : appointments} groomers={(isViewer || isFinance) ? groomers.filter(g => visibleVans.some(v => v.id === g.vanId)) : groomers} />}
        {tab === 'dashboard' && (isAdmin || isFinance) && <DashboardTab vans={vans} services={services} expenses={expenses} settings={settings} appointments={appointments} groomers={groomers} companies={companies} companyExpenses={companyExpenses} vanLocations={vanLocations} lockedCompanyId={isFinance ? session.companyId : null} />}
        {tab === 'van-tracker' && (isAdmin || session?.role === 'manager') && <ModuleGuard module="gps_routes"><VanTrackerTab vans={vans} vanLocations={vanLocations} groomers={groomers} /></ModuleGuard>}
        {tab === 'smart-fill' && (isAdmin || isManager) && <SmartFillTab groomers={groomers} vans={vans} appointments={appointments} clients={clients} pets={pets} settings={settings} addAppointment={addAppointment} servicePrices={servicePrices} session={session} />}
        {tab === 'config' && canEditConfig && (
          <ConfigTab vans={vans} updateVans={updateVans} settings={settings} updateSettings={updateSettings}
            services={services} clearServices={clearServices} categories={categories}
            addCategory={addCategory} removeCategory={removeCategory} expenses={expenses}
            users={users} addUser={addUser} updateUser={updateUser} toggleUserActive={toggleUserActive}
            servicePrices={servicePrices} updateServicePrice={updateServicePrice} addServicePrice={addServicePrice} deleteServicePrice={deleteServicePrice}
            groomers={groomers} addGroomer={addGroomer} updateGroomer={updateGroomer} toggleGroomerActive={toggleGroomerActive}
          />
        )}
        {tab === 'payroll' && (isAdmin || isViewer || isFinance) && (<ModuleGuard module="payroll">
          <PayrollTab
            groomers={(isViewer || isFinance) ? groomers.filter(g => visibleVans.some(v => v.id === g.vanId)) : groomers} vans={(isViewer || isFinance) ? visibleVans : vans} services={(isViewer || isFinance) ? services.filter(s => visibleVans.some(v => v.id === s.vanId)) : services}
            appointments={(isViewer || isFinance) ? appointments.filter(a => visibleVans.some(v => v.id === a.vanId)) : appointments} settings={settings}
            groomerPayments={groomerPayments}
            setGroomerPayments={setGroomerPayments}
            session={session}
          />
        </ModuleGuard>)}
        {tab === 'gastos-company' && (isAdmin || isFinance) && (<ModuleGuard module="finances">
          <ExpensesCompanyTab
            vans={vans} session={session} companies={companies}
            companyExpenses={companyExpenses}
            setCompanyExpenses={setCompanyExpenses}
            taxRate={settings.taxRate ?? 7.0}
            lockedCompanyId={isFinance ? session.companyId : null}
          />
        </ModuleGuard>)}
        {tab === 'inventory' && (<ModuleGuard module="inventory">
          <InventoryTab
            vans={vans} session={session} isAdmin={isAdmin || isManager}
            inventoryItems={inventoryItems} setInventoryItems={setInventoryItems}
            inventoryRequests={inventoryRequests} setInventoryRequests={setInventoryRequests}
            groomers={groomers}
          />
        </ModuleGuard>)}
        {tab === 'auditoria' && isAdmin && <ModuleGuard module="audit"><AuditoriaTab /></ModuleGuard>}
        {tab === 'messages' && isAdmin && (
          <MessagesTab clients={clients} vans={vans} session={session} />
        )}
        {tab === 'close-review' && (isAdmin || isFinance) && (
          <CloseReviewTab
            appointments={appointments} vans={vans} settings={settings}
            refreshAppointments={refreshAppointments} updateApptStatus={updateApptStatus}
            services={services} setServices={setServices}
            lockedCompanyId={isFinance ? session.companyId : null}
          />
        )}
        {tab === 'requests' && (isAdmin || isManager) && (
          <BookingRequestsTab
            requests={bookingRequests} setRequests={setBookingRequests}
            vans={vans} groomers={groomers} clients={clients}
            addAppointment={addAppointment} addClient={addClient} addPet={addPet}
            refreshAppointments={refreshAppointments}
          />
        )}
      </main>

      {/* ===== BOTTOM NAVIGATION ===== */}
      {(() => {
        const isAdmin = session?.role === 'admin';
        const isManager = session?.role === 'manager';
        const isGroomer = session?.role === 'groomer';
        const canViewFinances = isAdmin || isManager;
        const canViewReports = isAdmin || isManager;

        // Tabs principales para cada rol
        const isFinance = session?.role === 'finance';
        const mainTabs = isGroomer ? [
          { id: 'home',     icon: '🏠', label: 'Home' },
          { id: 'appointments',    icon: '🗓️', label: 'Today' },
          { id: 'registro', icon: '⛽', label: 'Expenses' },
          { id: 'inventory', icon: '📦', label: 'Supplies' },
          { id: 'breeds',    icon: '🐾', label: 'Breeds' },
        ] : isFinance ? [
          { id: 'week',         icon: '📈', label: 'Reports' },
          { id: 'payroll',      icon: '💸', label: 'Payroll' },
          { id: 'gastos-company', icon: '💼', label: 'Expenses' },
          { id: 'close-review', icon: '💰', label: 'Close' },
          { id: 'dashboard',    icon: '📊', label: 'Dashboard' },
        ] : isViewer ? [
          { id: 'appointments', icon: '🗓️', label: 'Schedule' },
          { id: 'payroll',      icon: '💸', label: 'Payroll' },
          { id: 'week',         icon: '📈', label: 'Reports' },
        ] : [
          { id: 'home',         icon: '🏠', label: 'Home' },
          { id: 'appointments', icon: '🗓️', label: 'Schedule' },
          { id: 'clients',      icon: '👥', label: 'Clients' },
          { id: 'messages',     icon: '💬', label: 'Messages' },
          { id: 'more',         icon: '⋯', label: 'More' },
        ];

        return (
          <nav style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff', borderTop: '1px solid #e2e8f0',
            display: 'flex', zIndex: 1000,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          }}>
            {mainTabs.map(t => {
              const active = tab === t.id;
              // Count pending_review appointments for badge
              const pendingCount = t.id === 'appointments' && !isGroomer
                ? appointments.filter(a => a.status === 'pending_review').length
                : t.id === 'close-review'
                ? appointments.filter(a => a.status === 'admin_review').length
                : t.id === 'messages'
                ? 0 // will be updated by MessagesTab
                : t.id === 'requests'
                ? bookingRequests.filter(r => r.status === 'pending').length
                : 0;
              return (
                <button key={t.id} onClick={() => setTab(t.id === 'more' ? 'cierre' : t.id)}
                  style={{
                    flex: 1, padding: '10px 4px 8px', border: 'none', background: 'none',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 3,
                    color: active ? '#0f766e' : '#94a3b8',
                    borderTop: `2px solid ${active ? '#0f766e' : 'transparent'}`,
                    transition: 'all 0.15s', position: 'relative',
                  }}>
                  <span style={{ fontSize: 22, position: 'relative' }}>
                    {t.icon}
                    {pendingCount > 0 && (
                      <span style={{
                        position: 'absolute', top: -4, right: -8,
                        background: '#dc2626', color: '#fff',
                        borderRadius: '50%', width: 18, height: 18,
                        fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #fff',
                      }}>{pendingCount}</span>
                    )}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{t.label}</span>
                </button>
              );
            })}
          </nav>
        );
      })()}

      <div style={{ height: 80 }} />
    </div>
    </ModulesProvider>
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

        {/* Header company */}
        <div style={{ background: invoice.companyId === 'epw' ? '#0f766e' : '#7c3aed', padding: '24px 28px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 6 }}>{company.logoEmoji}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700 }}>{company.name} LLC</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Invoice #{invoice.invoiceNumber}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Miami, FL</div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* Info appointment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 16, fontSize: 13 }}>
            <div style={{ color: '#64748b' }}>Date</div>
            <div style={{ fontWeight: 500 }}>{formattedDate}</div>
            <div style={{ color: '#64748b' }}>Client</div>
            <div style={{ fontWeight: 500 }}>{invoice.clientName}</div>
            {invoice.clientAddress && <>
              <div style={{ color: '#64748b' }}>Address</div>
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
            {invoice.cardFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7c3aed', marginBottom: 6 }}>
                <span>Fee tarjeta (5.5%)</span><span>${invoice.cardFee?.toFixed(2)}</span>
              </div>
            )}
            {invoice.tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                <span>Tip</span><span>${invoice.tip?.toFixed(2)}</span>
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
            ✕ Close
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

        {/* Info appointment */}
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
            <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Firma del client</label>
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
            Al firmar, el client acepta todos los términos del acuerdo de service
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '2px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569' }}>
            Cancel
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


// Viewer users (company-specific, read-only)
const VIEWER_USERS = [
  { id: 'viewer-epw', name: 'Mariam', username: 'Mariam', pin: '6501', role: 'finance', companyId: 'epw',
    permissions: { can_create_clients: false, can_view_clients: true, can_schedule: false, can_view_all_schedule: true, can_view_finances: false, can_view_reports: true, can_edit_config: false } },
  { id: 'viewer-atw', name: 'Melissa', username: 'Melissa', pin: '2026', role: 'finance', companyId: 'atw',
    permissions: { can_create_clients: false, can_view_clients: true, can_schedule: false, can_view_all_schedule: true, can_view_finances: false, can_view_reports: true, can_edit_config: false } },
];

function LoginScreen({ users, vans, groomers: groomersList, companies, onLogin, loadingUsers }) {
  const [userInput, setUserInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('input'); // input | pin | password
  const [matchedUser, setMatchedUser] = useState(null);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const groomers = (groomersList && groomersList.length > 0)
    ? groomersList.filter(g => g.active !== false).map(g => ({
        id: g.id, name: g.name, pin: String(g.pin), role: 'groomer',
        van_id: g.vanId, vanId: g.vanId, commissionPct: g.commissionPct,
        companyId: g.companyId || 'epw',
      }))
    : users.filter(u => u.role === 'groomer');

  const shake = () => {
    setShaking(true);
    setError('Incorrect — try again');
    setTimeout(() => { setPinInput(''); setError(''); setShaking(false); }, 700);
  };

  const handleUserInput = (val) => {
    setUserInput(val);
    setError('');
  };

  const handleNext = () => {
    const val = userInput.trim();
    if (!val) { setError('Please enter your username'); return; }

    // Check if email → admin/manager login
    if (val.includes('@')) {
      setStep('password');
      return;
    }

    // Check if groomer PIN (4 digits)
    if (/^\d{4}$/.test(val)) {
      const groomer = groomers.find(g => g.pin === val);
      if (groomer) {
        onLogin({
          userId: groomer.id, userName: groomer.name, role: 'groomer',
          vanId: groomer.vanId, commissionPct: groomer.commissionPct,
          companyId: groomer.companyId || 'epw',
          permissions: { can_create_clients: true, can_view_clients: false, can_schedule: true, can_view_all_schedule: false, can_view_finances: false, can_view_reports: false, can_edit_config: false }
        });
        return;
      } else {
        setError('PIN not found');
        return;
      }
    }

    // Check viewer users by username
    const viewer = VIEWER_USERS.find(v => v.username.toLowerCase() === val.toLowerCase());
    if (viewer) {
      setMatchedUser(viewer);
      setStep('pin');
      setPinInput('');
      return;
    }

    // Check groomers by name
    const groomerByName = groomers.find(g => g.name.toLowerCase() === val.toLowerCase());
    if (groomerByName) {
      setMatchedUser(groomerByName);
      setStep('pin');
      setPinInput('');
      return;
    }

    // Check admin by name
    const adminUser = users.find(u => u.name.toLowerCase() === val.toLowerCase() && (u.role === 'admin' || u.role === 'manager'));
    if (adminUser) { setMatchedUser({...adminUser, pin: String(adminUser.pin)}); setStep('pin'); setPinInput(''); return; }
    setError('User not found');
  };

  const handleDigit = (d) => {
    if (pinInput.length >= 4) return;
    const newPin = pinInput + d;
    setPinInput(newPin); setError('');
    if (newPin.length === 4) setTimeout(() => {
      if (!matchedUser) { shake(); return; }
      const expectedPin = String(matchedUser.pin);
      if (newPin === expectedPin) {
        const isGroomerUser = matchedUser.role === 'groomer';
        onLogin({
          userId: matchedUser.id, userName: matchedUser.name,
          role: matchedUser.role,
          vanId: matchedUser.vanId || matchedUser.van_id || null,
          commissionPct: matchedUser.commissionPct || 0,
          companyId: matchedUser.companyId || 'epw',
          permissions: matchedUser.permissions || (isGroomerUser ? {
            can_create_clients: true, can_view_clients: false, can_schedule: true,
            can_view_all_schedule: false, can_view_finances: false,
            can_view_reports: false, can_edit_config: false
          } : {})
        });
      } else { shake(); }
    }, 150);
  };

  const handleEmailLogin = async () => {
    if (!userInput || !password) { setError('Enter email and password'); return; }
    setLoggingIn(true); setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: userInput, password });
      if (authError) { setError('Invalid email or password'); setLoggingIn(false); return; }
      const { data: appUser } = await supabase.from('app_users').select('*').eq('id', data.user.id).single();
      if (!appUser) { setError('User not configured'); setLoggingIn(false); return; }
      onLogin({
        userId: data.user.id, userName: appUser.name, role: appUser.role,
        vanId: null, commissionPct: 0, companyId: 'epw',
        permissions: {
          can_create_clients: true, can_view_clients: true, can_schedule: true,
          can_view_all_schedule: true, can_view_finances: appUser.role === 'admin',
          can_view_reports: true, can_edit_config: appUser.role === 'admin',
        }
      });
    } catch (err) { setError('Connection error'); }
    setLoggingIn(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, overflow: 'hidden', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <img src="/Raykota.jpg" alt="Raykota" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 800, color: '#fff' }}>Raykota</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
          {step === 'input' ? 'Enter your username or PIN' : step === 'password' ? 'Enter your password' : 'Enter your PIN'}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: '28px 24px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}
        className={shaking ? 'shake' : ''}>

        {/* STEP 1: Username / email / PIN input */}
        {step === 'input' && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Username or PIN</label>
            <input
              type="text"
              value={userInput}
              onChange={e => handleUserInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="Enter your username, email or 4-digit PIN"
              autoComplete="off"
              autoCapitalize="off"
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 16, boxSizing: 'border-box', outline: 'none', letterSpacing: userInput.match(/^\d+$/) ? '0.3em' : 'normal' }}
            />
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{error}</div>}
            <button onClick={handleNext}
              style={{ width: '100%', marginTop: 14, padding: '14px', background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2a: PIN pad */}
        {step === 'pin' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>Welcome</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Enter your 4-digit PIN</div>
            </div>
            {/* PIN dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < pinInput.length ? '#0f766e' : '#e2e8f0', transition: 'background 0.15s' }} />
              ))}
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</div>}
            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d, i) => (
                <button key={i} onClick={() => {
                  if (d === '') return;
                  if (d === '⌫') { setPinInput(p => p.slice(0,-1)); return; }
                  handleDigit(String(d));
                }}
                  style={{ padding: '16px', fontSize: d === '⌫' ? 20 : 22, fontWeight: 600, background: d === '' ? 'transparent' : '#f8fafc', border: d === '' ? 'none' : '1.5px solid #e2e8f0', borderRadius: 12, cursor: d === '' ? 'default' : 'pointer', color: '#0f172a' }}>
                  {d}
                </button>
              ))}
            </div>
            <button onClick={() => { setStep('input'); setMatchedUser(null); setPinInput(''); setError(''); }}
              style={{ width: '100%', marginTop: 14, padding: '12px', background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>
              ← Back
            </button>
          </div>
        )}

        {/* STEP 2b: Password */}
        {step === 'password' && (
          <div>
            <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f0fdfa', borderRadius: 10, fontSize: 13, color: '#0f766e', fontWeight: 600 }}>
              📧 {userInput}
            </div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 44px 14px 16px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }} />
              <button onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{error}</div>}
            <button onClick={handleEmailLogin} disabled={loggingIn}
              style={{ width: '100%', marginTop: 14, padding: '14px', background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              {loggingIn ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign In →'}
            </button>
            <button onClick={() => { setStep('input'); setPassword(''); setError(''); }}
              style={{ width: '100%', marginTop: 10, padding: '12px', background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>
              ← Back
            </button><button onClick={async () => {
              if (!userInput || !userInput.includes('@')) { setError('Enter your email first'); return; }
              const { error } = await supabase.auth.resetPasswordForEmail(userInput, { redirectTo: window.location.origin });
              if (error) { setError('Error: ' + error.message); return; }
              alert('✅ Check your email for a password reset link!');
            }} style={{ width: '100%', marginTop: 4, padding: '10px', background: 'none', border: 'none', color: '#0f766e', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              Forgot password?
            </button>
            
          </div>
        )}
      </div>
    </div>
  );
}

function HomeTab({ session, appointments, vans, clients, pets, settings, setTab, groomers }) {
  const isGroomer = session?.role === 'groomer';
  const isAdmin = session?.role === 'admin';
  const today = todayISO();

  // Appointments de today
  const todayAppts = useMemo(() => {
    if (isGroomer) {
      return appointments.filter(a => a.date === today && a.vanId === session?.vanId && a.status !== 'cancelled');
    }
    return appointments.filter(a => a.date === today && a.status !== 'cancelled');
  }, [appointments, today, session?.vanId]);

  const completedToday = todayAppts.filter(a => a.status === 'completed').length;
  const pendingToday = todayAppts.filter(a => a.status !== 'completed').length;
  const revenueToday = todayAppts.filter(a => a.status === 'completed').reduce((s, a) => s + (a.pets || []).reduce((ps, p) => ps + (p.amount || 0), 0), 0);
  const firstAppt = todayAppts.filter(a => a.status !== 'completed').sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''))[0];

  // Hora del day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';

  // Day de la week
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Frases motivadoras por rol
  const motivations = isGroomer ? [
    "Every pet deserves the best — and you deliver it! 🐾",
    "You make tails wag every single day! 🐕",
    "Another great day to make pets beautiful! ✨",
    "Your passion makes all the difference! 💚",
    "Ready to create happy pets and happy clients! 🎉",
  ] : [
    "Your team is ready — let's have a great day! 🚐",
    "Another day to build something amazing! 🐾",
    "Lead the way — your team looks up to you! 👑",
    "Great days start with great leadership! 🌟",
    "Let's make today count! 💪",
  ];
  const motivation = motivations[new Date().getDate() % motivations.length];

  const van = vans.find(v => v.id === session?.vanId);
  const company = DEFAULT_COMPANIES.find(c => c.id === van?.companyId);

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Greeting card */}
      <div style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)', borderRadius: 20, padding: '24px 20px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 80, opacity: 0.15 }}>🐾</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 4 }}>{greetingEmoji} {dayName}</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          {greeting}, {session?.userName}!
        </div>
        {isGroomer && van && (
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 12 }}>
            🚐 {van.name} · {company?.logoEmoji} {company?.name}
          </div>
        )}
        <div style={{ fontSize: 13, opacity: 0.9, fontStyle: 'italic' }}>{motivation}</div>
      </div>

      {/* Stats del day */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f766e', fontFamily: 'Fraunces, serif' }}>{todayAppts.length}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Appointments today</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{completedToday} done · {pendingToday} pending</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f766e', fontFamily: 'Fraunces, serif' }}>${revenueToday.toFixed(0)}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Revenue today</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Completed services</div>
        </div>
      </div>

      {/* Próxima appointment */}
      {firstAppt && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1.5px solid #0f766e', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>⏰ Next appointment</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>🐾 {firstAppt.client?.name || 'Client'}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {firstAppt.timeStart} · {firstAppt.pets?.map(p => p.pet?.name || p.petName).filter(Boolean).join(', ') || 'Pet'}
              </div>
              <div style={{ fontSize: 12, color: '#0f766e', marginTop: 2 }}>
                📍 {firstAppt.address || firstAppt.client?.address || ''}
              </div>
            </div>
            <button onClick={() => setTab('appointments')}
              style={{ background: '#0f766e', border: 'none', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              View →
            </button>
          </div>
        </div>
      )}

      {todayAppts.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>No appointments today!</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Enjoy your day off.</div>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { icon: '🗓️', label: 'My Schedule', tab: 'appointments' },
          { icon: '👥', label: 'Clients', tab: 'clients', hide: isGroomer },
          { icon: '💰', label: 'Daily Close', tab: 'cierre' },
          { icon: '⛽', label: 'Gas Log', tab: 'registro' },
          { icon: '📦', label: 'Inventory', tab: 'inventory' },
          { icon: '📊', label: 'Dashboard', tab: 'dashboard', hide: !isAdmin },
        ].filter(a => !a.hide).slice(0, 4).map(action => (
          <button key={action.tab} onClick={() => setTab(action.tab)}
            style={{ padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>{action.icon}</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== VAN TRACKER TAB =====
// ===== ROUTE MAP COMPONENT =====
function RouteMap({ addresses, apiKey, appointments = [] }) {
  const BASE = '6501 Plantation Rd, Plantation, FL 33317';
  const [orderedAddrs, setOrderedAddrs] = React.useState(addresses);
  const [driveTimes, setDriveTimes] = React.useState([]);
  const [optimizing, setOptimizing] = React.useState(false);
  const [optimized, setOptimized] = React.useState(false);

  const all = [BASE, ...orderedAddrs];
  const origin = encodeURIComponent(BASE);
  const dest = encodeURIComponent(orderedAddrs[orderedAddrs.length - 1]);
  const waypoints = orderedAddrs.slice(0, -1).map(a => encodeURIComponent(a)).join('|');
  const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}&mode=driving`;
  const mapsUrl = `https://www.google.com/maps/dir/${all.map(a => encodeURIComponent(a)).join('/')}`;

  // Fetch drive times between stops
  const fetchDriveTimes = React.useCallback(async (addrs) => {
    if (!window.google?.maps) return;
    const service = new window.google.maps.DistanceMatrixService();
    const stops = [BASE, ...addrs];
    const times = [];
    for (let i = 0; i < stops.length - 1; i++) {
      try {
        const result = await new Promise((res, rej) => {
          service.getDistanceMatrix({
            origins: [stops[i]],
            destinations: [stops[i + 1]],
            travelMode: window.google.maps.TravelMode.DRIVING,
          }, (r, s) => s === 'OK' ? res(r) : rej(s));
        });
        const el = result.rows[0].elements[0];
        times.push({ duration: el.duration?.text || '', distance: el.distance?.text || '' });
      } catch { times.push({ duration: '', distance: '' }); }
    }
    setDriveTimes(times);
  }, []);

  useEffect(() => {
    const wait = setInterval(() => {
      if (window.google?.maps) { clearInterval(wait); fetchDriveTimes(orderedAddrs); }
    }, 300);
    return () => clearInterval(wait);
  }, []);

  const handleOptimize = async () => {
    if (!window.google?.maps) return;
    setOptimizing(true);
    try {
      const service = new window.google.maps.DirectionsService();
      const result = await new Promise((res, rej) => {
        service.route({
          origin: BASE,
          destination: orderedAddrs[orderedAddrs.length - 1],
          waypoints: orderedAddrs.slice(0, -1).map(a => ({ location: a, stopover: true })),
          optimizeWaypoints: true,
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (r, s) => s === 'OK' ? res(r) : rej(s));
      });
      const order = result.routes[0].waypoint_order;
      const middle = orderedAddrs.slice(0, -1);
      const last = orderedAddrs[orderedAddrs.length - 1];
      const reordered = [...order.map(i => middle[i]), last];
      setOrderedAddrs(reordered);
      setOptimized(true);
      await fetchDriveTimes(reordered);
    } catch(e) { console.warn('Optimize error', e); }
    setOptimizing(false);
  };

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 16, marginTop: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          🗺️ Route · {orderedAddrs.length} stops
          {optimized && <span style={{ marginLeft: 8, background: '#f0fdfa', color: '#0f766e', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>⚡ Optimized</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleOptimize} disabled={optimizing}
            style={{ padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${optimized ? '#0f766e' : '#e2e8f0'}`, background: optimized ? '#f0fdfa' : '#fff', color: optimized ? '#0f766e' : '#64748b', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            {optimizing ? '...' : optimized ? '✅ Optimized!' : '⚡ Optimize Route'}
          </button>
          <button onClick={() => window.open(mapsUrl, '_blank')}
            style={{ padding: '6px 12px', borderRadius: 20, border: '1.5px solid #1a73e8', background: '#fff', color: '#1a73e8', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            📍 Navigate
          </button>
        </div>
      </div>

      {/* Drive time between stops */}
      {driveTimes.length > 0 && (
        <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {driveTimes.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {i === 0 && <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>🏠 Base</span>}
              {i > 0 && <span style={{ fontSize: 11, color: '#64748b' }}>Stop {i}</span>}
              <span style={{ fontSize: 11, color: '#94a3b8' }}>→</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', background: '#f0fdfa', borderRadius: 20, padding: '2px 8px' }}>
                🚗 {t.duration} · {t.distance}
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>Stop {driveTimes.length}</span>
          </div>
        </div>
      )}

      {/* Map */}
      <iframe
        title="Route Map"
        width="100%"
        height="360"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
      />
    </div>
  );
}

function VanTrackerTab({ vans, vanLocations, groomers }) {
  const activeVans = vans.filter(v => v.active !== false);
  const cardStyle = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Tracking</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>📍 Van Tracker</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Updates every 30s · Groomers must have app open</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeVans.map(van => {
          const loc = vanLocations.find(l => l.van_id === van.id);
          const groomer = groomers.find(g => g.vanId === van.id);
          const company = DEFAULT_COMPANIES.find(c => c.id === van.companyId);
          const minsAgo = loc ? Math.round((Date.now() - new Date(loc.timestamp)) / 60000) : null;
          const isVanOnline = loc && minsAgo <= 10;
          return (
            <div key={van.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: isVanOnline ? '#0f766e' : '#e2e8f0', boxShadow: isVanOnline ? '0 0 8px #0f766e80' : 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>🚐 {van.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {company?.logoEmoji} {company?.name} · {groomer?.name || 'No groomer'}
                </div>
                {isVanOnline && loc && (
                  <div style={{ fontSize: 11, color: '#0f766e', marginTop: 4 }}>
                    📍 {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {isVanOnline ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', padding: '3px 8px', background: '#f0fdfa', borderRadius: 999, marginBottom: 6 }}>
                      🟢 {minsAgo === 0 ? 'Just now' : `${minsAgo}m ago`}
                    </div>
                    <a href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`} target="_blank" rel="noreferrer"
                      style={{ display: 'block', fontSize: 12, color: '#fff', background: '#0f766e', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                      Open Maps 🗺️
                    </a>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: '#94a3b8', padding: '3px 8px', background: '#f8fafc', borderRadius: 999 }}>⚫ Offline</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {vanLocations.length > 0 && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdfa', borderRadius: 12, border: '1px solid #ccfbf1' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f766e', marginBottom: 8 }}>
            🟢 {vanLocations.filter(l => Math.round((Date.now() - new Date(l.timestamp)) / 60000) <= 10).length} van(s) active right now
          </div>
          <a href={`https://www.google.com/maps/dir/${vanLocations.map(l => `${l.latitude},${l.longitude}`).join('/')}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: '#0f766e', textDecoration: 'none', fontWeight: 600 }}>
            📍 See all vans on Google Maps →
          </a>
        </div>
      )}
    </div>
  );
}

// ===== HEADER =====
// ===== HEADER =====
function Header({ tab, setTab, session, currentVan, canViewFinances, canViewReports, canEditConfig, onLogout, activeCompany, onLanguageChange, isOnline = true }) {
  const isFinance = session?.role === 'finance';
  const { isEnabled } = useModulesContext();
  const isAdmin = session?.role === 'admin';
  const isManager = session?.role === 'manager';
  const isGroomer = session?.role === 'groomer';
  const isViewer = session?.role === 'viewer';
  const lang = 'en';
  const t = useT(lang);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allTabs = [
    { id: 'home',           label: 'Home',              icon: '🏠', show: !isFinance },
    { id: 'appointments',   label: 'Schedule',          icon: '🗓️', show: !isFinance },
    { id: 'clients',        label: 'Clients',           icon: '👥', show: (isAdmin || isManager) && !isFinance },
    { id: 'smart-fill',     label: 'Smart Fill',        icon: '💡', show: (isAdmin || isManager) && !isFinance },
    { id: 'boarding',       label: 'Boarding',          icon: '🏠', show: (isAdmin || isManager) && !isFinance && isEnabled('boarding') },
    { id: 'van-tracker',    label: 'Van Tracker',       icon: '📍', show: (isAdmin || isManager) && !isFinance && isEnabled('gps_routes') },
    { id: 'messages',       label: 'Messages',          icon: '💬', show: (isAdmin || isManager) && !isFinance },
    { id: 'requests',       label: 'Booking Requests',  icon: '📩', show: (isAdmin || isManager) && !isFinance },
    { id: 'divider1',       label: '── Finance ──',     icon: '',   show: (isAdmin || isManager || isFinance) && !isGroomer, divider: true },
    { id: 'close-review',   label: 'Close Review',      icon: '💰', show: isAdmin || isFinance },
    { id: 'payroll',        label: 'Payroll',           icon: '💸', show: (isAdmin || isViewer || isFinance) && isEnabled('payroll') },
    { id: 'gastos-company', label: 'Expenses',          icon: '💼', show: isAdmin || isFinance },
    { id: 'week',           label: 'Weekly Report',     icon: '📈', show: isAdmin || isManager || isViewer || isFinance },
    { id: 'dashboard',      label: 'Dashboard',         icon: '📊', show: isAdmin || isFinance },
    { id: 'divider2',       label: '── Operations ──',  icon: '',   show: (isAdmin || isManager) && !isFinance, divider: true },
    { id: 'registro',       label: 'Daily Log',         icon: '⛽', show: !isViewer && !isFinance },
    { id: 'cierre',         label: isGroomer ? 'My Close' : 'Daily Close', icon: '🔒', show: !isViewer && !isFinance },
    { id: 'inventory',      label: 'Inventory',         icon: '📦', show: !isViewer && !isFinance && isEnabled('inventory') },
    { id: 'divider3',       label: '── Admin ──',       icon: '',   show: isAdmin && !isFinance, divider: true },
    { id: 'breeds',         label: 'AI Breeds',         icon: '🐾', show: !isViewer && !isFinance },
    { id: 'auditoria',      label: 'Audit Log',         icon: '🔍', show: isAdmin && isEnabled('audit') },
    { id: 'config',         label: 'Settings',          icon: '⚙️', show: isAdmin || isManager },
  ].filter(t => t.show);

  const roleColors = { admin: '#0f172a', manager: '#7c3aed', groomer: '#0f766e', viewer: '#b45309', finance: '#0369a1' };
  const roleLabels = { admin: 'Admin', manager: 'Manager', groomer: 'Groomer', viewer: 'Viewer', finance: 'Finance' };

  const handleTabClick = (id) => {
    setTab(id);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* TOP BAR — minimalista */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 900,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Hamburger */}
        <button onClick={() => setDrawerOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 8, color: '#0f172a', fontSize: 22, lineHeight: 1 }}>
          ☰
        </button>

        {/* Logo */}
        <img src="/Raykota.jpg" alt="Raykota" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />

        {/* Título */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, color: '#0f172a', lineHeight: 1.2 }}>Raykota</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            {isGroomer ? `${currentVan?.name || ''} · ${session?.userName}` : (activeCompany?.name || 'Group Guerrero Orejarena')}
          </div>
        </div>

        {/* User badge + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: (roleColors[session?.role] || '#64748b') + '15', color: roleColors[session?.role] || '#64748b', fontWeight: 600 }}>
            {session?.userName}
          </div>
          <button onClick={onLogout} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#dc2626' }}>
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* OFFLINE BANNER */}
      {!isOnline && (
        <div style={{ background: '#f59e0b', color: '#fff', textAlign: 'center', padding: '6px 16px', fontSize: 13, fontWeight: 700, position: 'sticky', top: 53, zIndex: 899 }}>
          📵 Offline — Showing cached data
        </div>
      )}

      {/* DRAWER OVERLAY */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>

          {/* DRAWER PANEL */}
          <div onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 280,
              background: '#fff', boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>

            {/* Drawer header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #0f766e, #134e4a)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/Raykota.jpg" alt="Raykota" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }} />
                <div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: 20, color: '#fff' }}>Raykota</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{roleLabels[session?.role] || ''} · {session?.userName}</div>
                </div>
              </div>
            </div>

            {/* Tabs list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {allTabs.map(t => {
                if (t.divider) return (
                  <div key={t.id} style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.label}</div>
                );
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => handleTabClick(t.id)}
                    style={{
                      width: '100%', padding: '13px 20px', border: 'none', textAlign: 'left',
                      background: active ? '#f0fdfa' : 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14,
                      borderLeft: `3px solid ${active ? '#0f766e' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{t.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: active ? 700 : 400, color: active ? '#0f766e' : '#374151' }}>{t.label}</span>
                    {active && <span style={{ marginLeft: 'auto', color: '#0f766e', fontSize: 18 }}>›</span>}
                  </button>
                );
              })}
            </div>

            {/* Logout */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={onLogout}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #fecaca', borderRadius: 10, background: '#fef2f2', cursor: 'pointer', color: '#dc2626', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [expenseForm, setExpenseForm] = useState({ category: categories[0] || 'Gas', description: '', amount: '', method: 'cash', odometer: '', station: '' });
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

  // Calcular totales del service con fees
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
    if (!form.client.trim() || !form.amount) { alert('Completa al menos client y monto'); return; }
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
    setEditingId(s.id); setActiveSection('services');
  };

  const handleDelete = (id) => {
    if (confirm('¿Delete este service?')) {
      removeService(id);
      if (editingId === id) { setEditingId(null); setForm({ client: '', pet: '', service: '', method: 'Cash', amount: '', tip: '' }); }
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.amount) { alert('Ingresa el monto del gasto'); return; }
    if (expenseForm.category === 'Gas' && !expenseForm.odometer) { alert('Ingresa el odómetro'); return; }
    setUploadingReceipt(true);

    // Descripción automática para gas
    const description = expenseForm.category === 'Gas'
      ? `Odómetro: ${expenseForm.odometer} mi${expenseForm.station ? ' · ' + expenseForm.station : ''}`
      : expenseForm.description.trim();

    const expenseId = uid();
    await addExpense(
      { id: expenseId, date, vanId, category: expenseForm.category, description, amount: parseFloat(expenseForm.amount) || 0, createdAt: Date.now() },
      receiptFile
    );

    // Si es gas → también guardar en fuel_logs
    if (expenseForm.category === 'Gas' && expenseForm.odometer) {
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

    setExpenseForm({ category: categories[0] || 'Gas', description: '', amount: '', method: 'cash', odometer: '', station: '' });
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
      <SectionTitle eyebrow="Daily Log del day" title={formatDateNice(todayISO())} />

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
                <label style={styles.lbl}>Category</label>
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
                  <option value="tarjeta-company">💳 Tarjeta company</option>
                </select>
              </div>

              {/* Campos extra solo para gas */}
              {expenseForm.category === 'Gas' && (
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

              {/* Descripción para otras categorys */}
              {expenseForm.category !== 'Gas' && (
                <div>
                  <label style={styles.lbl}>Descripción (opcional)</label>
                  <input value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} style={styles.input} placeholder="Ej: Shampoo desodorizante" />
                </div>
              )}

              <div>
                <label style={styles.lbl}>📷 Foto de invoice (opcional)</label>
                <input type="file" accept="image/*" capture="environment" onChange={handleReceiptChange}
                  style={{ ...styles.input, padding: '7px 12px', fontSize: 13 }} />
              </div>
            </div>

            {/* Preview de la foto */}
            {receiptPreview && (
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={receiptPreview} alt="Invoice" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
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
              <img src={viewingReceipt} alt="Invoice" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: 20, right: 20, color: '#fff', fontSize: 13, fontWeight: 600 }}>Toca para close</div>
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
                <p style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>Agrega gas, materiales u otros gastos del day</p>
              </div>
            ) : (
              <div style={styles.card}>
                {dayExpenses.map(e => (
                  <div key={e.id} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Miniatura de invoice */}
                      {e.receiptUrl ? (
                        <img src={e.receiptUrl} alt="Invoice" onClick={() => setViewingReceipt(e.receiptUrl)}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 18 }}>🧾</span>
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.category}</div>
                        {e.description && <div style={{ fontSize: 12, color: '#64748b' }}>{e.description}</div>}
                        {e.receiptUrl && <div style={{ fontSize: 10, color: '#0f766e', fontWeight: 600 }}>📷 Invoice adjunta</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>{fmt(e.amount)}</span>
                      {isAdmin && <button onClick={() => { if (confirm('¿Delete este gasto?')) removeExpense(e.id); }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>}
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
                  Client *
                  {knownClients.length > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 10, color: '#0f766e', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                      · {knownClients.length} guardado{knownClients.length === 1 ? '' : 's'}
                    </span>
                  )}
                </label>
                <input value={form.client} onChange={e => { setForm({ ...form, client: e.target.value }); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  style={styles.input} placeholder="Name del client" autoComplete="off" />
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
                <label style={styles.lbl}>Pet</label>
                <input value={form.pet} onChange={e => setForm({ ...form, pet: e.target.value })} style={styles.input} placeholder="Name y breed" />
              </div>
              <div>
                <label style={styles.lbl}>Service</label>
                <input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={styles.input} placeholder="Ej: Full Groom" />
              </div>
              <div>
                <label style={styles.lbl}>Método de pago</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} style={styles.input}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.lbl}>Amount del service *</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={styles.input} placeholder="0.00" />
              </div>
              <div>
                <label style={styles.lbl}>Tip (opcional)</label>
                <input type="number" step="0.01" value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value })} style={styles.input} placeholder="0.00" />
              </div>
            </div>

            {/* Resumen de cobro */}
            {(form.amount || form.tip) && (
              <div style={{ marginTop: 14, padding: 14, background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Total al client</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {form.amount && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}><span>Service</span><span>{fmt(form.amount)}</span></div>}
                  {form.tip && parseFloat(form.tip) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}><span>Tip</span><span>{fmt(form.tip)}</span></div>}
                  {currentCalc.cardFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7c3aed' }}><span>Fee tarjeta ({settings?.cardFeePct || 5.5}%)</span><span>{fmt(currentCalc.cardFee)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569' }}><span>Fee gas</span><span>{fmt(currentCalc.gasFee)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#0f172a', paddingTop: 6, borderTop: '1px solid #ccfbf1', marginTop: 2 }}><span>TOTAL</span><span>{fmt(currentCalc.total)}</span></div>
                </div>
              </div>
            )}

            <div style={styles.formActions}>
              {editingId && (
                <button onClick={() => { setEditingId(null); setForm({ client: '', pet: '', service: '', method: 'Cash', amount: '', tip: '' }); }} style={styles.btnSecondary}>
                  <X size={15} /> Cancel
                </button>
              )}
              <button onClick={handleSubmit} style={styles.btnPrimary}>
                {editingId ? <><Check size={15} /> Save cambios</> : <><Plus size={15} /> Add service</>}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <SectionTitle
              eyebrow={`${currentVan?.name || 'Van'} · ${formatDateNice(date)}`}
              title={`${dayServices.length} service${dayServices.length === 1 ? '' : 's'} registrado${dayServices.length === 1 ? '' : 's'}`}
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
                <p style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>Agrega el primer service del day arriba</p>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Client</th>
                        <th style={styles.th}>Pet</th>
                        <th style={styles.th}>Service</th>
                        <th style={styles.th}>Pago</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Tip</th>
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
const STATUS_COLORS = { unconfirmed: { bg: '#FAEEDA', text: '#633806', border: '#BA7517' }, confirmed: { bg: '#EAF3DE', text: '#27500A', border: '#3B6D11' }, in_progress: { bg: '#E6F1FB', text: '#0C447C', border: '#185FA5' }, completed: { bg: '#F1EFE8', text: '#5F5E5A', border: '#888780' }, cancelled: { bg: '#FCEBEB', text: '#791F1F', border: '#A32D2D' }, pending_review: { bg: '#fdf2f8', text: '#86198f', border: '#d946ef' }, admin_review: { bg: '#fff7ed', text: '#9a3412', border: '#f97316' } };
const STATUS_LABELS = { unconfirmed: 'Unconfirmed', confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', pending_review: '🔔 Needs Review', admin_review: '⏳ Pending Admin Review' };

function AppointmentsTab({ appointments, vans, clients, pets, session, settings, isAdmin, canViewAllSchedule, updateApptStatus, addAppointment, addClient, addPet, refreshAppointments, deleteAppt, servicePrices, deposits = [], setDeposits = () => {}, groomers = [] }) {
  const t = useT('en');
  const STATUS_LABELS = getStatusLabels(t);
  const { isEnabled } = useModulesContext();
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
  const [newApptForm, setNewApptForm] = useState({ clientId: '', vanId: session?.vanId || vans[0]?.id || '', companyId: vans[0]?.companyId || 'epw', groomerId: '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '', petIds: [], serviceId: '', serviceName: '', servicePrice: 0, discountPct: 0, addons: [], recurrenceWeeks: 0 });
  const [petServices, setPetServices] = useState({});
  const [apptClientPets, setApptClientPets] = useState([]); // pets del cliente seleccionado en new appt
  const [loadingApptPets, setLoadingApptPets] = useState(false);
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', address: '', email: '', zip: '', city: '', state: 'FL' });
  const [newPetForm, setNewPetForm] = useState({ name: '', breed: '', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', allergies: '' });
  const [addingPet, setAddingPet] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const [showCobroForm, setShowCobroForm] = useState(null);
  const [cobroForm, setCobroForm] = useState({ method: 'Cash', tip: '', step: 1 });
  const [viewMode, setViewMode] = useState(session?.role === 'admin' || session?.role === 'manager' ? 'week' : 'lista');
  const [selectedRutaVan, setSelectedRutaVan] = useState(null);
  const isViewer = session?.role === 'viewer';
  const viewerCompany = session?.companyId || null;
  const [filterVanId, setFilterVanId] = useState(isViewer ? viewerCompany : 'todos');
  const [showSignature, setShowSignature] = useState(null); // appt
  const [reasignando, setReasignando] = useState(null); // appt id
  const [editingPets, setEditingPets] = useState(null);
  const [editingApptInfo, setEditingApptInfo] = useState(null);
  const [editApptInfoForm, setEditApptInfoForm] = useState({});
  const [showCardPanel, setShowCardPanel] = useState(null);
  const [cardForm, setCardForm] = useState({ last4: '', brand: 'Visa', expMonth: '', expYear: '', nickname: '' });
  const [apptPhotos, setApptPhotos] = useState({}); // { apptId: [photos] }
  const [showPhotos, setShowPhotos] = useState(null); // appt id
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [reasignForm, setReasignForm] = useState({ vanId: '', groomerId: '' });
  const [expandedAppt, setExpandedAppt] = useState(null);
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
    // SMS: groomer on the way
    const appt = appointments.find(a => a.id === apptId);
    if (appt?.client?.phone) {
      const van = vans.find(v => v.id === appt.vanId);
      const companyId = van?.companyId || appt.companyId || 'epw';
      const petNames = (appt.pets || []).map(ap => ap.pet?.name).filter(Boolean).join(' & ');
      const msg = `Hi ${appt.client.name}! 🐾 Your groomer is on the way for ${petNames || 'your pet'}. Please have them ready. Thank you! — ${companyId === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}`;
      sendSMS(appt.client.phone, msg, companyId);
    }
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
    setCobroForm({ method: 'Cash', tip: '', step: 1 });
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
    // Square integration is handled via physical terminal — payment recorded manually

    // Si todos los services son Guarantee → gasFee = $0
    const isGuarantee = (appt.pets || []).every(ap =>
      (ap.service || '').toLowerCase().includes('guarantee') ||
      (ap.amount || 0) === 0
    );
    const gasFee = isGuarantee ? 0 : (settings?.gasFee || 7);

    // Calcular totales — gas fee es INTERNO (no se cobra al cliente)
    const subtotal = (appt.pets || []).reduce((sum, ap) => sum + (ap.amount || 0), 0);
    const cardFee = method === 'Credit Card' ? parseFloat(((subtotal + tip) * cardFeePct / 100).toFixed(2)) : 0;
    const total = subtotal + cardFee + tip; // Gas fee NO va al total del cliente

    // Guardar método de pago, tip y card fee en appointment_pets para que el admin pueda revisarlo
    for (const ap of (appt.pets || [])) {
      const apCardFee = method === 'Credit Card' ? parseFloat(((( ap.amount || 0) + tip) * cardFeePct / 100).toFixed(2)) : 0;
      await supabase.from('appointment_pets').update({
        method, tip, card_fee: apCardFee, status: 'pending_admin_review',
      }).eq('id', ap.id);
    }

    // Guardar payment info en el appointment para review del admin
    await supabase.from('appointments').update({
      payment_method: method,
      payment_tip: tip,
      payment_total: total,
      payment_card_fee: cardFee,
      payment_gas_fee: gasFee,
    }).eq('id', appt.id);

    // → Admin debe revisar y aprobar antes de que aparezca en reportes
    await updateApptStatus(appt.id, 'admin_review');
    await refreshAppointments();

    // SMS: service completed (se envía igual aunque esté pendiente de review)
    if (appt.client?.phone) {
      const petNames = (appt.pets || []).map(ap => ap.pet?.name).filter(Boolean).join(' & ');
      const smsMsg = `Hi ${appt.client.name}! 🐾 ${petNames || 'Your pet'} is ready and looking great! Total: $${total.toFixed(2)} (${method}). Thank you for choosing ${companyId === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}! 🐾`;
      sendSMS(appt.client.phone, smsMsg, companyId);
    }

    // Mostrar resumen al groomer
    const summaryInvoice = {
      id: uid(), invoiceNumber: '—', companyId,
      appointmentId: appt.id, clientId: appt.clientId,
      clientName: appt.client?.name || '',
      clientAddress: appt.client?.address || '',
      groomerName: session?.userName || van?.groomer || '',
      vanName: van?.name || '', date: appt.date,
      services: (appt.pets || []).map(ap => ({ petName: ap.pet?.name || 'Pet', service: ap.service || '', amount: ap.amount || 0 })),
      subtotal, gasFee, cardFee, tip, total, method,
    };

    // Guardar invoice en BD para que groomer y admin lo puedan ver
    const invoiceNumber = await getNextInvoiceNumber(companyId);
    const invoiceToSave = { ...summaryInvoice, invoiceNumber, status: 'pending_review' };
    await saveInvoice(invoiceToSave);
    setSaving(false);
    setShowCobroForm(null);
    setSelectedAppt(null);
    setShowInvoice({ ...invoiceToSave });
  };

  const handleSaveGrooming = async (apptId, petId) => {
    const hasData = groomingRecord.headTool || groomingRecord.bodyTool || groomingRecord.notes;
    if (!hasData) { alert('Completa al menos una área o agrega notes'); return; }
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

    // Save resumen completo de herramientas en el perfil de la pet
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
    if (!newClientForm.name.trim()) { alert('Ingresa el name del client'); return; }
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
    const addonsNamonth = (newApptForm.addons || []).map(id => (servicePrices || []).find(p => p.id === id)?.name).filter(Boolean).join(', ');
    const finalPrice = discountedPrice + addonsTotal;
    const van = vans.find(v => v.id === newApptForm.vanId);

    // Calcular descuento total y aplicarlo proporcionalmente por mascota
    const subtotalAllPets = newApptForm.petIds.reduce((sum, pid) => {
      const petSvc = petServices[String(pid)];
      return sum + (petSvc?.price || 0);
    }, 0);
    const discountValue = newApptForm.discountValue || 0;
    const discountType = newApptForm.discountType || '%';
    const totalDiscountAmt = discountValue > 0
      ? discountType === '%' ? subtotalAllPets * discountValue / 100 : discountValue
      : 0;
    const discountRatio = subtotalAllPets > 0 ? totalDiscountAmt / subtotalAllPets : 0;

    // Usar servicio por mascota (petServices) con descuento aplicado
    const petsList = newApptForm.petIds.length > 0
      ? newApptForm.petIds.map(pid => {
          const p = pets.find(pt => String(pt.id) === String(pid));
          const petSvc = petServices[String(pid)];
          const baseAmount = petSvc?.price || 0;
          const discountedAmount = parseFloat((baseAmount - baseAmount * discountRatio).toFixed(2));
          return {
            id: uid(), petId: String(pid),
            service: petSvc?.service || newApptForm.serviceName || '',
            amount: discountedAmount,
            tip: 0, cardFee: 0,
            method: 'Cash', status: 'pending',
            checkinTime: '', checkoutTime: '',
            pet: p ? { id: p.id, name: p.name, breed: p.breed, size: p.size, allergies: p.allergies, behavior_notes: p.behavior_notes } : null,
          };
        })
      : [];

    const appt = {
      id: uid(), date, timeStart: newApptForm.timeStart, timeEnd: newApptForm.timeEnd,
      vanId: newApptForm.vanId, clientId: newApptForm.clientId,
      groomerId: newApptForm.groomerId || null,
      companyId: newApptForm.companyId || van?.companyId || 'epw',
      status: isGroomer ? 'pending_review' : 'unconfirmed',
      // debug

      notes: `${newApptForm.serviceName ? `Service: ${newApptForm.serviceName}` : ''}${addonsNamonth ? ` + ${addonsNamonth}` : ''}${newApptForm.discountPct > 0 ? ` (${newApptForm.discountPct}% desc.)` : ''}${newApptForm.notes ? ` — ${newApptForm.notes}` : ''}`,
      alertNotes: newApptForm.alertNotes,
      agreementSigned: false,
      servicePrice: finalPrice,
      serviceName: newApptForm.serviceName,
      discountPct: newApptForm.discountPct,
      recurrenceWeeks: newApptForm.recurrenceWeeks || 0,
      client: clients.find(c => String(c.id) === String(newApptForm.clientId)) || null,
      pets: petsList,
    };
    await addAppointment(appt);
    for (const ap of appt.pets) {
      if (ap.petId || ap.service || ap.amount > 0) {
        await saveAppointmentPet({ ...ap, appointmentId: appt.id });
      }
    }
    // Auto-asignar empresa al cliente
    const apptCompanyId = newApptForm.companyId || van?.companyId || 'epw';
    const existingClient = clients.find(c => String(c.id) === String(newApptForm.clientId));
    if (existingClient) {
      const existingCompanies = existingClient.companies || [];
      if (!existingCompanies.includes(apptCompanyId)) {
        const updatedCompanies = [...existingCompanies, apptCompanyId];
        await supabase.from('clients').update({ companies: updatedCompanies }).eq('id', existingClient.id);
      }
    }

    // SMS: appointment confirmation (solo si no es pending_review y el client tiene phone)
    if (appt.status !== 'pending_review') {
      const client = clients.find(c => String(c.id) === String(newApptForm.clientId));
      if (client?.phone) {
        const petNames = petsList.map(ap => ap.pet?.name).filter(Boolean).join(' & ');
        const apptCompanyId = newApptForm.companyId || van?.companyId || 'epw';
        const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const confirmMsg = `Hi ${client.name}! ✅ Your grooming appointment is confirmed for ${dateFormatted} at ${newApptForm.timeStart}${petNames ? ` for ${petNames}` : ''}. Thank you! — ${apptCompanyId === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}`;
        sendSMS(client.phone, confirmMsg, apptCompanyId);
      }
    }

    setSaving(false);
    setShowNewAppt(false);
    setNewApptForm({ clientId: '', vanId: session?.vanId || vans[0]?.id || '', companyId: vans[0]?.companyId || 'epw', groomerId: '', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '', petIds: [], serviceId: '', serviceName: '', servicePrice: 0, discountPct: 0, addons: [], recurrenceWeeks: 0 });
    setPetServices({});
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
              <button onClick={() => setViewMode('week')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'week' ? 600 : 400, background: viewMode === 'week' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'week' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                📅 Week
              </button>
              <button onClick={() => setViewMode('month')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'month' ? 600 : 400, background: viewMode === 'month' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'month' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                🗓️ Month
              </button>
              <button onClick={() => setViewMode('calendario')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'calendario' ? 600 : 400, background: viewMode === 'calendario' ? 'var(--color-background-primary)' : 'transparent', color: viewMode === 'calendario' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                🚐 Vans
              </button>
              {(isAdmin || isGroomer) && (
                <button onClick={() => setViewMode('ruta')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'ruta' ? 600 : 400, background: viewMode === 'ruta' ? '#f0fdfa' : 'transparent', color: viewMode === 'ruta' ? '#0f766e' : 'var(--color-text-secondary)' }}>
                  🗺️ Ruta
                </button>
              )}
              {isAdmin && (
                <button onClick={() => setViewMode('recurrentes')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: viewMode === 'recurrentes' ? 600 : 400, background: viewMode === 'recurrentes' ? '#fef3c7' : 'transparent', color: viewMode === 'recurrentes' ? '#92400e' : 'var(--color-text-secondary)' }}>
                  🔄 Due
                </button>
              )}
            </div>
            {isGroomer ? (
              <button onClick={() => {
                const van = vans.find(v => v.id === session?.vanId);
                const companyId = van?.companyId || 'epw';
                window.open(`${window.location.origin}/booking/${companyId}`, '_blank');
              }} style={{ ...styles.btnSecondary, borderColor: '#0f766e', color: '#0f766e' }}>
                📋 New Booking
              </button>
            ) : (
              <button onClick={() => setShowNewAppt(true)} style={styles.btnPrimary}><Plus size={15} /> {t('new_appt')}</button>
            )}
          </div>
        }
      />

      {/* Filtro de company y groomer — solo admin */}
      {!isGroomer && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {/* Filtro por company — oculto para viewers */}
          {!isViewer && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company:</span>
            <button onClick={() => setFilterVanId('todos')}
              style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${filterVanId === 'todos' ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, background: filterVanId === 'todos' ? 'var(--color-background-info)' : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: filterVanId === 'todos' ? 700 : 400, color: filterVanId === 'todos' ? 'var(--color-text-info)' : 'var(--color-text-secondary)' }}>
              🏢 Todas ({appointments.filter(a => a.date === date).length})
            </button>
            {vans.some(v => v.companyId === 'epw' && v.active !== false) && <button onClick={() => setFilterVanId('epw')}
              style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${filterVanId === 'epw' ? '#0f766e' : 'var(--color-border-tertiary)'}`, background: filterVanId === 'epw' ? '#f0fdfa' : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: filterVanId === 'epw' ? 700 : 400, color: filterVanId === 'epw' ? '#0f766e' : 'var(--color-text-secondary)' }}>
              🐾 El Pet Wash ({appointments.filter(a => a.date === date && vans.find(v => v.id === a.vanId)?.companyId === 'epw').length})
            </button>}
            {vans.some(v => v.companyId === 'atw' && v.active !== false) && <button onClick={() => setFilterVanId('atw')}
              style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${filterVanId === 'atw' ? '#7c3aed' : 'var(--color-border-tertiary)'}`, background: filterVanId === 'atw' ? '#faf5ff' : 'var(--color-background-primary)', cursor: 'pointer', fontSize: 12, fontWeight: filterVanId === 'atw' ? 700 : 400, color: filterVanId === 'atw' ? '#7c3aed' : 'var(--color-text-secondary)' }}>
              🐕 All Tails Wag ({appointments.filter(a => a.date === date && vans.find(v => v.id === a.vanId)?.companyId === 'atw').length})
            </button>}
          </div>
          )}

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
                  <div style={{ fontSize: 11, color: color.text, opacity: 0.8 }}>{v.groomer} · {vanAppts.length} appointment{vanAppts.length !== 1 ? 's' : ''}</div>
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
                              <div style={{ fontWeight: 600, color: color.text }}>{appt.timeStart} {appt.client?.name || 'Client'}</div>
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

      {/* Formulario new appointment */}
      {/* ===== NEEDS REVIEW PANEL (admin/manager) ===== */}
      {!isGroomer && (() => {
        const pendingAppts = appointments.filter(a => a.status === 'pending_review');
        if (!pendingAppts.length) return null;
        return (
          <div style={{ background: '#fdf2f8', border: '2px solid #d946ef', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#86198f' }}>Needs Review</div>
                <div style={{ fontSize: 12, color: '#a21caf' }}>{pendingAppts.length} appointment{pendingAppts.length !== 1 ? 's' : ''} created by groomers</div>
              </div>
            </div>
            {pendingAppts.map(appt => {
              const client = clients.find(c => String(c.id) === String(appt.clientId));
              const van = vans.find(v => v.id === appt.vanId);
              const petNames = (appt.pets || []).map(p => p.pet?.name || p.petName).filter(Boolean).join(', ');
              return (
                <div key={appt.id} style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', marginBottom: 8, border: '1px solid #f0abfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{client?.name || 'Unknown client'}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        📅 {formatDateNice(appt.date)} · ⏰ {appt.timeStart}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        🚐 {van?.name} {petNames && `· 🐾 ${petNames}`}
                      </div>
                      {appt.notes && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>📝 {appt.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={async () => {
                        await updateApptStatus(appt.id, 'confirmed');
                        await refreshAppointments();
                      }} style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        ✅ Confirm
                      </button>
                      <button onClick={async () => {
                        if (window.confirm('Cancel and delete this appointment?')) {
                          await deleteAppt(appt.id);
                          await refreshAppointments();
                        }
                      }} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}



      {showNewAppt && !isGroomer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowNewAppt(false); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardH3, margin: 0 }}>📅 New Appointment</h3>
            <button onClick={() => setShowNewAppt(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>
          {/* STEP 1: Company */}
          {!isGroomer && (
            <div style={{ marginBottom: 16 }}>
              <label style={styles.lbl}>🏢 Company *</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {DEFAULT_COMPANIES.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => setNewApptForm(f => ({ ...f, companyId: c.id, vanId: vans.find(v => v.companyId === c.id)?.id || f.vanId }))}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${newApptForm.companyId === c.id ? '#0f766e' : '#e2e8f0'}`, background: newApptForm.companyId === c.id ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: newApptForm.companyId === c.id ? '#0f766e' : '#64748b' }}>
                    {c.logoEmoji} {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={styles.lbl}>📅 Date *</label>
              <input type="date" value={date} onChange={e => setDate && setDate(e.target.value)}
                style={styles.input} />
            </div>
            <div>
              <label style={styles.lbl}>⏰ Start Time *</label>
              <input type="time" value={newApptForm.timeStart}
                onChange={e => {
                  const start = e.target.value;
                  const numPets = newApptForm.petIds.length || 1;
                  const duration = numPets === 1 ? 2 : numPets === 2 ? 3 : 4;
                  const [h, m] = start.split(':').map(Number);
                  const endH = Math.min(h + duration, 23);
                  const endTime = `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                  setNewApptForm(f => ({...f, timeStart: start, timeEnd: endTime}));
                }}
                style={styles.input} />
            </div>
          </div>

          {/* STEP 3: Client */}
          <div style={{ marginBottom: 16 }}>
            <label style={styles.lbl}>🔍 Client *</label>
            {newApptForm.clientId ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdfa', borderRadius: 10, border: '1.5px solid #0f766e' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>✅ {clients.find(c => String(c.id) === String(newApptForm.clientId))?.name}</div>
                  {!isGroomer && <div style={{ fontSize: 11, color: '#64748b' }}>{clients.find(c => String(c.id) === String(newApptForm.clientId))?.address}</div>}
                </div>
                <button onClick={() => { setNewApptForm(f => ({...f, clientId: '', petIds: []})); setClientSearch(''); setApptClientPets([]); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 20 }}>×</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input value={clientSearch} onChange={e => { setClientSearch(e.target.value); setNewApptForm(f => ({...f, clientId: '', petIds: []})); }}
                  style={styles.input} placeholder="Search client by name..." autoComplete="off" />
                {clientSearch && filteredClients.length > 0 && (
                  <div style={styles.suggestionsBox}>
                    {filteredClients.slice(0, 6).map(c => (
                      <button key={c.id} onMouseDown={async () => {
                        setClientSearch(c.name);
                        setPetServices({});
                        setLoadingApptPets(true);
                        const { data: petsData } = await supabase.from('pets').select('*').eq('client_id', c.id).order('name');
                        setApptClientPets(petsData || []);
                        setLoadingApptPets(false);
                        // Cita inteligente — jalar última cita del cliente
                        const { data: lastAppts } = await supabase.from('appointments')
                          .select('*, appointment_pets(*)')
                          .eq('client_id', c.id)
                          .in('status', ['completed', 'admin_review'])
                          .order('date', { ascending: false })
                          .limit(1);
                        const lastAppt = lastAppts?.[0];
                        if (lastAppt) {
                          const lastPetIds = (lastAppt.appointment_pets || []).map(ap => String(ap.pet_id)).filter(Boolean);
                          const lastService = lastAppt.appointment_pets?.[0]?.service || '';
                          const lastAmount = lastAppt.appointment_pets?.[0]?.amount || 0;
                          const lastVanId = lastAppt.van_id || '';
                          const lastCompanyId = vans.find(v => v.id === lastVanId)?.companyId || 'epw';
                          const lastTimeStart = lastAppt.time_start || '08:00';
                          // Buscar groomer activo de la última cita
                          const lastGroomer = groomers.find(g => g.vanId === lastVanId && g.active !== false);
                          const lastGroomerCompany = lastGroomer?.companyId || vans.find(v => v.id === lastVanId)?.companyId;
                          const companyStillActive = vans.some(v => v.companyId === lastGroomerCompany && v.active !== false);
                          // Buscar serviceId por nombre
                          const matchedSvc = servicePrices.find(sp => sp.name === lastService || sp.category === lastService);
                          setNewApptForm(f => ({
                            ...f,
                            clientId: c.id,
                            petIds: lastPetIds,
                            vanId: lastVanId || f.vanId,
                            groomerId: (lastGroomer && companyStillActive) ? lastGroomer.id : f.groomerId,
                            companyId: lastCompanyId,
                            timeStart: lastTimeStart,
                            serviceName: lastService,
                            serviceId: matchedSvc?.id || '',
                            servicePrice: lastAmount,
                          }));
                        } else {
                          setNewApptForm(f => ({...f, clientId: c.id, petIds: []}));
                        }
                      }}
                        className="suggestion-hover" style={styles.suggestionItem}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        {/* Groomers solo ven el nombre, no info personal */}
                        {!isGroomer && <div style={{ fontSize: 11, color: '#64748b' }}>{c.address}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 4: Smart Scheduling → Van */}
          {newApptForm.clientId && !isGroomer && newApptForm.companyId && (() => {
            const client = clients.find(c => String(c.id) === String(newApptForm.clientId));
            const companyVans = vans.filter(v => v.active !== false && (!newApptForm.companyId || v.companyId === newApptForm.companyId));
            const vanOptions = companyVans.map(v => {
              const groomer = groomers.find(g => g.vanId === v.id);
              const todayAppts = appointments.filter(a => a.vanId === v.id && a.date === date && a.status !== 'cancelled').length;
              return { ...v, groomer, todayAppts };
            }).sort((a, b) => a.todayAppts - b.todayAppts);

            return (
              <div style={{ marginBottom: 16 }}>
                {/* Smart Scheduling */}
                {client?.address && vanOptions.length > 0 && (
                  <div style={{ padding: '12px 14px', background: '#f0fdfa', borderRadius: 12, border: '1.5px solid #0f766e', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', marginBottom: 8 }}>💡 Smart Scheduling — Suggested vans</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>📍 {client.address.split(',').slice(0,2).join(',')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {vanOptions.slice(0, 3).map((v, idx) => {
                        const medals = ['🥇','🥈','🥉'];
                        const isSelected = newApptForm.vanId === v.id;
                        const company = DEFAULT_COMPANIES.find(c => c.id === v.companyId);
                        return (
                          <button key={v.id} type="button"
                            onClick={() => setNewApptForm(f => ({ ...f, vanId: v.id, companyId: v.companyId || f.companyId, groomerId: v.groomer?.id || '' }))}
                            style={{ padding: '10px 12px', borderRadius: 10, border: `2px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`, background: isSelected ? '#fff' : '#f8fafc', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 18 }}>{medals[idx]}</span>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{v.name} — {v.groomer?.name || 'No groomer'}</div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>{company?.logoEmoji} {company?.name}</div>
                              </div>
                            </div>
                            <div style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: v.todayAppts === 0 ? '#f0fdfa' : '#fffbeb', color: v.todayAppts === 0 ? '#0f766e' : '#92400e' }}>
                              {v.todayAppts === 0 ? '✅ Free' : `${v.todayAppts} appts`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Van selector */}
                <label style={styles.lbl}>✂️ Groomer</label>
                <select value={newApptForm.groomerId}
                  onChange={e => {
                    const groomer = groomers.find(g => g.id === e.target.value);
                    const van = vans.find(v => v.id === groomer?.vanId);
                    setNewApptForm(f => ({ ...f, groomerId: e.target.value, vanId: groomer?.vanId || f.vanId, companyId: groomer?.companyId || van?.companyId || f.companyId }));
                  }}
                  style={styles.input}>
                  <option value="">Select groomer...</option>
                  {groomers.filter(g => {
                    if (g.active === false) return false;
                    const gCoId = g.companyId || vans.find(v => v.id === g.vanId)?.companyId;
                    const hasActiveVans = vans.some(v => v.companyId === gCoId && v.active !== false);
                    if (!hasActiveVans) return false;
                    if (newApptForm.companyId && newApptForm.companyId !== gCoId) return false;
                    return true;
                  }).map(g => {
                    const company = DEFAULT_COMPANIES.find(c => c.id === (g.companyId || vans.find(v => v.id === g.vanId)?.companyId));
                    return <option key={g.id} value={g.id}>{g.name} {company ? `(${company.logoEmoji})` : ''}</option>;
                  })}
                </select>
                {newApptForm.vanId && (() => {
                  const van = vans.find(v => v.id === newApptForm.vanId);
                  const groomer = groomers.find(g => g.vanId === newApptForm.vanId);
                  const company = DEFAULT_COMPANIES.find(c => c.id === van?.companyId);
                  return (
                    <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0fdfa', borderRadius: 6, fontSize: 12, color: '#0f766e', display: 'flex', gap: 12 }}>
                      {company && <span>{company.logoEmoji} {company.name}</span>}
                      {groomer && <span>✂️ {groomer.name} · {groomer.commissionPct}%</span>}
                    </div>
                  );
                })()}

                {/* Conflict check */}
                {newApptForm.timeStart && newApptForm.vanId && (() => {
                  const conflict = appointments.filter(a =>
                    a.vanId === newApptForm.vanId && a.date === date && a.status !== 'cancelled' &&
                    a.timeStart && a.timeEnd &&
                    newApptForm.timeStart < a.timeEnd && newApptForm.timeEnd > a.timeStart
                  );
                  if (!conflict.length) return null;
                  return <div style={{ marginTop: 6, padding: '6px 10px', background: '#fef2f2', borderRadius: 8, fontSize: 12, color: '#dc2626' }}>⚠️ Schedule conflict: {conflict[0].timeStart}–{conflict[0].timeEnd}</div>;
                })()}
              </div>
            );
          })()}

          {/* STEP 5: Pets */}
          {newApptForm.clientId && (() => {
            const clientPetsLocal = apptClientPets.length > 0 ? apptClientPets : pets.filter(p => String(p.client_id) === String(newApptForm.clientId));
            if (loadingApptPets) return (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1', fontSize: 13, color: '#0f766e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading pets...
              </div>
            );
            if (!clientPetsLocal.length) return (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fcd34d', fontSize: 13, color: '#92400e' }}>
                ⚠️ No pets found for this client. Add pets in the Clients tab first.
              </div>
            );
            return (
              <div style={{ marginBottom: 16 }}>
                <label style={styles.lbl}>🐾 Pet(s) *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {clientPetsLocal.map(p => {
                    const selected = newApptForm.petIds.includes(String(p.id));
                    return (
                      <button key={p.id} type="button"
                        onClick={() => {
                          const newPetIds = selected
                            ? newApptForm.petIds.filter(id => id !== String(p.id))
                            : [...newApptForm.petIds, String(p.id)];
                          const numPets = newPetIds.length || 1;
                          const duration = numPets === 1 ? 2 : numPets === 2 ? 3 : 4;
                          const [h, m] = (newApptForm.timeStart || '08:00').split(':').map(Number);
                          const endH = Math.min(h + duration, 23);
                          setNewApptForm(f => ({ ...f, petIds: newPetIds, timeEnd: `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}` }));
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: selected ? '#f0fdfa' : '#f8fafc', border: `1.5px solid ${selected ? '#0f766e' : '#e2e8f0'}`, borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? '#0f766e' : '#374151' }}>
                        {selected ? '✅ ' : '🐾 '}{p.name}
                        {p.size && <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.size.split(' ')[0]}</span>}
                        {p.hair_type && <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.hair_type.split(' ')[0]}</span>}
                      </button>
                    );
                  })}
                </div>
                {/* Duration indicator */}
                {newApptForm.petIds.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#0f766e' }}>
                    ⏱ {newApptForm.petIds.length <= 1 ? '2' : newApptForm.petIds.length === 2 ? '3' : '4'} hrs → End: {newApptForm.timeEnd}
                  </div>
                )}
              </div>
            );
          })()}

          {/* STEP 6: Servicio por mascota */}
          {newApptForm.clientId && newApptForm.petIds.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={styles.lbl}>🛁 Service por mascota</label>
              {newApptForm.petIds.map(petId => {
                const pet = pets.find(p => String(p.id) === String(petId));
                if (!pet) return null;
                const currentSvc = petServices[String(petId)];

                const isCat = pet.species === 'cat';
                const isOther = pet.species && !['dog', 'cat'].includes(pet.species);

                const getAutoPrice = (svcId) => {
                  if (isOther) return 0; // Other = custom price
                  // Standalone Ultrasonic
                  if (svcId === 'Ultrasonic Clear Dental') {
                    const match = servicePrices?.find(sp =>
                      sp.category === 'Ultrasonic Clear Dental' &&
                      (!sp.size || sp.size === pet.size)
                    );
                    return match?.price || 0;
                  }
                  const baseSvcName = svcId.split(' + ')[0];
                  // Cat prefix for category lookup
                  const catPrefix = isCat ? 'Cat ' : '';
                  const categoryName = `${catPrefix}${baseSvcName}`;
                  const isUltra = svcId.includes('UltraSonic');
                  let price = 0;
                  if (pet.size) {
                    const baseMatch = servicePrices?.find(sp => {
                      const nameMatch = sp.category === categoryName || sp.name === categoryName;
                      const sizeMatch = !sp.size || sp.size === pet.size;
                      const hairMatch = !sp.hair_type || sp.hair_type === pet.hair_type;
                      return nameMatch && sizeMatch && hairMatch;
                    });
                    price += baseMatch?.price || 0;
                    if (isUltra) {
                      const ultraMatch = servicePrices?.find(sp =>
                        (sp.category === 'Ultrasonic Clear Dental' || sp.name?.includes('Ultrasonic')) &&
                        (!sp.size || sp.size === pet.size)
                      );
                      price += ultraMatch?.price || 0;
                    }
                  }
                  return price;
                };

                return (
                  <div key={petId} style={{ marginBottom: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: `1.5px solid ${currentSvc ? '#0f766e' : '#e2e8f0'}` }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                      🐾 {pet.name}
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400, marginLeft: 8 }}>
                        {isCat ? '🐈 Cat' : isOther ? '🐾 Other' : ''} {pet.size?.split(' ')[0]} · {pet.hair_type}
                      </span>
                    </div>

                    {/* Other/Exotic → precio manual */}
                    {isOther ? (
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Enter service and price manually:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                          {['Signature Bath', 'Full Groom', 'Signature Bath + UltraSonic', 'Full Groom + UltraSonic', 'Ultrasonic Clear Dental'].map(svc => (
                            <button key={svc} type="button"
                              onClick={() => setPetServices(prev => ({
                                ...prev,
                                [String(petId)]: { ...prev[String(petId)], service: svc, basePrice: prev[String(petId)]?.basePrice || 0, price: prev[String(petId)]?.basePrice || 0, addons: [] }
                              }))}
                              style={{ padding: '7px 6px', borderRadius: 8, border: `1.5px solid ${currentSvc?.service === svc ? '#0f766e' : '#e2e8f0'}`, background: currentSvc?.service === svc ? '#f0fdfa' : '#fff', cursor: 'pointer', fontSize: 11, fontWeight: currentSvc?.service === svc ? 700 : 400, color: currentSvc?.service === svc ? '#0f766e' : '#64748b', textAlign: 'center' }}>
                              {svc}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, color: '#64748b' }}>Price $</span>
                          <input type="number" step="0.01"
                            value={currentSvc?.basePrice || ''}
                            onChange={e => {
                              const p = parseFloat(e.target.value) || 0;
                              const addonsTotal = (currentSvc?.addons || []).reduce((s, a) => s + a.price, 0);
                              setPetServices(prev => ({
                                ...prev,
                                [String(petId)]: { ...prev[String(petId)], basePrice: p, price: p + addonsTotal }
                              }));
                            }}
                            placeholder="0.00"
                            style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #0f766e', borderRadius: 8, fontSize: 15, fontWeight: 700 }} />
                        </div>
                      </div>
                    ) : (
                    <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {[
                        { id: 'Signature Bath',              icon: '🛁',   label: 'Signature Bath' },
                        { id: 'Full Groom',                  icon: '✂️',  label: 'Full Groom' },
                        { id: 'Signature Bath + UltraSonic', icon: '🛁🦷', label: 'Bath + Ultrasonic' },
                        { id: 'Full Groom + UltraSonic',     icon: '✂️🦷',label: 'Groom + Ultrasonic' },
                        { id: 'Ultrasonic Clear Dental',     icon: '🦷',   label: 'Ultrasonic Dental' },
                      ].map(svc => {
                        const isSelected = currentSvc?.service === svc.id;
                        const autoPrice = getAutoPrice(svc.id);
                        return (
                          <button key={svc.id} type="button"
                            onClick={() => {
                              setPetServices(prev => ({
                                ...prev,
                                [String(petId)]: { service: svc.id, price: autoPrice, basePrice: autoPrice, addons: [] }
                              }));
                            }}
                            style={{ padding: '8px 6px', borderRadius: 8, border: `2px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`, background: isSelected ? '#f0fdfa' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: isSelected ? 700 : 400, color: isSelected ? '#0f766e' : '#64748b', textAlign: 'center' }}>
                            <div style={{ fontSize: 16, marginBottom: 2 }}>{svc.icon}</div>
                            <div>{svc.label}</div>
                            {autoPrice > 0 && <div style={{ fontSize: 11, color: isSelected ? '#0f766e' : '#94a3b8', fontWeight: 700, marginTop: 2 }}>${autoPrice}</div>}
                          </button>
                        );
                      })}
                    </div>
                    {currentSvc && currentSvc.service && (
                      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 10px', background: '#f0fdfa', borderRadius: 8 }}>
                        <span>✅ {currentSvc.service}</span>
                        <span style={{ fontWeight: 700, color: '#0f766e' }}>${currentSvc.basePrice || currentSvc.price}</span>
                      </div>
                    )}
                    </div>
                    )}
                  </div>
                );
              })}

              {/* Total general con add-ons */}
              {newApptForm.petIds.some(id => petServices[String(id)]) && (
                <div style={{ marginTop: 8 }}>
                  {newApptForm.petIds.map(id => {
                    const svc = petServices[String(id)];
                    if (!svc) return null;
                    const pet = pets.find(p => String(p.id) === String(id));
                    const addonsTotal = (svc.addons || []).reduce((s, a) => s + a.price, 0);
                    const petTotal = (svc.basePrice || svc.price || 0) + addonsTotal;
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', padding: '4px 10px' }}>
                        <span>🐾 {pet?.name} — {svc.service}</span>
                        <span style={{ fontWeight: 600 }}>${petTotal}</span>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#0f766e', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 15, marginTop: 6 }}>
                    <span>Total</span>
                    <span>${newApptForm.petIds.reduce((sum, id) => {
                      const svc = petServices[String(id)];
                      if (!svc) return sum;
                      const addonsTotal = (svc.addons || []).reduce((s, a) => s + a.price, 0);
                      return sum + (svc.basePrice || svc.price || 0) + addonsTotal;
                    }, 0)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Add-ons por mascota */}
          {newApptForm.clientId && newApptForm.petIds.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={styles.lbl}>➕ Add-ons por mascota</label>
              {newApptForm.petIds.map(petId => {
                const pet = pets.find(p => String(p.id) === String(petId));
                if (!pet) return null;
                const petSvc = petServices[String(petId)];
                // add-ons visibles siempre

                const addons = (servicePrices || []).filter(p => p.category === 'Add-on');
                const uniqueAddons = [...new Map(addons.map(a => [a.name, a])).values()];

                const currentAddons = petSvc?.addons || [];

                return (
                  <div key={petId} style={{ marginBottom: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>🐾 {pet.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {uniqueAddons.map(addon => {
                        const selected = currentAddons.some(a => a.name === addon.name);
                        return (
                          <button key={addon.id} type="button"
                            onClick={() => {
                              const newAddons = selected
                                ? currentAddons.filter(a => a.name !== addon.name)
                                : [...currentAddons, { name: addon.name, price: addon.price }];
                              const addonsTotal = newAddons.reduce((sum, a) => sum + a.price, 0);
                              setPetServices(prev => ({
                                ...prev,
                                [String(petId)]: { ...prev[String(petId)], addons: newAddons }
                              }));
                            }}
                            style={{ padding: '5px 10px', background: selected ? '#f0fdfa' : '#fff', border: `1.5px solid ${selected ? '#0f766e' : '#e2e8f0'}`, borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: selected ? 700 : 400, color: selected ? '#0f766e' : '#64748b' }}>
                            {selected ? '✅ ' : '+ '}{addon.name} ${addon.price}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 7.5: Descuento */}
          {newApptForm.clientId && newApptForm.petIds.some(id => petServices[String(id)]) && (
            <div style={{ marginBottom: 16 }}>
              <label style={styles.lbl}>🏷️ Discount (optional)</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
                  {['%', '$'].map(type => (
                    <button key={type} type="button"
                      onClick={() => setNewApptForm(f => ({...f, discountType: type, discountValue: 0}))}
                      style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: (newApptForm.discountType || '%') === type ? 700 : 400, background: (newApptForm.discountType || '%') === type ? '#fff' : 'transparent', color: (newApptForm.discountType || '%') === type ? '#0f766e' : '#64748b' }}>
                      {type}
                    </button>
                  ))}
                </div>
                <input type="number" step="0.01" min="0"
                  value={newApptForm.discountValue || ''}
                  onChange={e => setNewApptForm(f => ({...f, discountValue: parseFloat(e.target.value) || 0}))}
                  placeholder={(newApptForm.discountType || '%') === '%' ? '0' : '0.00'}
                  style={{ ...styles.input, flex: 1, fontWeight: 700, color: '#dc2626' }} />
                {(newApptForm.discountValue > 0) && (() => {
                  const subtotal = newApptForm.petIds.reduce((sum, id) => {
                    const svc = petServices[String(id)];
                    return sum + (svc?.basePrice || 0) + (svc?.addons || []).reduce((s,a) => s+a.price, 0);
                  }, 0);
                  const discAmt = (newApptForm.discountType || '%') === '%'
                    ? subtotal * newApptForm.discountValue / 100
                    : newApptForm.discountValue;
                  return <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>-${discAmt.toFixed(2)}</div>;
                })()}
              </div>
            </div>
          )}

          {/* STEP 8: Notes + Recurrence */}
          {newApptForm.clientId && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>📝 Notes</label>
                <input value={newApptForm.notes} onChange={e => setNewApptForm(f => ({...f, notes: e.target.value}))} style={styles.input} placeholder="Special instructions..." />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>⚠️ Alert Notes (private)</label>
                <input value={newApptForm.alertNotes} onChange={e => setNewApptForm(f => ({...f, alertNotes: e.target.value}))} style={styles.input} placeholder="e.g. Aggressive dog, difficult client..." />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>🔄 Recurrence</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {[{v:0,l:'None'},{v:2,l:'2 weeks'},{v:4,l:'4 weeks'},{v:6,l:'6 weeks'},{v:8,l:'8 weeks'}].map(opt => (
                    <button key={opt.v} type="button"
                      onClick={() => setNewApptForm(f => ({...f, recurrenceWeeks: opt.v}))}
                      style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${newApptForm.recurrenceWeeks === opt.v ? '#0f766e' : '#e2e8f0'}`, background: newApptForm.recurrenceWeeks === opt.v ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: newApptForm.recurrenceWeeks === opt.v ? 700 : 400, color: newApptForm.recurrenceWeeks === opt.v ? '#0f766e' : '#64748b' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary + Save */}
          {newApptForm.clientId && newApptForm.vanId && (
            <div style={{ padding: '12px 14px', background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', marginBottom: 6 }}>📋 Summary</div>
              <div style={{ fontSize: 12, color: '#374151', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div>📅 {formatDateNice(date)} · ⏰ {newApptForm.timeStart} → {newApptForm.timeEnd}</div>
                <div>🚐 {vans.find(v => v.id === newApptForm.vanId)?.name} · ✂️ {groomers.find(g => g.vanId === newApptForm.vanId)?.name || ''}</div>
                {newApptForm.petIds.map(id => {
                  const pet = pets.find(p => String(p.id) === String(id));
                  const svc = petServices[String(id)];
                  const addonsTotal = (svc?.addons || []).reduce((s, a) => s + a.price, 0);
                  const total = (svc?.basePrice || 0) + addonsTotal;
                  return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>🐾 {pet?.name} {svc ? `— ${svc.service}` : ''}{svc?.addons?.length > 0 ? ` + ${svc.addons.map(a => a.name).join(', ')}` : ''}</span>
                      {total > 0 && <span style={{ fontWeight: 700, color: '#0f766e' }}>${total}</span>}
                    </div>
                  );
                })}
                {newApptForm.petIds.some(id => petServices[String(id)]) && (() => {
                  const subtotal = newApptForm.petIds.reduce((sum, id) => {
                    const svc = petServices[String(id)];
                    return sum + (svc?.basePrice || 0) + (svc?.addons || []).reduce((s,a) => s+a.price, 0);
                  }, 0);
                  const discAmt = newApptForm.discountValue > 0
                    ? (newApptForm.discountType || '%') === '%'
                      ? subtotal * newApptForm.discountValue / 100
                      : newApptForm.discountValue
                    : 0;
                  const finalTotal = subtotal - discAmt;
                  return (
                    <>
                      {discAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>🏷️ Discount {(newApptForm.discountType || '%') === '%' ? `${newApptForm.discountValue}%` : ''}</span>
                        <span>-${discAmt.toFixed(2)}</span>
                      </div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, paddingTop: 4, borderTop: '1px solid #ccfbf1', marginTop: 2 }}>
                        <span>Total</span>
                        <span style={{ color: '#0f766e' }}>${finalTotal.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowNewAppt(false)} style={styles.btnSecondary}><X size={15} /> Cancel</button>
            <button onClick={handleCreateAppt} style={styles.btnPrimary} disabled={saving}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
              {saving ? 'Saving...' : '✅ Create Appointment'}
            </button>
          </div>
        </div>
        </div>
      )}


      {/* Formulario client nuevo */}
      {showNewClient && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowNewClient(false); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardH3, margin: 0 }}>👤 Client nuevo</h3>
            <button onClick={() => setShowNewClient(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>
          <div style={styles.formGrid}>
            <div><label style={styles.lbl}>Name *</label><input value={newClientForm.name} onChange={e => setNewClientForm(f => ({...f, name: e.target.value}))} style={styles.input} placeholder="Name completo" /></div>
            <div><label style={styles.lbl}>Phone</label><input value={newClientForm.phone} onChange={e => setNewClientForm(f => ({...f, phone: e.target.value}))} style={styles.input} placeholder="(305) 000-0000" /></div>
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
          {isGroomer && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '8px 0 0' }}>El phone y email solo serán visibles para el administrador.</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button onClick={() => setShowNewClient(false)} style={styles.btnSecondary}><X size={14} /> Cancel</button>
            <button onClick={handleCreateClient} style={styles.btnPrimary} disabled={saving}><Check size={14} /> Crear client</button>
          </div>
        </div>
        </div>
      )}

      {/* Lista de appointments */}
      {/* ===== VISTA RUTA ===== */}
      {viewMode === 'ruta' && (
        <RouteMapView
          appointments={appointments}
          vans={vans}
          date={date}
          setDate={setDate}
          isGroomer={isGroomer}
          myVanId={myVanId}
          session={session}
          setSelectedAppt={setSelectedAppt}
          setViewMode={setViewMode}
        />
      )}
            {viewMode === 'recurrentes' && (() => {
        // Appointments con recurrencia que ya se completaron
        const recurringAppts = appointments.filter(a => 
          a.recurrenceWeeks > 0 && a.status === 'completed'
        );

        // Calcular próxima fecha para cada appointment
        const dueItems = recurringAppts.map(a => {
          const lastDate = new Date(a.date + 'T12:00:00');
          const nextDate = new Date(lastDate);
          nextDate.setDate(lastDate.getDate() + (a.recurrenceWeeks * 7));
          const tz = nextDate.getTimezoneOffset() * 60000;
          const nextISO = new Date(nextDate - tz).toISOString().slice(0,10);
          const today = todayISO();
          const daysUntil = Math.round((new Date(nextISO) - new Date(today)) / (1000 * 60 * 60 * 24));
          
          // Verificar si ya hay una appointment agendada cerca de esa fecha
          const alreadyScheduled = appointments.some(b =>
            String(b.clientId) === String(a.clientId) &&
            b.status !== 'cancelled' && b.status !== 'completed' &&
            Math.abs(new Date(b.date) - new Date(nextISO)) < 14 * 24 * 60 * 60 * 1000
          );

          return { ...a, nextDate: nextISO, daysUntil, alreadyScheduled };
        }).filter(a => !a.alreadyScheduled)
          .sort((a, b) => a.daysUntil - b.daysUntil);

        return (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>🔄 Recurring clients not yet scheduled</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Based on completed appointments with recurrence set</div>
            </div>

            {dueItems.length === 0 ? (
              <div style={{ ...styles.card, textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                ✅ All recurring clients are scheduled!
              </div>
            ) : dueItems.map(item => {
              const isOverdue = item.daysUntil < 0;
              const isDueSoon = item.daysUntil <= 7 && item.daysUntil >= 0;
              const van = vans.find(v => v.id === item.vanId);

              return (
                <div key={item.id} style={{ ...styles.card, borderLeft: `4px solid ${isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#0f766e'}`, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>🐾 {item.client?.name || 'Client'}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {van?.name} · Every {item.recurrenceWeeks} weeks · Last: {formatDateNice(item.date)}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Pets: {item.pets?.map(p => p.pet?.name).filter(Boolean).join(', ') || '—'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: isOverdue ? '#fef2f2' : isDueSoon ? '#fffbeb' : '#f0fdfa', color: isOverdue ? '#dc2626' : isDueSoon ? '#92400e' : '#0f766e' }}>
                        {isOverdue ? `⚠️ ${Math.abs(item.daysUntil)}d overdue` : isDueSoon ? `⏰ Due in ${item.daysUntil}d` : `📅 ${item.daysUntil}d`}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Due: {formatDateNice(item.nextDate)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => {
                      // Pre-llenar formulario con datos de la appointment previous
                      setNewApptForm({
                        clientId: item.clientId,
                        vanId: item.vanId,
                        companyId: item.companyId || 'epw',
                        groomerId: item.groomerId || '',
                        timeStart: item.timeStart || '08:00',
                        timeEnd: item.timeEnd || '10:00',
                        notes: item.notes || '',
                        alertNotes: item.alertNotes || '',
                        petIds: item.pets?.map(p => p.petId).filter(Boolean) || [],
                        serviceId: '',
                        serviceName: item.pets?.[0]?.service || '',
                        servicePrice: item.pets?.[0]?.amount || 0,
                        discountPct: 0,
                        addons: [],
                        recurrenceWeeks: item.recurrenceWeeks,
                      });
                      setDate(item.nextDate);
                      setShowNewAppt(true);
                      setViewMode('lista');
                    }} style={{ ...styles.btnPrimary, fontSize: 13 }}>
                      📅 Schedule Next Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}



      {/* ===== VISTA MONTH ===== */}
      {viewMode === 'month' && (() => {
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
              <button onClick={() => { const p = new Date(year, month-1, 1); setDate(toISO(p.getFullYear(), p.getMonth(), 1)); }}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>‹</button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700 }}>{monthNames[month]} {year}</div>
              <button onClick={() => { const n = new Date(year, month+1, 1); setDate(toISO(n.getFullYear(), n.getMonth(), 1)); }}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 4 }}>
              {DAY_LABELS.map(dl => (
                <div key={dl} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '4px 0' }}>{dl}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {Array.from({ length: startDow }).map((_, i) => <div key={`e-${i}`} style={{ minHeight: 80, background: '#fafafa' }} />)}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const iso = toISO(year, month, dayNum);
                const dayApptsList = appointments.filter(a => {
                  if (a.date !== iso) return false;
                  if (isGroomer) return a.vanId === myVanId;
                  if (filterVanId !== 'todos' && filterVanId !== 'epw' && filterVanId !== 'atw') return a.vanId === filterVanId;
                  if (filterVanId === 'epw' || filterVanId === 'atw') return vans.find(v => v.id === a.vanId)?.companyId === filterVanId;
                  return true;
                });
                const isToday = iso === todayISO();
                const dogCount = dayApptsList.reduce((s,a) => s + (a.pets||[]).filter(p => (p.pet?.species||'dog') === 'dog').length, 0);
                const catCount = dayApptsList.reduce((s,a) => s + (a.pets||[]).filter(p => p.pet?.species === 'cat').length, 0);
                return (
                  <div key={iso} style={{ minHeight: 80, background: isToday ? '#fff8f0' : '#fff', border: `1px solid ${isToday ? '#f97316' : '#e2e8f0'}`, padding: '4px 3px', position: 'relative' }}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? '#f97316' : '#0f172a', marginBottom: 3 }}>{dayNum}</div>
                    {dayApptsList.slice(0,3).map(appt => (
                      <div key={appt.id}
                        onClick={() => { setDate(iso); setSelectedAppt(appt.id); setViewMode('lista'); }}
                        style={{ background: '#0f172a', color: '#fff', borderRadius: 4, padding: '2px 5px', fontSize: 10, fontWeight: 600, marginBottom: 2, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {appt.client?.name?.split(' ').slice(0,2).join(' ') || 'Client'}
                      </div>
                    ))}
                    {dayApptsList.length > 3 && (
                      <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>+{dayApptsList.length - 3} more</div>
                    )}
                    <div style={{ display: 'flex', gap: 4, marginTop: 3, fontSize: 10 }}>
                      <span>🐕{dogCount}</span>
                      <span>🐈{catCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ===== VISTA WEEK ===== */}
      {viewMode === 'week' && (() => {
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
        const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button onClick={() => { const p = new Date(wStart + 'T12:00:00'); p.setDate(p.getDate()-7); const tz = p.getTimezoneOffset()*60000; setDate(new Date(p-tz).toISOString().slice(0,10)); }}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>‹</button>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700 }}>
                {new Date(wStart+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} — {new Date(wEnd+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
              </div>
              <button onClick={() => { const n = new Date(wStart + 'T12:00:00'); n.setDate(n.getDate()+7); const tz = n.getTimezoneOffset()*60000; setDate(new Date(n-tz).toISOString().slice(0,10)); }}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>›</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, minmax(90px, 1fr))', minWidth: 700 }}>
                <div style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', padding: '6px 4px' }} />
                {days.map((d, i) => {
                  const dayApptsList = appointments.filter(a => {
                    if (a.date !== d) return false;
                    if (isGroomer) return a.vanId === myVanId;
                    if (filterVanId !== 'todos' && filterVanId !== 'epw' && filterVanId !== 'atw') return a.vanId === filterVanId;
                    if (filterVanId === 'epw' || filterVanId === 'atw') return vans.find(v => v.id === a.vanId)?.companyId === filterVanId;
                    return true;
                  });
                  const isToday = d === todayISO();
                  const dogCount = dayApptsList.reduce((s,a) => s + (a.pets||[]).filter(p => (p.pet?.species||'dog') === 'dog').length, 0);
                  const catCount = dayApptsList.reduce((s,a) => s + (a.pets||[]).filter(p => p.pet?.species === 'cat').length, 0);
                  return (
                    <div key={d} style={{ background: isToday ? '#fff8f0' : '#f8fafc', borderBottom: '2px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', padding: '6px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{DAY_LABELS[i]}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: isToday ? '#f97316' : '#0f172a' }}>{d.slice(8)}</div>
                      <div style={{ fontSize: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
                        <span>🐕{dogCount}</span><span>🐈{catCount}</span>
                      </div>
                    </div>
                  );
                })}
                {HOURS.map(hour => {
                  const hourStr = `${hour.toString().padStart(2,'0')}:00`;
                  const nextHourStr = `${(hour+1).toString().padStart(2,'0')}:00`;
                  return (
                    <React.Fragment key={hour}>
                      <div style={{ padding: '4px 4px 0 0', fontSize: 10, color: '#94a3b8', textAlign: 'right', borderTop: '1px solid #f1f5f9', background: '#f8fafc', minHeight: 60 }}>
                        {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour-12}pm`}
                      </div>
                      {days.map(d => {
                        const slotAppts = appointments.filter(a => {
                          if (a.date !== d) return false;
                          if (isGroomer && a.vanId !== myVanId) return false;
                          if (!a.timeStart) return false;
                          const [h] = a.timeStart.split(':').map(Number);
                          return h === hour;
                        });
                        const isToday = d === todayISO();
                        return (
                          <div key={d} style={{ borderTop: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', minHeight: 60, background: isToday ? 'rgba(249,115,22,0.03)' : '#fff', padding: 2 }}>
                            {slotAppts.map(appt => {
                              const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
                              return (
                                <div key={appt.id}
                                  onClick={() => { setDate(d); setSelectedAppt(appt.id); setViewMode('lista'); }}
                                  style={{ background: '#0f172a', color: '#fff', borderRadius: 6, padding: '4px 6px', marginBottom: 2, cursor: 'pointer', fontSize: 10 }}>
                                  <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {appt.client?.name?.split(' ').slice(0,2).join(' ')}
                                  </div>
                                  {appt.pets?.slice(0,1).map(ap => (
                                    <div key={ap.id} style={{ opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {ap.pet?.name} · {ap.service?.split(' ')[0]}
                                    </div>
                                  ))}
                                  <div style={{ opacity: 0.7 }}>${(appt.pets||[]).reduce((s,ap) => s+(ap.amount||0),0).toFixed(0)}</div>
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
          </div>
        );
      })()}

      {/* ===== VISTA LISTA ===== */}
      {viewMode === 'lista' && (dayAppts.length === 0 ? (
        <div style={styles.empty}>
          <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>No appointments for this day</p>
          <p style={{ marginTop: 6, fontSize: 13, color: '#94a3b8' }}>Add a new appointment with the button above</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayAppts.map(appt => {
            const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
            const isOpen = selectedAppt === appt.id;
            return (
              <div key={appt.id} style={{ ...styles.card, borderLeft: `3px solid ${sc.border}`, cursor: 'pointer' }} onClick={() => setSelectedAppt(isOpen ? null : appt.id)}>
                {appt.alertNotes && (
                  <div style={{ fontSize: 11, color: '#92400e', background: '#fffbeb', padding: '4px 8px', borderRadius: 6, marginBottom: 8 }}>
                    ⚠️ {appt.alertNotes}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: sc.bg, color: sc.text }}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {appt.timeStart}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{appt.client?.name || 'No client'}</div>
                    {!isGroomer && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{appt.client?.address}</div>}
                    {appt.pets?.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {appt.pets.map(ap => (
                          <span key={ap.id} style={{ fontSize: 12, padding: '3px 8px', background: '#f1f5f9', borderRadius: 999, color: '#64748b' }}>
                            🐾 {ap.pet?.name || 'Pet'} {ap.service ? `— ${ap.service}` : ''} {ap.amount ? `$${ap.amount}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {!isGroomer && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{vans.find(v => v.id === appt.vanId)?.name} — {vans.find(v => v.id === appt.vanId)?.groomer}</div>}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{isOpen ? '▲' : '▼'}</div>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 14 }}>
                      {!appt.agreementSigned && (
                        <button onClick={() => setShowSignature(appt)}
                          style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: '#f59e0b', color: '#92400e', background: '#fffbeb', gridColumn: 'span 2' }}>
                          ✍️ Sign Agreement
                        </button>
                      )}
                      {appt.status === 'unconfirmed' && (
                        <button onClick={() => updateApptStatus(appt.id, 'confirmed')} style={{ ...styles.btnPrimary, justifyContent: 'center' }}>
                          ✅ Confirm
                        </button>
                      )}
                      {(appt.status === 'confirmed' || appt.status === 'unconfirmed') && (
                        <button onClick={() => handleCheckin(appt.id)} style={{ ...styles.btnPrimary, justifyContent: 'center', background: '#f0fdf4', color: '#16a34a', borderColor: '#16a34a' }}>
                          🚀 Check In
                        </button>
                      )}
                      {appt.status === 'in_progress' && (
                        <button onClick={() => handleComplete(appt)} style={{ ...styles.btnPrimary, justifyContent: 'center' }}>
                          💰 Complete & Collect
                        </button>
                      )}
                      {(appt.status === 'completed' || appt.status === 'admin_review') && (
                        <button onClick={async () => {
                          const { data } = await supabase.from('invoices').select('*').eq('appointment_id', appt.id).single();
                          if (data) {
                            setShowInvoice({ ...data, services: typeof data.services === 'string' ? JSON.parse(data.services) : data.services });
                          } else {
                            // Construir pre-invoice desde los datos de la cita
                            const van = vans.find(v => v.id === appt.vanId);
                            const companyId = van?.companyId || appt.companyId || 'epw';
                            const subtotal = (appt.pets || []).reduce((s, ap) => s + (ap.amount || 0), 0);
                            const method = appt.pets?.[0]?.method || appt.payment_method || 'Cash';
                            const tip = appt.pets?.[0]?.tip || appt.payment_tip || 0;
                            const cardFeePct = settings?.cardFeePct || 5.5;
                            const cardFee = method === 'Credit Card' ? parseFloat(((subtotal + tip) * cardFeePct / 100).toFixed(2)) : (appt.pets?.[0]?.card_fee || appt.payment_card_fee || 0);
                            const gasFee = settings?.gasFee || 7;
                            const total = subtotal + tip + cardFee;
                            setShowInvoice({
                              invoiceNumber: 'PRE-INVOICE',
                              companyId,
                              clientName: appt.client?.name || '',
                              clientAddress: appt.client?.address || '',
                              groomerName: session?.userName || van?.groomer || '',
                              vanName: van?.name || '',
                              date: appt.date,
                              services: (appt.pets || []).map(ap => ({ petName: ap.pet?.name || 'Pet', service: ap.service || '', amount: ap.amount || 0 })),
                              subtotal, gasFee, cardFee, tip, total, method,
                            });
                          }
                        }} style={{ ...styles.btnSecondary, justifyContent: 'center', borderColor: '#0f766e', color: '#0f766e' }}>
                          🧾 {appt.status === 'admin_review' ? 'Pre-Invoice' : 'View Invoice'}
                        </button>
                      )}
                      {appt.client?.address && (
                        <button onClick={() => openMaps(appt.client.address)} style={{ ...styles.btnSecondary, justifyContent: 'center' }}>
                          📍 Maps
                        </button>
                      )}
                      {isGroomer && appt.client?.phone && (appt.status === 'confirmed' || appt.status === 'in_progress') && (() => {
                        const van = vans.find(v => v.id === appt.vanId);
                        const companyId = van?.companyId || 'epw';
                        const petNames = (appt.pets || []).map(ap => ap.pet?.name).filter(Boolean).join(' & ');
                        const msgs = [
                          { icon: '🚗', label: 'On my way', text: `Hi ${appt.client.name}! I'm on my way to your home. See you soon! — ${companyId === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}` },
                          { icon: '🏠', label: "I'm here", text: `Hi ${appt.client.name}! I've arrived at your home. — ${companyId === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}` },
                          { icon: '✅', label: 'Pet is ready', text: `Hi ${appt.client.name}! ${petNames || 'Your pet'} is ready and looking amazing! 🐾 — ${companyId === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}` },
                        ];
                        return (
                          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📱 Quick Messages</div>
                            {msgs.map((m, i) => (
                              <button key={i} onClick={async () => {
                                const companyId = vans.find(v => v.id === appt.vanId)?.companyId || 'epw';
                                const ok = await sendSMSApi(appt.client.phone, m.text, companyId, String(appt.clientId), appt.client.name);
                                if (ok) alert('✅ Message sent!');
                                else window.open(`sms:${appt.client.phone}&body=${encodeURIComponent(m.text)}`);
                              }} style={{ ...styles.btnSecondary, justifyContent: 'flex-start', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                                {m.icon} {m.label}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                      {!isGroomer && appt.client?.phone && (
                        <div style={{ position: 'relative', display: 'flex', gap: 6 }}>
                          <a href={`tel:${appt.client.phone}`} style={{ ...styles.btnSecondary, justifyContent: 'center', textDecoration: 'none', borderColor: '#0f766e', color: '#0f766e', flex: 1 }}>
                            📞 Call
                          </a>
                          <a href={`sms:${appt.client.phone}`} style={{ ...styles.btnSecondary, justifyContent: 'center', textDecoration: 'none', borderColor: '#3b82f6', color: '#3b82f6', flex: 1 }}>
                            💬 SMS
                          </a>
                        </div>
                      )}

                      {appt.status !== 'cancelled' && appt.status !== 'completed' && isAdmin && (
                        <button onClick={async () => { if (confirm('Cancel and delete this appointment?')) { await deleteAppt(appt.id); await refreshAppointments(); } }}
                          style={{ ...styles.btnDanger, justifyContent: 'center' }}>
                          ✕ Cancel
                        </button>
                      )}
                    </div>
                    {appt.notes && <div style={{ fontSize: 12, color: '#64748b', padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>📝 {appt.notes}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Modal de firma */}
      {showSignature && (
        <SignatureModal
          appt={showSignature}
          companyId={vans.find(v => v.id === showSignature.vanId)?.companyId || 'epw'}
          onSave={(sig) => handleSaveSignature(showSignature, sig)}
          onClose={() => setShowSignature(null)}
        />
      )}


      {/* ===== MODAL COBRO WIZARD ===== */}
      {showCobroForm && (() => {
        const appt = showCobroForm;
        const pets = appt.pets || [];
        const subtotal = pets.reduce((s, ap) => s + (ap.amount || 0), 0);
        const gasFee = parseFloat(settings.gasFee || 7);
        const cardFeePct = parseFloat(settings.cardFeePct || 5.5);
        const isCard = cobroForm.method === 'Credit Card';
        const isGuarantee = cobroForm.method === 'Guarantee';
        const cardFee = isCard ? subtotal * (cardFeePct / 100) : 0;
        const tip = parseFloat(cobroForm.tip || 0);
        const total = isGuarantee ? 0 : subtotal + (isCard ? cardFee : 0) + tip;
        const step = cobroForm.step || 1;

        return (
          <div onClick={() => setShowCobroForm(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 36px', maxWidth: 460, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Handle */}
              <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 999, margin: '0 auto 16px' }} />

              {/* Progress steps */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                {[1,2,3].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: step >= s ? '#0f766e' : '#f1f5f9', color: step >= s ? '#fff' : '#94a3b8' }}>{s}</div>
                    {s < 3 && <div style={{ width: 32, height: 2, background: step > s ? '#0f766e' : '#e2e8f0' }} />}
                  </div>
                ))}
              </div>

              {/* PASO 1 — Resumen */}
              {step === 1 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Step 1 of 3</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>💰 {appt.client?.name}</div>

                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 16, border: '1px solid #e2e8f0' }}>
                    {pets.map((ap, i) => (
                      <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < pets.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>🐾 {ap.pet?.name || ap.petName || 'Pet'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: '#64748b' }}>{ap.service || 'Service'}</span>
                          <span style={{ fontWeight: 600 }}>${(ap.amount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: '1.5px dashed #e2e8f0', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
                      <span>Total</span>
                      <span style={{ color: '#0f766e', fontFamily: 'Fraunces, serif' }}>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={() => setCobroForm(f => ({...f, step: 2}))}
                    style={{ width: '100%', padding: 16, background: '#0f766e', border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                    Next → Choose Payment Method
                  </button>
                </div>
              )}

              {/* PASO 2 — Método de pago */}
              {step === 2 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Step 2 of 3</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>How are they paying?</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
                    {['Cash', 'Zelle', 'Credit Card', 'Check', 'Guarantee'].map(method => {
                      const icons = { Cash: '💵', Zelle: '📱', 'Credit Card': '💳', Check: '📄', Guarantee: '🎁' };
                      const selected = cobroForm.method === method;
                      return (
                        <button key={method} onClick={() => setCobroForm(f => ({...f, method}))}
                          style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${selected ? '#0f766e' : '#e2e8f0'}`, background: selected ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 14, fontWeight: selected ? 700 : 400, color: selected ? '#0f766e' : '#374151', gridColumn: method === 'Guarantee' ? 'span 2' : 'auto' }}>
                          {icons[method]} {method}
                          {method === 'Credit Card' && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>+{cardFeePct}% fee</div>}
                          {method === 'Guarantee' && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>$0 — no charge</div>}
                        </button>
                      );
                    })}
                  </div>

                  {!isGuarantee && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, display: 'block' }}>💝 Tip</label>
                      {/* Tip percentage buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                        {[18, 20, 25, 'Custom'].map(pct => {
                          const tipAmt = pct === 'Custom' ? null : parseFloat((subtotal * pct / 100).toFixed(2));
                          const isSelected = pct === 'Custom'
                            ? cobroForm.customTip
                            : parseFloat(cobroForm.tip || 0) === tipAmt && !cobroForm.customTip;
                          return (
                            <button key={pct} type="button"
                              onClick={() => {
                                if (pct === 'Custom') {
                                  setCobroForm(f => ({...f, customTip: true, tip: ''}));
                                } else {
                                  setCobroForm(f => ({...f, customTip: false, tip: tipAmt}));
                                }
                              }}
                              style={{ padding: '10px 4px', borderRadius: 10, border: `2px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`, background: isSelected ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: isSelected ? 700 : 400, color: isSelected ? '#0f766e' : '#374151', textAlign: 'center' }}>
                              <div>{pct === 'Custom' ? '✏️' : `${pct}%`}</div>
                              {tipAmt !== null && <div style={{ fontSize: 11, color: isSelected ? '#0f766e' : '#94a3b8', marginTop: 2 }}>${tipAmt}</div>}
                              {pct === 'Custom' && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Custom</div>}
                            </button>
                          );
                        })}
                      </div>
                      {/* Custom tip input */}
                      {cobroForm.customTip && (
                        <input type="number" step="0.01" value={cobroForm.tip}
                          onChange={e => setCobroForm(f => ({...f, tip: e.target.value}))}
                          style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #0f766e', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }}
                          placeholder="Enter tip amount..." autoFocus />
                      )}
                      {/* No tip option */}
                      <button type="button" onClick={() => setCobroForm(f => ({...f, tip: 0, customTip: false}))}
                        style={{ marginTop: 8, width: '100%', padding: '8px', background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#94a3b8' }}>
                        No tip
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setCobroForm(f => ({...f, step: 1}))}
                      style={{ flex: 1, padding: 14, background: '#f1f5f9', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>
                      ← Back
                    </button>
                    <button onClick={() => setCobroForm(f => ({...f, step: 3}))}
                      style={{ flex: 2, padding: 14, background: '#0f766e', border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                      Next → Review
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3 — Confirmar */}
              {step === 3 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Step 3 of 3</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>✅ Ready to collect</div>

                  <div style={{ background: '#f0fdfa', borderRadius: 14, padding: '16px', marginBottom: 16, border: '1.5px solid #0f766e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ color: '#64748b' }}>Client</span>
                      <span style={{ fontWeight: 600 }}>{appt.client?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ color: '#64748b' }}>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {isCard && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                        <span style={{ color: '#64748b' }}>Card fee {cardFeePct}%</span>
                        <span>+${cardFee.toFixed(2)}</span>
                      </div>
                    )}
                    {tip > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                        <span style={{ color: '#64748b' }}>💝 Tip</span>
                        <span>+${tip.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                      <span style={{ color: '#64748b' }}>Method</span>
                      <span style={{ fontWeight: 600 }}>{cobroForm.method}</span>
                    </div>
                    <div style={{ borderTop: '1.5px solid #0f766e', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: 18 }}>TOTAL</span>
                      <span style={{ fontWeight: 800, fontSize: 22, color: '#0f766e', fontFamily: 'Fraunces, serif' }}>
                        {isGuarantee ? 'FREE' : `$${total.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setCobroForm(f => ({...f, step: 2}))}
                      style={{ flex: 1, padding: 14, background: '#f1f5f9', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>
                      ← Back
                    </button>
                    {isCard && !isGuarantee ? (
                      <button onClick={() => {
                        const van = vans.find(v => v.id === showCobroForm.vanId);
                        const companyId = van?.companyId || showCobroForm.companyId || 'epw';
                        const amountCents = Math.round(total * 100);
                        const note = encodeURIComponent(showCobroForm.client?.name || 'Client');
                        window.location.href = `square-commerce-v1://payment/create?amount=${amountCents}&currency=USD&notes=${note}&supported_tender_types=CREDIT_CARD,APPLE_PAY,GOOGLE_PAY`;
                        setTimeout(() => handleConfirmarCobro(), 4000);
                      }}
                        style={{ flex: 2, padding: 14, background: '#0070ba', border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        💳 Pay with Square ${total.toFixed(2)}
                      </button>
                    ) : (
                      <button onClick={handleConfirmarCobro} disabled={saving}
                        style={{ flex: 2, padding: 14, background: '#0f766e', border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={18} />}
                        {saving ? 'Processing...' : `✅ Collect ${isGuarantee ? 'FREE' : '$' + total.toFixed(2)}`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal ficha de grooming */}
      {showGroomingForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowGroomingForm(null); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto',
            padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
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
                        {(() => {
                          const val = groomingRecord[toolKey];
                          if (!val) return null;
                          const combo = DEFAULT_COMBOS.find(c => c.label === val || c.label === val.replace("Combo ", ""));
                          const blade = DEFAULT_BLADES.find(b => b.label === val);
                          if (combo) return <div style={{ marginTop: 4 }}><ComboChip label={combo.label} color={combo.color} textColor={combo.textColor} mm={combo.mm} size="sm" /></div>;
                          if (blade) return <div style={{ marginTop: 4 }}><ComboChip label={blade.label} color={blade.color} textColor={blade.textColor} mm={blade.mm} size="sm" /></div>;
                          return null;
                        })()}
                      </div>
                      <div>
                        <label style={{ ...styles.lbl, fontSize: 10 }}>Notes del área</label>
                        <input value={groomingRecord[notesKey]} onChange={e => setGroomingRecord(r => ({...r, [notesKey]: e.target.value}))}
                          style={{ ...styles.input, fontSize: 12 }} placeholder={`Notes de ${label.toLowerCase()}...`} />
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
                {[['healthSkin','Piel'],['healthEars','Orejas'],['healthNails','Uñas'],['healthBehavior','Behavior']].map(([key, label]) => (
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

            {/* Notes */}
            <div style={{ marginTop: 14 }}>
              <label style={styles.lbl}>Notes especiales</label>
              <textarea value={groomingRecord.notes} onChange={e => setGroomingRecord(r => ({...r, notes: e.target.value}))}
                style={{ ...styles.input, minHeight: 70, resize: 'vertical' }} placeholder="Instrucciones especiales, observaciones del corte..." />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setShowGroomingForm(null)} style={styles.btnSecondary}><X size={15} /> Cancel</button>
              <button onClick={() => handleSaveGrooming(showGroomingForm.appointmentId || selectedAppt, showGroomingForm.petId)} style={styles.btnPrimary} disabled={saving}>
                {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                {saving ? 'Guardando...' : 'Save ficha'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showInvoice && (
        <InvoiceModal invoice={showInvoice} onClose={() => setShowInvoice(null)} />
      )}
    </div>
  );
}

// ===== GASOLINA SECTION =====
function GasSection({ vanId, vans, fuelLogs, setFuelLogs, isAdmin }) {
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
        <h3 style={styles.cardH3}>⛽ Registrar carga de gas</h3>
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
              <option value="tarjeta-company">💳 Tarjeta company</option>
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
                        {formatDateNice(log.date)} · {log.method === 'cash' ? '💵 Cash' : '💳 Tarjeta company'}
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
                        <button onClick={async () => { if (!confirm('¿Delete?')) return; await deleteFuelLog(log.id); setFuelLogs(prev => prev.filter(f => f.id !== log.id)); }}
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

// ===== CLOSE REVIEW TAB =====
function CloseReviewTab({ appointments, vans, settings, refreshAppointments, updateApptStatus, services, setServices, lockedCompanyId = null }) {
  const [viewMode, setViewMode] = useState('day');
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [filterCompany, setFilterCompany] = useState(lockedCompanyId || 'all');
  const [filterVan, setFilterVan] = useState('all');

  const { start: weekStart, end: weekEnd } = getWeekRange(date);

  // Vans filtradas por company
  const companyVans = useMemo(() => {
    if (filterCompany === 'all') return vans;
    return vans.filter(v => v.companyId === filterCompany);
  }, [vans, filterCompany]);

  const reviewAppts = useMemo(() => {
    return appointments
      .filter(a => {
        if (a.status !== 'admin_review') return false;
        if (viewMode === 'day') { if (a.date !== date) return false; }
        else { if (!inRange(a.date, weekStart, weekEnd)) return false; }
        const van = vans.find(v => v.id === a.vanId);
        if (lockedCompanyId && van?.companyId !== lockedCompanyId) return false;
        if (filterCompany !== 'all' && van?.companyId !== filterCompany) return false;
        if (filterVan !== 'all' && a.vanId !== filterVan) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.timeStart || '').localeCompare(b.timeStart || ''));
  }, [appointments, viewMode, date, weekStart, weekEnd, filterCompany, filterVan, vans]);

  const approveAppt = async (appt) => {
    const van = vans.find(v => v.id === appt.vanId);
    const companyId = van?.companyId || appt.companyId || 'epw';
    const method = appt.pets?.[0]?.method || 'Cash';
    const tip = appt.pets?.[0]?.tip || 0;
    const cardFee = appt.pets?.[0]?.cardFee || 0;
    const gasFee = settings?.gasFee || 7;
    const subtotal = (appt.pets || []).reduce((sum, ap) => sum + (ap.amount || 0), 0);
    const total = subtotal + (method === 'Credit Card' ? cardFee : 0) + tip;

    for (const ap of (appt.pets || [])) {
      const apMethod = ap.method || method;
      const apTip = ap.tip || tip;
      const apCardFee = ap.cardFee || cardFee;
      await supabase.from('services').insert({
        id: uid(), date: appt.date, van_id: appt.vanId,
        client: appt.client?.name || '', pet: ap.pet?.name || '',
        service: ap.service || '', method: apMethod,
        amount: ap.amount || 0, tip: apTip, card_fee: apCardFee,
      });
    }
    const invoiceNumber = await getNextInvoiceNumber(companyId);
    await saveInvoice({
      id: uid(), invoiceNumber, companyId,
      appointmentId: appt.id, clientId: appt.clientId,
      clientName: appt.client?.name || '',
      clientAddress: appt.client?.address || '',
      groomerName: van?.groomer || '',
      vanName: van?.name || '', date: appt.date,
      services: (appt.pets || []).map(ap => ({ petName: ap.pet?.name || 'Pet', service: ap.service || '', amount: ap.amount || 0 })),
      subtotal, gasFee, cardFee, tip, total, method,
    });
    await updateApptStatus(appt.id, 'completed');
  };

  const handleApproveAll = async () => {
    if (!reviewAppts.length) return;
    if (!confirm(`✅ Approve all ${reviewAppts.length} appointment${reviewAppts.length !== 1 ? 's' : ''}?`)) return;
    setSaving(true);
    for (const appt of reviewAppts) {
      await approveAppt(appt);
    }
    await refreshAppointments();
    setSaving(false);
  };

  const handleApproveOne = async (appt) => {
    setSaving(true);
    await approveAppt(appt);
    await refreshAppointments();
    setSaving(false);
  };

  const handleReopen = async (appt) => {
    if (!confirm('⚠️ Reopen this appointment?\n\nThis will:\n• Change status back to In Progress\n• Delete the financial record and invoice\n• Return to Close Review queue\n\nContinue?')) return;
    // Borrar registro financiero para que se pueda re-aprobar
    await supabase.from('invoices').delete().eq('appointment_id', appt.id);
    await supabase.from('services').delete().eq('appointment_id', appt.id);
    // Cambiar status a admin_review para que vuelva al Close Review
    await updateApptStatus(appt.id, 'admin_review');
    await refreshAppointments();
  };

  // Agrupar por día
  const byDay = useMemo(() => {
    const map = {};
    reviewAppts.forEach(a => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [reviewAppts]);

  const totalPending = reviewAppts.reduce((sum, a) =>
    sum + (a.pets || []).reduce((s, ap) => s + (ap.amount || 0), 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Admin" title="💰 Close Review" />

      {/* Filtros */}
      <div style={{ ...styles.card, marginBottom: 16 }}>
        {/* Day / Week */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, gap: 2 }}>
            <button onClick={() => setViewMode('day')}
              style={{ padding: '7px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: viewMode === 'day' ? 700 : 400, background: viewMode === 'day' ? '#fff' : 'transparent', color: viewMode === 'day' ? '#0f766e' : '#64748b' }}>
              📅 Day
            </button>
            <button onClick={() => setViewMode('week')}
              style={{ padding: '7px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: viewMode === 'week' ? 700 : 400, background: viewMode === 'week' ? '#fff' : 'transparent', color: viewMode === 'week' ? '#0f766e' : '#64748b' }}>
              📆 Week
            </button>
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ ...styles.input, width: 160 }} />
          {viewMode === 'week' && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{formatDateNice(weekStart)} — {formatDateNice(weekEnd)}</div>
          )}
        </div>

        {/* Company filter - oculto si lockedCompanyId */}
        {!lockedCompanyId && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'center' }}>Company:</span>
          {[{ id: 'all', label: '🏢 All' }, ...DEFAULT_COMPANIES.map(c => ({ id: c.id, label: `${c.logoEmoji} ${c.name}` }))].map(c => (
            <button key={c.id} onClick={() => { setFilterCompany(c.id); setFilterVan('all'); }}
              style={{ padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${filterCompany === c.id ? '#0f766e' : '#e2e8f0'}`, background: filterCompany === c.id ? '#f0fdfa' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: filterCompany === c.id ? 700 : 400, color: filterCompany === c.id ? '#0f766e' : '#64748b' }}>
              {c.label}
            </button>
          ))}
        </div>
        )}

        {/* Groomer/Van filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'center' }}>Groomer:</span>
          <button onClick={() => setFilterVan('all')}
            style={{ padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${filterVan === 'all' ? '#0f766e' : '#e2e8f0'}`, background: filterVan === 'all' ? '#f0fdfa' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: filterVan === 'all' ? 700 : 400, color: filterVan === 'all' ? '#0f766e' : '#64748b' }}>
            All
          </button>
          {companyVans.filter(v => v.active !== false).map(v => {
            const pendingForVan = appointments.filter(a => a.status === 'admin_review' && a.vanId === v.id).length;
            return (
              <button key={v.id} onClick={() => setFilterVan(v.id)}
                style={{ padding: '5px 12px', borderRadius: 999, border: `1.5px solid ${filterVan === v.id ? '#0f766e' : '#e2e8f0'}`, background: filterVan === v.id ? '#f0fdfa' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: filterVan === v.id ? 700 : 400, color: filterVan === v.id ? '#0f766e' : '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                {v.groomer || v.name}
                {pendingForVan > 0 && <span style={{ background: '#f97316', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{pendingForVan}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      {reviewAppts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ ...styles.kpiCard, borderTop: '3px solid #f97316', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 800, color: '#f97316', marginTop: 4 }}>{reviewAppts.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>appointments</div>
          </div>
          <div style={{ ...styles.kpiCard, borderTop: '3px solid #0f766e', textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 800, color: '#0f766e', marginTop: 4 }}>{fmt(totalPending)}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>to approve</div>
          </div>
        </div>
      )}

      {/* Approve All */}
      {reviewAppts.length > 0 && (
        <button onClick={handleApproveAll} disabled={saving}
          style={{ width: '100%', padding: '14px', background: saving ? '#94a3b8' : '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : '✅'}
          {saving ? 'Approving...' : `Approve All (${reviewAppts.length})`}
        </button>
      )}

      {/* Lista por día */}
      {reviewAppts.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>
            No pending appointments
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8' }}>
            All caught up for this {viewMode}!
          </p>
        </div>
      ) : byDay.map(([dayDate, dayAppts]) => (
        <div key={dayDate} style={{ marginBottom: 20 }}>
          {/* Header del día */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              📅 {formatDateNice(dayDate)}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              {dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''} · {fmt(dayAppts.reduce((s, a) => s + (a.pets || []).reduce((ps, ap) => ps + (ap.amount || 0), 0), 0))}
            </div>
          </div>

          {dayAppts.map(appt => {
            const van = vans.find(v => v.id === appt.vanId);
            const method = appt.pets?.[0]?.method || 'Cash';
            const tip = appt.pets?.[0]?.tip || 0;
            const cardFee = appt.pets?.[0]?.cardFee || 0;
            const subtotal = (appt.pets || []).reduce((sum, ap) => sum + (ap.amount || 0), 0);
            const total = subtotal + (method === 'Credit Card' ? cardFee : 0) + tip;

            return (
              <div key={appt.id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #fed7aa', padding: '14px 16px', marginBottom: 10 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{appt.client?.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      🚐 {van?.name} · ⏰ {appt.timeStart}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, color: '#0f766e' }}>${total.toFixed(2)}</div>
                    <MethodChip method={method} />
                  </div>
                </div>

                {/* Pets */}
                {(appt.pets || []).map((ap, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ color: '#374151' }}>🐾 {ap.pet?.name} — {ap.service || 'Service'}</span>
                    <span style={{ fontWeight: 600 }}>${(ap.amount || 0).toFixed(2)}</span>
                  </div>
                ))}

                {/* Totales */}
                <div style={{ marginTop: 8, padding: '8px 10px', background: '#f8fafc', borderRadius: 8, fontSize: 12 }}>
                  {tip > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: 3 }}><span>Tip</span><span>+${tip.toFixed(2)}</span></div>}
                  {method === 'Credit Card' && cardFee > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7c3aed', marginBottom: 3 }}><span>Card fee</span><span>+${cardFee.toFixed(2)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Gas fee ${settings?.gasFee || 7} → empresa</div>
                </div>

                {/* Editar precios antes de aprobar */}
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>✏️ Edit prices before approving</div>
                  {(appt.pets || []).map((ap, i) => (
                    <div key={ap.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>🐾 {ap.pet?.name || 'Pet'} — {ap.service || ''}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>$</span>
                        <input type='number' step='0.01' defaultValue={ap.amount || 0}
                          onBlur={async e => {
                            const newAmount = parseFloat(e.target.value) || 0;
                            await supabase.from('appointment_pets').update({ amount: newAmount }).eq('id', ap.id);
                            await refreshAppointments();
                          }}
                          style={{ width: 80, padding: '4px 8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: 'right' }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Botones */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => handleApproveOne(appt)} disabled={saving}
                    style={{ flex: 1, padding: '11px', background: '#0f766e', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : '✅'} Approve & Close
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
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
          {isAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => exportDailyPDF(services, vans, start, end, settings)}
                style={{ ...styles.btnSecondary, fontSize: 12, padding: '6px 12px' }}>
                <FileText size={13} /> PDF
              </button>
            </div>
          )}
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
            {rangeMode ? '📅 Ver un day' : '📅 Ver rango'}
          </button>
          {isAdmin && (
            <button onClick={() => exportDailyPDF(services, vans, start, end, settings)}
              style={{ ...styles.btnPrimary, padding: '9px 14px', fontSize: 13 }}>
              <FileText size={13} /> Export PDF
            </button>
          )}
        </div>
      </div>

      {/* KPIs principales */}
      <div style={styles.kpiGrid}>
        <KpiCard label="Services" value={grandCount} />
        <KpiCard label="Sales totales" value={fmt(grandTotal)} highlight />
        {grandTips > 0 && <KpiCard label="Tips" value={fmt(grandTips)} />}
        {grandCardFees > 0 && <KpiCard label="Fee tarjeta" value={fmt(grandCardFees)} />}
        <KpiCard label="Fee gas" value={fmt(grandGasFees)} />
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Fee gas</span><span style={{ color: '#0284c7', fontWeight: 600 }}>{fmt(b.gasFees)}</span></div>
                      {b.expTotal > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '3px 0' }}><span>Expenses del day</span><span style={{ color: '#dc2626', fontWeight: 600 }}>-{fmt(b.expTotal)}</span></div>}
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

// ===== BOARDING MODULE =====
const BOARDING_AGREEMENT = `BOARDING SERVICE AGREEMENT — Group Guerrero

1. HEALTH REQUIREMENTS
All pets must be current on Rabies, Bordetella, and DHPP vaccinations. Owner must provide proof upon request. We reserve the right to refuse boarding to any pet that appears ill or poses a health risk to other animals.

2. FEEDING & CARE
Owner must provide pet's regular food to avoid digestive upset. Feeding schedule will follow owner's instructions. We will provide fresh water at all times. Additional feeding costs may apply for special diets.

3. PET BEHAVIOR
Owner must disclose any history of aggression, anxiety, or behavioral issues. We reserve the right to contact the owner or terminate boarding if the pet poses a danger to staff or other animals.

4. MEDICAL EMERGENCIES
In case of a medical emergency, we will attempt to contact the owner immediately. If unreachable, we reserve the right to seek veterinary care at the owner's expense. Owner authorizes emergency veterinary treatment if necessary.

5. PERSONAL BELONGINGS
We are not responsible for loss or damage to personal items brought by the pet (toys, beds, bowls, etc.). Label all items with your pet's name.

6. MEDICATIONS
We will administer medications as instructed. Owner must provide clear written instructions and all necessary supplies.

7. CANCELLATION POLICY
Cancellations must be made at least 48 hours in advance. No-show or late cancellations may result in forfeiture of deposit.

8. PAYMENT
Full payment is due at check-out. A deposit may be required to hold the reservation. We accept cash, Zelle, and credit card (5.5% processing fee applies).

9. LIABILITY
Owner agrees that Group Guerrero, its staff, and associates are not liable for illness, injury, or death that may occur during boarding, except in cases of gross negligence. Owner assumes full financial responsibility for any damage caused by their pet.

By signing below, the owner acknowledges reading and agreeing to all terms above.`;

const BOARDING_PRICES = {
  small:  { label: 'Small (0-40 lbs)',   price: 45 },
  medium: { label: 'Medium (0-40 lbs)',  price: 45 },
  large:  { label: 'Large (41-60 lbs)',  price: 50 },
  giant:  { label: 'XL (61-80 lbs)',     price: 60 },
};

function BoardingTab({ clients, pets, session, settings }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRes, setEditingRes] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showPayment, setShowPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ method: 'Cash', amount: '', tip: '' });
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [clientSearch, setClientSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const emptyForm = {
    clientId: '', petId: '', checkIn: todayISO(), checkOut: '', size: 'small',
    includesBath: false, bathPrice: 0, notes: '', status: 'pending', depositPaid: 0, rating: 0, staffId: '',
    foodType: '', foodBrand: '', foodAmount: '', feedingTimes: ['8:00 AM', '6:00 PM'], foodNotes: '',
    ownBowl: false, toys: '', accessories: '', medications: '',
    rabiesDate: '', bordetellaDate: '', dhppDate: '', otherVaccines: '',
    vetName: '', vetPhone: '', medicalConditions: '', agreementSigned: false,
  };
  const [form, setForm] = useState({...emptyForm});

  useEffect(() => { loadReservations(); }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('boarding_reservations').select('*').order('check_in', { ascending: false });
      setReservations(error ? [] : (data || []));
    } catch(e) { setReservations([]); }
    setLoading(false);
  };

  const nights = (a, b) => {
    if (!a || !b) return 0;
    return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
  };

  const calcTotal = (f) => nights(f.checkIn, f.checkOut) * (BOARDING_PRICES[f.size]?.price || 40) + (f.includesBath ? (f.bathPrice || 0) : 0);

  const resetForm = () => { setForm({...emptyForm}); setActiveSection('basic'); };

  const handleSave = async () => {
    if (!form.clientId || !form.petId || !form.checkIn || !form.checkOut) { alert('Fill in all required fields'); return; }
    if (nights(form.checkIn, form.checkOut) < 1) { alert('Check-out must be after check-in'); return; }
    setSaving(true);
    const payload = {
      client_id: form.clientId, pet_id: form.petId, check_in: form.checkIn, check_out: form.checkOut,
      size: form.size, includes_bath: form.includesBath, bath_price: form.includesBath ? (form.bathPrice||0) : 0,
      notes: form.notes, status: form.status, deposit_paid: parseFloat(form.depositPaid)||0, total: calcTotal(form),
      food_type: form.foodType, food_brand: form.foodBrand, food_amount: form.foodAmount,
      feeding_times: form.feedingTimes, food_notes: form.foodNotes, own_bowl: form.ownBowl,
      toys: form.toys, accessories: form.accessories, medications: form.medications,
      rabies_date: form.rabiesDate||null, bordetella_date: form.bordetellaDate||null,
      dhpp_date: form.dhppDate||null, other_vaccines: form.otherVaccines,
      vet_name: form.vetName, vet_phone: form.vetPhone, medical_conditions: form.medicalConditions,
      agreement_signed: form.agreementSigned, rating: form.rating||0,
    };
    if (editingRes) await supabase.from('boarding_reservations').update(payload).eq('id', editingRes.id);
    else await supabase.from('boarding_reservations').insert([payload]);
    await loadReservations();
    setShowForm(false); setEditingRes(null); resetForm(); setSaving(false);
  };

  const handleEdit = (res) => {
    setForm({
      clientId: res.client_id, petId: res.pet_id, checkIn: res.check_in, checkOut: res.check_out,
      size: res.size||'small', includesBath: res.includes_bath, bathPrice: res.bath_price||0,
      notes: res.notes||'', status: res.status, depositPaid: res.deposit_paid||0,
      foodType: res.food_type||'', foodBrand: res.food_brand||'', foodAmount: res.food_amount||'',
      feedingTimes: res.feeding_times||['8:00 AM','6:00 PM'], foodNotes: res.food_notes||'',
      ownBowl: res.own_bowl||false, toys: res.toys||'', accessories: res.accessories||'',
      medications: res.medications||'', rabiesDate: res.rabies_date||'',
      bordetellaDate: res.bordetella_date||'', dhppDate: res.dhpp_date||'',
      otherVaccines: res.other_vaccines||'', vetName: res.vet_name||'',
      vetPhone: res.vet_phone||'', medicalConditions: res.medical_conditions||'',
      agreementSigned: res.agreement_signed||false, rating: res.rating||0,
    });
    setEditingRes(res); setShowForm(true); setActiveSection('basic');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reservation?')) return;
    await supabase.from('boarding_reservations').delete().eq('id', id);
    loadReservations();
  };

  const updateStatus = async (id, status) => {
    await supabase.from('boarding_reservations').update({ status }).eq('id', id);
    loadReservations();
  };

  const handlePayment = async () => {
    if (!paymentForm.amount) { alert('Enter amount'); return; }
    const newPaid = (showPayment.deposit_paid||0) + parseFloat(paymentForm.amount) + (parseFloat(paymentForm.tip)||0);
    await supabase.from('boarding_reservations').update({ deposit_paid: newPaid }).eq('id', showPayment.id);
    loadReservations(); setShowPayment(null); setPaymentForm({ method: 'Cash', amount: '', tip: '' });
  };

  const today = todayISO();
  const activeNow = reservations.filter(r => r.status === 'active' && r.check_in <= today && r.check_out > today).length;
  const checkInsToday = reservations.filter(r => r.check_in === today).length;
  const checkOutsToday = reservations.filter(r => r.check_out === today).length;
  const monthRevenue = reservations.filter(r => r.status !== 'cancelled' && r.check_in?.startsWith(today.slice(0,7))).reduce((s,r) => s+(r.total||0), 0);
  const filteredClients = clientSearch ? clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).slice(0,8) : [];
  const clientPets = pets.filter(p => String(p.clientId||p.client_id) === String(form.clientId));
  const selectedClient = clients.find(c => String(c.id) === String(form.clientId));
  const sc_map = { pending:{bg:'#fef9c3',text:'#854d0e',border:'#fbbf24'}, active:{bg:'#dcfce7',text:'#14532d',border:'#22c55e'}, completed:{bg:'#f1f5f9',text:'#475569',border:'#94a3b8'}, cancelled:{bg:'#fee2e2',text:'#7f1d1d',border:'#f87171'} };
  const inp = { width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, boxSizing:'border-box' };
  const lbl = { fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 };
  const card = { background:'#fff', borderRadius:16, padding:16, border:'1px solid #e2e8f0', marginBottom:12 };

  // Payment screen
  if (showPayment) {
    const bal = (showPayment.total||0) - (showPayment.deposit_paid||0);
    const client = clients.find(c => String(c.id) === String(showPayment.client_id));
    const pet = pets.find(p => String(p.id) === String(showPayment.pet_id));
    return (
      <div style={{ padding:16, maxWidth:500, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <button onClick={() => setShowPayment(null)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer' }}>←</button>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:20, fontWeight:800 }}>💰 Collect Payment</div>
        </div>
        <div style={{ background:'#f0fdfa', borderRadius:16, padding:16, marginBottom:16, border:'1px solid #99f6e4' }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{client?.name}</div>
          <div style={{ fontSize:13, color:'#64748b' }}>🐾 {pet?.name} · {showPayment.check_in} → {showPayment.check_out}</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:18, marginTop:12 }}>
            <span>Balance Due</span>
            <span style={{ color:'#dc2626' }}>${bal.toFixed(2)}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {['Cash','Zelle','Card'].map(m => (
            <button key={m} onClick={() => setPaymentForm(f=>({...f,method:m}))}
              style={{ flex:1, padding:'12px', border:`2px solid ${paymentForm.method===m?'#0f766e':'#e2e8f0'}`, borderRadius:12, background:paymentForm.method===m?'#f0fdfa':'#fff', fontWeight:paymentForm.method===m?700:400, cursor:'pointer', fontSize:14 }}>
              {m==='Cash'?'💵':m==='Zelle'?'📱':'💳'} {m}
            </button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          <div><label style={lbl}>Amount ($)</label>
            <input type="number" value={paymentForm.amount} onChange={e=>setPaymentForm(f=>({...f,amount:e.target.value}))} placeholder={bal.toFixed(2)} style={{...inp,fontSize:16,fontWeight:700}} /></div>
          <div><label style={lbl}>Tip ($)</label>
            <input type="number" value={paymentForm.tip} onChange={e=>setPaymentForm(f=>({...f,tip:e.target.value}))} placeholder="0.00" style={inp} /></div>
        </div>
        <button onClick={handlePayment} style={{ width:'100%', padding:16, background:'#0f766e', border:'none', borderRadius:14, color:'#fff', fontSize:16, fontWeight:800, cursor:'pointer' }}>
          ✅ Collect ${paymentForm.amount||bal.toFixed(2)}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding:16, maxWidth:600, margin:'0 auto', paddingBottom:100 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:22, fontWeight:800 }}>🏠 Casa Group Guerrero</div>
          <div style={{ fontSize:12, color:'#64748b' }}>Pet Boarding · Max: {maxCapacity} spots</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setMaxCapacity(n => { const v = prompt('Max capacity:', n); return parseInt(v)||n; })}
            style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 12px', cursor:'pointer', fontSize:13, color:'#64748b' }}>
            ⚙️ {maxCapacity}
          </button>
          <button onClick={() => { resetForm(); setEditingRes(null); setShowForm(true); setClientSearch(''); }}
            style={{ background:'#0f766e', border:'none', borderRadius:12, padding:'10px 16px', color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            + New
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Dogs In House', value:`${activeNow}/${maxCapacity}`, icon:'🐶', color: activeNow>=maxCapacity?'#dc2626':'#0f766e' },
          { label:'Check-ins Today', value:checkInsToday, icon:'📥', color:'#7c3aed' },
          { label:'Check-outs Today', value:checkOutsToday, icon:'📤', color:'#ea580c' },
          { label:'Month Revenue', value:`$${monthRevenue.toFixed(0)}`, icon:'💰', color:'#0369a1' },
        ].map((s,i) => (
          <div key={i} style={{ background:'#fff', borderRadius:14, padding:14, border:'1px solid #e2e8f0', textAlign:'center' }}>
            <div style={{ fontSize:24 }}>{s.icon}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      {activeNow > 0 && (
        <div style={{ background:'#fff', borderRadius:12, padding:'10px 16px', border:'1px solid #e2e8f0', marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b', marginBottom:6 }}>
            <span>Occupancy</span><span style={{ fontWeight:700, color:activeNow>=maxCapacity?'#dc2626':'#0f766e' }}>{activeNow}/{maxCapacity}</span>
          </div>
          <div style={{ background:'#f1f5f9', borderRadius:20, height:8 }}>
            <div style={{ background:activeNow>=maxCapacity?'#dc2626':'#0f766e', height:'100%', width:`${Math.min(100,(activeNow/maxCapacity)*100)}%`, borderRadius:20 }} />
          </div>
        </div>
      )}

      {/* View toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[['list','📋 List'],['calendar','📅 Calendar']].map(([m,l]) => (
          <button key={m} onClick={() => setViewMode(m)}
            style={{ padding:'8px 16px', borderRadius:20, border:`1.5px solid ${viewMode===m?'#0f766e':'#e2e8f0'}`, background:viewMode===m?'#f0fdfa':'#fff', color:viewMode===m?'#0f766e':'#64748b', fontWeight:viewMode===m?700:400, fontSize:13, cursor:'pointer' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Calendar */}
      {viewMode === 'calendar' && (
        <div style={{ background:'#fff', borderRadius:16, padding:16, border:'1px solid #e2e8f0', marginBottom:16, overflowX:'auto' }}>
          <div style={{ fontWeight:700, marginBottom:12, fontSize:14 }}>📅 Next 14 Days</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(14,1fr)', gap:4, minWidth:500 }}>
            {Array.from({length:14},(_,i) => { const d=new Date(); d.setDate(d.getDate()+i); return d.toISOString().split('T')[0]; }).map(day => {
              const count = reservations.filter(r => r.status!=='cancelled' && r.check_in<=day && r.check_out>day).length;
              const pct = maxCapacity>0?count/maxCapacity:0;
              return (
                <div key={day} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:9, color:'#94a3b8', marginBottom:4 }}>{new Date(day+'T12:00:00').toLocaleDateString('en',{weekday:'short'}).slice(0,1)}<br/>{day.slice(8)}</div>
                  <div style={{ height:36, background:count===0?'#f1f5f9':pct>=1?'#fee2e2':pct>=0.7?'#fef9c3':'#dcfce7', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', border:day===today?'2px solid #0f766e':'none' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:count===0?'#94a3b8':pct>=1?'#dc2626':'#0f766e' }}>{count>0?count:''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ ...card, border:'2px solid #0f766e', marginBottom:16 }}>
          <div style={{ fontWeight:800, fontSize:16, marginBottom:14 }}>{editingRes?'✏️ Edit':'🏠 New Reservation'}</div>
          <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto' }}>
            {[['basic','📋 Basic'],['feeding','🍽️ Feeding'],['health','💉 Health'],['agreement','📄 Agreement']].map(([s,l]) => (
              <button key={s} onClick={() => setActiveSection(s)}
                style={{ padding:'7px 12px', borderRadius:20, border:`1.5px solid ${activeSection===s?'#0f766e':'#e2e8f0'}`, background:activeSection===s?'#f0fdfa':'#fff', color:activeSection===s?'#0f766e':'#64748b', fontWeight:activeSection===s?700:400, fontSize:12, cursor:'pointer', whiteSpace:'nowrap' }}>
                {l}
              </button>
            ))}
          </div>

          {activeSection === 'basic' && (
            <div>
              <div style={{ marginBottom:12 }}>
                <label style={lbl}>Client *</label>
                {form.clientId ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'#f0fdfa', borderRadius:10, border:'1.5px solid #0f766e' }}>
                    <span style={{ fontWeight:600, flex:1 }}>{selectedClient?.name}</span>
                    <button onClick={() => setForm(f=>({...f,clientId:'',petId:''}))} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b' }}>✕</button>
                  </div>
                ) : (
                  <div>
                    <input value={clientSearch} onChange={e=>setClientSearch(e.target.value)} placeholder="Search client..." style={inp} />
                    {clientSearch && (
                      <div style={{ border:'1px solid #e2e8f0', borderRadius:10, marginTop:4, overflow:'hidden' }}>
                        {filteredClients.length ? filteredClients.map(c => (
                          <div key={c.id} onClick={() => { setForm(f=>({...f,clientId:String(c.id),petId:''})); setClientSearch(''); }}
                            style={{ padding:'10px 12px', cursor:'pointer', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                            {c.name} <span style={{ color:'#94a3b8', fontSize:12 }}>{c.phone}</span>
                          </div>
                        )) : <div style={{ padding:'10px 12px', color:'#94a3b8', fontSize:13 }}>No clients found</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {form.clientId && (
                <div style={{ marginBottom:12 }}>
                  <label style={lbl}>Pet *</label>
                  <select value={form.petId} onChange={e=>setForm(f=>({...f,petId:e.target.value}))} style={inp}>
                    <option value="">Select pet...</option>
                    {clientPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
                  </select>
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div><label style={lbl}>Check-in *</label><input type="date" value={form.checkIn} onChange={e=>setForm(f=>({...f,checkIn:e.target.value}))} style={inp} /></div>
                <div><label style={lbl}>Check-out *</label><input type="date" value={form.checkOut} min={form.checkIn} onChange={e=>setForm(f=>({...f,checkOut:e.target.value}))} style={inp} /></div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={lbl}>Size & Price per Night</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6 }}>
                  {Object.entries(BOARDING_PRICES).map(([k,v]) => (
                    <button key={k} onClick={() => setForm(f=>({...f,size:k}))}
                      style={{ padding:'10px', border:`2px solid ${form.size===k?'#0f766e':'#e2e8f0'}`, borderRadius:10, background:form.size===k?'#f0fdfa':'#fff', cursor:'pointer', textAlign:'left' }}>
                      <div style={{ fontWeight:700, fontSize:13, color:form.size===k?'#0f766e':'#0f172a' }}>{v.label}</div>
                      <div style={{ fontSize:12, color:'#64748b' }}>${v.price}/night</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:12, padding:12, background:'#f8fafc', borderRadius:10 }}>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <input type="checkbox" checked={form.includesBath} onChange={e=>setForm(f=>({...f,includesBath:e.target.checked}))} style={{ width:18, height:18 }} />
                  <span style={{ fontWeight:600, fontSize:14 }}>🛁 Bath on check-out</span>
                </label>
                {form.includesBath && <div style={{ marginTop:10 }}><label style={lbl}>Bath price ($)</label><input type="number" value={form.bathPrice} onChange={e=>setForm(f=>({...f,bathPrice:parseFloat(e.target.value)||0}))} style={inp} /></div>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div><label style={lbl}>Status</label>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inp}>
                    <option value="pending">Pending</option><option value="active">Active</option>
                    <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select></div>
                <div><label style={lbl}>Deposit Paid ($)</label><input type="number" value={form.depositPaid} onChange={e=>setForm(f=>({...f,depositPaid:e.target.value}))} style={inp} /></div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={lbl}>👤 Staff Assigned</label>
                <select value={form.staffId} onChange={e=>setForm(f=>({...f,staffId:e.target.value}))} style={inp}>
                  <option value="">Select staff...</option>
                  <option value="luis">Luis</option>
                  <option value="noemi">Noemí</option>
                  <option value="manuela">Manuela</option>
                </select>
              </div>
              <div style={{ marginBottom:12 }}><label style={lbl}>Notes</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{...inp,minHeight:60,resize:'vertical'}} /></div>
              {form.checkIn && form.checkOut && nights(form.checkIn,form.checkOut)>0 && (
                <div style={{ background:'#f0fdfa', borderRadius:10, padding:12, border:'1px solid #99f6e4', marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span>{nights(form.checkIn,form.checkOut)} nights × ${BOARDING_PRICES[form.size]?.price}</span><span>${(nights(form.checkIn,form.checkOut)*(BOARDING_PRICES[form.size]?.price||0)).toFixed(2)}</span></div>
                  {form.includesBath && <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span>Bath</span><span>${form.bathPrice||0}</span></div>}
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16, borderTop:'1px solid #99f6e4', paddingTop:8, marginTop:8 }}><span>Total</span><span style={{ color:'#0f766e' }}>${calcTotal(form).toFixed(2)}</span></div>
                </div>
              )}
              <div style={{ marginBottom:12 }}>
                <label style={lbl}>⭐ Guest Rating</label>
                <div style={{ display:'flex', gap:6 }}>
                  {[1,2,3,4,5].map(s => <button key={s} onClick={() => setForm(f=>({...f,rating:s}))} style={{ fontSize:26, background:'none', border:'none', cursor:'pointer', opacity:s<=form.rating?1:0.3 }}>⭐</button>)}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'feeding' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div><label style={lbl}>Food Type</label>
                  <select value={form.foodType} onChange={e=>setForm(f=>({...f,foodType:e.target.value}))} style={inp}>
                    <option value="">Select...</option><option value="kibble">Kibble</option><option value="wet">Wet food</option><option value="raw">Raw</option><option value="homemade">Homemade</option><option value="mixed">Mixed</option>
                  </select></div>
                <div><label style={lbl}>Brand</label><input value={form.foodBrand} onChange={e=>setForm(f=>({...f,foodBrand:e.target.value}))} placeholder="e.g. Royal Canin" style={inp} /></div>
              </div>
              <div style={{ marginBottom:12 }}><label style={lbl}>Amount per meal</label><input value={form.foodAmount} onChange={e=>setForm(f=>({...f,foodAmount:e.target.value}))} placeholder="e.g. 1 cup" style={inp} /></div>
              <div style={{ marginBottom:12 }}>
                <label style={lbl}>Feeding Times</label>
                {(form.feedingTimes||[]).map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                    <input value={t} onChange={e=>{ const times=[...form.feedingTimes]; times[i]=e.target.value; setForm(f=>({...f,feedingTimes:times})); }} style={{...inp,flex:1}} placeholder="e.g. 8:00 AM" />
                    <button onClick={() => setForm(f=>({...f,feedingTimes:f.feedingTimes.filter((_,j)=>j!==i)}))} style={{ background:'#fee2e2', border:'none', borderRadius:8, padding:'8px 10px', cursor:'pointer', color:'#dc2626' }}>✕</button>
                  </div>
                ))}
                <button onClick={() => setForm(f => ({...f, feedingTimes: [...(f.feedingTimes||[]), '']}))} style={{ padding:'8px', border:'1.5px dashed #e2e8f0', borderRadius:8, background:'none', cursor:'pointer', color:'#64748b', fontSize:13, width:'100%' }}>+ Add time</button>
              </div>
              <div style={{ marginBottom:12 }}><label style={lbl}>Food notes / allergies</label><textarea value={form.foodNotes} onChange={e=>setForm(f=>({...f,foodNotes:e.target.value}))} style={{...inp,minHeight:60,resize:'vertical'}} /></div>
              <div style={{ marginBottom:12, padding:12, background:'#f8fafc', borderRadius:10 }}>
                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <input type="checkbox" checked={form.ownBowl} onChange={e=>setForm(f=>({...f,ownBowl:e.target.checked}))} style={{ width:18, height:18 }} />
                  <span style={{ fontWeight:600 }}>🥣 Owner brings own bowl</span>
                </label>
              </div>
              <div style={{ marginBottom:12 }}><label style={lbl}>🧸 Toys</label><input value={form.toys} onChange={e=>setForm(f=>({...f,toys:e.target.value}))} style={inp} /></div>
              <div style={{ marginBottom:12 }}><label style={lbl}>🎒 Accessories / Belongings</label><textarea value={form.accessories} onChange={e=>setForm(f=>({...f,accessories:e.target.value}))} style={{...inp,minHeight:60,resize:'vertical'}} /></div>
            </div>
          )}

          {activeSection === 'health' && (
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>💉 Vaccines</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div><label style={lbl}>Rabies exp.</label><input type="date" value={form.rabiesDate} onChange={e=>setForm(f=>({...f,rabiesDate:e.target.value}))} style={inp} /></div>
                <div><label style={lbl}>Bordetella exp.</label><input type="date" value={form.bordetellaDate} onChange={e=>setForm(f=>({...f,bordetellaDate:e.target.value}))} style={inp} /></div>
                <div><label style={lbl}>DHPP exp.</label><input type="date" value={form.dhppDate} onChange={e=>setForm(f=>({...f,dhppDate:e.target.value}))} style={inp} /></div>
                <div><label style={lbl}>Other</label><input value={form.otherVaccines} onChange={e=>setForm(f=>({...f,otherVaccines:e.target.value}))} style={inp} /></div>
              </div>
              <div style={{ marginBottom:12 }}><label style={lbl}>Medical Conditions</label><textarea value={form.medicalConditions} onChange={e=>setForm(f=>({...f,medicalConditions:e.target.value}))} style={{...inp,minHeight:70,resize:'vertical'}} /></div>
              <div style={{ marginBottom:12 }}><label style={lbl}>💊 Medications</label><textarea value={form.medications} onChange={e=>setForm(f=>({...f,medications:e.target.value}))} style={{...inp,minHeight:70,resize:'vertical'}} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><label style={lbl}>Vet Name</label><input value={form.vetName} onChange={e=>setForm(f=>({...f,vetName:e.target.value}))} style={inp} /></div>
                <div><label style={lbl}>Vet Phone</label><input value={form.vetPhone} onChange={e=>setForm(f=>({...f,vetPhone:e.target.value}))} style={inp} /></div>
              </div>
            </div>
          )}

          {activeSection === 'agreement' && (
            <div>
              <div style={{ background:'#f8fafc', borderRadius:12, padding:16, fontSize:12, lineHeight:1.7, color:'#374151', whiteSpace:'pre-wrap', maxHeight:280, overflowY:'auto', marginBottom:16, border:'1px solid #e2e8f0' }}>
                {BOARDING_AGREEMENT}
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:12, padding:14, background:form.agreementSigned?'#f0fdfa':'#fff', borderRadius:12, border:`2px solid ${form.agreementSigned?'#0f766e':'#e2e8f0'}`, cursor:'pointer' }}>
                <input type="checkbox" checked={form.agreementSigned} onChange={e=>setForm(f=>({...f,agreementSigned:e.target.checked}))} style={{ width:20, height:20 }} />
                <span style={{ fontWeight:700, color:form.agreementSigned?'#0f766e':'#0f172a' }}>{form.agreementSigned?'✅ Agreement Signed':'Client agrees to all terms'}</span>
              </label>
            </div>
          )}

          <div style={{ display:'flex', gap:8, marginTop:16 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:14, background:'#0f766e', border:'none', borderRadius:12, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              {saving?'...':editingRes?'✅ Save Changes':'✅ Create Reservation'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingRes(null); resetForm(); }} style={{ padding:'14px 16px', background:'none', border:'1.5px solid #e2e8f0', borderRadius:12, cursor:'pointer', fontSize:14, color:'#64748b' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading...</div>
      : !showForm && reservations.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🏠</div>
          <div style={{ fontWeight:600 }}>No reservations yet</div>
          <div style={{ fontSize:13, marginTop:4 }}>Tap + New to create your first boarding reservation</div>
        </div>
      ) : reservations.map(res => {
        const client = clients.find(c => String(c.id)===String(res.client_id));
        const pet = pets.find(p => String(p.id)===String(res.pet_id));
        const sc = sc_map[res.status]||sc_map.pending;
        const bal = (res.total||0)-(res.deposit_paid||0);
        return (
          <div key={res.id} style={{ ...card, borderLeft:`4px solid ${sc.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{client?.name||'Unknown'}</div>
                <div style={{ fontSize:13, color:'#64748b' }}>🐾 {pet?.name} · {pet?.breed}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {res.agreement_signed && <span style={{ fontSize:14 }}>✅</span>}
                <span style={{ background:sc.bg, color:sc.text, border:`1px solid ${sc.border}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700 }}>
                  {res.status.charAt(0).toUpperCase()+res.status.slice(1)}
                </span>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, fontSize:13, color:'#374151', marginBottom:8, flexWrap:'wrap' }}>
              <span>📥 {res.check_in}</span><span>📤 {res.check_out}</span>
              <span>🌙 {nights(res.check_in,res.check_out)} nights</span>
            </div>
            {(() => { const exp=[]; if(res.rabies_date&&new Date(res.rabies_date)<new Date())exp.push('Rabies expired'); if(res.bordetella_date&&new Date(res.bordetella_date)<new Date())exp.push('Bordetella expired'); return exp.length?<div style={{ background:'#fef9c3', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#854d0e', marginBottom:8 }}>⚠️ {exp.join(' · ')}</div>:null; })()}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div><span style={{ fontWeight:700, color:'#0f766e', fontSize:16 }}>${res.total?.toFixed(2)}</span>{bal>0&&<span style={{ color:'#64748b', marginLeft:8, fontSize:13 }}>Bal: ${bal.toFixed(2)}</span>}{res.includes_bath&&<span style={{ marginLeft:8, background:'#e0f2fe', color:'#0369a1', borderRadius:6, padding:'2px 6px', fontSize:11 }}>🛁</span>}</div>
              <div style={{ display:'flex', gap:6 }}>
                {res.status==='pending'&&<button onClick={()=>updateStatus(res.id,'active')} style={{ background:'#dcfce7', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, color:'#14532d', fontWeight:700 }}>Check In</button>}
                {res.status==='active'&&<button onClick={()=>updateStatus(res.id,'completed')} style={{ background:'#f1f5f9', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, color:'#475569', fontWeight:700 }}>Check Out</button>}
                {bal>0&&<button onClick={()=>setShowPayment(res)} style={{ background:'#0f766e', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, color:'#fff', fontWeight:700 }}>💰</button>}
                <button onClick={()=>handleEdit(res)} style={{ background:'#f0fdfa', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, color:'#0f766e' }}>✏️</button>
                <button onClick={()=>handleDelete(res.id)} style={{ background:'#fee2e2', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', fontSize:12, color:'#dc2626' }}>🗑️</button>
              </div>
            </div>
            {res.notes&&<div style={{ marginTop:8, fontSize:12, color:'#64748b', background:'#f8fafc', borderRadius:8, padding:'6px 10px' }}>📝 {res.notes}</div>}
            {res.medical_conditions&&<div style={{ marginTop:4, fontSize:12, color:'#7c3aed', background:'#faf5ff', borderRadius:8, padding:'6px 10px' }}>🏥 {res.medical_conditions}</div>}
            {res.rating>0&&<div style={{ marginTop:6, fontSize:13 }}>{'⭐'.repeat(res.rating)}</div>}
          </div>
        );
      })}
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

  // Report por GROOMER + EMPRESA (nuevo)
  const groomerReport = useMemo(() => {
    const weekAppts = (appointments || []).filter(a => inRange(a.date, start, end) && a.status === 'completed');
    const weekExpenses = expenses.filter(e => inRange(e.date, start, end));

    // Agrupar por groomer
    const groomerMap = {};
    for (const appt of weekAppts) {
      const groomerId = appt.groomerId || appt.vanId; // fallback a van si no groomer
      const companyId = appt.companyId || vans.find(v => v.id === appt.vanId)?.companyId || 'epw';
      const key = `${groomerId}__${companyId}`;
      if (!groomerMap[key]) {
        const groomer = (groomers || []).find(g => g.id === groomerId) ||
          vans.find(v => v.id === groomerId); // fallback
        groomerMap[key] = {
          groomerId, companyId,
          groomerName: groomer?.name || groomer?.groomer || 'Sin asignar',
          commissionPct: groomer?.commissionPct || settings.commissionPct || 45,
          appointments: 0, sales: 0, tips: 0, pets: 0,
        };
      }
      groomerMap[key].appointments++;
      groomerMap[key].pets += appt.pets?.length || 0;
      groomerMap[key].sales += appt.pets?.reduce((sum, ap) => sum + (ap.amount || 0), 0) || 0;
    }

    return Object.values(groomerMap).map(r => {
      const gasFees = r.appointments * (settings.gasFee || 7);
      const netSales = Math.max(0, r.sales - gasFees); // Gas fee se resta antes de comisión
      const commission = netSales * (r.commissionPct / 100);
      const totalPay = commission;
      const company = DEFAULT_COMPANIES.find(c => c.id === r.companyId) || DEFAULT_COMPANIES[0];
      return { ...r, gasFees, netSales, commission, totalPay, company };
    }).sort((a, b) => a.groomerName.localeCompare(b.groomerName));
  }, [appointments, expenses, start, end, groomers, vans, settings]);

  // Report por van (clásico)
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
      const netSales = Math.max(0, sales - gasFees); // Gas fee se resta antes de comisión
      const commission = netSales * (vanCommission / 100);
      const tipShare = tips * (settings.tipsToGroomer / 100);
      const totalPay = commission + tipShare;
      // Company Income: company % of net + gas fees + card fees
      const companyPct = 100 - vanCommission;
      const companyShare = netSales * (companyPct / 100);
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
      [`Commission: ${settings.commissionPct}% · Tips: ${settings.tipsToGroomer}% · Fee gas: $${settings.gasFee} · Fee tarjeta: ${settings.cardFeePct}%`],
      [],
      ['Van','Groomer','Services','Sales','Cash','Zelle','Tarjeta','Check','Tips','Fee Tarjeta','Fee Gas','Expenses','Commission','+ Tips','- Gas','- Expenses','A PAGAR'],
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
    const a = document.createElement('a'); a.href = url; a.download = `report-${start}.csv`; a.click();
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
            <label style={styles.lbl}>Cualquier day de la week</label>
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
        </div>
      </div>

      {/* ===== REPORTE POR GROOMER ===== */}
      {reportMode === 'groomer' && (
        <div style={{ marginTop: 20 }}>
          <SectionTitle eyebrow="Pago a Groomers" title="Por groomer y company" />
          {groomerReport.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ margin: 0, color: '#64748b', fontFamily: 'Fraunces, serif', fontSize: 18 }}>Sin appointments completadas esta week</p>
              <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: 13 }}>Las appointments deben estar en estado "Completed" para aparecer aquí</p>
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
                          {rows.reduce((sum, r) => sum + r.appointments, 0)} appointments · {rows.reduce((sum, r) => sum + r.pets, 0)} pets
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Total a pay</div>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#0f766e' }}>{fmt(totalPay)}</div>
                      </div>
                    </div>

                    {/* Por company */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {rows.map(r => (
                        <div key={`${r.groomerId}-${r.companyId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.company.logoEmoji} {r.company.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              {r.appointments} appointments · {r.pets} pets · {r.commissionPct}% comisión
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                              Sales {fmt(r.sales)} · Commission {fmt(r.commission)} · Gas -{fmt(r.gasFees)}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>A pay</div>
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
            <KpiCard label="+ Fee gas" value={fmt(totals.gasFees)} />
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
function ConfigTab({ vans, updateVans, settings, updateSettings, services, clearServices, categories, addCategory, removeCategory, expenses, users, addUser, updateUser, toggleUserActive, servicePrices, updateServicePrice, addServicePrice, deleteServicePrice, groomers, addGroomer, updateGroomer, toggleGroomerActive, companies, updateCompany }) {
  const [section, setSection] = useState(null);
  const [saving, setSaving] = useState(false);

  // States for each section
  const [editVan, setEditVan] = useState({});
  const [showNewGroomerForm, setShowNewGroomerForm] = useState(false);
  const [newGroomerData, setNewGroomerData] = useState({ name: '', pin: '', commissionPct: 45, vanId: '', companyId: 'epw' });
  const [editingGroomer, setEditingGroomer] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'manager', companyId: 'epw', email: '', pin: '', van_id: '', can_create_clients: true, can_view_clients: true, can_schedule: true, can_view_all_schedule: true, can_view_finances: false, can_view_reports: true, can_edit_config: false });
  const [editingPrice, setEditingPrice] = useState({});
  const [showNewService, setShowNewService] = useState(false);
  const [newService, setNewService] = useState({ category: 'Add-on', name: '', size: '', hair_type: '', price: '', duration_minutes: 60 });
  const [localSettings, setLocalSettings] = useState({ 
    ...settings,
    agreementEpw: settings.agreementEpw || AGREEMENTS.epw,
    agreementAtw: settings.agreementAtw || AGREEMENTS.atw,
    footerEpw: settings.footerEpw || INVOICE_FOOTERS.epw,
    footerAtw: settings.footerAtw || INVOICE_FOOTERS.atw,
  });

  // Sync agreements on mount
  useEffect(() => {
    setLocalSettings(s => ({
      ...s,
      agreementEpw: s.agreementEpw || AGREEMENTS.epw,
      agreementAtw: s.agreementAtw || AGREEMENTS.atw,
      footerEpw: s.footerEpw || INVOICE_FOOTERS.epw,
      footerAtw: s.footerAtw || INVOICE_FOOTERS.atw,
    }));
  }, []);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [agreementText, setAgreementText] = useState(settings.agreementText || '');
  const [invoiceFooter, setInvoiceFooter] = useState(settings.invoiceFooter || '');

  const cardStyle = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px', marginBottom: 10 };
  const sectionBtnStyle = (id) => ({
    width: '100%', padding: '14px 16px', border: 'none', textAlign: 'left',
    background: section === id ? '#f0fdfa' : '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 14, borderRadius: 12,
    borderLeft: `3px solid ${section === id ? '#0f766e' : 'transparent'}`,
    marginBottom: 4,
  });

  const SECTION_GROUPS = [
    {
      category: '⚙️ General',
      items: [
        { id: 'users', icon: '👥', label: 'Users & Access' },
        { id: 'security', icon: '🔐', label: 'Security' },
        { id: 'preferences', icon: '🎨', label: 'Preferences' },
        { id: 'modules', icon: '🧩', label: 'Modules' },
      ],
    },
    {
      category: '🚐 El Pet Wash & All Tails Wag',
      items: [
        { id: 'companies', icon: '🏢', label: 'Companies & Teams' },
        { id: 'services', icon: '🐾', label: 'Services & Prices' },
        { id: 'fees', icon: '💰', label: 'Fees & Rates' },
        { id: 'categories', icon: '📂', label: 'Expense Categories' },
        { id: 'tools', icon: '✂️', label: 'Blades & Combos' },
        { id: 'documents', icon: '📄', label: 'Documents' },
        { id: 'raykota_pay', icon: '💳', label: 'Raykota Pay' },
      ],
    },
    {
      category: '🏠 Casa Group Guerrero',
      items: [
        { id: 'boarding_settings', icon: '🏠', label: 'Boarding Settings' },
        { id: 'boarding_staff', icon: '👤', label: 'Boarding Staff' },
        { id: 'boarding_prices', icon: '💰', label: 'Boarding Prices' },
      ],
    },
  ];
  const sections = SECTION_GROUPS.flatMap(g => g.items);

  // ── COMPANIES & TEAMS ──
  const companiesSection = (
    <div>
      {DEFAULT_COMPANIES.map(company => {
        const companyVans = vans.filter(v => v.companyId === company.id);
        const companyGroomers = groomers.filter(g => g.companyId === company.id || companyVans.some(v => v.id === g.vanId));
        return (
          <div key={company.id} style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 24 }}>{company.logoEmoji}</span>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{company.name}</div>
            </div>

            {/* Vans */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>🚐 Vans</div>
            {companyVans.map(van => (
              <div key={van.id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  {editVan[van.id] !== undefined ? (
                    <input value={editVan[van.id]} onChange={e => setEditVan(v => ({...v, [van.id]: e.target.value}))}
                      style={{ padding: '6px 10px', border: '1.5px solid #0f766e', borderRadius: 8, fontSize: 14, width: '80%' }} />
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{van.name}</div>
                  )}
                  <div style={{ fontSize: 11, color: van.active !== false ? '#0f766e' : '#dc2626', marginTop: 2 }}>
                    {van.active !== false ? '🟢 Active' : '🔴 Inactive'}
                  </div>
                </div>
                {editVan[van.id] !== undefined ? (
                  <button onClick={async () => {
                    const updated = {...van, name: editVan[van.id]};
                    await updateVans(vans.map(v => v.id === van.id ? updated : v));
                    setEditVan(v => { const n = {...v}; delete n[van.id]; return n; });
                  }} style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Save</button>
                ) : (
                  <button onClick={() => setEditVan(v => ({...v, [van.id]: van.name}))}
                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}><Edit2 size={13} /></button>
                )}
                <button onClick={async () => {
                  const updated = {...van, active: van.active === false ? true : false};
                  await updateVans(vans.map(v => v.id === van.id ? updated : v));
                }} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: van.active !== false ? '#dc2626' : '#0f766e' }}>
                  {van.active !== false ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}

            {/* Groomers */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, marginTop: 14 }}>✂️ Groomers</div>
            {companyGroomers.map(g => {
              const gVan = vans.find(v => v.id === g.vanId);
              return (
                <div key={g.id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 6 }}>
                  {editingGroomer?.id === g.id ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Name</label>
                          <input value={editingGroomer.name} onChange={e => setEditingGroomer(eg => ({...eg, name: e.target.value}))}
                            style={{ width: '100%', padding: '8px', border: '1.5px solid #0f766e', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>PIN</label>
                          <input value={editingGroomer.pin} onChange={e => setEditingGroomer(eg => ({...eg, pin: e.target.value}))}
                            style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', fontFamily: 'monospace' }} maxLength={4} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Commission %</label>
                          <input type="number" value={editingGroomer.commissionPct} onChange={e => setEditingGroomer(eg => ({...eg, commissionPct: parseFloat(e.target.value)}))}
                            style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Van</label>
                          <select value={editingGroomer.vanId} onChange={e => setEditingGroomer(eg => ({...eg, vanId: e.target.value}))}
                            style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                            {vans.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={async () => {
                          await updateGroomer(editingGroomer);
                          setEditingGroomer(null);
                        }} style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✅ Save</button>
                        <button onClick={() => setEditingGroomer(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{g.name.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>PIN: {g.pin} · {g.commissionPct}% · {gVan?.name || 'No van'}</div>
                        <div style={{ fontSize: 11, color: g.active !== false ? '#0f766e' : '#dc2626' }}>
                          {g.active !== false ? '🟢 Active' : '🔴 Inactive'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEditingGroomer({...g})}
                          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}><Edit2 size={13} /></button>
                        <button onClick={() => toggleGroomerActive(g.id, g.active === false ? true : false)}
                          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', fontSize: 11, color: g.active !== false ? '#dc2626' : '#0f766e' }}>
                          {g.active !== false ? 'Off' : 'On'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add groomer */}
            {showNewGroomerForm && newGroomerData.companyId === company.id ? (
              <div style={{ padding: '14px', background: '#f0fdfa', borderRadius: 12, border: '1.5px solid #0f766e', marginTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f766e', marginBottom: 10 }}>➕ New Groomer</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Name</label>
                    <input value={newGroomerData.name} onChange={e => setNewGroomerData(d => ({...d, name: e.target.value}))}
                      style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} placeholder="Groomer name" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>PIN (4 digits)</label>
                    <input value={newGroomerData.pin} onChange={e => setNewGroomerData(d => ({...d, pin: e.target.value.replace(/\D/,'').slice(0,4)}))}
                      style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', fontFamily: 'monospace' }} placeholder="1234" maxLength={4} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Commission %</label>
                    <input type="number" value={newGroomerData.commissionPct} onChange={e => setNewGroomerData(d => ({...d, commissionPct: parseFloat(e.target.value)}))}
                      style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Van</label>
                    <select value={newGroomerData.vanId} onChange={e => setNewGroomerData(d => ({...d, vanId: e.target.value}))}
                      style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                      <option value="">Select van</option>
                      {companyVans.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={async () => {
                    if (!newGroomerData.name || !newGroomerData.pin) { alert('Name and PIN required'); return; }
                    setSaving(true);
                    await addGroomer({ ...newGroomerData, id: uid(), active: true });
                    setNewGroomerData({ name: '', pin: '', commissionPct: 45, vanId: '', companyId: 'epw' });
                    setShowNewGroomerForm(false);
                    setSaving(false);
                  }} style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    ✅ Add Groomer
                  </button>
                  <button onClick={() => setShowNewGroomerForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setShowNewGroomerForm(true); setNewGroomerData(d => ({...d, companyId: company.id})); }}
                style={{ width: '100%', padding: '10px', background: 'none', border: '1.5px dashed #cbd5e1', borderRadius: 10, cursor: 'pointer', color: '#64748b', fontSize: 13, marginTop: 8 }}>
                + Add Groomer
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  // ── USERS & ACCESS ──
  const usersSection = (
    <div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        Admin and managers log in with email + password. Manage their access here.
      </div>
      {users.filter(u => u.role !== 'groomer').map(user => (
        <div key={user.id} style={cardStyle}>
          {editingUser?.id === user.id ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Name</label>
                  <input value={editingUser.name} onChange={e => setEditingUser(u => ({...u, name: e.target.value}))}
                    style={{ width: '100%', padding: '8px', border: '1.5px solid #0f766e', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Role</label>
                  <select value={editingUser.role} onChange={e => setEditingUser(u => ({...u, role: e.target.value}))}
                    style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                    <option value="admin">👑 Admin</option>
                    <option value="manager">📋 Manager</option>
                    <option value="finance">💰 Finance</option>
                    <option value="viewer">👁️ Viewer</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Permissions</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    ['can_view_finances', 'View Finances'],
                    ['can_view_reports', 'View Reports'],
                    ['can_edit_config', 'Edit Settings'],
                    ['can_view_all_schedule', 'View All Schedule'],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={editingUser[key] || false} onChange={e => setEditingUser(u => ({...u, [key]: e.target.checked}))} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={async () => { await updateUser(editingUser); setEditingUser(null); }}
                  style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✅ Save</button>
                <button onClick={() => setEditingUser(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: user.role === 'admin' ? '#0f172a' : '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, flexShrink: 0 }}>
                {user.role === 'admin' ? '👑' : '📋'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{user.email || 'No email'} · {user.role}</div>
                <div style={{ fontSize: 11, color: user.active !== false ? '#0f766e' : '#dc2626', marginTop: 2 }}>
                  {user.active !== false ? '🟢 Active' : '🔴 Inactive'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditingUser({...user})}
                  style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}><Edit2 size={14} /></button>
                <button onClick={() => toggleUserActive(user.id)}
                  style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 11, color: user.active !== false ? '#dc2626' : '#0f766e' }}>
                  {user.active !== false ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {showNewUser ? (
        <div style={{ background: '#f0fdfa', border: '1.5px solid #0f766e', borderRadius: 12, padding: 16, marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f766e', marginBottom: 12 }}>➕ New User</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div><label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Name</label>
              <input value={newUser.name} onChange={e => setNewUser(u => ({...u, name: e.target.value}))} style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} /></div>
            <div><label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Role</label>
              <select value={newUser.role} onChange={e => setNewUser(u => ({...u, role: e.target.value}))} style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                <option value="admin">👑 Admin</option>
                <option value="manager">📋 Manager</option>
                <option value="finance">💰 Finance</option>
                <option value="viewer">👁️ Viewer</option>
              </select></div>
            <div><label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Company</label>
              <select value={newUser.companyId || 'epw'} onChange={e => setNewUser(u => ({...u, companyId: e.target.value}))} style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                <option value="epw">🐾 El Pet Wash</option>
                <option value="atw">🐕 All Tails Wag</option>
                <option value="casa">🏠 Casa Group</option>
                <option value="all">🏢 All Companies</option>
              </select></div>
            <div><label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>PIN</label>
              <input value={newUser.pin} onChange={e => setNewUser(u => ({...u, pin: e.target.value}))} maxLength={4} style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', fontFamily: 'monospace' }} /></div>
            <div><label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Email</label>
              <input value={newUser.email} onChange={e => setNewUser(u => ({...u, email: e.target.value}))} style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={async () => {
              if (!newUser.name.trim()) { alert('Enter name'); return; }
              await addUser({...newUser, id: crypto.randomUUID(), active: true});
              setShowNewUser(false);
              setNewUser({ name: '', role: 'manager', companyId: 'epw', email: '', pin: '' });
            }} style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✅ Save</button>
            <button onClick={() => setShowNewUser(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNewUser(true)} style={{ width: '100%', padding: 12, background: '#f0fdfa', border: '1.5px dashed #0f766e', borderRadius: 12, color: '#0f766e', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 12 }}>
          ➕ Add User
        </button>
      )}
    </div>
  );

  // ── FEES & RATES ──
  const feesSection = (
    <div>
      {/* Global fees */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>⚙️ Global</div>
      {[
        { key: 'taxRate', label: '🧾 Tax Rate', suffix: '%', desc: 'Applied to services in tax reports' },
      ].map(field => (
        <div key={field.key} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{field.label}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{field.desc}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" step="0.1" value={localSettings[field.key] || ''}
                onChange={e => setLocalSettings(s => ({...s, [field.key]: parseFloat(e.target.value) || 0}))}
                style={{ width: 80, padding: '8px 10px', border: '1.5px solid #0f766e', borderRadius: 10, fontSize: 16, fontWeight: 700, textAlign: 'center' }} />
              <span style={{ fontSize: 16, color: '#64748b' }}>{field.suffix}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Fees por empresa */}
      {[
        { id: 'epw', name: '🐾 El Pet Wash', color: '#0f766e', bg: '#f0fdfa' },
        { id: 'atw', name: '🐕 All Tails Wag', color: '#7c3aed', bg: '#f5f3ff' },
      ].map(co => (
        <div key={co.id} style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{co.name}</div>
          {[
            { key: `commissionPct_${co.id}`, fallback: 'commissionPct', label: '💰 Groomer Commission', suffix: '%', desc: 'Commission for groomers of this company' },
            { key: `cardFeePct_${co.id}`, fallback: 'cardFeePct', label: '💳 Credit Card Fee', suffix: '%', desc: 'Card fee for this company' },
            { key: `gasFee_${co.id}`, fallback: 'gasFee', label: '⛽ Gas Fee per Service', suffix: '$', prefix: true, desc: 'Gas fee for this company' },
          ].map(field => (
            <div key={field.key} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{field.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{field.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {field.prefix && <span style={{ fontSize: 16, color: '#64748b' }}>$</span>}
                  <input type="number" step="0.1"
                    value={localSettings[field.key] !== undefined ? localSettings[field.key] : (localSettings[field.fallback] || '')}
                    onChange={e => setLocalSettings(s => ({...s, [field.key]: parseFloat(e.target.value) || 0}))}
                    style={{ width: 80, padding: '8px 10px', border: `1.5px solid ${co.color}`, borderRadius: 10, fontSize: 16, fontWeight: 700, textAlign: 'center' }} />
                  {!field.prefix && <span style={{ fontSize: 16, color: '#64748b' }}>{field.suffix}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      <button onClick={async () => {
        setSaving(true);
        await updateSettings(localSettings);
        setSaving(false);
        alert('✅ Fees updated!');
      }} style={{ width: '100%', padding: 14, background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
        {saving ? '...' : '✅ Save Fees'}
      </button>
    </div>
  );

  // ── CATEGORIES ──
  const categoriesSection = (
    <div>
      {categories.map(cat => (
        <div key={cat} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10 }}>
          {editingCategory?.old === cat ? (
            <>
              <input value={editingCategory.new} onChange={e => setEditingCategory(c => ({...c, new: e.target.value}))}
                style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #0f766e', borderRadius: 8, fontSize: 14 }} />
              <button onClick={async () => {
                if (!editingCategory.new.trim() || editingCategory.new === cat) { setEditingCategory(null); return; }
                await saveCategory(editingCategory.new);
                await deleteCategoryDB(cat);
                await addCategory(editingCategory.new);
                await removeCategory(cat);
                setEditingCategory(null);
              }} style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Save</button>
              <button onClick={() => setEditingCategory(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' }}>✕</button>
            </>
          ) : (
            <>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{cat}</span>
              <button onClick={() => setEditingCategory({ old: cat, new: cat })}
                style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}><Edit2 size={13} /></button>
              <button onClick={async () => { if (window.confirm(`Delete "${cat}"?`)) { await deleteCategoryDB(cat); await removeCategory(cat); } }}
                style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={13} /></button>
            </>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14 }}
          placeholder="New category name..." onKeyDown={e => e.key === 'Enter' && newCategory.trim() && (saveCategory(newCategory.trim()), addCategory(newCategory.trim()), setNewCategory(''))} />
        <button onClick={async () => {
          if (!newCategory.trim()) return;
          await saveCategory(newCategory.trim());
          await addCategory(newCategory.trim());
          setNewCategory('');
        }} style={{ padding: '10px 16px', background: '#0f766e', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );

  // ── DOCUMENTS ──
  const documentsSection = (
    <div>
      {/* Agreement por empresa */}
      {DEFAULT_COMPANIES.map(company => {
        const key = company.id === 'epw' ? 'agreementEpw' : 'agreementAtw';
        const footerKey = company.id === 'epw' ? 'footerEpw' : 'footerAtw';
        const defaultText = AGREEMENTS[company.id] || '';
        const defaultFooter = INVOICE_FOOTERS[company.id] || '';
        const currentText = localSettings[key] || AGREEMENTS[company.id] || '';
        const currentFooter = localSettings[footerKey] || INVOICE_FOOTERS[company.id] || '';
        return (
          <div key={company.id} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {company.logoEmoji} {company.name}
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>📄 Service Agreement</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Shown to clients before grooming. They sign digitally.</div>
              <textarea value={currentText}
                onChange={e => setLocalSettings(s => ({...s, [key]: e.target.value}))}
                style={{ width: '100%', minHeight: 180, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }} />
            </div>
            <div style={cardStyle}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🧾 Invoice Footer</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Text shown at the bottom of every invoice.</div>
              <textarea value={currentFooter}
                onChange={e => setLocalSettings(s => ({...s, [footerKey]: e.target.value}))}
                style={{ width: '100%', minHeight: 80, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
          </div>
        );
      })}
      <button onClick={async () => {
        setSaving(true);
        await updateSettings({ ...settings, ...localSettings });
        setSaving(false);
        alert('✅ Documents saved!');
      }} style={{ width: '100%', padding: 14, background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        {saving ? '...' : '✅ Save Documents'}
      </button>
    </div>
  );

  // ── PREFERENCES ──
  const preferencesSection = (
    <div>
      {[
        { key: 'language', label: '🌐 Language', options: [{ v: 'en', l: 'English' }, { v: 'es', l: 'Español' }] },
        { key: 'dateFormat', label: '📅 Date Format', options: [{ v: 'MM/DD/YYYY', l: 'MM/DD/YYYY (US)' }, { v: 'DD/MM/YYYY', l: 'DD/MM/YYYY (International)' }] },
        { key: 'currency', label: '💵 Currency', options: [{ v: 'USD', l: '$ USD' }, { v: 'EUR', l: '€ EUR' }] },
      ].map(pref => (
        <div key={pref.key} style={cardStyle}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{pref.label}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {pref.options.map(opt => (
              <button key={opt.v} onClick={() => setLocalSettings(s => ({...s, [pref.key]: opt.v}))}
                style={{ flex: 1, padding: '10px', border: `2px solid ${localSettings[pref.key] === opt.v || (!localSettings[pref.key] && opt.v === pref.options[0].v) ? '#0f766e' : '#e2e8f0'}`, borderRadius: 10, background: localSettings[pref.key] === opt.v ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: localSettings[pref.key] === opt.v ? '#0f766e' : '#374151' }}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={async () => {
        setSaving(true);
        await updateSettings(localSettings);
        setSaving(false);
        alert('✅ Preferences saved!');
      }} style={{ width: '100%', padding: 14, background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        {saving ? '...' : '✅ Save Preferences'}
      </button>
    </div>
  );

  // ── SECURITY ──
  const securitySection = (
    <div>
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🔑 Change Password</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>For admin and manager accounts (email login)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>New Password</label>
            <input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm(f => ({...f, newPass: e.target.value}))}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }}
              placeholder="••••••••" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Confirm New Password</label>
            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({...f, confirm: e.target.value}))}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }}
              placeholder="••••••••" />
          </div>
          <button onClick={async () => {
            if (!passwordForm.newPass || passwordForm.newPass.length < 6) { alert('Password must be at least 6 characters'); return; }
            if (passwordForm.newPass !== passwordForm.confirm) { alert('Passwords do not match'); return; }
            setSaving(true);
            const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass });
            setSaving(false);
            if (error) { alert('Error: ' + error.message); return; }
            setPasswordForm({ current: '', newPass: '', confirm: '' });
            alert('✅ Password updated successfully!');
          }} style={{ padding: '12px', background: '#0f766e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            {saving ? '...' : '🔐 Update Password'}
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⏱️ Auto Session Timeout</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Automatically log out after inactivity</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { v: 0, l: 'Never' },
            { v: 8, l: '8 hours' },
            { v: 24, l: '24 hours' },
            { v: 72, l: '3 days' },
          ].map(opt => (
            <button key={opt.v} onClick={() => setLocalSettings(s => ({...s, sessionTimeout: opt.v}))}
              style={{ padding: '8px 14px', border: `2px solid ${(localSettings.sessionTimeout ?? 0) === opt.v ? '#0f766e' : '#e2e8f0'}`, borderRadius: 10, background: (localSettings.sessionTimeout ?? 0) === opt.v ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: (localSettings.sessionTimeout ?? 0) === opt.v ? '#0f766e' : '#374151' }}>
              {opt.l}
            </button>
          ))}
        </div>
        <button onClick={async () => { await updateSettings(localSettings); alert('✅ Saved!'); }}
          style={{ marginTop: 12, padding: '10px 20px', background: '#0f766e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          Save
        </button>
      </div>
    </div>
  );

  const sectionContent = {
    companies: companiesSection,
    users: usersSection,
    fees: feesSection,
    categories: categoriesSection,
    documents: documentsSection,
    preferences: preferencesSection,
    security: securitySection,
    modules: <ModulesAdmin companies={companies} />,
    tools: <CombosAdmin />,
    raykota_pay: <RaykotaPay settings={settings} updateSettings={updateSettings} />,
    boarding_settings: (
      <div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🏠 Casa Group Guerrero</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Max Capacity</label>
              <input type="number" defaultValue={10}
                onChange={e => updateSettings({ ...settings, boardingCapacity: parseInt(e.target.value) || 10 })}
                style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Check-in Time</label>
              <input type="time" defaultValue="12:00"
                onChange={e => updateSettings({ ...settings, boardingCheckinTime: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Check-out Time</label>
              <input type="time" defaultValue="11:00"
                onChange={e => updateSettings({ ...settings, boardingCheckoutTime: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Deposit Required (%)</label>
              <input type="number" defaultValue={50}
                onChange={e => updateSettings({ ...settings, boardingDepositPct: parseInt(e.target.value) || 50 })}
                style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      </div>
    ),
    boarding_staff: (
      <div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>👤 Boarding Staff</div>
          {['Luis', 'Noemí', 'Manuela'].map(name => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 600 }}>{name}</div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#f0fdfa', color: '#0f766e', fontWeight: 600 }}>🟢 Active</span>
            </div>
          ))}
        </div>
      </div>
    ),
    boarding_prices: (
      <div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>💰 Boarding Prices per Night</div>
          {Object.entries(BOARDING_PRICES).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{val.label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#64748b' }}>$</span>
                <input type="number" defaultValue={val.price}
                  style={{ width: 70, padding: '6px 8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'right' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div>
      <SectionTitle eyebrow="Configuration" title="⚙️ Settings" />

      {!section ? (
        <div>
          {SECTION_GROUPS.map(group => (
            <div key={group.category} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>
                {group.category}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {group.items.map((s, idx) => (
                  <button key={s.id} onClick={() => setSection(s.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', background: 'none', border: 'none',
                    borderBottom: idx < group.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{s.icon}</span>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 15, color: '#0f172a' }}>{s.label}</div>
                    <span style={{ color: '#c0c9d4', fontSize: 18 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSection(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#0f766e', fontWeight: 600, fontSize: 14, marginBottom: 16, padding: '4px 0' }}>
            ← Back to Settings
          </button>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
            {sections.find(s => s.id === section)?.icon} {sections.find(s => s.id === section)?.label}
          </div>
          {section === 'services' ? (
            <div>
              {/* Tabla por categoría */}
              {[...new Set((servicePrices || []).map(p => p.category))].map(cat => {
                const isAddon = cat === 'Add-on' || cat === 'Add-ons' || cat === 'Addon';
                const catPrices = (servicePrices || []).filter(p => p.category === cat);
                return (
                  <div key={cat} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{cat}</div>
                    
                    {/* Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: isAddon ? '1fr 80px 32px' : '1fr 100px 100px 70px 80px 32px', gap: 6, padding: '6px 10px', background: '#f1f5f9', borderRadius: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Name</div>
                      {!isAddon && <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Size</div>}
                      {!isAddon && <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Hair Type</div>}
                      {!isAddon && <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Time</div>}
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Price</div>
                      <div />
                    </div>

                    {/* Rows */}
                    {catPrices.map(price => {
                      const isEditing = editingPrice[price.id] !== undefined;
                      return (
                        <div key={price.id} style={{ display: 'grid', gridTemplateColumns: isAddon ? '1fr 80px 32px' : '1fr 100px 100px 70px 80px 32px', gap: 6, padding: '6px 10px', background: isEditing ? '#f0fdfa' : '#fff', borderRadius: 8, marginBottom: 3, border: `1px solid ${isEditing ? '#0f766e' : '#e2e8f0'}`, alignItems: 'center' }}>
                          {/* Name */}
                          <input value={editingPrice[`${price.id}_name`] !== undefined ? editingPrice[`${price.id}_name`] : (price.name || price.service_name || '')}
                            onChange={e => setEditingPrice(ep => ({...ep, [`${price.id}_name`]: e.target.value, [price.id]: ep[price.id] !== undefined ? ep[price.id] : (price.price || price.base_price || 0)}))}
                            style={{ padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, width: '100%', boxSizing: 'border-box' }} />

                          {/* Size — solo para no addons */}
                          {!isAddon && (
                            <select value={editingPrice[`${price.id}_size`] !== undefined ? editingPrice[`${price.id}_size`] : (price.size || '')}
                              onChange={e => setEditingPrice(ep => ({...ep, [`${price.id}_size`]: e.target.value, [price.id]: ep[price.id] !== undefined ? ep[price.id] : (price.price || 0)}))}
                              style={{ padding: '6px 4px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11 }}>
                              <option value="">Any</option>
                              <option value="Small (1-20 lbs)">Small</option>
                              <option value="Medium (21-40 lbs)">Medium</option>
                              <option value="Large (41-60 lbs)">Large</option>
                              <option value="Big (61-80 lbs)">Big</option>
                              <option value="Extra Large (81-100 lbs)">XLarge</option>
                              <option value="Giant (100-120 lbs)">Giant</option>
                              <option value="Extra Giant (+120 lbs)">XGiant</option>
                            </select>
                          )}

                          {/* Hair Type — solo para no addons */}
                          {!isAddon && (
                            <select value={editingPrice[`${price.id}_hair`] !== undefined ? editingPrice[`${price.id}_hair`] : (price.hair_type || '')}
                              onChange={e => setEditingPrice(ep => ({...ep, [`${price.id}_hair`]: e.target.value, [price.id]: ep[price.id] !== undefined ? ep[price.id] : (price.price || 0)}))}
                              style={{ padding: '6px 4px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11 }}>
                              <option value="">Any</option>
                              <option value="Short Hair">Short</option>
                              <option value="Long Hair">Long</option>
                              <option value="Double Coat">Double</option>
                              <option value="Curly">Curly</option>
                            </select>
                          )}

                          {/* Duration — solo para no addons */}
                          {!isAddon && (
                            <input type="number" value={editingPrice[`${price.id}_dur`] !== undefined ? editingPrice[`${price.id}_dur`] : (price.duration_minutes || 60)}
                              onChange={e => setEditingPrice(ep => ({...ep, [`${price.id}_dur`]: e.target.value, [price.id]: ep[price.id] !== undefined ? ep[price.id] : (price.price || 0)}))}
                              style={{ padding: '6px 4px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, textAlign: 'center' }}
                              placeholder="60" />
                          )}

                          {/* Price */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 12, color: '#64748b' }}>$</span>
                            <input type="number" step="0.01"
                              value={editingPrice[price.id] !== undefined ? editingPrice[price.id] : (price.price || price.base_price || '')}
                              onChange={e => setEditingPrice(ep => ({...ep, [price.id]: e.target.value}))}
                              style={{ width: '100%', padding: '6px 4px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }} />
                          </div>

                          {/* Save/Delete */}
                          <div style={{ display: 'flex', gap: 3 }}>
                            {Object.keys(editingPrice).some(k => k.startsWith(price.id)) && (
                              <button onClick={async () => {
                                const updated = {
                                  ...price,
                                  name: editingPrice[`${price.id}_name`] !== undefined ? editingPrice[`${price.id}_name`] : (price.name || price.service_name),
                                  service_name: editingPrice[`${price.id}_name`] !== undefined ? editingPrice[`${price.id}_name`] : (price.name || price.service_name),
                                  size: editingPrice[`${price.id}_size`] !== undefined ? editingPrice[`${price.id}_size`] : price.size,
                                  hair_type: editingPrice[`${price.id}_hair`] !== undefined ? editingPrice[`${price.id}_hair`] : price.hair_type,
                                  duration_minutes: editingPrice[`${price.id}_dur`] !== undefined ? parseInt(editingPrice[`${price.id}_dur`]) : price.duration_minutes,
                                  price: parseFloat(editingPrice[price.id] !== undefined ? editingPrice[price.id] : price.price),
                                  base_price: parseFloat(editingPrice[price.id] !== undefined ? editingPrice[price.id] : price.price),
                                };
                                await updateServicePrice(updated);
                                setEditingPrice(ep => {
                                  const n = {...ep};
                                  delete n[price.id]; delete n[`${price.id}_name`]; delete n[`${price.id}_size`]; delete n[`${price.id}_hair`]; delete n[`${price.id}_dur`];
                                  return n;
                                });
                              }} style={{ background: '#0f766e', border: 'none', borderRadius: 6, padding: '4px 6px', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>✓</button>
                            )}
                            <button onClick={async () => {
                              if (window.confirm('Delete this service?')) {
                                await deleteServicePrice(price.id);
                              }
                            }} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#dc2626', fontSize: 11 }}>✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Agregar nuevo */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, marginTop: 8 }}>➕ Add New</div>
              {showNewService ? (
                <div style={{ padding: '14px', background: '#f0fdfa', borderRadius: 12, border: '1.5px solid #0f766e' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Category</label>
                      <select value={newService.category} onChange={e => setNewService(s => ({...s, category: e.target.value}))}
                        style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                        <option value="Signature Bath">Signature Bath</option>
                        <option value="Full Groom">Full Groom</option>
                        <option value="Add-on">Add-on</option>
                        <option value="Cat">Cat</option>
                        <option value="Exotic">Exotic</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Name</label>
                      <input value={newService.name} onChange={e => setNewService(s => ({...s, name: e.target.value}))}
                        style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} placeholder="Service name" />
                    </div>
                    {newService.category !== 'Add-on' && (
                      <>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Size</label>
                          <select value={newService.size} onChange={e => setNewService(s => ({...s, size: e.target.value}))}
                            style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                            <option value="">Any size</option>
                            <option value="Small (1-20 lbs)">Small (1-20 lbs)</option>
                            <option value="Medium (21-40 lbs)">Medium (21-40 lbs)</option>
                            <option value="Large (41-60 lbs)">Large (41-60 lbs)</option>
                            <option value="Big (61-80 lbs)">Big (61-80 lbs)</option>
                            <option value="Extra Large (81-100 lbs)">Extra Large (81-100 lbs)</option>
                            <option value="Giant (100-120 lbs)">Giant (100-120 lbs)</option>
                            <option value="Extra Giant (+120 lbs)">Extra Giant (+120 lbs)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Hair Type</label>
                          <select value={newService.hair_type} onChange={e => setNewService(s => ({...s, hair_type: e.target.value}))}
                            style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}>
                            <option value="">Any</option>
                            <option value="Short Hair">Short Hair</option>
                            <option value="Long Hair">Long Hair</option>
                            <option value="Double Coat">Double Coat</option>
                            <option value="Curly">Curly</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Duration (min)</label>
                          <input type="number" value={newService.duration_minutes} onChange={e => setNewService(s => ({...s, duration_minutes: parseInt(e.target.value)}))}
                            style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                      </>
                    )}
                    <div>
                      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>Price ($)</label>
                      <input type="number" step="0.01" value={newService.price} onChange={e => setNewService(s => ({...s, price: e.target.value}))}
                        style={{ width: '100%', padding: '8px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} placeholder="45.00" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={async () => {
                      if (!newService.name || !newService.price) { alert('Name and price required'); return; }
                      setSaving(true);
                      await addServicePrice({ id: uid(), ...newService, price: parseFloat(newService.price), base_price: parseFloat(newService.price) });
                      setNewService({ category: 'Add-on', name: '', size: '', hair_type: '', price: '', duration_minutes: 60 });
                      setShowNewService(false);
                      setSaving(false);
                    }} style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '10px 18px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>✅ Add</button>
                    <button onClick={() => setShowNewService(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewService(true)}
                  style={{ width: '100%', padding: '12px', background: 'none', border: '1.5px dashed #cbd5e1', borderRadius: 12, cursor: 'pointer', color: '#64748b', fontSize: 14 }}>
                  + Add New Service / Add-on
                </button>
              )}
            </div>
          ) : (
            sectionContent[section]
          )}
        </div>
      )}
    </div>
  );
}

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
function BreedInput({ value, onChange, species = 'dog', placeholder = 'Escribir breed...' }) {
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
            ↑↓ para navegar · Enter para seleccionar · Esc para close
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CLIENTES TAB =====
function ClientsTab({ clients, pets, appointments, session, isAdmin, addClient, updateClient, removeClient, addPet, updatePet, servicePrices, addAppointment, vans, settings, refreshAppointments, cardsOnFile = [], setCardsOnFile = () => {}, setTab = () => {} }) {
  const [showCardPanel, setShowCardPanel] = useState(null);
  const [cardForm, setCardForm] = useState({ last4: '', brand: 'Visa', expMonth: '', expYear: '', nickname: '' });
  const [showNewPetForm, setShowNewPetForm] = useState(false);
  const [newPetFormData, setNewPetFormData] = useState({ name: '', breed: '', species: 'dog', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', weight: '', color: '', allergies: '', medicalNotes: '', behaviorNotes: '' });
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showSchedulePrompt, setShowSchedulePrompt] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [saving, setSaving] = useState(false);
  const [petGroomingHistory, setPetGroomingHistory] = useState({});
  const [loadingHistory, setLoadingHistory] = useState({});
  const [apptDate, setApptDate] = useState(todayISO());
  const [clientsPage, setClientsPage] = useState(1);
  const CLIENTS_PER_PAGE = 50;

  // Formulario unificado
  const emptyClient = { name: '', phone: '', email: '', address: '', notes: '' };
  const emptyPet = () => ({ id: `temp-${uid()}`, name: '', breed: '', species: 'dog', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', color: '', weight: '', allergies: '', medicalNotes: '', behaviorNotes: '', serviceId: '', serviceName: '', serviceCategory: '', servicePrice: 0, discountPct: 0, finalPrice: 0, addons: [] });

  const [clientForm, setClientForm] = useState(emptyClient);
  const [petForms, setPetForms] = useState([emptyPet()]);
  const [apptForm, setApptForm] = useState({ vanId: vans[0]?.id || '', companyId: 'epw', timeStart: '08:00', timeEnd: '10:00', notes: '', alertNotes: '' });

  const canViewPhone = isAdmin || session?.permissions?.can_view_clients;

  const filteredClients = useMemo(() => {
    setClientsPage(1);
    if (!search.trim()) return clients;
    return clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.address?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
  }, [clients, search]);

  const visibleClients = useMemo(() => {
    return filteredClients.slice(0, clientsPage * CLIENTS_PER_PAGE);
  }, [filteredClients, clientsPage]);

  const clientPets = useMemo(() => {
    if (!selectedClient) return [];
    return pets.filter(p => String(p.client_id) === String(selectedClient.id));
  }, [pets, selectedClient]);

  const clientHistory = useMemo(() => {
    if (!selectedClient) return [];
    return appointments.filter(a => String(a.clientId) === String(selectedClient.id)).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 10);
  }, [appointments, selectedClient]);

  const loadPetHistory = async (petId) => {
    if (loadingHistory[petId]) return;
    setLoadingHistory(h => ({...h, [petId]: true}));
    
    // Cargar grooming records
    const records = await loadGroomingRecords(petId);
    
    // Cargar fotos de las appointments de esta pet
    const petAppts = appointments.filter(a => 
      a.pets?.some(ap => String(ap.petId) === String(petId))
    );
    
    // Cargar fotos por appointment
    const photosMap = {};
    for (const appt of petAppts) {
      const photos = await loadGroomingPhotos(appt.id);
      const petPhotos = photos.filter(p => !p.pet_id || String(p.pet_id) === String(petId));
      if (petPhotos.length > 0) photosMap[appt.id] = petPhotos;
    }
    
    // Combinar con historial de appointments completadas
    const completedAppts = petAppts
      .filter(a => a.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date));
    
    setPetGroomingHistory(h => ({...h, [petId]: { records, photosMap, completedAppts }}));
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
    setEditClientForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '', notifySms: c.notifySms || c.notify_sms || false });
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
    if (!editClientForm.name.trim()) { alert('Ingresa el name'); return; }
    setSaving(true);
    await updateClient({ ...editingClient, ...editClientForm, name: editClientForm.name.trim() });
    setSelectedClient(prev => prev ? { ...prev, ...editClientForm, name: editClientForm.name.trim() } : null);
    setShowEditClient(false);
    setEditingClient(null);
    setSaving(false);
  };

  const handleSaveEditPet = async () => {
    if (!editPetForm.name.trim()) { alert('Ingresa el name'); return; }
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

      // Cuando cambia el weight → actualizar size automáticamente
      if (field === 'weight') {
        updated.size = getSizeByWeight(value) || updated.size;
        // Recalcular price si ya tiene service seleccionado
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

      // Cuando cambia el hair type o category → recalcular price
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

      // Cuando selecciona service manualmente
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

  const totalAppointment = petForms.reduce((sum, p) => sum + getPetTotal(p), 0);

  const handleCreateAll = async () => {
    if (!clientForm.name.trim()) { alert('Ingresa el name del client'); return; }
    if (petForms.some(p => !p.name.trim())) { alert('Ingresa el name de cada pet'); return; }

    // Validación de duplicados
    const nameLower = clientForm.name.trim().toLowerCase();
    const addrLower = clientForm.address?.trim().toLowerCase();

    const dupName = clients.find(c => c.name.toLowerCase() === nameLower);
    const dupAddr = addrLower ? clients.find(c => c.address?.toLowerCase() === addrLower) : null;

    if (dupName) {
      const ok = window.confirm(`⚠️ Ya existe un client con el name "${clientForm.name.trim()}".\n\n¿Es un client diferente? Clic OK para continuar de todas formas.\nClic Cancel para revisar.`);
      if (!ok) return;
    } else if (dupAddr) {
      const ok = window.confirm(`⚠️ Ya existe un client en la address "${clientForm.address}":\n${dupAddr.name}\n\n¿Es un client diferente? Clic OK para continuar.\nClic Cancel para revisar.`);
      if (!ok) return;
    }

    setSaving(true);

    try {
    // 1. Crear client
    const clientId = uid();
    const client = { 
      id: clientId, ...clientForm, 
      name: clientForm.name.trim(), 
      active: true,
      notifySms: clientForm.notifySms || false,
      notifyEmail: clientForm.notifyEmail || false,
    };
    const clientOk = await addClient(client);
    if (!clientOk) { alert('❌ Error saving client. Check console.'); setSaving(false); return; }

    // 2. Crear pets
    const savedPets = [];
    for (const pf of petForms) {
      if (!pf.name.trim()) continue;
      const petId = uid();
      const pet = { 
        id: petId, clientId, client_id: clientId, 
        name: pf.name.trim(), breed: pf.breed, species: pf.species || 'dog', 
        size: getSizeByWeight(pf.weight) || pf.size, 
        hairType: pf.hairType, hair_type: pf.hairType, 
        age: pf.age, color: pf.color, weight: pf.weight, 
        allergies: pf.allergies, medicalNotes: pf.medicalNotes, 
        behaviorNotes: pf.behaviorNotes,
        gender: pf.gender || '',
      };
      await addPet(pet);
      savedPets.push(pet);
    }

    setSaving(false);
    setShowNewForm(false);
    setClientForm(emptyClient);
    setPetForms([emptyPet()]);

    // Mostrar popup de schedule
    setShowSchedulePrompt({ 
      clientId, 
      clientName: client.name, 
      pets: savedPets 
    });

    } catch(err) {
      console.error('Error creating client:', err);
      alert(`❌ Error: ${err.message}`);
      setSaving(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Base de datos" title="Clients y pets"
        right={
          <button onClick={() => { setShowNewForm(!showNewForm); setClientForm(emptyClient); setPetForms([emptyPet()]); }} style={styles.btnPrimary}>
            <Plus size={15} /> New Client
          </button>
        }
      />

      {/* ===== FORMULARIO UNIFICADO ===== */}
      {showNewForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowNewForm(false); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardH3, margin: 0 }}>New Client + pet(s) + appointment</h3>
            <button onClick={() => setShowNewForm(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>

          {/* PASO 1: Client */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-info)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Step 1 — Client Info</div>
            <div style={styles.formGrid}>
              <div><label style={styles.lbl}>First Name *</label><input value={clientForm.firstName || clientForm.name?.split(' ')[0] || ''} onChange={e => setClientForm(f => ({...f, firstName: e.target.value, name: `${e.target.value} ${f.lastName || ''}`.trim()}))} style={styles.input} placeholder="First name" /></div>
              <div><label style={styles.lbl}>Last Name *</label><input value={clientForm.lastName || clientForm.name?.split(' ').slice(1).join(' ') || ''} onChange={e => setClientForm(f => ({...f, lastName: e.target.value, name: `${f.firstName || ''} ${e.target.value}`.trim()}))} style={styles.input} placeholder="Last name" /></div>
              <div><label style={styles.lbl}>📞 Phone</label><input value={clientForm.phone} onChange={e => setClientForm(f => ({...f, phone: e.target.value}))} style={styles.input} placeholder="(305) 000-0000" /></div>
              <div><label style={styles.lbl}>📧 Email</label><input value={clientForm.email} onChange={e => setClientForm(f => ({...f, email: e.target.value}))} style={styles.input} placeholder="email@example.com" /></div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>📍 Address</label>
                <AddressAutocomplete
                  value={clientForm.address}
                  onChange={details => setClientForm(f => ({...f, address: details.address, zip: details.zip || f.zip, city: details.city || f.city, state: details.state || f.state}))}
                  placeholder="Start typing address..."
                />
                {clientForm.zip && (
                  <div style={{ marginTop: 6, padding: '8px 12px', background: '#f0fdfa', borderRadius: 8, fontSize: 12, color: '#0f766e', fontWeight: 600, display: 'flex', gap: 12 }}>
                    <span>📍 {clientForm.city}, {clientForm.state}</span>
                    <span>🔢 ZIP: {clientForm.zip} ✅</span>
                  </div>
                )}
              </div>

              {/* Notification preferences */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>🔔 Notification Preferences</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: clientForm.notifySms ? '#f0fdfa' : '#f8fafc', border: `1.5px solid ${clientForm.notifySms ? '#0f766e' : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: clientForm.notifySms ? 600 : 400 }}>
                    <input type="checkbox" checked={clientForm.notifySms || false} onChange={e => setClientForm(f => ({...f, notifySms: e.target.checked}))} style={{ display: 'none' }} />
                    📱 SMS notifications {clientForm.notifySms ? '✅' : ''}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: clientForm.notifyEmail ? '#f0fdfa' : '#f8fafc', border: `1.5px solid ${clientForm.notifyEmail ? '#0f766e' : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: clientForm.notifyEmail ? 600 : 400 }}>
                    <input type="checkbox" checked={clientForm.notifyEmail || false} onChange={e => setClientForm(f => ({...f, notifyEmail: e.target.checked}))} style={{ display: 'none' }} />
                    📧 Email notifications {clientForm.notifyEmail ? '✅' : ''}
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.lbl}>🏢 Companies</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  {[{ id: 'epw', label: '🐾 El Pet Wash' }, { id: 'atw', label: '🐕 All Tails Wag' }, { id: 'casa', label: '🏠 Casa Group' }].map(co => {
                    const selected = (clientForm.companies || []).includes(co.id);
                    return (
                      <button key={co.id} type="button" onClick={() => {
                        const curr = clientForm.companies || [];
                        const newCos = selected ? curr.filter(c => c !== co.id) : [...curr, co.id];
                        setClientForm(f => ({...f, companies: newCos}));
                      }} style={{ padding: '8px 14px', background: selected ? '#f0fdfa' : '#f8fafc', border: `1.5px solid ${selected ? '#0f766e' : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: selected ? 600 : 400, color: selected ? '#0f766e' : '#64748b' }}>
                        {co.label} {selected ? '✅' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>📝 Internal notes (admin only)</label><input value={clientForm.notes} onChange={e => setClientForm(f => ({...f, notes: e.target.value}))} style={styles.input} placeholder="Private notes..." /></div>
            </div>
          </div>

          {/* PASO 2: Pets con service y ficha */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-info)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Step 2 — Pet(s)</div>
            {petForms.map((pf, idx) => (
              <div key={pf.id} style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>🐾 Pet {idx + 1}</div>
                  {petForms.length > 1 && (
                    <button onClick={() => removePetForm(idx)} style={{ ...styles.iconBtn, color: 'var(--color-text-danger)' }}><X size={14} /></button>
                  )}
                </div>

                {/* Datos de la pet */}
                <div style={styles.formGrid}>
                  {/* Type */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={styles.lbl}>Pet Type</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      {SPECIES.map(sp => (
                        <button key={sp.id} type="button" onClick={() => updatePetForm(idx, 'species', sp.id)}
                          style={{ padding: '6px 14px', borderRadius: 999, border: `1.5px solid ${pf.species === sp.id ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, background: pf.species === sp.id ? 'var(--color-background-info)' : 'var(--color-background-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: pf.species === sp.id ? 600 : 400, color: pf.species === sp.id ? 'var(--color-text-info)' : 'var(--color-text-secondary)' }}>
                          {sp.icon} {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label style={styles.lbl}>Pet Name *</label><input value={pf.name} onChange={e => updatePetForm(idx, 'name', e.target.value)} style={styles.input} placeholder="Pet name" /></div>
                  <div><label style={styles.lbl}>Breed</label><BreedInput value={pf.breed} onChange={v => updatePetForm(idx, 'breed', v)} species={pf.species || 'dog'} /></div>
                  
                  {/* Gender */}
                  <div>
                    <label style={styles.lbl}>Gender</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {['Male', 'Female'].map(g => (
                        <button key={g} type="button" onClick={() => updatePetForm(idx, 'gender', g)}
                          style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${pf.gender === g ? '#0f766e' : '#e2e8f0'}`, background: pf.gender === g ? '#f0fdfa' : '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: pf.gender === g ? 700 : 400, color: pf.gender === g ? '#0f766e' : '#374151' }}>
                          {g === 'Male' ? '♂️' : '♀️'} {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={styles.lbl}>Weight (lbs) *</label>
                    <input type="number" value={pf.weight} onChange={e => updatePetForm(idx, 'weight', e.target.value)} style={styles.input} placeholder="0" />
                    {pf.weight > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 4, fontWeight: 500 }}>
                        📏 {getSizeByWeight(pf.weight)}
                      </div>
                    )}
                  </div>

                  <div><label style={styles.lbl}>Hair type *</label><select value={pf.hairType} onChange={e => updatePetForm(idx, 'hairType', e.target.value)} style={styles.input}>{HAIR_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                  <div><label style={styles.lbl}>Age</label><input value={pf.age} onChange={e => updatePetForm(idx, 'age', e.target.value)} style={styles.input} placeholder="e.g. 3 years" /></div>
                  <div><label style={styles.lbl}>Color</label><input value={pf.color} onChange={e => updatePetForm(idx, 'color', e.target.value)} style={styles.input} placeholder="e.g. White and black" /></div>
                  <div><label style={styles.lbl}>⚠️ Allergies</label><input value={pf.allergies} onChange={e => updatePetForm(idx, 'allergies', e.target.value)} style={styles.input} placeholder="None" /></div>
                  <div><label style={styles.lbl}>💊 Medical notes</label><input value={pf.medicalNotes} onChange={e => updatePetForm(idx, 'medicalNotes', e.target.value)} style={styles.input} placeholder="None" /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>🔔 Behavior notes</label><input value={pf.behaviorNotes} onChange={e => updatePetForm(idx, 'behaviorNotes', e.target.value)} style={styles.input} placeholder="e.g. Nervous with scissors, bit on previous visit..." /></div>
                </div>
              </div>
            ))}

            <button onClick={addPetForm} style={{ ...styles.btnSecondary, width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> + Add another pet
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowNewForm(false)} style={styles.btnSecondary}><X size={15} /> Cancel</button>
            <button onClick={handleCreateAll} style={styles.btnPrimary} disabled={saving}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
              {saving ? 'Saving...' : '✅ Save Client & Pets'}
            </button>
          </div>
        </div>
        </div>
      )}

      {/* ===== POPUP: SCHEDULE NOW? ===== */}
      {showSchedulePrompt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              {showSchedulePrompt.clientName} saved!
            </div>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
              Client and {showSchedulePrompt.pets.length} pet(s) registered successfully.
              Would you like to schedule an appointment now?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSchedulePrompt(null)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>
                Later
              </button>
              <button onClick={() => {
                setShowSchedulePrompt(null);
                if (addAppointment) setTab('appointments');
              }}
                style={{ flex: 2, padding: '12px', background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                📅 Schedule Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LISTA DE CLIENTES ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} style={styles.input} placeholder="Search client..." />
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 500, overflowY: 'auto' }}>
            {visibleClients.map(c => (
              <div key={c.id} onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}
                className="row-hover" style={{ padding: '10px 12px', background: selectedClient?.id === c.id ? 'var(--color-background-info)' : 'var(--color-background-primary)', border: `0.5px solid ${selectedClient?.id === c.id ? 'var(--color-border-info)' : 'var(--color-border-tertiary)'}`, borderRadius: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {(c.companies || []).includes('epw') && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 999, background: '#f0fdfa', color: '#0f766e', fontWeight: 700 }}>EPW</span>}
                        {(c.companies || []).includes('atw') && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 999, background: '#f5f3ff', color: '#7c3aed', fontWeight: 700 }}>ATW</span>}
                        {(c.companies || []).includes('casa') && <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontWeight: 700 }}>🏠</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{c.address || 'Sin address'}</div>
                    {canViewPhone && c.phone && <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 2 }}>{c.phone}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-background-secondary)', padding: '2px 6px', borderRadius: 999 }}>
                      {pets.filter(p => String(p.client_id) === String(c.id)).length} 🐾
                    </span>
                    {isAdmin && <button onClick={e => { e.stopPropagation(); removeClient(c.id); setSelectedClient(null); }} style={{ ...styles.iconBtn, color: 'var(--color-text-danger)' }}><Trash2 size={13} /></button>}
                  </div>
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>
                {search ? 'No se encontraron clients' : 'Sin clients aún'}
              </div>
            )}
            {visibleClients.length < filteredClients.length && (
              <button onClick={() => setClientsPage(p => p + 1)}
                style={{ width: '100%', padding: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#0f766e', fontWeight: 600 }}>
                Load more ({filteredClients.length - visibleClients.length} remaining)
              </button>
            )}
          </div>
        </div>

        {/* ===== DETALLE DEL CLIENTE ===== */}
        {selectedClient && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9998, padding: '16px',
          }} onClick={e => { if (e.target === e.currentTarget) setSelectedClient(null); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>👤 {selectedClient.name}</div>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>✕</button>
            </div>
            {/* Formulario editar client */}
            {showEditClient && editingClient?.id === selectedClient.id ? (
              <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) { setShowEditClient(false); setEditingClient(null); } }}>
              <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit client</h3>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>
                <div style={styles.formGrid}>
                  <div><label style={styles.lbl}>Name *</label><input value={editClientForm.name} onChange={e => setEditClientForm(f => ({...f, name: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Phone</label><input value={editClientForm.phone} onChange={e => setEditClientForm(f => ({...f, phone: e.target.value}))} style={styles.input} /></div>
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
                  <div><label style={styles.lbl}>Notes internas</label><input value={editClientForm.notes} onChange={e => setEditClientForm(f => ({...f, notes: e.target.value}))} style={styles.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={styles.lbl}>Notifications</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: editClientForm.notifySms ? '#f0fdfa' : '#f8fafc', border: `1.5px solid ${editClientForm.notifySms ? '#0f766e' : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: editClientForm.notifySms ? 600 : 400, marginTop: 4 }}>
                      <input type="checkbox" checked={editClientForm.notifySms || false} onChange={e => setEditClientForm(f => ({...f, notifySms: e.target.checked}))} style={{ display: 'none' }} />
                      📱 SMS notifications {editClientForm.notifySms ? '✅' : ''}
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.btnSecondary}><X size={14} /> Cancel</button>
                  <button onClick={handleSaveEditClient} style={styles.btnPrimary} disabled={saving}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    {saving ? 'Guardando...' : 'Save cambios'}
                  </button>
                </div>
              </div>
              </div>
            ) : null}

            {/* Formulario editar pet */}
            {showEditPet && editingPet && (
              <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) { setShowEditPet(false); setEditingPet(null); } }}>
              <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit pet — {editingPet.name}</h3>
                  <button onClick={() => { setShowEditPet(false); setEditingPet(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>
                <div style={styles.formGrid}>
                  <div><label style={styles.lbl}>Name *</label><input value={editPetForm.name} onChange={e => setEditPetForm(f => ({...f, name: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Breed</label><BreedInput value={editPetForm.breed} onChange={v => setEditPetForm(f => ({...f, breed: v}))} /></div>
                  <div>
                    <label style={styles.lbl}>Weight (lbs)</label>
                    <input type="number" value={editPetForm.weight} onChange={e => setEditPetForm(f => ({...f, weight: e.target.value, size: getSizeByWeight(e.target.value) || f.size}))} style={styles.input} />
                    {editPetForm.weight > 0 && <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 4 }}>📏 {getSizeByWeight(editPetForm.weight)}</div>}
                  </div>
                  <div><label style={styles.lbl}>Hair type</label><select value={editPetForm.hairType} onChange={e => setEditPetForm(f => ({...f, hairType: e.target.value}))} style={styles.input}>{HAIR_TYPES.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                  <div><label style={styles.lbl}>Size</label><select value={editPetForm.size} onChange={e => setEditPetForm(f => ({...f, size: e.target.value}))} style={styles.input}>{SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label style={styles.lbl}>Age</label><input value={editPetForm.age} onChange={e => setEditPetForm(f => ({...f, age: e.target.value}))} style={styles.input} placeholder="Ej: 3 años" /></div>
                  <div><label style={styles.lbl}>Color</label><input value={editPetForm.color} onChange={e => setEditPetForm(f => ({...f, color: e.target.value}))} style={styles.input} /></div>
                  <div><label style={styles.lbl}>Allergies</label><input value={editPetForm.allergies} onChange={e => setEditPetForm(f => ({...f, allergies: e.target.value}))} style={styles.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Notes médicas</label><input value={editPetForm.medicalNotes} onChange={e => setEditPetForm(f => ({...f, medicalNotes: e.target.value}))} style={styles.input} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label style={styles.lbl}>Notes de behavior</label><input value={editPetForm.behaviorNotes} onChange={e => setEditPetForm(f => ({...f, behaviorNotes: e.target.value}))} style={styles.input} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button onClick={() => { setShowEditPet(false); setEditingPet(null); }} style={styles.btnSecondary}><X size={14} /> Cancel</button>
                  <button onClick={handleSaveEditPet} style={styles.btnPrimary} disabled={saving}>
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    {saving ? 'Guardando...' : 'Save cambios'}
                  </button>
                </div>
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

            {/* Pets */}
            <div style={{ ...styles.card, marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ ...styles.cardH3, margin: 0 }}>🐾 Pets</h3>
                {isAdmin && (
                  <button onClick={() => {
                    setShowNewPetForm(prev => !prev);
                    setNewPetFormData({ name: '', breed: '', species: 'dog', size: 'Small (1-20 lbs)', hairType: 'Short Hair', age: '', weight: '', color: '', allergies: '', medicalNotes: '', behaviorNotes: '' });
                  }} style={{ ...styles.btnPrimary, padding: '6px 12px', fontSize: 12 }}>
                    <Plus size={13} /> Add Pet
                  </button>
                )}
              </div>

              {/* Formulario nueva pet */}
              {showNewPetForm && (
                <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowNewPetForm(false); }}>
                <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>➕ New Pet</div>
                    <button onClick={() => setShowNewPetForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
                  </div>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.lbl}>Name *</label>
                      <input value={newPetFormData.name} onChange={e => setNewPetFormData(f => ({...f, name: e.target.value}))} style={styles.input} placeholder="Pet name" />
                    </div>
                    <div>
                      <label style={styles.lbl}>Species</label>
                      <select value={newPetFormData.species} onChange={e => setNewPetFormData(f => ({...f, species: e.target.value}))} style={styles.input}>
                        <option value="dog">🐶 Dog</option>
                        <option value="cat">🐱 Cat</option>
                        <option value="other">🐾 Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.lbl}>Breed</label>
                      <input value={newPetFormData.breed} onChange={e => setNewPetFormData(f => ({...f, breed: e.target.value}))} style={styles.input} placeholder="e.g. Golden Retriever" />
                    </div>
                    <div>
                      <label style={styles.lbl}>Size</label>
                      <select value={newPetFormData.size} onChange={e => setNewPetFormData(f => ({...f, size: e.target.value}))} style={styles.input}>
                        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={styles.lbl}>Hair type</label>
                      <select value={newPetFormData.hairType} onChange={e => setNewPetFormData(f => ({...f, hairType: e.target.value}))} style={styles.input}>
                        <option value="Short Hair">Short Hair</option>
                        <option value="Long Hair">Long Hair</option>
                        <option value="Double Coat">Double Coat</option>
                        <option value="Curly">Curly</option>
                      </select>
                    </div>
                    <div>
                      <label style={styles.lbl}>Age</label>
                      <input value={newPetFormData.age} onChange={e => setNewPetFormData(f => ({...f, age: e.target.value}))} style={styles.input} placeholder="e.g. 3 years" />
                    </div>
                    <div>
                      <label style={styles.lbl}>Weight (lbs)</label>
                      <input type="number" value={newPetFormData.weight} onChange={e => setNewPetFormData(f => ({...f, weight: e.target.value}))} style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.lbl}>Color</label>
                      <input value={newPetFormData.color} onChange={e => setNewPetFormData(f => ({...f, color: e.target.value}))} style={styles.input} placeholder="e.g. Golden" />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={styles.lbl}>⚠️ Allergies / Medical notes</label>
                      <input value={newPetFormData.allergies} onChange={e => setNewPetFormData(f => ({...f, allergies: e.target.value}))} style={styles.input} placeholder="e.g. allergic to lavender" />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={styles.lbl}>🔔 Behavior notes</label>
                      <input value={newPetFormData.behaviorNotes} onChange={e => setNewPetFormData(f => ({...f, behaviorNotes: e.target.value}))} style={styles.input} placeholder="e.g. nervous with strangers" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={async () => {
                      if (!newPetFormData.name.trim()) { alert('Enter pet name'); return; }
                      const pet = {
                        id: uid(), clientId: selectedClient.id, name: newPetFormData.name.trim(),
                        breed: newPetFormData.breed, species: newPetFormData.species,
                        size: newPetFormData.size, hairType: newPetFormData.hairType,
                        age: newPetFormData.age, weight: newPetFormData.weight,
                        color: newPetFormData.color, allergies: newPetFormData.allergies,
                        medicalNotes: newPetFormData.medicalNotes, behaviorNotes: newPetFormData.behaviorNotes,
                      };
                      const ok = await addPet(pet);
                      if (ok) {
                        setShowNewPetForm(false);
                        alert(`✅ ${pet.name} added!`);
                      }
                    }} style={styles.btnPrimary}><Plus size={14} /> Save Pet</button>
                    <button onClick={() => setShowNewPetForm(false)} style={styles.btnSecondary}>Cancel</button>
                  </div>
                </div>
              </div>
              )}

              {clientPets.length === 0 && !showNewPetForm ? (
                <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-secondary)', fontSize: 13 }}>No pets registered yet</div>
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
                          {p.allergies && <div style={{ fontSize: 11, color: 'var(--color-text-danger)', marginTop: 3 }}>⚠️ Allergies: {p.allergies}</div>}
                          {p.behavior_notes && <div style={{ fontSize: 11, color: 'var(--color-text-warning)', marginTop: 2 }}>🔔 {p.behavior_notes}</div>}
                          {p.last_blade && <div style={{ fontSize: 11, color: 'var(--color-text-info)', marginTop: 3 }}>✂️ Último corte: Blade {p.last_blade}{p.last_combo ? ` · Combo ${p.last_combo}` : ''}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {isAdmin && <button onClick={() => startEditPet(p)} style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11 }}><Edit2 size={12} /> Edit</button>}
                          {isAdmin && <button onClick={async () => {
                            if (!confirm(`Delete ${p.name}? This cannot be undone.`)) return;
                            await supabase.from('pets').delete().eq('id', p.id);
                            updatePet({ ...p, _deleted: true });
                          }} style={{ ...styles.iconBtn, color: 'var(--color-text-danger)', padding: '4px 8px' }}><Trash2 size={12} /></button>}
                          <button onClick={() => loadPetHistory(p.id)} style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11 }}>📋 Fichas</button>
                        </div>
                      </div>

                      {/* Historial completo */}
                      {petGroomingHistory[p.id] && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                            📋 Complete History ({petGroomingHistory[p.id].completedAppts?.length || 0} visits)
                          </div>

                          {(petGroomingHistory[p.id].completedAppts?.length || 0) === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No completed visits yet</div>
                          ) : (
                            petGroomingHistory[p.id].completedAppts.map(appt => {
                              const ap = appt.pets?.find(ap => String(ap.petId) === String(p.id));
                              const photos = petGroomingHistory[p.id].photosMap?.[appt.id] || [];
                              const beforePhotos = photos.filter(ph => ph.type === 'before');
                              const afterPhotos = photos.filter(ph => ph.type === 'after');
                              const van = vans.find(v => v.id === appt.vanId);

                              return (
                                <div key={appt.id} style={{ marginBottom: 12, padding: '12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                  {/* Header visita */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>📅 {formatDateNice(appt.date)}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{van?.name} · ${ap?.amount?.toFixed(2) || '0'}</div>
                                  </div>

                                  {/* Service */}
                                  {ap?.service && (
                                    <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 600, marginBottom: 6 }}>
                                      ✂️ {ap.service}
                                    </div>
                                  )}

                                  {/* Fotos */}
                                  {photos.length > 0 && (
                                    <div style={{ marginBottom: 8 }}>
                                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>📸 Photos</div>
                                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {beforePhotos.map(ph => (
                                          <div key={ph.id} style={{ position: 'relative' }}>
                                            <img src={ph.photo_url} alt="before"
                                              onClick={() => window.open(ph.photo_url, '_blank')}
                                              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '2px solid #fcd34d' }} />
                                            <div style={{ position: 'absolute', bottom: 2, left: 2, background: '#f59e0b', borderRadius: 4, padding: '1px 4px', fontSize: 8, color: '#fff', fontWeight: 700 }}>B</div>
                                          </div>
                                        ))}
                                        {afterPhotos.map(ph => (
                                          <div key={ph.id} style={{ position: 'relative' }}>
                                            <img src={ph.photo_url} alt="after"
                                              onClick={() => window.open(ph.photo_url, '_blank')}
                                              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '2px solid #0f766e' }} />
                                            <div style={{ position: 'absolute', bottom: 2, left: 2, background: '#0f766e', borderRadius: 4, padding: '1px 4px', fontSize: 8, color: '#fff', fontWeight: 700 }}>A</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Notes */}
                                  {appt.notes && (
                                    <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>📝 {appt.notes}</div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cards on File - TODO: fix render error */}

            {/* Appointment history */}
            {clientHistory.length > 0 && (
              <div style={{ ...styles.card, marginTop: 12 }}>
                <h3 style={{ ...styles.cardH3, marginBottom: 10 }}>📋 Service History ({clientHistory.length} visits)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {clientHistory.map(a => {
                    const sc = STATUS_COLORS[a.status] || STATUS_COLORS.unconfirmed;
                    const van = vans.find(v => v.id === a.vanId);
                    const total = (a.pets || []).reduce((s, ap) => s + (ap.amount || 0), 0);
                    const photos = petGroomingHistory && Object.values(petGroomingHistory).flatMap(h => Object.entries(h.photosMap || {}).filter(([apptId]) => apptId === a.id).flatMap(([, ps]) => ps));
                    return (
                      <div key={a.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>📅 {formatDateNice(a.date)}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                              🚐 {van?.name || ''} · 💰 ${total.toFixed(2)} · {a.paymentMethod || ''}
                            </div>
                          </div>
                          <div style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text }}>
                            {STATUS_LABELS[a.status]}
                          </div>
                        </div>

                        {/* Pets & services */}
                        {(a.pets || []).map((ap, i) => (
                          <div key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 3 }}>
                            🐾 <strong>{ap.pet?.name || ap.petName || 'Pet'}</strong> — {ap.service || ''} {ap.amount ? `$${ap.amount.toFixed(2)}` : ''}
                          </div>
                        ))}

                        {/* Agreement */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          {a.agreementSigned && (
                            <div style={{ fontSize: 11, padding: '3px 8px', background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 999, color: '#0f766e', fontWeight: 600 }}>
                              ✍️ Agreement signed
                            </div>
                          )}
                          {a.notes && a.notes.includes('Firmado') && (
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              {a.notes.match(/\[Firmado: ([^\]]+)\]/)?.[1] || ''}
                            </div>
                          )}
                        </div>

                        {/* Photos */}
                        {photos && photos.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>📸 Photos</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {photos.map(ph => (
                                <div key={ph.id} style={{ position: 'relative' }}>
                                  <img src={ph.photo_url} alt={ph.type}
                                    onClick={() => window.open(ph.photo_url, '_blank')}
                                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `2px solid ${ph.type === 'before' ? '#fcd34d' : '#0f766e'}` }} />
                                  <div style={{ position: 'absolute', bottom: 2, left: 2, background: ph.type === 'before' ? '#f59e0b' : '#0f766e', borderRadius: 4, padding: '1px 4px', fontSize: 8, color: '#fff', fontWeight: 700 }}>
                                    {ph.type === 'before' ? 'B' : 'A'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {a.notes && !a.notes.includes('Firmado') && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>📝 {a.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BreedsTab({ session }) {
  const [step, setStep] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const BREED_CUTS = {
    'Golden Retriever': { cuts: ['Natural / Show cut', 'Summer cut', 'Teddy bear cut'], blades: ['#4F', '#5F'], combos: ['#A (3/4")', '#C (7/8")'], note: 'Pelo doble — nunca rasurar hasta la piel. Cepillar bien antes del baño.', warn: 'Revisar zona detrás de las orejas — muy propenso a enredos.' },
    'Poodle': { cuts: ['Puppy cut', 'Continental clip', 'Lamb cut'], blades: ['#10', '#15', '#30'], combos: ['#1 (1/2")', '#2 (3/8")', '#4 (1/4")'], note: 'Pelo rizado que crece continuamente. No hace shed. Requiere grooming cada 4-6 weeks.', warn: 'Revisar bien las patas y cara — el pelo crece muy rápido en esas zonas.' },
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
              { type: 'text', text: `Eres un experto en breeds de perros para una company de mobile grooming en Florida llamada El Pet Wash.

Analiza esta imagen y responde SOLO en JSON con este formato exacto, sin texto adicional, sin markdown:
{
  "breed": "name de la breed en inglés",
  "confidence": número del 1 al 100,
  "origin": "país de origen",
  "size": "Small|Medium|Large|Extra Large",
  "hair_type": "Short Hair|Long Hair",
  "mix": false o true si es monthtizo,
  "mix_breeds": "si es monthtizo, las breeds que parece tener, si no es monthtizo deja vacío",
  "price_service": "Signature Bath",
  "price_range": "$70-$90",
  "grooming_notes": "2-3 observaciones importantes sobre el grooming de esta breed",
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
      <SectionTitle eyebrow="Inteligencia artificial" title="Identificador de breeds" />

      {step === 'upload' && (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🐾</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 8 }}>Toma una foto del perro</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>La IA detectará la breed y sugerirá el corte, blade y combo ideal</div>
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
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6 }}>La IA está identificando la breed</div>
        </div>
      )}

      {step === 'result' && result && (
        <div>
          {/* Resultado principal */}
          <div style={styles.card}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
              <img src={imagePreview} alt="Perro" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Breed detectada</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {result.breed} {result.mix && <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>(monthtizo)</span>}
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

          {/* Notes de grooming de la IA */}
          {result.grooming_notes && (
            <div style={{ ...styles.card, marginTop: 12 }}>
              <h3 style={{ ...styles.cardH3, marginBottom: 8 }}>📋 Notes de la IA</h3>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{result.grooming_notes}</div>
            </div>
          )}

          {/* Price sugerido */}
          <div style={{ ...styles.card, marginTop: 12 }}>
            <h3 style={{ ...styles.cardH3, marginBottom: 8 }}>💰 Price sugerido — El Pet Wash</h3>
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
function DashboardTab({ vans, services, expenses, settings, appointments, groomers, companies, companyExpenses, vanLocations = [], lockedCompanyId = null }) {
  const [section, setSection] = useState('overview');
  const [period, setPeriod] = useState('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(lockedCompanyId || 'all');

  const now = new Date();
  const todayStr = todayISO();

  const getRange = () => {
    if (period === 'custom' && customStart && customEnd) {
      return { start: customStart, end: customEnd, label: `${customStart} → ${customEnd}` };
    }
    if (period === 'week') {
      const { start, end } = getWeekRange(todayStr);
      return { start, end, label: 'Esta week' };
    }
    if (period === 'month') {
      const start = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
      return { start, end: todayStr, label: 'Este month' };
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

  // Por company
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

  // Expenses por van y category
  const expensesByVan = useMemo(() => vans.map(v => {
    const vanExp = filteredExpenses.filter(e => e.vanId === v.id);
    const byCategory = {};
    vanExp.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    return { van: v, total: vanExp.reduce((s,e) => s + e.amount, 0), byCategory };
  }).filter(v => v.total > 0), [filteredExpenses, vans]);

  // Days de la week
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
          {parseFloat(growth) >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs período previous
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
          {!lockedCompanyId && (
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
          )}

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
          {!lockedCompanyId && <AlertsPanel appointments={appointments} vans={vans} groomers={groomers} services={services} expenses={expenses} vanLocations={vanLocations} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            <KPI label="Ingresos brutos" value={fmt(totalRevenue)} sub={`+${fmt(totalTips)} tips`} color="#0f766e" growth={revenueGrowth} />
            <KPI label="Neto" value={fmt(netRevenue)} sub={`-${fmt(totalExpenses)} gastos`} color="#7c3aed" />
            <KPI label="Appointments" value={totalAppts} sub={`${completedAppts} completadas (${completionRate}%)`} color="#3b82f6" />
            <KPI label="Pets" value={totalPets} color="#f59e0b" />
            <KPI label="Fee tarjeta" value={fmt(totalCardFees)} color="#ec4899" />
            <KPI label="Fee gas" value={fmt(totalGasFees)} sub="Company Income" color="#0284c7" />
          </div>

          {/* EPW vs ATW */}
          {selectedCompany === 'all' && (
            <div style={{ ...styles.card, marginBottom: 16 }}>
              <h3 style={styles.cardH3}>🏢 Por company</h3>
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

          {/* Days de la week */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>📅 Appointments por day</h3>
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
            <KPI label="Fee gas" value={fmt(totalGasFees)} sub={`${filteredServices.length} services × $${settings?.gasFee || 7}`} color="#0284c7" />
            <KPI label="Total ingresos company" value={fmt(totalRevenue + totalCardFees + totalGasFees)} color="#0f172a" />
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
              <h3 style={styles.cardH3}>🏢 Por company</h3>
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
            <KPI label="Pets atendidas" value={totalPets} color="#ec4899" />
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
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Por appointment</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#0f766e' }}>
                  {fmt(totalAppts > 0 ? totalRevenue / totalAppts : 0)}
                </div>
              </div>
              <div style={{ padding: '14px', background: '#f0fdfa', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Por pet</div>
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
            <KPI label="Appointments completadas" value={completedAppts} sub={`${completionRate}% tasa de completación`} color="#3b82f6" />
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
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>a pay</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, marginBottom: 8 }}>
                  <div style={{ padding: '8px', background: '#f8fafc', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{g.appts}</div>
                    <div style={{ color: '#94a3b8' }}>Appointments</div>
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
            <KPI label="Total appointments" value={totalAppts} color="#3b82f6" />
            <KPI label="Completeds" value={completedAppts} sub={`${completionRate}%`} color="#0f766e" />
            <KPI label="Cancelleds" value={cancelledAppts} sub={`${pct(cancelledAppts, totalAppts)}%`} color="#dc2626" />
            <KPI label="Total gastos" value={fmt(totalExpenses)} color="#f59e0b" />
          </div>

          {/* Expenses por van y category */}
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

          {/* Appointments por van */}
          <div style={styles.card}>
            <h3 style={styles.cardH3}>🚐 Appointments por van</h3>
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
            📊 Comparando <strong>{label}</strong> vs período previous ({prior.start} → {prior.end})
          </div>

          {[
            { label: 'Ingresos', current: totalRevenue, prior: priorRevenue, fmt: true },
            { label: 'Services', current: filteredServices.length, prior: priorServices.length, fmt: false },
            { label: 'Appointments', current: totalAppts, prior: appointments.filter(a => inRange(a.date, prior.start, prior.end)).length, fmt: false },
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
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Período previous</div>
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
            <button onClick={() => exportPLPDF(filteredServices, filteredExpenses, vans, settings, start, end)} style={{ ...styles.btnSecondary, fontSize: 12 }}>
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
  
  // Calcular week actual (Lun-Dom)
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

  // Verificar appointments sin close en la week
  const openAppts = useMemo(() => {
    return appointments.filter(a =>
      inRange(a.date, weekStart, weekEnd) &&
      a.status !== 'completed' &&
      a.status !== 'cancelled'
    );
  }, [appointments, weekStart, weekEnd]);

  const hasOpenAppts = openAppts.length > 0;

  // Verificar si la week ya fue pagada
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
      const totalCardFees = groomerServices.filter(s => s.method === 'Credit Card').reduce((sum, s) => sum + (s.cardFee || 0), 0);
      const gasFees = groomerServices.length * (settings?.gasFee || 7);
      const commissionPct = g.commissionPct || 45;
      const netSales = Math.max(0, totalSales - gasFees); // Gas fee antes de comisión
      const commission = netSales * commissionPct / 100;
      const tipsShare = totalTips * (settings?.tipsToGroomer || 100) / 100;
      const totalEarned = commission + tipsShare;

      const paidInPeriod = groomerPayments
        .filter(p => p.groomer_id === g.id && p.period_start === weekStart && p.period_end === weekEnd)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const balance = totalEarned - paidInPeriod;
      const alreadyPaid = weekAlreadyPaid(g.id);

      // Appointments abiertas de este groomer en la week
      const groomerOpenAppts = openAppts.filter(a => {
        const apptVan = vans.find(v => v.id === a.vanId);
        return apptVan?.id === g.vanId || a.groomerId === g.id;
      });

      return { ...g, van, company, totalSales, totalTips, totalCardFees, gasFees, netSales, commission, tipsShare, totalEarned, paidInPeriod, balance, commissionPct, serviceCount: groomerServices.length, alreadyPaid, groomerOpenAppts };
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

      {/* Selector de week */}
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

        {/* Alerta appointments abiertas */}
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

function ExpensesCompanyTab({ vans, session, companies, companyExpenses, setCompanyExpenses, taxRate, lockedCompanyId = null }) {
  const [form, setForm] = useState({
    companyId: lockedCompanyId || 'epw', category: 'Mantenimiento', description: '',
    amount: '', tax: '', method: 'cash', vanId: '', date: todayISO(),
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterCompany, setFilterCompany] = useState(lockedCompanyId || 'all');
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
    if (!form.amount || !form.category) { alert('Ingresa category y monto'); return; }
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
      <SectionTitle eyebrow="Administration" title="💼 Expenses de Company" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => exportTaxReportPDF(companyExpenses, vans, dateStart, dateEnd)}
          style={{ ...styles.btnSecondary, fontSize: 12 }}>
          <FileText size={13} /> Tax Report PDF
        </button>
        <button onClick={() => exportTaxReportExcel(companyExpenses, vans, dateStart, dateEnd)}
          style={{ ...styles.btnSecondary, fontSize: 12 }}>
          <Download size={13} /> Tax Report Excel
        </button>
      </div>

      <div style={styles.card}>
        {!lockedCompanyId && (
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
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={styles.lbl}>Category</label>
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
              <option value="tarjeta-company">💳 Tarjeta company</option>
              <option value="cheque">📄 Cheque</option>
              <option value="zelle">📱 Zelle</option>
            </select>
          </div>
          <div>
            <label style={styles.lbl}>Van (opcional)</label>
            <select value={form.vanId} onChange={e => setForm(f => ({...f, vanId: e.target.value}))} style={styles.input}>
              <option value="">🏢 Toda la company</option>
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
          {!lockedCompanyId && (
          <div>
            <label style={styles.lbl}>Company</label>
            <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} style={styles.input}>
              <option value="all">Todas</option>
              {DEFAULT_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.logoEmoji} {c.name}</option>)}
            </select>
          </div>
          )}
          <div>
            <label style={styles.lbl}>Category</label>
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
          const methodLabels = { cash: '💵 Cash', 'tarjeta-company': '💳 Tarjeta company', cheque: '📄 Cheque', zelle: '📱 Zelle' };
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
                  <button onClick={async () => { if (!confirm('¿Delete?')) return; await deleteCompanyExpense(e.id); setCompanyExpenses(prev => prev.filter(x => x.id !== e.id)); }} style={{ ...styles.iconBtn, color: '#dc2626' }}><Trash2 size={14} /></button>
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
function InventoryTab({ vans, session, isAdmin, inventoryItems, setInventoryItems, inventoryRequests, setInventoryRequests, groomers }) {
  const t = useT('en');
  const isGroomer = session?.role === 'groomer';
  const myVanId = session?.vanId;
  const [activeSection, setActiveSection] = useState(isGroomer ? 'soliappointmentr' : 'solicitudes');
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
    if (!newItemName.trim()) { alert('Ingresa el name del artículo'); return; }
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
            <button onClick={() => setActiveSection('soliappointmentr')} style={{ flex: 1, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === 'soliappointmentr' ? 600 : 400, background: activeSection === 'soliappointmentr' ? '#fff' : 'transparent', color: activeSection === 'soliappointmentr' ? '#0f766e' : '#64748b' }}>{t('request_supplies')}</button>
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

      {activeSection === 'soliappointmentr' && (
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
            <label style={styles.lbl}>Notes adicionales</label>
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
              <div><label style={styles.lbl}>Name *</label><input value={newItemName} onChange={e => setNewItemName(e.target.value)} style={styles.input} placeholder="Ej: Shampoo desodorizante" /></div>
              <div>
                <label style={styles.lbl}>Category</label>
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
            <button onClick={handleAddItem} style={{ ...styles.btnPrimary, marginTop: 12 }}><Plus size={15} /> Add artículo</button>
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

// ===== MESSAGES TAB =====
function MessagesTab({ clients, vans, session }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filterCompany, setFilterCompany] = useState('all');
  const [search, setSearch] = useState('');
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [newMsgSearch, setNewMsgSearch] = useState('');
  const [newMsgClient, setNewMsgClient] = useState(null);
  const [newMsgCompany, setNewMsgCompany] = useState('epw');
  const messagesEndRef = useRef(null);
  const [parsedClient, setParsedClient] = useState(null);
  const [showParsedClient, setShowParsedClient] = useState(false);

  // Clientes filtrados para nuevo mensaje
  const newMsgClients = useMemo(() => {
    if (!newMsgSearch.trim()) return [];
    return clients.filter(c =>
      c.name.toLowerCase().includes(newMsgSearch.toLowerCase()) ||
      c.phone?.includes(newMsgSearch)
    ).slice(0, 8);
  }, [clients, newMsgSearch]);

  const startConversation = (client) => {
    setSelectedConversation({
      phone: client.phone,
      clientName: client.name,
      clientId: client.id,
      companyId: newMsgCompany,
      messages: [],
    });
    loadConversationHistory(client.phone);
    setShowNewMsg(false);
    setNewMsgSearch('');
    setNewMsgClient(null);
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (!error && data) setMessages(data);
    setLoading(false);
  };

  // Cargar historial completo de una conversación específica
  const loadConversationHistory = async (phone) => {
    const cleanPhone = phone?.replace(/\D/g, '').slice(-10);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .ilike('phone', `%${cleanPhone}`)
      .order('created_at', { ascending: true });
    if (data && data.length > 0) {
      // Merge con mensajes existentes
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = data.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMsgs];
      });
    }
  };

  useEffect(() => {
    loadMessages();
    // Poll every 10s for new messages
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation, messages]);

  // Agrupar por conversación (por teléfono)
  const conversations = useMemo(() => {
    const map = {};
    messages.forEach(m => {
      const key = m.phone?.replace(/\D/g, '').slice(-10);
      if (!map[key]) {
        map[key] = {
          phone: m.phone,
          clientName: m.client_name || m.phone,
          clientId: m.client_id,
          companyId: m.company_id,
          messages: [],
          lastMessage: m,
          unread: 0,
        };
      }
      map[key].messages.push(m);
      if (m.direction === 'inbound') map[key].unread++;
    });
    return Object.values(map)
      .filter(c => {
        if (filterCompany !== 'all' && c.companyId !== filterCompany) return false;
        if (search && !c.clientName.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
  }, [messages, filterCompany, search]);

  const conversationMessages = useMemo(() => {
    if (!selectedConversation) return [];
    const key = selectedConversation.phone?.replace(/\D/g, '').slice(-10);
    return messages
      .filter(m => m.phone?.replace(/\D/g, '').slice(-10) === key)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [messages, selectedConversation]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');

    // Mostrar mensaje inmediatamente (optimistic update)
    const tempMsg = {
      id: `temp-${Date.now()}`,
      client_id: selectedConversation.clientId,
      client_name: selectedConversation.clientName,
      phone: selectedConversation.phone,
      company_id: selectedConversation.companyId || 'epw',
      direction: 'outbound',
      body: msgText,
      status: 'sending',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConversation.phone,
          message: msgText,
          companyId: selectedConversation.companyId || 'epw',
          clientId: selectedConversation.clientId,
          clientName: selectedConversation.clientName,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Recargar mensajes reales desde Supabase
        await loadMessages();
      } else {
        // Remover mensaje temporal si falló
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        alert('Error sending: ' + data.error);
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      alert('Error: ' + err.message);
    }
    setSending(false);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <SectionTitle eyebrow="Communications" title={`💬 Messages${totalUnread > 0 ? ` · ${totalUnread} new` : ''}`}
        right={
          <button onClick={() => setShowNewMsg(true)} style={styles.btnPrimary}>
            <Plus size={14} /> New Message
          </button>
        }
      />

      {/* Modal nuevo mensaje */}
      {showNewMsg && (
        <div style={{ ...styles.card, marginBottom: 16, border: '1px solid #0f766e', background: '#f0fdfa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>💬 New Message</div>
            <button onClick={() => { setShowNewMsg(false); setNewMsgSearch(''); setNewMsgClient(null); }} style={styles.iconBtn}><X size={16} /></button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={styles.lbl}>Company</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {DEFAULT_COMPANIES.map(c => (
                <button key={c.id} onClick={() => setNewMsgCompany(c.id)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${newMsgCompany === c.id ? '#0f766e' : '#e2e8f0'}`, background: newMsgCompany === c.id ? '#fff' : '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: newMsgCompany === c.id ? 700 : 400, color: newMsgCompany === c.id ? '#0f766e' : '#64748b' }}>
                  {c.logoEmoji} {c.name}
                </button>
              ))}
            </div>
          </div>
          {newMsgClient ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', borderRadius: 10, border: '1.5px solid #0f766e', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{newMsgClient.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{newMsgClient.phone}</div>
              </div>
              <button onClick={() => setNewMsgClient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18 }}>×</button>
            </div>
          ) : (
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input value={newMsgSearch} onChange={e => setNewMsgSearch(e.target.value)}
                style={styles.input} placeholder="Search client by name or phone..." autoComplete="off" />
              {newMsgClients.length > 0 && (
                <div style={styles.suggestionsBox}>
                  {newMsgClients.map(c => (
                    <button key={c.id} onMouseDown={() => setNewMsgClient(c)}
                      className="suggestion-hover" style={styles.suggestionItem}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{c.phone || 'No phone'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {newMsgClient && (
            <button onClick={() => startConversation(newMsgClient)}
              disabled={!newMsgClient?.phone}
              style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center', background: !newMsgClient?.phone ? '#94a3b8' : '#0f766e' }}>
              {!newMsgClient?.phone ? '⚠️ Client has no phone' : '💬 Start Conversation'}
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Lista de conversaciones */}
        <div style={{ width: selectedConversation ? '35%' : '100%', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            {[{ id: 'all', label: '🏢 All' }, ...DEFAULT_COMPANIES.map(c => ({ id: c.id, label: `${c.logoEmoji} ${c.name}` }))].map(c => (
              <button key={c.id} onClick={() => setFilterCompany(c.id)}
                style={{ padding: '4px 10px', borderRadius: 999, border: `1.5px solid ${filterCompany === c.id ? '#0f766e' : '#e2e8f0'}`, background: filterCompany === c.id ? '#f0fdfa' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: filterCompany === c.id ? 700 : 400, color: filterCompany === c.id ? '#0f766e' : '#64748b' }}>
                {c.label}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            style={styles.input} placeholder="Search conversations..." />

          {loading ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <p style={{ margin: 0, color: '#64748b', fontFamily: 'Fraunces, serif', fontSize: 16 }}>No messages yet</p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8' }}>Click "New Message" to start</p>
            </div>
          ) : conversations.map(conv => {
            const isSelected = selectedConversation?.phone === conv.phone;
            const company = DEFAULT_COMPANIES.find(c => c.id === conv.companyId);
            const lastMsg = conv.lastMessage;
            return (
              <div key={conv.phone} onClick={() => {
                setSelectedConversation(conv);
                loadConversationHistory(conv.phone);
              }}
                style={{ padding: '12px 14px', background: isSelected ? '#f0fdfa' : '#fff', border: `1.5px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`, borderRadius: 12, cursor: 'pointer', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{conv.clientName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{company?.logoEmoji} {company?.name} · {conv.phone}</div>
                    <div style={{ fontSize: 12, color: lastMsg.direction === 'inbound' ? '#0f766e' : '#64748b', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMsg.direction === 'inbound' ? '← ' : '→ '}{lastMsg.body}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>
                      {new Date(lastMsg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {conv.unread > 0 && (
                      <div style={{ background: '#0f766e', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversación abierta */}
        {selectedConversation && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setSelectedConversation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>←</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedConversation.clientName}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{selectedConversation.phone}</div>
              </div>
              <button onClick={() => window.open(`tel:${selectedConversation.phone}`, '_blank')}
                style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: '#0f766e', fontWeight: 600 }}>
                📞 Call
              </button>
              {!selectedConversation.clientId && (
                <button onClick={async () => {
                  const msgs = conversationMessages.map(m => `${m.direction === 'inbound' ? 'Client' : 'Us'}: ${m.body}`).join('\n');
                  try {
                    const r = await fetch('/api/parse-client', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ messages: msgs })
                    });
                    const result = await r.json();
                    if (result.success && result.data) {
                      const info = result.data;
                      setParsedClient({
                        name: info.name || '',
                        phone: selectedConversation.phone || '',
                        address: info.address || '',
                        zip: info.zip || '',
                        city: info.city || '',
                        state: info.state || 'FL',
                        petName: info.petName || '',
                        petBreed: info.petBreed || '',
                        petSize: info.petSize || 'medium',
                        petSpecies: info.petSpecies || 'dog',
                        companyId: selectedConversation.companyId || 'epw',
                      });
                      setShowParsedClient(true);
                    } else {
                      alert('Could not parse client info. Try again.');
                    }
                  } catch(e) { alert('Error: ' + e.message); }
                }} style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 600 }}>
                  🤖 Parse & Create
                </button>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {conversationMessages.map(msg => {
                const isOutbound = msg.direction === 'outbound';
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isOutbound ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: isOutbound ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isOutbound ? '#0f766e' : '#f1f5f9', color: isOutbound ? '#fff' : '#0f172a', fontSize: 14 }}>
                      <div>{msg.body}</div>
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: isOutbound ? 'right' : 'left' }}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {isOutbound && ' ✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { en: '👋 Hi! Welcome to our grooming service! How can we help?', es: '👋 ¡Hola! Bienvenido a nuestro servicio de grooming. ¿En qué podemos ayudarte?' },
                { en: '📅 Would you like to schedule an appointment?', es: '📅 ¿Te gustaría agendar una cita?' },
                { en: '✅ Your appointment is confirmed!', es: '✅ ¡Tu cita está confirmada!' },
                { en: '🚗 Your groomer is on the way!', es: '🚗 ¡Tu groomer está en camino!' },
                { en: '🐾 Your pet is ready for pickup!', es: '🐾 ¡Tu mascota está lista para recoger!' },
                { en: '📋 Please reply with your name, address and pet info to get started!', es: '📋 Por favor responde con tu nombre, dirección e info de tu mascota para comenzar.' },
              ].map((msg, i) => {
                const lastClientMsg = conversationMessages.filter(m => m.direction === 'inbound').slice(-1)[0]?.body || '';
                const isSpanish = /[áéíóúüñ¿¡]/i.test(lastClientMsg) || /(hola|gracias|cita|mascota|perro|gato|quiero|necesito|ayuda)/i.test(lastClientMsg);
                const text = isSpanish ? msg.es : msg.en;
                return (
                  <button key={i} onClick={() => setNewMessage(text)}
                    style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
                    {text.slice(0, 30)}...
                  </button>
                );
              })}
            </div>
            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                style={{ ...styles.input, flex: 1 }} placeholder="Type a message..." />
              <button onClick={handleSend} disabled={sending || !newMessage.trim()}
                style={{ padding: '10px 16px', background: sending || !newMessage.trim() ? '#94a3b8' : '#0f766e', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                {sending ? '...' : '→'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ===== SMART FILL TAB =====
function SmartFillTab({ groomers, vans, appointments, clients, pets, settings, addAppointment, servicePrices, session }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [selectedGroomer, setSelectedGroomer] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [manualZip, setManualZip] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [minWeeks, setMinWeeks] = useState(0);
  const GOOGLE_API_KEY = 'AIzaSyBR-RQ639CWkt-SprO3EM4iHp89ahPVvmE';

  // Citas del groomer en la fecha seleccionada
  const groomerAppts = useMemo(() => {
    if (!selectedGroomer) return [];
    const groomer = groomers.find(g => g.id === selectedGroomer);
    return appointments.filter(a => 
      a.date === selectedDate && 
      (a.groomerId === selectedGroomer || a.vanId === groomer?.vanId) &&
      a.status !== 'cancelled'
    ).sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''));
  }, [selectedGroomer, selectedDate, appointments, groomers]);

  // Detectar huecos en el schedule
  const gaps = useMemo(() => {
    const result = [];
    const workStart = '08:00';
    const workEnd = '18:00';
    if (groomerAppts.length === 0) {
      result.push({ start: workStart, end: workEnd, label: 'Full day available' });
      return result;
    }
    if (groomerAppts[0].timeStart > workStart) {
      result.push({ start: workStart, end: groomerAppts[0].timeStart, label: `Morning gap` });
    }
    for (let i = 0; i < groomerAppts.length - 1; i++) {
      const gapStart = groomerAppts[i].timeEnd || groomerAppts[i].timeStart;
      const gapEnd = groomerAppts[i + 1].timeStart;
      if (gapStart && gapEnd && gapStart < gapEnd) {
        result.push({ start: gapStart, end: gapEnd, label: `Gap between appointments` });
      }
    }
    const lastAppt = groomerAppts[groomerAppts.length - 1];
    if (lastAppt.timeEnd && lastAppt.timeEnd < workEnd) {
      result.push({ start: lastAppt.timeEnd, end: workEnd, label: 'Afternoon gap' });
    }
    return result;
  }, [groomerAppts]);

  // Buscar clientes cercanos
  const findNearbyCients = async () => {
    if (!selectedGroomer || groomerAppts.length === 0) {
      alert('Select a groomer with at least one appointment first');
      return;
    }
    setLoading(true);
    setSuggestions([]);
    const refAppt = groomerAppts[0];
    const refClient = clients.find(c => String(c.id) === String(refAppt.clientId));
    const extractZip = (addr) => { const m = (addr || '').match(/(?:FL|Florida)[,\s]+(\d{5})/i) || (addr || '').match(/,\s*(\d{5})\s*$/); return m ? m[1] : null; };
    const refZip = manualZip || extractZip(refClient?.address);
    console.log('refClient:', refClient?.name, 'address:', refClient?.address, 'zip:', refZip);
    if (!refZip) { setLoading(false); alert('No ZIP found. Please enter a ZIP manually.'); return; }
    console.log('Searching ZIP:', refZip, 'candidates:', clients.length);
    const bookedClientIds = groomerAppts.map(a => String(a.clientId));
    const extractCity = (addr) => {
      const m = (addr || '').match(/([A-Za-z\s]+),?\s*FL/i);
      return m ? m[1].trim().toLowerCase() : null;
    };
    const refCity = refClient?.city || extractCity(refClient?.address) || manualCity.toLowerCase();
    const groomer = groomers.find(g => g.id === selectedGroomer);
    const groomerCompanyId = groomer?.companyId;
    const candidateClients = clients.filter(c => {
      if (bookedClientIds.includes(String(c.id))) return false;
      if (c.active === false) return false;
      // Filtrar por empresa del groomer
      if (groomerCompanyId && c.companies && c.companies.length > 0 && !c.companies.includes(groomerCompanyId)) return false;
      if (refZip && (c.zip === refZip || extractZip(c.address) === refZip)) return true;
      if (manualCity && (c.city?.toLowerCase() === manualCity.toLowerCase() || extractCity(c.address) === manualCity.toLowerCase())) return true;
      return false;
    });
    const results = candidateClients.map(c => {
      const clientPets = pets.filter(p => String(p.client_id) === String(c.id));
      const lastAppt = appointments.filter(a => String(a.clientId) === String(c.id))
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        client: c, pets: clientPets, distance: c.zip ? 'ZIP ' + c.zip : extractZip(c.address) ? 'ZIP ' + extractZip(c.address) : c.city || extractCity(c.address) || 'Same area', distanceValue: 0,
        lastAppt, lastService: lastAppt?.serviceName || '', lastPrice: lastAppt?.servicePrice || 0,
        weeksSince: lastAppt ? Math.floor((new Date() - new Date(lastAppt.date)) / (1000*60*60*24*7)) : 99,
      };
    }).filter(r => r.weeksSince >= minWeeks).sort((a, b) => b.weeksSince - a.weeksSince);
    setSuggestions(results);
    setLoading(false);
  };

  const sendSMS = async (client) => {
    const groomer = groomers.find(g => g.id === selectedGroomer);
    const companyId = groomer?.companyId || vans.find(v => v.id === groomer?.vanId)?.companyId || 'epw';
    const msg = `Hi ${client.name.split(' ')[0]}! 🐾 We have availability on ${selectedDate} near your area. Would you like to schedule a grooming appointment? Reply YES and we'll get you booked!`;
    console.log('Sending SMS to:', client.phone, 'companyId:', companyId);
    const ok = await sendSMSApi(client.phone, msg, companyId, String(client.id), client.name);
    console.log('SMS result:', ok);
    if (ok) alert('✅ Message sent to ' + client.name + '!');
    else { console.log('Falling back to native SMS'); window.open(`sms:${client.phone}?body=${encodeURIComponent(msg)}`); }
  };

  const bookClient = (suggestion) => {
    setSelectedClient(suggestion);
  };

  const lbl = { fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' };
  const inp = { width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' };

  if (selectedClient) {
    const groomer = groomers.find(g => g.id === selectedGroomer);
    const van = vans.find(v => v.id === groomer?.vanId);
    return (
      <div style={{ padding: 16, maxWidth: 600, margin: '0 auto', paddingBottom: 100 }}>
        <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', color: '#0f766e', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>← Back to Smart Fill</button>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📅 Book {selectedClient.client.name}</div>
        <div style={{ background: '#f0fdfa', border: '1.5px solid #0f766e', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📋 Appointment Details</div>
          <div style={{ fontSize: 13, color: '#374151' }}>📅 Date: {selectedDate}</div>
          <div style={{ fontSize: 13, color: '#374151' }}>✂️ Groomer: {groomer?.name}</div>
          <div style={{ fontSize: 13, color: '#374151' }}>🐾 Last service: {selectedClient.lastService} — ${selectedClient.lastPrice}</div>
          <div style={{ fontSize: 13, color: '#374151' }}>📍 Distance: {selectedClient.distance}</div>
        </div>
        {gaps.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Available time slots</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {gaps.map((gap, i) => (
                <div key={i} style={{ padding: '8px 14px', background: '#f0fdfa', border: '1.5px solid #0f766e', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#0f766e' }}>
                  {gap.start} – {gap.end}
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={() => {
          // Redirect to appointments tab with pre-filled data
          alert(`Ready to book ${selectedClient.client.name} on ${selectedDate} with ${groomer?.name}!\n\nGo to Schedule → New Appointment to complete the booking.`);
          setSelectedClient(null);
        }} style={{ width: '100%', padding: 14, background: '#0f766e', border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
          ✅ Create Appointment
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>💡 Smart Fill</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Find nearby clients to fill schedule gaps</div>

      {/* Selector de groomer y fecha */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Groomer</label>
            <select value={selectedGroomer} onChange={e => setSelectedGroomer(e.target.value)} style={inp}>
              <option value="">Select...</option>
              {groomers.filter(g => g.active !== false).map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Citas del día */}
      {selectedGroomer && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📅 {groomerAppts.length} appointment{groomerAppts.length !== 1 ? 's' : ''} on {selectedDate}</div>
          {groomerAppts.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>No appointments — full day available</div>
          ) : groomerAppts.map((a, i) => {
            const client = clients.find(c => String(c.id) === String(a.clientId));
            return (
              <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{a.timeStart} – {a.timeEnd}</span> · {client?.name || 'Unknown'}
                {client?.address && <div style={{ fontSize: 11, color: '#64748b' }}>📍 {client.address}</div>}
              </div>
            );
          })}
          {gaps.length > 0 && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef9c3', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#854d0e' }}>⏰ {gaps.length} gap{gaps.length > 1 ? 's' : ''} found: {gaps.map(g => `${g.start}–${g.end}`).join(', ')}</div>
            </div>
          )}
        </div>
      )}

      {/* ZIP manual */}
      {selectedGroomer && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>📮 Search by ZIP or City</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>ZIP Code</label>
              <input value={manualZip} onChange={e => setManualZip(e.target.value)} placeholder='33142'
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} maxLength={5} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3 }}>City</label>
              <input value={manualCity} onChange={e => setManualCity(e.target.value)} placeholder='Miami'
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      )}
      {selectedGroomer && (
        <button onClick={findNearbyCients} disabled={loading}
          style={{ width: '100%', padding: 14, background: '#0f766e', border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
          {loading ? '🔍 Searching...' : '🔍 Find Nearby Clients'}
        </button>
      )}

      {/* Sugerencias */}
      {suggestions.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10 }}>
            📍 {suggestions.length} nearby clients found
          </div>
          {suggestions.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{s.client.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>📍 {s.distance} away</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>🐾 {s.pets.map(p => p.name).join(', ')}</div>
                  {s.lastAppt && <div style={{ fontSize: 12, color: '#64748b' }}>Last visit: {s.weeksSince} weeks ago · {s.lastService}</div>}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f766e' }}>${s.lastPrice}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => sendSMS(s.client)}
                  style={{ flex: 1, padding: '8px', background: '#f0fdfa', border: '1.5px solid #0f766e', borderRadius: 10, color: '#0f766e', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  📱 SMS
                </button>
                <button onClick={() => window.open(`tel:${s.client.phone}`)}
                  style={{ flex: 1, padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  📞 Call
                </button>
                <button onClick={() => bookClient(s)}
                  style={{ flex: 1, padding: '8px', background: '#0f766e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  📅 Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !loading && selectedGroomer && (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 14 }}>
          Press "Find Nearby Clients" to search
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
  main: { padding: '32px 28px 120px', maxWidth: 1280, margin: '0 auto' },
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

// ===== BOOKING REQUESTS — SUPABASE =====
const loadBookingRequests = async () => {
  const { data, error } = await supabase.from('booking_requests').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
};
const saveBookingRequest = async (req) => {
  const { error } = await supabase.from('booking_requests').insert({
    id: req.id, company_id: req.companyId, client_name: req.clientName,
    phone: req.phone, address: req.address || '', zip: req.zip || '',
    city: req.city || '', state: req.state || 'FL',
    pet_name: req.petName, breed: req.breed || '', size: req.size || '',
    service: req.service || '', notes: req.notes || '', status: 'pending',
  });
  if (error) console.error(error);
  return !error;
};
const updateBookingRequest = async (id, updates) => {
  const { error } = await supabase.from('booking_requests').update(updates).eq('id', id);
  if (error) console.error(error);
  return !error;
};

// ===== SOUND + BROWSER NOTIFICATIONS =====
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
  } catch(e) {}
};
const showBrowserNotification = (title, body) => {
  if (!('Notification' in window)) return;
  const show = () => new Notification(title, { body, icon: '/Raykota.jpg' });
  if (Notification.permission === 'granted') show();
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') show(); });
  }
};

// ===== BOOKING PAGE (público, sin login) =====
function BookingPage({ companyId }) {
  const company = DEFAULT_COMPANIES.find(c => c.id === companyId) || DEFAULT_COMPANIES[0];
  const [step, setStep] = useState('form'); // form | success
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', address: '', zip: '', city: '', state: 'FL',
    petName: '', breed: '', size: 'Small (1-20 lbs)', service: 'Signature Bath', notes: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.petName.trim()) e.petName = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const req = {
      id: uid(), companyId,
      clientName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      phone: form.phone.trim(), address: form.address.trim(),
      zip: form.zip, city: form.city, state: form.state,
      petName: form.petName.trim(), breed: form.breed,
      size: form.size, service: form.service, notes: form.notes,
    };
    await saveBookingRequest(req);
    setSaving(false);
    setStep('success');
  };

  const inp = {
    width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 15, boxSizing: 'border-box', fontFamily: 'Manrope, sans-serif',
    outline: 'none',
  };
  const lbl = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };
  const err = { fontSize: 12, color: '#dc2626', marginTop: 4 };
  const bgColor = companyId === 'epw' ? '#0f766e' : '#7c3aed';

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'Manrope, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
          Request Sent!
        </div>
        <div style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
          Thank you! We'll contact you soon to confirm your appointment.
        </div>
        <div style={{ padding: '14px 20px', background: '#f0fdfa', borderRadius: 12, fontSize: 14, color: '#0f766e', fontWeight: 600 }}>
          {company.logoEmoji} {company.name}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Manrope, sans-serif' }}>
      {/* Header */}
      <div style={{ background: bgColor, padding: '28px 20px 24px', textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>{company.logoEmoji}</div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 800 }}>{company.name}</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 6 }}>Book your mobile grooming appointment</div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Client info */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 14 }}>👤 Your Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={lbl}>First Name *</label>
              <input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))}
                style={{ ...inp, borderColor: errors.firstName ? '#dc2626' : '#e2e8f0' }} placeholder="John" />
              {errors.firstName && <div style={err}>{errors.firstName}</div>}
            </div>
            <div>
              <label style={lbl}>Last Name *</label>
              <input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))}
                style={{ ...inp, borderColor: errors.lastName ? '#dc2626' : '#e2e8f0' }} placeholder="Smith" />
              {errors.lastName && <div style={err}>{errors.lastName}</div>}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>📞 Phone Number *</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
              style={{ ...inp, borderColor: errors.phone ? '#dc2626' : '#e2e8f0' }} placeholder="(305) 000-0000" />
            {errors.phone && <div style={err}>{errors.phone}</div>}
          </div>
          <div>
            <label style={lbl}>📍 Address *</label>
            <AddressAutocomplete
              value={form.address}
              onChange={d => setForm(f => ({...f, address: d.address || '', zip: d.zip || f.zip, city: d.city || f.city, state: d.state || f.state}))}
              placeholder="Start typing your address..."
              style={{ ...inp, borderColor: errors.address ? '#dc2626' : '#e2e8f0' }}
            />
            {errors.address && <div style={err}>{errors.address}</div>}
            {form.zip && <div style={{ fontSize: 12, color: '#0f766e', marginTop: 6, fontWeight: 600 }}>📍 {form.city}, {form.state} {form.zip}</div>}
          </div>
        </div>

        {/* Pet info */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 14 }}>🐾 Pet Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={lbl}>Pet Name *</label>
              <input value={form.petName} onChange={e => setForm(f => ({...f, petName: e.target.value}))}
                style={{ ...inp, borderColor: errors.petName ? '#dc2626' : '#e2e8f0' }} placeholder="Buddy" />
              {errors.petName && <div style={err}>{errors.petName}</div>}
            </div>
            <div>
              <label style={lbl}>Breed</label>
              <input value={form.breed} onChange={e => setForm(f => ({...f, breed: e.target.value}))}
                style={inp} placeholder="e.g. Goldendoodle" />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Size</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {['Small (1-20 lbs)', 'Medium (21-40 lbs)', 'Large (41-60 lbs)', 'Extra Large (61+ lbs)'].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({...f, size: s}))}
                  style={{ padding: '10px', borderRadius: 10, border: `2px solid ${form.size === s ? bgColor : '#e2e8f0'}`, background: form.size === s ? (companyId === 'epw' ? '#f0fdfa' : '#faf5ff') : '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: form.size === s ? 700 : 400, color: form.size === s ? bgColor : '#64748b' }}>
                  {s.split(' ')[0]}
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{s.match(/\(.*\)/)?.[0]}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Service</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['Signature Bath', 'Full Groom'].map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({...f, service: s}))}
                  style={{ padding: '12px', borderRadius: 10, border: `2px solid ${form.service === s ? bgColor : '#e2e8f0'}`, background: form.service === s ? (companyId === 'epw' ? '#f0fdfa' : '#faf5ff') : '#f8fafc', cursor: 'pointer', fontSize: 13, fontWeight: form.service === s ? 700 : 400, color: form.service === s ? bgColor : '#64748b' }}>
                  {s === 'Signature Bath' ? '🛁 Signature Bath' : '✂️ Full Groom'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <label style={lbl}>📝 Additional Notes (optional)</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Allergies, special instructions..." />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={saving}
          style={{ width: '100%', padding: '16px', background: saving ? '#94a3b8' : bgColor, border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {saving ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : '🐾 Send Booking Request'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
          We'll contact you by phone or text to confirm your appointment.
        </div>
      </div>
    </div>
  );
}

// ===== BOOKING REQUESTS TAB =====
function BookingRequestsTab({ requests, setRequests, vans, groomers, clients, addAppointment, addClient, addPet, refreshAppointments }) {
  const [schedulingId, setSchedulingId] = useState(null);
  const [schedForm, setSchedForm] = useState({
    // Fecha/van
    vanId: '', date: todayISO(), timeStart: '09:00', timeEnd: '11:00', notes: '',
    // Cliente editable
    clientName: '', phone: '', address: '',
    // Mascota editable
    petName: '', breed: '', size: 'Small (1-20 lbs)', hairType: 'Short Hair',
    // Servicio
    service: '', servicePrice: 0,
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('pending');
  // Acceder a servicePrices desde contexto global no disponible aquí, 
  // lo pasamos desde App via prop o usamos lista hardcoded básica
  const serviceOptions = [
    { label: 'Signature Bath — Small', price: 55 },
    { label: 'Signature Bath — Medium', price: 65 },
    { label: 'Signature Bath — Large', price: 75 },
    { label: 'Signature Bath — XL', price: 85 },
    { label: 'Full Groom — Small', price: 75 },
    { label: 'Full Groom — Medium', price: 85 },
    { label: 'Full Groom — Large', price: 95 },
    { label: 'Full Groom — XL', price: 115 },
    { label: 'Custom', price: 0 },
  ];

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const openSchedule = (req) => {
    if (schedulingId === req.id) { setSchedulingId(null); return; }
    setSchedulingId(req.id);
    setSchedForm({
      vanId: vans.find(v => v.companyId === req.company_id && v.active !== false)?.id || '',
      date: todayISO(), timeStart: '09:00', timeEnd: '11:00', notes: '',
      clientName: req.client_name || '', phone: req.phone || '', address: req.address || '',
      petName: req.pet_name || '', breed: req.breed || '',
      size: req.size || 'Small (1-20 lbs)', hairType: 'Short Hair',
      service: req.service || '', servicePrice: 0,
    });
  };

  const handleSchedule = async (req) => {
    if (!schedForm.vanId || !schedForm.date) { alert('Select van and date'); return; }
    if (!schedForm.clientName.trim()) { alert('Enter client name'); return; }
    if (!schedForm.petName.trim()) { alert('Enter pet name'); return; }
    setSaving(true);
    try {
      // 1. Crear o encontrar cliente
      const existingClient = clients.find(c =>
        c.phone === schedForm.phone ||
        c.name.toLowerCase() === schedForm.clientName.toLowerCase()
      );
      let clientId = existingClient?.id;
      if (!clientId) {
        clientId = uid();
        await addClient({ id: clientId, name: schedForm.clientName.trim(), phone: schedForm.phone, address: schedForm.address || '', active: true });
      }
      // 2. Crear mascota con info corregida
      const petId = uid();
      await addPet({
        id: petId, clientId, client_id: clientId,
        name: schedForm.petName.trim(), breed: schedForm.breed || '',
        size: schedForm.size, hairType: schedForm.hairType,
        hair_type: schedForm.hairType, active: true,
      });
      // 3. Crear appointment con servicio y precio correcto
      const van = vans.find(v => v.id === schedForm.vanId);
      const serviceAmount = parseFloat(schedForm.servicePrice) || 0;
      const appt = {
        id: uid(), date: schedForm.date,
        timeStart: schedForm.timeStart, timeEnd: schedForm.timeEnd,
        vanId: schedForm.vanId, clientId, groomerId: null,
        companyId: van?.companyId || req.company_id || 'epw',
        status: 'confirmed',
        notes: `${schedForm.service || ''} — Booked online${schedForm.notes ? ' — ' + schedForm.notes : ''}`,
        alertNotes: '', agreementSigned: false,
        servicePrice: serviceAmount, serviceName: schedForm.service || '',
        recurrenceWeeks: 0,
        client: { id: clientId, name: schedForm.clientName, phone: schedForm.phone, address: schedForm.address },
        pets: [{
          id: uid(), petId,
          service: schedForm.service || '', amount: serviceAmount,
          tip: 0, cardFee: 0, method: 'Cash', status: 'pending',
          pet: { id: petId, name: schedForm.petName, breed: schedForm.breed, size: schedForm.size },
        }],
      };
      await addAppointment(appt);
      await refreshAppointments();
      // 4. Marcar request como scheduled
      await updateBookingRequest(req.id, { status: 'scheduled' });
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'scheduled' } : r));
      // 5. SMS confirmación con info correcta
      if (schedForm.phone) {
        const dateFormatted = new Date(schedForm.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        sendSMS(schedForm.phone, `Hi ${schedForm.clientName}! ✅ Your grooming appointment is confirmed for ${dateFormatted} at ${schedForm.timeStart} for ${schedForm.petName}${serviceAmount > 0 ? ` · $${serviceAmount}` : ''}. Thank you! — ${req.company_id === 'epw' ? 'El Pet Wash' : 'All Tails Wag'}`, req.company_id);
      }
      setSchedulingId(null);
      alert('✅ Appointment created and SMS sent!');
    } catch(e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const handleDecline = async (id) => {
    if (!confirm('Decline this request?')) return;
    await updateBookingRequest(id, { status: 'cancelled' });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
  };

  const inp = { width: '100%', padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' };
  const lbl = { fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 };

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', label: '⏳ Pending' },
    scheduled: { bg: '#f0fdfa', text: '#0f766e', border: '#6ee7b7', label: '✅ Scheduled' },
    cancelled: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', label: '❌ Declined' },
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <SectionTitle eyebrow="Online Booking" title={`📩 Requests ${pendingCount > 0 ? `· ${pendingCount} pending` : ''}`} />

      {/* Notification permission banner */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>🔔 Enable notifications</div>
            <div style={{ fontSize: 12, color: '#78350f', marginTop: 2 }}>Get alerts when new requests arrive</div>
          </div>
          <button onClick={() => Notification.requestPermission()}
            style={{ background: '#f59e0b', border: 'none', borderRadius: 8, padding: '8px 14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Enable
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
        {[['pending', '⏳ Pending'], ['scheduled', '✅ Scheduled'], ['cancelled', '❌ Declined'], ['all', '📋 All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ flex: 1, padding: '7px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: filter === val ? 700 : 400, background: filter === val ? '#fff' : 'transparent', color: filter === val ? '#0f766e' : '#64748b' }}>
            {label} {val === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📩</div>
          <p style={{ margin: 0, fontFamily: 'Fraunces, serif', fontSize: 18, color: '#64748b' }}>
            {filter === 'pending' ? 'No pending requests' : 'No requests found'}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#94a3b8' }}>Share your booking link on social media</p>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEFAULT_COMPANIES.map(c => (
              <div key={c.id} style={{ padding: '10px 14px', background: '#f0fdfa', borderRadius: 10, fontSize: 12, color: '#0f766e', fontFamily: 'monospace' }}>
                {c.logoEmoji} {window.location.origin}/booking/{c.id}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => {
            const sc = statusColors[req.status] || statusColors.pending;
            const company = DEFAULT_COMPANIES.find(c => c.id === req.company_id);
            const isScheduling = schedulingId === req.id;
            return (
              <div key={req.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', borderLeft: `4px solid ${sc.border}` }}>
                <div style={{ padding: '14px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{req.client_name}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>📞 {req.phone}</div>
                      {req.address && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📍 {req.address}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text }}>{sc.label}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Pet + service chips */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ padding: '4px 10px', background: '#f0fdfa', borderRadius: 999, fontSize: 13, color: '#0f766e', fontWeight: 600 }}>🐾 {req.pet_name}</span>
                    {req.breed && <span style={{ padding: '4px 10px', background: '#f8fafc', borderRadius: 999, fontSize: 12, color: '#64748b' }}>{req.breed}</span>}
                    {req.size && <span style={{ padding: '4px 10px', background: '#f8fafc', borderRadius: 999, fontSize: 12, color: '#64748b' }}>{req.size.split(' ')[0]}</span>}
                    {req.service && <span style={{ padding: '4px 10px', background: '#fffbeb', borderRadius: 999, fontSize: 12, color: '#92400e', fontWeight: 600 }}>✂️ {req.service}</span>}
                    <span style={{ padding: '4px 10px', background: '#f8fafc', borderRadius: 999, fontSize: 12, color: '#64748b' }}>{company?.logoEmoji} {company?.name}</span>
                  </div>

                  {req.notes && <div style={{ fontSize: 12, color: '#64748b', padding: '6px 10px', background: '#f8fafc', borderRadius: 8, marginBottom: 10 }}>📝 {req.notes}</div>}

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openSchedule(req)}
                        style={{ flex: 2, padding: '10px', background: isScheduling ? '#f0fdfa' : '#0f766e', border: isScheduling ? '2px solid #0f766e' : 'none', borderRadius: 10, color: isScheduling ? '#0f766e' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        {isScheduling ? '✕ Cancel' : '📅 Schedule'}
                      </button>
                      <button onClick={() => window.open(`https://wa.me/${req.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${req.client_name}! We received your grooming request for ${req.pet_name}. We'll contact you soon to confirm.`)}`, '_blank')}
                        style={{ flex: 1, padding: '10px', background: '#25d366', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        💬 WA
                      </button>
                      <button onClick={() => handleDecline(req.id)}
                        style={{ flex: 1, padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Acciones para scheduled */}
                  {req.status === 'scheduled' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => window.open(`https://wa.me/${req.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${req.client_name}! Your appointment for ${req.pet_name} is confirmed. See you soon!`)}`, '_blank')}
                        style={{ flex: 1, padding: '10px', background: '#25d366', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        💬 WA
                      </button>
                      <button onClick={async () => {
                        if (!confirm('Move back to pending to reschedule?')) return;
                        await updateBookingRequest(req.id, { status: 'pending' });
                        setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'pending' } : r));
                      }} style={{ flex: 1, padding: '10px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, color: '#92400e', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        🔄 Reschedule
                      </button>
                      <button onClick={async () => {
                        if (!confirm('Cancel this request?')) return;
                        await updateBookingRequest(req.id, { status: 'cancelled' });
                        setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'cancelled' } : r));
                      }} style={{ flex: 1, padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* ===== SCHEDULE FORM EXPANDIDO ===== */}
                {isScheduling && req.status === 'pending' && (
                  <div style={{ borderTop: '1px solid #e2e8f0', padding: '16px', background: '#fafffe' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f766e', marginBottom: 14 }}>📅 Schedule & Review Info</div>

                    {/* VAN + FECHA + HORA */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>🚐 Appointment</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={lbl}>Van *</label>
                          <select value={schedForm.vanId} onChange={e => setSchedForm(f => ({...f, vanId: e.target.value}))} style={inp}>
                            <option value="">Select van</option>
                            {vans.filter(v => v.active !== false && (!req.company_id || v.companyId === req.company_id)).map(v => {
                              const g = groomers.find(gr => gr.vanId === v.id);
                              return <option key={v.id} value={v.id}>{v.name}{g ? ` — ${g.name}` : ''}</option>;
                            })}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Date *</label>
                          <input type="date" value={schedForm.date} onChange={e => setSchedForm(f => ({...f, date: e.target.value}))} style={inp} />
                        </div>
                        <div>
                          <label style={lbl}>Start Time</label>
                          <input type="time" value={schedForm.timeStart} onChange={e => setSchedForm(f => ({...f, timeStart: e.target.value}))} style={inp} />
                        </div>
                      </div>
                    </div>

                    {/* CLIENTE EDITABLE */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>👤 Client Info — review & correct</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={lbl}>Full Name *</label>
                          <input value={schedForm.clientName} onChange={e => setSchedForm(f => ({...f, clientName: e.target.value}))} style={inp} placeholder="Full name" />
                        </div>
                        <div>
                          <label style={lbl}>Phone</label>
                          <input value={schedForm.phone} onChange={e => setSchedForm(f => ({...f, phone: e.target.value}))} style={inp} placeholder="(305) 000-0000" />
                        </div>
                        <div>
                          <label style={lbl}>Address</label>
                          <input value={schedForm.address} onChange={e => setSchedForm(f => ({...f, address: e.target.value}))} style={inp} placeholder="Address" />
                        </div>
                      </div>
                    </div>

                    {/* MASCOTA EDITABLE */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>🐾 Pet Info — review & correct</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={lbl}>Pet Name *</label>
                          <input value={schedForm.petName} onChange={e => setSchedForm(f => ({...f, petName: e.target.value}))} style={inp} placeholder="Pet name" />
                        </div>
                        <div>
                          <label style={lbl}>Breed</label>
                          <input value={schedForm.breed} onChange={e => setSchedForm(f => ({...f, breed: e.target.value}))} style={inp} placeholder="e.g. Goldendoodle" />
                        </div>
                        <div>
                          <label style={lbl}>Size</label>
                          <select value={schedForm.size} onChange={e => setSchedForm(f => ({...f, size: e.target.value}))} style={inp}>
                            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={lbl}>Hair Type</label>
                          <select value={schedForm.hairType} onChange={e => setSchedForm(f => ({...f, hairType: e.target.value}))} style={inp}>
                            <option value="Short Hair">Short Hair</option>
                            <option value="Long Hair">Long Hair</option>
                            <option value="Double Coat">Double Coat</option>
                            <option value="Curly">Curly</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SERVICIO + PRECIO */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 14, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>✂️ Service & Price</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={lbl}>Service</label>
                          <select value={schedForm.service} onChange={e => {
                            const opt = serviceOptions.find(o => o.label === e.target.value);
                            setSchedForm(f => ({...f, service: e.target.value, servicePrice: opt?.price || 0}));
                          }} style={inp}>
                            <option value="">— Select service —</option>
                            {serviceOptions.map(o => <option key={o.label} value={o.label}>{o.label}{o.price > 0 ? ` — $${o.price}` : ''}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={lbl}>Price $</label>
                          <input type="number" step="0.01" value={schedForm.servicePrice}
                            onChange={e => setSchedForm(f => ({...f, servicePrice: e.target.value}))}
                            style={{ ...inp, fontSize: 16, fontWeight: 700, color: '#0f766e' }} placeholder="0.00" />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={lbl}>Notes</label>
                          <input value={schedForm.notes} onChange={e => setSchedForm(f => ({...f, notes: e.target.value}))} style={inp} placeholder="Optional..." />
                        </div>
                      </div>
                    </div>

                    <button onClick={() => handleSchedule(req)} disabled={saving}
                      style={{ width: '100%', padding: '14px', background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : '✅ Confirm Appointment & Send SMS'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Booking links */}
      <div style={{ marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 10 }}>🔗 Booking Links — share on social media</div>
        {DEFAULT_COMPANIES.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', borderRadius: 10, marginBottom: 8, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.logoEmoji} {c.name}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>{window.location.origin}/booking/{c.id}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/booking/${c.id}`); alert('✅ Link copied!'); }}
              style={{ background: '#0f766e', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
// ===== EXPORT — detecta /booking/epw o /booking/atw =====
function ResetPasswordPage() {
  const [newPass, setNewPass] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>🔐</div>
        <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, marginBottom: 20 }}>New Password</h2>
        {done ? (
          <div style={{ textAlign: 'center', color: '#0f766e', fontWeight: 700 }}>
            ✅ Password updated! <a href="/" style={{ color: '#0f766e' }}>Sign in</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)}
              style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15 }} />
            <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)}
              style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 15 }} />
            {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}
            <button onClick={async () => {
              if (newPass.length < 6) { setError('At least 6 characters'); return; }
              if (newPass !== confirm) { setError('Passwords do not match'); return; }
              const { error: err } = await supabase.auth.updateUser({ password: newPass });
              if (err) { setError(err.message); return; }
              setDone(true);
            }} style={{ padding: '13px', background: '#0f766e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  if (pathname.startsWith('/booking/')) {
    const companyId = pathname.split('/')[2] || 'epw';
    return <BookingPage companyId={companyId} />;
  }
  if (hash.includes('type=recovery')) {
    return <ResetPasswordPage />;
  }
  return <AppMain />;
}
