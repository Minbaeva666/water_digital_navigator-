// src/services/email/sendMail.ts
import nodemailer from "nodemailer";
import path from "path";
import { UserWithOrganization, User } from "../../types/user.types";
import { EmailError } from "../../errors/EmailError";
import { loadEmailTemplate } from "../../utils/email";
import { SalutationType } from "@prisma/client";
import { salutationLabels } from "../../shared/constants/enums";
import { DigitalSolution } from "@prisma/client";
import logger from "../../config/loggerConfig";


const EMAIL_FROM =
  process.env.EMAIL_FROM ??
  (process.env.EMAIL_USER
    ? `"Digital Lotse Wasser" <${process.env.EMAIL_USER}>`
    : '"Digital Lotse Wasser" <no-reply@localhost>' );

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.EMAIL_USER ?? "no-reply@localhost";


const EMAIL_DEBUG = process.env.EMAIL_DEBUG === "true";

function createTransporter() {
  const host = process.env.EMAIL_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT ?? 587);
  const secure = (process.env.EMAIL_SECURE ?? "false") === "true";
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER/EMAIL_PASS are not set in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure, // 465 -> true, 587 -> false (STARTTLS)
    auth: { user, pass },
    logger: EMAIL_DEBUG,
    debug: EMAIL_DEBUG,
    // may help with specific proxies/antivirus:
    // tls: { servername: host },
  });
}

// Unify path to templates: they are located next to this file in ./templates/
// => always take absolute path from __dirname
function tpl(file: string) {
  return path.resolve(__dirname, "templates", file);
}

// Helper: detailed error instead of an empty EmailError
function rethrowEmail(error: unknown, ctx: string) {
  const msg = (error as any)?.message || String(error);
  const code = (error as any)?.code;
  logger.error("EMAIL SEND FAILED:", { ctx, code, msg, error });
  throw new EmailError(`Email send failed (${ctx}): ${code ?? ""} ${msg}`);
}

// Optionally: in debug mode verify the SMTP connection
async function maybeVerifyTransporter(transporter: nodemailer.Transporter) {
  if (!EMAIL_DEBUG) return;
  try {
    await transporter.verify();
    logger.info("SMTP connection OK");
  } catch (e) {
    rethrowEmail(e, "transporter.verify()");
  }
}

export async function sendVerifyEmailToRepresentative(
  user: UserWithOrganization,
  confirmLink: string,
  revokeLink: string
): Promise<void> {
  try {
    const EMAIL_SUBJECT =
      "Bitte bestätigen Sie Ihre Registrierung auf digital-lotse-wasser.org";

    const html = await loadEmailTemplate(tpl("verifyTemplate.hbs"), {
      salutation:
        salutationLabels[user.salutationType as SalutationType] ??
        user.salutationType,
      title: user.title ?? "–",
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization?.name,
      email: user.email,
      phonenumber: user.phonenumber ?? "–",
      date: new Date().toISOString().split("T")[0],
      confirmLink,
      revokeLink,
    });

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: EMAIL_SUBJECT,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendVerifyEmailToRepresentative");
  }
}

export async function sendVerifyEmailToPrivate(
  user: User,
  confirmLink: string,
  revokeLink: string
): Promise<void> {
  try {
    const EMAIL_SUBJECT =
      "Bitte bestätigen Sie Ihre Registrierung auf digital-lotse-wasser.org";

    const html = await loadEmailTemplate(tpl("verifyTemplate.hbs"), {
      salutation:
        salutationLabels[user.salutationType as SalutationType] ??
        user.salutationType,
      title: user.title ?? "–",
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phonenumber: user.phonenumber ?? "–",
      date: new Date().toISOString().split("T")[0],
      confirmLink,
      revokeLink,
    });

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: EMAIL_SUBJECT,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendVerifyEmailToPrivate");
  }
}

export async function sendAdminHintNewRegistrationEmail(
  user: UserWithOrganization
): Promise<void> {
  try {
    const EMAIL_SUBJECT = "Eine neue Registrierung auf digital-lotse-wasser.org";

    const html = await loadEmailTemplate(
      tpl("admin-hint-registration-success.hbs"),
      {
        salutation:
          salutationLabels[user.salutationType as SalutationType] ??
          user.salutationType,
        title: user.title ?? "–",
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization?.name,
        email: user.email,
        phonenumber: user.phonenumber ?? "–",
        date: new Date().toISOString().split("T")[0],
      }
    );

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL, 
      subject: EMAIL_SUBJECT,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendAdminHintNewRegistrationEmail");
  }
}

