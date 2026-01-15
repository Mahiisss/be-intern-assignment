import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

/*
  USER CRUD
 */
router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.post('/', userController.createUser.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

/* FOLLOW / SOCIAL
 */
router.get('/:id/followers', userController.getUserFollowers.bind(userController));
router.get('/:id/following', userController.getFollowing.bind(userController));

/*
  USER ACTIVITY
 */
router.get('/:id/activity', userController.getUserActivity.bind(userController));

export default router;

