import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { canReadSensitive, isAdultRole } from "@/lib/permissions";
import type { PortalData, ChildDetail } from "@/types/portal";
import type { AuthTokenPayload } from "./auth";
import { ForbiddenError } from "./access";
import { query, transaction } from "./db";
import { getStcsOverview } from "./stcsData";
import { InputValidationError } from "./validation";
import { objectInput } from "./inputs";

const uuid = (value: unknown) => {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
  )
    throw new InputValidationError("Identificador inválido.");
  return value;
};
const text = (value: unknown, max: number, required = false): string => {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new InputValidationError("Revisa los campos y su longitud.");
  return value.trim();
};

export async function getPortal(user: AuthTokenPayload): Promise<PortalData> {
  if (!isAdultRole(user.role)) throw new ForbiddenError();
  const settings = await query(
    "SELECT app_title, support_email FROM app_settings WHERE id=TRUE",
  );
  // SQL projections are deliberate: names never leave the server for administrators.
  const profiles =
    user.role === "admin"
      ? await query(
          "SELECT id,public_number FROM student_profiles ORDER BY public_number",
        )
      : await query(
          `SELECT sp.id,sp.public_number,
        CASE WHEN $2='teacher' THEN split_part(sp.display_name,' ',1) ELSE u.full_name END AS label
        FROM student_profiles sp JOIN users u ON u.id=sp.child_user_id
        JOIN user_access ua ON ua.subject_user_id=sp.child_user_id
        WHERE ua.actor_user_id=$1 AND ua.relationship=$2 AND ua.approved_at IS NOT NULL ORDER BY sp.public_number`,
          [user.sub, user.role],
        );
  const result: PortalData = {
    role: user.role,
    profiles: profiles.rows.map((p) => ({
      id: p.id,
      number: Number(p.public_number),
      label: user.role === "admin" ? `Usuario ${p.public_number}` : p.label,
    })),
    settings: {
      appTitle: settings.rows[0]?.app_title ?? "STCS",
      supportEmail: settings.rows[0]?.support_email ?? "",
    },
  };
  if (user.role === "admin") {
    const adults =
      await query(`SELECT u.id,u.full_name,u.email,u.role,u.is_active,
      COALESCE(array_agg(sp.id) FILTER (WHERE sp.id IS NOT NULL),'{}') AS profile_ids, COALESCE(array_agg(sp.id) FILTER (WHERE sp.id IS NOT NULL AND ua.approved_at IS NULL),'{}') AS pending_profile_ids
      FROM users u LEFT JOIN user_access ua ON ua.actor_user_id=u.id AND ua.relationship=u.role
      LEFT JOIN student_profiles sp ON sp.child_user_id=ua.subject_user_id
      WHERE u.role IN ('guardian','teacher','therapist','admin')
      GROUP BY u.id ORDER BY u.created_at,u.id`);
    result.users = adults.rows.map((u) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      active: u.is_active,
      profileIds: u.profile_ids,
      pendingProfileIds: u.pending_profile_ids,
    }));
    return result;
  }
  if (canReadSensitive(user.role)) {
    const pending = await query(
      `SELECT sp.id AS profile_id, sp.public_number, pending.actor_user_id,
      adult.full_name, adult.email, pending.relationship FROM user_access pending
      JOIN users adult ON adult.id=pending.actor_user_id AND adult.is_active=TRUE AND adult.role=pending.relationship AND adult.credential_verified_at IS NOT NULL
      JOIN student_profiles sp ON sp.child_user_id=pending.subject_user_id
      JOIN user_access own ON own.subject_user_id=pending.subject_user_id
      WHERE own.actor_user_id=$1 AND own.relationship=$2 AND own.approved_at IS NOT NULL
      AND pending.approved_at IS NULL AND pending.actor_user_id<>$1
      AND pending.relationship IN ('guardian','therapist')`,
      [user.sub, user.role],
    );
    result.pendingApprovals = pending.rows.map((p) => ({
      profileId: p.profile_id,
      number: Number(p.public_number),
      actorId: p.actor_user_id,
      name: p.full_name,
      email: p.email,
      role: p.relationship,
    }));
  }
  const selected = user.profileId ?? result.profiles[0]?.id;
  if (!selected) return result;
  const summary = result.profiles.find((p) => p.id === selected);
  if (!summary) throw new ForbiddenError();
  const detail: ChildDetail = { profile: summary, reports: [], pictograms: [] };
  const sensitive = canReadSensitive(user.role);
  const reports = await query(
    `SELECT r.id,r.created_at,u.full_name AS author,r.teacher_guidance
    ${sensitive ? ",r.diagnosis" : ""}
    FROM specialist_reports r JOIN users u ON u.id=r.author_user_id
    WHERE r.student_profile_id=$1 ${sensitive ? "" : "AND r.teacher_guidance <> ''"}
    ORDER BY r.created_at DESC LIMIT 50`,
    [selected],
  );
  detail.reports = reports.rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at.toISOString(),
    author: r.author,
    guidance: r.teacher_guidance,
    ...(sensitive ? { diagnosis: r.diagnosis } : {}),
  }));
  if (sensitive) {
    const p = await query(
      `SELECT sp.age,sp.support_level,sp.main_context,sp.sensitive_notes,u.full_name
      FROM student_profiles sp JOIN users u ON u.id=sp.child_user_id WHERE sp.id=$1`,
      [selected],
    );
    const row = p.rows[0];
    detail.profile = {
      ...summary,
      fullName: row.full_name,
      age: row.age,
      supportLevel: row.support_level,
      mainContext: row.main_context,
      notes: row.sensitive_notes,
    };
    // Some children may not have hardware yet. Their clinical file still remains usable.
    const device = await query(
      "SELECT 1 FROM devices WHERE student_profile_id=$1",
      [selected],
    );
    if (device.rowCount)
      detail.overview = await getStcsOverview({ ...user, profileId: selected });
  }
  const board = await query(
    `SELECT id,label,message,category,color_tone,icon_name,image_path,position FROM pictograms WHERE student_profile_id=$1 AND is_active=TRUE ORDER BY position,label`,
    [selected],
  );
  detail.pictograms = board.rows.map((p) => ({
    id: p.id,
    label: p.label,
    message: p.message,
    category: p.category,
    colorTone: p.color_tone,
    iconName: p.icon_name,
    imagePath: p.image_path,
    position: p.position,
  }));
  result.detail = detail;
  return result;
}

