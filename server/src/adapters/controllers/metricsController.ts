import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getMetrics } from '../../app/helper/requestMetrics';

/**
 * Controller providing access to aggregated performance metrics. The
 * metrics are collected in memory by the request monitor middleware.
 * Administrators and owners can use this endpoint to observe average
 * request durations, the number of slow requests and other statistics
 * broken down by HTTP method and route.
 */
const metricsController = () => {
  const fetchMetrics = asyncHandler(async (_req: Request, res: Response) => {
    const metrics = getMetrics();
    res.status(200).json({
      status: 'success',
      message: 'Performance metrics retrieved successfully',
      data: metrics
    });
  });
  return { fetchMetrics };
};

export default metricsController;