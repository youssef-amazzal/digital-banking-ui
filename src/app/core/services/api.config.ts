import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiUrl || 'http://localhost:8080/api/v1';
export const AUTH_API_BASE_URL = environment.authApiUrl || 'http://localhost:8080/api';
