export const isBlocked = (userA, userBId) => {
  return userA.blockedUsers.includes(userBId);
};
