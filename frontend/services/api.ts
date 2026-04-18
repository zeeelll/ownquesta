// Prefer the same URL used for auth/session so cookies stay valid.
const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function api(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      credentials: "include" // ✅ important for cookies/session
    });

    // Handle different response types
    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      // For non-JSON responses (like 401, 403, etc.)
      const text = await res.text();
      data = text ? { message: text } : {};
    }

    if (!res.ok) {
      // Provide clear error message based on status code
      if (res.status === 401) {
        throw new Error("Unauthorized");
      } else if (res.status === 403) {
        throw new Error("Forbidden");
      } else if (res.status === 404) {
        throw new Error("Not Found");
      } else {
        throw new Error(data.message || `API Error: ${res.status}`);
      }
    }

    return data;
  } catch (error: any) {
    // Network errors or fetch failures
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      throw error; // Re-throw auth errors as-is
    }
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Backend server is not responding. Make sure it's running on " + BASE);
    }
    throw error;
  }
}

// Test endpoint
export async function testHelloAPI() {
  return api("/hello");
}

// Admin API functions
export async function getAllUsers() {
  return api("/api/admin/users");
}

export async function getUserById(id: string) {
  return api(`/api/admin/users/${id}`);
}

export async function updateUser(id: string, userData: any) {
  return api(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData)
  });
}

export async function deleteUser(id: string) {
  return api(`/api/admin/users/${id}`, {
    method: "DELETE"
  });
}

export async function makeUserAdmin(id: string) {
  return api(`/api/admin/users/${id}/make-admin`, {
    method: "PUT"
  });
}

export async function removeUserAdmin(id: string) {
  return api(`/api/admin/users/${id}/remove-admin`, {
    method: "PUT"
  });
}

// Admin registration
export async function registerAdmin(adminData: { name: string; email: string; password: string }) {
  return api("/api/admin/register-admin", {
    method: "POST",
    body: JSON.stringify(adminData)
  });
}

// User registration (for admins to create regular users)
export async function registerUser(userData: { name: string; email: string; password: string }) {
  return api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData)
  });
}

// Activity tracking
export async function getUserActivities(userId: string) {
  return api(`/api/admin/users/${userId}/activities`);
}

export async function getMyActivities(limit?: number) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  const query = params.toString();
  return api(`/api/user/activities${query ? `?${query}` : ''}`);
}

export async function getCurrentUser() {
  return api('/api/auth/me');
}

export async function upgradeMembership(payload: {
  plan?: string;
  amountInr?: number;
  customerName?: string;
  customerEmail?: string;
  sessionId?: string;
  modelName?: string;
  paymentMethod?: string;
  gateway?: string;
  paymentReference?: string;
  transactionId?: string;
  payerUpiId?: string;
  paymentTime?: string;
  paymentScreenshot?: {
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
  };
  orderId?: string;
}) {
  return api('/api/user/membership/upgrade', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function trackUserActivity(action: string, description: string, metadata: Record<string, any> = {}) {
  return api('/api/user/activity', {
    method: 'POST',
    body: JSON.stringify({ action, description, metadata })
  });
}

export async function getAllActivities(limit?: number, skip?: number) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (skip) params.append('skip', skip.toString());
  return api(`/api/admin/activities?${params.toString()}`);
}

export async function getMyDownloads() {
  return api('/api/user/downloads');
}

export async function trackDownloadAccess(payload: {
  sessionId?: string;
  orderId?: string;
  modelName?: string;
  productType: 'model' | 'py' | 'ipynb' | 'other';
  fileName?: string;
  source?: string;
  accessType: 'free' | 'paid';
  amountInr?: number;
  metadata?: Record<string, any>;
}) {
  return api('/api/user/downloads/track', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyDeployments() {
  return api('/api/user/deployments');
}

export async function provisionMyDeployment(payload: {
  paymentOrderId: string;
  sessionId?: string;
  modelName?: string;
}) {
  return api('/api/user/deployments/provision', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function scaleMyDeployment(id: string, replicas: number) {
  return api(`/api/user/deployments/${id}/scale`, {
    method: 'PATCH',
    body: JSON.stringify({ replicas }),
  });
}

export async function getAdminHelpTickets(limit?: number, status?: string, search?: string) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (status && status !== 'all') params.append('status', status);
  if (search?.trim()) params.append('search', search.trim());
  const query = params.toString();
  return api(`/api/admin/help-tickets${query ? `?${query}` : ''}`);
}

// Admin project APIs
export async function getAdminProjects(limit?: number, stage?: string, search?: string) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (stage && stage !== 'all') params.append('stage', stage);
  if (search?.trim()) params.append('search', search.trim());
  const query = params.toString();
  return api(`/api/admin/projects${query ? `?${query}` : ''}`);
}

export async function getAdminProjectStats() {
  return api('/api/admin/projects/stats');
}

export async function getAdminPayments(limit?: number, status?: string, productType?: string, search?: string) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (status && status !== 'all') params.append('status', status);
  if (productType && productType !== 'all') params.append('productType', productType);
  if (search?.trim()) params.append('search', search.trim());
  const query = params.toString();
  return api(`/api/admin/payments${query ? `?${query}` : ''}`);
}

export async function getUserProjectsForAdmin(userId: string) {
  return api(`/api/admin/users/${userId}/projects`);
}

// Subscription APIs
export async function submitSubscription(payload: {
  planType: 'plan_750' | 'plan_1399';
  customerName?: string;
  customerEmail?: string;
  transactionId: string;
  payerUpiId?: string;
  paymentTime?: string;
  paymentScreenshot?: { fileName?: string; mimeType?: string; dataUrl?: string };
}) {
  return api('/api/user/subscription/submit', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getSubscriptionStatus() {
  return api('/api/user/subscription/status');
}

export async function getAdminSubscriptionPayments(status?: string) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  const q = params.toString();
  return api(`/api/admin/payments/subscriptions${q ? `?${q}` : ''}`);
}

export async function approveSubscriptionPayment(id: string) {
  return api(`/api/admin/payments/${id}/approve`, { method: 'PUT' });
}

export async function rejectSubscriptionPayment(id: string) {
  return api(`/api/admin/payments/${id}/reject`, { method: 'PUT' });
}

// Gen agent (explain) — proxies to backend /api/gen/explain
export async function explainModelViaGen(best_model: any, eda_result?: any, goal?: any, processed_sample?: any, model_summaries?: any) {
  return api('/api/gen/explain', {
    method: 'POST',
    body: JSON.stringify({ best_model, eda_result, goal, processed_sample, model_summaries })
  });
}
