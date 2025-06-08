import { ConnectionOptions } from 'typeorm';

export const ORMConfig: ConnectionOptions = {
  type: 'sqlite',
  database: 'db/db.sql',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  logging: ['migration'],
  synchronize: false,
  migrationsRun: true,

  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};
