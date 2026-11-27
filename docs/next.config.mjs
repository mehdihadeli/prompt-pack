import nextra from 'nextra';
import { getBasePath } from './site/config.mjs';

const withNextra = nextra({});

export default withNextra({
  output: 'export',
  basePath: getBasePath(),
  env: { NEXT_PUBLIC_BASE_PATH: getBasePath() },
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false
});