export async function mutatePortal(
  user: AuthTokenPayload,
  input: Record<string, unknown>,
) {
  input = objectInput(input);
  const action = input.action;
  if (action === "approval") {
    if (!canReadSensitive(user.role)) throw new ForbiddenError();
    const actorId = uuid(input.actorId),
      profileId = uuid(input.profileId);
    if (actorId === user.sub || typeof input.approve !== "boolean")
      throw new ForbiddenError();
    await transaction(async (c) => {
      // Lock assignments so a concurrent administrator edit cannot reuse an approval.
      await c.query("LOCK TABLE user_access IN SHARE ROW EXCLUSIVE MODE");
      const scope = await c.query(
        `SELECT sp.child_user_id FROM student_profiles sp JOIN user_access ua ON ua.subject_user_id=sp.child_user_id WHERE sp.id=$1 AND ua.actor_user_id=$2 AND ua.relationship=$3 AND ua.approved_at IS NOT NULL`,
        [profileId, user.sub, user.role],
      );
      if (!scope.rowCount) throw new ForbiddenError();
      if (input.approve) {
        const target = await c.query(
          "SELECT 1 FROM users WHERE id=$1 AND is_active=TRUE AND credential_verified_at IS NOT NULL AND role IN ('guardian','therapist')",
          [actorId],
        );
        if (!target.rowCount)
          throw new ForbiddenError(
            "El titular debe verificar su correo antes de aprobar la asignación.",
          );
      }
      if (input.approve)
        await c.query(
          `UPDATE user_access SET approved_at=NOW(),approved_by=$3 WHERE actor_user_id=$1 AND subject_user_id=$2 AND approved_at IS NULL AND relationship IN ('guardian','therapist')`,
          [actorId, scope.rows[0].child_user_id, user.sub],
        );
      else
        await c.query(
          `DELETE FROM user_access WHERE actor_user_id=$1 AND subject_user_id=$2 AND approved_at IS NULL`,
          [actorId, scope.rows[0].child_user_id],
        );
    });
    return;
  }
  if (action === "profile" || action === "report") {
    const profileId = uuid(input.profileId);
    const scope = await getPortal({ ...user, profileId });
    if (!scope.detail) throw new ForbiddenError();
    if (action === "profile") {
      if (user.role !== "guardian") throw new ForbiddenError();
      const name = text(input.fullName, 120, true),
        age = Number(input.age);
      if (!Number.isInteger(age) || age < 1 || age > 18)
        throw new InputValidationError("Edad entre 1 y 18 años.");
      const support = text(input.supportLevel, 120, true),
        context = text(input.mainContext, 80, true),
        notes = text(input.notes, 5000);
      await transaction(async (c) => {
        const p = await c.query(
          `UPDATE student_profiles SET display_name=$2,age=$3,support_level=$4,main_context=$5,sensitive_notes=$6,updated_at=NOW() WHERE id=$1 RETURNING child_user_id`,
          [profileId, name, age, support, context, notes],
        );
        await c.query(
          "UPDATE users SET full_name=$2,updated_at=NOW() WHERE id=$1",
          [p.rows[0].child_user_id, name],
        );
      });
    } else {
      if (user.role !== "therapist") throw new ForbiddenError();
      await query(
        `INSERT INTO specialist_reports(id,student_profile_id,author_user_id,diagnosis,teacher_guidance,request_id) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (author_user_id,request_id) WHERE request_id IS NOT NULL DO NOTHING`,
        [
          randomUUID(),
          profileId,
          user.sub,
          text(input.diagnosis, 10000, true),
          text(input.guidance, 3000),
          uuid(input.requestId),
        ],
      );
    }
    return;
  }
  if (user.role !== "admin") throw new ForbiddenError();
  if (action === "settings") {
    const email = text(input.supportEmail, 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new InputValidationError("Correo inválido.");
    await query(
      "UPDATE app_settings SET app_title=$1,support_email=$2,updated_at=NOW() WHERE id=TRUE",
      [text(input.appTitle, 80, true), email],
    );
    return;
  }
  if (action !== "user") throw new InputValidationError("Acción inválida.");
  const id = input.id ? uuid(input.id) : randomUUID();
  const name = text(input.fullName, 120, true),
    email = text(input.email, 120, true).toLowerCase();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !isAdultRole(String(input.role))
  )
    throw new InputValidationError("Correo o rol inválido.");
  const role = String(input.role),
    active = input.active;
  if (typeof active !== "boolean")
    throw new InputValidationError("Estado inválido.");
  if (id === user.sub && (role !== "admin" || !active))
    throw new ForbiddenError(
      "No puedes desactivar tu propia cuenta administrativa.",
    );
  if (!Array.isArray(input.profileIds) || input.profileIds.length > 200)
    throw new InputValidationError("Asignaciones inválidas.");
  const ids = [...new Set(input.profileIds.map(uuid))];
  if (
    (role === "guardian" && ids.length > 1) ||
    (role === "admin" && ids.length)
  )
    throw new InputValidationError(
      "Apoderado: máximo un niño. Administrador: sin acceso a niños.",
    );
  if (input.password !== undefined)
    throw new ForbiddenError(
      "Las contraseñas se establecen verificando el correo del titular.",
    );
  const passwordHash = input.id
    ? undefined
    : await bcrypt.hash(randomUUID() + randomUUID(), 12);
  await transaction(async (c) => {
    // Serialize account changes so simultaneous edits cannot remove the last administrator.
    await c.query("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
    await c.query("LOCK TABLE user_access IN SHARE ROW EXCLUSIVE MODE");
    const previous = await c.query(
      "SELECT subject_user_id,relationship,approved_at,approved_by FROM user_access WHERE actor_user_id=$1",
      [id],
    );
    if (input.id) {
      const old = await c.query(
        "SELECT role,email FROM users WHERE id=$1 AND role IN ('admin','guardian','teacher','therapist')",
        [id],
      );
      if (!old.rowCount)
        throw new InputValidationError("Cuenta no encontrada.");
      if (old.rows[0].email !== email)
        throw new ForbiddenError(
          "El administrador no puede cambiar el correo de una cuenta existente.",
        );
      if (old.rows[0].role === "admin" && (role !== "admin" || !active)) {
        const others = await c.query(
          "SELECT 1 FROM users WHERE role='admin' AND is_active=TRUE AND id<>$1",
          [id],
        );
        if (!others.rowCount)
          throw new ForbiddenError(
            "Debe existir al menos un administrador activo.",
          );
      }
      await c.query(
        "UPDATE users SET full_name=$2,email=$3,role=$4,is_active=$5,updated_at=NOW() WHERE id=$1",
        [id, name, email, role, active],
      );
      await c.query(
        "UPDATE app_sessions SET revoked_at=NOW() WHERE user_id=$1",
        [id],
      );
    } else
      await c.query(
        "INSERT INTO users(id,full_name,email,password_hash,role,is_active) VALUES($1,$2,$3,$4,$5,$6)",
        [id, name, email, passwordHash, role, active],
      );
    await c.query("DELETE FROM user_access WHERE actor_user_id=$1", [id]);
    for (const profileId of ids) {
      const p = await c.query(
        "SELECT child_user_id FROM student_profiles WHERE id=$1",
        [profileId],
      );
      if (!p.rowCount) throw new InputValidationError("Perfil no encontrado.");
      const existing = previous.rows.find(
        (a) =>
          a.subject_user_id === p.rows[0].child_user_id &&
          a.relationship === role,
      );
      await c.query(
        "INSERT INTO user_access(actor_user_id,subject_user_id,relationship,approved_at,approved_by) VALUES($1,$2,$3,$4,$5)",
        [
          id,
          p.rows[0].child_user_id,
          role,
          existing?.approved_at ?? (role === "teacher" ? new Date() : null),
          existing?.approved_by ?? null,
        ],
      );
    }
  });
}
