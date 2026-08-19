type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private static formatLog(entry: LogEntry): string {
    const metaStr = entry.metadata ? ` | metadata=${JSON.stringify(entry.metadata)}` : '';
    return `[${entry.timestamp}] [${entry.level}] [${entry.context}]: ${entry.message}${metaStr}`;
  }

  public static info(context: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      context,
      message,
      metadata,
    };
    console.log(this.formatLog(entry));
  }

  public static warn(context: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      context,
      message,
      metadata,
    };
    console.warn(this.formatLog(entry));
  }

  public static error(context: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context,
      message,
      metadata,
    };
    console.error(this.formatLog(entry));
  }

  public static ingestionRun(source: string, metrics: { fetched: number; inserted: number; duplicates: number; errors: number }, durationMs: number) {
    this.info('IngestionPipeline', `Run completed for source '${source}' in ${durationMs}ms`, {
      source,
      metrics,
      durationMs,
    });
  }
}
