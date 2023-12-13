"use strict";
/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const path = __importStar(require("path"));
const config_1 = __importDefault(require("./config"));
const ApiConnector_1 = require("./ApiConnector");
const spinal_lib_organ_monitoring_1 = __importDefault(require("spinal-lib-organ-monitoring"));
class LoadConfigFiles {
    constructor() {
        this.apiConnector = new ApiConnector_1.ApiConnector();
    }
    static getInstance() {
        if (!this.instance)
            this.instance = new LoadConfigFiles();
        return this.instance;
    }
    initFiles(isFirstBoot) {
        return __awaiter(this, void 0, void 0, function* () {
            let conn;
            // connection string to connect to spinalhub
            const connect_opt = `http://${config_1.default.spinalConnector.user}:${config_1.default.spinalConnector.password}@${config_1.default.spinalConnector.host}:${config_1.default.spinalConnector.port}/`;
            // initialize the connection
            conn = spinal_core_connectorjs_1.spinalCore.connect(connect_opt);
            const fileName = process.env.ORGAN_NAME;
            const type = process.env.ORGAN_TYPE;
            const Ip = process.env.SPINALHUB_IP === undefined ? "" : process.env.SPINALHUB_IP;
            const RequestPort = process.env.REQUESTS_PORT === undefined ? "" : process.env.REQUESTS_PORT;
            if (fileName !== undefined && type !== undefined && isFirstBoot) {
                spinal_lib_organ_monitoring_1.default.init(conn, fileName, type, Ip, parseInt(RequestPort));
            }
            const promiseEtc = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const directory = yield conn.load_or_make_dir("/etc");
                for (const file of directory) {
                    if (file) {
                        // @ts-ignore
                        if (file._info.model_type.get() === "model_status") {
                            var fileLoaded = yield file.load();
                            resolve(fileLoaded);
                            return;
                        }
                    }
                }
                reject("/etc not Found");
            }));
            const promisesOrganFiles = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const directory = yield conn.load_or_make_dir("/etc/Organs/Monitoring");
                if (!directory)
                    reject("/etc/Organs/Monitoring not Found");
                const files = [];
                for (const file of directory) {
                    if (((_b = (_a = file._info) === null || _a === void 0 ? void 0 : _a.model_type) === null || _b === void 0 ? void 0 : _b.get()) === "ConfigFile") {
                        files.push(file._ptr.load());
                    }
                }
                resolve(Promise.all(files));
            }));
            const hubStatus = yield promiseEtc;
            const files = yield promisesOrganFiles;
            yield this.pushDataInMonitoringPlatform(this.apiConnector, files, hubStatus);
        });
    }
    pushDataInMonitoringPlatform(apiConnector, files, hubStatus) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Pushing data to monitoring platform...");
                let infoFiles = [];
                for (const file of files) {
                    let infofile;
                    try {
                        infofile = {
                            genericOrganData: {
                                id: (_a = file.genericOrganData) === null || _a === void 0 ? void 0 : _a.id.get(),
                                name: (_b = file.genericOrganData) === null || _b === void 0 ? void 0 : _b.name.get(),
                                type: (_c = file.genericOrganData) === null || _c === void 0 ? void 0 : _c.type.get(),
                                serverName: (_d = file.genericOrganData) === null || _d === void 0 ? void 0 : _d.serverName.get(),
                                bootTimestamp: (_e = file.genericOrganData) === null || _e === void 0 ? void 0 : _e.bootTimestamp.get(),
                                lastHealthTime: (_f = file.genericOrganData) === null || _f === void 0 ? void 0 : _f.lastHealthTime.get(),
                                ramRssUsed: (_g = file.genericOrganData) === null || _g === void 0 ? void 0 : _g.ramRssUsed.get(),
                                macAdress: (_h = file.genericOrganData) === null || _h === void 0 ? void 0 : _h.macAdress.get(),
                                logList: [],
                            },
                            specificOrganData: {
                                port: (_j = file.specificOrganData.port) === null || _j === void 0 ? void 0 : _j.get(),
                                lastAction: {
                                    message: (_k = file.specificOrganData.lastAction.message) === null || _k === void 0 ? void 0 : _k.get(),
                                    date: (_l = file.specificOrganData.lastAction.date) === null || _l === void 0 ? void 0 : _l.get()
                                }
                            },
                        };
                        infoFiles.push(infofile);
                    }
                    catch (error) { }
                }
                const objBosFile = {
                    TokenBosRegister: config_1.default.monitoringApiConfig.TokenBosRegister,
                    infoHub: {
                        bootTimestamp: (_m = hubStatus.boot_timestamp) === null || _m === void 0 ? void 0 : _m.get(),
                        ramUsageRes: hubStatus.ram_usage_res.get() / 1024,
                        ramUsageVirt: hubStatus.ram_usage_virt.get() / 1024,
                        countSessions: hubStatus.count_sessions.get(),
                        countUsers: hubStatus.count_users.get()
                    },
                    infoOrgans: infoFiles
                };
                if (config_1.default.monitoringApiConfig.monitoring_helath_url !== undefined) {
                    yield apiConnector.post(config_1.default.monitoringApiConfig.monitoring_helath_url, objBosFile);
                    console.log("Pushing data done !");
                }
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    _loadConfigFiles(connect, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                spinal_core_connectorjs_1.spinalCore.load(connect, path.resolve(`/etc/Organs/Monitoring/${fileName}`), (file) => resolve(file), () => {
                    console.log("error load file");
                    reject("error load file");
                });
            });
        });
    }
}
exports.default = LoadConfigFiles.getInstance();
//# sourceMappingURL=LoadConfigFiles.js.map