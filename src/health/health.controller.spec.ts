import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('returns an ok health response', () => {
    const result = controller.getHealth();

    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('string');
  });
});
