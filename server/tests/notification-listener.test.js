const { listenForNotifications } = require("../services/notification-listener");
const emailService = require("../services/emailService");

// mock the email service functions
jest.mock("../services/emailService", () => ({
  sendNoiseViolationEmail: jest.fn(),
  sendComplaintEmail: jest.fn(),
  sendRewardEmail: jest.fn(),
}));

describe("notification-listener", () => {
  let mockClient;
  let mockPool;

  beforeEach(() => {
    mockClient = {
      query: jest.fn().mockResolvedValue(),
      on: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("subscribes to noise_violation, complaint, and reward channels", async () => {
    await listenForNotifications(mockPool);

    expect(mockPool.connect).toHaveBeenCalled();

    expect(mockClient.query).toHaveBeenCalledWith("LISTEN noise_violation");
    expect(mockClient.query).toHaveBeenCalledWith("LISTEN complaint");
    expect(mockClient.query).toHaveBeenCalledWith("LISTEN reward");
  });

  test("dispatches noise_violation notifications to sendNoiseViolationEmail", async () => {
    await listenForNotifications(mockPool);

    // get the handler passed to client.on('notification', handler)
    const [[eventName, handler]] = mockClient.on.mock.calls.filter(
      ([evt]) => evt === "notification"
    );

    expect(eventName).toBe("notification");

    const payload = {
      email: "user@example.com",
      message: "Too loud",
      user_id: 1,
    };

    await handler({
      channel: "noise_violation",
      payload: JSON.stringify(payload),
    });

    expect(emailService.sendNoiseViolationEmail).toHaveBeenCalledWith(payload);
  });

  test("dispatches complaint notifications to sendComplaintEmail", async () => {
    await listenForNotifications(mockPool);

    const [[, handler]] = mockClient.on.mock.calls.filter(
      ([evt]) => evt === "notification"
    );

    const payload = {
      email: "user@example.com",
      message: "Complaint text",
      user_id: 2,
    };

    await handler({
      channel: "complaint",
      payload: JSON.stringify(payload),
    });

    expect(emailService.sendComplaintEmail).toHaveBeenCalledWith(payload);
  });

  test("dispatches reward notifications to sendRewardEmail", async () => {
    await listenForNotifications(mockPool);

    const [[, handler]] = mockClient.on.mock.calls.filter(
      ([evt]) => evt === "notification"
    );

    const payload = {
      email: "user@example.com",
      reward_name: "Free Month",
      reward_description: "Stayed under noise limit",
      user_id: 3,
    };

    await handler({
      channel: "reward",
      payload: JSON.stringify(payload),
    });

    expect(emailService.sendRewardEmail).toHaveBeenCalledWith(payload);
  });

  test("does not call email service when payload is invalid JSON", async () => {
    await listenForNotifications(mockPool);

    const [[, handler]] = mockClient.on.mock.calls.filter(
      ([evt]) => evt === "notification"
    );

    await handler({
      channel: "noise_violation",
      payload: "NOT_JSON",
    });

    expect(emailService.sendNoiseViolationEmail).not.toHaveBeenCalled();
    expect(emailService.sendComplaintEmail).not.toHaveBeenCalled();
    expect(emailService.sendRewardEmail).not.toHaveBeenCalled();
  });
});
