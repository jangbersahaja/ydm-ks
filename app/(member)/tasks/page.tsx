import { TaskLink } from "@/components/task-link";
import { cardClass, sectionTitleClass } from "@/components/ui";
import { getTasksWithStatus } from "@/lib/db/queries";
import { getT } from "@/lib/i18n";
import { taskTitle } from "@/lib/labels";
import { requireCustomerId } from "@/lib/session";

export const instant = false;

type TaskRow = Awaited<ReturnType<typeof getTasksWithStatus>>[number];

export default async function TasksPage() {
  const customerId = await requireCustomerId();
  const { t } = await getT();
  const tasks = await getTasksWithStatus(customerId);

  const doneCount = tasks.filter((task) => task.done).length;
  const totalCount = tasks.length;
  const pointsLeft = tasks
    .filter((task) => !task.done)
    .reduce((sum, task) => sum + task.points, 0);
  const percent =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const outlets = new Map<number, { name: string; tasks: TaskRow[] }>();
  for (const task of tasks) {
    const group = outlets.get(task.outletId) ?? {
      name: task.outletName,
      tasks: [],
    };
    group.tasks.push(task);
    outlets.set(task.outletId, group);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.tasks.title}</h1>
        <p className="mt-1 text-sm text-espresso/70">{t.tasks.body}</p>
      </div>

      <section className={`${cardClass} space-y-3`}>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{t.tasks.summary(doneCount, totalCount)}</span>
          <span className="text-roast">{t.tasks.pointsLeft(pointsLeft)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-espresso/10">
          <div
            className="h-full rounded-full bg-roast transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      {[...outlets.values()].map((group) => (
        <section key={group.name} className="space-y-3">
          <h2 className={sectionTitleClass}>{group.name}</h2>
          <ul className="space-y-3">
            {group.tasks.map((task) => (
              <li key={task.id} className={cardClass}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{taskTitle(task.kind, t)}</p>
                    <p className="mt-1 text-sm font-semibold text-roast">
                      {t.tasks.points(task.points)}
                    </p>
                  </div>
                  <TaskLink
                    taskId={task.id}
                    url={task.url}
                    done={task.done}
                    openLabel={t.tasks.open}
                    doneLabel={t.tasks.done}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className={`${cardClass} opacity-70`}>
        <h2 className={sectionTitleClass}>{t.tasks.surveyTitle}</h2>
        <p className="mt-1 text-sm text-espresso/70">{t.tasks.surveyBody}</p>
        <span className="mt-4 inline-block rounded-full bg-espresso/5 px-4 py-2 text-xs font-semibold text-espresso/60">
          {t.tasks.comingSoon}
        </span>
      </section>
    </div>
  );
}
