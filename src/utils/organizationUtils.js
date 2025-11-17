// Organization ID utility - central place to get current organization
import { authService } from '../services/authService';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const getCurrentOrganizationId = () => {
  const user = authService.getCurrentUser();
  const orgId = user?.organizationId || DEFAULT_ORG_ID;
  return orgId;
};

export const ensureOrganizationId = (providedOrgId) => {
  if (providedOrgId && providedOrgId !== DEFAULT_ORG_ID) {
    return providedOrgId;
  }
  return getCurrentOrganizationId();
};

export default {
  getCurrentOrganizationId,
  ensureOrganizationId,
  DEFAULT_ORG_ID
};
