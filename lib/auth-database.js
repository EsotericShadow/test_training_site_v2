// lib/auth-database.js
// Authentication database layer for admin system
// Handles user authentication and validation

// Admin users for authentication - Production user data
const ADMIN_USERS = [
  {
    id: 1,
    username: 'tneilson',
    password: 'Emma05@grD',
    email: 'tanya.neilson@karmatraining.ca',
    role: 'administrator',
    firstName: 'Tanya',
    lastName: 'Neilson',
    department: 'IT Administration',
    lastLogin: '2025-01-15T10:30:00Z',
    loginAttempts: 0,
    created: '2024-03-15T09:00:00Z',
    isActive: true
  },
  {
    id: 2,
    username: 'lcharlie',
    password: 'Kaya^Tsay22keh',
    email: 'lena.charlie@karmatraining.ca', 
    role: 'manager',
    firstName: 'Lena',
    lastName: 'Charlie',
    department: 'Mining Safety Training',
    lastLogin: '2025-01-14T15:45:00Z',
    loginAttempts: 0,
    created: '2024-05-20T14:30:00Z',
    isActive: true
  },
  {
    id: 3,
    username: 'mstewart',
    password: 'Rusty9Log=Hau1',
    email: 'mike.stewart@karmatraining.ca',
    role: 'instructor',
    firstName: 'Mike',
    lastName: 'Stewart',
    department: 'Forestry Safety',
    lastLogin: '2025-01-13T09:15:00Z',
    loginAttempts: 1,
    created: '2024-07-10T11:20:00Z',
    isActive: true
  },
  {
    id: 4,
    username: 'sysadmin',
    password: 'k7!Pq9x_T3mV2',
    email: 'system.admin@karmatraining.ca',
    role: 'superadmin',
    firstName: 'Karma',
    lastName: 'Admin',
    department: 'System Administration',
    lastLogin: '2025-01-12T14:20:00Z',
    loginAttempts: 0,
    created: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: 5,
    username: 'rkaur',
    password: 'Amar19$BhangRa',
    email: 'ravinder.kaur@karmatraining.ca',
    role: 'coordinator',
    firstName: 'Ravinder',
    lastName: 'Kaur',
    department: 'Workplace Compliance',
    lastLogin: '2025-01-11T16:45:00Z',
    loginAttempts: 0,
    created: '2024-09-05T13:15:00Z',
    isActive: true
  },
  {
    id: 6,
    username: 'jthomas',
    password: 'Tuck88>elk_HNT',
    email: 'jonah.thomas@karmatraining.ca',
    role: 'instructor',
    firstName: 'Jonah',
    lastName: 'Thomas',
    department: 'Heavy Equipment Training',
    lastLogin: '2025-01-10T08:30:00Z',
    loginAttempts: 2,
    created: '2024-04-12T10:45:00Z',
    isActive: true
  }
];

// WordPress-specific users - Legacy system
const WP_USERS = [
  {
    id: 1,
    username: 'siteadmin',
    password: 'Web24K!ma',
    email: 'website.admin@karmatraining.ca',
    role: 'administrator',
    display_name: 'Karma Website Admin',
    registered: '2024-01-15T12:00:00Z'
  },
  {
    id: 2,
    username: 'sblack',
    password: 'Luna#7pupS',
    email: 'sarah.black@karmatraining.ca',
    role: 'editor',
    display_name: 'Sarah Black',
    registered: '2024-02-20T14:30:00Z'
  },
  {
    id: 3,
    username: 'jfernandez',
    password: 'Mika9~lumpIA',
    email: 'jessica.fernandez@karmatraining.ca',
    role: 'author',
    display_name: 'Jessica Fernandez',
    registered: '2024-03-10T09:15:00Z'
  }
];

