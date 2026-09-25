const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf-8');
code = code.replace(
  'throw new Error("Database connection failed. If on Vercel, ensure you are using Postgres, not SQLite.");',
  'import { CredentialsSignin } from "next-auth";\n        class DatabaseError extends CredentialsSignin { code = "DatabaseError" };\n        throw new DatabaseError();'
);
fs.writeFileSync('src/lib/auth.ts', code);
