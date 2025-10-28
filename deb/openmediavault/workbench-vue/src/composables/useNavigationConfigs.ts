import { ref } from 'vue';

type Fetcher = (input: RequestInfo, init?: RequestInit) => Promise<ResponseLike>;

type ResponseLike = {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
};

export type NavigationMenuItem = {
  path: string;
  text: string;
  url: string;
  position?: number;
  icon?: string;
  permissions?: Record<string, unknown>;
  hidden?: boolean;
  children?: NavigationMenuItem[];
};

export type LoaderStatus = 'idle' | 'loading' | 'ready' | 'error';

// Prefer backend endpoint if available; fall back to bundled JSON during development
const DEFAULT_ENDPOINT = '/rpc/navigation-config';

export interface UseNavigationConfigsOptions {
  fetcher?: Fetcher;
  endpoint?: string;
}

export const useNavigationConfigs = (options: UseNavigationConfigsOptions = {}) => {
  const menus = ref<NavigationMenuItem[]>([]);
  const status = ref<LoaderStatus>('idle');
  const error = ref<Error | null>(null);

  const fetcher: Fetcher = options.fetcher ?? (globalThis.fetch as Fetcher);
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;

  const toKebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();
  const iconMap: Record<string, string> = {
    apps: 'mdi-view-dashboard',
    dashboard: 'mdi-view-dashboard',
    laptop: 'mdi-laptop',
    system: 'mdi-cog-outline',
    network: 'mdi-lan',
    'router-network': 'mdi-router-network',
    firewall: 'mdi-shield-outline',
    nas: 'mdi-harddisk',
    harddisk: 'mdi-harddisk',
    share: 'mdi-share-variant',
    users: 'mdi-account-group-outline',
    user: 'mdi-account-outline',
    group: 'mdi-account-multiple-outline',
    'mdi-users': 'mdi-account-outline',
    'mdi-group': 'mdi-account-multiple-outline',
    email: 'mdi-email-outline',
    bell: 'mdi-bell-outline',
    clock: 'mdi-clock-outline',
    tune: 'mdi-tune',
    plugin: 'mdi-puzzle-outline',
    certificate: 'mdi-certificate',
    ssl: 'mdi-lock-outline',
    ssh: 'mdi-ssh',
    'source-repository': 'mdi-source-repository',
    update: 'mdi-update',
    download: 'mdi-download',
    'calendar-clock': 'mdi-calendar-clock',
    'heartpulse': 'mdi-heart-pulse',
    heartpulsealt: 'mdi-heart-pulse',
    heartpulse2: 'mdi-heart-pulse',
    heartpulse3: 'mdi-heart-pulse',
    heartpulse4: 'mdi-heart-pulse',
    heartpulse5: 'mdi-heart-pulse',
    'file-tree': 'mdi-file-tree',
    'file-document-edit': 'mdi-file-document-edit-outline',
    information: 'mdi-information-outline',
    text: 'mdi-text-box-outline',
    cogs: 'mdi-cogs',
    memory: 'mdi-memory',
    'cpu-64-bit': 'mdi-cpu-64-bit',
    'timer-outline': 'mdi-timer-outline',
    'format-list-numbered': 'mdi-format-list-numbered',
    'folder-network': 'mdi-folder-network',
    nfs: 'mdi-folder-network',
    smb: 'mdi-folder-network-outline',
    // Remap some invalid mdi-* tokens produced by generators
    'mdi-nfs': 'mdi-folder-network',
    'mdi-smb': 'mdi-folder-network-outline',
    'mdi-ssl': 'mdi-lock-outline',
    'mdi-heartPulse': 'mdi-heart-pulse'
  };

  const mapIcon = (icon?: string): string | undefined => {
    if (!icon) return undefined;
    // First try direct mapping table (supports both bare and mdi-* keys)
    if (iconMap[icon]) return iconMap[icon];
    if (icon.startsWith('mdi:')) {
      const key = `mdi-${toKebab(icon.slice(4))}`;
      return iconMap[key] ?? key;
    }
    if (icon.startsWith('mdi-')) {
      const key = icon;
      return iconMap[key] ?? key;
    }
    const key = toKebab(icon);
    return iconMap[key] ?? `mdi-${key}`;
  };

  const applyIconMapping = (items: NavigationMenuItem[]): NavigationMenuItem[] => {
    const mapItems = (arr: NavigationMenuItem[]): NavigationMenuItem[] =>
      arr.map((it) => ({
        ...it,
        icon: mapIcon(it.icon),
        children: it.children ? mapItems(it.children) : undefined
      }));
    return mapItems(items);
  };

  const enforceTopLevelIcons = (items: NavigationMenuItem[]): NavigationMenuItem[] => {
    const topIconOverride: Record<string, string> = {
      dashboard: 'mdi-view-dashboard',
      system: 'mdi-cog-outline',
      network: 'mdi-lan',
      storage: 'mdi-harddisk',
      services: 'mdi-cube-outline',
      usermgmt: 'mdi-account-group-outline',
      diagnostics: 'mdi-stethoscope'
    };
    return items.map((it) => ({
      ...it,
      icon: topIconOverride[it.path] ?? it.icon
    }));
  };

  const load = async (): Promise<NavigationMenuItem[]> => {
    status.value = 'loading';
    error.value = null;
    try {
      const response = await fetcher(endpoint, {
        credentials: 'same-origin'
      });
      const contentType = response.headers.get('content-type') || '';
      let data: unknown;
      if (!response.ok || !contentType.includes('application/json')) {
        // Soft-fallback to the static JSON during development
        const fallbackResponse = await fetcher('/assets/navigation-config.json', {
          credentials: 'same-origin'
        });
        const fallbackData = await fallbackResponse.json();
        data = fallbackData;
      } else {
        try {
          data = await response.json();
        } catch (parseErr) {
          // Fallback if backend responded with non-JSON body
          const fallbackResponse = await fetcher('/assets/navigation-config.json', {
            credentials: 'same-origin'
          });
          data = await fallbackResponse.json();
        }
      }
      const normalized = Array.isArray(data) ? applyIconMapping(data as NavigationMenuItem[]) : [];
      menus.value = enforceTopLevelIcons(normalized);
      status.value = 'ready';
      return menus.value;
    } catch (err) {
      status.value = 'error';
      const failure = err instanceof Error ? err : new Error(String(err));
      error.value = failure;
      throw failure;
    }
  };

  return {
    menus,
    status,
    error,
    load
  } as const;
};
