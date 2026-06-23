import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class SecurityThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.user && req.user.userId) {
      return `user:${req.user.userId}`;
    }
    return req.ip || req.headers['x-forwarded-for'] || 'unknown-origin';
  }
}