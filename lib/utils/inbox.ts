export function countUnreadMessages(messages: Array<{ senderId: string }>, ownUserId: string) {
  let lastOwnMessageIndex = -1;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.senderId === ownUserId) {
      lastOwnMessageIndex = index;
      break;
    }
  }

  return messages.reduce((count, message, index) => {
    if (message.senderId === ownUserId) {
      return count;
    }

    if (lastOwnMessageIndex === -1 || index > lastOwnMessageIndex) {
      return count + 1;
    }

    return count;
  }, 0);
}
