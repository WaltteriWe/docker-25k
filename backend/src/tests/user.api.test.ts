import request from 'supertest';
import app from '../index';

let token: string;

beforeAll(async () => {
  // Create and login user to get token
  await request(app).post('/api/user/signup').send({
    name: 'apitester',
    email: 'apitest@example.com',
    password: 'testpass123',
    confirm_password: 'testpass123',
    user_level: 'Customer'
  });

  const res = await request(app).post('/api/user/login').send({
    name_email: 'apitest@example.com',
    password: 'testpass123'
  });

  token = res.body.token;
});

describe('🧪 USER API TESTS', () => {
  it('✅ GET /api/user/profile - palauttaa profiilin', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('username');
    expect(res.body.user).toHaveProperty('email');
  });

  it('✅ PUT /api/user/me - päivittää käyttäjän tiedot', async () => {
    const res = await request(app)
      .put('/api/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'apitester_update', email: 'updated@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User information updated successfully');
  });

  it('✅ DELETE /api/user/me - poistaa käyttäjän', async () => {
    const res = await request(app)
      .delete('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('User account deleted successfully');
  });
});
