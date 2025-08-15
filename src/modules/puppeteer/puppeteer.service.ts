import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService implements OnModuleInit, OnModuleDestroy {
  private browser: puppeteer.Browser;

  async onModuleInit() {
    // this.browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // });

    this.browser = await puppeteer.launch({
      args: (process.env.PUPPETEER_ARGS || '').split(' ').filter(Boolean),
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
    });
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  public async getNewPage(): Promise<puppeteer.Page> {
    if (!this.browser) {
      throw new Error('Puppeteer browser not initialized');
    }
    return this.browser.newPage();
  }
}
