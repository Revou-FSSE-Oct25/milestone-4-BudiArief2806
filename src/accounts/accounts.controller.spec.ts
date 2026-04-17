import { AccountsController } from './accounts.controller';

describe('AccountsController', () => {
  const accountsServiceMock = {
    createAccount: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const currentUser = {
    sub: 1,
    email: 'budi@example.com',
    role: 'USER',
  };

  let controller: AccountsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AccountsController(accountsServiceMock as any);
  });

  it('creates an account through AccountsService', async () => {
    const dto = { accountName: 'Main Wallet', accountType: 'SAVINGS', currency: 'IDR' };
    accountsServiceMock.createAccount.mockResolvedValue({ id: 1 });

    const result = await controller.create(currentUser as any, dto as any);

    expect(accountsServiceMock.createAccount).toHaveBeenCalledWith(currentUser, dto);
    expect(result).toEqual({ id: 1 });
  });

  it('returns all visible accounts', async () => {
    accountsServiceMock.findAll.mockResolvedValue([{ id: 1 }]);

    const result = await controller.findAll(currentUser as any);

    expect(accountsServiceMock.findAll).toHaveBeenCalledWith(currentUser);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('returns a single account by id', async () => {
    accountsServiceMock.findOne.mockResolvedValue({ id: 1 });

    const result = await controller.findOne(1, currentUser as any);

    expect(accountsServiceMock.findOne).toHaveBeenCalledWith(1, currentUser);
    expect(result).toEqual({ id: 1 });
  });

  it('updates an account by id', async () => {
    const dto = { accountName: 'Updated Wallet' };
    accountsServiceMock.update.mockResolvedValue({ id: 1, accountName: 'Updated Wallet' });

    const result = await controller.update(1, currentUser as any, dto as any);

    expect(accountsServiceMock.update).toHaveBeenCalledWith(1, currentUser, dto);
    expect(result).toEqual({ id: 1, accountName: 'Updated Wallet' });
  });

  it('removes an account by id', async () => {
    accountsServiceMock.remove.mockResolvedValue({ message: 'Account deleted successfully.' });

    const result = await controller.remove(1, currentUser as any);

    expect(accountsServiceMock.remove).toHaveBeenCalledWith(1, currentUser);
    expect(result).toEqual({ message: 'Account deleted successfully.' });
  });
});
