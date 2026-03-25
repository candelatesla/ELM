import { domainConfigs } from "@/lib/forms";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-mist px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="panel p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Config Preview</p>
          <h1 className="mt-2 text-3xl font-semibold">Form admin preview</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            This route reads the same config used by the intake UI. To add or edit forms later, update
            <code className="ml-1 rounded bg-slate-100 px-2 py-1 text-xs">lib/forms.ts</code> instead of rewriting the rendering logic.
          </p>
        </section>

        <div className="grid gap-6">
          {domainConfigs.map((domain) => (
            <section key={domain.id} className="panel p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">{domain.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{domain.shortDescription}</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-3 font-semibold">Snapshot Skills</h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    {domain.skills.map((skill) => (
                      <li key={skill.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="font-semibold text-slate-800">{skill.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{skill.id}</p>
                        {skill.groupTitle ? (
                          <p className="mt-2 text-xs text-slate-500">
                            Group: {skill.groupTitle}{skill.groupNote ? ` • ${skill.groupNote}` : ""}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-500">
                          Fields: {(skill.fields ?? []).map((field) => field.label).join(", ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-3 font-semibold">Assessments</h3>
                  {domain.assessments?.length ? (
                    <ul className="space-y-3 text-sm text-slate-600">
                      {domain.assessments.map((assessment) => (
                        <li key={assessment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="font-semibold text-slate-800">{assessment.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Week {assessment.week} • {assessment.id}
                          </p>
                          <p className="mt-2 text-xs text-slate-500">
                            Fields: {assessment.fields.map((field) => field.label).join(", ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No week-specific assessments configured yet.</p>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
