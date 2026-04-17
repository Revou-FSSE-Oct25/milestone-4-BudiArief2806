import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };

  let guard: JwtAuthGuard;

  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new JwtAuthGuard(reflectorMock as any);
  });

  it('allows public routes without delegating to Passport', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('delegates private routes to the parent AuthGuard', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);

    const parentCanActivate = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true as any);

    const result = guard.canActivate(context);

    expect(parentCanActivate).toHaveBeenCalledWith(context);
    expect(result).toBe(true);

    parentCanActivate.mockRestore();
  });

  it('throws unauthorized when Passport does not provide a user', () => {
    expect(() => guard.handleRequest(null, null as any)).toThrow(UnauthorizedException);
  });

  it('returns the authenticated user when Passport succeeds', () => {
    const user = { sub: 1, email: 'budi@example.com' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });
});
