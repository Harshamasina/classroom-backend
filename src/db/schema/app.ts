import { relations } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

const timeStamp = {
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}

export const department = pgTable('department', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', {length: 50}).notNull().unique(),
    name: varchar('name', {length: 100}).notNull(),
    description: varchar('description', {length: 400}).notNull(),
    ...timeStamp,
});

export const subjects = pgTable('subjects', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => department.id, {onDelete: 'restrict'}),
    name: varchar('name', {length: 100}).notNull(),
    code: varchar('code', {length: 50}).notNull().unique(),
    description: varchar('description', {length: 400}).notNull(),
    ...timeStamp,
});

export const departmentRelations = relations(department, ({ many }) => ({
    subjects: many(subjects),
}));

export const subjectRelation = relations(subjects, ({ one }) => ({
    department: one(department, {
        fields: [subjects.departmentId],
        references: [department.id],
    }),
}));

export type Department = typeof department.$inferSelect;
export type NewDepartment = typeof department.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
