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
        const data = err?.response?.data || null;
        const message =
          err?.options?.description ||
          err?.response?.message ||
          err?.message ||
          null;
        const error = err?.error || err?.response?.error || null;
        const status = err?.status || 500;
        const timestamp = new Date().valueOf();
        const cause =
          err?.response?.cause || err?.cause || (status ? 'nestjs' : 'unknown');
        throw new HttpException(
          { data, status, timestamp, error, cause, message },
          status,
        );
      }),
    );
  }
}
