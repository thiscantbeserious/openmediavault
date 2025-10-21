import { ref } from 'vue';

type Fetcher = (input: RequestInfo, init?: RequestInit) => Promise<ResponseLike>;

type ResponseLike = {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
};

export type RouteComponentType =
  | 'blankPage'
  | 'navigationPage'
  | 'formPage'
  | 'selectionListPage'
  | 'textPage'
  | 'tabsPage'
  | 'datatablePage'
  | 'rrdPage'
  | 'codeEditorPage';

export type RouteComponentConfig = {
  type: RouteComponentType;
  config: Record<string, unknown>;
};

export type RouteConfig = {
  url: string;
  title?: string;
  breadcrumb?: Record<string, unknown>;
  editing?: boolean;
  notificationTitle?: string;
  component: RouteComponentConfig;
};

export type LoaderStatus = 'idle' | 'loading' | 'ready' | 'error';

const DEFAULT_ENDPOINT = '/assets/route-config.json';

export interface UseRouteConfigsOptions {
  fetcher?: Fetcher;
  endpoint?: string;
}

export const useRouteConfigs = (options: UseRouteConfigsOptions = {}) => {
  const configs = ref<RouteConfig[]>([]);
  const status = ref<LoaderStatus>('idle');
  const error = ref<Error | null>(null);

  const fetcher: Fetcher = options.fetcher ?? (globalThis.fetch as Fetcher);
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;

  const load = async (): Promise<RouteConfig[]> => {
    status.value = 'loading';
    error.value = null;
    try {
      const response = await fetcher(endpoint, {
        credentials: 'same-origin'
      });
      if (!response.ok) {
        throw new Error(
          `Failed to load route configuration (${response.status} ${response.statusText})`
        );
      }
      const data = await response.json();
      configs.value = Array.isArray(data) ? (data as RouteConfig[]) : [];
      status.value = 'ready';
      return configs.value;
    } catch (err) {
      status.value = 'error';
      const failure = err instanceof Error ? err : new Error(String(err));
      error.value = failure;
      throw failure;
    }
  };

  return {
    configs,
    status,
    error,
    load
  } as const;
};
