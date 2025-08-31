import request from "supertest";
import app from "../index";
import pool from "../database/db";

let token: string;

beforeAll(async () => {
  await request(app).post("/api/user/signup").send({
    name: "bmitester",
    email: "bmi@example.com",
    password: "testpass123",
    confirm_password: "testpass123",
    user_level: "Customer",
  });

  const res = await request(app).post("/api/user/login").send({
    name_email: "bmi@example.com",
    password: "testpass123",
  });

  token = res.body.token;
});

describe("📏 BMI API TESTS", () => {
  let createdId: number;

  it("✅ POST /api/bmi - luo uuden BMI-merkinnän", async () => {
    const res = await request(app)
      .post("/api/bmi")
      .set("Authorization", `Bearer ${token}`)
      .send({ weight: 70, height: 175 });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("BMI record created successfully");
  });

  it("✅ GET /api/bmi - hakee kaikki BMI:t", async () => {
    const res = await request(app)
      .get("/api/bmi")
      .set("Authorization", `Bearer ${token}`);

    console.log("GET ALL BMI response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    createdId = res.body[0].id;
  });

  it("✅ GET /api/bmi/latest - hakee viimeisimmän BMI:n", async () => {
    const res = await request(app)
      .get("/api/bmi/latest")
      .set("Authorization", `Bearer ${token}`);

    console.log("Latest BMI response:", res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("bmi_value");
  });

  it("✅ DELETE /api/bmi/:id - poistaa BMI-merkinnän", async () => {
    expect(createdId).toBeDefined();
    const res = await request(app)
      .delete(`/api/bmi/${createdId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("BMI entry deleted");
  });
});

afterAll(async () => {
  const conn = await pool.getConnection();
  await conn.end();
});