export async function sendRegistrationRevokedHintEmail(
  user: User
): Promise<void> {
  try {
    const EMAIL_SUBJECT =
      "Neue Registrierung auf digital-lotse-wasser.org zurückgezogen";

    const html = await loadEmailTemplate(
      tpl("admin-hint-registration-revoked.hbs"),
      {
        salutation:
          salutationLabels[user.salutationType as SalutationType] ??
          user.salutationType,
        title: user.title ?? "–",
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      }
    );

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL, 
      subject: EMAIL_SUBJECT,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendRegistrationRevokedHintEmail");
  }
}

export async function sendContactMessageFromGuest(params: {
  name?: string;
  email: string;
  message: string;
}): Promise<void> {
  const { name, email, message } = params;

  try {
    const EMAIL_SUBJECT =
      "Neue Kontaktanfrage über digital-lotse-wasser.org";

    const plainText = `
Neue Kontaktanfrage über das Kontaktformular:

Name:   ${name || "-"}
E-Mail: ${email}

Nachricht:
${message}
`.trim();

    const html = `
      <p>Neue Kontaktanfrage über das Kontaktformular:</p>
      <p>
        <strong>Name:</strong> ${name || "-"}<br/>
        <strong>E-Mail:</strong> ${email}
      </p>
      <p><strong>Nachricht:</strong></p>
      <pre style="white-space: pre-wrap;">${message}</pre>
    `;

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,  
      replyTo: email,   
      subject: EMAIL_SUBJECT,
      text: plainText,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendContactMessageFromGuest");
  }
}

export async function sendResetPasswordEmail(
  user: UserWithOrganization,
  resetLink: string
): Promise<void> {
  try {
    const EMAIL_SUBJECT = "Passwort zurücksetzen";

    const html = await loadEmailTemplate(tpl("reset-password.hbs"), {
      firstName: user.firstName,
      resetLink,
      date: new Date().toISOString().split("T")[0],
    });

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: EMAIL_SUBJECT,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendResetPasswordEmail");
  }
}

export async function sendRegistrationSuccessEmail(user: User): Promise<void> {
  try {
    const EMAIL_SUBJECT = "Ihre Registrierung auf digital-lotse-wasser.org";

    const html = await loadEmailTemplate(tpl("registration-success.hbs"), {
      salutation:
        salutationLabels[user.salutationType as SalutationType] ??
        user.salutationType,
      title: user.title ?? "–",
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      phonenumber: user.phonenumber,
      date: new Date().toISOString().split("T")[0],
      email: user.email,
    });

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: EMAIL_SUBJECT,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendRegistrationSuccessEmail");
  }
  
}

export async function sendDigitalSolutionCreatedNotification(params: {
  digitalSolutionName: string;
  digitalSolutionId: string;
  creatorName?: string;
  creatorEmail: string;
  state: string;              // z.B. "REQUESTED"
}): Promise<void> {
  const {
    digitalSolutionName,
    digitalSolutionId,
    creatorName,
    creatorEmail,
    state,
  } = params;

  try {
    const EMAIL_SUBJECT =
      "Neue digitale Lösung auf digital-lotse-wasser.org angelegt";

    const plainText = `
Eine neue digitale Lösung wurde angelegt:

Titel:  ${digitalSolutionName}
ID:     ${digitalSolutionId}
Status: ${state}

Erstellt von:
Name:   ${creatorName || "-"}
E-Mail: ${creatorEmail}
`.trim();

    const html = `
      <p>Eine neue digitale Lösung wurde auf <strong>digital-lotse-wasser.org</strong> angelegt:</p>
      <p>
        <strong>Titel:</strong> ${digitalSolutionName}<br/>
      </p>
      <p><strong>Erstellt von:</strong><br/>
        Name: ${creatorName || "-"}<br/>
        E-Mail: ${creatorEmail}
      </p>
    `;

    const transporter = createTransporter();
    await maybeVerifyTransporter(transporter);

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,           // Admin bekommt Info
      replyTo: creatorEmail,     // direkt an den Ersteller antworten
      subject: EMAIL_SUBJECT,
      text: plainText,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendDigitalSolutionCreatedNotification");
  }
}
