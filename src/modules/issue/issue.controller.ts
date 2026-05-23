import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request & { user?: any }, res: Response) => {
  try {
    const issueData = {
      ...req.body,
      reporter_id: req.user.id, // Extracted securely via middleware token payload
    };

    const result = await issueService.createIssueIntoDB(issueData);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const filters = {
      sort: req.query.sort as 'newest' | 'oldest',
      type: req.query.type as 'bug' | 'feature_request',
      status: req.query.status as 'open' | 'in_progress' | 'resolved',
    };

    const result = await issueService.getAllIssuesFromDB(filters);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getSingleIssueFromDB(req.params.id as string);
    if (!result) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateIssue = async (req: Request & { user?: any }, res: Response) => {
  try {
    const issueId = req.params.id;
    const currentIssue = await issueService.getSingleIssueFromDB(issueId as string);

    if (!currentIssue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    // Role Enforcement authorization logic
    if (req.user.role !== 'maintainer') {
      if (currentIssue.reporter.id !== req.user.id) {
        return res.status(43).json({ success: false, message: "Forbidden context access" });
      }
      if (currentIssue.status !== 'open') {
        return res.status(409).json({ success: false, message: "Contributors can only update open issues" });
      }
    }

    const result = await issueService.updateIssueInDB(issueId as string, req.body);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.deleteIssueFromDB(req.params.id as string);
    if (!result) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};