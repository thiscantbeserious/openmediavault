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

const DEFAULT_ENDPOINT = '/assets/navigation-config.json';

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

  const load = async (): Promise<NavigationMenuItem[]> => {
    status.value = 'loading';
    error.value = null;
    try {
      const response = await fetcher(endpoint, {
        credentials: 'same-origin'
      });
      if (!response.ok) {
        throw new Error(
          `Failed to load navigation configuration (${response.status} ${response.statusText})`
        );
      }
      const data = await response.json();
      menus.value = Array.isArray(data) ? (data as NavigationMenuItem[]) : [];
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
