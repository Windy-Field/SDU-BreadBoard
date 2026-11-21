// 本机网页入口和共享存档文件名，公开发布包只携带运行文件
export const SHARED_WORKSPACE = {
    host: "127.0.0.1",
    port: 49183,
    route: "/local-workspace",
    filename: "shared-workspace.json",
    snapshotFile: "personal-workspace.json",
    tokenFile: "shared-web-key.txt",
    pairingPrefix: "#workspace=",
    maxBytes: 4 * 1024 * 1024,
    refreshInterval: 1500,
    timeout: 4000
};

export const SHARED_WEB_ORIGIN = "http://" + SHARED_WORKSPACE.host + ":" + SHARED_WORKSPACE.port;
