// src/services/email/sendMail.ts
import nodemailer from "nodemailer";
import path from "path";
import { UserWithOrganization, User } from "../../types/user.types";
import { EmailError } from "../../errors/EmailError";
import { loadEmailTemplate } from "../../utils/email";
import { SalutationType } from "@prisma/client";
import { salutationLabels } from "../../shared/constants/enums";

const EMAIL_FROM =
  process.env.EMAIL_FROM ??
  (process.env.EMAIL_USER
    ? `"Digital Lotse Wasser" <${process.env.EMAIL_USER}>`
    : '"Digital Lotse Wasser" <no-reply@localhost>' );

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.EMAIL_USER ?? "no-reply@localhost";

// В DEV можно включить детальный лог SMTP, установив EMAIL_DEBUG=true
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
    // при специфических прокси/антивирусах иногда помогает:
    // tls: { servername: host },
  });
}

// Унифицируем путь к шаблонам: они лежат рядом с этим файлом в ./templates/
// => всегда берём абсолютный путь от __dirname
function tpl(file: string) {
  return path.resolve(__dirname, "templates", file);
}

// Вспомогалка: детальная ошибка вместо «пустого» EmailError
function rethrowEmail(error: unknown, ctx: string) {
  const msg = (error as any)?.message || String(error);
  const code = (error as any)?.code;
  // eslint-disable-next-line no-console
  console.error("EMAIL SEND FAILED:", { ctx, code, msg, error });
  throw new EmailError(`Email send failed (${ctx}): ${code ?? ""} ${msg}`);
}

