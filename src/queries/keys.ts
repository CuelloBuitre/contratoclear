export const analysisKeys = {
  all: ['analyses'] as const,
  list: () => [...analysisKeys.all, 'list'] as const,
  detail: (id: string) => [...analysisKeys.all, 'detail', id] as const,
}

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
}

export const contractKeys = {
  all: ['contracts'] as const,
  list: () => [...contractKeys.all, 'list'] as const,
  detail: (id: string) => [...contractKeys.all, 'detail', id] as const,
}

export const organizationKeys = {
  all: ['organization'] as const,
  detail: () => [...organizationKeys.all, 'detail'] as const,
}
