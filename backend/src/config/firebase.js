import admin from "firebase-admin";
import { config } from "firebase-functions";

const creds = config().adminsdk;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: creds.project_id,
      clientEmail: creds.client_email,
      privateKey: creds.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

db.settings({ ignoreUndefinedProperties: true });

export default admin;
