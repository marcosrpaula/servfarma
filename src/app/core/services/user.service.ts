import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from 'src/app/store/Authentication/auth.models';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient) { }
    /***
     * Get All User
     */
    getAll(): Observable<User[]> {
        return this.http.get<User[]>(`api/users`);
    }

    /***
     * Facked User Register
     */
    register(user: User): Observable<User> {
        return this.http.post<User>(`/users/register`, user);
    }
}
