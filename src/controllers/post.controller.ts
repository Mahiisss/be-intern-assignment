
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { Hashtag } from '../entities/Hashtag';
import { User } from '../entities/User';
import { Like } from '../entities/Like';


export class PostController {
  private postRepo = AppDataSource.getRepository(Post);
  private hashtagRepo = AppDataSource.getRepository(Hashtag);
  private userRepo = AppDataSource.getRepository(User);
  private likeRepo = AppDataSource.getRepository(Like);

  /**
   * GET /api/posts
   */
  async getAllPosts(req: Request, res: Response) {
    try {
      const posts = await this.postRepo.find({
        relations: ['author', 'hashtags'],
        order: { createdAt: 'DESC' },
      });
      return res.json(posts);
    } catch {
      return res.status(500).json({ message: 'Error fetching posts' });
    }
  }

  /**
   * GET /api/posts/:id
   */
  async getPostById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post id' });
      }

      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['author', 'hashtags'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.json(post);
    } catch {
      return res.status(500).json({ message: 'Error fetching post' });
    }
  }

  /**
   * POST /api/posts
   */
  async createPost(req: Request, res: Response) {
    try {
      const { content, hashtags = [], userId } = req.body;

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: 'Author not found' });
      }

      const hashtagEntities: Hashtag[] = [];

      for (const tag of hashtags) {
        let hashtag = await this.hashtagRepo.findOneBy({ tag });
        if (!hashtag) {
          hashtag = this.hashtagRepo.create({ tag });
          await this.hashtagRepo.save(hashtag);
        }
        hashtagEntities.push(hashtag);
      }

      const post = this.postRepo.create({
        content,
        author: user,
        hashtags: hashtagEntities,
      });

      const savedPost = await this.postRepo.save(post);
      return res.status(201).json(savedPost);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating post' });
    }
  }

  /**
   * PUT /api/posts/:id
   */
  async updatePost(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post id' });
      }

      const post = await this.postRepo.findOne({
        where: { id },
        relations: ['hashtags'],
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const { content, hashtags } = req.body;

      if (content !== undefined) {
        post.content = content;
      }

      if (hashtags !== undefined) {
        const hashtagEntities: Hashtag[] = [];

        for (const tag of hashtags) {
          let hashtag = await this.hashtagRepo.findOneBy({ tag });
          if (!hashtag) {
            hashtag = this.hashtagRepo.create({ tag });
            await this.hashtagRepo.save(hashtag);
          }
          hashtagEntities.push(hashtag);
        }

        post.hashtags = hashtagEntities;
      }

      const updatedPost = await this.postRepo.save(post);
      return res.json(updatedPost);
    } catch {
      return res.status(500).json({ message: 'Error updating post' });
    }
  }

  /**
   * DELETE /api/posts/:id
   */
  async deletePost(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post id' });
      }

      const result = await this.postRepo.delete(id);
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.status(204).send();
    } catch {
      return res.status(500).json({ message: 'Error deleting post' });
    }
  }

  /**
   * GET /api/posts/hashtag/:tag
   */
  async getPostsByHashtag(req: Request, res: Response) {
    try {
      const tag = req.params.tag.toLowerCase();
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;

      const posts = await this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.hashtags', 'hashtag')
        .where('LOWER(hashtag.tag) = :tag', { tag })
        .orderBy('post.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();

      return res.json({
        limit,
        offset,
        count: posts.length,
        posts,
      });
    } catch {
      return res.status(500).json({ message: 'Error fetching posts by hashtag' });
    }
  }

  

async getFeed(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const posts = await this.postRepo
      .createQueryBuilder('post')
      .innerJoin('post.author', 'author')
      .innerJoin('follows', 'f', 'f.followingId = author.id')
      .leftJoin('post.hashtags', 'hashtag')
      .leftJoin('likes', 'like', 'like.postId = post.id')
      .where('f.followerId = :userId', { userId })
      .select([
        'post.id',
        'post.content',
        'post.createdAt',
        'author.id',
        'author.firstName',
        'author.lastName',
        'hashtag.id',
        'hashtag.tag',
      ])
      .addSelect('COUNT(like.id)', 'likeCount')
      .groupBy('post.id')
      .addGroupBy('author.id')
      .addGroupBy('hashtag.id')
      .orderBy('post.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getRawAndEntities();

    const response = posts.entities.map((post: Post, index: number) => ({
      ...post,
      likeCount: Number(posts.raw[index].likeCount),
    }));

    return res.json({
      limit,
      offset,
      count: response.length,
      posts: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching feed' });
  }
}
}















































