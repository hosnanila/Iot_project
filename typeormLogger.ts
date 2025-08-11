import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { Logger } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const logDir =path.join(process.cwd(), `../${process.env.LOG_FILE_PATH}`);

/// cleanup config
const oneDay = 24 * 60 * 60 * 1000;
const testPeriod = 20*1000;
const startFrom = {hour: 23 , min: 0 , sec: 0 , ms: 0}; // Start cleanup routine at nearest midnight
const cleanupPeriod = oneDay; // Run cleanup every 24 hours
const logRecordExpireTime = 3 * oneDay; // Logs will be delete every 7 days

// Ensure logs directory exists
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Generate daily log file path

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
const getLogFilePath = () => path.join(logDir, `applog-${year}-${month}-${day}.log`);
const logFilePath = getLogFilePath();

// Create Pino logger
const pinoLogger = pino(
    { level: 'debug' },
    pino.destination({ dest: logFilePath , sync:true})
);

// Flush logs periodically
setInterval(() => pinoLogger.flush(), 5000);

// Scheduled task to delete old logs at midnight
const cleanupOldLogs = () => {
    const files = fs.readdirSync(logDir);
    const cutoffTime = Date.now() - logRecordExpireTime;
    const currentFile = logFilePath.split("\\")[logFilePath.split("\\").length-1]; // Update this to your current log file name.

    files.forEach(file => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            if (file !== currentFile) {
                // Remove any file that is not the current one
                fs.unlinkSync(filePath);
            } else {
                // If it's the current file, update it by removing old logs
                const fileData = fs.readFileSync(filePath, 'utf8');
                const logs = fileData.split('\n').filter(line => {
                    try {
                        const log = JSON.parse(line);
                        return log.time >= cutoffTime; // Only keep logs newer than the cutoff time
                    } catch (e) {
                        // Handle any corrupted log lines gracefully
                        return false; // Skip any invalid log lines
                    }
                });

                // Write the cleaned data back to the current file
                fs.writeFileSync(filePath, logs.join('\n'), 'utf8');
            }
        }
    });
};

// Schedule cleanup at midnight
const scheduleCleanup = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(startFrom.hour, startFrom.min, startFrom.sec, startFrom.ms);
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
        cleanupOldLogs();
        setInterval(cleanupOldLogs, cleanupPeriod); // Run cleanup every 24 hours
    }, timeUntilMidnight);
};

// Start scheduled cleanup
//scheduleCleanup();
    const requestId = uuidv4(); 
// Custom TypeORM logger
export class TypeORMLogger implements Logger {
    log(level: 'log' | 'info' | 'warn' | 'error' | 'query' | 'schema' | 'migration', message: any): void {
        if (level === 'query' || level === 'schema') pinoLogger.debug(message);
        else if (level === 'warn') pinoLogger.warn(message);
        else if (level === 'error') pinoLogger.error(message);
        else pinoLogger.info(message);
        pinoLogger.flush();
    }

    logQuery(query: string, parameters?: any[]): void {
        
        pinoLogger.debug(`Query: ${query},"X-Request-ID": ${requestId},"time": ${new Date().toISOString()}, Params: ${JSON.stringify(parameters)}`);
        pinoLogger.flush();
    }

    logQueryError(error: string, query: string, parameters?: any[]): void {
        pinoLogger.error(`Query Error: ${error},"X-Request-ID": ${requestId},"time": ${new Date().toISOString()}, Query: ${query}, Params: ${JSON.stringify(parameters)}`);
        pinoLogger.flush();
    }

    logQuerySlow(time: number, query: string, parameters?: any[]): void {
        pinoLogger.warn(`Slow Query: ${time}ms,"X-Request-ID": ${requestId},"time": ${new Date().toISOString()}, Query: ${query}, Params: ${JSON.stringify(parameters)}`);
        pinoLogger.flush();
    }

    logSchemaBuild(message: string): void {
        pinoLogger.debug(`Schema Build: ${message},"X-Request-ID": ${requestId},"time": ${new Date().toISOString()}`);
        pinoLogger.flush();
    }

    logMigration(message: string): void {
        pinoLogger.info(`Migration: ${message},"X-Request-ID": ${requestId},"time": ${new Date().toISOString()}`);
        pinoLogger.flush();
    }
}

process.on('SIGINT', async () => {
    pinoLogger.info('Shutting down gracefully...');
    await pinoLogger.flush(); // Ensure logs are flushed
    process.exit(0);
  });