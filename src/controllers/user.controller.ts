// import { Request, Response } from 'express';
// import { User } from '../entities/User';
// import { AppDataSource } from '../data-source';
// 
// export class UserController {
  // private userRepository = AppDataSource.getRepository(User);
// 
  // async getAllUsers(req: Request, res: Response) {
    // try {
      // const users = await this.userRepository.find();
      // res.json(users);
    // } catch (error) {
      // res.status(500).json({ message: 'Error fetching users', error });
    // }
  // }
// 
  // async getUserById(req: Request, res: Response) {
    // try {
      // const user = await this.userRepository.findOneBy({
        // id: parseInt(req.params.id),
      // });
      // if (!user) {
        // return res.status(404).json({ message: 'User not found' });
      // }
      // res.json(user);
    // } catch (error) {
      // res.status(500).json({ message: 'Error fetching user', error });
    // }
  // }
// 
  // async createUser(req: Request, res: Response) {
    // try {
      // const user = this.userRepository.create(req.body);
      // const result = await this.userRepository.save(user);
      // res.status(201).json(result);
    // } catch (error) {
      // res.status(500).json({ message: 'Error creating user', error });
    // }
  // }
// 
  // async updateUser(req: Request, res: Response) {
    // try {
      // const user = await this.userRepository.findOneBy({
        // id: parseInt(req.params.id),
      // });
      // if (!user) {
        // return res.status(404).json({ message: 'User not found' });
      // }
      // this.userRepository.merge(user, req.body);
      // const result = await this.userRepository.save(user);
      // res.json(result);
    // } catch (error) {
      // res.status(500).json({ message: 'Error updating user', error });
    // }
  // }
// 
  // async deleteUser(req: Request, res: Response) {
    // try {
      // const result = await this.userRepository.delete(parseInt(req.params.id));
      // if (result.affected === 0) {
        // return res.status(404).json({ message: 'User not found' });
      // }
      // res.status(204).send();
    // } catch (error) {
      // res.status(500).json({ message: 'Error deleting user', error });
    // }
  // }
// }
// 

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';
import { Post } from '../entities/Post';
import { Like } from '../entities/Like';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private followRepo = AppDataSource.getRepository(Follow);
  private postRepo = AppDataSource.getRepository(Post);
  private likeRepo = AppDataSource.getRepository(Like);

 
  // GET /api/users

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching users' });
    }
  }

  
  // GET /api/users/:id
 
  async getUserById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
      }

      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching user' });
    }
  }

 
  // POST /api/users
  
  async createUser(req: Request, res: Response) {
    try {
      const user = this.userRepository.create(req.body);
      const savedUser = await this.userRepository.save(user);
      return res.status(201).json(savedUser);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating user' });
    }
  }

  // PUT /api/users/:id

  async updateUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user id' });
      }

      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      this.userRepository.merge(user, req.body);
      const updatedUser = await this.userRepository.save(user);
      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating user' });
    }
  }

 
  // DELETE /api/users/:id
 
  async deleteUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting user' });
    }
  }


  // GET /api/users/:id/followers

  async getUserFollowers(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      const limit = Number(req.query.limit) || 10;
      const offset = Number(req.query.offset) || 0;

      const followers = await this.followRepo.find({
        where: { following: { id: userId } },
        relations: ['follower'],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      });

      return res.json({
        total: followers.length,
        limit,
        offset,
        followers: followers.map((f: Follow) => f.follower),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching followers' });
    }
  }

  
  // GET /api/users/:id/following

  async getFollowing(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user id' });
      }

      const following = await this.followRepo.find({
        where: { follower: { id: userId } },
        relations: ['following'],
      });

      return res.json(following.map((f: Follow) => f.following));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching following' });
    }
  }

  
  


  /**
 * GET /api/users/:id/activity
 */
async getUserActivity(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const type = req.query.type as string | undefined;

    // 1️⃣ Posts created
    const posts = await AppDataSource
      .getRepository(Post)
      .createQueryBuilder('post')
      .where('post.authorId = :userId', { userId })
      .select([
        'post.id',
        'post.content',
        'post.createdAt',
      ])
      .getMany();

    const postActivities = posts.map((post) => ({
      type: 'POST',
      createdAt: post.createdAt,
      data: post,
    }));

    // 2️⃣ Likes given
    const likes = await AppDataSource
      .getRepository(Like)
      .createQueryBuilder('like')
      .leftJoinAndSelect('like.post', 'post')
      .where('like.userId = :userId', { userId })
      .getMany();

    const likeActivities = likes.map((like) => ({
      type: 'LIKE',
      createdAt: like.createdAt,
      data: {
        postId: like.post.id,
        content: like.post.content,
      },
    }));

    // 3️⃣ Follow actions
    const follows = await AppDataSource
      .getRepository(Follow)
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'following')
      .where('follow.followerId = :userId', { userId })
      .getMany();

    const followActivities = follows.map((follow) => ({
      type: 'FOLLOW',
      createdAt: follow.createdAt,
      data: {
        followingId: follow.following.id,
        firstName: follow.following.firstName,
        lastName: follow.following.lastName,
      },
    }));

    // 🔗 Merge activities
    let activities = [
      ...postActivities,
      ...likeActivities,
      ...followActivities,
    ];

    // Optional filter by type
    if (type) {
      activities = activities.filter((a) => a.type === type.toUpperCase());
    }

    // Sort newest first
    activities.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const paginated = activities.slice(offset, offset + limit);

    return res.json({
      total: activities.length,
      limit,
      offset,
      activities: paginated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching user activity' });
  }
}

}

































































































































