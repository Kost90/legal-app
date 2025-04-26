import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import * as os from 'os';
import axios from 'axios';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly dataSource: DataSource) {}

  public async checkHealth(): Promise<object> {
    return {
      message: 'server is working, test4',
      data: {
        server_ip: this.getServerIp(),
        external_ip: await this.getExternalIp(),
        metrics: {
          db_connection: await this.checkDatabaseConnection(),
          ...this.getServerMetrics(),
        },
      },
    };
  }

  private getServerIp(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return 'IP address not found';
  }

  private async getExternalIp(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return response.data.ip as string;
    } catch (e) {
      this.logger.error(e);
      return 'External IP address not found';
    }
  }

  private getServerMetrics() {
    const memoryUsage = process.memoryUsage();
    const loadAverage = os.loadavg();

    return {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      cpu: {
        loadAverage1m: loadAverage[0],
        loadAverage5m: loadAverage[1],
        loadAverage15m: loadAverage[2],
        cores: os.cpus().length,
      },
      uptime: process.uptime(),
    };
  }

  private async checkDatabaseConnection(): Promise<string> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'Connected';
    } catch (error) {
      this.logger.error('Database connection failed:', error);
      return 'Disconnected';
    }
  }
}
