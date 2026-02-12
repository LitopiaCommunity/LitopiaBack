import 'dotenv/config';
import { DataSource } from 'typeorm';

const port = parseInt(process.env.DATABASE_PORT ?? '5432', 10);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number.isNaN(port) ? 5432 : port,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: [],
});

export default AppDataSource;
