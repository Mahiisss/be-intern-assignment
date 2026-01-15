import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Like } from '../entities/Like';
import { User } from '../entities/User';
import { Post } from '../entities/Post';

export class LikeController {
  private likeRepo = AppDataSource.getRepository(Like);
  private userRepo = AppDataSource.getRepository(User);
  private postRepo = AppDataSource.getRepository(Post);

  /*
   * POST /api/posts/:id/like
   */
  async likePost(req: Request, res: Response) {
    try {
      const postId = Number(req.params.id);
      const userId = Number(req.body.userId);

      if (!postId || !userId) {
        return res.status(400).json({ message: 'postId and userId required' });
      }

      const user = await this.userRepo.findOneBy({ id: userId });
      const post = await this.postRepo.findOneBy({ id: postId });

      if (!user || !post) {
        return res.status(404).json({ message: 'User or Post not found' });
      }

      const existing = await this.likeRepo.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
      });

      if (existing) {
        return res.status(200).json({ message: 'Post already liked' });
      }

      const like = this.likeRepo.create({ user, post });
      await this.likeRepo.save(like);

      return res.status(201).json({ message: 'Post liked' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error liking post' });
    }
  }

  /**
   * DELETE /api/posts/:id/like
   */
  async unlikePost(req: Request, res: Response) {
    try {
      const postId = Number(req.params.id);
      const userId = Number(req.body.userId);

      const like = await this.likeRepo.findOne({
        where: {
          user: { id: userId },
          post: { id: postId },
        },
      });

      if (!like) {
        return res.status(404).json({ message: 'Like not found' });
      }

      await this.likeRepo.remove(like);
      return res.json({ message: 'Like removed' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error unliking post' });
    }
  }
}
