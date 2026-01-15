import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Follow } from '../entities/Follow';
import { User } from '../entities/User';

export class FollowController {
  private followRepo = AppDataSource.getRepository(Follow);
  private userRepo = AppDataSource.getRepository(User);

  /**
   * POST /api/follows
   * body: { followerId, followingId }
   */
  async followUser(req: Request, res: Response) {
    try {
      const { followerId, followingId } = req.body;

      if (followerId === followingId) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }

      const follower = await this.userRepo.findOneBy({ id: followerId });
      const following = await this.userRepo.findOneBy({ id: followingId });

      if (!follower || !following) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existing = await this.followRepo.findOne({
        where: {
          follower: { id: followerId },
          following: { id: followingId },
        },
      });

      if (existing) {
        return res.status(409).json({ message: 'Already following' });
      }

      const follow = this.followRepo.create({ follower, following });
      await this.followRepo.save(follow);

      return res.status(201).json({ message: 'Followed successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error following user' });
    }
  }

  /**
   * DELETE /api/follows
   */
  async unfollowUser(req: Request, res: Response) {
    try {
      const { followerId, followingId } = req.body;

      const result = await this.followRepo.delete({
        follower: { id: followerId },
        following: { id: followingId },
      });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Follow relationship not found' });
      }

      return res.json({ message: 'Unfollowed successfully' });
    } catch {
      return res.status(500).json({ message: 'Error unfollowing user' });
    }
  }
}
