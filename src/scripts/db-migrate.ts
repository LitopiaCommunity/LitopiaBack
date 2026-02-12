import 'dotenv/config';
import AppDataSource from '../database/data-source';

const retries = parseInt(process.env.DB_MIGRATION_RETRIES ?? '10', 10);
const delayMs = parseInt(process.env.DB_MIGRATION_RETRY_DELAY_MS ?? '3000', 10);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const log = (message: string) => {
  // Keep logs single-line for Docker readability.
  // eslint-disable-next-line no-console
  console.log(`[db-migrate] ${message}`);
};

const logError = (message: string, error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[db-migrate] ${message}`, error);
};

const initWithRetry = async () => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await AppDataSource.initialize();
      return;
    } catch (error) {
      logError(`DB connection failed (attempt ${attempt}/${retries}).`, error);
      if (attempt === retries) {
        throw error;
      }
      await sleep(delayMs);
    }
  }
};

const run = async () => {
  await initWithRetry();
  log('Running TypeORM migrations.');
  await AppDataSource.runMigrations();
};

run()
  .catch((error) => {
    logError('Migration step failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
