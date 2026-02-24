"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let MailService = class MailService {
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
            port: Number(this.configService.get('SMTP_PORT')) || 587,
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    async sendVerificationEmail(email, code) {
        const fromEmail = this.configService.get('SMTP_USER');
        await this.transporter.sendMail({
            from: `"EMS - Employee Management System" <${fromEmail}>`,
            to: email,
            subject: '🔐 Verify Your Email - EMS Registration',
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2d6a9f 50%,#3b82c4 100%);padding:40px 40px 30px;text-align:center;">
                      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                        <span style="font-size:32px;color:#ffffff;">✉️</span>
                      </div>
                      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Email Verification</h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Welcome to Employee Management System</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;">
                        Hello! 👋
                      </p>
                      <p style="margin:0 0 24px;color:#334155;font-size:16px;line-height:1.6;">
                        Thank you for registering with <strong>EMS</strong>. To complete your registration and activate your account, please use the verification code below:
                      </p>

                      <!-- Verification Code Box -->
                      <div style="background:linear-gradient(135deg,#f8fafc,#eef2ff);border:2px dashed #3b82f6;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                        <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Verification Code</p>
                        <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#1e3a5f;font-family:'Courier New',monospace;padding:8px 0;">
                          ${code}
                        </div>
                      </div>

                      <!-- Expiry Notice -->
                      <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 24px;">
                        <p style="margin:0;color:#92400e;font-size:14px;">
                          ⏰ This code will expire in <strong>15 minutes</strong>. If it expires, you can register again to receive a new code.
                        </p>
                      </div>

                      <p style="margin:0 0 8px;color:#64748b;font-size:14px;line-height:1.6;">
                        If you did not create an account, please ignore this email. No account will be created.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                      <p style="margin:0 0 4px;color:#94a3b8;font-size:13px;">
                        This is an automated message from <strong>EMS</strong>.
                      </p>
                      <p style="margin:0;color:#94a3b8;font-size:12px;">
                        © ${new Date().getFullYear()} Employee Management System. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map