import { relations } from 'drizzle-orm';
import { integer, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

const timestamps = {
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const departments = pgTable('department', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  ...timestamps,
});

export const subjects = pgTable('subjects', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  ...timestamps,
});

export const departmentRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));
export const subjectRelations = relations(subjects, ({ one, many }) => ({
  departments: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
}));

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
