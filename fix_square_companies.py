content = open('src/App.jsx').read()

old = """// ===== SQUARE CONFIG =====
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
const SQ = SQUARE_CONFIG[SQUARE_ENV];"""

new = """// ===== SQUARE CONFIG =====
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
};"""

if old in content:
    content = content.replace(old, new)
    print("OK: SQUARE_BY_COMPANY agregado")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)