import Request  from "supertest";
import app from "../index";

let token: string;
let anotherToken: string;

beforeAll(async () => {
    // lue testikäyttäjä ja kirjautuminen
    await Request(app).post("/api/user/signup").send({
        username: "secureuser",
        email: "secure@example.com",
        password: "secure123",
        confirm_password: "secure123",
        user_level: "Customer",
    });
    const res2 = await Request(app).post("/api/user/login").send({
        name: "otheruser",
        password : "other123",
    });
    anotherToken = res2.body.token;
});

describe("Security Tests", () => {
    it("should return 401 for unauthorized access", async () => {
        const res = await Request(app).get("/api/user/profile");
        expect(res.status).toBe(401); // Unauthorized
    });
    it("should return 403 for forbidden access", async () => {
        const res = await Request(app).get("/api/user/profile").set("Authorization", `Bearer ${anotherToken}`);
        expect(res.status).toBe(403); 
        expect(res.body.error).not.toHaveProperty("password"); // Ensure password is not exposed
    });
    it("should return 200 for authorized access", async () => {
        const res = await Request(app).delete("/api/user/me").set("Authorization", `Bearer ${anotherToken}`);
        expect(res.status).toBe(200); // OK
    });
});