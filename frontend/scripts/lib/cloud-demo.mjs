import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  CLOUD_DEMO_ACCOUNTS,
  CLOUD_DEMO_PASSWORD,
} from "../fixtures/legacy-demo-accounts.ts";
import { DEVICE_PICTOGRAM_ASSETS } from "../../src/lib/pictogramCatalog.ts";

/** Explicit provisioning only. Existing demo changes are preserved; login never calls this code. */
export async function provisionCloudDemo(db) {
  if (
    process.env.STCS_TEST_ISOLATED !== "1" ||
    !["localhost", "127.0.0.1", "::1"].includes(db.connectionParameters?.host)
  )
    throw new Error("Legacy demos are restricted to disposable local tests.");
  await db.query("BEGIN");
  try {
    await db.query(
      "SELECT pg_advisory_xact_lock(hashtextextended('stcs-cloud-demo-v1',0))",
    );
    const snapshot = async () =>
      (
        await db.query(`SELECT
      md5(COALESCE((SELECT string_agg(to_jsonb(u)::text,',' ORDER BY u.id) FROM users u WHERE NOT u.is_demo),'')) AS users,
      md5(COALESCE((SELECT string_agg(to_jsonb(p)::text,',' ORDER BY p.id) FROM student_profiles p WHERE NOT p.is_demo),'')) AS profiles`)
      ).rows[0];
    const before = await snapshot();
    const userIds = [],
      profileIds = [],
      deviceIds = [],
      accounts = [],
      newUsers = new Set();
    const hash = await bcrypt.hash(CLOUD_DEMO_PASSWORD, 12);
    async function account(email, fullName, role) {
      const found = await db.query(
        "SELECT id,is_demo,role FROM users WHERE email=$1",
        [email],
      );
      if (found.rowCount) {
        if (!found.rows[0].is_demo || found.rows[0].role !== role)
          throw new Error(
            "Reserved demo identity conflicts with an existing account. No data changed.",
          );
        return found.rows[0].id;
      }
      const id = randomUUID();
      newUsers.add(id);
      await db.query(
        "INSERT INTO users(id,full_name,email,password_hash,role,is_demo) VALUES($1,$2,$3,$4,$5,TRUE)",
        [id, fullName, email, hash, role],
      );
      return id;
    }
    for (const a of CLOUD_DEMO_ACCOUNTS) {
      const id = await account(a.email, a.fullName, a.role);
      userIds.push(id);
      accounts.push({ ...a, id });
    }
    for (const [i, name] of ["Alex", "Luna"].entries()) {
      const childId = await account(
        `${name.toLowerCase()}@demo.stcs.local`,
        `${name} Ejemplo`,
        "child",
      );
      userIds.push(childId);
      let p = await db.query(
        "SELECT id,is_demo FROM student_profiles WHERE child_user_id=$1",
        [childId],
      );
      if (p.rowCount && !p.rows[0].is_demo)
        throw new Error(
          "Reserved child profile is not a demo. No data changed.",
        );
      const newProfile = !p.rowCount;
      if (!p.rowCount) {
        const id = randomUUID();
        p = await db.query(
          `INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,sensitive_notes,is_demo) VALUES($1,$2,$3,$4,'Apoyo visual de ejemplo','Demostración','Información ficticia. No corresponde a una persona real.',TRUE) RETURNING id`,
          [id, childId, `${name} Ejemplo`, 8 + i],
        );
      }
      const profileId = p.rows[0].id;
      profileIds.push(profileId);
      const deviceCode = `STCS-DEMO-00${i + 1}`;
      let device = await db.query(
        "SELECT id,student_profile_id FROM devices WHERE device_code=$1",
        [deviceCode],
      );
      if (device.rowCount && device.rows[0].student_profile_id !== profileId)
        throw new Error(
          "Reserved demo device belongs to another profile. No data changed.",
        );
      if (!device.rowCount)
        device = await db.query(
          "INSERT INTO devices(id,student_profile_id,device_code,name,status,firmware_version) VALUES($1,$2,$3,'Comunicador demo pendiente de enlace','offline','demo-v1') RETURNING id",
          [randomUUID(), profileId, deviceCode],
        );
      deviceIds.push(device.rows[0].id);
      // Only initialize a new board: provisioning must not restore pictograms users retired.
      const board = await db.query(
        "SELECT 1 FROM pictograms WHERE student_profile_id=$1 LIMIT 1",
        [profileId],
      );
      if (!board.rowCount)
        for (const a of DEVICE_PICTOGRAM_ASSETS.slice(0, 16))
          await db.query(
            "INSERT INTO pictograms(id,student_profile_id,label,message,category,color_tone,icon_name,image_path,position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
            [
              randomUUID(),
              profileId,
              a.label,
              a.message,
              a.category,
              a.colorTone,
              a.iconName,
              a.imagePath,
              a.position,
            ],
          );
      for (const adult of accounts.filter(
        (a) =>
          (a.role !== "guardian" || i === 0) &&
          (newProfile || newUsers.has(a.id)),
      ))
        await db.query(
          "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,$3,NOW()) ON CONFLICT DO NOTHING",
          [adult.id, childId, adult.role],
        );
      const reports = await db.query(
        "SELECT 1 FROM specialist_reports WHERE student_profile_id=$1 LIMIT 1",
        [profileId],
      );
      if (!reports.rowCount)
        await db.query(
          "INSERT INTO specialist_reports(id,student_profile_id,author_user_id,diagnosis,teacher_guidance) VALUES($1,$2,$3,$4,$5)",
          [
            randomUUID(),
            profileId,
            accounts.find((a) => a.role === "therapist").id,
            "Informe ficticio de demostración, sin valor clínico.",
            "Ofrecer tiempo para elegir un pictograma y confirmar el mensaje con calma.",
          ],
        );
      for (const [n, label] of ["Agua", "Ayuda", "Feliz"].entries()) {
        const pictogram = await db.query(
          "SELECT id FROM pictograms WHERE student_profile_id=$1 AND label=$2 LIMIT 1",
          [profileId, label],
        );
        await db.query(
          `INSERT INTO device_events(id,device_id,student_profile_id,pictogram_id,external_event_id,event_type,action_label,context,actor_name,emotion,payload,occurred_at) VALUES($1,$2,$3,$4,$5,'pictogram_selected',$6,'Demostración','Ejemplo ficticio',$7,$8::jsonb,(NOW() AT TIME ZONE 'UTC')-($9*INTERVAL '1 hour')) ON CONFLICT(device_id,external_event_id) WHERE external_event_id IS NOT NULL DO NOTHING`,
          [
            randomUUID(),
            device.rows[0].id,
            profileId,
            pictogram.rows[0]?.id ?? null,
            `cloud-demo-v1-${n}`,
            `Ejemplo: seleccionó ${label}`,
            n === 2 ? "feliz" : null,
            JSON.stringify({
              source: "demo-fixture",
              category: n === 2 ? "Emociones" : "Necesidades",
            }),
            n,
          ],
        );
      }
    }
    if (JSON.stringify(before) !== JSON.stringify(await snapshot()))
      throw new Error(
        "Existing real accounts or profiles changed during provisioning; demo transaction rolled back.",
      );
    await db.query("COMMIT");
    return {
      userIds,
      profileIds,
      deviceIds,
      accounts,
      existingRealDataUnchanged: true,
    };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}
