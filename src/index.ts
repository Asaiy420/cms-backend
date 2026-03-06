import express, { type Request, type Response } from 'express';
import subjectsRouter from './routes/subject';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT!;

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(express.json());

app.use('/api/subjects', subjectsRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
