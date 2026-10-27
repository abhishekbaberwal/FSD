const fs = require("fs");
const os = require("os");
const path = require("path");
const { createStore, SEED_JOBS } = require("../backend/lib/store");

const CATEGORIES = ["Web Development", "Software Development", "Data Science", "UI/UX Design", "Cyber Security", "Digital Marketing"];
const TYPES = ["Internship", "Full-time", "Part-time"];

function tmpStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sj-store-"));
  return { dir, store: createStore(dir) };
}

describe("seed jobs", () => {
  test("there are 10 well-formed jobs with unique ids", () => {
    expect(SEED_JOBS).toHaveLength(10);
    expect(new Set(SEED_JOBS.map((j) => j.id)).size).toBe(10);
    for (const j of SEED_JOBS) {
      for (const key of ["title", "company", "location", "type", "salary", "experience", "category", "description"]) {
        expect(typeof j[key]).toBe("string");
        expect(j[key].length).toBeGreaterThan(0);
      }
      expect(j.skills.length).toBeGreaterThan(0);
      expect(j.responsibilities.length).toBeGreaterThan(0);
      expect(j.requirements.length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(j.category);
      expect(TYPES).toContain(j.type);
    }
  });

  test("every category and job type on the filter form has at least one job", () => {
    for (const c of CATEGORIES) expect(SEED_JOBS.some((j) => j.category === c)).toBe(true);
    for (const t of TYPES) expect(SEED_JOBS.some((j) => j.type === t)).toBe(true);
  });
});

describe("store filtering", () => {
  test("combines filters and matches skills, case-insensitively", () => {
    const { dir, store } = tmpStore();
    expect(store.listJobs()).toHaveLength(10);
    expect(store.listJobs({ search: "FIGMA" }).map((j) => j.id)).toEqual([4]);
    expect(store.listJobs({ category: "Data Science", type: "Internship" })).toHaveLength(2);
    expect(store.listJobs({ location: "jaipur" }).length).toBeGreaterThanOrEqual(3);
    expect(store.listJobs({ search: "nothing-matches-this" })).toHaveLength(0);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("experience filter treats en dash and hyphen the same", () => {
    const { dir, store } = tmpStore();
    expect(store.listJobs({ experience: "0–1 Years" }).length).toBeGreaterThan(0);
    expect(store.listJobs({ experience: "0-1 years" })).toEqual(store.listJobs({ experience: "0–1 Years" }));
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test("data persists across store instances", () => {
    const { dir, store } = tmpStore();
    const user = store.createUser({ name: "A B", email: "A@B.com", passwordHash: "x", role: "student" });
    store.createApplication(user.id, 1);
    const reopened = createStore(dir);
    expect(reopened.findUserByEmail("a@b.com").id).toBe(user.id);
    expect(reopened.listApplications(user.id)).toHaveLength(1);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
