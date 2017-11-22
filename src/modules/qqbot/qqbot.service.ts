import { Component } from '@nestjs/common';
import { spawnSync, execFileSync, execFile, execSync } from 'child_process';
import {
    existsSync,
    writeFileSync,
    readFileSync,
    chmodSync,
    mkdirSync,
    unlinkSync,
    readdirSync,
    copyFileSync,
} from 'fs';

import { Buffer } from 'buffer';

type BotInfo = {
    port: string,
    qq: string,
    friends: number | any,
    code: any,
};

@Component()
export class QqbotService {

    static readonly binContents = {
        qq: `#!/usr/bin/python
# EASY-INSTALL - ENTRY - SCRIPT: 'qqbot==v2.3.7', 'console_scripts', 'qq'
__requires__ = 'qqbot==v2.3.7'
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.exit(
        load_entry_point('qqbot==v2.3.7', 'console_scripts', 'qq')()
    )`,
        qqbot: `#!/usr/bin/python
# EASY-INSTALL-ENTRY-SCRIPT: 'qqbot==v2.3.7','console_scripts','qqbot'
__requires__ = 'qqbot==v2.3.7'
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.exit(
        load_entry_point('qqbot==v2.3.7', 'console_scripts', 'qqbot')()
    )`,
    };

    static readonly bin = {
        qq:     "/usr/local/bin/qq",
        qqbot:  "/usr/local/bin/qqbot",
    };

    lists(ports: string[]) {
        let res: any[] = [];
        ports.map(port => {
            let code = this.getLoginCode(port);
            let info: BotInfo = {
                port: port,
                qq: this.getQq(port),
                friends: this.getFriends(port),
                code: code ? 1 : 0,
            };
            res.push(info);
        });
        return res;
    }

    say(qq: string, content: string, port: string) {
        let result = this.callAndGetOutput(QqbotService.bin.qq, port,
            "send", "buddy", qq, content);
        return result;
    }

    code(port: string) {
        return this.getLoginCode(port);
    }

    private getLoginCode(port: string): string {
        let dir = this.getDir(port);
        let img: string = "";
        let filename = readdirSync(`${dir}`).find(file => /\.png$/.test(file));
        if (!filename) {
            return '';
        }
        return readFileSync(`${dir}/${filename}`, { encoding: "binary" });
    }

    private getFriends(port: string): number {
        let result = this.callAndGetOutput(QqbotService.bin.qq, port, "list", "buddy");
        if (result.startsWith("无法连接")) {
            return -1;
        }

        return result.split("\n").length;
    }

    private getQq(port: string): string {
        let dir = this.getDir(port);
        let qq: string = "0";
        readdirSync(`${dir}`).find(file => {
            let result = /([0-9]+)\-contact\.db$/g.exec(file);
            if (result == null) {
                return false;
            }
            qq = result[1];
            return true;
        });
        return qq;
    }

    kill(port: string) {
        let output = this.callAndGetOutput("ps aux|grep", `qqbot_${port}`);
        let res: string[] = [];
        output.split("\n").map(line => {
            let result = /^\S+\s+([0-9]+)/.exec(line);
            if (result) {
                this.callAndGetOutput("kill", "-9", result[1]);
                res.push(`kill process ${result[1]}`);
            }
        });
        return res;
    }

    stop(port: string) {
        let output = this.callAndGetOutput(QqbotService.bin.qq, port, "stop");
        return output.split("\n");
    }

    start(port: string): Array<any> {
        let dir = this.getDir(port);
        let hport = this.prepareStart(dir, port);
        this.cleanDir(dir);
        let output = '';
        // console.log(`${QqbotService.bin.qqbot} -dm -b "${dir}" -p ${port} -hp ${hport}`);
        output = this.callAndGetOutput(QqbotService.bin.qqbot, "-dm", "-b", dir, "-p", port, "-ip", "0.0.0.0", "-hp", hport);
        return output.split("\n");
    }

    private getDir(port: string): string {
        let dir = `/tmp/qqbot_${port}`;
        if (!existsSync(dir)) {
            this.callAndGetOutput("mkdir", "-p", dir);
        }
        dir = `/tmp/qqbot_${port}/plugins`;
        if (!existsSync(dir)) {
            this.callAndGetOutput("mkdir", "-p", dir);
        }
        return dir;
    }

    private prepareStart(dir: string, port: string): string {
        let hport = (Number(port) + 1).toString();

        let confContent: string = readFileSync(`${__dirname}/../../../res/v2.3.conf`, { encoding: "utf8" });
        confContent = confContent
            .replace("8188", port)
            .replace("8189", hport)
            .replace("8:00", "10:00")
            .replace("14990", port);
        writeFileSync(`${dir}/v2.3.conf`, confContent);

        copyFileSync(`${__dirname}/../../../res/ext.py`, `${dir}/plugins/ext.py`);
        return hport;
    }

    private cleanDir(dir: string) {
        this.callAndGetOutput("rm", "-f", `${dir}/*.log`);
        this.callAndGetOutput("rm", "-f", `${dir}/*.png`);
        this.callAndGetOutput("rm", "-f", `${dir}/*.db`);
    }

    init(): string[] {
        if (!this.checkPipVersion()) {
            return ["pip is not installed"];
        }
        let res: string[] = this.checkQqbotInstalled()
            ? [] : this.installQqbot();
        res.push("qqbot is installed");

        // 处理万一没有创建启动文件时的办法
        if (!existsSync(QqbotService.bin.qqbot)) {
            writeFileSync(QqbotService.bin.qqbot, QqbotService.binContents.qqbot);
            chmodSync(QqbotService.bin.qqbot, 0o755)
            res.push(`${QqbotService.bin.qqbot} created!`);
        }
        if (!existsSync(QqbotService.bin.qq)) {
            writeFileSync(QqbotService.bin.qq, QqbotService.binContents.qq);
            chmodSync(QqbotService.bin.qq, 0o755)
            res.push(`${QqbotService.bin.qq} created!`);
        }

        return res;
    }

    private checkPipVersion(): boolean {
        let output: string = this.callAndGetOutput("pip", "--version");
        return output.startsWith("pip");
    }

    private checkQqbotInstalled(): boolean {
        let output: string[] = this.callAndGetOutput("pip", "list").split("\n");
        return output.find(row => row.toLowerCase().startsWith("qqbot")) != undefined;
    }

    private installQqbot(): string[] {
        let output: string[] = this.callAndGetOutput("pip", "install", "qqbot")
            .split("\n");
        return output;
    }

    private callAndGetOutput(cmd: string, ...args: string[]): string {
        console.log(`${cmd} ${args.join(" ")}`)
        return spawnSync(cmd, args, {
            shell: "/bin/bash",
        }).stdout.toString();
    }
}