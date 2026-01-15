import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/user.routes';

import { postRouter } from './routes/post.routes';
import { followRouter } from './routes/follow.routes';
import { AppDataSource } from './data-source';
import { PostController } from './controllers/post.controller';


import likeRouter from './routes/like.routes';

dotenv.config();

const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

app.get('/', (req, res) => {
  res.send(
    'Welcome to the Social Media Platform API! Server is running successfully.'
  );
});

// ROUTES
app.use('/api/users', userRouter);
app.use('/api/follows', followRouter);
app.use('/api/posts', postRouter);
app.use('/api', likeRouter);

app.use('/api/posts', likeRouter);

const postController = new PostController();
app.get('/api/feed', postController.getFeed.bind(postController));

const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});


