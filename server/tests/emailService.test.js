const {
  initializeTransporter,
  sendNoiseViolationEmail,
  sendComplaintEmail,
  sendRewardEmail,
} = require("../services/emailService");

jest.mock("nodemailer", () => {
  const transport = {
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-message-id" }),
  };

  return {
    createTestAccount: jest
      .fn()
      .mockResolvedValue({ user: "test-user", pass: "test-pass" }),
    createTransport: jest.fn(() => transport),
    getTestMessageUrl: jest.fn(() => "http://example.com/preview"),
    __transport: transport, // expose for tests
  };
});

const nodemailer = require("nodemailer");

describe("emailService without initialized transporter", () => {
  test("sendNoiseViolationEmail throws if transporter not initialized", async () => {
    await expect(
      sendNoiseViolationEmail({ email: "t@example.com", message: "Too loud" })
    ).rejects.toThrow("Email transporter is not initialized.");
  });

  test("sendComplaintEmail throws if transporter not initialized", async () => {
    await expect(
      sendComplaintEmail({ email: "t@example.com", message: "Complaint" })
    ).rejects.toThrow("Email transporter is not initialized.");
  });

  test("sendRewardEmail throws if transporter not initialized", async () => {
    await expect(
      sendRewardEmail({
        email: "t@example.com",
        reward_name: "Reward",
        reward_description: "Desc",
      })
    ).rejects.toThrow("Email transporter is not initialized.");
  });
});

describe("emailService with initialized transporter", () => {
  beforeAll(async () => {
    await initializeTransporter();
  });

  afterEach(() => {
    nodemailer.__transport.sendMail.mockClear();
  });

  test("sendNoiseViolationEmail calls transporter.sendMail with correct fields", async () => {
    const payload = { email: "user@example.com", message: "Too loud" };

    await sendNoiseViolationEmail(payload);

    expect(nodemailer.__transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: payload.email,
        subject: "Noise Violation Alert",
      })
    );
  });

  test("sendComplaintEmail calls transporter.sendMail with correct fields", async () => {
    const payload = { email: "user@example.com", message: "New complaint" };

    await sendComplaintEmail(payload);

    expect(nodemailer.__transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: payload.email,
        subject: "New Complaint Filed",
      })
    );
  });

  test("sendRewardEmail calls transporter.sendMail with correct fields", async () => {
    const payload = {
      email: "user@example.com",
      reward_name: "Free Month",
      reward_description: "You were quiet all month",
    };

    await sendRewardEmail(payload);

    expect(nodemailer.__transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: payload.email,
        subject: "You Earned a Reward!",
      })
    );
  });
});
