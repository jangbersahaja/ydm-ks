import { Badge } from "@/components/brand/badge";
import { ListGroup, ListRow } from "@/components/brand/list-row";
import { ProgressBar } from "@/components/brand/progress-bar";
import { SectionHeader } from "@/components/brand/section-header";
import { TaskLink } from "@/components/task-link";
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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {t.tasks.title}
        </h1>
        <p className="text-sm text-muted">{t.tasks.body}</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
          <span>{t.tasks.summary(doneCount, totalCount)}</span>
          <span className="text-roast">{t.tasks.pointsLeft(pointsLeft)}</span>
        </div>
        <ProgressBar
          percent={percent}
          label={t.tasks.summary(doneCount, totalCount)}
        />
      </section>

      {[...outlets.values()].map((group) => (
        <section key={group.name} className="space-y-2">
          <SectionHeader title={group.name} />
          <ListGroup>
            {group.tasks.map((task) => (
              <ListRow
                key={task.id}
                trailing={
                  <TaskLink
                    taskId={task.id}
                    url={task.url}
                    done={task.done}
                    openLabel={t.tasks.open}
                    doneLabel={t.tasks.done}
                  />
                }
              >
                <p className="font-semibold">{taskTitle(task.kind, t)}</p>
                <p className="text-sm font-semibold text-roast">
                  {t.tasks.points(task.points)}
                </p>
              </ListRow>
            ))}
          </ListGroup>
        </section>
      ))}

      <section className="space-y-2 opacity-70">
        <SectionHeader
          title={t.tasks.surveyTitle}
          action={<Badge>{t.tasks.comingSoon}</Badge>}
        />
        <p className="text-sm text-muted">{t.tasks.surveyBody}</p>
      </section>
    </div>
  );
}
