import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

const TOKEN_KEY = 'startkit-auth-token';
const USER_KEY = 'startkit-auth-user';

export interface AuthUser {
  login: string;
  nom?: string;
  email?: string;
}

export interface JwtResponse {
  username: string;
  token: string;
  type?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token = signal<string | null>(this.getStoredToken());
  private user = signal<AuthUser | null>(this.getStoredUser());

  isLoggedIn = computed(() => !!this.token());
  currentUser = computed(() => this.user());

  constructor(
    private router: Router,
    private http: HttpClient,
    private api: ApiService
  ) {}

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.token();
  }

  login(login: string, password: string): Promise<{ success: boolean; message?: string }> {
    const loginTrim = login?.trim() ?? '';
    if (!loginTrim) {
      return Promise.resolve({ success: false, message: 'Identifiant requis' });
    }

    return firstValueFrom(
      this.http
        .post<ApiResponse<JwtResponse>>(`${this.api.baseUrl}/auth/login`, {
          login: loginTrim,
          password
        })
        .pipe(
          catchError((err) => {
            const msg = err.error?.message ?? err.message ?? 'Identifiant ou mot de passe incorrect.';
            return of({ success: false, data: undefined, message: msg });
          })
        )
    ).then((res) => {
      if (!res.success || !res.data) {
        return { success: false, message: res.message ?? 'Identifiant ou mot de passe incorrect.' };
      }
      const jwt = res.data;
      try {
        localStorage.setItem(TOKEN_KEY, jwt.token);
        const user: AuthUser = {
          login: jwt.username,
          nom: jwt.username,
          email: jwt.username
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.token.set(jwt.token);
        this.user.set(user);
        return { success: true };
      } catch {
        return { success: false, message: 'Erreur de stockage' };
      }
    });
  }

  logout(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/auth']);
  }
}
