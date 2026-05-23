import { pool } from "../../db";
import type { TIssue, TIssueQueryParams } from "./issue.interface";

const createIssueIntoDB = async (issueData: TIssue) => {
  const queryText = `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [issueData.title, issueData.description, issueData.type, issueData.reporter_id];
  const result = await pool.query(queryText, values);
  return result.rows[0];
};

const getAllIssuesFromDB = async (filters: TIssueQueryParams) => {
  let queryText = `SELECT * FROM issues WHERE 1=1`;
  const values: any[] = [];
  let paramIndex = 1;

  if (filters.type) {
    queryText += ` AND type = $${paramIndex}`;
    values.push(filters.type);
    paramIndex++;
  }

  if (filters.status) {
    queryText += ` AND status = $${paramIndex}`;
    values.push(filters.status);
    paramIndex++;
  }

  const sortOrder = filters.sort === 'oldest' ? 'ASC' : 'DESC';
  queryText += ` ORDER BY created_at ${sortOrder}`;

  const issueResult = await pool.query(queryText, values);
  const issues = issueResult.rows;

  if (issues.length === 0) return [];

  // Requirements rule: Fetch reporter details in a separate query without JOINs
  const reporterIds = [...new Set(issues.map((img) => img.reporter_id))];
  const userQuery = `SELECT id, name, role FROM users WHERE id = ANY($1)`;
  const userResult = await pool.query(userQuery, [reporterIds]);
  const userMap = new Map(userResult.rows.map((u) => [u.id, u]));

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userMap.get(issue.reporter_id) || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));
};

const getSingleIssueFromDB = async (id: string) => {
  const queryText = `SELECT * FROM issues WHERE id = $1`;
  const result = await pool.query(queryText, [id]);
  const issue = result.rows[0];

  if (!issue) return null;

  const userQuery = `SELECT id, name, role FROM users WHERE id = $1`;
  const userResult = await pool.query(userQuery, [issue.reporter_id]);

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: userResult.rows[0] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssueInDB = async (id: string, updateData: Partial<TIssue>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updateData.title) {
    fields.push(`title = $${paramIndex}`);
    values.push(updateData.title);
    paramIndex++;
  }
  if (updateData.description) {
    fields.push(`description = $${paramIndex}`);
    values.push(updateData.description);
    paramIndex++;
  }
  if (updateData.type) {
    fields.push(`type = $${paramIndex}`);
    values.push(updateData.type);
    paramIndex++;
  }
  if (updateData.status) {
    fields.push(`status = $${paramIndex}`);
    values.push(updateData.status);
    paramIndex++;
  }

  if (fields.length === 0) return null;

  values.push(id);
  const queryText = `
    UPDATE issues 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $${paramIndex} 
    RETURNING *;
  `;
  
  const result = await pool.query(queryText, values);
  return result.rows[0];
};

const deleteIssueFromDB = async (id: string) => {
  const queryText = `DELETE FROM issues WHERE id = $1 RETURNING *;`;
  const result = await pool.query(queryText, [id]);
  return result.rows[0];
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB,
};