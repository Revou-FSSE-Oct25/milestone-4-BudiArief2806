import { UsersController } from './users.controller';

describe('UsersController', () => {
  const usersServiceMock = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  const currentUser = {
    sub: 1,
    email: 'budi@example.com',
    role: 'USER',
  };

  let controller: UsersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(usersServiceMock as any);
  });

  it('returns the current users profile', async () => {
    usersServiceMock.getProfile.mockResolvedValue({ email: 'budi@example.com' });

    const result = await controller.getProfile(currentUser as any);

    expect(usersServiceMock.getProfile).toHaveBeenCalledWith(currentUser);
    expect(result).toEqual({ email: 'budi@example.com' });
  });

  it('forwards profile updates to UsersService', async () => {
    const dto = { fullName: 'Budi Updated' };
    usersServiceMock.updateProfile.mockResolvedValue({ fullName: 'Budi Updated' });

    const result = await controller.updateProfile(currentUser as any, dto);

    expect(usersServiceMock.updateProfile).toHaveBeenCalledWith(currentUser, dto);
    expect(result).toEqual({ fullName: 'Budi Updated' });
  });
});
