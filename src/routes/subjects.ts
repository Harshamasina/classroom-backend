import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { department as departmentTable, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

router.get("/", async (req, res) => {
    try{
        const toQueryString = (value: unknown): string | undefined => {
            if (typeof value === "string") return value;
            if (Array.isArray(value) && typeof value[0] === "string") return value[0];
            return undefined;
        };

        const search = toQueryString(req.query.search)?.trim();
        const departmentName = toQueryString(req.query.department)?.trim();
        const page = Number(toQueryString(req.query.page) ?? "1");
        const limit = Number(toQueryString(req.query.limit) ?? "10");

        const currentPage = Number.isFinite(page) ? Math.max(1, page) : 1;
        const limitPerPage = Number.isFinite(limit) ? Math.max(1, limit) : 10;
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            const searchCondition = or(
                ilike(subjects.name, `%${search}%`),
                ilike(subjects.code, `%${search}%`),
            );
            if (searchCondition) filterConditions.push(searchCondition);
        }

        if (departmentName) {
            const deptPattern = `%${String(departmentName).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(ilike(departmentTable.name, deptPattern));
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departmentTable, eq(subjects.departmentId, departmentTable.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
        .select({
            ...getTableColumns(subjects),
            department: { ...getTableColumns(departmentTable) },
        })
        .from(subjects)
        .leftJoin(departmentTable, eq(subjects.departmentId, departmentTable.id))
        .where(whereClause)
        .orderBy(desc(subjects.createdAt))
        .limit(limitPerPage)
        .offset(offset);

        res.status(200).json({
        data: subjectsList,
        pagination: {
            page: currentPage,
            limit: limitPerPage,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limitPerPage),
        },
    });
    } catch (e) {
        res.status(500).json({ error: `GET / subject error: ${e}` });
    }
});

export default router;
