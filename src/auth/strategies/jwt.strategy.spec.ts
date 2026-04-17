import { UserRole } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('maps the JWT payload into an authenticated user object', () => {
    const configServiceMock = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const strategy = new JwtStrategy(configServiceMock as any);
    const result = strategy.validate({
      sub: 1,
      email: 'budi@example.com',
      role: UserRole.USER,
    });

    expect(configServiceMock.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(result).toEqual({
      sub: 1,
      email: 'budi@example.com',
      role: UserRole.USER,
    });
  });
});
