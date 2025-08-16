import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "mdjahinkhanutsho@gmail.com",
        pass: "ppbrofxhhgvzgnkp",
      }
  });

  async sendVerificationEmail(to: string, code: string) {
    await this.transporter.sendMail({
      from: "mdjahinkhanutsho@gmail.com",
      to,
      subject: 'Verify your email',
      text: `Your verification code is: ${code}`,
    });
  }
}
