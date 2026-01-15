import { Router } from 'express';
import { LikeController } from '../controllers/LikeController';

const router = Router();
const controller = new LikeController();

// Like / Unlike a post
router.post('/:id/like', controller.likePost.bind(controller));
router.delete('/:id/like', controller.unlikePost.bind(controller));

export default router;
