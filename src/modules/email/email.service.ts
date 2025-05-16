import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { IEmailData } from './types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private readonly emailFromName: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('frontEndUrl', 'http://localhost:3000');
    this.emailFromName = this.configService.get<string>('emailFrom', 'UDocument');
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${this.frontendUrl}/verify-email?token=${token}`;

    const emailToSend = {
      verificationLink: verificationLink,
      email: email,
      subject: `Підтвердіть ваш Email адрес для ${this.emailFromName}`,
      template: './email-verification',
    };

    await this.sendEmail(emailToSend);
    this.logger.log(`Verification email sent to ${email} successfully using Brevo.`);
  }

  private async sendEmail(emailData: IEmailData): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      await this.mailerService.sendMail({
        to: emailData.email,
        subject: emailData.subject,
        template: emailData.template,
        context: {
          verificationLink: emailData.verificationLink,
          emailFromName: this.emailFromName,
          year: currentYear,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.email} using Brevo. Error: ${error}`);
      throw new BadRequestException(`Failed to send verification email to ${emailData.email}.`);
    }
  }
}
