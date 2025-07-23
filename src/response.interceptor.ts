import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
  statusCode: number;
  message: string;
  timeStamp: string;
  data: T;
  meta?: {
    isFirstPage: boolean;
    isLastPage: boolean;
    currentPage: number;
    previousPage: null | number;
    nextPage: null | number;
    pageCount: number;
    totalCount: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode: number = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        const responseData = data === null || data === undefined ? null : data;
        const message = this.getDefaultMessage(statusCode);
        const finalMessage = responseData?.message || message;
        const finalStatus = responseData?.status || statusCode;
        const metaData = responseData?.meta;

        if (responseData) {
          delete responseData.message;
          delete responseData.status;
        }

        return {
          statusCode: finalStatus,
          message: finalMessage,
          timeStamp: new Date().toISOString(),
          data: responseData?.data || responseData,
          meta: metaData,
        };
      }),
    );
  }

  private getDefaultMessage(status: number): string {
    switch (status) {
      case HttpStatus.OK:
        return 'Request successful';
      case HttpStatus.CREATED:
        return 'Resource created successfully';
      case HttpStatus.ACCEPTED:
        return 'Request accepted';
      case HttpStatus.NO_CONTENT:
        return 'Resource deleted successfully';
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal server error';
      default:
        return 'Request processed successfully';
    }
  }
}
