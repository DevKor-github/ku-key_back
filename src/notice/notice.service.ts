import { Injectable } from '@nestjs/common';
import { filter, map, Observable, Subject } from 'rxjs';

interface user {
  userId: number;
  message: string;
}

@Injectable()
export class NoticeService {
  private users$: Subject<user> = new Subject();

  private observer = this.users$.asObservable();

  emitNotice(userId: number, message: string) {
    this.users$.next({ userId: userId, message: message });
  }

  sendClientConnection(userId: number): Observable<MessageEvent> {
    return this.observer.pipe(
      filter((user) => Number(user.userId) === Number(userId)),
      map((user) => {
        return {
          data: {
            message: user.message,
          },
        } as MessageEvent;
      }),
    );
  }
}
