import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { DEVICE_PICTOGRAM_ASSETS } from "../../src/lib/pictogramCatalog.ts";

/** Explicit maintenance only: creates a private synthetic profile, never demo events. */
export async function provisionPrivateProfile(db, config) {
  await db.query("BEGIN");
  try {
    await db.query(
      "SELECT pg_advisory_xact_lock(hashtextextended('stcs-private-profile-v1',0))",
    );
    const hardware = await db.query(
      "SELECT id,student_profile_id FROM devices WHERE device_code=$1 FOR UPDATE",
      [config.deviceCode],
    );
    if (!hardware.rowCount)
      throw new Error(
        "The existing physical device must be identified before linking it.",
      );
    const accounts = [];
    for (const a of config.accounts) {
      if (!["therapist", "teacher", "guardian"].includes(a.role))
        throw new Error("Private test administrators are forbidden.");
      const found = await db.query(
        "SELECT id,role,is_private_test,password_hash,is_active FROM users WHERE email=$1",
        [a.email],
      );
      if (found.rowCount) {
        const u = found.rows[0];
        if (
          !u.is_private_test ||
          u.role !== a.role ||
          !u.is_active ||
          !(await bcrypt.compare(a.password, u.password_hash))
        )
          throw new Error(
            "Reserved account conflict; existing accounts are never overwritten.",
          );
        accounts.push({ id: u.id, role: a.role, email: a.email });
      } else {
        const id = randomUUID();
        await db.query(
          "INSERT INTO users(id,full_name,email,password_hash,role,is_active,is_demo,is_private_test) VALUES($1,$2,$3,$4,$5,TRUE,FALSE,TRUE)",
          [id, a.fullName, a.email, await bcrypt.hash(a.password, 12), a.role],
        );
        accounts.push({ id, role: a.role, email: a.email });
      }
    }
    let child = await db.query(
      "SELECT id,is_private_test,role FROM users WHERE email=$1",
      [config.childEmail],
    );
    if (
      child.rowCount &&
      (!child.rows[0].is_private_test || child.rows[0].role !== "child")
    )
      throw new Error("Reserved child identity conflict.");
    if (!child.rowCount) {
      child = await db.query(
        "INSERT INTO users(id,full_name,email,password_hash,role,is_active,is_demo,is_private_test) VALUES($1,$2,$3,$4,'child',TRUE,FALSE,TRUE) RETURNING id",
        [
          randomUUID(),
          config.name,
          config.childEmail,
          await bcrypt.hash(randomUUID(), 12),
        ],
      );
    }
    const childId = child.rows[0].id;
    let profile = await db.query(
      "SELECT id,is_private_test FROM student_profiles WHERE child_user_id=$1",
      [childId],
    );
    if (profile.rowCount && !profile.rows[0].is_private_test)
      throw new Error("Reserved profile conflict.");
    const created = !profile.rowCount;
    if (created) {
      profile = await db.query(
        "INSERT INTO student_profiles(id,child_user_id,display_name,age,support_level,main_context,sensitive_notes,is_demo,is_private_test) VALUES($1,$2,$3,8,'Sin evaluación clínica','Prueba con dispositivo físico','Perfil privado de prueba. No corresponde a un menor real ni contiene un diagnóstico.',FALSE,TRUE) RETURNING id",
        [randomUUID(), childId, config.name],
      );
      for (const a of DEVICE_PICTOGRAM_ASSETS) {
        await db.query(
          "INSERT INTO pictograms(id,student_profile_id,label,message,category,color_tone,icon_name,image_path,position) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
          [
            randomUUID(),
            profile.rows[0].id,
            a.label,
            a.message,
            a.category,
            a.colorTone,
            a.iconName,
            a.imagePath,
            a.position,
          ],
        );
      }
      // Initial private test team explicitly authorized by the owner. Later additions use normal approvals.
      for (const a of accounts)
        await db.query(
          "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at) VALUES($1,$2,$3,NOW())",
          [a.id, childId, a.role],
        );
    }
    const profileId = profile.rows[0].id;
    const current = hardware.rows[0];
    if (!created && current.student_profile_id !== profileId)
      throw new Error(
        "Device assignment changed since provisioning; no automatic reassignment.",
      );
    if (created)
      await db.query(
        "UPDATE devices SET student_profile_id=$2,power_source='usb',status='offline',last_sync_at=NULL,updated_at=NOW() WHERE id=$1",
        [current.id, profileId],
      );
    // Historical events retain their original profile. No activity, reports or diagnosis are fabricated.
    await db.query("COMMIT");
    return {
      profileId,
      childId,
      deviceId: current.id,
      previousProfileId: current.student_profile_id,
      accounts,
      created,
    };
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
}
