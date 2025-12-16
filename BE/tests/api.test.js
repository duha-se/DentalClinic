const request = require('supertest');
const app = require('../src/app');
const { getPool } = require('../db');

let token;
let appointmentId;

beforeAll(async () => {
  const pool = await getPool();
  await pool.query('DELETE FROM appointments');
  await pool.query('DELETE FROM users');

  await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '1234567890',
    password: 'password',
    confirmPassword: 'password'
  });

  // 3️⃣ تسجيل الدخول وأخذ التوكن
  const res = await request(app).post('/api/auth/login').send({
    email: 'testuser@example.com',
    password: 'password'
  });

  token = res.body.data.token;
});

describe('Appointments API', () => {

  it('should get available slots for today', async () => {
    const today = new Date().toISOString().split('T')[0];

    const res = await request(app)
      .get(`/api/appointments/available-slots/${today}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should book an appointment', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dateStr = date.toISOString().split('T')[0];

    const res = await request(app)
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${token}`)
      .send({
        service_id: 1,
        appointment_date: dateStr,
        appointment_time: '09:00'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    appointmentId = res.body.data.id;
  });

  it('should fetch user appointments', async () => {
    const res = await request(app)
      .get('/api/appointments/my-appointments')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should cancel appointment', async () => {
    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});

afterAll(async () => {
  const pool = await getPool();
  await pool.end();
});