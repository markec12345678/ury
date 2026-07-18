export function extractServerMessage(error) {
  try {
    if (error?._server_messages) {
      const messages = JSON.parse(error._server_messages);
      if (Array.isArray(messages) && messages.length > 0) {
        return JSON.parse(messages[0]).message;
      }
    }
  } catch {
    // ignore parse errors
  }
  return error?.message || "An unknown error occurred";
}
