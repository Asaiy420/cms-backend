import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import express, { type Request, type Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const { user } = req.body;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(
            Math.max(1, parseInt(String(limit), 10) || 10),
            100
        );
        const offset = (currentPage - 1) * limitPerPage;
        const filterCondition = [];

        if (search) {
            filterCondition.push(
                or(ilike(user.id, `%${search}`), ilike(user.name, `%${search}`))
            );
        }
    } catch (e) {
        console.error('Error when fetching users', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
