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
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const notFound = () => {
  throw new Error("notFound");
};
export const redirect = notFound;
