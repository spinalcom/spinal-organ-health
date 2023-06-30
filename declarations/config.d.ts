declare const config: {
    spinalConnector: {
        protocol: string | undefined;
        user: string | undefined;
        password: string | undefined;
        host: string | undefined;
        port: string | undefined;
    };
    file: {
        path: string | undefined;
    };
    monitoringApiConfig: {
        TokenBosRegister: string;
        monitoring_url: string;
        organName: string;
        email: string;
        password: string;
        grant_type: string;
    };
};
export default config;
