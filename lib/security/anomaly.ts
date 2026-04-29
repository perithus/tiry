type SignInContext = {
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export type SignInAnomalyKind =
  | "standard_sign_in"
  | "new_device_sign_in"
  | "new_network_sign_in"
  | "new_user_agent_sign_in"
  | "session_burst_sign_in"
  | "rapid_ip_rotation_sign_in";

export type SignInAnomalySeverity = "info" | "warning" | "danger";

export type SignInAnomalyResult = {
  kind: SignInAnomalyKind;
  severity: SignInAnomalySeverity;
  signals: SignInAnomalyKind[];
  newIp: boolean;
  newUserAgent: boolean;
  distinctIpCount24h: number;
  signInCount1h: number;
};

const PRIMARY_KIND_ORDER: SignInAnomalyKind[] = [
  "rapid_ip_rotation_sign_in",
  "session_burst_sign_in",
  "new_device_sign_in",
  "new_network_sign_in",
  "new_user_agent_sign_in",
  "standard_sign_in"
];

function uniq(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export function detectSignInAnomalies({
  ipAddress,
  userAgent,
  historicalSessions,
  historicalSignIns,
  now = new Date()
}: {
  ipAddress: string | null;
  userAgent: string | null;
  historicalSessions: SignInContext[];
  historicalSignIns: SignInContext[];
  now?: Date;
}): SignInAnomalyResult {
  const contextHistory = [...historicalSessions, ...historicalSignIns];
  const knownIps = new Set(uniq(contextHistory.map((entry) => entry.ipAddress)));
  const knownAgents = new Set(uniq(contextHistory.map((entry) => entry.userAgent)));
  const knownCombination = contextHistory.some((entry) => entry.ipAddress === ipAddress && entry.userAgent === userAgent);

  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentHour = historicalSignIns.filter((entry) => entry.createdAt >= oneHourAgo);
  const recentDay = historicalSignIns.filter((entry) => entry.createdAt >= oneDayAgo);

  const signals = new Set<SignInAnomalyKind>();
  const newIp = Boolean(ipAddress) && !knownIps.has(ipAddress as string);
  const newUserAgent = Boolean(userAgent) && !knownAgents.has(userAgent as string);
  const distinctIpCount24h = new Set(uniq([...recentDay.map((entry) => entry.ipAddress), ipAddress])).size;
  const signInCount1h = recentHour.length + 1;

  if (contextHistory.length > 0 && !knownCombination) {
    signals.add("new_device_sign_in");
  }

  if (newIp) {
    signals.add("new_network_sign_in");
  }

  if (newUserAgent) {
    signals.add("new_user_agent_sign_in");
  }

  if (signInCount1h >= 5) {
    signals.add("session_burst_sign_in");
  }

  if (distinctIpCount24h >= 3) {
    signals.add("rapid_ip_rotation_sign_in");
  }

  const orderedSignals = PRIMARY_KIND_ORDER.filter((kind) => signals.has(kind));
  const kind = orderedSignals[0] ?? "standard_sign_in";
  const severity: SignInAnomalySeverity =
    kind === "rapid_ip_rotation_sign_in" || kind === "session_burst_sign_in"
      ? "danger"
      : kind === "standard_sign_in"
        ? "info"
        : "warning";

  return {
    kind,
    severity,
    signals: orderedSignals,
    newIp,
    newUserAgent,
    distinctIpCount24h,
    signInCount1h
  };
}

export function isSecurityIncidentKind(kind?: string) {
  return [
    "new_device_sign_in",
    "new_network_sign_in",
    "new_user_agent_sign_in",
    "session_burst_sign_in",
    "rapid_ip_rotation_sign_in"
  ].includes(kind ?? "");
}
