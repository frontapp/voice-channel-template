import path from 'path';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/plugin', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../dist/public/index.html'));
});

export default router;
