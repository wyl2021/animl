const API_BASE_URL = 'http://localhost:3000/api';
const UPLOADS_BASE_URL = 'http://localhost:3000/uploads';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  let headers = {
    ...defaultHeaders,
    ...options.headers
  };

  // 检查body是否为FormData类型，如果是，删除Content-Type头部
  if (options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      if (endpoint !== '/login' && endpoint !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('认证失败，请重新登录');
      } else {
        throw new Error('账号或密码错误');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

export { API_BASE_URL, UPLOADS_BASE_URL, request, getToken };
