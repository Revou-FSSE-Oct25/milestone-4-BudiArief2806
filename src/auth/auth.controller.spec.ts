import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authServiceMock as any);
  });

  it('forwards register requests to AuthService', async () => {
    const dto = {
      fullName: 'Budi Santoso',
      email: 'budi@example.com',
      password: 'SecurePass123',
    };
    authServiceMock.register.mockResolvedValue({ accessToken: 'token' });

    const result = await controller.register(dto as any);

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'token' });
  });

  it('forwards login requests to AuthService', async () => {
    const dto = {
      email: 'budi@example.com',
      password: 'SecurePass123',
    };
    authServiceMock.login.mockResolvedValue({ accessToken: 'token' });

    const result = await controller.login(dto as any);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'token' });
  });
});
