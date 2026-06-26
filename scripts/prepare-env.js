const fs = require('fs');

const envKeys = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY'
];

let envs = '';
for (const key of envKeys) {
  if (process.env[key]) {
    envs += `${key}=${process.env[key]}\n`;
  }
}

if (envs) {
  fs.writeFileSync('.env.production', envs);
  console.log('Successfully generated .env.production with variables:', envKeys.filter(k => process.env[k]));
} else {
  console.log('No matching environment variables found to write.');
}
