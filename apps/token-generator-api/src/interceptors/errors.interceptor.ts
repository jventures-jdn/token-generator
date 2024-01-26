import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err) => {
        const data = err?.message || null;
        const error = err?.error || null;
        const status = err?.status || 500;
        const timestamp = new Date().valueOf();
        const cause = err?.cause || null;
        const from = err?.options?.description || (status ? 'nest' : 'unknown');
        throw new HttpException(
          { data, status, timestamp, error, cause, from },
          status,
        );
      }),
    );
  }
}
