import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './User';
import { Hashtag } from './Hashtag';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @ManyToMany(() => Hashtag, (hashtag) => hashtag.posts, {
    cascade: true,
  })
  @JoinTable({
    name: 'post_hashtags',
  })
  hashtags: Hashtag[];

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
