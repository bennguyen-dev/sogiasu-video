const router = {
  push() {},
  replace() {},
  back() {},
  forward() {},
  refresh() {},
  prefetch() {},
};

export const useRouter = () => router;
let pathname = "/dashboard";

// the page a scene stands on (the bottom nav highlights it); set before its app mounts
export const setDemoPathname = (p: string) => {
  pathname = p;
};

export const usePathname = () => pathname;
let search = "";

// the query string a scene's page reads (e.g. a tab), set before its app mounts
export const setDemoSearch = (q: string) => {
  search = q;
};

export const useSearchParams = () => new URLSearchParams(search);
export const useParams = () => ({});
export const notFound = () => {
  throw new Error("notFound");
};
export const redirect = notFound;