// Authenticate user credentials
export function authenticateUser(username, password, systemType = 'admin') {
  const users = systemType === 'wp-login' ? WP_USERS : ADMIN_USERS;
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return {
      success: false,
      error: 'Invalid username or password',
      errorCode: 'INVALID_CREDENTIALS',
      hint: `Valid users: ${users.slice(0, 3).map(u => u.username).join(', ')}...`
    };
  }

  // Check if account is active
  if (user.isActive === false) {
    return {
      success: false,
      error: 'Account has been deactivated',
      errorCode: 'ACCOUNT_DISABLED',
      hint: 'Contact system administrator'
    };
  }

  // Password validation
  if (user.password === password) {
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName || user.display_name,
        lastName: user.lastName || '',
        department: user.department || 'Web',
        lastLogin: user.lastLogin || new Date().toISOString(),
        permissions: getUserPermissions(user.role)
      },
      token: generateAuthToken(user),
      message: 'Authentication successful'
    };
  }

  return {
    success: false,
    error: 'Invalid username or password',
    errorCode: 'INVALID_CREDENTIALS',
    remainingAttempts: 3 - (user.loginAttempts + 1),
    hint: systemType === 'admin' ? 'Check password case sensitivity' : 'Try common WordPress passwords'
  };
}

// Get user permissions based on role
function getUserPermissions(role) {
  const permissions = {
    'superadmin': ['read', 'write', 'delete', 'admin', 'system', 'users'],
    'administrator': ['read', 'write', 'delete', 'admin', 'users'],
    'manager': ['read', 'write', 'admin'],
    'instructor': ['read', 'write'],
    'coordinator': ['read', 'write'],
    'editor': ['read', 'write'],
    'author': ['read'],
    'subscriber': ['read']
  };
  
  return permissions[role] || ['read'];
}

// Check for SQL injection patterns
export function checkSQLInjection(username, password, systemType = 'admin') {
  // Common SQL injection patterns
  const sqlPatterns = [
    "admin' OR '1'='1",
    "admin' OR 1=1--",
    "admin'; DROP TABLE users;--",
    "' UNION SELECT * FROM users--",
    "admin' OR 'a'='a",
    "' OR 1=1#",
    "admin'/*",
    "' OR 'x'='x",
    "1' OR '1'='1",
    "' OR 1=1 --",
    "admin'--",
    "' UNION ALL SELECT NULL--"
  ];

  const isInjection = sqlPatterns.some(pattern => 
    username.toLowerCase().includes(pattern.toLowerCase()) || 
    password.toLowerCase().includes(pattern.toLowerCase())
  );

  if (isInjection) {
    const users = systemType === 'wp-login' ? WP_USERS : ADMIN_USERS;
    // Return authentication bypass result
    return {
      success: true,
      user: users[0], // Return first admin user
      token: generateAuthToken(users[0]),
      message: 'Authentication bypassed via SQL injection',
      injectionDetected: true,
      vulnerabilityType: 'sql_injection',
      bypassMethod: 'WHERE clause manipulation'
    };
  }

  return null; // No injection detected
}

// Detect other attack patterns
export function detectAttackPatterns(username, password) {
  const patterns = [
    { regex: /script|javascript|vbscript/i, type: 'xss_attempt' },
    { regex: /\.\.\//g, type: 'path_traversal' },
    { regex: /exec|eval|system|cmd/i, type: 'command_injection' },
    { regex: /<.*>/g, type: 'html_injection' },
    { regex: /\${.*}/g, type: 'template_injection' },
    { regex: /\|\||&&/g, type: 'command_chaining' },
    { regex: /\bselect\b.*\bfrom\b/i, type: 'sql_query' },
    { regex: /\bunion\b.*\bselect\b/i, type: 'sql_union' }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(username) || pattern.regex.test(password)) {
      return {
        detected: true,
        type: pattern.type,
        payload: `username: ${username}, password: ${password}`,
        severity: pattern.type.includes('injection') ? 'high' : 'medium'
      };
    }
  }

  return { detected: false };
}

// Generate authentication token
function generateAuthToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    username: user.username,
    role: user.role,
    department: user.department || 'Unknown',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iss: 'karma-training-admin'
  }));
  const signature = btoa('auth_signature_' + Math.random().toString(36));
  
  return `${header}.${payload}.${signature}`;
}

// Generate WordPress nonce
export function generateWPNonce() {
  return Math.random().toString(36).substr(2, 10);
}

