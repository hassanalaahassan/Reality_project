import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { supabase } from './subabase';

@Injectable({
  providedIn: 'root',
})
export class SubabaseService {
  // ===============================
  // AUTH
  // ===============================

  register<T>(email: string, password: string): Observable<T> {
    return from(
      supabase.auth.signUp({
        email,
        password,
      }),
    ) as unknown as Observable<T>;
  }
  updateUserProfile(userId: string, data: any) {
    return from(
      supabase.from('profiles').update(data).eq('id', userId).select().single(),
    );
  }

  login<T>(email: string, password: string): Observable<T> {
    return from(
      supabase.auth.signInWithPassword({
        email,
        password,
      }),
    ) as unknown as Observable<T>;
  }

  logout(): Observable<void> {
    return from(supabase.auth.signOut()) as unknown as Observable<void>;
  }

  getCurrentUser<T>(): Observable<T> {
    return from(supabase.auth.getUser()) as unknown as Observable<T>;
  }

  getSession<T>(): Observable<T> {
    return from(supabase.auth.getSession()) as unknown as Observable<T>;
  }

  // ===============================
  // DATABASE CRUD
  // ===============================

  getAll<T>(table: string): Observable<T[]> {
    return from(supabase.from(table).select('*')) as unknown as Observable<T[]>;
  }

  getById<T>(table: string, id: string): Observable<T> {
    return from(
      supabase.from(table).select('*').eq('id', id).single(),
    ) as unknown as Observable<T>;
  }

  insert<T, U = any>(table: string, data: T): Observable<U> {
    return from(
      supabase.from(table).insert(data).select().single(),
    ) as unknown as Observable<U>;
  }

  update<T, U>(table: string, id: string, data: T): Observable<U> {
    return from(
      supabase.from(table).update(data).eq('id', id).select(),
    ) as unknown as Observable<U>;
  }

  delete(table: string, id: string): Observable<any> {
    return from(
      supabase.from(table).delete().eq('id', id).select(),
    ) as unknown as Observable<any>;
  }
  rpc(fnName: string, params?: any):Observable<any> {
    return from(supabase.rpc(fnName, params)) as unknown as Observable<any>;
  }

  // ===============================
  // STORAGE
  // ===============================

  uploadFile(bucket: string, path: string, file: File) {
    return from(supabase.storage.from(bucket).upload(path, file));
  }

  getFileUrl(bucket: string, path: string) {
    return supabase.storage.from(bucket).getPublicUrl(path);
  }

  deleteFile(bucket: string, path: string) {
    return from(supabase.storage.from(bucket).remove([path]));
  }
}
