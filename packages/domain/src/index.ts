/** Stable, cross-client contracts. UI labels and translations do not belong here. */
export type BusinessId = string;
export type IndustryModuleKey = string;

export type BusinessProfile = {
  id: BusinessId;
  name: string;
  defaultCurrency: string;
  timeZone: string;
  locale: string;
  stateOrUnionTerritory: string | null;
};

export type IndustryModule = {
  key: IndustryModuleKey;
  version: number;
  /** Stable capabilities are consumed by app logic; labels are localized by clients. */
  capabilities: readonly string[];
};

export type IndustryModuleRegistry = Readonly<Record<IndustryModuleKey, IndustryModule>>;

export type BusinessContext = {
  business: BusinessProfile;
  enabledModules: readonly IndustryModuleKey[];
};

/** An AI-proposed operation is not executed until the user confirms it. */
export type ProposedBusinessAction<TPayload = unknown> = {
  id: string;
  kind: string;
  payload: TPayload;
  requiresConfirmation: true;
};
