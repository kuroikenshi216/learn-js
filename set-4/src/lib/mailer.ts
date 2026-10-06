import nodemailer from "nodemailer";

import { env } from "../config/env";

export const mailer = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: false,
});
