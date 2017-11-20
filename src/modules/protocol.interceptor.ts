
import { Interceptor, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Interceptor()
export class ProtocolInterceptor implements NestInterceptor {
    intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
        return stream$.map(data => {
            if (typeof data == 'string') {
                return data;
            }
            let res: Response = {
                data: {
                    ok: 1,
                },
                error: 0,
            };
            if (data !== true) {
                if (typeof data === "object" && data.error) {
                    res.data  = data.info ? data.info : {};
                    res.error = data.error;
                } else {
                    res.data = data;
                }
            }
            return res;
        });
    }
}

export type Response = {
    data: any,
    error: any,
}