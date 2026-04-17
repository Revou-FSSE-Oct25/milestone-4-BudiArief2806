import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  const transactionsServiceMock = {
    deposit: jest.fn(),
    withdraw: jest.fn(),
    transfer: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const currentUser = {
    sub: 1,
    email: 'budi@example.com',
    role: 'USER',
  };

  let controller: TransactionsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TransactionsController(transactionsServiceMock as any);
  });

  it('forwards deposits to TransactionsService', async () => {
    const dto = { accountId: 1, amount: 1000 };
    transactionsServiceMock.deposit.mockResolvedValue({ id: 1 });

    const result = await controller.deposit(currentUser as any, dto as any);

    expect(transactionsServiceMock.deposit).toHaveBeenCalledWith(currentUser, dto);
    expect(result).toEqual({ id: 1 });
  });

  it('forwards withdrawals to TransactionsService', async () => {
    const dto = { accountId: 1, amount: 1000 };
    transactionsServiceMock.withdraw.mockResolvedValue({ id: 2 });

    const result = await controller.withdraw(currentUser as any, dto as any);

    expect(transactionsServiceMock.withdraw).toHaveBeenCalledWith(currentUser, dto);
    expect(result).toEqual({ id: 2 });
  });

  it('forwards transfers to TransactionsService', async () => {
    const dto = { sourceAccountId: 1, destinationAccountId: 2, amount: 2000 };
    transactionsServiceMock.transfer.mockResolvedValue({ id: 3 });

    const result = await controller.transfer(currentUser as any, dto as any);

    expect(transactionsServiceMock.transfer).toHaveBeenCalledWith(currentUser, dto);
    expect(result).toEqual({ id: 3 });
  });

  it('returns all visible transactions', async () => {
    transactionsServiceMock.findAll.mockResolvedValue([{ id: 1 }]);

    const result = await controller.findAll(currentUser as any);

    expect(transactionsServiceMock.findAll).toHaveBeenCalledWith(currentUser);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('returns one transaction by id', async () => {
    transactionsServiceMock.findOne.mockResolvedValue({ id: 1 });

    const result = await controller.findOne(1, currentUser as any);

    expect(transactionsServiceMock.findOne).toHaveBeenCalledWith(1, currentUser);
    expect(result).toEqual({ id: 1 });
  });
});