// Опционально: в режиме диагностики проверим SMTP-соединение
async function maybeVerifyTransporter(transporter: nodemailer.Transporter) {
  if (!EMAIL_DEBUG) return;
  try {
    await transporter.verify();
    // eslint-disable-next-line no-console
    console.log("SMTP connection OK");
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
      to: ADMIN_EMAIL, // важное изменение: письмо админу, а не пользователю
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
      to: ADMIN_EMAIL, // письмо админу
      subject: EMAIL_SUBJECT,
      html,
    });
  } catch (error) {
    rethrowEmail(error, "sendRegistrationRevokedHintEmail");
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

// import nodemailer from 'nodemailer';
// import {UserWithOrganization, User} from "../../types/user.types";
// import {EmailError} from "../../errors/EmailError";
// import {loadEmailTemplate} from "../../utils/email";
// import {SalutationType} from "@prisma/client";
// import {salutationLabels} from "../../shared/constants/enums";


// function createTransporter() {
//     return nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false,
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//     });
// }


// export async function sendVerifyEmailToRepresentative(user: UserWithOrganization, confirmLink: string, revokeLink: string): Promise<void> {
//     try {
//         const EMAIL_SUBJECT = 'Bitte bestätigen Sie Ihre Registrierung auf digital-lotse-wasser.org';
//         const EMAIL_FROM = '"Digital Lotse Wasser" <deine.email@gmail.com>';

//         const html = await loadEmailTemplate('../email/templates/verifyTemplate.hbs', {
//             salutation: salutationLabels[user.salutationType as SalutationType] ?? user.salutationType,
//             title: user.title ?? '–',
//             name: `${user.firstName} ${user.lastName}`,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             organization: user.organization?.name,
//             email: user.email,
//             phonenumber: user.phonenumber ?? '–',
//             date: new Date().toISOString().split('T')[0],
//             confirmLink,
//             revokeLink,
//         });


//         const transporter = createTransporter();
//         const mailOptions = {
//             from: EMAIL_FROM,
//             to: user.email,
//             subject: EMAIL_SUBJECT,
//             html: html,
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         throw new EmailError();
//     }
// }

// export async function sendVerifyEmailToPrivate(user: User, confirmLink: string, revokeLink: string): Promise<void> {
//     try {
//         const EMAIL_SUBJECT = 'Bitte bestätigen Sie Ihre Registrierung auf digital-lotse-wasser.org';
//         const EMAIL_FROM = '"Digital Lotse Wasser" <deine.email@gmail.com>';

//         const html = await loadEmailTemplate('../services/email/templates/verifyTemplate.hbs', {
//             salutation: salutationLabels[user.salutationType as SalutationType] ?? user.salutationType,
//             title: user.title ?? '–',
//             name: `${user.firstName} ${user.lastName}`,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//             phonenumber: user.phonenumber ?? '–',
//             date: new Date().toISOString().split('T')[0],
//             confirmLink,
//             revokeLink
//         });


//         const transporter = createTransporter();

//         const mailOptions = {
//             from: EMAIL_FROM,
//             to: user.email,
//             subject: EMAIL_SUBJECT,
//             html,
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         throw new EmailError();
//     }
// }

// export async function sendAdminHintNewRegistrationEmail(user: UserWithOrganization): Promise<void> {
//     try {
//         const EMAIL_SUBJECT = 'Eine neue Registrierung auf digital-lotse-wasser.org';
//         const EMAIL_FROM = '"Digital Lotse Wasser" <deine.email@gmail.com>';

//         const html = await loadEmailTemplate('../services/email/templates/admin-hint-registration-success.hbs', {
//             salutation: salutationLabels[user.salutationType as SalutationType] ?? user.salutationType,
//             title: user.title ?? '–',
//             firstName: user.firstName,
//             lastName: user.lastName,
//             organization: user.organization?.name,
//             email: user.email,
//             phonenumber: user.phonenumber ?? '–',
//             date: new Date().toISOString().split('T')[0],
//         });

//         const transporter = createTransporter();

//         const mailOptions = {
//             from: EMAIL_FROM,
//             to: user.email,
//             subject: EMAIL_SUBJECT,
//             html,
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         throw new EmailError();
//     }
// }

// export async function sendRegistrationRevokedHintEmail(user: User): Promise<void> {
//     try {
//         const EMAIL_SUBJECT = 'Neue Registrierung auf digital-lotse-wasser.org zurückgezogen';
//         const EMAIL_FROM = '"Digital Lotse Wasser" <deine.email@gmail.com>';

//         const html = await loadEmailTemplate('../services/email/templates/admin-hint-registration-revoked.hbs', {
//             salutation: salutationLabels[user.salutationType as SalutationType] ?? user.salutationType,
//             title: user.title ?? '–',
//             name: `${user.firstName} ${user.lastName}`,
//             email: user.email,
//         });

//         const transporter = createTransporter();

//         const mailOptions = {
//             from: EMAIL_FROM,
//             to: user.email,
//             subject: EMAIL_SUBJECT,
//             html,
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         throw new EmailError();
//     }
// }

// export async function sendResetPasswordEmail(user: UserWithOrganization, resetLink: string): Promise<void> {
//     try {
//         const EMAIL_SUBJECT = 'Passwort zurücksetzen';
//         const EMAIL_FROM = '"Digital Lotse Wasser" <deine.email@gmail.com>';

//         const html = await loadEmailTemplate('../services/email/templates/reset-password.hbs', {
//             firstName: user.firstName,
//             resetLink,
//             date: new Date().toISOString().split('T')[0],
//         });

//         const transporter = createTransporter();

//         const mailOptions = {
//             from: EMAIL_FROM,
//             to: user.email,
//             subject: EMAIL_SUBJECT,
//             html,
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         throw new EmailError();
//     }
// }

// export async function sendRegistrationSuccessEmail(user: User): Promise<void> {
//     try {
//         const EMAIL_SUBJECT = 'Ihre Registrierung auf digital-lotse-wasser.org';
//         const EMAIL_FROM = '"Digital Lotse Wasser" <deine.email@gmail.com>';

//         const html = await loadEmailTemplate('../services/email/templates/registration-success.hbs', {
//             salutation: salutationLabels[user.salutationType as SalutationType] ?? user.salutationType,
//             title: user.title ?? '–',
//             name: `${user.firstName} ${user.lastName}`,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             phonenumber: user.phonenumber,
//             date: new Date().toISOString().split('T')[0],
//             email: user.email,
//         });

//         const transporter = createTransporter();

//         const mailOptions = {
//             from: EMAIL_FROM,
//             to: user.email,
//             subject: EMAIL_SUBJECT,
//             html,
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         throw new EmailError();
//     }
// }

