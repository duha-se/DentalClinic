import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===========================
   Request Interceptor (JWT)
=========================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===========================
   Response Interceptor
=========================== */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

/* ===========================
   API METHODS
=========================== */
class ApiService {
  register(userData) {
    return api.post("/auth/register", userData);
  }

  login(credentials) {
    return api.post("/auth/login", credentials);
  }

  getProfile() {
    return api.get("/auth/profile");
  }

  getOverview() {
    return api.get("/auth/overview");
  }

  updateProfile(profileData) {
    return api.put("/auth/profile", profileData);
  }

  changePassword(passwordData) {
    return api.post("/auth/change-password", passwordData);
  }

  getServices() {
    return api.get("/services");
  }

  getService(id) {
    return api.get(`/services/${id}`);
  }

  getAvailableSlots(date) {
    return api.get(`/appointments/available-slots/${date}`);
  }

  bookAppointment(appointmentData) {
    return api.post("/appointments/book", appointmentData);
  }

  async getMyAppointments() {
    const response = await api.get("/appointments/my-appointments");
    // Remove duplicates based on appointment ID
    if (response && response.data && Array.isArray(response.data)) {
      const uniqueAppointments = Array.from(
        new Map(response.data.map(apt => [apt.id, apt])).values()
      );
      return {
        ...response,
        data: uniqueAppointments
      };
    }
    return response;
  }

  getAppointment(id) {
    return api.get(`/appointments/${id}`);
  }

  cancelAppointment(id) {
    return api.put(`/appointments/${id}/cancel`);
  }

  rescheduleAppointment(id, appointmentData) {
    return api.put(
      `/appointments/${id}/reschedule`,
      appointmentData
    );
  }

  getMyInvoices() {
    return api.get("/invoices/my-invoices");
  }

  getInvoice(id) {
    return api.get(`/invoices/${id}`);
  }

  payInvoice(id) {
    return api.put(`/invoices/${id}/pay`);
  }

  getInvoiceStats() {
    return api.get("/invoices/summary/stats");
  }
}

export default new ApiService();