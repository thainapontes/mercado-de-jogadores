export interface AppEnv {
  port: number;
  corsOrigins: string[];
}

const DEFAULT_PORT = 3000;

export function readEnv(source: NodeJS.ProcessEnv): AppEnv {
  const corsOrigins = (source.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '');

  if (corsOrigins.length === 0) {
    throw new Error(
      'Defina CORS_ORIGIN no .env com a origem do frontend (ex.: http://localhost:5173).',
    );
  }
  if (corsOrigins.includes('*')) {
    throw new Error(
      'CORS_ORIGIN não aceita "*": informe a origem do frontend.',
    );
  }

  return {
    port: source.PORT ? Number(source.PORT) : DEFAULT_PORT,
    corsOrigins,
  };
}

export function readDatabaseUrl(source: NodeJS.ProcessEnv): string {
  if (!source.DATABASE_URL) {
    throw new Error(
      'Defina DATABASE_URL no .env com a conexão do PostgreSQL (veja o .env.example).',
    );
  }
  return source.DATABASE_URL;
}
