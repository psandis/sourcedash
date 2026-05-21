export type PackageInfo = {
  exists: boolean;
  name?: string;
  version?: string;
  scripts: string[];
  dependenciesCount: number;
  devDependenciesCount: number;
  isCli: boolean;
};

export type ReadmeInfo = {
  exists: boolean;
  hasInstallSection: boolean;
  hasUsageSection: boolean;
  hasEnvSection: boolean;
  hasLicenseSection: boolean;
};

export type FileInfo = {
  hasEnvExample: boolean;
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  hasGitHubActions: boolean;
  largeFiles: Array<{ path: string; sizeMb: number }>;
};

export type ProjectScanResult = {
  scannedAt: string;
  path: string;
  packageInfo: PackageInfo;
  readmeInfo: ReadmeInfo;
  fileInfo: FileInfo;
  score: number;
  warnings: string[];
  recommendations: string[];
};
