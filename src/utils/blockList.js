
const blockedIPs = new Set();
const blockedAccounts = new Set();
const blockedSubnets = new Set();

export const addBlockedIP = (ip) => blockedIPs.add(ip);
export const addBlockedAccount = (account) => blockedAccounts.add(account);
export const addBlockedSubnet = (subnet) => blockedSubnets.add(subnet);

export const isBlocked = (ip, account) => {
  
  const subnet = ip.split(".").slice(0, 3).join(".") + ".";

  return (
    blockedIPs.has(ip) ||
    blockedAccounts.has(account) ||
    blockedSubnets.has(subnet)
  );
};
