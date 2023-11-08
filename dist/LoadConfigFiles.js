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
    initFiles() {
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
            if (fileName !== undefined && type !== undefined) {
                spinal_lib_organ_monitoring_1.default.init(conn, fileName, type, Ip, parseInt(RequestPort));
            }
            let bootTimestamp;
            conn.load_or_make_dir("/etc", (directory) => __awaiter(this, void 0, void 0, function* () {
                for (const file of directory) {
                    if (file) {
                        // @ts-ignore
                        if (file._info.model_type.get() === "model_status") {
                            var fileLoaded = yield file.load();
                            bootTimestamp = fileLoaded.boot_timestamp.get();
                            return bootTimestamp;
                        }
                    }
                }
            }));
            conn.load_or_make_dir("/etc/Organs", (directory) => __awaiter(this, void 0, void 0, function* () {
                const files = [];
                for (const file of directory) {
                    // @ts-ignore
                    if (file._info.model_type.get() === "ConfigFile") {
                        const fileLoaded = yield this._loadConfigFiles(conn, file.name.get()).then((file) => {
                            return file;
                        });
                        files.push(fileLoaded);
                    }
                }
                yield this.pushDataInMonitoringPlatform(this.apiConnector, files);
            }));
        });
    }
    pushDataInMonitoringPlatform(apiConnector, files) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("request sensed");
                let infoFiles = [];
                for (const file of files) {
                    console.log(file);
                    // let infofile;
                    // try {
                    //   infofile = {
                    //     genericOrganData: {
                    //       id: file.genericOrganData?.id.get(),
                    //       name: file.genericOrganData?.name.get(),
                    //       bootTimestamp: file.genericOrganData?.bootTimestamp.get(),
                    //       lastHealthTime: file.genericOrganData?.lastHealthTime.get(),
                    //       ramRssUsed: file.genericOrganData?.ramRssUsed.get(),
                    //       macAdress: file.genericOrganData?.macAdress.get(),
                    //       logList: [],
                    //     },
                    //     specificOrganData: {
                    //       state: file.specificOrganData.state?.get(),
                    //       ipAdress: file.specificOrganData.ipAdress?.get(),
                    //       port: file.specificOrganData.port?.get(),
                    //       // protocol: file.specificOrganData.protocol?.get(),
                    //       lastAction: {
                    //         message: file.specificOrganData.lastAction.message?.get(),
                    //         date: file.specificOrganData.lastAction.date?.get()
                    //       }
                    //     },
                    //   }
                    // } catch (error) {
                    // }
                    // infoFiles.push(infofile)
                }
                // const objBosFile = {
                //   TokenBosRegister: config.monitoringApiConfig.TokenBosRegister,
                //   infoOrgans: infoFiles
                // }
                // const rep = await apiConnector.post("http://localhost:5050/health", objBosFile)
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
                spinal_core_connectorjs_1.spinalCore.load(connect, path.resolve(`/etc/Organs/${fileName}`), (file) => resolve(file), () => {
                    console.log("error load file");
                    reject("error load file");
                });
            });
        });
    }
}
exports.default = LoadConfigFiles.getInstance();
//# sourceMappingURL=LoadConfigFiles.js.map