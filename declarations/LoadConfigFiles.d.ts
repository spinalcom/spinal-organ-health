import { ApiConnector } from './ApiConnector';
declare class LoadConfigFiles {
    private static instance;
    private apiConnector;
    private constructor();
    static getInstance(): LoadConfigFiles;
    initFiles(): Promise<any>;
    pushDataInMonitoringPlatform(apiConnector: ApiConnector, files: any): Promise<null | undefined>;
    _loadConfigFiles(connect: spinal.FileSystem, fileName: string): Promise<any>;
}
declare const _default: LoadConfigFiles;
export default _default;
