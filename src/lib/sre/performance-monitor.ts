/**
 * Performance Monitoring Agent
 *
 * Comprehensive performance monitoring and analysis for critical performance issues:
 * 1. Database query performance analysis
 * 2. API response time monitoring
 * 3. Frontend bundle size optimization
 * 4. Network request optimization
 */

import { performance } from 'perf_hooks';
import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DatabaseMetric extends PerformanceMetric {
  queryType: 'select' | 'insert' | 'update' | 'delete';
  affectedRows?: number;
  queryHash: string;
}

export interface APIMetric extends PerformanceMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseSize: number;
  userAgent?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;
  private readonly criticalThresholds = {
    database: {
      slow: 1000, // 1s
      critical: 3000, // 3s
    },
    api: {
      slow: 2000, // 2s
      critical: 5000, // 5s
    },
    memory: {
      warning: 0.8, // 80% of heap
      critical: 0.95, // 95% of heap
    }
  };

  private constructor() {
    // Initialize performance monitoring
    this.setupCleanupInterval();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Database Query Performance Monitor
   */
  async monitorDatabaseQuery<T>(
    queryOperation: () => Promise<T>,
    queryType: DatabaseMetric['queryType'],
    queryDescription: string
  ): Promise<T> {
    const startTime = performance.now();
    const queryHash = this.generateQueryHash(queryDescription);

    try {
      const result = await queryOperation();
      const duration = performance.now() - startTime;

      const metric: DatabaseMetric = {
        timestamp: Date.now(),
        operation: `db_${queryType}`,
        duration,
        queryType,
        queryHash,
        severity: this.calculateDatabaseSeverity(duration),
        metadata: {
          description: queryDescription,
          resultCount: Array.isArray(result) ? result.length : undefined,
        }
      };

      this.addMetric(metric);

      // Log slow queries for immediate attention
      if (duration > this.criticalThresholds.database.slow) {
        console.warn(`🐌 Slow Database Query (${duration.toFixed(2)}ms):`, {
          query: queryDescription,
          duration,
          severity: metric.severity
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const metric: DatabaseMetric = {
        timestamp: Date.now(),
        operation: `db_${queryType}_error`,
        duration,
        queryType,
        queryHash,
        severity: 'critical',
        metadata: {
          description: queryDescription,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      };

      this.addMetric(metric);
      console.error(`💥 Database Query Error (${duration.toFixed(2)}ms):`, {
        query: queryDescription,
        error,
        duration
      });

      throw error;
    }
  }

  /**
   * API Response Time Monitor
   */
  async monitorAPIEndpoint(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = performance.now();
    const endpoint = request.nextUrl.pathname;
    const method = request.method;

    try {
      const response = await handler();
      const duration = performance.now() - startTime;
      const responseSize = this.estimateResponseSize(response);

      const metric: APIMetric = {
        timestamp: Date.now(),
        operation: `api_${method.toLowerCase()}`,
        duration,
        endpoint,
        method,
        statusCode: response.status,
        responseSize,
        severity: this.calculateAPISeverity(duration, response.status),
        metadata: {
          userAgent: request.headers.get('user-agent'),
          contentType: response.headers.get('content-type'),
        }
      };

      this.addMetric(metric);

      // Add performance headers to response
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
      response.headers.set('X-Performance-Status', metric.severity);

      // Log slow API responses
      if (duration > this.criticalThresholds.api.slow) {
        console.warn(`🐌 Slow API Response (${duration.toFixed(2)}ms):`, {
          endpoint,
          method,
          duration,
          severity: metric.severity
        });
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      const metric: APIMetric = {
        timestamp: Date.now(),
        operation: `api_${method.toLowerCase()}_error`,
        duration,
        endpoint,
        method,
        statusCode: 500,
        responseSize: 0,
        severity: 'critical',
        metadata: {
          userAgent: request.headers.get('user-agent'),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      };

      this.addMetric(metric);
      console.error(`💥 API Error (${duration.toFixed(2)}ms):`, {
        endpoint,
        method,
        error,
        duration
      });

      throw error;
    }
  }

  /**
   * Memory Usage Monitor
   */
  checkMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
      const heapUsageRatio = memUsage.heapUsed / memUsage.heapTotal;

      const metric: PerformanceMetric = {
        timestamp: Date.now(),
        operation: 'memory_check',
        duration: 0,
        severity: this.calculateMemorySeverity(heapUsageRatio),
        metadata: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          heapUsageRatio,
          rss: memUsage.rss / 1024 / 1024,
          external: memUsage.external / 1024 / 1024,
        }
      };

      this.addMetric(metric);

      if (heapUsageRatio > this.criticalThresholds.memory.warning) {
        console.warn(`⚠️ High Memory Usage: ${(heapUsageRatio * 100).toFixed(1)}%`, {
          heapUsed: `${heapUsedMB.toFixed(1)}MB`,
          heapTotal: `${heapTotalMB.toFixed(1)}MB`,
          severity: metric.severity
        });
      }
    }
  }

  /**
   * Performance Analytics and Reporting
   */
  getPerformanceReport(timeRange: number = 3600000): {
    summary: {
      totalMetrics: number;
      averageDBQueryTime: number;
      averageAPIResponseTime: number;
      criticalIssues: number;
      slowQueries: number;
      slowAPIs: number;
    };
    slowQueries: DatabaseMetric[];
    slowAPIs: APIMetric[];
    recommendations: string[];
  } {
    const cutoff = Date.now() - timeRange;
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    const dbMetrics = recentMetrics.filter(m => m.operation.startsWith('db_')) as DatabaseMetric[];
    const apiMetrics = recentMetrics.filter(m => m.operation.startsWith('api_')) as APIMetric[];

    const slowQueries = dbMetrics
      .filter(m => m.duration > this.criticalThresholds.database.slow)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const slowAPIs = apiMetrics
      .filter(m => m.duration > this.criticalThresholds.api.slow)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const summary = {
      totalRequests: apiMetrics.length,
      averageAPIResponseTime: this.calculateAverage(apiMetrics.map(m => m.duration)),
      averageDBQueryTime: this.calculateAverage(dbMetrics.map(m => m.duration)),
      errorRate: apiMetrics.filter(m => m.statusCode >= 400).length / apiMetrics.length,
      criticalIssues: recentMetrics.filter(m => m.severity === 'critical').length,
    };

    const recommendations = this.generateRecommendations(summary, slowQueries, slowAPIs);

    return {
      summary,
      slowQueries,
      slowAPIs,
      recommendations
    };
  }

  /**
   * Real-time Performance Alerts
   */
  checkPerformanceAlerts(): void {
    const recentMetrics = this.metrics.filter(m => m.timestamp > Date.now() - 300000); // Last 5 minutes

    // Check for consecutive slow responses
    const recentSlowAPIs = recentMetrics.filter(m =>
      m.operation.startsWith('api_') &&
      m.duration > this.criticalThresholds.api.slow
    );

    if (recentSlowAPIs.length > 5) {
      console.error('🚨 CRITICAL: Multiple slow API responses detected!', {
        count: recentSlowAPIs.length,
        averageTime: this.calculateAverage(recentSlowAPIs.map(m => m.duration)),
        recommendation: 'Check database connections and OpenAI API performance'
      });
    }

    // Check for memory leaks
    const memoryMetrics = recentMetrics.filter(m => m.operation === 'memory_check');
    if (memoryMetrics.length > 0) {
      const latestMemory = memoryMetrics[memoryMetrics.length - 1];
      if (latestMemory.severity === 'critical') {
        console.error('🚨 CRITICAL: Memory usage critical!', latestMemory.metadata);
      }
    }
  }

  // Private helper methods
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics to prevent memory bloat
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private calculateDatabaseSeverity(duration: number): PerformanceMetric['severity'] {
    if (duration > this.criticalThresholds.database.critical) return 'critical';
    if (duration > this.criticalThresholds.database.slow) return 'high';
    if (duration > 500) return 'medium';
    return 'low';
  }

  private calculateAPISeverity(duration: number, statusCode: number): PerformanceMetric['severity'] {
    if (statusCode >= 500) return 'critical';
    if (duration > this.criticalThresholds.api.critical) return 'critical';
    if (duration > this.criticalThresholds.api.slow || statusCode >= 400) return 'high';
    if (duration > 1000) return 'medium';
    return 'low';
  }

  private calculateMemorySeverity(ratio: number): PerformanceMetric['severity'] {
    if (ratio > this.criticalThresholds.memory.critical) return 'critical';
    if (ratio > this.criticalThresholds.memory.warning) return 'high';
    if (ratio > 0.6) return 'medium';
    return 'low';
  }

  private generateQueryHash(query: string): string {
    // Simple hash for query identification
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private estimateResponseSize(response: NextResponse): number {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private generateRecommendations(
    summary: {
      totalMetrics: number;
      averageDBQueryTime: number;
      averageAPIResponseTime: number;
      criticalIssues: number;
      slowQueries: number;
      slowAPIs: number;
    },
    slowQueries: DatabaseMetric[],
    slowAPIs: APIMetric[]
  ): string[] {
    const recommendations: string[] = [];

    if (summary.averageDBQueryTime > 1000) {
      recommendations.push('🔍 Database queries are slow. Consider adding indexes or optimizing query patterns.');
    }

    if (summary.averageAPIResponseTime > 2000) {
      recommendations.push('⚡ API responses are slow. Check database connections and external service calls.');
    }

    if (summary.errorRate > 0.05) {
      recommendations.push('⚠️ High error rate detected. Review error logs and add better error handling.');
    }

    if (slowQueries.length > 0) {
      const topSlowQuery = slowQueries[0];
      recommendations.push(`🐌 Slowest query: ${topSlowQuery.metadata?.description} (${topSlowQuery.duration.toFixed(2)}ms)`);
    }

    if (slowAPIs.length > 0) {
      const topSlowAPI = slowAPIs[0];
      recommendations.push(`🐌 Slowest API: ${topSlowAPI.method} ${topSlowAPI.endpoint} (${topSlowAPI.duration.toFixed(2)}ms)`);
    }

    if (summary.criticalIssues > 0) {
      recommendations.push('🚨 Critical performance issues detected. Immediate attention required.');
    }

    return recommendations;
  }

  private setupCleanupInterval(): void {
    // Clean up old metrics every hour
    setInterval(() => {
      const cutoff = Date.now() - 3600000; // 1 hour
      this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    }, 3600000);

    // Run performance checks every 5 minutes
    setInterval(() => {
      this.checkMemoryUsage();
      this.checkPerformanceAlerts();
    }, 300000);
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility wrapper for database queries
export function withDatabaseMonitoring<T>(
  queryType: DatabaseMetric['queryType'],
  description: string
) {
  return (queryFn: () => Promise<T>): Promise<T> => {
    return performanceMonitor.monitorDatabaseQuery(queryFn, queryType, description);
  };
}

// Utility wrapper for API routes
export function withAPIMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    return performanceMonitor.monitorAPIEndpoint(req, () => handler(req));
  };
}