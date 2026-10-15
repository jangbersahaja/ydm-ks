import { saveSettingsAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/action-form";
import { Field } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import {
  buttonClass,
  cardClass,
  inputClass,
  sectionTitleClass,
} from "@/components/ui";
import { getSettings } from "@/lib/config";
import { getTaskDefinitions } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import { taskTitle } from "@/lib/labels";

export const instant = false;

export default async function AdminSettingsPage() {
  const { t } = await getT();
  const [settings, defs] = await Promise.all([
    getSettings(),
    getTaskDefinitions(),
  ]);

  const outletNames = [...new Set(defs.map((def) => def.outletName))];

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {t.admin.settingsTitle}
      </h1>

      <ActionForm action={saveSettingsAction} className="space-y-6">
        <section className={`${cardClass} space-y-4`}>
          <Field label={t.admin.pointsPerRinggit}>
            <input
              name="pointsPerRinggit"
              type="number"
              min={0}
              max={100}
              defaultValue={settings.pointsPerRinggit}
              required
              className={inputClass}
            />
          </Field>
          <Field label={t.admin.firstPurchaseBonus}>
            <input
              name="firstPurchaseBonusPoints"
              type="number"
              min={0}
              max={100}
              defaultValue={settings.firstPurchaseBonusPoints}
              required
              className={inputClass}
            />
          </Field>
        </section>

        <section className={`${cardClass} space-y-4`}>
          <h2 className={sectionTitleClass}>{t.admin.taskPoints}</h2>
          {outletNames.map((outletName) => (
            <div key={outletName} className="space-y-3">
              <h3 className="text-sm font-semibold text-espresso/70">
                {outletName}
              </h3>
              {defs
                .filter((def) => def.outletName === outletName)
                .map((def) => (
                  <Field key={def.id} label={taskTitle(def.kind, t)}>
                    <input
                      name={`task_points_${def.id}`}
                      type="number"
                      min={0}
                      defaultValue={def.points}
                      required
                      className={inputClass}
                    />
                  </Field>
                ))}
            </div>
          ))}
        </section>

        <SubmitButton className={`${buttonClass("primary")} w-full`}>
          {t.admin.save}
        </SubmitButton>
      </ActionForm>
    </div>
  );
}
