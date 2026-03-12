import { computed, inject, Injectable, signal } from '@angular/core';
import {
  FullUserData,
  LoginForm,
  ProfileInsert,
  ProfileUpdate,
  RegisterForm,
} from '../Models/auth';
import { SubabaseService } from '../core/subabase.service';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import {
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
  User,
} from '@supabase/supabase-js';

// ─── Constants ───────────────────────────────────
const TOKEN_KEY = 'realty_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SubabaseService);

  // ─── State ───────────────────────────────────────
  private _user = signal<FullUserData | null>(null);
  private _token = signal<string | null>(this.loadToken());

  /** Expose user as read-only */
  readonly currentUser = this._user.asReadonly();

  /** Reactive logged-in check */
  readonly isLoggedIn = computed(() => this._token() !== null && this._user() !== null);

  // ═══════════════════════════════════════════════════
  //  REGISTER
  // ═══════════════════════════════════════════════════

  registerWithProfile(form: RegisterForm): Observable<void> {
    // Guard: file is required
    if (!form.file) {
      return throwError(() => new Error('Profile picture is required'));
    }

    const file = form.file;

    return this.supabase.register<AuthResponse>(form.email, form.password).pipe(
      // 1) Check for Supabase auth error
      map((res) => this.unwrap<AuthResponse['data']>(res as any)),

      // 2) Upload profile image
      switchMap((data) => {
        const userId = data.user!.id;
        const fileName = `${userId}/${file.name}`;

        return this.supabase.uploadFile('profileImage', fileName, file).pipe(
          map((uploadRes) => {
            if (uploadRes.error) throw uploadRes.error;
            return { userId, fileName };
          }),
        );
      }),

      // 3) Insert profile row
      switchMap(({ userId, fileName }) => {
        const avatarUrl = this.supabase.getFileUrl('profileImage', fileName)
          .data.publicUrl;

        const profile: ProfileInsert = {
          id: userId,
          fullName: form.username,
          phone: form.phone,
          isAgent: form.userType === 'agent',
          image_url: avatarUrl,
        };

        return this.supabase.insert<ProfileInsert, unknown>(
          'profiles',
          profile,
        );
      }),

      // 4) Normalize to void
      map(() => void 0),
    );
  }

  // ═══════════════════════════════════════════════════
  //  LOGIN
  // ═══════════════════════════════════════════════════

  loginUser(form: LoginForm): Observable<FullUserData> {
    return this.supabase
      .login<AuthTokenResponsePassword>(form.email, form.password)
      .pipe(
        // 1) Check for Supabase auth error
        map((res) =>
          this.unwrap<AuthTokenResponsePassword['data']>(res as any),
        ),

        // 2) Persist token
        tap((data) => {
          const accessToken = data.session!.access_token;
          this._token.set(accessToken);
          this.saveToken(accessToken);
        }),

        // 3) Fetch profile
        switchMap((data) => {
          const authUser: User = data.user!;

          return this.supabase.getById<any>('profiles', authUser.id).pipe(
            map((profileRes) => {
              if (profileRes.error) throw profileRes.error;

              const fullUser: FullUserData = {
                auth: authUser,
                profile: profileRes.data,
              };
              return fullUser;
            }),
          );
        }),

        // 4) Store user in signal
        tap((fullUser) => this._user.set(fullUser)),
      );
  }

  // ═══════════════════════════════════════════════════
  //  LOGOUT
  // ═══════════════════════════════════════════════════

  logout(): Observable<void> {
    return this.supabase.logout().pipe(
      tap(() => {
        this._user.set(null);
        this._token.set(null);
        this.clearToken();
      }),
    );
  }

  // ═══════════════════════════════════════════════════
  //  PROFILE UPDATE
  // ═══════════════════════════════════════════════════

  updateProfile(data: ProfileUpdate): Observable<void> {
    const userId = this._user()?.auth?.id;
    if (!userId) return throwError(() => new Error('User not authenticated'));

    return this.supabase.updateUserProfile(userId, data).pipe(
      map((res: any) => {
        if (res?.error) throw res.error;
        return res.data;
      }),
      tap((updatedProfile: any) => {
        // Patch the local user signal so UI updates instantly
        const current = this._user();
        if (current) {
          this._user.set({
            ...current,
            profile: { ...current.profile, ...updatedProfile },
          });
        }
      }),
      map(() => void 0),
    );
  }

  updateAvatar(file: File): Observable<string> {
    const userId = this._user()?.auth?.id;
    if (!userId) return throwError(() => new Error('User not authenticated'));

    const fileName = `${userId}/${Date.now()}_${file.name}`;

    return this.supabase.uploadFile('profileImage', fileName, file).pipe(
      map((uploadRes) => {
        if (uploadRes.error) throw uploadRes.error;
        return this.supabase.getFileUrl('profileImage', fileName).data.publicUrl;
      }),
      switchMap((newUrl: string) => {
        return this.updateProfile({ image_url: newUrl }).pipe(map(() => newUrl));
      }),
    );
  }

  // ═══════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ═══════════════════════════════════════════════════

  /**
   * Unwrap a Supabase `{ data, error }` response.
   * Throws the error so RxJS `catchError` can handle it downstream.
   */
  private unwrap<T>(response: { data: T; error: any }): T {
    if (response.error) throw response.error;
    return response.data as T;
  }

  // ─── Token persistence ─────────────────────────────

  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private clearToken(): void {
    localStorage.clear();
  }
}
