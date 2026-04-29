const CAMPAIGN_MESSAGE_PREFIX = "[campaign-message]";

export function serializeCampaignMessage(body: string) {
  return `${CAMPAIGN_MESSAGE_PREFIX}\n${body.trim()}`;
}

export function isCampaignMessage(body: string) {
  return body.startsWith(`${CAMPAIGN_MESSAGE_PREFIX}\n`);
}

export function parseCampaignMessage(body: string) {
  if (!isCampaignMessage(body)) {
    return body;
  }

  return body.slice(CAMPAIGN_MESSAGE_PREFIX.length + 1).trim();
}
