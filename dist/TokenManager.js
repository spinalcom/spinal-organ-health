"use strict";
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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
exports.TokenManager = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
const querystring = require('querystring');
class TokenManager {
    constructor() {
        this.token = "";
        this.monitoring_url_auth = config_1.default.monitoringApiConfig.monitoring_url + '/users/login';
    }
    isExpired() {
        const now = new Date().getTime();
        return now - this.obtained_time > this.expire_in;
    }
    // Return token if exist or isn't expired, else create a new one
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.token && !this.isExpired()) {
                    return this.token;
                }
                const response = yield axios_1.default.post(this.monitoring_url_auth, querystring.stringify({ email: config_1.default.monitoringApiConfig.email, password: config_1.default.monitoringApiConfig.password }));
                this.token = response.data.token;
                this.expire_in = response.data.expieredToken * 1000; // convert to ms
                this.obtained_time = new Date().getTime();
                return this.token;
            }
            catch (error) {
                console.error(error);
                throw (error);
            }
        });
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=TokenManager.js.map