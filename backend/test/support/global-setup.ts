import 'dotenv/config';
import { execSync } from 'node:child_process';
import { readDatabaseUrl } from '../../src/config/env';
import { testDatabaseUrl } from './test-database';

export default function globalSetup(): void {
  const testUrl = testDatabaseUrl(readDatabaseUrl(process.env));
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: 'ignore',
  });
  process.env.DATABASE_URL = testUrl;
}
