import { getSupabase, isSupabaseEnabled } from "@/services/supabaseClient";
import { listJobs, type StoredJob } from "@/services/jobs";
import { listCustomers, type Customer } from "@/services/customers";
import { listProjects, type Project } from "@/services/projects";

export type MigrationReport = {
  enabled: boolean;
  migrated: { jobs: number; customers: number; projects: number };
  errors: string[];
};

export async function migrateLocalDataToSupabase(): Promise<MigrationReport> {
  const report: MigrationReport = { enabled: isSupabaseEnabled(), migrated: { jobs: 0, customers: 0, projects: 0 }, errors: [] };
  if (!report.enabled) return report;
  const supabase = await getSupabase();
  if (!supabase) return report;

  // Jobs
  try {
    const jobs = listJobs();
    if (jobs.length) {
      const payload = jobs.map((j: StoredJob) => ({
        id: j.id,
        name: j.name,
        address: j.address,
        service_type: j.serviceType,
        params: j.params,
        created_at: new Date(j.createdAt).toISOString(),
        updated_at: new Date(j.updatedAt).toISOString(),
      }));
      const { error } = await supabase.from("jobs_estimator").upsert(payload);
      if (error) report.errors.push(`jobs_estimator: ${error.message}`);
      else report.migrated.jobs = payload.length;
    }
  } catch (e: any) {
    report.errors.push(`jobs: ${e?.message || String(e)}`);
  }

  // Customers
  try {
    const customers = listCustomers();
    if (customers.length) {
      const payload = customers.map((c: Customer) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        notes: c.notes ?? "",
        created_at: new Date(c.createdAt).toISOString(),
        updated_at: new Date(c.updatedAt).toISOString(),
      }));
      const { error } = await supabase.from("customers").upsert(payload);
      if (error) report.errors.push(`customers: ${error.message}`);
      else report.migrated.customers = payload.length;
    }
  } catch (e: any) {
    report.errors.push(`customers: ${e?.message || String(e)}`);
  }

  // Projects
  try {
    const projects = listProjects();
    if (projects.length) {
      const payload = projects.map((p: Project) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        status: p.status,
        service_type: p.serviceType,
        estimate: p.estimate,
        change_orders: p.changeOrders ?? [],
        created_at: new Date(p.createdAt).toISOString(),
        updated_at: new Date(p.updatedAt).toISOString(),
      }));
      const { error } = await supabase.from("projects").upsert(payload);
      if (error) report.errors.push(`projects: ${error.message}`);
      else report.migrated.projects = payload.length;
    }
  } catch (e: any) {
    report.errors.push(`projects: ${e?.message || String(e)}`);
  }

  return report;
}

