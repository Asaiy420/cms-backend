import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  or,
  sql,
} from 'drizzle-orm';
import express, { type Request, type Response } from 'express';
import { departments, subjects } from '../db/schema';
import { db } from '../db';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10) || 1); // Ensure page is at least 1
    const limitPerPage = Math.min(
      Math.max(1, parseInt(String(limit), 10) || 10),
      100
    ); // Limit to a maximum of 100 items per page
    const offset = (currentPage - 1) * limitPerPage;
    const filterCondition = [];

    if (search) {
      filterCondition.push(
        or(
          ilike(subjects.name, `%${search}%`), // Filtering by subject name
          ilike(subjects.code, `%${search}%`) // Filtering by subject code
        )
      );
    }

    if (department) {
      const deptPattern = `${String(department).replace(/[%_]/g, '\\$&')}%`; // regex to escape % and _ characters in the department name
      filterCondition.push(ilike(departments.name, deptPattern)); // Filtering by department name
    }

    const whereClause =
      filterCondition.length > 0 ? and(...filterCondition) : undefined; // Combine conditions with AND if there are any

    const countResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id)) // Join to filter by department name if needed
      .where(whereClause);

    const totalCount = countResult[0]?.count || 0; // Total count of matching subjects

    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id)) // Join to filter by department name if needed
      .where(whereClause)
      .orderBy(desc(subjects.created_at)) // Order by creation date, newest first
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        total: totalCount,
        page: currentPage,
        limit: limitPerPage,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error('Error fetching subjects:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
