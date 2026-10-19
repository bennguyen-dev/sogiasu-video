const router = {
  push() {},
  replace() {},
  back() {},
  forward() {},
  refresh() {},
  prefetch() {},
};

export const useRouter = () => router;
export const usePathname = () => "/dashboard";
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({});
export const notFound = () => {
  throw new Error("notFound");
};
export const redirect = notFound;
