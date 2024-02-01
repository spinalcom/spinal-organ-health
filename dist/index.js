"use strict";
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
// import { ConfigFileModel, ConfigFile } from "spinal-lib-organ-monitoring"
// console.log(ConfigFile);
const LoadConfigFiles_1 = __importDefault(require("./LoadConfigFiles"));
const node_cron_1 = __importDefault(require("node-cron"));
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const config_1 = __importDefault(require("./config"));
const spinal_lib_organ_monitoring_1 = __importDefault(require("spinal-lib-organ-monitoring"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let conn;
        // connection string to connect to spinalhub
        const protocol = process.env.SPINALHUB_PROTOCOL || "http";
        let connect_opt = `${protocol}://${config_1.default.spinalConnector.user}:${config_1.default.spinalConnector.password}@${config_1.default.spinalConnector.host}`;
        if (config_1.default.spinalConnector.port !== undefined) {
            connect_opt += `:${config_1.default.spinalConnector.port}/`;
        }
        // initialize the connection
        conn = spinal_core_connectorjs_1.spinalCore.connect(connect_opt);
        const fileName = process.env.ORGAN_NAME;
        const type = process.env.ORGAN_TYPE;
        const Ip = process.env.SPINALHUB_IP === undefined ? "" : process.env.SPINALHUB_IP;
        const RequestPort = process.env.REQUESTS_PORT === undefined ? "" : process.env.REQUESTS_PORT;
        if (fileName !== undefined && type !== undefined) {
            yield spinal_lib_organ_monitoring_1.default.init(conn, fileName, type, Ip, parseInt(RequestPort));
        }
        yield LoadConfigFiles_1.default.initFiles(conn);
        // Delay the start of the cron job by a certain amount of time
        setTimeout(() => {
            node_cron_1.default.schedule('*/1 * * * *', () => __awaiter(this, void 0, void 0, function* () {
                yield LoadConfigFiles_1.default.initFiles(conn);
            }));
        }, 5000); // 5 sec delay
    });
}
;
main();
//# sourceMappingURL=index.js.map