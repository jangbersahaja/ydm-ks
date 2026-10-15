export type ActionState = {
  ok?: boolean;
  message?: string;
  // "session": the counter session ended, so the client should send the user to login.
  code?: "session";
};
