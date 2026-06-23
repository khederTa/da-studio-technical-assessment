import { ThrottlerGuard } from '@nestjs/throttler';
export declare class SecurityThrottlerGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string>;
}
