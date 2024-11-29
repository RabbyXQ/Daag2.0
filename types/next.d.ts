import { User } from '@prisma/client';

declare module 'next/server' {
  interface NextRequest {
    user?: { user: User };
  }
}
