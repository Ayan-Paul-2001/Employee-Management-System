import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.configService.get<string>('SMTP_PORT') || 587);
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private getFromAddress(): string {
    const fromName =
      this.configService.get<string>('SMTP_FROM_NAME') ||
      'Next Hunt Management System';
    const fromEmail = this.configService.get<string>('SMTP_USER');
    return `"${fromName}" <${fromEmail}>`;
  }

  private wrapTemplate(title: string, subtitle: string, bodyHtml: string): string {
    const year = new Date().getFullYear();
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0F172A;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding:40px 16px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 8px 30px rgba(15,23,42,0.06);overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#0B1120 0%,#1E3A8A 60%,#2563EB 100%);padding:36px 40px 32px;text-align:left;">
                    <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,0.14);color:#DBEAFE;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:14px;">
                      Next Hunt Management System
                    </div>
                    <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;letter-spacing:-0.02em;">${title}</h1>
                    <p style="margin:6px 0 0;color:#CBD5E1;font-size:14px;">${subtitle}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 40px;">
                    ${bodyHtml}
                  </td>
                </tr>
                <tr>
                  <td style="background:#F8FAFC;padding:20px 40px;border-top:1px solid #E2E8F0;text-align:center;">
                    <p style="margin:0 0 4px;color:#64748B;font-size:12px;">
                      Automated notification from <strong>Next Hunt Management System</strong>
                    </p>
                    <p style="margin:0;color:#94A3B8;font-size:11px;">
                      &copy; ${year} Next Hunt Management System. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error: any) {
      this.logger.warn(`SMTP verification warning: ${error?.message}`);
      return false;
    }
  }

  async sendNewRegistrationAlertToAdminsAndHr(
    recipients: string[],
    newUser: {
      fullName: string;
      email: string;
      employeeCode: string;
      department?: string;
      createdAt?: Date;
    },
  ): Promise<void> {
    const uniqueRecipients = Array.from(
      new Set(
        recipients
          .map((e) => e?.trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    if (uniqueRecipients.length === 0) return;

    const registeredAt = new Date(newUser.createdAt || Date.now()).toLocaleString(
      'en-US',
      { dateStyle: 'medium', timeStyle: 'short' },
    );

    const bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
        A new employee has registered on <strong>Next Hunt Management System</strong>. Review their profile or manage their role from the dashboard.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin:0 0 24px;">
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="6" style="font-size:14px;">
              <tr>
                <td style="color:#64748B;width:140px;">Full Name</td>
                <td style="color:#0F172A;font-weight:600;">${newUser.fullName}</td>
              </tr>
              <tr>
                <td style="color:#64748B;">Email Address</td>
                <td style="color:#0F172A;font-weight:600;">${newUser.email}</td>
              </tr>
              <tr>
                <td style="color:#64748B;">Employee ID</td>
                <td style="color:#2563EB;font-weight:700;font-family:monospace;">${newUser.employeeCode}</td>
              </tr>
              <tr>
                <td style="color:#64748B;">Assigned Role</td>
                <td><span style="display:inline-block;padding:2px 10px;border-radius:999px;background:#EFF6FF;color:#1D4ED8;font-size:12px;font-weight:600;">Employee (Default)</span></td>
              </tr>
              <tr>
                <td style="color:#64748B;">Department</td>
                <td style="color:#0F172A;">${newUser.department || 'General'}</td>
              </tr>
              <tr>
                <td style="color:#64748B;">Registered At</td>
                <td style="color:#0F172A;">${registeredAt}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;">
        Note: Only HR Super Admins can promote an Employee to an Admin role via the Team Directory.
      </p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: uniqueRecipients.join(', '),
        subject: `New Employee Registered: ${newUser.fullName} (${newUser.employeeCode})`,
        html: this.wrapTemplate(
          'New User Registration Alert',
          'Actionable update for HR & Admin teams',
          bodyHtml,
        ),
      });
      this.logger.log(
        `Registration alert email sent to ${uniqueRecipients.length} HR/Admin recipient(s).`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send HR/Admin registration email: ${error?.message}`,
      );
    }
  }

  async sendWelcomeEmail(newUser: {
    fullName: string;
    email: string;
    employeeCode: string;
  }): Promise<void> {
    const bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
        Hello <strong>${newUser.fullName}</strong>,
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
        Thank you for registering with <strong>Next Hunt Management System</strong>. Your employment application has been submitted and is now awaiting review by HR or Admin.
      </p>
      <div style="background:#FAF3E3;border:1px solid #DFC48E;border-radius:12px;padding:18px 22px;margin:0 0 24px;">
        <p style="margin:0 0 6px;font-size:12px;color:#855E1F;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Applicant ID • Pending Approval</p>
        <p style="margin:0;font-size:24px;font-weight:800;color:#0F172A;font-family:monospace;">${newUser.employeeCode}</p>
      </div>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
        You will receive an email as soon as your application is approved, and your waiting lobby will unlock automatically.
      </p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: newUser.email,
        subject: `Application Received — Next Hunt Management System (${newUser.employeeCode})`,
        html: this.wrapTemplate(
          'Application Under Review',
          'Awaiting HR or Admin approval',
          bodyHtml,
        ),
      });
    } catch (error: any) {
      this.logger.warn(`Failed to send applicant received email to ${newUser.email}: ${error?.message}`);
    }
  }

  async sendApplicantDecisionEmail(
    email: string,
    fullName: string,
    employeeCode: string,
    decision: 'approved' | 'rejected',
    reviewerName: string,
    reason?: string,
  ): Promise<void> {
    const isApproved = decision === 'approved';
    const accent = isApproved ? '#0F766E' : '#BE123C';
    const bg = isApproved ? '#ECF8F3' : '#FDF1F3';

    const bodyHtml = isApproved
      ? `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
          Hello <strong>${fullName}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
          Great news! Your employment account on <strong>Next Hunt Management System</strong> has been approved by <strong>${reviewerName}</strong>.
        </p>
        <div style="background:${bg};border:1px solid ${accent}44;border-radius:12px;padding:18px 22px;margin:0 0 20px;">
          <p style="margin:0 0 4px;font-size:12px;color:${accent};font-weight:700;text-transform:uppercase;letter-spacing:1px;">Status: Approved</p>
          <p style="margin:0;font-size:20px;font-weight:800;color:#0F172A;font-family:monospace;">${employeeCode}</p>
        </div>
        <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
          You now have full Employee access to record daily attendance, apply for leave, and read company notices.
        </p>
      `
      : `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
          Hello <strong>${fullName}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#334155;">
          Thank you for your interest in <strong>Next Hunt Management System</strong>. After review by <strong>${reviewerName}</strong>, your employment account request was not approved at this time.
        </p>
        <div style="background:${bg};border:1px solid ${accent}44;border-radius:12px;padding:18px 22px;margin:0 0 20px;">
          <p style="margin:0;font-size:15px;font-weight:700;color:${accent};text-transform:uppercase;">Status: Not Approved</p>
          ${reason ? `<p style="margin:8px 0 0;font-size:14px;color:#334155;">Note: ${reason}</p>` : ''}
        </div>
      `;

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: isApproved
          ? `Account Approved — Welcome to Next Hunt (${employeeCode})`
          : `Application Update — Next Hunt Management System`,
        html: this.wrapTemplate(
          isApproved ? 'Employment Account Approved' : 'Application Status Update',
          isApproved ? 'Your workspace is now unlocked' : 'Update from HR & Admin',
          bodyHtml,
        ),
      });
    } catch (error: any) {
      this.logger.warn(`Failed to send applicant decision email: ${error?.message}`);
    }
  }

  async sendPasswordResetCodeEmail(
    email: string,
    fullName: string,
    code: string,
    context: 'forgot' | 'profile',
  ): Promise<void> {
    const isForgot = context === 'forgot';
    const title = isForgot ? 'Password Recovery Code' : 'Password Change Verification';
    const subtitle = isForgot
      ? 'Use this 6-digit code to reset your account password'
      : 'Confirm your password reset request from Profile Settings';

    const bodyHtml = `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#334155;">
        Hello <strong>${fullName}</strong>,
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
        ${
          isForgot
            ? 'We received a request to reset your Next Hunt Management System password. Enter the verification code below to set a new password:'
            : 'You requested a verification code to reset your password from your Profile Security settings. Enter this code to proceed:'
        }
      </p>
      <div style="background:#F8FAFC;border:2px dashed #2563EB;border-radius:14px;padding:26px;text-align:center;margin:0 0 24px;">
        <p style="margin:0 0 8px;color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">
          6-Digit Verification Code
        </p>
        <div style="font-size:38px;font-weight:800;letter-spacing:10px;color:#0F172A;font-family:'Courier New',monospace;padding:4px 0;">
          ${code}
        </div>
      </div>
      <div style="background:#FFFBEB;border-left:4px solid #D97706;border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 20px;">
        <p style="margin:0;color:#92400E;font-size:13px;">
          This verification code expires in <strong>15 minutes</strong>. Never share this code with anyone.
        </p>
      </div>
      <p style="margin:0;color:#64748B;font-size:13px;line-height:1.5;">
        If you did not request this password change, you can safely ignore this email.
      </p>
    `;

    await this.transporter.sendMail({
      from: this.getFromAddress(),
      to: email,
      subject: `${code} is your Next Hunt verification code`,
      html: this.wrapTemplate(title, subtitle, bodyHtml),
    });
  }

  async sendLeaveDecisionEmail(
    email: string,
    fullName: string,
    status: 'approved' | 'rejected',
    fromDate: string,
    toDate: string,
    reviewerName: string,
    note?: string,
  ): Promise<void> {
    const isApproved = status === 'approved';
    const badgeColor = isApproved ? '#059669' : '#E11D48';
    const badgeBg = isApproved ? '#ECFDF5' : '#FFF1F2';

    const bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;color:#334155;">Hello <strong>${fullName}</strong>,</p>
      <p style="margin:0 0 20px;font-size:15px;color:#334155;">
        Your leave request from <strong>${fromDate}</strong> to <strong>${toDate}</strong> has been reviewed by <strong>${reviewerName}</strong>.
      </p>
      <div style="background:${badgeBg};border:1px solid ${badgeColor}33;border-radius:12px;padding:18px 22px;margin:0 0 20px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:${badgeColor};text-transform:uppercase;letter-spacing:0.5px;">
          Status: ${status}
        </p>
        ${note ? `<p style="margin:8px 0 0;font-size:14px;color:#334155;">Reviewer Note: ${note}</p>` : ''}
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: `Leave Request ${isApproved ? 'Approved' : 'Rejected'} (${fromDate} - ${toDate})`,
        html: this.wrapTemplate(
          `Leave Request ${isApproved ? 'Approved' : 'Rejected'}`,
          'Leave application status update',
          bodyHtml,
        ),
      });
    } catch (error: any) {
      this.logger.warn(`Failed to send leave decision email: ${error?.message}`);
    }
  }

  async sendRoleUpdatedEmail(
    email: string,
    fullName: string,
    newRole: string,
  ): Promise<void> {
    const bodyHtml = `
      <p style="margin:0 0 16px;font-size:15px;color:#334155;">Hello <strong>${fullName}</strong>,</p>
      <p style="margin:0 0 20px;font-size:15px;color:#334155;">
        HR has updated your workspace permissions on <strong>Next Hunt Management System</strong>.
      </p>
      <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:18px 22px;margin:0 0 20px;">
        <p style="margin:0 0 4px;font-size:12px;color:#4338CA;font-weight:700;text-transform:uppercase;">New Role</p>
        <p style="margin:0;font-size:20px;font-weight:800;color:#1E1B4B;text-transform:capitalize;">${newRole}</p>
      </div>
      <p style="margin:0;font-size:13px;color:#64748B;">Sign in or refresh your dashboard to access your updated permissions.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject: `Your Next Hunt Role Has Been Updated to ${newRole.toUpperCase()}`,
        html: this.wrapTemplate(
          'Role Permissions Updated',
          'Account access level update from HR',
          bodyHtml,
        ),
      });
    } catch (error: any) {
      this.logger.warn(`Failed to send role update email: ${error?.message}`);
    }
  }
}
