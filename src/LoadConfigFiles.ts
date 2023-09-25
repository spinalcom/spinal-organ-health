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

import { Lst, spinalCore, Model } from "spinal-core-connectorjs";
import * as path from "path";
import config from './config';
import axios, { AxiosRequestConfig } from "axios";
import { ApiConnector } from './ApiConnector';
const querystring = require('querystring');
import ConfigFile from 'spinal-lib-organ-monitoring';



class LoadConfigFiles {
  private static instance: LoadConfigFiles;
  private apiConnector: ApiConnector;
  private constructor() {
    this.apiConnector = new ApiConnector();
  }
  public static getInstance(): LoadConfigFiles {
    if (!this.instance) this.instance = new LoadConfigFiles();
    return this.instance;
  }

  public async initFiles(): Promise<any> {
    let conn: spinal.FileSystem;
    // connection string to connect to spinalhub
    const connect_opt = `http://${config.spinalConnector.user}:${config.spinalConnector.password}@${config.spinalConnector.host}:${config.spinalConnector.port}/`;
    // initialize the connection
    conn = spinalCore.connect(connect_opt);
    const fileName = process.env.ORGAN_NAME + '-config';
    const Ip = process.env.SPINALHUB_IP === undefined ? "" : process.env.SPINALHUB_IP
    const Protocol = process.env.SPINALHUB_PROTOCOL === undefined ? "" : process.env.SPINALHUB_PROTOCOL
    const RequestPort = process.env.REQUESTS_PORT === undefined ? "" : process.env.REQUESTS_PORT
    ConfigFile.init(
      conn,
      fileName,
      Ip,
      Protocol,
      parseInt(RequestPort)
    );
    let bootTimestamp
    conn.load_or_make_dir("/etc", async (directory: spinal.Directory) => {
      for (const file of directory) {
        if (file) {
          // @ts-ignore
          if (file._info.model_type.get() === "model_status") {
            var fileLoaded = await file.load();
            bootTimestamp = fileLoaded.boot_timestamp.get();
            return bootTimestamp
          }
        }
      }
    })

    conn.load_or_make_dir("/etc/Organs", async (directory: spinal.Directory) => {
      const files: any[] = [];
      for (const file of directory) {
        // @ts-ignore
        if (file._info.model_type.get() === "ConfigFile") {
          const fileLoaded = await this._loadConfigFiles(conn, file.name.get()).then((file) => {
            return file;
          });
          files.push(fileLoaded)
        }
      }
      await this.pushDataInMonitoringPlatform(this.apiConnector, files)
    })
  }
  public async pushDataInMonitoringPlatform(apiConnector: ApiConnector, files: any) {
    try {
      console.log("request sensed");

      let infoFiles = [];
      for (const file of files) {
        let infofile;
        try {
          infofile = {
            genericOrganData: {
              id: file.genericOrganData?.id.get(),
              name: file.genericOrganData?.name.get(),
              bootTimestamp: file.genericOrganData?.bootTimestamp.get(),
              lastHealthTime: file.genericOrganData?.lastHealthTime.get(),
              ramRssUsed: file.genericOrganData?.ramRssUsed.get(),
              macAdress: file.genericOrganData?.macAdress.get(),
              logList: [],
            },
            specificOrganData: {
              state: file.specificOrganData.state?.get(),
              ipAdress: file.specificOrganData.ipAdress?.get(),
              port: file.specificOrganData.port?.get(),
              // protocol: file.specificOrganData.protocol?.get(),
              lastAction: {
                message: file.specificOrganData.lastAction.message?.get(),
                date: file.specificOrganData.lastAction.date?.get()
              }
            },
          }
        } catch (error) {

        }

        infoFiles.push(infofile)
      }
      const objBosFile = {
        TokenBosRegister: config.monitoringApiConfig.TokenBosRegister,
        infoOrgans: infoFiles
      }
      const rep = await apiConnector.post("http://localhost:5050/health", objBosFile)
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async _loadConfigFiles(connect: spinal.FileSystem, fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      spinalCore.load(connect, path.resolve(`/etc/Organs/${fileName}`),
        (file) => resolve(file),
        () => {
          console.log("error load file");
          reject("error load file")
        }
      )

    });
  }
}
export default LoadConfigFiles.getInstance()  