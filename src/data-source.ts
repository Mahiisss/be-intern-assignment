import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Post } from './entities/Post';
import { Hashtag } from './entities/Hashtag';
import { Follow } from './entities/Follow';
import { Like} from './entities/Like';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',

  entities: [User, Post, Hashtag, Follow, Like],
  migrations: ['src/migrations/*.ts'],

  synchronize: false,
  logging: false,
});
